# Fox Family Dauphin Island 2027

A simple, mobile-first vacation hub: today's plans, calendar, meals, houses, family directory, map, photos and memories.
**100% static** - no Node, no build, no database. Works by opening `index.html` and deploys as-is to GitHub Pages.

## File structure
```
index.html            page shell (header, banner, nav, script tags)
styles.css            all styling (coastal theme, print styles)
sw.js                 optional offline cache (only active on https)
manifest.webmanifest  lets phones "Add to Home Screen"
data/                 <-- THE ONLY FILES YOU NORMALLY EDIT
  config.js           trip dates, welcome text, map center, "last updated"
  updates.js          Latest Updates banner
  events.js           calendar + meals
  houses.js           rental houses (also become map pins)
  locations.js        restaurants, groceries, beaches, activities
  families.js         family directory
  photos.js           albums + gallery photos
  memories.js         highlights, stories, moments
images/               photos and icons you add
js/
  util.js             helpers, lookups, lazy Leaflet loader
  components.js       event cards, gallery viewer, weather, add-to-calendar, copy buttons
  pages.js            one function per page
  app.js              router, nav, updates banner, text-size toggle
```

## How to update the site
1. Open the file in `data/` in any text editor (each one starts with a comment explaining the fields).
2. Copy an existing line, change the text, save.
3. Open `index.html` in a browser to check it, then commit and push to GitHub. The site updates in about a minute.

Common jobs:
- **Post a change**: add a line at the top of `data/updates.js`.
- **Tentative -> confirmed**: change `status: 'tentative'` to `'confirmed'` in `data/events.js`.
- **Add a photo**: put the file in `images/`, add a line to `data/photos.js`.
- **Real house info**: edit `data/houses.js`. NOTE: if the repository is public, door/Wi-Fi codes are public. Make the repo private (GitHub Pages then needs a paid plan) or keep codes out of it.

## Run locally
Double-click `index.html`. (The map and weather need internet.)

## Deploy to GitHub Pages
Repository -> Settings -> Pages -> Source: "Deploy from a branch" -> `main` / `(root)`. The site appears at `https://<user>.github.io/<repo>/`. A custom domain can be added on the same page.

## Notes
- Navigation uses `#/page` links, so no server rewrites are needed.
- Map: Leaflet + OpenStreetMap (downloaded only when the map is opened). Weather: Open-Meteo. Neither needs a key.
- If you change site code after people have visited, bump `VERSION` in `sw.js`.
