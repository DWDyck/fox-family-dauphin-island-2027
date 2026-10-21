'use strict';
const TRIP = { start: '2027-06-12', end: '2027-06-19' };
const ISLAND = { lat: 30.2552, lng: -88.1097 };
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const nl = (s) => esc(s).replace(/\n/g, '<br>');
let D = null; // all data
let map = null;

const CATS = { plan: ['📌', 'Plan'], meal: ['🍽️', 'Family Meal'], excursion: ['⛵', 'Excursion'], beach: ['🏖️', 'Beach Activity'], arrival: ['🚗', 'Arrival Day'], departure: ['👋', 'Departure Day'] };
const LOC_CATS = { house: ['🏠', 'Family House'], restaurant: ['🍤', 'Restaurant'], grocery: ['🛒', 'Grocery'], beach: ['🏖️', 'Beach Access'], activity: ['⛵', 'Activity'], gathering: ['🍽️', 'Meal Gathering'] };
const MEAL_TYPES = ['breakfast', 'dinner', 'seafood boil', 'cookout', 'celebration', 'gathering'];
const NAV = [['#/', '🏠', 'Home', 'm'], ['#/calendar', '📅', 'Calendar', 'm'], ['#/map', '🗺️', 'Map', 'm'], ['#/meals', '🍽️', 'Meals', 'm'], ['#/houses', '🔑', 'Houses', 'd'], ['#/family', '👨‍👩‍👧', 'Family', 'd'], ['#/gallery', '📷', 'Photos', 'd'], ['#/memories', '💙', 'Memories', 'd']];

// ---------- helpers ----------
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const longDate = (s) => parse(s).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
const shortDate = (s) => parse(s).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
const daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
const byId = (list, id) => list.find((x) => x.id === id);
const loc = (id) => byId(D.locations, id);
const fam = (id) => byId(D.families, id);
const house = (id) => byId(D.houses, id);
const toast = (m, err) => { const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = m; document.body.append(t); setTimeout(() => t.remove(), 3000); };
const mapsLink = (q) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

