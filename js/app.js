/* Shell: navigation, updates banner and hash router. */
(function (F) {
  const { $, esc } = F;
  F.NAV = [['#/', '🏠', 'Home', 'm'], ['#/calendar', '📅', 'Calendar', 'm'], ['#/map', '🗺️', 'Map', 'm'], ['#/meals', '🍽️', 'Meals', 'm'], ['#/houses', '🔑', 'Houses', 'd'], ['#/family', '👨‍👩‍👧', 'Family', 'd'], ['#/gallery', '📷', 'Photos', 'd'], ['#/memories', '💙', 'Memories', 'd']];

  function renderUpdates() {
    const today = F.today();
    const u = F.updates.filter((x) => x.show !== false && (!x.until || x.until >= today));
    $('#updates').innerHTML = '<div class="banner" role="region" aria-label="Latest updates"><h2>📣 Latest Updates</h2>' +
      (u.length ? '<ul>' + u.slice(0, 4).map((x) => '<li class="' + (x.important ? 'important' : '') + '">' + (x.important ? '⚠️ ' : '') + esc(x.text) + (x.event && F.events.find((e) => e.id === x.event) ? '<small>Now: ' + esc(F.shortDate(F.events.find((e) => e.id === x.event).date)) + (F.events.find((e) => e.id === x.event).time ? ' · ' + esc(F.events.find((e) => e.id === x.event).time) : '') + (F.events.find((e) => e.id === x.event).location ? ' · ' + esc(F.place(F.events.find((e) => e.id === x.event).location).name) : '') + '</small>' : '') + (x.date ? '<small>Posted ' + esc(F.shortDate(x.date)) + '</small>' : '') + '</li>').join('') + '</ul>' : '<p style="margin:0">No changes right now. Everything is on plan! 🎉</p>') + '</div>';
  }

  function renderNav() {
    const cur = location.hash || '#/';
    $('#tabs').innerHTML = F.NAV.map((n) => '<a href="' + n[0] + '" class="' + (n[3] === 'd' ? 'desk' : '') + '"' + (cur === n[0] ? ' aria-current="page"' : '') + '><span aria-hidden="true">' + n[1] + '</span>' + n[2] + '</a>').join('') +
      '<a href="#/more" class="more"' + (cur === '#/more' ? ' aria-current="page"' : '') + '><span aria-hidden="true">☰</span>More</a>';
  }

  const TITLES = { home: 'Home', calendar: 'Calendar', map: 'Island Map', meals: 'Meals & Gatherings', houses: 'House Info', family: 'Family Directory', gallery: 'Photos', memories: 'Memories', more: 'Menu', check: 'Data Check' };
  let first = true;

  function route() {
    F.maps.splice(0).forEach((m) => m.remove());
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    const name = F.pages[parts[0]] ? parts[0] : 'home';
    F.pages[name]($('#app'), parts[1]);
    document.title = (name === 'home' ? '' : TITLES[name] + ' · ') + F.siteName;
    renderNav();
    if (!(name === 'map' && parts[1])) window.scrollTo(0, 0);
    if (!first) $('#app').focus({ preventScroll: true });
    first = false;
  }

  // Bigger text for anyone who wants it; remembered on this device.
  const big = () => document.documentElement.classList.contains('big');
  const setBig = (on) => {
    document.documentElement.classList.toggle('big', on);
    const b = $('#textsize'); b.setAttribute('aria-pressed', on); b.textContent = on ? 'A−' : 'A+'; b.setAttribute('aria-label', on ? 'Make text smaller' : 'Make text bigger');
    try { localStorage.setItem('fox-big', on ? '1' : ''); } catch (e) {}
  };
  try { if (localStorage.getItem('fox-big')) setBig(true); } catch (e) {}
  $('#textsize').onclick = () => setBig(!big());

  if (F.config.lastUpdated) $('#stamp').textContent = 'Last updated ' + F.shortDate(F.config.lastUpdated);

  renderUpdates();
  window.addEventListener('hashchange', route);
  route();

  // Lets the site open without signal after the first visit (works on https / GitHub Pages only).
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(() => {});
})(window.FOX);
