# AGENTS.md

Context for AI agents working on the Fox Family Dauphin Island 2027 vacation site. Read this before editing.

## What this is
A static, mobile-first family vacation dashboard on GitHub Pages. Vanilla JS and CSS: **no build step, no npm, no server, no framework**. Repo `dwdike-maker/fox-family-dauphin-island-2027`, live at https://dwdike-maker.github.io/fox-family-dauphin-island-2027/. Users are non-technical family members on phones; simplicity and quick scanning beat features.

## Navigation (exactly five tabs; do not add more)
`F.NAV` in `js/util.js`: 🏖️ This Week (`home`), 🗺️ Map, 🌤️ Weather, 🏠 Houses & Family (`houses`), 📸 Photos & Memories (`photos`). The Calendar page (`#/calendar/<date>`) is not a tab; the weekly table links to it (`F.EXTRA_PAGES`). `#/meals` redirects home. Hash router: `#/route/arg`. Old `#/family`, `#/gallery`, `#/memories` redirect via `ALIASES` in `app.js`. `#/check` is a hidden data-validation page linked from the footer. Emoji appear only in nav and page titles; elsewhere use the SVG icon set (`F.icon`).

## Files
```
admin.html        LOCAL content editor (forms -> writes data/*.js + resized images via File System Access API, bumps sw.js VERSION). Not linked from the site.
index.html        shell, inline theme script (sets data-theme before paint), script order
styles.css        all CSS: 1 tokens, 2 base, 3 header/nav, 4 layout, 5 components, 6 wide screens/print
sw.js             service worker (network first). Bump VERSION on every deploy; list new files in CORE
data/             config, houses, locations, families, schedule, photos, memories  (content only)
js/util.js        namespace window.FOX (F), date helpers, lookups, F.NAV, icons, builds F.days/F.events
js/components.js  shared HTML builders: agendaRow, dayList, eventCard, mealBoard, photoTile, lightbox, ICS and copy handlers
js/weather.js     Open-Meteo client (cached in localStorage), F.weatherNow tile, #/weather page
js/pages.js       calendar and map pages (+ F.ui helpers)
js/home.js        This Week: title card + weekly table only
js/houses.js      merged houses + families
js/photos.js      merged photos + memories (optional `year` for past trips)
js/check.js       data validation (#/check)
js/app.js         router, nav render, theme and text-size toggles
```
Script load order matters (data, util, components, weather, check, pages, home, houses, photos, app). Pages register as `F.pages[name] = (app, arg) => {...}` and set `app.innerHTML`.

## Data model
- `data/schedule.js` is the **only** source of dates. Days `{date:'YYYY-MM-DD', title?, dinner?, events:[...]}` with no gaps; events `{id,title,time:'6:30 PM',category,status,location,host,mealType,description,notes}`. Trip start/end/count derive from it (`F.trip`). Trip: Sat 2027-06-19 to Sat 2027-06-26.
- Reference by id: `location` -> houses.js or locations.js; `host` -> families.js; family `house` -> houses.js id.
- Dinner = meal not breakfast/lunch at 3 PM or later (`F.isDinner`).
- Photos/memories: optional `year` (past trips show under "Past vacations"); photo `album` must be in `FOX.albums`.
- Sample data (addresses, codes, phones, 2026 memories) is placeholder. Repo is public: there are intentionally NO door/gate/Wi-Fi code fields; never add them.

## Conventions
- **Dates**: strings only; use `F.parse/ymd/addDays/daysBetween/today/shortDate/longDate` etc. Never `new Date('YYYY-MM-DD')` or ad hoc formatting. `F.today()` uses `America/Chicago` and honors `?today=YYYY-MM-DD`. `F.nowMinutes()`/`F.nextEvent()` give island time.
- **CSS**: colours only via tokens in section 1 (light `:root`, one dark block `:root[data-theme=dark]`). Use spacing tokens `--s1..--s6`, 48px minimum touch targets, respect `prefers-reduced-motion`. Dark theme is warm coastal: deep ocean, Gulf turquoise `--accent`, coral `--coral`, sand.
- Always `esc()` interpolated text; build HTML strings in the existing style.
- Accessibility: landmarks, `aria-current` on nav, labelled regions, visible focus, text not colour alone (tentative = dashed edge + label).
- Home page: title card (countdown) then the weekly meal board (horizontally scrollable on phones, min-width 600px, sticky day column). Nothing else.
- Edit emoji with `\u{...}` escapes in JS; PowerShell mangles emoji in files.

## Admin editor (admin.html)
Self-contained page that loads the data files, edits an in-memory copy, and regenerates `data/*.js` (comments are regenerated from headers in the page). If you change a data field or schema, update `FIELDS`, `HDR` and `validate()` in `admin.html` too. No contact fields (phone/email) or door/Wi-Fi codes exist on purpose. Test by serving the folder and opening `admin.html`; `window.FOXADMIN` exposes `texts()` and `validate()`.

## Develop and test
No tooling required.
1. `node --check` each JS file.
2. Serve statically (e.g. a tiny Node server, port 8123); open `index.html?today=2027-06-22` to preview a trip day (also test a pre-trip and post-trip date).
3. Headless Edge screenshots (`msedge --headless=new --window-size=500,1000 --screenshot=...`) at about 500 and 1100 px, light and dark.
4. Open `#/check` and confirm no errors.

## Deploy
Commit and push to `main`; Pages builds in 1-5 minutes (`gh run list -R dwdike-maker/fox-family-dauphin-island-2027`). Bump `VERSION` in `sw.js` (currently `fox-2027-v10`) so phones refresh. `git push` writes to stderr and may exit non-zero even on success; verify with `git status -sb`. Commits use the trailer `Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>`.

## External services
Open-Meteo (weather, no key), OpenStreetMap tiles and Leaflet from unpkg (map, loaded lazily), Nominatim (geocoding addresses lacking lat/lng, cached). All degrade gracefully offline.

## History
v1 theme and weather; v2 meal board; v3 dashboard refactor (7-item nav, Latest Updates removed, merged pages, coastal theme); v4 weekly board moved to top; v5 home reduced to title card + table, tabs reordered to Week/Map/Weather/Houses/Photos, Meals tab removed. See `REVIEW.md` for the design and date-handling review.
