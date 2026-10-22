/* Home: the "This Week" page. Title card with countdown, then the weekly meals and events table. */
(function (F) {
  const { esc } = F;

  F.pages.home = (app) => {
    const real = F.today(), t = F.trip;
    const before = real < t.start, after = real > t.end;
    const n = F.daysBetween(real, t.start);
    const count = before ? '<b>' + n + '</b><span>' + (n === 1 ? 'day to go' : 'days to go') + '</span>' : !after ? '<b>Day ' + (F.daysBetween(t.start, real) + 1) + '</b><span>of ' + t.count + '</span>' : '<b>Thank you</b><span>for a great week</span>';
    app.innerHTML =
      '<section class="hero" aria-labelledby="hero-h"><h1 id="hero-h">' + esc(F.siteName) + '</h1>' +
      '<div class="hero-row"><p class="count">' + count + '</p><p class="hero-dates">' + esc(F.shortDate(t.start)) + ' to ' + esc(F.shortDate(t.end)) + '<small>' + esc(F.fullDate(real)) + '</small></p></div></section>' +
      '<section class="week-first" aria-labelledby="wk-h"><h2 id="wk-h" class="sr">The week at a glance</h2>' + F.mealBoard() + '<p class="cap">Tap a day or meal for details. Dashed edge = not confirmed yet. Swipe sideways to see every column.</p></section>';
  };
})(window.FOX);