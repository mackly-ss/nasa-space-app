// Relic content. Coordinates are real landing sites (planetocentric, east-positive longitude).
// Sources: NASA NSSDCA and NASA Science mission pages (linked per relic).

const NSSDC = (id) => `https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=${id}`;

// The documentary is told in a prologue, three chapters (one per world) and an epilogue.
export const PROLOGUE = [
  'On the Moon, there is no wind.',
  'A footprint pressed into the dust in 1969 is, in all likelihood, still there.',
  'On Mars, the wind is thin and patient. Slowly, it is covering the machines we sent.',
  'And farther out, a few spacecraft are still falling away from the Sun, carrying pictures of the people who built them.',
  'We call these things abandoned. This is the story of why they are not forgotten.',
];

export const WORLDS = {
  moon: {
    id: 'moon',
    name: 'The Moon',
    chapter: 'I', title: 'The Shore', span: '1966 – 1972',
    blurb: 'Six crews landed here between 1969 and 1972. When they left, they took rocks home and left their machines behind.',
    narration: [
      'For six and a half years, the Moon was a place we went.',
      'First the robots tested the ground. Then twelve people walked on it. Each crew stayed only a few days, and each one left the same way: lifting off in the top half of their spacecraft, and leaving the bottom half standing in the dust.',
      'Nothing up here rusts. Nothing rots. What they left is still exactly where they left it.',
    ],
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    chapter: 'II', title: 'The Long Shift', span: '1976 – 2024',
    blurb: 'No human has walked here yet, but our robots have. Some drove for years. All of them are still where they stopped.',
    narration: [
      'No one has ever stood on Mars.',
      'Everything here was built to work alone, so far from home that a message takes many minutes to arrive. Again and again, these machines were promised a few months of life.',
      'Again and again, they refused to stop.',
    ],
  },
  deep: {
    id: 'deep',
    name: 'Deep Space',
    chapter: 'III', title: 'The Drift', span: '1972 – today',
    blurb: 'Some relics never landed anywhere. They orbit silent worlds or drift outward forever.',
    narration: [
      'Not everything we send comes to rest on a world.',
      'Some spacecraft circle silent places in the asteroid belt. One follows Earth around the Sun, falling a little farther behind every year. Two are leaving the Sun behind for good.',
      'No one will ever bring them home. They were built knowing that.',
    ],
  },
};

export const EPILOGUE = {
  title: 'What We Leave Behind',
  paragraphs: [
    'Archaeologists learn about people from what they leave behind: a hearth, a tool, a footprint in the mud.',
    'Out here, every object is a moment frozen in place. A plaque bolted to a ladder. Two golf balls. A photograph of a family, face up in the grey dust. A helicopter standing where it last touched down.',
    'In 2020, the United States passed the One Small Step to Protect Human Heritage in Space Act, so that missions working with NASA on the Moon must respect the places where Apollo landed. For the first time, a footprint became something worth protecting by law.',
    'Artemis will take people back to the Moon. One day, someone may kneel beside Opportunity and brush the dust from its solar panels.',
    'Until then, they wait exactly where we left them.',
  ],
  closing: ['Abandoned.', 'Not forgotten.'],
};

