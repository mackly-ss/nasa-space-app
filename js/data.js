// Relic content. Coordinates are real landing sites (planetocentric, east-positive longitude).
// Sources: NASA NSSDCA and NASA Science mission pages (linked per relic).

const NSSDC = (id) => `https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=${id}`;

export const WORLDS = {
  moon: {
    id: 'moon',
    name: 'The Moon',
    blurb: 'Six crews landed here between 1969 and 1972. When they left, they took rocks home and left their machines behind.',
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    blurb: 'No human has walked here yet, but our robots have. Some drove for years. All of them are still where they stopped.',
  },
  deep: {
    id: 'deep',
    name: 'Deep Space',
    blurb: 'Some relics never landed anywhere. They orbit silent worlds or drift outward forever.',
  },
};

export const RELICS = [
  /* ------------------------------ THE MOON ------------------------------ */
  {
    id: 'surveyor-1', world: 'moon', type: 'lander',
    name: 'Surveyor 1', mission: 'Surveyor program', year: 1966,
    place: 'Flamsteed crater, Ocean of Storms', lat: -2.47, lon: -43.34,
    status: 'Silent since 1967',
    story: 'Before anyone could land people on the Moon, NASA had to know one thing: would a spacecraft sink into the dust? Surveyor 1 answered it by touching down gently and standing firm. Then it got to work, sending home more than 11,000 pictures of the ground around it.',
    left: ['Surveyor 1 lander', 'TV camera', 'Solar panel'],
    fact: 'Surveyor 1 was the first American spacecraft to soft-land on another world, beating the first Apollo landing by three years.',
    source: 'https://science.nasa.gov/mission/surveyor-1/',
  },
  {
    id: 'apollo-11', world: 'moon', type: 'lander',
    name: 'Apollo 11 · Eagle', mission: 'Apollo 11', year: 1969,
    place: 'Tranquility Base, Sea of Tranquility', lat: 0.674, lon: 23.473,
    status: 'Retroreflector still in use',
    story: 'Neil Armstrong and Buzz Aldrin spent about two and a half hours walking outside. When they blasted off, the bottom half of their lunar module, Eagle, stayed behind as their launch pad. It is still there, along with a plaque on its leg that reads "We came in peace for all mankind."',
    left: ['Eagle descent stage', 'Plaque', 'US flag', 'Laser retroreflector', 'Seismometer', 'Boots', 'Apollo 1 patch', 'Silicon disc of goodwill messages'],
    fact: 'Scientists on Earth still bounce lasers off the mirror Apollo 11 left behind. It shows the Moon drifts about 3.8 cm farther from Earth every year.',
    source: NSSDC('1969-059C'),
  },
  {
    id: 'apollo-12', world: 'moon', type: 'lander',
    name: 'Apollo 12 & Surveyor 3', mission: 'Apollo 12', year: 1969,
    place: 'Ocean of Storms', lat: -3.01, lon: -23.42,
    status: 'Two relics, side by side',
    story: 'Apollo 12 pulled off a pinpoint landing about 180 metres from Surveyor 3, a robot that had been sitting there since 1967. The astronauts walked over, cut off its camera and some parts, and brought them home so engineers could see what years on the Moon does to metal and glass.',
    left: ['Intrepid descent stage', 'Surveyor 3 lander', 'ALSEP science station', 'Flag'],
    fact: 'This was the only time astronauts visited a robot that got to another world before them.',
    source: 'https://science.nasa.gov/mission/surveyor-3/',
  },
  {
    id: 'apollo-14', world: 'moon', type: 'lander',
    name: 'Apollo 14 · Antares', mission: 'Apollo 14', year: 1971,
    place: 'Fra Mauro highlands', lat: -3.645, lon: -17.471,
    status: 'Golf balls still on the ground',
    story: 'Alan Shepard was the first American in space, and on the Moon he became its first golfer. He fixed a golf club head to a sample tool and swung at two balls. Astronaut Edgar Mitchell then threw a long scoop handle like a javelin. Their two-wheeled cart, the MET, is still parked nearby.',
    left: ['Antares descent stage', '2 golf balls', 'MET handcart', 'ALSEP science station', 'Laser retroreflector'],
    fact: 'In 2021, an image specialist used modern scans of the Apollo photos to work out where the golf balls landed: about 37 and 22 metres away.',
    source: NSSDC('1971-008C'),
  },
  {
    id: 'apollo-15', world: 'moon', type: 'rover',
    name: 'Apollo 15 · Lunar Rover 1', mission: 'Apollo 15', year: 1971,
    place: 'Hadley–Apennine', lat: 26.13, lon: 3.63,
    status: 'Parked permanently',
    story: 'Apollo 15 brought the first car to the Moon: an electric, foldable buggy called the Lunar Roving Vehicle. Dave Scott and Jim Irwin drove it about 28 km across the lunar surface. Before leaving, they parked it so its camera could film their liftoff.',
    left: ['Falcon descent stage', 'Lunar Roving Vehicle', '"Fallen Astronaut" statuette & plaque', 'Hammer & falcon feather', 'Laser retroreflector'],
    fact: 'Dave Scott dropped a hammer and a feather at the same moment. With no air in the way, they hit the ground together, just as Galileo predicted.',
    source: NSSDC('1971-063C'),
  },
  {
    id: 'apollo-16', world: 'moon', type: 'rover',
    name: 'Apollo 16 · Lunar Rover 2', mission: 'Apollo 16', year: 1972,
    place: 'Descartes Highlands', lat: -8.97, lon: 15.50,
    status: 'Parked permanently',
    story: 'John Young and Charlie Duke explored the bright, rugged highlands and set up the first telescope ever used on another world. Their rover hit a record speed of about 18 km/h. Charlie Duke also left a photo of his family on the ground, with a message on the back.',
    left: ['Orion descent stage', 'Lunar Roving Vehicle', 'Far Ultraviolet Camera (telescope)', 'Duke family photo', 'ALSEP science station'],
    fact: 'The telescope was gold-plated and took the first pictures of Earth\'s outer atmosphere glowing in ultraviolet light.',
    source: NSSDC('1972-031C'),
  },
  {
    id: 'apollo-17', world: 'moon', type: 'rover',
    name: 'Apollo 17 · Lunar Rover 3', mission: 'Apollo 17', year: 1972,
    place: 'Taurus–Littrow valley', lat: 20.19, lon: 30.77,
    status: 'Last human footprints',
    story: 'The last people to walk on the Moon drove their rover about 36 km. When a fender broke, they fixed it with maps, clamps and duct tape. Before climbing aboard Challenger, Gene Cernan said, "We leave as we came and, God willing, as we shall return."',
    left: ['Challenger descent stage', 'Lunar Roving Vehicle', 'Plaque on the ladder', 'ALSEP science station', 'Taped-up fender'],
    fact: 'Nobody has stood on the Moon since December 14, 1972. NASA\'s Artemis missions plan to change that.',
    source: NSSDC('1972-096C'),
  },

  /* ------------------------------ MARS ------------------------------ */
  {
    id: 'viking-1', world: 'mars', type: 'lander',
    name: 'Viking 1 Lander', mission: 'Viking', year: 1976,
    place: 'Chryse Planitia', lat: 22.27, lon: -47.95,
    status: 'Silent since 1982',
    story: 'On July 20, 1976, exactly seven years after Apollo 11, Viking 1 became the first US spacecraft to land and work on Mars. It photographed a rusty red desert, tested the soil for signs of life and reported the weather for more than six years.',
    left: ['Viking 1 lander', 'Robotic sampling arm', 'Weather station'],
    fact: 'Viking 1 fell silent after a software update by mistake pointed its antenna away from Earth.',
    source: 'https://science.nasa.gov/mission/viking-1/',
  },
  {
    id: 'viking-2', world: 'mars', type: 'lander',
    name: 'Viking 2 Lander', mission: 'Viking', year: 1976,
    place: 'Utopia Planitia', lat: 47.64, lon: 134.29,
    status: 'Silent since 1980',
    story: 'Viking 2 landed far to the north on a plain scattered with rocks. During its winters it photographed a thin layer of frost on the ground, the first time anyone had seen ice on Mars\'s surface.',
    left: ['Viking 2 lander', 'Robotic sampling arm', 'Weather station'],
    fact: 'Viking 2 worked for more than 1,300 days before its batteries failed.',
    source: 'https://science.nasa.gov/mission/viking-2/',
  },
  {
    id: 'sojourner', world: 'mars', type: 'rover',
    name: 'Pathfinder & Sojourner', mission: 'Mars Pathfinder', year: 1997,
    place: 'Ares Vallis', lat: 19.13, lon: -33.22,
    status: 'Parked permanently',
    story: 'Pathfinder bounced onto Mars inside giant airbags. Out rolled Sojourner, the first rover on another planet. It was about the size of a microwave oven. It was built to last a week but kept exploring for nearly three months, sniffing rocks nicknamed Barnacle Bill and Yogi.',
    left: ['Pathfinder lander (Carl Sagan Memorial Station)', 'Sojourner rover', 'Deflated airbags'],
    fact: 'Sojourner weighed only 10.6 kg, less than a typical car tyre.',
    source: 'https://science.nasa.gov/mission/mars-pathfinder/',
  },
  {
    id: 'spirit', world: 'mars', type: 'rover',
    name: 'Spirit Rover', mission: 'Mars Exploration Rovers', year: 2004,
    place: 'Gusev crater', lat: -14.57, lon: 175.47,
    status: 'Silent since 2010',
    story: 'Spirit was built for a 90-day mission and lasted more than six years. Even after one wheel stopped working, it kept going by driving backwards and dragging the broken wheel. The trench it dug that way uncovered almost pure silica, a clue to ancient hot springs.',
    left: ['Spirit rover', 'Landing platform', 'Airbags'],
    fact: 'Spirit\'s final home is a sand trap called "Troy". It got stuck there in 2009.',
    source: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
  },
  {
    id: 'opportunity', world: 'mars', type: 'rover',
    name: 'Opportunity Rover', mission: 'Mars Exploration Rovers', year: 2004,
    place: 'Meridiani Planum → Perseverance Valley', lat: -1.95, lon: -5.53,
    status: 'Silent since 2018',
    story: 'Spirit\'s twin, nicknamed "Oppy", drove more than 45 km, farther than a marathon. It found strong evidence that liquid water once soaked this ground. In 2018 a planet-wide dust storm blotted out the Sun, and Oppy\'s solar panels couldn\'t charge again.',
    left: ['Opportunity rover', 'Landing platform', 'Heat shield'],
    fact: 'Opportunity was built to last 90 days and lasted more than 14 years.',
    source: 'https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/',
  },
  {
    id: 'phoenix', world: 'mars', type: 'lander',
    name: 'Phoenix Lander', mission: 'Phoenix', year: 2008,
    place: 'Vastitas Borealis (arctic plains)', lat: 68.22, lon: -125.75,
    status: 'Frozen since 2008',
    story: 'Phoenix landed close to Mars\'s north pole to hunt for ice, and found it just a few centimetres under the dirt. When winter came, the lander was buried in carbon dioxide frost. Later photos from orbit showed the weight of the ice had snapped its solar panels.',
    left: ['Phoenix lander', 'Robotic digging arm', 'DVD "library" of stories and art about Mars'],
    fact: 'Phoenix carries a DVD made for future human explorers, with science fiction stories and messages about Mars.',
    source: 'https://science.nasa.gov/mission/phoenix/',
  },
  {
    id: 'insight', world: 'mars', type: 'lander',
    name: 'InSight Lander', mission: 'InSight', year: 2018,
    place: 'Elysium Planitia', lat: 4.50, lon: 135.62,
    status: 'Silent since 2022',
    story: 'InSight placed a super-sensitive seismometer on the ground and listened. It heard more than 1,300 marsquakes and even felt meteorites hit the planet. These vibrations let scientists map Mars\'s crust, mantle and molten core for the first time.',
    left: ['InSight lander', 'SEIS seismometer', 'Heat probe ("the mole")', 'Wind & heat shield'],
    fact: 'Slowly, red dust settled on InSight\'s solar panels until there was no power left. Its last photo from the surface showed a dusty lander still facing the sky.',
    source: 'https://science.nasa.gov/mission/insight/',
  },
  {
    id: 'ingenuity', world: 'mars', type: 'heli',
    name: 'Ingenuity Helicopter', mission: 'Mars 2020', year: 2021,
    place: 'Jezero crater', lat: 18.44, lon: 77.45,
    status: 'Grounded since 2024',
    story: 'Ingenuity was meant to try five short test hops. It flew 72 times instead, about 17 km in total, scouting the way for the Perseverance rover. On its last flight in January 2024 it damaged a rotor blade. It now stands where it landed, a small aircraft on another planet.',
    left: ['Ingenuity helicopter'],
    fact: 'Under its solar panel, Ingenuity carries a stamp-sized piece of fabric from the Wright brothers\' 1903 Flyer.',
    source: 'https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/',
  },

  /* ------------------------------ DEEP SPACE ------------------------------ */
  {
    id: 'kepler', world: 'deep', body: 'kepler', type: 'probe',
    name: 'Kepler Space Telescope', mission: 'Kepler', year: 2009,
    place: 'Orbiting the Sun, trailing behind Earth', status: 'Retired 2018 · out of fuel',
    story: 'Kepler stared at one patch of sky full of stars, watching for tiny dips in their light when a planet passed in front. It found thousands of planets around other stars. When the fuel ran out it was switched off, and it now follows Earth around the Sun, falling slowly farther behind.',
    left: ['Kepler spacecraft'],
    fact: 'Kepler showed that planets are common: most stars in our galaxy probably have at least one.',
    source: 'https://science.nasa.gov/mission/kepler/',
  },
  {
    id: 'near', world: 'deep', body: 'eros', type: 'probe',
    name: 'NEAR Shoemaker', mission: 'NEAR', year: 1996,
    place: 'On the surface of asteroid 433 Eros', status: 'Resting on Eros since 2001',
    story: 'NEAR Shoemaker was the first spacecraft to orbit an asteroid. When its mission was nearly over, the team tried something it was never designed for and slowly guided it down to land on Eros. It survived and sent back data from the surface.',
    left: ['NEAR Shoemaker spacecraft'],
    fact: 'Eros is shaped a bit like a peanut and is about 34 km long.',
    source: 'https://science.nasa.gov/mission/near-shoemaker/',
  },
  {
    id: 'dawn', world: 'deep', body: 'ceres', type: 'probe',
    name: 'Dawn', mission: 'Dawn', year: 2007,
    place: 'Orbiting dwarf planet Ceres', status: 'Silent in orbit since 2018',
    story: 'Dawn used a gentle ion engine to visit two worlds in the asteroid belt: first Vesta, then Ceres, where it found bright salty spots. When its fuel ran out it went quiet, still circling Ceres. Its orbit was chosen so it won\'t crash for decades.',
    left: ['Dawn spacecraft'],
    fact: 'Dawn was the first spacecraft to orbit two different worlds beyond Earth.',
    source: 'https://science.nasa.gov/mission/dawn/',
  },
  {
    id: 'pioneer-10', world: 'deep', body: 'pioneer10', type: 'probe',
    name: 'Pioneer 10', mission: 'Pioneer', year: 1972,
    place: 'Leaving the solar system, toward Aldebaran', status: 'Last signal 2003',
    story: 'Pioneer 10 was the first spacecraft to cross the asteroid belt and fly past Jupiter. Now it is coasting out of the solar system with a gold plaque on board that shows who sent it and where from, in case anyone ever finds it.',
    left: ['Pioneer 10 spacecraft', 'Pioneer plaque'],
    fact: 'Pioneer 10 would take about 2 million years to pass the star Aldebaran.',
    source: 'https://science.nasa.gov/mission/pioneer-10/',
  },
  {
    id: 'pioneer-11', world: 'deep', body: 'pioneer11', type: 'probe',
    name: 'Pioneer 11', mission: 'Pioneer', year: 1973,
    place: 'Leaving the solar system, toward Aquila', status: 'Last signal 1995',
    story: 'Pioneer 11 swung past Jupiter and then became the first spacecraft to visit Saturn, flying close to its rings. It went quiet in 1995 and drifts on in the opposite direction from its twin, carrying the same plaque.',
    left: ['Pioneer 11 spacecraft', 'Pioneer plaque'],
    fact: 'The information Pioneer 11 sent back helped plan the route the Voyager probes took through Saturn\'s system.',
    source: 'https://science.nasa.gov/mission/pioneer-11/',
  },
];

export const byId = (id) => RELICS.find((r) => r.id === id);
export const forWorld = (w) => RELICS.filter((r) => r.world === w);

export function formatCoord(lat, lon) {
  const la = `${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? 'N' : 'S'}`;
  const lo = `${Math.abs(lon).toFixed(2)}° ${lon >= 0 ? 'E' : 'W'}`;
  return `${la}  ${lo}`;
}
