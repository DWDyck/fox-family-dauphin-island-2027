/* Reusable pieces of HTML: event cards, photo tiles, avatars, weather. */
(function (F) {
  const { esc, nl } = F;

  F.eventCard = (e, o) => {
    o = o || {};
    const l = e.location && F.place(e.location);
    const h = e.host && F.family(e.host);
    const cat = F.CATEGORIES[e.category] || F.CATEGORIES.plan;
    return '<article class="card event ' + e.status + '">' +
      '<div><span class="badge ' + e.status + '">' + (e.status === 'tentative' ? '⏳ Tentative' : '✔ Confirmed') + '</span><span class="badge">' + cat[0] + ' ' + cat[1] + '</span></div>' +
      '<h3>' + esc(e.title) + '</h3>' +
      '<div class="meta">' + (o.showDate ? esc(F.shortDate(e.date)) + ' · ' : '') + (e.time ? '🕒 ' + esc(e.time) : '') + '</div>' +
      (l ? '<div class="meta">📍 <a class="pill-link" href="#/map/' + esc(l.id) + '">' + esc(l.name) + '</a></div>' : '') +
      (h ? '<div class="meta">👤 Hosted by ' + esc(h.name) + '</div>' : '') +
      (e.description ? '<p>' + nl(e.description) + '</p>' : '') +
      (e.notes ? '<div class="note">📝 ' + nl(e.notes) + '</div>' : '') +
      '</article>';
  };

  F.avatar = (f) => f.photo
    ? '<img class="avatar" loading="lazy" src="' + esc(f.photo) + '" alt="' + esc(f.name) + '">'
    : '<div class="avatar" aria-hidden="true">👪</div>';

  F.photoTile = (p, i) => '<button class="ph" data-photo="' + i + '" aria-label="' + esc(p.caption || 'Photo') + '"><img loading="lazy" src="' + esc(p.src) + '" alt="' + esc(p.caption || '') + '"></button>';

  F.bindPhotos = (root, list) => {
    root.querySelectorAll('[data-photo]').forEach((b) => {
      b.onclick = () => {
        const p = list[+b.dataset.photo]; const d = F.$('#lightbox');
        d.innerHTML = '<img src="' + esc(p.src) + '" alt="' + esc(p.caption || '') + '"><p>' + esc(p.caption || '') + '</p><form method="dialog"><button class="primary">Close</button></form>';
        d.showModal();
      };
    });
  };

  const WX = { 0: ['☀️', 'Clear'], 1: ['🌤️', 'Mostly clear'], 2: ['⛅', 'Partly cloudy'], 3: ['☁️', 'Cloudy'], 45: ['🌫️', 'Fog'], 48: ['🌫️', 'Fog'], 51: ['🌦️', 'Drizzle'], 53: ['🌦️', 'Drizzle'], 55: ['🌦️', 'Drizzle'], 61: ['🌧️', 'Rain'], 63: ['🌧️', 'Rain'], 65: ['🌧️', 'Heavy rain'], 80: ['🌦️', 'Showers'], 81: ['🌦️', 'Showers'], 82: ['⛈️', 'Heavy showers'], 95: ['⛈️', 'Thunderstorms'], 96: ['⛈️', 'Thunderstorms'], 99: ['⛈️', 'Thunderstorms'] };
  F.weather = (el) => {
    const w = F.config.weather;
    fetch('https://api.open-meteo.com/v1/forecast?latitude=' + w.lat + '&longitude=' + w.lng + '&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FChicago&forecast_days=3')
      .then((r) => r.json()).then((d) => {
        const x = WX[d.current.weather_code] || ['🌡️', 'Weather'];
        el.innerHTML = '<div class="weather"><div class="big" aria-hidden="true">' + x[0] + '</div><div><div class="t">' + Math.round(d.current.temperature_2m) + '°F</div><div>' + x[1] + ' · wind ' + Math.round(d.current.wind_speed_10m) + ' mph</div>' +
          '<div class="meta">Today: ' + Math.round(d.daily.temperature_2m_min[0]) + '–' + Math.round(d.daily.temperature_2m_max[0]) + '°F · ' + d.daily.precipitation_probability_max[0] + '% rain</div></div></div>';
      }).catch(() => { el.innerHTML = '<p class="empty">Weather is unavailable right now.</p>'; });
  };
})(window.FOX);
