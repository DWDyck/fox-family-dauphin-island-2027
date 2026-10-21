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
      '<p><button data-ics="' + esc(e.id) + '">📲 Add to my calendar</button></p>' +
      '</article>';
  };

  F.toast = (m) => {
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = m;
    document.body.append(t); setTimeout(() => t.remove(), 2500);
  };

  // Builds a one-event .ics file so phones can add it to their own calendar.
  function ics(e) {
    const d = e.date.replace(/-/g, '');
    const m = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i.exec(e.time || '');
    const l = e.location && F.place(e.location);
    const esc2 = (s) => String(s || '').replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    let when;
    if (m) {
      let h = +m[1] % 12 + (/pm/i.test(m[3]) ? 12 : 0);
      const p = (n) => String(n).padStart(2, '0');
      when = 'DTSTART:' + d + 'T' + p(h) + p(m[2] || 0) + '00\r\nDTEND:' + d + 'T' + p(Math.min(h + 1, 23)) + p(m[2] || 0) + '00';
    } else {
      when = 'DTSTART;VALUE=DATE:' + d;
    }
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fox Family//Dauphin Island//EN', 'BEGIN:VEVENT', 'UID:' + e.id + '@fox-family-dauphin-island', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]|\.\d+/g, ''),
      when, 'SUMMARY:' + esc2(e.title + (e.status === 'tentative' ? ' (tentative)' : '')), 'LOCATION:' + esc2(l ? l.name + ', ' + (l.address || '') : ''), 'DESCRIPTION:' + esc2([e.description, e.notes].filter(Boolean).join('\n')), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }

  document.addEventListener('click', (ev) => {
    const a = ev.target.closest('[data-ics]');
    if (a) {
      const e = F.events.find((x) => x.id === a.dataset.ics); if (!e) return;
      const url = URL.createObjectURL(new Blob([ics(e)], { type: 'text/calendar' }));
      const link = document.createElement('a'); link.href = url; link.download = e.id + '.ics'; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return;
    }
    const c = ev.target.closest('[data-copy]');
    if (c) {
      const v = c.dataset.copy;
      const done = () => F.toast('Copied: ' + v);
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(v).then(done, done);
      else { const t = document.createElement('textarea'); t.value = v; document.body.append(t); t.select(); try { document.execCommand('copy'); } catch (x) {} t.remove(); done(); }
    }
  });

  F.avatar = (f) => f.photo
    ? '<img class="avatar" loading="lazy" src="' + esc(f.photo) + '" alt="' + esc(f.name) + '">'
    : '<div class="avatar" aria-hidden="true">👪</div>';

  F.photoTile = (p, i) => '<button class="ph" data-photo="' + i + '" aria-label="' + esc(p.caption || 'Photo') + '"><img loading="lazy" src="' + esc(p.src) + '" alt="' + esc(p.caption || '') + '"></button>';

  // Photo viewer: Close, previous/next buttons, arrow keys and swipe.
  F.bindPhotos = (root, list) => {
    const d = F.$('#lightbox'); let cur = 0;
    const show = (i) => {
      cur = (i + list.length) % list.length; const p = list[cur];
      d.innerHTML = '<img src="' + esc(p.src) + '" alt="' + esc(p.caption || '') + '"><p>' + esc(p.caption || '') + ' <small>(' + (cur + 1) + ' of ' + list.length + ')</small></p>' +
        '<div class="row sp"><button data-nav="-1" aria-label="Previous photo">◀ Prev</button><form method="dialog"><button class="primary">Close</button></form><button data-nav="1" aria-label="Next photo">Next ▶</button></div>';
      d.querySelectorAll('[data-nav]').forEach((b) => { b.onclick = () => show(cur + +b.dataset.nav); });
    };
    d.onkeydown = (e) => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); };
    let x0 = null;
    d.ontouchstart = (e) => { x0 = e.touches[0].clientX; };
    d.ontouchend = (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 60) show(cur + (dx < 0 ? 1 : -1)); };
    root.querySelectorAll('[data-photo]').forEach((b) => {
      b.onclick = () => { show(+b.dataset.photo); d.showModal(); };
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
