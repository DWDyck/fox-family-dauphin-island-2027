/* One function per page. Each fills the <main> element. */
(function (F) {
  const { esc, nl, $ } = F;
  const P = (F.pages = F.pages || {});
  F.maps = [];
  const cfg = F.config;
  const plural = (n, w) => n + ' ' + w + (n === 1 ? '' : 's');
  const chip = (attr, val, on, label) => '<button class="chip" aria-pressed="' + on + '" ' + attr + '="' + esc(val) + '">' + label + '</button>';
  const SINGLE = { house: 'Family house', restaurant: 'Restaurant', grocery: 'Grocery store', beach: 'Beach access', activity: 'Activity', gathering: 'Meal spot' };

  const tileLayer = () => L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' });
  const pin = (type, big) => L.divIcon({ className: '', html: '<div class="pin ' + (big ? 'house' : '') + ' t-' + type + '">' + F.icon(F.PLACE_TYPES[type][0]) + '</div>', iconSize: big ? [46, 46] : [34, 34], iconAnchor: big ? [23, 23] : [17, 17] });
  const popup = (l) => {
    const evs = F.events.filter((e) => e.location === l.id);
    return '<div class="pop"><p class="pop-type">' + esc(SINGLE[l.type]) + '</p><h3>' + esc(l.name) + '</h3>' + (l.address ? '<p>' + esc(l.address) + '</p>' : '') + (l.description ? '<p>' + esc(l.description) + '</p>' : '') +
      (evs.length ? '<p class="pop-h">Related events</p><ul>' + evs.map((e) => '<li><b>' + esc(F.shortDate(e.date)) + '</b>' + (e.time ? ', ' + esc(e.time) : '') + ' – ' + esc(e.title) + (e.status === 'tentative' ? ' (tentative)' : '') + '</li>').join('') + '</ul>' : '') +
      '<a class="btn small primary" href="' + F.mapsLink(l.address || l.name) + '" target="_blank" rel="noopener">Get directions</a></div>';
  };

  P.home = (app) => {
    const real = F.today(), t = F.trip;
    const before = real < t.start, after = real > t.end, live = !before && !after;
    const focus = live ? real : t.start;
    const status = before ? plural(F.daysBetween(real, t.start), 'day') + ' until we arrive' : live ? 'Day ' + (F.daysBetween(t.start, real) + 1) + ' of ' + t.count : 'Thanks for a great week';
    const dinner = after ? null : F.events.find((e) => e.date >= focus && F.isDinner(e));
    const dinnerLabel = !dinner ? '' : dinner.date === real ? "Tonight's dinner" : dinner.date === F.addDays(real, 1) && live ? "Tomorrow's dinner" : before && dinner.date === t.start ? 'First dinner' : 'Next dinner';
    const lead = live ? ['Today', 'Tomorrow'] : ['Day 1', 'Day 2'];
    const tent = F.events.filter((e) => e.status === 'tentative' && e.date >= (after ? t.end : focus));
    const feat = F.photos.find((p) => p.featured) || F.photos[0];
    const links = [['#/houses', 'key', 'Houses & codes'], ['#/family', 'users', "Who's where"], ['#/gallery', 'photo', 'Photos'], ['#/memories', 'heart', 'Memories']];
    app.innerHTML =
      '<div class="hero"><h1>' + esc(cfg.welcome) + '</h1><p class="hero-date">' + esc(F.fullDate(real)) + '</p>' +
      '<p class="hero-trip"><b>' + esc(status) + '</b><span>' + esc(F.shortDate(t.start)) + ' to ' + esc(F.shortDate(t.end)) + ', ' + cfg.year + '</span></p></div>' +
      (after ? '<p><a class="btn primary" href="#/memories">See our memories</a></p>' : '') +
      '<h2 class="first" id="glance">Meals &amp; gatherings at a glance</h2><p class="sub">Tap any meal for details. Dashed edge = not confirmed yet.</p>' + F.mealBoard() +
      (dinner ? F.eventCard(dinner, { feature: true, showDate: dinner.date !== real, eyebrow: dinnerLabel }) + '<p class="more"><a class="pill-link" href="#/meals">All meals and gatherings</a></p>' : '') +
      (!after ? '<div class="two">' + F.focusCard(focus, lead[0]) + F.focusCard(F.addDays(focus, 1), lead[1]) + '</div>' : '') +
      '<h2 id="week">The week</h2><p class="sub">Tap a date for details. A dashed edge means the plan is not confirmed yet.</p>' + F.weekView() +
      '<p><a class="btn primary" href="#/calendar">Detailed calendar</a></p>' +
      (tent.length ? '<h2>Still to be confirmed</h2><ul class="plainlist">' + tent.map((e) => '<li><a href="#/calendar/' + e.date + '"><b>' + esc(F.shortDate(e.date)) + (e.time ? ', ' + esc(e.time) : '') + '</b> ' + esc(e.title) + '</a></li>').join('') + '</ul>' : '') +
      '<h2>Dauphin Island weather</h2><div class="card" id="wx"><p class="loading">Checking the sky…</p></div><p class="more"><a class="pill-link" href="#/weather">Full forecast and trip-week outlook</a></p>' +
      '<div class="quick">' + links.map((n) => '<a href="' + n[0] + '">' + F.icon(n[1]) + n[2] + '</a>').join('') + '</div>' +
      (feat ? '<h2>Featured photo</h2><img class="featured" src="' + esc(feat.src) + '" alt="' + esc(feat.caption || 'Featured family photo') + '">' + (feat.caption ? '<p class="cap">' + esc(feat.caption) + '</p>' : '') : '');
    F.weather($('#wx'));
  };

  let calFilter = 'all';
  P.calendar = (app, focus) => {
    const f = {
      all: () => true, confirmed: (e) => e.status === 'confirmed', tentative: (e) => e.status === 'tentative',
      meal: F.isMeal, excursion: (e) => e.category === 'excursion', beach: (e) => e.category === 'beach',
      arrival: (e) => e.category === 'arrival', departure: (e) => e.category === 'departure'
    };
    const labels = { all: 'All', confirmed: 'Confirmed', tentative: 'Tentative', meal: 'Family Meals', excursion: 'Excursions', beach: 'Beach', arrival: 'Arrival Day', departure: 'Departure Day' };
    const today = F.today();
    const days = F.days.filter((d) => calFilter === 'all' || d.events.some(f[calFilter]));
    app.innerHTML = '<p class="back"><a class="pill-link" href="#/">Back to this week</a></p><h1>Detailed Calendar</h1><p class="sub">Every plan, day by day. Tentative plans have a dashed edge and a Tentative label.</p>' +
      '<div class="chips" role="group" aria-label="Jump to a day">' + F.days.map((d) => '<button class="chip day-chip' + (d.date === today ? ' now' : '') + '" data-go="' + d.date + '" aria-label="Go to ' + esc(F.longDate(d.date)) + '">' + esc(F.weekdayShort(d.date)) + ' ' + F.dayNum(d.date) + '</button>').join('') + '</div>' +
      '<div class="chips" role="group" aria-label="Filter events">' + Object.keys(labels).map((k) => chip('data-f', k, calFilter === k, labels[k])).join('') + '</div>' +
      (days.map((d) => {
        const evs = d.events.filter(f[calFilter]);
        return '<h2 class="day' + (d.date === today ? ' today' : '') + '" id="d-' + d.date + '">' + esc(F.longDate(d.date)) + (d.title ? '<span class="wk-title">' + esc(d.title) + '</span>' : '') + (d.date === today ? '<span class="tag today">Today</span>' : '') + '</h2>' +
          (evs.length ? evs.map((e) => F.eventCard(e)).join('') : '<p class="empty">Nothing planned yet.</p>');
      }).join('') || '<p class="empty">No events in this view yet.</p>');
    app.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { calFilter = b.dataset.f; P.calendar(app); }; });
    const goto = (d) => { const el = d && document.getElementById('d-' + d); if (el) el.scrollIntoView({ block: 'start' }); return !!el; };
    app.querySelectorAll('[data-go]').forEach((b) => { b.onclick = () => { if (!goto(b.dataset.go)) { calFilter = 'all'; P.calendar(app, b.dataset.go); } }; });
    if (focus) goto(focus);
  };

  let mapFilter = 'all';
  P.map = (app, focus) => {
    const shown = F.places.filter((l) => mapFilter === 'all' || l.type === mapFilter);
    const types = Object.keys(F.PLACE_TYPES).filter((k) => shown.some((l) => l.type === k));
    const item = (l) => { const n = F.events.filter((e) => e.location === l.id).length; return '<li class="' + (l.type === 'house' ? 'is-house' : '') + '"><a href="#/map/' + esc(l.id) + '"><span class="pi t-' + l.type + '">' + F.icon(F.PLACE_TYPES[l.type][0]) + '</span><span><b>' + esc(l.name) + '</b><br><small>' + esc(l.address || 'Address coming soon') + (n ? ' · ' + plural(n, 'event') : '') + '</small></span></a></li>'; };
    app.innerHTML = '<h1>Island Map</h1><p class="sub">Tap a pin for the address, details and events. Orange pins are our houses.</p>' +
      '<div class="chips" role="group" aria-label="Filter places">' + chip('data-f', 'all', mapFilter === 'all', 'All') +
      Object.keys(F.PLACE_TYPES).map((k) => chip('data-f', k, mapFilter === k, F.icon(F.PLACE_TYPES[k][0]) + F.PLACE_TYPES[k][1])).join('') + '</div>' +
      '<div id="map" role="application" aria-label="Interactive map of Dauphin Island"></div>' +
      '<h2>All places</h2>' + types.map((k) => '<h3 class="grp">' + esc(F.PLACE_TYPES[k][1]) + '</h3><ul class="placelist">' + shown.filter((l) => l.type === k).map(item).join('') + '</ul>').join('');
    app.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { mapFilter = b.dataset.f; P.map(app); }; });
    F.loadLeaflet().then(() => {
      if (!$('#map')) return;
      const map = L.map('map', { scrollWheelZoom: false }).setView([cfg.map.lat, cfg.map.lng], cfg.map.zoom);
      F.maps.push(map); tileLayer().addTo(map);
      const pts = []; let focusMarker;
      const add = (l, ll) => {
        const isH = l.type === 'house';
        const m = L.marker(ll, { zIndexOffset: isH ? 1000 : 0, title: l.name, icon: pin(l.type, isH) }).addTo(map);
        m.bindPopup(popup(l), { minWidth: 220 });
        if (isH) m.bindTooltip(l.name, { permanent: true, direction: 'bottom', offset: [0, 22], className: 'pin-label' });
        pts.push(ll);
        if (focus && l.id === focus) focusMarker = m;
      };
      const fit = () => { if (focusMarker) { map.setView(focusMarker.getLatLng(), 15); focusMarker.openPopup(); } else if (pts.length) map.fitBounds(pts, { padding: [30, 30] }); };
      shown.filter(F.hasCoords).forEach((l) => add(l, [l.lat, l.lng]));
      fit();
      if (focusMarker) $('#map').scrollIntoView({ block: 'start' });
      // Places that only have an address (no lat/lng yet) are looked up and added as they are found.
      F.geocode(shown, () => F.maps.indexOf(map) >= 0, (l, ll) => { add(l, ll); fit(); });
    }, () => { const el = $('#map'); if (el) el.outerHTML = '<p class="note">The map needs an internet connection. The list below still works, and each house page has a Directions button.</p>'; });
  };

  P.family = (app) => {
    const hosting = (f) => F.events.filter((e) => e.host === f.id && F.isMeal(e));
    const person = (f) => { const hs = hosting(f); return '<article class="card person">' + F.avatar(f) + '<div><h3>' + esc(f.name) + '</h3>' +
      (f.members && f.members.length ? '<p>' + esc(f.members.join(', ')) + '</p>' : '') +
      (f.phone ? '<p>Phone: <a href="tel:' + esc(f.phone) + '">' + esc(f.phone) + '</a></p>' : '') +
      (f.email ? '<p>Email: <a href="mailto:' + esc(f.email) + '">' + esc(f.email) + '</a></p>' : '') +
      (hs.length ? '<p class="meta">Hosting: ' + hs.map((e) => '<a class="pill-link" href="#/calendar/' + e.date + '">' + esc(e.title) + ' (' + esc(F.shortDate(e.date)) + ')</a>').join(', ') + '</p>' : '') + '</div></article>'; };
    const groups = F.houses.map((h) => [h, F.families.filter((f) => f.house === h.id)]).filter((g) => g[1].length);
    const loose = F.families.filter((f) => !f.house || !F.house(f.house));
    app.innerHTML = '<h1>Who Is Staying Where</h1><p class="sub">Grouped by house. Tap a phone number to call.</p>' +
      groups.map((g) => '<h2>' + esc(g[0].name) + ' <a class="pill-link sm" href="#/houses/' + esc(g[0].id) + '">House info</a></h2><div class="grid">' + g[1].map(person).join('') + '</div>').join('') +
      (loose.length ? '<h2>Other</h2><div class="grid">' + loose.map(person).join('') + '</div>' : '');
  };

  let mealFilter = 'all';
  P.meals = (app) => {
    const all = F.events.filter(F.isMeal);
    const extra = F.MEAL_TYPES.filter((t) => ['breakfast', 'lunch', 'dinner'].indexOf(t) < 0 && all.some((e) => e.mealType === t));
    const tests = { all: () => true, dinner: F.isDinner, morning: (e) => e.mealType === 'breakfast' || e.mealType === 'lunch' };
    extra.forEach((t) => { tests[t] = (e) => e.mealType === t; });
    const test = tests[mealFilter] || tests.all;
    const showGaps = mealFilter === 'all' || mealFilter === 'dinner';
    const days = F.days.map((d) => [d, d.events.filter((e) => F.isMeal(e) && test(e))]).filter((x) => x[1].length || (showGaps && x[0].dinner !== false));
    app.innerHTML = '<h1>Meals & Gatherings</h1><p class="sub">Who is hosting, where, and when. Every family meal this week.</p>' +
      '<div class="chips" role="group" aria-label="Filter meals">' + chip('data-m', 'all', mealFilter === 'all', 'All') + chip('data-m', 'dinner', mealFilter === 'dinner', 'Dinners') + chip('data-m', 'morning', mealFilter === 'morning', 'Breakfast & lunch') +
      extra.map((t) => chip('data-m', t, mealFilter === t, esc(t.charAt(0).toUpperCase() + t.slice(1)))).join('') + '</div>' +
      (days.map((x) => { const d = x[0];
        return '<h2 class="day' + (d.date === F.today() ? ' today' : '') + '">' + esc(F.longDate(d.date)) + (d.date === F.today() ? '<span class="tag today">Today</span>' : '') + '</h2>' +
          x[1].map((e) => F.eventCard(e)).join('') + (showGaps && !F.dinnerOn(d.date) ? '<p class="gap-note">Dinner: ' + esc(d.dinner || 'Not planned yet') + '</p>' : ''); }).join('') || '<p class="empty">No meals planned yet.</p>');
    app.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => { mealFilter = b.dataset.m; P.meals(app); }; });
  };

  P.houses = (app, id) => {
    const hs = id ? F.houses.filter((h) => h.id === id) : F.houses;
    const dd = (k, v, code) => v ? '<dt>' + k + '</dt><dd>' + (code ? '<span class="code">' + esc(v) + '</span> <button class="small" data-copy="' + esc(v) + '" aria-label="Copy ' + k + '">Copy</button>' : nl(v)) + '</dd>' : '';
    app.innerHTML = '<h1>House Information</h1><p class="sub">' + (id ? '<a class="pill-link" href="#/houses">All houses</a>' : 'Please keep this information within the family.') + '</p>' +
      (id ? '' : '<div class="chips" role="group" aria-label="Jump to a house">' + F.houses.map((h) => '<a class="chip" href="#/houses/' + esc(h.id) + '">' + esc(h.name) + '</a>').join('') + '</div>') +
      (hs.map((h) => {
        const fs = F.families.filter((f) => f.house === h.id);
        const evs = F.events.filter((e) => e.location === h.id);
        return '<article class="card"><h2 class="first">' + esc(h.name) + '</h2><dl class="kv">' + dd('Address', h.address) + dd('Staying here', fs.map((f) => f.name).join(', ')) +
          dd('Wi-Fi name', h.wifiName, 1) + dd('Wi-Fi password', h.wifiPassword, 1) + dd('Door code', h.doorCode, 1) + dd('Gate code', h.gateCode, 1) + dd('Parking', h.parking) +
          (h.manager ? '<dt>Property manager</dt><dd>' + esc(h.manager.name || '') + ' ' + (h.manager.phone ? '<a href="tel:' + esc(h.manager.phone) + '">' + esc(h.manager.phone) + '</a>' : '') + '</dd>' : '') + dd('Notes', h.notes) +
          (evs.length ? '<dt>Plans here</dt><dd>' + evs.map((e) => '<a class="pill-link" href="#/calendar/' + e.date + '">' + esc(F.shortDate(e.date)) + (e.time ? ', ' + esc(e.time) : '') + ' – ' + esc(e.title) + '</a>').join('<br>') + '</dd>' : '') + '</dl>' +
          '<div class="minimap" id="mm-' + esc(h.id) + '"></div>' +
          '<p class="row"><a class="btn" target="_blank" rel="noopener" href="' + F.mapsLink(h.address || h.name) + '">Directions</a><a class="btn" href="#/map/' + esc(h.id) + '">View on big map</a></p></article>';
      }).join('') || '<p class="empty">House not found.</p>');
    F.loadLeaflet().then(() => {
      hs.forEach((h) => {
        const el = document.getElementById('mm-' + h.id); if (!el) return;
        const m = L.map(el, { scrollWheelZoom: false }).setView([h.lat || cfg.map.lat, h.lng || cfg.map.lng], F.hasCoords(h) ? 15 : cfg.map.zoom);
        F.maps.push(m); tileLayer().addTo(m);
        const drop = (ll) => { L.marker(ll, { icon: pin('house', true) }).addTo(m); m.setView(ll, 15); };
        if (F.hasCoords(h)) drop([h.lat, h.lng]); else F.geocode([h], () => F.maps.indexOf(m) >= 0, (p, ll) => drop(ll));
      });
    }, () => { app.querySelectorAll('.minimap').forEach((el) => { el.outerHTML = '<p class="note">Map needs an internet connection. Use the Directions button.</p>'; }); });
  };

  let album = 'all';
  P.gallery = (app) => {
    const idx = F.photos.map((p, i) => i).filter((i) => album === 'all' || F.photos[i].album === album);
    app.innerHTML = '<h1>Photo Gallery</h1><div class="chips" role="group" aria-label="Albums">' + chip('data-a', 'all', album === 'all', 'All') +
      F.albums.map((a) => chip('data-a', a, album === a, esc(a))).join('') + '</div>' +
      (idx.length ? '<div class="photos">' + idx.map((i) => F.photoTile(F.photos[i], i)).join('') + '</div>' : '<p class="empty">No photos in this album yet.</p>');
    app.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => { album = b.dataset.a; P.gallery(app); }; });
    F.bindPhotos(app, F.photos);
  };

  P.memories = (app) => {
    const tiles = (list) => list.length ? '<div class="photos">' + list.map((p) => F.photoTile(p, F.photos.indexOf(p))).join('') + '</div>' : '<p class="empty">Nothing here yet.</p>';
    const sec = [['highlight', 'Highlights of the Week'], ['story', 'Family Stories'], ['moment', 'Memorable Moments']];
    app.innerHTML = '<h1>Vacation Memories</h1><p class="sub">Our digital scrapbook for Dauphin Island ' + cfg.year + '.</p>' +
      '<h2>Favorite Photos</h2>' + tiles(F.photos.filter((p) => p.album === 'Favorite Moments' || p.favorite)) +
      '<h2>Group Pictures</h2>' + tiles(F.photos.filter((p) => p.album === 'Group Photos')) +
      sec.map((s) => '<h2>' + s[1] + '</h2>' + (F.memories.filter((m) => m.kind === s[0]).map((m) => '<article class="card">' + (m.photo ? '<img class="featured" loading="lazy" src="' + esc(m.photo) + '" alt="' + esc(m.title) + '">' : '') + '<h3 class="mem">' + esc(m.title) + '</h3>' + (m.date ? '<p class="meta">' + esc(F.longDate(m.date)) + '</p>' : '') + '<p>' + nl(m.text) + '</p>' + (m.author ? '<p class="cap">From ' + esc(m.author) + '</p>' : '') + '</article>').join('') || '<p class="empty">Nothing here yet.</p>')).join('');
    F.bindPhotos(app, F.photos);
  };

  P.more = (app) => {
    app.innerHTML = '<h1>More</h1><div class="quick">' + F.NAV.map((n) => '<a href="' + n[0] + '">' + F.icon(n[1]) + n[2] + '</a>').join('') + '</div>';
  };
})(window.FOX);
