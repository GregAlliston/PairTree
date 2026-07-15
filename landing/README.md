# diycraftparty — landing page

A fully self-contained, single-file landing page (`index.html`) for
**diycraftparty**, DIY craft party kits delivered across the UK.

No build step, no dependencies, no external requests — fonts (Fraunces +
Quicksand) are embedded as data URIs and all illustrations are inline SVG.

## View it

Open `landing/index.html` directly in a browser, or serve it:

```bash
npx serve landing
```

## Deploy

Drop the folder on any static host (Vercel, Netlify, GitHub Pages, S3…).
It's one HTML file — nothing to configure.

## Design notes

Derived from the original mockup, with these best-practice adjustments:

- **Contrast**: pastel brand colours kept for fills; text uses darkened,
  WCAG-friendly versions (teal `#177E69`, raspberry `#CE2F66`, cocoa `#38272B`).
- **One CTA colour**: butter yellow `#FFD34D` for every primary action.
- **Type system**: Fraunces (display) + Quicksand (body), consistent scale.
- **Restrained decoration**: confetti only in the hero and newsletter band.
- **Trust signals added**: star rating, testimonial, prices, delivery bar.
- Semantic HTML, keyboard focus states, `prefers-reduced-motion` respected.
