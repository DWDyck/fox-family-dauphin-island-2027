# Fox Family Dauphin Island 2027

## 🌐 Live site: [dwdike-maker.github.io/fox-family-dauphin-island-2027](https://dwdike-maker.github.io/fox-family-dauphin-island-2027/)

> **About this project:** an experiment in using AI to build interesting web use cases. Here the use case is a family trip hub: schedule, houses, map, photos and memories in one installable, offline-capable page.

A static, mobile-first vacation hub. No Node, no build, no database. Open `index.html` locally, or host on GitHub Pages (Settings > Pages > `main` / root).

## Where to update what

| To change... | Edit |
|---|---|
| Events, meals, dinners, trip dates | `data/schedule.js` (the only place dates live) |
| Latest Updates banner | `data/updates.js` |
| Houses (address, Wi-Fi, codes, lat/lng) | `data/houses.js` |
| Restaurants, stores, beaches, activities on the map | `data/locations.js` |
| Families and who stays where | `data/families.js` |
| Photos and albums | `data/photos.js` + files in `images/` |
| Memories | `data/memories.js` |
| Title, year, welcome text, weather, timezone | `data/config.js` |

After editing, commit and push; Pages updates in 1-2 minutes. Bump `VERSION` in `sw.js` if phones keep showing old content.

## Schedule model (`data/schedule.js`)

Each day is `{ date: 'YYYY-MM-DD', title, dinner?, events: [...] }`. The day's `date` is the only date; events do not repeat it. Trip start/end and day count are derived from the first and last day. Event fields: `title, time, category, status ('confirmed' | 'tentative'), location, host, mealType, description, notes, id`. Set `dinner: false` for a day with no dinner, or `dinner: 'text'` to show a note instead of "Not planned yet". A meal at 3 PM or later (not breakfast/lunch) counts as dinner.

## Checks and previews

- `#/check` (footer link "Data check") validates dates, weekdays, ids, hosts, locations and lists dinner gaps. Open it after every edit.
- `?today=2027-06-22` before the `#` previews the site as if it were that day, e.g. `index.html?today=2027-06-22`.

## Real house addresses

In `data/houses.js` replace the `address`, then delete `lat`/`lng`. The map looks the address up (needs internet) and caches the result in the browser. Or paste exact coordinates to skip lookup.

## Privacy

This repo is public. Do not commit real door, gate or Wi-Fi codes unless you accept that anyone can read them.

## Structure

```
index.html  styles.css  sw.js  manifest.webmanifest
data/   config, updates, houses, locations, families, schedule, photos, memories
js/     util (dates, icons, helpers), components, check, pages, app (router/nav)
images/
```