export const RELICS = [
  /* ------------------------------ THE MOON ------------------------------ */
  {
    id: 'surveyor-1', world: 'moon', type: 'lander',
    did: "Tested whether the Moon's ground was solid enough to land on.",
    name: 'Surveyor 1', mission: 'Surveyor program', year: 1966,
    place: 'Flamsteed crater, Ocean of Storms', lat: -2.47, lon: -43.34,
    status: 'Silent since 1967',
    narration: "June 1966. No one knew whether the Moon's surface would hold a spacecraft up, or swallow it like quicksand.",
    story: "Some scientists feared the Moon was covered in deep, loose dust. Surveyor 1 was sent to find out. It came down on three legs in the Ocean of Storms, and it stayed standing. Then it got to work, sending home more than 11,000 pictures: the first close-up views of the ground that astronauts would one day walk on.",
    left: ['Surveyor 1 lander', 'TV camera', 'Solar panel'],
    fact: 'Surveyor 1 was the first American spacecraft to land gently on another world instead of crashing, beating the first Apollo landing by three years.',
    source: 'https://science.nasa.gov/mission/surveyor-1/',
  },
  {
    id: 'apollo-11', world: 'moon', type: 'lander',
    did: "Carried the first two people down to the Moon and back up.",
    name: 'Apollo 11 · Eagle', mission: 'Apollo 11', year: 1969,
    place: 'Tranquility Base, Sea of Tranquility', lat: 0.674, lon: 23.473,
    status: 'Its mirror is still used today',
    narration: "July 20, 1969. Two people stepped onto the Sea of Tranquility. They stayed outside for about two and a half hours.",
    story: "When it was time to go, Eagle split in two. The top half carried Neil Armstrong and Buzz Aldrin back up to orbit. The bottom half, which had carried them down, became their launch pad and stayed behind. It still stands there, with a steel plaque on its leg: \"We came in peace for all mankind.\" The flag, blown over by the engine blast as they left, lies nearby.",
    left: ['Bottom half of the Eagle lander (descent stage)', 'Plaque', 'US flag', 'Laser mirror (retroreflector), still used today', 'Moonquake detector (seismometer)', "The astronauts' overshoes", 'A patch honouring the Apollo 1 crew, who died in a fire', 'A tiny disc with goodwill messages from 73 world leaders'],
    fact: 'Scientists on Earth still bounce lasers off the mirror Apollo 11 left behind. It shows the Moon drifts about 3.8 cm farther from Earth every year, about as fast as your fingernails grow.',
    source: NSSDC('1969-059C'),
  },
  {
    id: 'apollo-12', world: 'moon', type: 'lander',
    did: "Landed people right next to an older robot so they could study it.",
    name: 'Apollo 12 & Surveyor 3', mission: 'Apollo 12', year: 1969,
    place: 'Ocean of Storms', lat: -3.01, lon: -23.42,
    status: 'Two relics, side by side',
    narration: "November 1969. For the first and only time, astronauts had a robot to visit.",
    story: 'Apollo 12 pulled off a pinpoint landing about 160 metres from Surveyor 3, a robot that had been sitting there since 1967. The astronauts walked over, cut off its camera and some parts, and brought them home so engineers could see what years on the Moon does to metal and glass.',
    left: ['Bottom half of the Intrepid lander (descent stage)', 'Surveyor 3, the robot they visited', 'Science station (ALSEP) that measured moonquakes and more', 'Flag'],
    fact: 'This was the only time astronauts visited a robot that got to another world before them.',
    source: 'https://science.nasa.gov/mission/surveyor-3/',
  },
  {
    id: 'apollo-14', world: 'moon', type: 'lander',
    did: "Took astronauts to collect rocks from the Fra Mauro hills.",
    name: 'Apollo 14 · Antares', mission: 'Apollo 14', year: 1971,
    place: 'Fra Mauro hills', lat: -3.645, lon: -17.471,
    status: 'Golf balls still on the ground',
    narration: "February 1971. Before leaving the Moon, Alan Shepard had one more thing to do. He had a golf club head tucked into his spacesuit.",
    story: 'Alan Shepard was the first American in space, and on the Moon he became its first golfer. He fixed a golf club head to a sample tool and swung at two balls. Astronaut Edgar Mitchell then threw a long scoop handle like a javelin. Their two-wheeled cart, the MET, is still parked nearby.',
    left: ['Bottom half of the Antares lander (descent stage)', '2 golf balls', 'Two-wheeled tool cart (MET)', 'Science station (ALSEP) that measured moonquakes and more', 'Laser mirror (retroreflector), still used today'],
    fact: 'In 2021, an image specialist used modern scans of the Apollo photos to work out where the golf balls landed: about 37 and 22 metres away.',
    source: NSSDC('1971-008C'),
  },
  {
    id: 'apollo-15', world: 'moon', type: 'rover',
    did: "First mission with a Moon buggy, so astronauts could explore farther.",
    name: 'Apollo 15 · Lunar Rover 1', mission: 'Apollo 15', year: 1971,
    place: 'Hadley valley, by the Apennine mountains', lat: 26.13, lon: 3.63,
    status: 'Parked for good',
    narration: "July 1971. For the first time, people on the Moon did not have to walk.",
    story: 'Apollo 15 brought the first car to the Moon: an electric, foldable buggy called the Lunar Roving Vehicle. Dave Scott and Jim Irwin drove it about 28 km across the lunar surface. Before leaving, they parked it so its camera could film their liftoff.',
    left: ['Bottom half of the Falcon lander (descent stage)', 'Moon buggy (Lunar Roving Vehicle)', 'Small statue and plaque honouring astronauts who died', 'The hammer and feather from the falling test', 'Laser mirror (retroreflector), still used today'],
    fact: 'Dave Scott dropped a hammer and a feather at the same moment. With no air in the way, they hit the ground together, just as Galileo predicted.',
    source: NSSDC('1971-063C'),
  },
  {
    id: 'apollo-16', world: 'moon', type: 'rover',
    did: "First landing in the Moon's bright, rugged highlands.",
    name: 'Apollo 16 · Lunar Rover 2', mission: 'Apollo 16', year: 1972,
    place: 'Descartes Highlands', lat: -8.97, lon: 15.50,
    status: 'Parked for good',
    narration: "April 1972. Charlie Duke knelt in the grey dust and set down a photograph of his family.",
    story: "John Young and Charlie Duke explored the bright, rugged highlands and set up the first telescope ever used on another world. Young took the rover on a \"Grand Prix\", a test drive filmed by Duke to see how it handled. Duke's photograph is still there. On the back he wrote: \"This is the family of Astronaut Duke from Planet Earth. Landed on the Moon, April 1972.\"",
    left: ['Bottom half of the Orion lander (descent stage)', 'Moon buggy (Lunar Roving Vehicle)', 'Gold-plated telescope (Far Ultraviolet Camera)', 'Duke family photo', 'Science station (ALSEP) that measured moonquakes and more'],
    fact: 'The telescope was gold-plated and took the first pictures of Earth\'s outer atmosphere glowing in ultraviolet, a kind of light our eyes can\'t see.',
    source: NSSDC('1972-031C'),
  },
  {
    id: 'apollo-17', world: 'moon', type: 'rover',
    did: "The last crewed landing. It brought home more Moon rock than any other mission.",
    name: 'Apollo 17 · Lunar Rover 3', mission: 'Apollo 17', year: 1972,
    place: 'Taurus–Littrow valley', lat: 20.19, lon: 30.77,
    status: 'Last human footprints',
    narration: "December 14, 1972. Gene Cernan climbed the ladder of Challenger. No one has stood on the Moon since.",
    story: 'The last people to walk on the Moon drove their rover about 36 km. When a fender broke, they fixed it with maps, clamps and duct tape. Before climbing aboard Challenger, Gene Cernan said, "We leave as we came and, God willing, as we shall return."',
    left: ['Bottom half of the Challenger lander (descent stage)', 'Moon buggy (Lunar Roving Vehicle)', 'Plaque on the ladder', 'Science station (ALSEP) that measured moonquakes and more', 'The fender they fixed with maps and tape'],
    fact: 'Nobody has stood on the Moon since December 14, 1972. NASA\'s Artemis missions plan to change that.',
    source: NSSDC('1972-096C'),
  },

  /* ------------------------------ MARS ------------------------------ */
  {
    id: 'viking-1', world: 'mars', type: 'lander',
    did: "Tested the soil for signs of life and reported Mars weather.",
    name: 'Viking 1 Lander', mission: 'Viking', year: 1976,
    place: 'Chryse Planitia (the Plains of Gold)', lat: 22.27, lon: -47.95,
    status: 'Silent since 1982',
    narration: "July 20, 1976. Seven years to the day after Eagle landed, a robot opened its eyes on Mars.",
    story: 'On July 20, 1976, exactly seven years after Apollo 11, Viking 1 became the first US spacecraft to land and work on Mars. It photographed a rusty red desert, tested the soil for signs of life and reported the weather for more than six years.',
    left: ['Viking 1 lander', 'Robot arm that scooped up soil', 'Weather station'],
    fact: 'Viking 1 fell silent after a software update by mistake pointed its antenna away from Earth.',
    source: 'https://science.nasa.gov/mission/viking-1/',
  },
  {
    id: 'viking-2', world: 'mars', type: 'lander',
    did: "Did the same job far to the north, where it saw frost.",
    name: 'Viking 2 Lander', mission: 'Viking', year: 1976,
    place: 'Utopia Planitia, a rocky northern plain', lat: 47.64, lon: 134.29,
    status: 'Silent since 1980',
    narration: "September 1976. Far to the north, a second Viking settled onto a plain of rocks, and waited for winter.",
    story: 'Viking 2 landed far to the north on a plain scattered with rocks. During its winters it photographed a thin layer of frost on the ground, the first time anyone had seen ice on Mars\'s surface.',
    left: ['Viking 2 lander', 'Robot arm that scooped up soil', 'Weather station'],
    fact: 'Viking 2 worked for more than 1,300 days before its batteries failed.',
    source: 'https://science.nasa.gov/mission/viking-2/',
  },
  {
    id: 'sojourner', world: 'mars', type: 'rover',
    did: "Tested whether a small rover could drive around and study rocks on Mars.",
    name: 'Pathfinder & Sojourner', mission: 'Mars Pathfinder', year: 1997,
    place: 'Ares Vallis, an ancient flood channel', lat: 19.13, lon: -33.22,
    status: 'Parked for good',
    narration: "Independence Day, 1997. A spacecraft wrapped in airbags hit Mars at highway speed, and bounced.",
    story: 'Pathfinder bounced onto Mars inside giant airbags. Out rolled Sojourner, the first rover on another planet. It was about the size of a microwave oven. It was built to last a week but kept exploring for nearly three months, sniffing rocks nicknamed Barnacle Bill and Yogi.',
    left: ['Pathfinder lander (Carl Sagan Memorial Station)', 'Sojourner rover', 'The airbags it bounced in on'],
    fact: 'Sojourner weighed only 10.6 kg, about as heavy as a large watermelon.',
    source: 'https://science.nasa.gov/mission/mars-pathfinder/',
  },
  {
    id: 'spirit', world: 'mars', type: 'rover',
    did: "Searched rocks for clues that water once flowed on Mars.",
    name: 'Spirit Rover', mission: 'Mars Exploration Rovers', year: 2004,
    place: 'Gusev crater', lat: -14.57, lon: 175.47,
    status: 'Silent since 2010',
    narration: "January 2004. Spirit was promised ninety days.",
    story: 'Spirit was built for a 90-day mission and lasted more than six years. Even after one wheel stopped working, it kept going by driving backwards and dragging the broken wheel. The trench it dug that way uncovered a white mineral called silica. On Earth it forms around hot springs, so Mars may once have had them.',
    left: ['Spirit rover', 'The platform it rolled off after landing', 'Airbags'],
    fact: 'Spirit\'s final home is a sand trap called "Troy". It got stuck there in 2009.',
    source: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
  },
  {
    id: 'opportunity', world: 'mars', type: 'rover',
    did: "Did the same job as its twin, on the other side of Mars.",
    name: 'Opportunity Rover', mission: 'Mars Exploration Rovers', year: 2004,
    place: 'A wide flat plain called Meridiani → Perseverance Valley', lat: -1.95, lon: -5.53,
    status: 'Silent since 2018',
    narration: "June 2018. The sky over Perseverance Valley went dark at noon.",
    story: "Spirit's twin, nicknamed \"Oppy\", drove more than 45 km, farther than a marathon. It found strong evidence that liquid water once soaked this ground. In 2018 a dust storm wrapped the whole planet and blotted out the Sun. Oppy's last message was little more than a report of falling power. Engineers sent more than a thousand commands over the next eight months. None was answered.",
    left: ['Opportunity rover', 'The platform it rolled off after landing', "Heat shield that protected it on the way down through Mars's air"],
    fact: "\"My battery is low and it's getting dark\" was a journalist's way of putting Oppy's final data into words. The rover never said it. But people around the world felt it was true.",
    source: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
  },
  {
    id: 'phoenix', world: 'mars', type: 'lander',
    did: "Dug into the arctic ground to find and test ice.",
    name: 'Phoenix Lander', mission: 'Phoenix', year: 2008,
    place: "Mars's icy far north", lat: 68.22, lon: -125.75,
    status: 'Frozen since 2008',
    narration: "May 2008. Phoenix landed farther north than anything before it, to dig for ice.",
    story: 'Phoenix landed close to Mars\'s north pole to hunt for ice, and found it just a few centimetres under the dirt. When winter came, the lander was buried in frozen carbon dioxide, the same stuff as dry ice. Later photos from orbit showed the weight of the ice had snapped its solar panels.',
    left: ['Phoenix lander', 'Robot arm that dug for ice', 'DVD "library" of stories and art about Mars'],
    fact: 'Phoenix carries a DVD made for future human explorers, with science fiction stories and messages about Mars.',
    source: 'https://science.nasa.gov/mission/phoenix/',
  },
  {
    id: 'insight', world: 'mars', type: 'lander',
    did: "Listened for marsquakes to learn what is inside Mars.",
    name: 'InSight Lander', mission: 'InSight', year: 2018,
    place: 'Elysium Planitia, a flat plain near the equator', lat: 4.50, lon: 135.62,
    status: 'Silent since 2022',
    narration: "For four years, InSight did not move. It just listened.",
    story: 'InSight placed a super-sensitive seismometer on the ground and listened. It heard more than 1,300 marsquakes and even felt meteorites hit the planet. These vibrations let scientists work out the layers inside Mars for the first time, from its crust down to its liquid metal core.',
    left: ['InSight lander', 'Marsquake detector (seismometer)', 'Self-hammering heat probe, nicknamed "the mole" (it got stuck)', 'Dome that kept wind off the quake detector'],
    fact: 'Slowly, red dust settled on InSight\'s solar panels until there was no power left. Its last photo from the surface showed a dusty lander still facing the sky.',
    source: 'https://science.nasa.gov/mission/insight/',
  },
  {
    id: 'ingenuity', world: 'mars', type: 'heli',
    did: "Proved a helicopter can fly in Mars's very thin air.",
    name: 'Ingenuity Helicopter', mission: 'Mars 2020', year: 2021,
    place: 'Jezero crater, an old lake bed', lat: 18.44, lon: 77.45,
    status: 'Grounded since 2024',
    narration: "April 19, 2021. For 39 seconds, something flew on another planet.",
    story: 'Ingenuity was meant to try five short test hops. It flew 72 times instead, about 17 km in total, scouting the way for the Perseverance rover. On its last flight in January 2024 it damaged a rotor blade. It now stands where it landed, a small aircraft on another planet.',
    left: ['Ingenuity helicopter'],
    fact: 'Under its solar panel, Ingenuity carries a stamp-sized piece of fabric from the Wright brothers\' 1903 Flyer.',
    source: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
  },

  /* ------------------------------ DEEP SPACE ------------------------------ */
  {
    id: 'kepler', world: 'deep', body: 'kepler', type: 'probe',
    did: "Searched for planets around other stars.",
    name: 'Kepler Space Telescope', mission: 'Kepler', year: 2009,
    place: 'Orbiting the Sun, trailing behind Earth', status: 'Ran out of fuel in 2018',
    narration: "For nine years, Kepler did one thing. It watched.",
    story: 'Kepler stared at one patch of sky full of stars, watching for tiny dips in their light when a planet passed in front. It found thousands of planets around other stars. When the fuel ran out it was switched off, and it now follows Earth around the Sun, falling slowly farther behind.',
    left: ['Kepler spacecraft'],
    fact: 'Kepler showed that planets are common: most stars in our galaxy probably have at least one.',
    source: 'https://science.nasa.gov/mission/kepler/',
  },
  {
    id: 'near', world: 'deep', body: 'eros', type: 'probe',
    did: "Studied an asteroid up close, then landed on it.",
    name: 'NEAR Shoemaker', mission: 'NEAR', year: 1996,
    place: 'On the surface of asteroid 433 Eros', status: 'Resting on Eros since 2001',
    narration: "February 2001. A spacecraft that was never built to land was asked to try.",
    story: 'NEAR Shoemaker was the first spacecraft to orbit an asteroid. When its mission was nearly over, the team tried something it was never designed for and slowly guided it down to land on Eros. It survived and sent back data from the surface.',
    left: ['NEAR Shoemaker spacecraft'],
    fact: 'Eros is shaped a bit like a peanut and is about 34 km long.',
    source: 'https://science.nasa.gov/mission/near-shoemaker/',
  },
  {
    id: 'dawn', world: 'deep', body: 'ceres', type: 'probe',
    did: "Studied the two biggest objects in the asteroid belt.",
    name: 'Dawn', mission: 'Dawn', year: 2007,
    place: 'Orbiting dwarf planet Ceres', status: 'Silent in orbit since 2018',
    narration: "Dawn ran out of fuel in 2018. It simply kept going around.",
    story: 'Dawn used an electric engine (ion engine) that pushes very gently, but for a very long time, to visit two worlds in the asteroid belt: first Vesta, then Ceres, where it found bright salty spots. When its fuel ran out it went quiet, still circling Ceres. Its orbit was chosen so it won\'t crash for decades.',
    left: ['Dawn spacecraft'],
    fact: 'Dawn was the first spacecraft to orbit two different worlds beyond Earth.',
    source: 'https://science.nasa.gov/mission/dawn/',
  },
  {
    id: 'pioneer-10', world: 'deep', body: 'pioneer10', type: 'probe',
    did: "First to cross the asteroid belt and visit Jupiter.",
    name: 'Pioneer 10', mission: 'Pioneer', year: 1972,
    place: 'Leaving the solar system, toward Aldebaran', status: 'Last heard from in 2003',
    narration: "Bolted to Pioneer 10 is a picture of two people, and a map of where they live.",
    story: 'Pioneer 10 was the first spacecraft to cross the asteroid belt and fly past Jupiter. Now it is coasting out of the solar system with a gold plaque on board that shows who sent it and where from, in case anyone ever finds it.',
    left: ['Pioneer 10 spacecraft', 'Pioneer plaque'],
    fact: 'Pioneer 10 would take about 2 million years to pass the star Aldebaran.',
    source: 'https://science.nasa.gov/mission/pioneer-10/',
  },
  {
    id: 'pioneer-11', world: 'deep', body: 'pioneer11', type: 'probe',
    did: "First to visit Saturn.",
    name: 'Pioneer 11', mission: 'Pioneer', year: 1973,
    place: 'Leaving the solar system, toward Aquila', status: 'Last heard from in 1995',
    narration: "In 1995, Pioneer 11 could no longer turn its antenna toward home. It kept flying anyway.",
    story: 'Pioneer 11 swung past Jupiter and then became the first spacecraft to visit Saturn, flying close to its rings. It went quiet in 1995 and drifts on in the opposite direction from its twin, carrying the same plaque.',
    left: ['Pioneer 11 spacecraft', 'Pioneer plaque'],
    fact: 'The information Pioneer 11 sent back helped plan the route the Voyager probes took through Saturn\'s system.',
    source: 'https://science.nasa.gov/mission/pioneer-11/',
  },
];

