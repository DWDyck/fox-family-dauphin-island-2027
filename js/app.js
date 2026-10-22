/* Shell: navigation, updates banner and hash router. */
(function (F) {
  const { $, esc } = F;
  // [address, icon, label, where]  where: 'm' = always in the phone bar, 'd' = desktop bar and the More page
  F.NAV = [['#/', 'home', 'This Week', 'm'], ['#/meals', 'restaurant', 'Meals', 'm'], ['#/map', 'map', 'Map', 'm'], ['#/calendar', 'calendar', 'Calendar', 'm'], ['#/weather', 'sun', 'Weather', 'd'], ['#/houses', 'key', 'Houses', 'd'], ['#/family', 'users', 'Family', 'd'], ['#/gallery', 'photo', 'Photos', 'd'], ['#/memories', 'heart', 'Memories', 'd']];

  function updateLine(x) {
    const e = x.event && F.events.find((v) => v.id === x.event);
    if (!e) return '';
    const l = F.whereOf(e);
    return '<small>Now: ' + esc(F.shortDate(e.date)) + (e.time ? ', ' + esc(e.time) : '') + (l ? ' at ' + esc(l.name) : '') + '</small>';
  }

  function renderUpdates() {
    const today = F.today();
    const u = F.updates.filter((x) => x.show !== false && (!x.until || x.until >= today));
    $('#updates').innerHTML = '<div class="banner" role="region" aria-label="Latest updates"><h2>Latest Updates</h2>' +
      (u.length ? '<ul>' + u.slice(0, 4).map((x) => '<li class="' + (x.important ? 'important' : '') + '">' + (x.important ? '<span class="tag imp">Important</span> ' : '') + esc(x.text) + updateLine(x) + (x.date ? '<small>Posted ' + esc(F.shortDate(x.date)) + '</small>' : '') + '</li>').join('') + '</ul>' : '<p class="none">No changes right now. Everything is on plan.</p>') + '</div>';
  }

  const routeName = () => (location.hash || '#/').replace(/^#\/?/, '').split('/')[0];
  function renderNav() {
    const cur = routeName();
    $('#tabs').innerHTML = F.NAV.map((n) => '<a href="' + n[0] + '" class="' + (n[3] === 'd' ? 'desk' : '') + '"' + (cur === n[0].replace('#/', '') ? ' aria-current="page"' : '') + '>' + F.icon(n[1]) + '<span>' + n[2] + '</span></a>').join('') +
      '<a href="#/more" class="more"' + (cur === 'more' ? ' aria-current="page"' : '') + '>' + F.icon('menu') + '<span>More</span></a>';
  }

  const TITLES = { home: 'This Week', calendar: 'Calendar', map: 'Island Map', meals: 'Meals & Gatherings', weather: 'Weather', houses: 'House Info', family: 'Family Directory', gallery: 'Photos', memories: 'Memories', more: 'Menu', check: 'Data Check' };
  let first = true;

  function route() {
    F.maps.splice(0).forEach((m) => m.remove());
    const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
    const name = F.pages[parts[0]] ? parts[0] : 'home';
    F.pages[name]($('#app'), parts[1]);
    document.title = (name === 'home' ? '' : TITLES[name] + ' · ') + F.siteName;
    renderNav();
    if (!(name === 'map' && parts[1]) && !(name === 'calendar' && parts[1])) window.scrollTo(0, 0);
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

  // Theme: Auto follows the phone, Light and Dark are chosen by hand; remembered on this device.
  const THEMES = ['auto', 'light', 'dark'], THEME_LABEL = { auto: 'Auto', light: 'Light', dark: 'Dark' };
  const themeMeta = document.querySelector('meta[name=theme-color]');
  const setTheme = (t) => {
    const root = document.documentElement;
    if (t === 'auto') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', t);
    const b = $('#themebtn'); b.textContent = THEME_LABEL[t]; b.dataset.theme = t;
    b.setAttribute('aria-label', 'Color theme: ' + (t === 'auto' ? 'automatic' : t) + '. Tap to change.');
    const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    if (themeMeta) themeMeta.content = dark ? '#0a3d58' : '#0b5d8a';
    try { localStorage.setItem('fox-theme', t === 'auto' ? '' : t); } catch (e) {}
  };
  let theme = 'auto';
  try { const s = localStorage.getItem('fox-theme'); if (s === 'light' || s === 'dark') theme = s; } catch (e) {}
  setTheme(theme);
  $('#themebtn').onclick = () => { theme = THEMES[(THEMES.indexOf(theme) + 1) % 3]; setTheme(theme); };
  if (window.matchMedia) matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => theme === 'auto' && setTheme('auto'));

  $('#brand-name').textContent = F.siteName;
  $('#foot-name').textContent = F.siteName;
  if (F.config.lastUpdated) $('#stamp').textContent = ' · Last updated ' + F.shortDate(F.config.lastUpdated);

  renderUpdates();
  window.addEventListener('hashchange', route);
  route();

  // Lets the site open without signal after the first visit (works on https / GitHub Pages only).
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) navigator.serviceWorker.register('sw.js').catch(() => {});
})(window.FOX);
