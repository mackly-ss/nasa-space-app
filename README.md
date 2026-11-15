# Abandoned, Not Forgotten

An interactive 3D storytelling site about the machines NASA left behind on the Moon, on Mars and in deep space, built for the NASA Space Apps Challenge 2026 challenge *"Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars"*.

## Experience

- **Documentary narrative**: a cold open, three chapters (*I · The Shore* on the Moon, *II · The Long Shift* on Mars, *III · The Drift* in deep space) and an epilogue, *What We Leave Behind*. Every relic opens with a narrated line.
- **Watch the documentary**: a guided, auto-playing tour (about 9 min) that flies to each relic in order. It has play/pause, skip, an optional narrator voice (browser speech) and a progress bar, and you can take over at any time.
- **Intro**: a low-poly lunar module that shatters into the solar system.
- **Solar system**: the Sun, Earth, Moon, Mars, Ceres and Eros, plus Kepler trailing Earth and Pioneer 10/11 drifting outward. Drag to orbit and scroll to zoom.
- **Surface maps**: click the Moon or Mars to land on a free-roam painterly 3D terrain. Pins show real landing coordinates. Use the altitude slider on the left and the **MAP** button to return.
- **Shard transitions**: inspired by *Species in Pieces*. Triangles gather into a planet portrait, then blow apart to reveal the next world. Story cards morph between low-poly relic portraits.
- **Story cards**: friendly, school-age-level stories, a "Left behind" list, a "Did you know?" fact and a link to the NASA record (NSSDCA / NASA Science).
- **Relic inventory** (searchable), **explorer progress** (saved in the browser) and a **relic timeline** from 1966 to 2021.

## Run locally

It's a static site with no build step. Serve the folder over HTTP (ES modules don't load from `file://`):

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Push to GitHub and enable **Settings → Pages → Deploy from branch** at the repo root.

## Structure

| Path | What it does |
| --- | --- |
| `index.html` | Page shell, HUD, card, inventory, timeline, curtain |
| `css/style.css` | All styling |
| `js/main.js` | App state, hash router, transitions, card, inventory, timeline |
| `js/solar.js` | Solar-system scene |
| `js/surface.js` | Procedural Moon/Mars terrain, relic models, pins |
| `js/shapes.js` / `js/shards.js` | Low-poly portraits and the triangle morph engine |
| `js/data.js` | All relic content and sources |
| `vendor/` | Three.js r160 + OrbitControls (vendored, MIT) |

Terrain and planet textures are procedural. Pin coordinates are real, but the surface maps are stylised and not to scale.

## Credits

Mission data courtesy of NASA: [NSSDCA](https://nssdc.gsfc.nasa.gov/) and [NASA Science](https://science.nasa.gov/). Made for the NASA International Space Apps Challenge 2026. Not an official NASA site, and not endorsed by NASA. The acknowledgment appears as visible text (opening screen, inventory, epilogue) and in the page metadata (`<meta name="credits">`, `dcterms.source`, `dcterms.rights` in `index.html`). 3D rendering by Three.js (MIT).
