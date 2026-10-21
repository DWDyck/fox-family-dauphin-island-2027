/* One function per page. Each fills the <main> element. */
(function (F) {
  const { esc, nl, $ } = F;
  const P = (F.pages = F.pages || {});
  F.maps = [];
  const cfg = F.config;

  const tileLayer = () => L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' });
  const pin = (type, big) => L.divIcon({ className: '', html: '<div class="pin ' + (big ? 'house' : '') + '">' + F.PLACE_TYPES[type][0] + '</div>', iconSize: big ? [46, 46] : [34, 34], iconAnchor: big ? [23, 23] : [17, 17] });

  P.home = (app) => {
    const real = F.today();
    const inTrip = real >= F.trip.start && real <= F.trip.end;
    const day = inTrip ? real : real < F.trip.start ? F.trip.start : F.trip.end;
    const todays = F.events.filter((e) => e.date === day);
    const meal = todays.find(F.isMeal) || F.events.find((e) => F.isMeal(e) && e.date > day);
    const feat = F.photos.find((p) => p.featured) || F.photos[0];
    const note = inTrip ? '' : real < F.trip.start ? '<p>🌴 Only ' + F.daysBetween(real, F.trip.start) + ' days until the trip!</p>' : '<p>Thanks for a great week! See the Memories page.</p>';
    app.innerHTML =
      '<div class="hero"><h1>' + esc(cfg.welcome) + ' 🐚</h1><p>' + esc(F.fullDate(real)) + '</p>' + note + '</div>' +
      '<h2 class="first">📅 Our week: ' + esc(F.shortDate(F.trip.start)) + ' – ' + esc(F.shortDate(F.trip.end)) + '</h2>' + F.weekGrid() +
      '<p><a class="btn primary" href="#/calendar">See detailed calendar →</a></p>' +
      (inTrip ? '<h2>What is happening today</h2>' + (todays.length ? todays.map((e) => F.eventCard(e)).join('') : '<p class="empty">Nothing planned today. Enjoy the beach! 🏖️</p>') : '') +
      (meal ? '<h2>🍽️ ' + (inTrip && todays.includes(meal) ? "Today's" : 'Next') + ' meal / gathering</h2>' + F.eventCard(meal, { showDate: true }) : '') +
      '<div class="quick">' + F.NAV.filter((n) => n[0] !== '#/' && n[0] !== '#/calendar').map((n) => '<a href="' + n[0] + '"><span aria-hidden="true">' + n[1] + '</span>' + n[2] + '</a>').join('') + '</div>' +
      '<h2>🌤️ Dauphin Island weather</h2><div class="card" id="wx"><p class="loading">Checking the sky…</p></div>' +
      (feat ? '<h2>📷 Featured photo</h2><img class="featured" src="' + esc(feat.src) + '" alt="' + esc(feat.caption || 'Featured family photo') + '">' + (feat.caption ? '<p class="cap">' + esc(feat.caption) + '</p>' : '') : '');
    F.weather($('#wx'));
  };

  let calFilter = 'all';
  P.calendar = (app, focus) => {
    const f = {
      all: () => true, confirmed: (e) => e.status === 'confirmed', tentative: (e) => e.status === 'tentative',
      meal: F.isMeal, excursion: (e) => e.category === 'excursion', beach: (e) => e.category === 'beach',
      arrival: (e) => e.category === 'arrival', departure: (e) => e.category === 'departure'
    };
    const labels = { all: 'All', confirmed: '✔ Confirmed Plans', tentative: '⏳ Tentative Plans', meal: '🍽️ Family Meals', excursion: '⛵ Excursions', beach: '🏖️ Beach Activities', arrival: '🚗 Arrival Day', departure: '👋 Departure Day' };
    const list = F.events.filter(f[calFilter]);
    const days = list.map((e) => e.date).filter((d, i, a) => a.indexOf(d) === i);
    const today = F.today();
    app.innerHTML = '<h1>📅 Vacation Calendar</h1><p class="sub">Dashed orange = tentative. Plans may change; check Latest Updates above.</p>' +
          '<p><button class="primary" id="jump">📍 Jump to today</button></p>' +
          '<div class="chips" role="group" aria-label="Filter events">' + Object.keys(labels).map((k) => '<button class="chip" aria-pressed="' + (calFilter === k) + '" data-f="' + k + '">' + labels[k] + '</button>').join('') + '</div>' +
      (days.length ? days.map((d) => '<div class="day ' + (d === today ? 'today' : '') + '" id="d-' + d + '">' + esc(F.longDate(d)) + (d === today ? ' · TODAY' : '') + '</div>' + list.filter((e) => e.date === d).map((e) => F.eventCard(e)).join('')).join('') : '<p class="empty">No events in this view yet.</p>');
    app.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { calFilter = b.dataset.f; P.calendar(app); }; });
    const goto = (d) => { const el = d && document.getElementById('d-' + d); if (el) el.scrollIntoView({ block: 'start' }); return !!el; };
    $('#jump').onclick = () => { if (!goto(days.find((d) => d >= today))) F.toast('No upcoming events in this view.'); };
    if (focus) goto(focus);
  };

  let mapFilter = 'all';
  P.map = (app, focus) => {
    app.innerHTML = '<h1>🗺️ Island Map</h1><p class="sub">Tap a pin for address and events. Orange pins are our houses.</p>' +
      '<div class="chips" role="group" aria-label="Filter places"><button class="chip" aria-pressed="' + (mapFilter === 'all') + '" data-f="all">All</button>' +
      Object.keys(F.PLACE_TYPES).map((k) => '<button class="chip" aria-pressed="' + (mapFilter === k) + '" data-f="' + k + '">' + F.PLACE_TYPES[k][0] + ' ' + F.PLACE_TYPES[k][1] + '</button>').join('') + '</div>' +
      '<div id="map" role="application" aria-label="Interactive map of Dauphin Island"></div>' +
      '<h2>All places</h2><ul class="placelist">' + F.places.filter((l) => mapFilter === 'all' || l.type === mapFilter).map((l) => '<li><a href="#/map/' + esc(l.id) + '"><span aria-hidden="true">' + F.PLACE_TYPES[l.type][0] + '</span><span><b>' + esc(l.name) + '</b><br><small>' + esc(l.address || '') + '</small></span></a></li>').join('') + '</ul>';
    app.querySelectorAll('[data-f]').forEach((b) => { b.onclick = () => { mapFilter = b.dataset.f; P.map(app); }; });
    F.loadLeaflet().then(() => {
    if (!$('#map')) return;
    const map = L.map('map', { scrollWheelZoom: false }).setView([cfg.map.lat, cfg.map.lng], cfg.map.zoom);
    F.maps.push(map); tileLayer().addTo(map);
    const pts = []; let focusMarker;
    F.places.filter((l) => mapFilter === 'all' || l.type === mapFilter).forEach((l) => {
      const isH = l.type === 'house';
      const evs = F.events.filter((e) => e.location === l.id);
      const m = L.marker([l.lat, l.lng], { zIndexOffset: isH ? 1000 : 0, title: l.name, icon: pin(l.type, isH) }).addTo(map);
      m.bindPopup('<strong>' + (isH ? '🏠 ' : '') + esc(l.name) + '</strong><br>' + esc(l.address || '') + '<br>' + (l.description ? esc(l.description) + '<br>' : '') +
        (evs.length ? '<b>Related events</b><ul style="padding-left:18px;margin:4px 0">' + evs.map((e) => '<li>' + esc(F.shortDate(e.date)) + ' ' + esc(e.time || '') + ' – ' + esc(e.title) + (e.status === 'tentative' ? ' (tentative)' : '') + '</li>').join('') + '</ul>' : '') +
        '<a href="' + F.mapsLink(l.address || l.name) + '" target="_blank" rel="noopener">Get directions</a>');
      pts.push([l.lat, l.lng]);
      if (focus && l.id === focus) focusMarker = m;
    });
    if (focusMarker) { map.setView(focusMarker.getLatLng(), 15); focusMarker.openPopup(); $('#map').scrollIntoView({ block: 'start' }); } else if (pts.length) map.fitBounds(pts, { padding: [30, 30] });
        }, () => { const el = $('#map'); if (el) el.outerHTML = '<p class="note">The map needs an internet connection. The list below still works, and each place has a Directions link on its house or event page.</p>'; });
      };

  P.family = (app) => {
    const person = (f) => '<article class="card person">' + F.avatar(f) + '<div><h3>' + esc(f.name) + '</h3>' +
      (f.members && f.members.length ? '<p>' + esc(f.members.join(', ')) + '</p>' : '') +
      (f.phone ? '<p>📞 <a href="tel:' + esc(f.phone) + '">' + esc(f.phone) + '</a></p>' : '') +
      (f.email ? '<p>✉️ <a href="mailto:' + esc(f.email) + '">' + esc(f.email) + '</a></p>' : '') + '</div></article>';
    const groups = F.houses.map((h) => [h, F.families.filter((f) => f.house === h.id)]).filter((g) => g[1].length);
    const loose = F.families.filter((f) => !f.house || !F.house(f.house));
    app.innerHTML = '<h1>👨‍👩‍👧 Who is Staying Where</h1><p class="sub">Grouped by house. Tap a phone number to call.</p>' +
      groups.map((g) => '<h2>🏠 ' + esc(g[0].name) + ' <a class="pill-link" style="font-size:.9rem" href="#/houses/' + esc(g[0].id) + '">house info →</a></h2><div class="grid">' + g[1].map(person).join('') + '</div>').join('') +
      (loose.length ? '<h2>Other</h2><div class="grid">' + loose.map(person).join('') + '</div>' : '');
  };

  let mealFilter = 'all';
  P.meals = (app) => {
    const all = F.events.filter(F.isMeal);
    const types = all.map((e) => e.mealType || 'meal').filter((t, i, a) => a.indexOf(t) === i);
    const meals = all.filter((e) => mealFilter === 'all' || (e.mealType || 'meal') === mealFilter);
    const days = meals.map((e) => e.date).filter((d, i, a) => a.indexOf(d) === i);
    app.innerHTML = '<h1>🍽️ Meals & Gatherings</h1><p class="sub">Every family meal this week at a glance.</p>' +
      '<div class="chips" role="group" aria-label="Filter meals"><button class="chip" aria-pressed="' + (mealFilter === 'all') + '" data-m="all">All</button>' +
      types.map((t) => '<button class="chip" aria-pressed="' + (mealFilter === t) + '" data-m="' + esc(t) + '">' + (F.MEAL_ICONS[t] || '🍽️') + ' ' + esc(t) + '</button>').join('') + '</div>' + (days.map((d) => '<div class="day ' + (d === F.today() ? 'today' : '') + '">' + esc(F.longDate(d)) + '</div>' + meals.filter((e) => e.date === d).map((e) => {
      const l = e.location && F.place(e.location), h = e.host && F.family(e.host);
      return '<article class="card event ' + e.status + '"><span class="badge">' + (F.MEAL_ICONS[e.mealType] || '🍽️') + ' ' + esc(e.mealType || 'meal') + '</span>' + (e.status === 'tentative' ? '<span class="badge tentative">⏳ Tentative</span>' : '') +
        '<h3>' + esc(e.title) + '</h3><div class="meta">🕒 ' + esc(e.time || 'Time TBD') + ' · 📍 ' + (l ? '<a class="pill-link" href="#/map/' + esc(l.id) + '">' + esc(l.name) + '</a>' : 'TBD') + '</div>' +
        (h ? '<div class="meta">👤 Host: ' + esc(h.name) + '</div>' : '') + (e.description ? '<p>' + nl(e.description) + '</p>' : '') + (e.notes ? '<div class="note">📝 ' + nl(e.notes) + '</div>' : '') +
        '<p><button data-ics="' + esc(e.id) + '">📲 Add to my calendar</button></p></article>';
    }).join('')).join('') || '<p class="empty">No meals planned yet.</p>');
    app.querySelectorAll('[data-m]').forEach((b) => { b.onclick = () => { mealFilter = b.dataset.m; P.meals(app); }; });
  };

  P.houses = (app, id) => {
    const hs = id ? F.houses.filter((h) => h.id === id) : F.houses;
    const dd = (k, v, code) => v ? '<dt>' + k + '</dt><dd>' + (code ? '<span class="code">' + esc(v) + '</span> <button class="small" data-copy="' + esc(v) + '" aria-label="Copy ' + k + '">Copy</button>' : nl(v)) + '</dd>' : '';
    app.innerHTML = '<h1>🔑 House Information</h1><p class="sub">' + (id ? '<a class="pill-link" href="#/houses">← All houses</a>' : 'Please keep this information within the family.') + '</p>' +
      (id ? '' : '<div class="chips" aria-label="Jump to a house">' + F.houses.map((h) => '<a class="chip" href="#/houses/' + esc(h.id) + '">' + esc(h.name) + '</a>').join('') + '</div>') +
      (hs.map((h) => {
        const fs = F.families.filter((f) => f.house === h.id);
        return '<article class="card"><h2 style="margin-top:0">🏠 ' + esc(h.name) + '</h2><dl class="kv">' + dd('Address', h.address) + dd('Staying here', fs.map((f) => f.name).join(', ')) +
          dd('Wi-Fi name', h.wifiName, 1) + dd('Wi-Fi password', h.wifiPassword, 1) + dd('Door code', h.doorCode, 1) + dd('Gate code', h.gateCode, 1) + dd('Parking', h.parking) +
          (h.manager ? '<dt>Property manager</dt><dd>' + esc(h.manager.name || '') + ' ' + (h.manager.phone ? '<a href="tel:' + esc(h.manager.phone) + '">📞 ' + esc(h.manager.phone) + '</a>' : '') + '</dd>' : '') + dd('Notes', h.notes) + '</dl>' +
          '<div class="minimap" id="mm-' + esc(h.id) + '"></div>' +
          '<p class="row"><a class="btn" target="_blank" rel="noopener" href="' + F.mapsLink(h.address || h.name) + '">🧭 Directions</a><a class="btn" href="#/map/' + esc(h.id) + '">🗺️ On big map</a></p></article>';
      }).join('') || '<p class="empty">House not found.</p>');
    const hs0 = hs;
    F.loadLeaflet().then(() => {
      hs0.forEach((h) => {
        const el = document.getElementById('mm-' + h.id); if (!el) return;
        const m = L.map(el, { scrollWheelZoom: false }).setView([h.lat, h.lng], 15);
        F.maps.push(m); tileLayer().addTo(m);
        L.marker([h.lat, h.lng], { icon: pin('house', true) }).addTo(m);
      });
    }, () => { app.querySelectorAll('.minimap').forEach((el) => { el.outerHTML = '<p class="note">Map needs an internet connection. Use the Directions button.</p>'; }); });
  };

  let album = 'all';
  P.gallery = (app) => {
    const idx = F.photos.map((p, i) => i).filter((i) => album === 'all' || F.photos[i].album === album);
    app.innerHTML = '<h1>📷 Photo Gallery</h1><div class="chips"><button class="chip" aria-pressed="' + (album === 'all') + '" data-a="all">All</button>' +
      F.albums.map((a) => '<button class="chip" aria-pressed="' + (album === a) + '" data-a="' + esc(a) + '">' + esc(a) + '</button>').join('') + '</div>' +
      (idx.length ? '<div class="photos">' + idx.map((i) => F.photoTile(F.photos[i], i)).join('') + '</div>' : '<p class="empty">No photos in this album yet.</p>');
    app.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => { album = b.dataset.a; P.gallery(app); }; });
    F.bindPhotos(app, F.photos);
  };

  P.memories = (app) => {
    const tiles = (list) => list.length ? '<div class="photos">' + list.map((p) => F.photoTile(p, F.photos.indexOf(p))).join('') + '</div>' : '<p class="empty">Nothing here yet.</p>';
    const sec = [['highlight', '🌟 Highlights of the Week'], ['story', '📖 Family Stories'], ['moment', '✨ Memorable Moments']];
    app.innerHTML = '<h1>💙 Vacation Memories</h1><p class="sub">Our digital scrapbook for Dauphin Island 2027.</p>' +
      '<h2>⭐ Favorite Photos</h2>' + tiles(F.photos.filter((p) => p.album === 'Favorite Moments' || p.favorite)) +
      '<h2>👨‍👩‍👧‍👦 Group Pictures</h2>' + tiles(F.photos.filter((p) => p.album === 'Group Photos')) +
      sec.map((s) => '<h2>' + s[1] + '</h2>' + (F.memories.filter((m) => m.kind === s[0]).map((m) => '<article class="card">' + (m.photo ? '<img class="featured" loading="lazy" src="' + esc(m.photo) + '" alt="' + esc(m.title) + '">' : '') + '<h3 style="margin:.3em 0">' + esc(m.title) + '</h3><p>' + nl(m.text) + '</p>' + (m.author ? '<p class="cap">— ' + esc(m.author) + '</p>' : '') + '</article>').join('') || '<p class="empty">Nothing here yet.</p>')).join('');
    F.bindPhotos(app, F.photos);
  };

  P.more = (app) => {
    app.innerHTML = '<h1>More</h1><div class="quick">' + F.NAV.map((n) => '<a href="' + n[0] + '"><span>' + n[1] + '</span>' + n[2] + '</a>').join('') + '</div>';
  };
})(window.FOX);
