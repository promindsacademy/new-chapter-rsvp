# New Chapter RSVP

Static RSVP invitation page for Prominds Academy's VSQ Office Grand Opening (3 Oct 2026).
Hosted on GitHub Pages so it works for anonymous guests with no Claude/Google login required.

## Setup (one-time)

1. Open the "20261003 Prominds VSQ Office Grand Opening" Google Sheet.
2. Extensions > Apps Script, delete the default code, paste in `Code.gs`.
3. Deploy > New deployment > Web app
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy the resulting `/exec` URL.
5. In `script.js`, replace `__APPS_SCRIPT_URL__` with that URL, commit.
6. Settings > Pages > enable Pages for the `main` branch (root).

## Files

- `index.html` — page markup
- `style.css` — all styling
- `script.js` — star field animation, form submit, tally, calendar download
- `logo.png` — Prominds logo lockup (resized for web)
- `Code.gs` — Google Apps Script backend (paste into the target Sheet, not run from this repo)