export const byId = (id) => RELICS.find((r) => r.id === id);
export const forWorld = (w) => RELICS.filter((r) => r.world === w);

// Coordinates in plain words, e.g. "Near the Moon's equator, on the side that faces Earth".
export function plainPlace(lat, lon, world) {
  const W = world === 'moon' ? "the Moon's" : "Mars's";
  const ns = lat >= 0 ? 'north' : 'south', a = Math.abs(lat);
  const band = a < 10 ? `Near ${W} equator`
    : a < 30 ? `A little ${ns} of ${W} equator`
    : a < 60 ? `In ${W} far ${ns}`
    : `Near ${W} ${ns} pole`;
  return world === 'moon' && Math.abs(lon) < 90 ? `${band}, on the side that faces Earth` : band;
}

export function formatCoord(lat, lon) {
  const la = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lo = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
  return `${la}  ${lo}`;
}

// The documentary cut: 9 scenes, ~3 minutes. `text` is the voiceover script, shown as subtitles.
// Recorded narration goes in audio/<id>.mp3 (see audio/README.md). Without it, scenes run on a reading timer.
export const DOCUMENTARY = [
  { id: 'ch1-moon', kind: 'chapter', world: 'moon',
    text: 'Chapter One. The Shore. For six and a half years, the Moon was a place we went. Twelve people walked on it. Every crew left the same way: lifting off in the top half of their spacecraft, and leaving the bottom half behind in the dust. Nothing up there rusts. Nothing rots.' },
  { id: 'apollo-11', kind: 'relic', relic: 'apollo-11', world: 'moon',
    text: 'July 20, 1969. Neil Armstrong and Buzz Aldrin spent about two and a half hours outside. When they left, the lower half of their lander, Eagle, stayed behind as a launch pad. It is still there, with a plaque on its leg: "We came in peace for all mankind."' },
  { id: 'apollo-17', kind: 'relic', relic: 'apollo-17', world: 'moon',
    text: 'December 1972. The last crew drove their rover thirty-six kilometres, and fixed a broken fender with maps and duct tape. Before climbing aboard, Gene Cernan said: "We leave as we came and, God willing, as we shall return." No one has stood on the Moon since.' },
  { id: 'ch2-mars', kind: 'chapter', world: 'mars',
    text: 'Chapter Two. The Long Shift. No one has ever stood on Mars. Everything there was built to work alone, so far away that a message takes minutes to arrive. Again and again, these machines were promised a few months of life. Again and again, they refused to stop.' },
  { id: 'opportunity', kind: 'relic', relic: 'opportunity', world: 'mars',
    text: 'Opportunity was built to last ninety days. It lasted more than fourteen years, and drove farther than a marathon. Then, in 2018, a dust storm swallowed the planet and blotted out the Sun. Engineers sent more than a thousand messages. None was ever answered.' },
  { id: 'ingenuity', kind: 'relic', relic: 'ingenuity', world: 'mars',
    text: 'April 2021. For thirty-nine seconds, something flew on another planet. Ingenuity was meant to try five short hops. It flew seventy-two times. Tucked beneath its solar panel is a scrap of fabric from the Wright brothers\' first airplane.' },
  { id: 'ch3-deep', kind: 'chapter', world: 'deep',
    text: 'Chapter Three. The Drift. Not everything we send comes to rest on a world. Some spacecraft circle silent places in the asteroid belt. Two are leaving the Sun behind forever. No one will ever bring them home. They were built knowing that.' },
  { id: 'pioneer-10', kind: 'relic', relic: 'pioneer-10', world: 'deep',
    text: 'Pioneer 10 was the first spacecraft to cross the asteroid belt and fly past Jupiter. Its last faint signal reached Earth in 2003. Bolted to its frame is a plaque: a picture of two people, and a map of where they live. Just in case.' },
  { id: 'epilogue', kind: 'epilogue',
    text: 'Archaeologists learn about people from what they leave behind. Out here, every object is a moment frozen in place: a plaque, two golf balls, a family photograph in the grey dust. One day, someone may kneel beside Opportunity and brush the dust from its solar panels. Until then, they wait exactly where we left them. Abandoned. Not forgotten.' },
];
