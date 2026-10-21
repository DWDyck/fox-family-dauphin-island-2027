/* Small helpers and lookups shared by every page. */
(function (F) {
  F.$ = (s) => document.querySelector(s);
  F.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  F.nl = (s) => F.esc(s).replace(/\n/g, '<br>');

  const pad = (n) => String(n).padStart(2, '0');
  F.ymd = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  F.parse = (s) => { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); };
  F.longDate = (s) => F.parse(s).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  F.shortDate = (s) => F.parse(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  F.daysBetween = (a, b) => Math.round((F.parse(b) - F.parse(a)) / 864e5);
  F.today = () => F.ymd(new Date());

  F.CATEGORIES = { plan: ['📌', 'Plan'], meal: ['🍽️', 'Family Meal'], excursion: ['⛵', 'Excursion'], beach: ['🏖️', 'Beach Activity'], arrival: ['🚗', 'Arrival Day'], departure: ['👋', 'Departure Day'] };
  F.PLACE_TYPES = { house: ['🏠', 'Family Houses'], restaurant: ['🍤', 'Restaurants'], grocery: ['🛒', 'Groceries'], beach: ['🏖️', 'Beach Access'], activity: ['⛵', 'Activities'], gathering: ['🍽️', 'Meal Spots'] };
  F.MEAL_ICONS = { breakfast: '🥞', dinner: '🍝', 'seafood boil': '🦐', cookout: '🍔', celebration: '🎉', gathering: '🧺' };

  F.sort = () => { F.events.sort((a, b) => a.date.localeCompare(b.date) || String(a.time).localeCompare(String(b.time))); };

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
  F.sort();
})(window.FOX);
