# Abandoned, Not Forgotten

An interactive 3D storytelling site about the machines NASA left behind on the Moon, on Mars and in deep space, built for the NASA Space Apps Challenge 2026 challenge *"Abandoned but not Forgotten: Storytelling about NASA's Discarded Equipment on the Moon and Mars"*.

## Experience

- **Documentary narrative**: a cold open, three chapters (*I · The Shore* on the Moon, *II · The Long Shift* on Mars, *III · The Drift* in deep space) and an epilogue, *What We Leave Behind*. Every relic opens with a narrated line.
- **Watch the documentary**: a guided, auto-playing ~3 minute cut (9 scenes: Apollo 11, Apollo 17, Opportunity, Ingenuity and Pioneer 10, plus the chapter cards and epilogue). Subtitles always show; recorded narration plays from `audio/<scene>.mp3` when present (see `audio/README.md`). It has play/pause, skip and mute, and you can take over at any time. The other 15 relics are left to discover in free exploration.
- **Intro**: a low-poly lunar module that shatters into the solar system.
- **Solar system**: the Sun, Earth, Moon, Mars, Ceres and Eros, plus Kepler trailing Earth and Pioneer 10/11 drifting outward. Drag to orbit and scroll to zoom.
- **Surface maps**: click the Moon or Mars to land on a free-roam painterly 3D terrain. Pins show real landing coordinates. Use the altitude slider on the left and the **MAP** button to return.
- **Shard transitions**: inspired by *Species in Pieces*. Triangles gather into a planet portrait, then blow apart to reveal the next world. Story cards morph between low-poly relic portraits.
- **Story cards**: stories written for ages 13–17, a "Left behind" list, a "Did you know?" fact and a link to the NASA record (NSSDCA / NASA Science).
- **Quests**: nine short mysteries, three per chapter (one main quest with 5 clues and two side quests with 3 clues). Each clue points to a relic; opening the right story card solves it, and finishing a quest shows a short ending and earns a stamp. Any quest can be started at any time. Quests are hidden during the documentary.
- **Mission log**: every story card has a writing prompt (written for ages 13–17). Answers save automatically in the browser and are collected, with the quest stamps, under **Quests → Mission log**. Nothing is sent anywhere.
- **Story card tabs**: every relic has **Story**, a four-panel **Comic** (the problem, the clever engineering, the discovery, where it is now), a **Quiz**, and for 16 relics a **Mini game** that plays full screen (land a spacecraft, aim a laser at the mirror, tune a seismometer, assemble a machine, dig for ice or silica, spot hidden things).
- **Messages between machines**: pick up a message at one relic and deliver it by opening another; both machines' words appear.
- **Timeline challenge**: put six relics in date order (button on the timeline bar).
- **Ranks and badges**: ranks rise with relics found (Visitor to Keeper of the Relics); ten badges for quizzes, mini games, messages, quests, the timeline and the mission log, under **Quests → Badges**.
- Comics, quizzes, mini games and messages for the Moon and Mars are adapted from the author's own *ECHO's Lost Memories*; Surveyor 1 and the deep-space probes have new content. None of it appears during the documentary.
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
| `js/learn.js` | Mission log prompts and quest clues |
| `js/extras.js` | Comics, quizzes, mini game settings, messages and ranks |
| `js/games.js` | The mini games |
| `vendor/` | Three.js r160 + OrbitControls (vendored, MIT) |

Terrain and planet textures are procedural. Pin coordinates are real, but the surface maps are stylised and not to scale.

## Credits & AI disclosure

- **Mission data:** courtesy of NASA, from [NSSDCA](https://nssdc.gsfc.nasa.gov/) and [NASA Science](https://science.nasa.gov/).
- **Narration:** AI-generated voice (ElevenLabs).
- **Code, 3D models, illustrations and story text:** generated with AI, using Claude Code (Anthropic).
- **3D engine:** Three.js (MIT).
- Made for the NASA International Space Apps Challenge 2026. Not an official NASA site, and not endorsed by NASA. The 3D models carry no NASA logos, flags or mission patches.

Where the disclosure appears:

| Where | What |
| --- | --- |
| Opening screen, inventory panel | Visible credit line (NASA data, not endorsed, AI disclosure) |
| Epilogue | Full credits block |
| Every screen | Small "AI-generated visuals & narration" watermark (fixed corner), so screenshots and screen recordings carry it |
| `index.html` `<head>` | `ai-disclosure`, `credits`, `dcterms.source` and `dcterms.rights` meta tags |
| `audio/*.mp3` | ID3 `comment`: "AI-generated voice (ElevenLabs). Script written with Claude Code (Anthropic)." |

If you export stills or record a demo video, keep the watermark in frame or add your own.
