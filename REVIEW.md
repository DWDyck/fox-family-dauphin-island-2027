# Review: Fox Family Dauphin Island 2027

## Date consistency review
Found: dates kept in three places (config trip dates, per-event strings, update dates); arrival/departure events duplicating trip dates; times sorted as text ("10:00 AM" before "8:00 AM"); "today" taken from the viewer's timezone; mixed date formats and locales; free-text `lastUpdated`; banner text hard-coding times and places; undated photos and memories; weather labelled "Today" before the trip; silent dinner gaps (Jun 20, 22, 25).

Fixed: `data/schedule.js` is the single source. Days own the date, events nest under them, trip start/end derive from it. Times sort by minutes. "Today" uses the configured timezone (America/Chicago). All formats are fixed en-US helpers. Banner updates reference an event id so time and place stay in sync. `#/check` verifies Saturday Jun 19 to Saturday Jun 26, 2027, weekdays, duplicates, ordering and references.

## UX review
- Home now centers on the week: next dinner, Today and Tomorrow, 8-day week view, tentative list.
- Dinners are highlighted everywhere with host, house, time and notes; missing dinners are shown explicitly.
- Tentative events use a dashed border plus a text tag (not color alone).
- Redundant quick-nav grid reduced to four links; cards simplified.
- Calendar is secondary ("Detailed Calendar") with day-jump chips.

## Design review
- Emojis removed entirely; replaced by an inline SVG icon set, typography and color.
- Stronger contrast for outdoor use, 44-48px touch targets, visible focus rings, reduced-motion support, current-page marker in nav, print styles.
- Map preserved and polished: SVG pins, labelled house pins, richer popups with related events, grouped place list, address-ready geocoding.

## Data structure recommendations
Keep one file per content type (see README). Reference by id (host, location, event) rather than repeating text. Run `#/check` after edits. If it grows, split schedule by day.

## Modified files
Added: `data/schedule.js`, `js/check.js`, `REVIEW.md`. Removed: `data/events.js`. Rewritten: `js/util.js`, `js/components.js`, `js/pages.js`, `js/app.js`, `styles.css`, `README.md`. Edited: `index.html`, `sw.js`, `data/config.js`, `data/updates.js`, `data/photos.js`, `data/memories.js`.
