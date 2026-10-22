/* Home: the "This Week" dashboard. Countdown, weather, next meal, next event, today's plans, then the week's meals. */
(function (F) {
  const { esc, $ } = F;

  const rel = (date) => {
    const t = F.today();
    return date === t ? 'Today' : date === F.addDays(t, 1) ? 'Tomorrow' : F.shortDate(date);
  };
  const when = (e) => esc(rel(e.date)) + (e.time ? ' at ' + esc(e.time) : '');

  F.pages.home = (app) => {
    const real = F.today(), t = F.trip;
    const before = real < t.start, after = real > t.end, live = !before && !after;
    const n = F.daysBetween(real, t.start);
    const count = before ? '<b>' + n + '</b><span>' + (n === 1 ? 'day to go' : 'days to go') + '</span>' : live ? '<b>Day ' + (F.daysBetween(t.start, real) + 1) + '</b><span>of ' + t.count + '</span>' : '<b>Thank you</b><span>for a great week</span>';
    const focus = before ? t.start : real;
    const day = F.day(focus);
    const tent = F.events.filter((e) => e.status === 'tentative' && e.date >= focus).length;

    const todayCard = after ? '<section class="dcard today-card"><p class="eyebrow">The trip is over</p><p class="line">Relive the week in <a href="#/photos">Photos &amp; Memories</a>.</p></section>' :
      '<section class="dcard today-card"><p class="eyebrow">' + (before ? 'Arrival day' : 'Today') + '</p><h3>' + esc(F.longDate(focus)) + (day && day.title ? '<span class="wk-title">' + esc(day.title) + '</span>' : '') + '</h3>' + (day ? F.dayList(day) : '') +
      '<a class="go" href="#/calendar/' + focus + '">Full details</a>' + (tent ? ' <span class="meta">&middot; ' + F.ui.plural(tent, 'plan') + ' still to confirm</span>' : '') + '</section>';

    app.innerHTML =
      '<section class="week-first" aria-labelledby="wk-h"><h2 id="wk-h" class="sr">The week at a glance</h2>' + F.mealBoard() + '<p class="cap">Tap a day or meal for details. Dashed edge = not confirmed yet. Swipe sideways to see every column.</p></section>' +
      '<section class="hero" aria-labelledby="hero-h"><p class="eyebrow">' + esc(F.nav('home')[1]) + ' This Week</p><h1 id="hero-h">' + esc(F.siteName) + '</h1>' +
      '<div class="hero-row"><p class="count">' + count + '</p><p class="hero-dates">' + esc(F.shortDate(t.start)) + ' to ' + esc(F.shortDate(t.end)) + '<small>' + esc(F.fullDate(real)) + '</small></p></div></section>' +
      '<div class="dash">' +
      '<section class="dcard dc-weather"><p class="eyebrow">Weather</p><div id="wx"><p class="loading">Checking the sky…</p></div><a class="go" href="#/weather">Full forecast</a></section>' +
      todayCard + '</div>';
    F.weatherNow($('#wx'));
  };
})(window.FOX);
