/* Photos & Memories: this year's photos, family highlights, and past vacations by year. */
(function (F) {
  const { esc, nl } = F;
  const year = (x) => x.year || F.config.year;
  let album = 'all';

  const tiles = (list) => '<div class="photos">' + list.map((p) => F.photoTile(p, F.photos.indexOf(p))).join('') + '</div>';
  const memory = (m) => '<article class="card mem">' + (m.photo ? '<img class="featured" loading="lazy" src="' + esc(m.photo) + '" alt="' + esc(m.title) + '">' : '') +
    '<h3>' + esc(m.title) + '</h3>' + (m.date ? '<p class="meta">' + esc(F.longDate(m.date)) + '</p>' : '') + '<p>' + nl(m.text) + '</p>' + (m.author ? '<p class="cap">From ' + esc(m.author) + '</p>' : '') + '</article>';

  F.pages.photos = (app, focusYear) => {
    const cur = F.config.year;
    const now = F.photos.filter((p) => year(p) === cur && (album === 'all' || p.album === album));
    const albums = F.albums.filter((a) => F.photos.some((p) => year(p) === cur && p.album === a));
    const highlights = F.photos.filter((p) => p.favorite);
    const stories = F.memories.filter((m) => year(m) === cur);
    const past = Array.from(new Set(F.photos.concat(F.memories).map(year).filter((y) => y < cur))).sort((a, b) => b - a);

    app.innerHTML = '<h1>' + F.pageTitle('photos') + '</h1><p class="sub">Our digital scrapbook, this year and every year before.</p>' +
      '<h2 class="first">' + cur + ' photos</h2>' +
      (albums.length ? '<div class="chips" role="group" aria-label="Albums">' + F.ui.chip('data-a', 'all', album === 'all', 'All') + albums.map((a) => F.ui.chip('data-a', a, album === a, esc(a))).join('') + '</div>' : '') +
      (now.length ? tiles(now) : '<p class="empty">No photos yet. They appear here once added in the editor.</p>') +
      (highlights.length ? '<h2>Family highlights</h2>' + tiles(highlights) : '') +
      (stories.length ? '<h2>' + cur + ' stories</h2>' + stories.map(memory).join('') : '') +
      (past.length ? '<h2>Past vacations</h2><div class="chips" role="group" aria-label="Jump to a year">' + past.map((y) => '<a class="chip" href="#/photos/' + y + '">' + y + '</a>').join('') + '</div>' +
        past.map((y) => '<section id="y-' + y + '" aria-labelledby="yh-' + y + '"><div class="year-head"><h2 id="yh-' + y + '">' + y + '</h2><span>Dauphin Island</span></div>' +
          F.memories.filter((m) => year(m) === y).map(memory).join('') + (F.photos.some((p) => year(p) === y) ? tiles(F.photos.filter((p) => year(p) === y)) : '') + '</section>').join('') : '');
    app.querySelectorAll('[data-a]').forEach((b) => { b.onclick = () => { album = b.dataset.a; F.pages.photos(app); }; });
    F.bindPhotos(app, F.photos);
    const target = focusYear && document.getElementById('y-' + focusYear);
    if (target) target.scrollIntoView({ block: 'start' });
  };
})(window.FOX);
