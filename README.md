# Meg Selfie · khabat.setaei.com

This repository contains a single-page, image-free experience site for Meg Selfie by Khabat Setaei. The layout is typographic, responsive, and tuned for immersive storytelling without relying on bitmap assets.

## Local development

Open `index.html` in any modern browser. No build steps are required.

```bash
# from the repository root
open index.html # macOS
xdg-open index.html # Linux
start index.html # Windows (PowerShell)
```

## Deployment

Deploy the contents of the repository to the `khabat.setaei.com` subdomain using any static hosting solution. A few options:

- Upload `index.html`, `styles.css`, and `script.js` to your hosting provider and point the DNS record for `khabat.setaei.com` at that host.
- Use GitHub Pages or Netlify by serving the repository root as a static site.

## Customization

All textual content lives in `index.html`. Styling is in `styles.css`, and lightweight interaction (navigation, scroll indicator, dynamic year) is in `script.js`.

The design intentionally avoids `<img>` tags. If you want to introduce imagery later, you can add them while ensuring alt text for accessibility.
