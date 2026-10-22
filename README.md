# Fox Family Dauphin Island 2027

**Live site: [dwdike-maker.github.io/fox-family-dauphin-island-2027](https://dwdike-maker.github.io/fox-family-dauphin-island-2027/)**

A mobile-first family vacation dashboard: the week's meals and plans in one table, live weather, houses and who is staying where, a map, and photos and memories. Installable, works offline after the first visit, with light, dark and auto themes. Plain HTML, CSS and JavaScript: no build, no database. Built as an experiment in using AI to make a genuinely useful family tool.

## Sections
🏖️ This Week · 🗺️ Map · 🌤️ Weather · 🏠 Houses & Family · 📸 Photos & Memories

## Update the content (no code, no git)
1. Open **[app.pagescms.org](https://app.pagescms.org)** (works on a phone) and sign in with GitHub.
2. Pick this repository the first time (it asks permission once). Bookmark the page.
3. Choose **Schedule**, **Families**, **Houses**, **Map places**, **Photos**, **Memories** or **Site settings**, change things in the form, and tap **Save**.

Save commits straight to the repo and the live site updates in 1–5 minutes (hard-refresh a phone if it looks stale). Uploaded photos over 1600 px are shrunk automatically by a GitHub Action. The forms are defined in `.pages.yml`.

Houses, places and families are matched by **name**, so type them exactly (an event's *Where* is a house or place name; *Host* is a family name). Then open the site's `#/check` page: it lists anything that doesn't match, in plain English.

Content lives in `data/*.json` (`schedule`, `houses`, `families`, `locations`, `photos`, `memories`, `config`); you can also edit those by hand on github.com. Preview a day with `?today=2027-06-22`.

## Run locally
Open `index.html`, or serve the folder with any static server. Host on GitHub Pages from `main` / root.

## Privacy
This repo is public. The site deliberately has no door, gate or Wi-Fi code fields. Share those privately (text or group chat). The included data is sample placeholder content.

## For contributors and AI agents
See [AGENTS.md](AGENTS.md) for architecture, conventions and the test and deploy workflow, and [REVIEW.md](REVIEW.md) for the design and date-handling review.
