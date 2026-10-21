/* Shell: navigation, updates banner and hash router. */
(function (F) {
  const { $, esc } = F;
  F.NAV = [['#/', '🏠', 'Home', 'm'], ['#/calendar', '📅', 'Calendar', 'm'], ['#/map', '🗺️', 'Map', 'm'], ['#/meals', '🍽️', 'Meals', 'm'], ['#/houses', '🔑', 'Houses', 'd'], ['#/family', '👨‍👩‍👧', 'Family', 'd'], ['#/gallery', '📷', 'Photos', 'd'], ['#/memories', '💙', 'Memories', 'd']];

  function renderUpdates() {
    const today = F.today();
    const u = F.updates.filter((x) => x.show !== false && (!x.until || x.until >= today));
    $('#updates').innerHTML = '<div class="banner" role="region" aria-label="Latest updates"><h2>📣 Latest Updates</h2>' +
      (u.length ? '<ul>' + u.slice(0, 4).map((x) => '<li class="' + (x.important ? 'important' : '') + '">' + (x.important ? '⚠️ ' : '') + esc(x.text) + (x.date ? '<small>Posted ' + esc(F.shortDate(x.date)) + '</small>' : '') + '</li>').join('') + '</ul>' : '<p style="margin:0">No changes right now. Everything is on plan! 🎉</p>') + '</div>';
  }

  function renderNav() {
    const cur = location.hash || '#/';
    $('#tabs').innerHTML = F.NAV.map((n) => '<a href="' + n[0] + '" class="' + (n[3] === 'd' ? 'desk' : '') + '"' + (cur === n[0] ? ' aria-current="page"' : '') + '><span aria-hidden="true">' + n[1] + '</span>' + n[2] + '</a>').join('') +
      '<a href="#/more" class="more"' + (cur === '#/more' ? ' aria-current="page"' : '') + '><span aria-hidden="true">☰</span>More</a>';
  }

  function route() {
    F.maps.splice(0).forEach((m) => m.remove());
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    const name = parts[0] || 'home';
    (F.pages[name] || F.pages.home)($('#app'), parts[1]);
    document.title = F.config.title;
    renderNav();
    if (!(name === 'map' && parts[1])) window.scrollTo(0, 0);
  }

  renderUpdates();
  window.addEventListener('hashchange', route);
  route();
})(window.FOX);
