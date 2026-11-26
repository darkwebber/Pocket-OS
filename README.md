# Pocket OS

A paper operating system for a single A6 notebook. Two printable pages (each fits one A4 sheet), plus a filled sample notebook you can page through.

| Page | What it is |
| --- | --- |
| [`index.html`](index.html) | **Notebook setup** — about 15 minutes, done once. |
| [`30-day.html`](30-day.html) | **First 30 days** — the minimum daily practice, plus the weekly review. |
| [`notebook.html`](notebook.html) | **Sample notebook** — a virtual A6 dot-grid notebook (kraft cover, thread-bound, 80 pages) filled with eight weeks of the system in use. Turn pages by tapping, swiping, dragging or with the arrow keys. |

## The idea

Set up the minimum, then write today's `FIRST:` and start it.

Capture first. One home per action. Leave `NEXT:` when stopping.
Missed days: restart, don't repair.

## Local preview

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# http://localhost:8000
```

## Structure

```
index.html    Notebook setup (site root)
30-day.html   First 30 days
notebook.html       Sample notebook (page-turning viewer)
notebook.js         Page-turn engine: 3D leaves, drag/swipe, spread or single-page view
notebook-pages.js   The notebook's content, one entry per page, in a small line markup
favicon.svg   Notebook mark used as the site icon
manifest.webmanifest  Web app manifest (Add to Home Screen / install)
icons/        PNG icons for iOS, Android and older browsers
              (icon.svg / icon-maskable.svg are their sources)
.nojekyll     Serve files as-is, no Jekyll build
```

No build step and no dependencies. The two printable sheets use no JavaScript; the sample
notebook uses plain JavaScript to turn its pages. The only external request is Google Fonts
(Caveat for the handwriting); everything else (paper, kraft, dot grid, icons) is local.

Deep links: `notebook.html#p42` opens page 42, `#s3` scratch page S3, `#cover`, `#ifc`, `#ibc`, `#back`.

## Deploying

Served by GitHub Pages from the `main` branch root. Push to `main` and the site updates.
