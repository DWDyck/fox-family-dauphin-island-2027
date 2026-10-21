# Fox Family Dauphin Island 2027

One simple source of truth for the trip: schedule, meals, houses, map, photos, memories.

## Run
```
npm install
npm start            # http://localhost:3000
```
Environment variables: `ADMIN_PASSWORD` (default `fox2027` – **change it**), `SITE_PASSCODE` (optional family passcode that protects door/Wi-Fi codes), `PORT`.
All content lives in `data.json` (one array per table). Edit it by hand in any text editor while the server is stopped, or use the admin pages. Back up `data.json` and `uploads/`.

## Stack (and why)
Node + Express + a plain `data.json` file (no database), vanilla JS single-page front end (no build step), Leaflet/OpenStreetMap for maps (no API key), Open-Meteo for weather (no API key). One process, two folders of data, nothing to compile.

## Site architecture / page hierarchy
```
Header + Latest Updates banner (every page) + bottom tab bar (top bar on desktop)
#/            Home (today, meal highlight, coming up, weather, featured photo, quick links)
#/calendar    Calendar (filters: confirmed, tentative, meals, excursions, beach, arrival, departure)
#/map[/id]    Island map (filters, popups with related events)
#/meals       Meals & Gatherings
#/houses[/id] House Information Center (+ mini map per house)
#/family      Directory (who is staying where)
#/gallery     Photo albums + lightbox
#/memories    Scrapbook: favorites, group photos, highlights, stories, moments
#/more        Full menu on phones
#/admin/...   Organizer tools (password)
```

## Data tables (`data.json`)
| table | key columns |
|---|---|
| updates | message, active, created_at |
| locations | name, category(house/restaurant/grocery/beach/activity/gathering), address, description, lat, lng |
| houses | name, address, location_id→locations, wifi_name/password, door_code, gate_code, parking, manager_name/phone, notes |
| families | name, photo, members, phone, email, house_id→houses |
| events | title, date, time, location_id, location_text, description, host_family_id, notes, category(plan/meal/excursion/beach/arrival/departure), status(confirmed/tentative), meal_type |
| albums / photos | album name+sort; photo album_id, url, caption, featured |
| memories | kind(highlight/story/moment), title, body, author, photo_url |

"Confirmed/Tentative Plans" are the `status`; other calendar categories are `category`.

## Components (`public/app.js`)
`eventCard`, `photoTile`/lightbox, `avatar`, `weather`, page renderers (`pages.*`), a config-driven admin (`ADMIN` field definitions generate every list + form), `api()` helper, hash router.
API: `GET /api/all`; admin-only `POST/PUT/DELETE /api/:table[/:id]`, `POST /api/upload/image`.

## Admin workflows (`#/admin`, or "Organizer" under More)
- **Post update**: Organizer home → type message → Post. Delete/hide under Updates.
- **Add/edit event**: Events → Add new / Edit; set Status to Tentative or Confirmed; flip it later when plans firm up. Edit buttons also appear on event cards when logged in.
- **House info**: Houses → Edit. **Family**: Family → Add (upload photo, pick house).
- **Map place**: Map places → Add; tap the mini map to set the pin.
- **Photos**: Albums → Photos → Add (upload from phone camera roll). Check "Feature on home page" for the home photo.
- **Memories**: Memories → Add highlights, stories, moments.

## Wireframes (mobile)
```
+----------------------+   +----------------------+   +----------------------+
| 🌊 Fox Family        |   | 🌊 Fox Family        |   | 🌊 Fox Family        |
| 📣 LATEST UPDATES    |   | 📣 LATEST UPDATES    |   | 📣 LATEST UPDATES    |
| • Seafood boil 6 PM  |   | [All][Confirmed][..] |   | [All][🏠][🍤][🛒]..  |
| Welcome! Wed Jun 16  |   | WED JUN 16           |   | +------------------+ |
| [Cal][Map][Meals]..  |   | ┃ ✔ Confirmed        |   | |   Leaflet map    | |
| Today                |   | ┃ Cookout  5:30 PM    |   | |  🏠 big orange   | |
| ┃ Event card         |   | ┆ ⏳ Tentative (dash) |   | |  pins, popups    | |
| 🍽️ Meal highlight   |   | ┆ Dolphin Cruise     |   | +------------------+ |
| Coming up / Weather  |   |                      |   |                      |
| Featured photo       |   |                      |   |                      |
| [🏠][📅][🗺️][🍽️][☰] |   | [🏠][📅][🗺️][🍽️][☰] |   | [🏠][📅][🗺️][🍽️][☰] |
+----------------------+   +----------------------+   +----------------------+
```
Desktop: same content, max-width 960px, tab bar becomes a row of pills under the header.

## Sample data
Seeded in `data.json` (3 houses, 3 families, 10 places, 12 events for Jun 12–19, 2027, 6 albums). All names, codes and addresses are placeholders – replace via admin. Trip dates are the `TRIP` constant at the top of `public/app.js`.

## Scope
Intentionally excludes social feeds, messaging, live location, check-ins, polls, RSVP, tasks and packing lists.
