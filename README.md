# Åse Steinsland numerology intake portal

This repository hosts the Angular implementation of Åse Steinsland’s numerology intake experience. It condenses all of Åse’s calculators into a guided, English-only wizard that captures client details, visualises every derived number, and links directly to the official order flows.

## Features

* Four-step intake wizard that collects names, birth details, contact information, and client intentions with inline validation and progress tracking.
* Comprehensive numerology engine ported from Åse’s original workflow, including bridge, balance, transit, essence, pinnacle, challenge, and practical number calculations.
* DNA-style breakdown visuals, tabular cycle summaries, and an instant PDF export of the short analysis.
* Theme toggle for day/night modes, flat orange visual identity inspired by numerologensverden.no, and an order page that deep-links to Åse’s official packages.

## Prerequisites

* Node.js 18+ (the project is developed against Node 20).
* npm 9+ (ships with recent Node releases).

Install dependencies after cloning:

```bash
npm install
```

## Run locally

```bash
npm start
```

The dev server boots at <http://localhost:4200>. Angular’s live reload will refresh the browser as you edit components or styles.

## Build for production

```bash
npm run build
```

Optimised assets are emitted to `dist/setaei`. Deploy the contents of that folder to `tall.setaei.com` (or any static host) for production.

### Publish to GitHub Pages / `tall.setaei.com`

The repository is configured to serve the compiled site from the `docs/` directory so GitHub Pages can host it directly on `tall.setaei.com`.

```bash
npm run build:docs
```

The command rebuilds the Angular bundle, refreshes `docs/` with the latest assets, and writes the `CNAME`/`404.html` helpers required by GitHub Pages. Commit and push the updated `docs/` folder to publish the newest theme in the browser.

## PDF rendering notes

The short analysis export relies on `html2canvas` and `jspdf`. These introduce CommonJS dependencies (via `canvg`) which are acknowledged in the Angular configuration. The warnings can be safely ignored and do not affect runtime behaviour.

## Further reading

* [Angular CLI documentation](https://angular.io/cli)
* [html2canvas documentation](https://html2canvas.hertzen.com/)
* [jsPDF documentation](https://github.com/parallax/jsPDF)
