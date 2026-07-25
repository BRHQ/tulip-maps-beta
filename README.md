# Tulip Maps — the BETA site (beta.tulipmaps.com)

Plan a route, draw a roadbook. Record the route on the phone, draw it up on the web.
Its own thing — for rallies, tours, or any drive worth writing down.

Tulip Maps used to live inside the Virtual Marshal codebase. It's now its own
project. Virtual Marshal (Rally Control) is purely the **competition** side —
timing, scoring, live results. The handoff between them is a file: you build the
route and roadbook here, export **GPX** (or `.vmr`), and upload it into an event.

## This is one of two repos

- `tulip-maps` → `tulipmaps.com`, the real site
- **this one** → `beta.tulipmaps.com`, the playground

**All work starts here.** The `UPDATE Tulip Maps beta` button publishes this
repo. Then, once beta looks right, the `PUSH Tulip Maps live` button copies this
repo onto the live one and publishes that. Both sit side by side on the Mac in
`~/Claude/TulipMaps/tulip-maps-studio/`.

This site is deliberately hidden from Google — `web/robots.txt` blocks
everything. The live one is crawlable instead.

## What's in here

Everything published lives under **`web/`**:

- **`web/index.html`** — the landing page, what you get at beta.tulipmaps.com
- **`web/app/`** — the roadbook drawing tool, at beta.tulipmaps.com/app/. The
  road-sign images are bundled beside it in `web/app/signs/`.
- **`web/guides/`** — the written guides
- **`web/sw.js`**, **`web/manifest.webmanifest`**, **`web/icons/`** — what lets
  the tool be installed on a phone and opened without a connection

The **phone app is not in this repo** and never will be — it's a separate product
in its own repo, `BRHQ/tulip-maps-app`.

## Running it on the Mac

It's a static site — no build step.

- **Quickest:** double-click `web/app/index.html` to open the tool.
- **Properly** (needed to see the landing page, guides and links working as they
  do on the real site): `cd web && python3 -m http.server 8080`, then open
  `http://localhost:8080`.

It needs the internet — map tiles, place search and road-following all come from
elsewhere as it runs.

## Publishing

GitHub Pages, from `web/`. **Pushing to `main` IS the deploy** — there's no
separate step and no server to log into. It goes live about a minute later.
`web/CNAME` is what points the domain here, so don't delete it.

## It does use one server

Road-following, place search and elevation go through **our own server**:

    https://thevirtualmarshal.com/api/ors/...

which holds the routing key privately. **Never put a key in this repo** — it's
public, and anything in a web page is readable by any visitor anyway. If routing
ever needs changing, change the `ORS_BASE` line in `web/app/index.html`, not a key.

(Planned: move that address to `api.tulipmaps.com`, so Tulip Maps stops referring
to Virtual Marshal. Needs one DNS record first.)

## The file it hands to Rally Control

Export a route as **GPX** (opens anywhere) or **`.vmr`** (Tulip Maps' own richer
format, carries waypoints + notes). Rally Control imports either on an event's
Builder tab. The `.vmr` format is a shared contract between the two — its XML
namespace (`thevirtualmarshal.com/vmroute`) is deliberately left as-is so old files
and Rally Control's importer keep working.
