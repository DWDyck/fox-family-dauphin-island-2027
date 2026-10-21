/* Small helpers and lookups shared by every page. */
(function (F) {
  F.$ = (s) => document.querySelector(s);
  F.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  F.nl = (s) => F.esc(s).replace(/\n/g, '<br>');

  const pad = (n) => String(n).padStart(2, '0');
  const LOCALE = 'en-US'; // one date style for everyone, whatever their phone's region is
  const fmt = (s, o) => F.parse(s).toLocaleDateString(LOCALE, o);
  F.ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  F.parse = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  F.addDays = (s, n) => { const d = F.parse(s); d.setDate(d.getDate() + n); return F.ymd(d); };
  F.weekday = (s) => fmt(s, { weekday: 'long' });                                    // Saturday
  F.weekdayShort = (s) => fmt(s, { weekday: 'short' });                              // Sat
  F.dayNum = (s) => F.parse(s).getDate();                                            // 19
  F.shortDate = (s) => fmt(s, { weekday: 'short', month: 'short', day: 'numeric' }); // Sat, Jun 19
  F.longDate = (s) => fmt(s, { weekday: 'long', month: 'long', day: 'numeric' });    // Saturday, June 19
  F.fullDate = (s) => fmt(s, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  F.daysBetween = (a, b) => Math.round((F.parse(b) - F.parse(a)) / 864e5);
  // "Today" on the island (Central time), not the viewer's timezone. Add ?today=2027-06-22 to the address to preview any day.
  F.today = () => {
    const o = /[?&]today=(\d{4}-\d\d-\d\d)/.exec(location.search);
    if (o) return o[1];
    try { return new Date().toLocaleDateString('en-CA', { timeZone: F.config.timezone }); } catch (e) { return F.ymd(new Date()); }
  };
  F.minutes = (t) => {
    const m = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i.exec(t || '');
    return m ? (+m[1] % 12 + (/pm/i.test(m[3]) ? 12 : 0)) * 60 + +(m[2] || 0) : null;
  };
  F.siteName = F.config.title + ' ' + F.config.year;

  F.CATEGORIES = { plan: ['📌', 'Plan'], meal: ['🍽️', 'Family Meal'], excursion: ['⛵', 'Excursion'], beach: ['🏖️', 'Beach Activity'], arrival: ['🚗', 'Arrival Day'], departure: ['👋', 'Departure Day'] };
  F.PLACE_TYPES = { house: ['🏠', 'Family Houses'], restaurant: ['🍤', 'Restaurants'], grocery: ['🛒', 'Groceries'], beach: ['🏖️', 'Beach Access'], activity: ['⛵', 'Activities'], gathering: ['🍽️', 'Meal Spots'] };
  F.MEAL_ICONS = { breakfast: '🥞', lunch: '🥪', dinner: '🍝', 'seafood boil': '🦐', cookout: '🍔', celebration: '🎉', gathering: '🧺' };


  // Leaflet (the map library) is only downloaded when a page needs it.
  let leaflet;
  F.loadLeaflet = () => {
    if (window.L) return Promise.resolve();
    return leaflet || (leaflet = new Promise((ok, fail) => {
      const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.append(css);
      const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = ok; s.onerror = () => { leaflet = null; fail(new Error('offline')); }; document.head.append(s);
    }));
  };

  // Houses are map places too, so events can point at either.
  F.places = [].concat(F.houses.map((h) => Object.assign({}, h, { type: 'house' })), F.locations);
  const index = (list) => list.reduce((m, x) => ((m[x.id] = x), m), {});
  F.placeById = index(F.places);
  F.houseById = index(F.houses);
  F.familyById = index(F.families);
  F.place = (id) => F.placeById[id];
  F.family = (id) => F.familyById[id];
  F.house = (id) => F.houseById[id];
  F.mapsLink = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
  F.isMeal = (e) => e.category === 'meal' || !!e.mealType;
  F.isDinner = (e) => F.isMeal(e) && e.mealType !== 'breakfast' && e.mealType !== 'lunch' && (F.minutes(e.time) == null || F.minutes(e.time) >= 15 * 60);

  // Build the day list and flat event list from schedule.js (the single source of truth for dates).
  const slug = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const byTime = (a, b) => (F.minutes(a.time) == null ? 1e4 : F.minutes(a.time)) - (F.minutes(b.time) == null ? 1e4 : F.minutes(b.time));
  F.days = []; F.events = [];
  (F.schedule || []).forEach((d) => {
    const day = { date: d.date, title: d.title || '', dinner: d.dinner, events: [] };
    (d.events || []).forEach((src, i) => {
      const e = Object.assign({ status: 'confirmed' }, src, { date: d.date });
      e.id = e.id || d.date + '-' + (slug(e.title) || i);
      const host = e.host && F.family(e.host);
      if (!e.location && host && host.house) e.location = host.house;
      day.events.push(e); F.events.push(e);
    });
    day.events.sort(byTime);
    F.days.push(day);
  });
  F.trip = { start: F.days.length ? F.days[0].date : '', end: F.days.length ? F.days[F.days.length - 1].date : '', count: F.days.length };
  F.day = (date) => F.days.find((d) => d.date === date);
  F.dinnerOn = (date) => (F.day(date) ? F.day(date).events : []).find(F.isDinner);
})(window.FOX);
