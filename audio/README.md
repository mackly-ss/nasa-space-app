# Narration audio

The documentary ("Watch the documentary") plays one audio file per scene. Drop the files in this folder with **exactly** these names. Any scene without a file still works: it shows the subtitles and runs on a reading timer.

## Format

- **MP3**, mono, 44.1 kHz, 96–128 kbps (keeps the whole set under ~4 MB)
- One file per scene. Start speaking within ~0.3 s; leave no more than ~0.5 s of silence at the end (the player adds a 1.5 s pause between scenes)
- Target pace ~140 words per minute, so the full cut runs about **3 minutes**

## Voice direction

Calm, warm, unhurried documentary narrator, for listeners aged 13–17. Treat it like a nature documentary, not a news report. Pause briefly after dates ("July 20, 1969.") and before the last sentence of each scene, which is the emotional beat. Read the quotes plainly, without acting them out.

## Script

| # | File | Script |
|---|------|--------|
| 1 | `ch1-moon.mp3` | Chapter One. The Shore. For six and a half years, the Moon was a place we went. Twelve people walked on it. Every crew left the same way: lifting off in the top half of their spacecraft, and leaving the bottom half behind in the dust. Nothing up there rusts. Nothing rots. |
| 2 | `apollo-11.mp3` | July 20, 1969. Neil Armstrong and Buzz Aldrin spent about two and a half hours outside. When they left, the lower half of their lander, Eagle, stayed behind as a launch pad. It is still there, with a plaque on its leg: "We came in peace for all mankind." |
| 3 | `apollo-17.mp3` | December 1972. The last crew drove their rover thirty-six kilometres, and fixed a broken fender with maps and duct tape. Before climbing aboard, Gene Cernan said: "We leave as we came and, God willing, as we shall return." No one has stood on the Moon since. |
| 4 | `ch2-mars.mp3` | Chapter Two. The Long Shift. No one has ever stood on Mars. Everything there was built to work alone, so far away that a message takes minutes to arrive. Again and again, these machines were promised a few months of life. Again and again, they refused to stop. |
| 5 | `opportunity.mp3` | Opportunity was built to last ninety days. It lasted more than fourteen years, and drove farther than a marathon. Then, in 2018, a dust storm swallowed the planet and blotted out the Sun. Engineers sent more than a thousand messages. None was ever answered. |
| 6 | `ingenuity.mp3` | April 2021. For thirty-nine seconds, something flew on another planet. Ingenuity was meant to try five short hops. It flew seventy-two times. Tucked beneath its solar panel is a scrap of fabric from the Wright brothers' first airplane. |
| 7 | `ch3-deep.mp3` | Chapter Three. The Drift. Not everything we send comes to rest on a world. Some spacecraft circle silent places in the asteroid belt. Two are leaving the Sun behind forever. No one will ever bring them home. They were built knowing that. |
| 8 | `pioneer-10.mp3` | Pioneer 10 was the first spacecraft to cross the asteroid belt and fly past Jupiter. Its last faint signal reached Earth in 2003. Bolted to its frame is a plaque: a picture of two people, and a map of where they live. Just in case. |
| 9 | `epilogue.mp3` | Archaeologists learn about people from what they leave behind. Out here, every object is a moment frozen in place: a plaque, two golf balls, a family photograph in the grey dust. One day, someone may kneel beside Opportunity and brush the dust from its solar panels. Until then, they wait exactly where we left them. Abandoned. Not forgotten. |

The script lives in `DOCUMENTARY` in `js/data.js`. If you change a line there, re-record that file so the subtitles match the audio.
