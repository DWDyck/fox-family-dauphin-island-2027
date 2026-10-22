/* Home: the "This Week" dashboard. Countdown, weather, next meal, next event, today's plans, then the week's meals. */
(function (F) {
  const { esc, $ } = F;

  const rel = (date) => {
    const t = F.today();
    return date === t ? 'Today' : date === F.addDays(t, 1) ? 'Tomorrow' : F.shortDate(date);
  };
  const when = (e) => esc(rel(e.date)) + (e.time ? ' at ' + esc(e.time) : '');

  // Next meal / next event card: title, when, where and a link to the full details.
  const nextCard = (cls, label, e, href, linkText) => {
    if (!e) return '<section class="dcard ' + cls + '"><p class="eyebrow">' + label + '</p><p class="line">Nothing more planned.</p></section>';
    const l = F.whereOf(e), h = F.hostOf(e);
    return '<section class="dcard ' + cls + '"><p class="eyebrow">' + label + '</p><h3>' + esc(e.title) + (e.status === 'tentative' ? ' <span class="tag tent">Tentative</span>' : '') + '</h3><p class="when">' + when(e) + '</p>' +
      (l ? '<p class="line"><a href="#/map/' + esc(l.id) + '">' + esc(l.name) + '</a>' + (h ? ' &middot; hosted by ' + esc(h.name) : '') + '</p>' : h ? '<p class="line">Hosted by ' + esc(h.name) + '</p>' : '') +
      '<a class="go" href="' + href + '">' + linkText + '</a></section>';
  };

  F.pages.home = (app) => {
    const real = F.today(), t = F.trip;
    const before = real < t.start, after = real > t.end, live = !before && !after;
    const n = F.daysBetween(real, t.start);
    const count = before ? '<b>' + n + '</b><span>' + (n === 1 ? 'day to go' : 'days to go') + '</span>' : live ? '<b>Day ' + (F.daysBetween(t.start, real) + 1) + '</b><span>of ' + t.count + '</span>' : '<b>Thank you</b><span>for a great week</span>';
    const focus = before ? t.start : real;
    const day = F.day(focus);
    const meal = F.nextEvent(F.isMeal);
    const event = F.nextEvent((e) => !F.isMeal(e));
    const tent = F.events.filter((e) => e.status === 'tentative' && e.date >= focus).length;

    const todayCard = after ? '<section class="dcard today-card"><p class="eyebrow">The trip is over</p><p class="line">Relive the week in <a href="#/photos">Photos &amp; Memories</a>.</p></section>' :
      '<section class="dcard today-card"><p class="eyebrow">' + (before ? 'Arrival day' : 'Today') + '</p><h3>' + esc(F.longDate(focus)) + (day && day.title ? '<span class="wk-title">' + esc(day.title) + '</span>' : '') + '</h3>' + (day ? F.dayList(day) : '') +
      '<a class="go" href="#/calendar/' + focus + '">Full details</a>' + (tent ? ' <span class="meta">&middot; ' + F.ui.plural(tent, 'plan') + ' still to confirm</span>' : '') + '</section>';

    app.innerHTML =
      '<section class="hero" aria-labelledby="hero-h"><p class="eyebrow">' + esc(F.nav('home')[1]) + ' This Week</p><h1 id="hero-h">' + esc(F.siteName) + '</h1>' +
      '<div class="hero-row"><p class="count">' + count + '</p><p class="hero-dates">' + esc(F.shortDate(t.start)) + ' to ' + esc(F.shortDate(t.end)) + '<small>' + esc(F.fullDate(real)) + '</small></p></div></section>' +
      '<div class="dash">' +
      '<section class="dcard dc-weather"><p class="eyebrow">Weather</p><div id="wx"><p class="loading">Checking the sky…</p></div><a class="go" href="#/weather">Full forecast</a></section>' +
      (after ? '' : nextCard('meal', 'Next meal', meal, '#/meals', 'All meals')) + (after ? '' : nextCard('event', 'Next event', event, '#/calendar/' + (event ? event.date : ''), 'Calendar')) +
      todayCard + '</div>' +
      '<h2>Meals this week</h2><p class="sub">Tap a meal for details. Dashed edge = not confirmed yet.</p>' + F.mealBoard();
    F.weatherNow($('#wx'));
  };
})(window.FOX);
