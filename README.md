# Tulip Maps — BETA (staging)

Plan a route, draw a roadbook. Record the route on the phone, draw it up on the web.
Its own thing — for rallies, tours, or any drive worth writing down.

Tulip Maps used to live inside the Virtual Marshal codebase. It's now its own
project. Virtual Marshal (Rally Control) is purely the **competition** side —
timing, scoring, live results. The handoff between them is a file: you build the
route and roadbook here, export **GPX** (or `.vmr`), and upload it into an event.

## What's in here

- **`web/`** — the roadbook drawing tool. A standalone web page: open it and go,
  no login, no server. This is what `tulipmaps.com` serves.
- **`app/`** — *(coming next)* the phone app that records a route survey and
  exports it for the web tool. (Currently still in the Virtual Marshal repo as
  `recce_app`, renamed to Tulip Maps; it moves here with its ID + platform folders
  sorted, once it's been build-tested.)

## Running the web tool

It's a static site — no build step.

- **Just open it:** double-click `web/index.html`.
- **Or serve it** (needed if a browser blocks local file loads):
  `cd web && python3 -m http.server 8080`, then open `http://localhost:8080`.

It needs the internet (it pulls map tiles and a few libraries as it runs). The
road-sign images are bundled in `web/signs/`.

## Hosting it

`web/` is a plain static site, so it hosts anywhere static: GitHub Pages,
Cloudflare Pages, Netlify. Point `tulipmaps.com` at that. Nothing depends on the
Virtual Marshal server any more — that's the whole point of the split.

## The file it hands to Rally Control

Export a route as **GPX** (opens anywhere) or **`.vmr`** (Tulip Maps' own richer
format, carries waypoints + notes). Rally Control imports either on an event's
Builder tab. The `.vmr` format is a shared contract between the two — its XML
namespace (`thevirtualmarshal.com/vmroute`) is deliberately left as-is so old files
and Rally Control's importer keep working.
