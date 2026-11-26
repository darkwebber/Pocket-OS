# Pocket OS

A paper operating system for a single A6 notebook. Two pages, both printable on one A4 sheet.

| Page | What it is |
| --- | --- |
| [`index.html`](index.html) | **Notebook setup** — about 15 minutes, done once. |
| [`30-day.html`](30-day.html) | **First 30 days** — the minimum daily practice, plus the weekly review. |

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
favicon.svg   Notebook mark used as the site icon
manifest.webmanifest  Web app manifest (Add to Home Screen / install)
icons/        PNG icons for iOS, Android and older browsers
              (icon.svg / icon-maskable.svg are their sources)
.nojekyll     Serve files as-is, no Jekyll build
```

No build step, no dependencies, no JavaScript. The only external request is Google Fonts;
everything else (paper texture, icons) is local.

## Deploying

Served by GitHub Pages from the `main` branch root. Push to `main` and the site updates.