async function api(method, url, body, raw) {
  const r = await fetch(url, { method, headers: raw ? { 'Content-Type': raw.type } : body ? { 'Content-Type': 'application/json' } : {}, body: raw ? raw.body : body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(j.error || 'Something went wrong'); e.status = r.status; throw e; }
  return j;
}
async function load() {
  try { D = await api('GET', '/api/all'); }
  catch (e) { if (e.status === 401) return passcode(); throw e; }
  renderUpdates(); renderNav();
}
function passcode() {
  $('#app').innerHTML = `<div class="card"><h1>Welcome, Fox Family 🌴</h1><p>Please enter the family passcode.</p>
  <form id="pc"><label for="p">Passcode</label><input id="p" type="password" autocomplete="current-password"><p><button class="primary">Enter</button></p></form></div>`;
  $('#pc').onsubmit = async (e) => { e.preventDefault(); try { await api('POST', '/api/site-login', { passcode: $('#p').value }); await load(); route(); } catch (x) { toast(x.message, 1); } };
}

// ---------- shell ----------
function renderUpdates() {
  const u = D.updates.filter((x) => x.active);
  $('#updates').innerHTML = `<div class="banner" role="region" aria-label="Latest updates"><h2>📣 Latest Updates</h2>${u.length ? `<ul>${u.slice(0, 4).map((x) => `<li>${esc(x.message)}<small>${esc(new Date(x.created_at.replace(' ', 'T') + 'Z').toLocaleString(undefined, { weekday: 'short', hour: 'numeric', minute: '2-digit' }))}</small></li>`).join('')}</ul>` : '<p style="margin:0">No changes right now. Everything is on plan! 🎉</p>'}</div>`;
}
function renderNav() {
  const cur = location.hash || '#/';
  $('#tabs').innerHTML = NAV.map(([h, i, l, k]) => `<a href="${h}" class="${k === 'd' ? 'desk' : ''}" ${cur === h ? 'aria-current="page"' : ''}><span aria-hidden="true">${i}</span>${l}</a>`).join('') +
    `<a href="#/more" class="more" ${cur === '#/more' ? 'aria-current="page"' : ''}><span aria-hidden="true">☰</span>More</a>`;
}

// ---------- components ----------
function eventCard(e, opts = {}) {
  const l = e.location_id ? loc(e.location_id) : null;
  const h = e.host_family_id ? fam(e.host_family_id) : null;
  const [ic, cl] = CATS[e.category] || CATS.plan;
  return `<article class="card event ${e.status}">
    <div><span class="badge ${e.status}">${e.status === 'tentative' ? '⏳ Tentative' : '✔ Confirmed'}</span><span class="badge">${ic} ${cl}</span></div>
    <h3>${esc(e.title)}</h3>
    <div class="meta">${opts.showDate ? esc(shortDate(e.date)) + ' · ' : ''}${e.time ? '🕒 ' + esc(e.time) : ''}</div>
    ${l || e.location_text ? `<div class="meta">📍 ${l ? `<a class="pill-link" href="#/map/${l.id}">${esc(l.name)}</a>` : ''}${l && e.location_text ? ' · ' : ''}${esc(e.location_text || '')}</div>` : ''}
    ${h ? `<div class="meta">👤 Hosted by ${esc(h.name)}</div>` : ''}
    ${e.description ? `<p>${nl(e.description)}</p>` : ''}
    ${e.notes ? `<div class="note">📝 ${nl(e.notes)}</div>` : ''}
    ${D.admin ? `<p><a class="btn" href="#/admin/events/${e.id}">✏️ Edit</a></p>` : ''}
  </article>`;
}
const photoTile = (p) => p.url ? `<button class="ph" data-photo="${p.id}" aria-label="${esc(p.caption || 'Photo')}"><img loading="lazy" src="${esc(p.url)}" alt="${esc(p.caption || '')}"></button>` : `<button class="ph" data-photo="${p.id}" aria-label="${esc(p.caption || 'Photo')}">📷</button>`;
function bindPhotos(root, list) {
  root.querySelectorAll('[data-photo]').forEach((b) => b.onclick = () => {
    const p = byId(list, +b.dataset.photo); const d = $('#lightbox');
    d.innerHTML = `${p.url ? `<img src="${esc(p.url)}" alt="${esc(p.caption || '')}">` : '<div class="featured-ph">📷</div>'}<p>${esc(p.caption || '')}</p><form method="dialog"><button class="primary">Close</button></form>`;
    d.showModal();
  });
}
function avatar(f) { return f.photo ? `<img class="avatar" src="${esc(f.photo)}" alt="${esc(f.name)}">` : `<div class="avatar" aria-hidden="true">👪</div>`; }

// ---------- weather ----------
const WX = { 0: ['☀️', 'Clear'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Cloudy'], 45: ['🌫️', 'Fog'], 48: ['🌫️', 'Fog'], 51: ['🌦️', 'Drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌦️', 'Drizzle'], 61: ['🌧️', 'Rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'], 80: ['🌦️', 'Showers'], 81: ['🌦️', 'Showers'], 82: ['⛈️', 'Heavy showers'], 95: ['⛈️', 'Thunderstorms'], 96: ['⛈️', 'Thunderstorms'], 99: ['⛈️', 'Thunderstorms'] };
async function weather(el) {
  try {
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ISLAND.lat}&longitude=${ISLAND.lng}&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=3`);
    const w = await r.json(); const [ic, tx] = WX[w.current.weather_code] || ['🌡️', 'Weather'];
    el.innerHTML = `<div class="weather"><div class="big" aria-hidden="true">${ic}</div><div><div class="t">${Math.round(w.current.temperature_2m)}°F</div><div>${tx} · wind ${Math.round(w.current.wind_speed_10m)} mph</div>
    <div class="meta">Today: ${Math.round(w.daily.temperature_2m_min[0])}–${Math.round(w.daily.temperature_2m_max[0])}°F · ${w.daily.precipitation_probability_max[0]}% rain</div></div></div>`;
  } catch { el.innerHTML = '<p class="empty">Weather is unavailable right now.</p>'; }
}

// ---------- pages ----------
const pages = {};
pages.home = (app) => {
  const real = ymd(new Date());
  const inTrip = real >= TRIP.start && real <= TRIP.end;
  const day = inTrip ? real : real < TRIP.start ? TRIP.start : TRIP.end;
  const todays = D.events.filter((e) => e.date === day);
  const upcoming = D.events.filter((e) => e.date > day).slice(0, 4);
  const meal = todays.find((e) => e.category === 'meal') || D.events.find((e) => e.category === 'meal' && e.date > day);
  const feat = D.photos.find((p) => p.featured) || D.photos[0];
  const note = inTrip ? '' : real < TRIP.start ? `<p>🌴 Only ${daysBetween(real, TRIP.start)} days until the trip! Here's what Day 1 looks like.</p>` : '<p>Thanks for a great week! See the Memories page.</p>';
  app.innerHTML = `
  <div class="hero"><h1>Welcome, Fox Family! 🐚</h1><p>${esc(parse(real).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))}</p>${note}</div>
  <div class="quick">${NAV.slice(1).map(([h, i, l]) => `<a href="${h}"><span aria-hidden="true">${i}</span>${l}</a>`).join('')}</div>
  <h2>${inTrip ? "What's happening today" : 'Day 1 – ' + esc(longDate(day))}</h2>
  ${todays.length ? todays.map((e) => eventCard(e)).join('') : '<p class="empty">Nothing planned today. Enjoy the beach! 🏖️</p>'}
  ${meal ? `<h2>🍽️ Meal / gathering highlight</h2>${eventCard(meal, { showDate: true })}` : ''}
  <h2>Coming up</h2>${upcoming.length ? upcoming.map((e) => eventCard(e, { showDate: true })).join('') : '<p class="empty">No more events yet.</p>'}
  <p><a class="btn" href="#/calendar">See full calendar →</a></p>
  <h2>🌤️ Dauphin Island weather</h2><div class="card" id="wx"><p class="loading">Checking the sky…</p></div>
  <h2>📷 Featured photo</h2>${feat?.url ? `<img class="featured" src="${esc(feat.url)}" alt="${esc(feat.caption || 'Featured family photo')}">` : '<div class="featured-ph" aria-hidden="true">🏝️</div>'}${feat?.caption ? `<p class="cap">${esc(feat.caption)}</p>` : ''}`;
  weather($('#wx'));
};

let calFilter = 'all';
pages.calendar = (app) => {
  const f = {
    all: () => true, confirmed: (e) => e.status === 'confirmed', tentative: (e) => e.status === 'tentative',
    meal: (e) => e.category === 'meal', excursion: (e) => e.category === 'excursion', beach: (e) => e.category === 'beach',
    arrival: (e) => e.category === 'arrival', departure: (e) => e.category === 'departure',
  };
  const labels = { all: 'All', confirmed: '✔ Confirmed Plans', tentative: '⏳ Tentative Plans', meal: '🍽️ Family Meals', excursion: '⛵ Excursions', beach: '🏖️ Beach Activities', arrival: '🚗 Arrival Day', departure: '👋 Departure Day' };
  const list = D.events.filter(f[calFilter]);
  const days = [...new Set(list.map((e) => e.date))];
  const today = ymd(new Date());
  app.innerHTML = `<h1>📅 Vacation Calendar</h1><p class="sub">Dashed orange = tentative. Plans may change; check Latest Updates above.</p>
  <div class="chips" role="group" aria-label="Filter events">${Object.entries(labels).map(([k, v]) => `<button class="chip" aria-pressed="${calFilter === k}" data-f="${k}">${v}</button>`).join('')}</div>
  ${days.length ? days.map((d) => `<div class="day ${d === today ? 'today' : ''}">${esc(longDate(d))}${d === today ? ' · TODAY' : ''}</div>${list.filter((e) => e.date === d).map((e) => eventCard(e)).join('')}`).join('') : '<p class="empty">No events in this view yet.</p>'}`;
  app.querySelectorAll('[data-f]').forEach((b) => b.onclick = () => { calFilter = b.dataset.f; pages.calendar(app); });
};

let mapFilter = 'all';
pages.map = (app, focus) => {
  app.innerHTML = `<h1>🗺️ Island Map</h1><p class="sub">Tap a pin for address and events. Orange pins are our houses.</p>
  <div class="chips" role="group" aria-label="Filter places"><button class="chip" aria-pressed="${mapFilter === 'all'}" data-f="all">All</button>${Object.entries(LOC_CATS).map(([k, [i, l]]) => `<button class="chip" aria-pressed="${mapFilter === k}" data-f="${k}">${i} ${l}</button>`).join('')}</div>
  <div id="map" role="application" aria-label="Interactive map of Dauphin Island"></div>`;
  app.querySelectorAll('[data-f]').forEach((b) => b.onclick = () => { mapFilter = b.dataset.f; pages.map(app); });
  map = L.map('map', { scrollWheelZoom: false }).setView([ISLAND.lat - 0.005, ISLAND.lng - 0.03], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap contributors' }).addTo(map);
  const pts = []; let focusMarker;
  D.locations.filter((l) => mapFilter === 'all' || l.category === mapFilter).forEach((l) => {
    const isH = l.category === 'house';
    const evs = D.events.filter((e) => e.location_id === l.id);
    const m = L.marker([l.lat, l.lng], { zIndexOffset: isH ? 1000 : 0, title: l.name, icon: L.divIcon({ className: '', html: `<div class="pin ${isH ? 'house' : ''}">${LOC_CATS[l.category]?.[0] || '📍'}</div>`, iconSize: isH ? [46, 46] : [34, 34], iconAnchor: isH ? [23, 23] : [17, 17] }) }).addTo(map);
    m.bindPopup(`<strong>${isH ? '🏠 ' : ''}${esc(l.name)}</strong><br>${esc(l.address || '')}<br>${l.description ? esc(l.description) + '<br>' : ''}${evs.length ? '<b>Related events</b><ul style="padding-left:18px;margin:4px 0">' + evs.map((e) => `<li>${esc(shortDate(e.date))} ${esc(e.time || '')} – ${esc(e.title)}${e.status === 'tentative' ? ' (tentative)' : ''}</li>`).join('') + '</ul>' : ''}<a href="${mapsLink(l.address || l.name)}" target="_blank" rel="noopener">Get directions</a>`);
    pts.push([l.lat, l.lng]);
    if (focus && l.id === +focus) focusMarker = m;
  });
  if (focusMarker) { map.setView(focusMarker.getLatLng(), 15); focusMarker.openPopup(); } else if (pts.length) map.fitBounds(pts, { padding: [30, 30] });
};

pages.family = (app) => {
  app.innerHTML = `<h1>👨‍👩‍👧 Who's Staying Where</h1>
  <div class="grid">${D.families.map((f) => { const h = f.house_id && house(f.house_id); return `<article class="card person">${avatar(f)}<div><h3>${esc(f.name)}</h3>
  ${f.members ? `<p>${esc(f.members)}</p>` : ''}${h ? `<p>🏠 <a class="pill-link" href="#/houses/${h.id}">${esc(h.name)}</a></p>` : ''}
  ${f.phone ? `<p>📞 <a href="tel:${esc(f.phone)}">${esc(f.phone)}</a></p>` : ''}${f.email ? `<p>✉️ <a href="mailto:${esc(f.email)}">${esc(f.email)}</a></p>` : ''}</div></article>`; }).join('')}</div>
  ${D.families.length ? '' : '<p class="empty">No families added yet.</p>'}`;
};

pages.meals = (app) => {
  const meals = D.events.filter((e) => e.category === 'meal' || e.meal_type);
  const days = [...new Set(meals.map((e) => e.date))];
  app.innerHTML = `<h1>🍽️ Meals & Gatherings</h1><p class="sub">Every family meal this week at a glance.</p>
  ${days.map((d) => `<div class="day">${esc(longDate(d))}</div>${meals.filter((e) => e.date === d).map((e) => {
    const l = loc(e.location_id), h = fam(e.host_family_id);
    return `<article class="card event ${e.status}"><span class="badge">${esc(e.meal_type || 'meal')}</span>${e.status === 'tentative' ? '<span class="badge tentative">⏳ Tentative</span>' : ''}
    <h3>${esc(e.title)}</h3><div class="meta">🕒 ${esc(e.time || 'Time TBD')} · 📍 ${l ? `<a class="pill-link" href="#/map/${l.id}">${esc(l.name)}</a>` : esc(e.location_text || 'TBD')}</div>
    ${h ? `<div class="meta">👤 Host: ${esc(h.name)}</div>` : ''}${e.description ? `<p>${nl(e.description)}</p>` : ''}${e.notes ? `<div class="note">📝 ${nl(e.notes)}</div>` : ''}
    ${D.admin ? `<p><a class="btn" href="#/admin/events/${e.id}">✏️ Edit</a></p>` : ''}</article>`; }).join('')}`).join('') || '<p class="empty">No meals planned yet.</p>'}`;
};

const minimaps = [];
pages.houses = (app, id) => {
  const hs = id ? D.houses.filter((h) => h.id === +id) : D.houses;
  app.innerHTML = `<h1>🔑 House Information</h1><p class="sub">${id ? '<a class="pill-link" href="#/houses">← All houses</a>' : 'Tap a code to select it. Please keep this private.'}</p>
  ${hs.map((h) => { const fs = D.families.filter((f) => f.house_id === h.id); const dd = (k, v, c) => v ? `<dt>${k}</dt><dd>${c ? `<span class="code">${esc(v)}</span>` : nl(v)}</dd>` : '';
    return `<article class="card"><h2 style="margin-top:0">🏠 ${esc(h.name)}</h2><dl class="kv">${dd('Address', h.address)}${dd('Staying here', fs.map((f) => f.name).join(', '))}${dd('Wi-Fi name', h.wifi_name, 1)}${dd('Wi-Fi password', h.wifi_password, 1)}${dd('Door code', h.door_code, 1)}${dd('Gate code', h.gate_code, 1)}${dd('Parking', h.parking)}
    ${h.manager_name || h.manager_phone ? `<dt>Property manager</dt><dd>${esc(h.manager_name || '')} ${h.manager_phone ? `<a href="tel:${esc(h.manager_phone)}">📞 ${esc(h.manager_phone)}</a>` : ''}</dd>` : ''}${dd('Notes', h.notes)}</dl>
    ${h.location_id ? `<div class="minimap" id="mm${h.id}" data-loc="${h.location_id}"></div>` : ''}
    <p class="row">${h.address ? `<a class="btn" target="_blank" rel="noopener" href="${mapsLink(h.address)}">🧭 Directions</a>` : ''}${D.admin ? `<a class="btn" href="#/admin/houses/${h.id}">✏️ Edit</a>` : ''}</p></article>`; }).join('') || '<p class="empty">No houses yet.</p>'}`;
  app.querySelectorAll('.minimap').forEach((el) => {
    const l = loc(+el.dataset.loc); if (!l) return;
    const m = L.map(el, { scrollWheelZoom: false }).setView([l.lat, l.lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
    L.marker([l.lat, l.lng], { icon: L.divIcon({ className: '', html: '<div class="pin house">🏠</div>', iconSize: [46, 46], iconAnchor: [23, 23] }) }).addTo(m);
    minimaps.push(m);
  });
};

let albumSel = 'all';
pages.gallery = (app) => {
  const ps = D.photos.filter((p) => albumSel === 'all' || p.album_id === +albumSel);
  app.innerHTML = `<h1>📷 Photo Gallery</h1><div class="chips"><button class="chip" aria-pressed="${albumSel === 'all'}" data-a="all">All</button>${D.albums.map((a) => `<button class="chip" aria-pressed="${albumSel == a.id}" data-a="${a.id}">${esc(a.name)}</button>`).join('')}</div>
  ${ps.length ? `<div class="photos">${ps.map(photoTile).join('')}</div>` : '<p class="empty">No photos in this album yet.</p>'}`;
  app.querySelectorAll('[data-a]').forEach((b) => b.onclick = () => { albumSel = b.dataset.a; pages.gallery(app); });
  bindPhotos(app, D.photos);
};

pages.memories = (app) => {
  const sec = [['highlight', '🌟 Highlights of the Week'], ['story', '📖 Family Stories'], ['moment', '✨ Memorable Moments']];
  const m = D.memories;
  const favs = D.photos.filter((p) => { const a = byId(D.albums, p.album_id)?.name; return a === 'Favorite Moments'; });
  const groups = D.photos.filter((p) => byId(D.albums, p.album_id)?.name === 'Group Photos');
  app.innerHTML = `<h1>💙 Vacation Memories</h1><p class="sub">Our digital scrapbook for Dauphin Island 2027.</p>
  <h2>⭐ Favorite Photos</h2>${favs.length ? `<div class="photos">${favs.map(photoTile).join('')}</div>` : '<p class="empty">Add photos to the "Favorite Moments" album.</p>'}
  <h2>👨‍👩‍👧‍👦 Group Pictures</h2>${groups.length ? `<div class="photos">${groups.map(photoTile).join('')}</div>` : '<p class="empty">Add photos to the "Group Photos" album.</p>'}
  ${sec.map(([k, t]) => `<h2>${t}</h2>${m.filter((x) => x.kind === k).map((x) => `<article class="card">${x.photo_url ? `<img class="featured" src="${esc(x.photo_url)}" alt="${esc(x.title)}">` : ''}<h3 style="margin:.3em 0">${esc(x.title)}</h3><p>${nl(x.body)}</p>${x.author ? `<p class="cap">— ${esc(x.author)}</p>` : ''}</article>`).join('') || '<p class="empty">Nothing here yet.</p>'}`).join('')}`;
  bindPhotos(app, D.photos);
};

pages.more = (app) => {
  app.innerHTML = `<h1>More</h1><div class="quick">${NAV.map(([h, i, l]) => `<a href="${h}"><span>${i}</span>${l}</a>`).join('')}<a href="#/admin"><span>⚙️</span>Organizer</a></div>`;
};

// ---------- admin ----------
const T = (k, label, extra = {}) => ({ k, label, ...extra });
const opts = (list, name = 'name') => () => [['', '— none —'], ...list().map((x) => [x.id, x[name] || x.title])];
const ADMIN = {
  updates: { label: '📣 Updates', title: (x) => x.message, list: () => D.updates, fields: [T('message', 'Update message (what changed?)', { type: 'textarea', req: 1 }), T('active', 'Show in banner', { type: 'check', def: 1 })] },
  events: {
    label: '📅 Events', title: (x) => `${shortDate(x.date)} – ${x.title}${x.status === 'tentative' ? ' (tentative)' : ''}`, list: () => D.events,
    fields: [T('title', 'Title', { req: 1 }), T('status', 'Status', { type: 'select', options: () => [['confirmed', '✔ Confirmed'], ['tentative', '⏳ Tentative']], def: 'confirmed' }),
      T('category', 'Category', { type: 'select', options: () => Object.entries(CATS).map(([k, v]) => [k, v[1]]), def: 'plan' }),
      T('date', 'Date', { type: 'date', req: 1, def: TRIP.start }), T('time', 'Time (e.g. 6:00 PM)'),
      T('location_id', 'Location (from map)', { type: 'select', options: opts(() => D.locations) }), T('location_text', 'Or other location text'),
      T('host_family_id', 'Host family', { type: 'select', options: opts(() => D.families) }),
      T('meal_type', 'If a meal, what kind? (shows on Meals page)', { type: 'select', options: () => [['', '— not a meal —'], ...MEAL_TYPES.map((x) => [x, x])] }),
      T('description', 'Description', { type: 'textarea' }), T('notes', 'Notes', { type: 'textarea' })],
  },
  houses: {
    label: '🔑 Houses', title: (x) => x.name, list: () => D.houses,
    fields: [T('name', 'House name', { req: 1 }), T('address', 'Address'), T('location_id', 'Map location', { type: 'select', options: () => [['', '— none —'], ...D.locations.filter((l) => l.category === 'house').map((l) => [l.id, l.name])] }),
      T('wifi_name', 'Wi-Fi name'), T('wifi_password', 'Wi-Fi password'), T('door_code', 'Door code'), T('gate_code', 'Gate code'),
      T('parking', 'Parking instructions', { type: 'textarea' }), T('manager_name', 'Property manager'), T('manager_phone', 'Manager phone'), T('notes', 'Notes', { type: 'textarea' })],
  },
  families: {
    label: '👪 Family', title: (x) => x.name, list: () => D.families,
    fields: [T('name', 'Family name', { req: 1 }), T('photo', 'Photo', { type: 'image' }), T('members', 'Members (comma separated)'), T('phone', 'Phone'), T('email', 'Email'), T('house_id', 'House', { type: 'select', options: opts(() => D.houses) })],
  },
  locations: {
    label: '📍 Map places', title: (x) => `${LOC_CATS[x.category]?.[0] || ''} ${x.name}`, list: () => D.locations,
    fields: [T('name', 'Name', { req: 1 }), T('category', 'Type', { type: 'select', options: () => Object.entries(LOC_CATS).map(([k, v]) => [k, v[1]]), def: 'restaurant' }), T('address', 'Address'), T('description', 'Description', { type: 'textarea' }),
      T('lat', 'Latitude', { type: 'number', req: 1, def: ISLAND.lat }), T('lng', 'Longitude', { type: 'number', req: 1, def: ISLAND.lng }), T('_pick', '', { type: 'picker' })],
  },
  photos: { label: '📷 Photos', title: (x) => `${byId(D.albums, x.album_id)?.name || 'No album'}: ${x.caption || 'photo #' + x.id}`, list: () => D.photos, fields: [T('url', 'Photo', { type: 'image' }), T('caption', 'Caption'), T('album_id', 'Album', { type: 'select', options: opts(() => D.albums) }), T('featured', 'Feature on home page', { type: 'check' })] },
  albums: { label: '🗂️ Albums', title: (x) => x.name, list: () => D.albums, fields: [T('name', 'Album name', { req: 1 }), T('sort', 'Order (0 first)', { type: 'number', def: 0 })] },
  memories: {
    label: '💙 Memories', title: (x) => `${x.kind}: ${x.title}`, list: () => D.memories,
    fields: [T('kind', 'Type', { type: 'select', options: () => [['highlight', 'Highlight of the week'], ['story', 'Family story'], ['moment', 'Memorable moment']], def: 'highlight' }), T('title', 'Title', { req: 1 }), T('body', 'Story / text', { type: 'textarea' }), T('author', 'Written by'), T('photo_url', 'Photo', { type: 'image' })],
  },
};

pages.admin = (app, a, id) => {
  if (!D.admin) {
    app.innerHTML = `<div class="card"><h1>⚙️ Organizer Login</h1><form id="lg"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password"><p><button class="primary">Log in</button></p></form></div>`;
    $('#lg').onsubmit = async (e) => { e.preventDefault(); try { await api('POST', '/api/admin-login', { password: $('#pw').value }); await refresh(); } catch (x) { toast(x.message, 1); } };
    return;
  }
  const tabs = `<div class="chips" role="tablist">${Object.entries(ADMIN).map(([k, v]) => `<a class="chip" href="#/admin/${k}" aria-pressed="${a === k}">${v.label}</a>`).join('')}</div>`;
  if (!a) {
    app.innerHTML = `<h1>⚙️ Organizer Tools</h1><div class="card"><h2 style="margin-top:0">📣 Post a quick update</h2><form id="qu"><label for="qm">Message everyone will see at the top of every page</label><textarea id="qm" required placeholder="Seafood boil moved to Fox House at 6:00 PM"></textarea><p><button class="primary">Post update</button></p></form></div>
    <h2>Manage</h2><div class="quick">${Object.entries(ADMIN).map(([k, v]) => `<a href="#/admin/${k}"><span>${v.label.split(' ')[0]}</span>${v.label.split(' ').slice(1).join(' ')}</a>`).join('')}</div>
    <p><button id="lo">Log out</button></p>`;
    $('#qu').onsubmit = async (e) => { e.preventDefault(); try { await api('POST', '/api/updates', { message: $('#qm').value, active: 1 }); toast('Update posted ✔'); await refresh(); } catch (x) { toast(x.message, 1); } };
    $('#lo').onclick = async () => { await api('POST', '/api/admin-logout'); await refresh(); location.hash = '#/'; };
    return;
  }
  const cfg = ADMIN[a]; if (!cfg) return (location.hash = '#/admin');
  if (id) return adminForm(app, a, cfg, tabs, id === 'new' ? null : cfg.list().find((x) => x.id === +id));
  app.innerHTML = `<h1>${cfg.label}</h1>${tabs}<p><a class="btn primary" href="#/admin/${a}/new">➕ Add new</a></p>
  ${cfg.list().map((x) => `<div class="card row sp"><span>${esc(cfg.title(x))}</span><span class="row"><a class="btn" href="#/admin/${a}/${x.id}">✏️ Edit</a><button class="danger" data-del="${x.id}">🗑️ Delete</button></span></div>`).join('') || '<p class="empty">Nothing yet.</p>'}`;
  app.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => { if (!confirm('Delete this? This cannot be undone.')) return; await api('DELETE', `/api/${a}/${b.dataset.del}`); toast('Deleted'); await refresh(); });
};

function adminForm(app, a, cfg, tabs, item) {
  const v = (f) => item ? item[f.k] ?? '' : f.def ?? '';
  const input = (f) => {
    const id = 'f_' + f.k; const val = v(f);
    if (f.type === 'picker') return '<p class="sub">Tip: tap the map to set latitude/longitude.</p><div class="minimap" id="pickmap" style="height:260px"></div>';
    if (f.type === 'textarea') return `<label for="${id}">${f.label}</label><textarea id="${id}" ${f.req ? 'required' : ''}>${esc(val)}</textarea>`;
    if (f.type === 'select') return `<label for="${id}">${f.label}</label><select id="${id}">${f.options().map(([k, l]) => `<option value="${esc(k)}" ${String(k) === String(val) ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
    if (f.type === 'check') return `<label class="row"><input type="checkbox" id="${id}" ${val ? 'checked' : ''}> ${f.label}</label>`;
    if (f.type === 'image') return `<label for="${id}">${f.label}</label>${val ? `<img class="avatar" id="${id}_p" src="${esc(val)}" alt="">` : `<img class="avatar" id="${id}_p" alt="" hidden>`}<input type="hidden" id="${id}" value="${esc(val)}"><input type="file" accept="image/*" data-up="${id}">`;
    return `<label for="${id}">${f.label}</label><input id="${id}" type="${f.type || 'text'}" ${f.type === 'number' ? 'step="any"' : ''} value="${esc(val)}" ${f.req ? 'required' : ''}>`;
  };
  app.innerHTML = `<h1>${item ? 'Edit' : 'Add'} – ${cfg.label}</h1>${tabs}<form id="af" class="card"><div class="form2">${cfg.fields.map((f) => `<div ${f.type === 'textarea' || f.type === 'picker' ? 'style="grid-column:1/-1"' : ''}>${input(f)}</div>`).join('')}</div>
  <p class="row"><button class="primary">💾 Save</button><a class="btn" href="#/admin/${a}">Cancel</a></p></form>`;
  app.querySelectorAll('[data-up]').forEach((inp) => inp.onchange = async () => {
    const file = inp.files[0]; if (!file) return;
    try { toast('Uploading…'); const r = await api('POST', '/api/upload/image', null, { type: file.type, body: file }); $('#' + inp.dataset.up).value = r.url; const p = $('#' + inp.dataset.up + '_p'); p.src = r.url; p.hidden = false; toast('Photo uploaded ✔'); } catch (x) { toast(x.message, 1); }
  });
  if ($('#pickmap')) {
    const la = +$('#f_lat').value, ln = +$('#f_lng').value;
    const m = L.map('pickmap').setView([la, ln], 13); minimaps.push(m);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(m);
    const mk = L.marker([la, ln]).addTo(m);
    m.on('click', (e) => { mk.setLatLng(e.latlng); $('#f_lat').value = e.latlng.lat.toFixed(6); $('#f_lng').value = e.latlng.lng.toFixed(6); });
  }
  $('#af').onsubmit = async (e) => {
    e.preventDefault(); const body = {};
    cfg.fields.forEach((f) => { if (f.type === 'picker') return; const el = $('#f_' + f.k); body[f.k] = f.type === 'check' ? (el.checked ? 1 : 0) : f.type === 'number' ? (el.value === '' ? null : +el.value) : el.value; });
    ['location_id', 'host_family_id', 'house_id', 'album_id'].forEach((k) => { if (k in body) body[k] = body[k] === '' ? null : +body[k]; });
    try { item ? await api('PUT', `/api/${a}/${item.id}`, body) : await api('POST', `/api/${a}`, body); toast('Saved ✔'); await refresh(); location.hash = `#/admin/${a}`; } catch (x) { toast(x.message, 1); }
  };
}

// ---------- router ----------
async function refresh() { await load(); route(); }
function route() {
  if (!D) return;
  minimaps.splice(0).forEach((m) => m.remove()); if (map) { map.remove(); map = null; }
  const [, page = 'home', a, b] = (location.hash || '#/').replace(/^#\/?/, '#/').split('/');
  const app = $('#app'); const name = page === '' ? 'home' : page;
  (pages[name] || pages.home)(app, a, b);
  renderNav(); renderUpdates();
  if (!(name === 'map' && a)) window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
load().then(route).catch(() => { $('#app').innerHTML = '<p class="empty">Could not load. Please refresh.</p>'; });
