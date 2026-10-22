/* Houses & Family: one card per house with its address, who is staying there, and quick actions. */
(function (F) {
  const { esc, nl } = F;

  const person = (f) => {
    const hosting = F.events.filter((e) => e.host === f.id && F.isMeal(e));
    return '<li class="person">' + F.avatar(f) + '<div class="who"><b>' + esc(f.name) + '</b>' + (f.members && f.members.length ? '<span class="meta">' + esc(f.members.join(', ')) + '</span>' : '') +
      (hosting.length ? '<span class="meta">Hosting: ' + hosting.map((e) => '<a class="pill-link" href="#/calendar/' + e.date + '">' + esc(e.title) + '</a>').join(', ') + '</span>' : '') + '</div></li>';
  };

  const row = (k, v, copy) => v ? '<dt>' + k + '</dt><dd>' + (copy ? '<span class="code">' + esc(v) + '</span> <button type="button" class="small" data-copy="' + esc(v) + '" aria-label="Copy ' + k + '">Copy</button>' : nl(v)) + '</dd>' : '';

  const houseCard = (h) => {
    const fs = F.families.filter((f) => f.house === h.id);
    const evs = F.events.filter((e) => e.location === h.id);
    const details = row('Parking', h.parking) +
      (h.manager && h.manager.name ? '<dt>Property manager</dt><dd>' + esc(h.manager.name || '') + '</dd>' : '') + row('Notes', h.notes) +
      (evs.length ? '<dt>Plans here</dt><dd>' + evs.map((e) => '<a class="pill-link" href="#/calendar/' + e.date + '">' + esc(F.shortDate(e.date)) + (e.time ? ', ' + esc(e.time) : '') + ' \u2013 ' + esc(e.title) + '</a>').join('<br>') + '</dd>' : '');
    return '<article class="card house" id="h-' + esc(h.id) + '" aria-labelledby="hn-' + esc(h.id) + '"><div class="house-head"><h2 id="hn-' + esc(h.id) + '">' + esc(h.name) + '</h2>' +
      (h.address ? '<p class="meta">' + esc(h.address) + '</p>' : '<p class="meta">Address coming soon</p>') + (h.description ? '<p>' + esc(h.description) + '</p>' : '') + '</div>' +
      '<div class="house-body"><h3>Staying here</h3>' + (fs.length ? '<ul class="people">' + fs.map(person).join('') + '</ul>' : '<p class="meta">No one assigned yet.</p>') +
      '<h3>Quick actions</h3><div class="row"><a class="btn primary" target="_blank" rel="noopener" href="' + F.mapsLink(h.address || h.name) + '">Directions</a><a class="btn" href="#/map/' + esc(h.id) + '">View on map</a>' +
      '</div>' +
      (details ? '<details class="info"><summary>Details</summary><dl class="kv">' + details + '</dl></details>' : '') + '</div></article>';
  };

  F.pages.houses = (app, id) => {
    const hs = id ? F.houses.filter((h) => h.id === id) : F.houses;
    const loose = id ? [] : F.families.filter((f) => !f.house || !F.house(f.house));
    app.innerHTML = '<h1>' + F.pageTitle('houses') + '</h1><p class="sub">' + (id ? '<a class="pill-link" href="#/houses">All houses</a>' : 'Who is staying where, and everything you need for each house. Please keep this within the family.') + '</p>' +
      (id || F.houses.length < 2 ? '' : '<div class="chips" role="group" aria-label="Jump to a house">' + F.houses.map((h) => '<a class="chip" href="#/houses/' + esc(h.id) + '">' + esc(h.name) + '</a>').join('') + '</div>') +
      (hs.map(houseCard).join('') || '<p class="empty">House not found.</p>') +
      (loose.length ? '<article class="card house"><div class="house-head"><h2>Other family</h2></div><div class="house-body"><ul class="people">' + loose.map(person).join('') + '</ul></div></article>' : '');
  };
})(window.FOX);
