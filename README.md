# Shinzuu portfolio

Site files for the portfolio of Nishadul "Shinzuu" Islam.

**Live site:** https://shinzuu.asktechguy.com/

This repo is a backup of the page as it is built: one static `index.html` with its images. The live site is hosted
on HighLevel; this copy is not deployed anywhere.

## What is here

| Path | What |
|---|---|
| `index.html` | The whole page: markup, styles and scripts inlined |
| `src/page.css`, `src/page.js`, `src/scene.js` | The same styles and scripts as readable files |
| `media/` | Screenshots of the featured projects and photos of hardware builds |
| `posters/` | Still frames of the 3D scene, shown before WebGL starts and when it is off |
| `posters-v8/` | Thumbnails for the project grid |

## Run it locally

```bash
python3 -m http.server 8000
# then open http://127.0.0.1:8000/
```

The contact form and booking calendar are HighLevel widgets. Their ids are replaced with `YOUR_FORM_ID` and
`YOUR_CALENDAR_ID` here, so those two frames stay empty in a local copy. Everything else works offline except the
fonts and libraries, which load from Google Fonts and jsDelivr.

## Third-party code and fonts

| Name | Version | Licence |
|---|---|---|
| three.js (and its postprocessing addons) | 0.186.1 | MIT |
| GSAP, ScrollTrigger, SplitText, Flip | 3.15.0 | GSAP Standard "no charge" licence (https://gsap.com/standard-license) |
| Lenis | 1.3.27 | MIT |
| Geist, Geist Mono | Google Fonts | SIL Open Font License 1.1 |

None of these are copied into this repo; the page loads them from their CDNs.

## Licence

Copyright © 2026 Nishadul Islam. All rights reserved. See `LICENSE`.
