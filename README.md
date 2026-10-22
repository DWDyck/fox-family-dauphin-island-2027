# Fox Family Dauphin Island 2027

**Live site: [dwdike-maker.github.io/fox-family-dauphin-island-2027](https://dwdike-maker.github.io/fox-family-dauphin-island-2027/)**

A mobile-first family vacation dashboard: the week's meals and plans in one table, live weather, houses and who is staying where, a map, and photos and memories. Installable, works offline after the first visit, with light, dark and auto themes. Plain HTML, CSS and JavaScript: no build, no database. Built as an experiment in using AI to make a genuinely useful family tool.

## Sections
🏖️ This Week · 🗺️ Map · 🌤️ Weather · 🏠 Houses & Family · 📸 Photos & Memories

## Update the content
**Easiest: open `admin.html`** in Chrome or Edge (double-click it on your computer). Click *Connect project folder* once, add or edit events, families, houses, places, photos and memories with simple forms, then *Save*. Photos are resized automatically. Publish with GitHub Desktop or `git add -A; git commit -m "Update"; git push`; the site updates in a few minutes. Free, local, no account or hosting.

Or edit the files in `data/` by hand:

| To change | Edit |
|---|---|
| Trip dates, meals, events | `data/schedule.js` (the only place dates live) |
| Houses, addresses, parking, manager name | `data/houses.js` |
| Who stays where (names only, no phone/email) | `data/families.js` |
| Map places | `data/locations.js` |
| Photos, memories (`year` for past trips) | `data/photos.js`, `data/memories.js`, `images/` |
| Title, year, weather location, timezone | `data/config.js` |

After editing, open `index.html#/check` to catch mistakes. Preview any day with `index.html?today=2027-06-22`. If phones show stale content, bump `VERSION` in `sw.js`.

## Run locally
Open `index.html`, or serve the folder with any static server. Host on GitHub Pages from `main` / root.

## Privacy
This repo is public. The site deliberately has no door, gate or Wi-Fi code fields. Share those privately (text or group chat). The included data is sample placeholder content.

## For contributors and AI agents
See [AGENTS.md](AGENTS.md) for architecture, conventions and the test and deploy workflow, and [REVIEW.md](REVIEW.md) for the design and date-handling review.
