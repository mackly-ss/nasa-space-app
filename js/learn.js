// Learning layer: mission log prompts (one per relic) and quests (three per chapter).
// Shown only in free exploration, never during the documentary.

export const PROMPTS = {
  // Chapter I · The Moon
  'surveyor-1': "Nobody knew if the ground would hold. Imagine you're on the team waiting for Surveyor 1's first picture. Describe the moment it arrives.",
  'apollo-11': "It's 2080 and you're one of the first visitors to Tranquility Base. What do you see, and how do you feel?",
  'apollo-12': 'Surveyor 3 waited alone for two and a half years before astronauts walked over to it. If it could speak, what would it say to them?',
  'apollo-14': 'Alan Shepard took golf to the Moon. What one small, fun thing would you take, and why?',
  'apollo-15': 'Explain the hammer-and-feather test to a younger friend. Why did they land at the same time?',
  'apollo-16': 'Charlie Duke left a family photo. What would you leave, and what would you write on the back?',
  'apollo-17': 'Gene Cernan said "as we shall return". Write the first words you\'d want the next person on the Moon to say.',
  // Chapter II · Mars
  'viking-1': "A small software mistake ended Viking 1's mission. If you could send it one last message, what would it be?",
  'viking-2': "Viking 2 was the first to see frost on Mars. Describe a Martian winter morning from the lander's point of view.",
  'sojourner': "Write a short diary entry for Sojourner's first day driving on Mars.",
  'spirit': 'Spirit kept going by driving backwards with a broken wheel. Describe a time you found another way to keep going.',
  'opportunity': 'Write the last message you think Oppy would have sent home if it could talk.',
  'phoenix': 'Phoenix carries a DVD for future explorers. What would you add to it for the first people on Mars?',
  'insight': "Explain to a younger sibling how listening for quakes tells us what's inside Mars.",
  'ingenuity': 'Should Ingenuity go to a museum on Earth, or stay where it landed? Give one reason.',
  // Chapter III · Deep Space
  'kepler': "Kepler found thousands of planets around other stars. Describe one you'd like to visit and what makes it special.",
  'near': "NEAR landed even though it wasn't built to. Write the team's message to the spacecraft just before they tried.",
  'dawn': 'Dawn will circle Ceres in silence for decades. Is that a sad ending or a peaceful one? Explain.',
  'pioneer-10': "If someone far away found Pioneer 10's plaque, what's one thing they might misunderstand about us?",
  'pioneer-11': 'Pioneer 11 and its twin are flying in opposite directions forever. Write a short message one might send the other.',
};

export const QUESTS = [
  /* ---------------- Chapter I · The Moon ---------------- */
  {
    id: '1a', world: 'moon', main: true, title: 'The Moon Museum',
    intro: 'A museum wants to plan the first exhibit on the Moon. The curator has a list of objects but no map. Find them.',
    clues: [
      ['Find the robot that tested whether the Moon\'s ground could hold a spacecraft.', 'surveyor-1'],
      ['Find the lander with a plaque that says "We came in peace for all mankind".', 'apollo-11'],
      ['Find the place where two golf balls are still lying on the ground.', 'apollo-14'],
      ['Find the family photograph left in the grey dust.', 'apollo-16'],
      ['Find the Moon buggy whose fender was fixed with maps and tape.', 'apollo-17'],
    ],
    ending: 'The curator reads the list back: a robot, a plaque, two golf balls, a photograph, a taped-up fender. "This isn\'t an exhibit of machines," she says. "It\'s an exhibit of people." The museum will never move them. They are already exactly where they belong.',
  },
  {
    id: '1b', world: 'moon', title: 'The Quietest Lab',
    intro: 'The Moon had no air and no weather, which made it the perfect laboratory. A science magazine wants three experiments for its cover story.',
    clues: [
      ['Find where an astronaut dropped a hammer and a feather to test an idea from Galileo.', 'apollo-15'],
      ['Find where astronauts took parts of an old robot home to see what the Moon does to metal and glass.', 'apollo-12'],
      ['Find the first telescope ever used on another world.', 'apollo-16'],
    ],
    ending: 'The editor picks the headline: "The Quietest Lab in the Solar System". Some of its equipment is still up there, still pointed at the sky.',
  },
  {
    id: '1c', world: 'moon', title: 'Firsts and Lasts',
    intro: "A history teacher is building a timeline of the Moon's firsts and lasts. Three entries are missing.",
    clues: [
      ['Find the first American spacecraft to land gently on another world.', 'surveyor-1'],
      ['Find the mission that took the first car to the Moon.', 'apollo-15'],
      ['Find the last people to walk on the Moon.', 'apollo-17'],
    ],
    ending: 'The timeline now has a first, a first and a last. The teacher leaves a space after it, labelled "Next". It\'s still waiting to be filled.',
  },

  /* ---------------- Chapter II · Mars ---------------- */
  {
    id: '2a', world: 'mars', main: true, title: 'The Final Report',
    intro: "You're a new engineer at mission control. Your first job is to write the final report for five machines that stopped answering. Find each one.",
    clues: [
      ['Find the first US lander to work on Mars, which went silent after a software mistake.', 'viking-1'],
      ['Find the first rover on another planet, about the size of a microwave oven.', 'sojourner'],
      ['Find the rover that drove farther than a marathon before a dust storm blocked out the Sun.', 'opportunity'],
      ['Find the lander that never moved, but heard more than 1,300 marsquakes.', 'insight'],
      ['Find the first machine to fly on another planet.', 'ingenuity'],
    ],
    ending: 'Your report is finished. Every entry ends the same way: "Mission complete. Lasted longer than planned." You close the file, then add one more word at the bottom: "Thanks."',
  },
  {
    id: '2b', world: 'mars', title: 'Water Detectives',
    intro: 'Mars is a dry desert today. But was it always? Follow three clues the robots found.',
    clues: [
      ['Find the lander that saw frost on the ground in winter.', 'viking-2'],
      ['Find the lander that dug up ice just a few centimetres under the dirt.', 'phoenix'],
      ['Find the rover whose broken wheel uncovered a mineral that forms around hot springs.', 'spirit'],
    ],
    ending: 'Frost, buried ice and the traces of hot springs. Case notes: Mars once had water, and some of it is still hiding. Next question: did anything ever live in it?',
  },
  {
    id: '2c', world: 'mars', title: 'Never Give Up',
    intro: 'A coach wants three true stories to show the team what "never give up" really means.',
    clues: [
      ['Find the rover that kept going by driving backwards with a broken wheel.', 'spirit'],
      ['Find the rover that was promised 90 days and lasted more than 14 years.', 'opportunity'],
      ['Find the helicopter that was meant to make 5 flights and made 72.', 'ingenuity'],
    ],
    ending: 'The coach writes three things on the board: six years, fourteen years, 72 flights. "None of them were built to do this," she says. "They just kept going."',
  },

  /* ---------------- Chapter III · Deep Space ---------------- */
  {
    id: '3a', world: 'deep', main: true, title: 'Where Are They Now?',
    intro: 'Far from Earth, five spacecraft are still out there. A radio astronomer wants to know where each one is today.',
    clues: [
      ['Find the telescope that follows Earth around the Sun, slowly falling behind.', 'kepler'],
      ['Find the spacecraft resting on a peanut-shaped asteroid.', 'near'],
      ['Find the spacecraft still circling a dwarf planet with bright salty spots.', 'dawn'],
      ['Find the first spacecraft to visit Saturn.', 'pioneer-11'],
      ['Find the spacecraft carrying a picture of two people and a map of where they live.', 'pioneer-10'],
    ],
    ending: 'Five dots on the astronomer\'s screen. Three are circling or resting. Two are leaving forever, carrying a picture of us. "Someone might find them one day," she says. "And they\'ll know we were curious."',
  },
  {
    id: '3b', world: 'deep', title: 'Running on Empty',
    intro: 'Every spacecraft eventually runs out of something: fuel, power, or a way to call home. Find three that went quiet.',
    clues: [
      ['Find the planet-hunting telescope that was switched off when its fuel ran out.', 'kepler'],
      ['Find the spacecraft that ran out of fuel and kept circling a dwarf planet.', 'dawn'],
      ['Find the spacecraft that could no longer turn its antenna towards home in 1995.', 'pioneer-11'],
    ],
    ending: 'Three silent spacecraft. None of them is broken. They\'ve simply finished. Out here, "the end" just means going quiet and carrying on.',
  },
  {
    id: '3c', world: 'deep', title: 'The Pathfinders',
    intro: 'Someone always has to go first. Find three spacecraft that did something nobody had done before.',
    clues: [
      ['Find the first spacecraft to orbit an asteroid.', 'near'],
      ['Find the first spacecraft to orbit two different worlds beyond Earth.', 'dawn'],
      ['Find the first spacecraft to cross the asteroid belt.', 'pioneer-10'],
    ],
    ending: 'Every mission since has followed paths these three opened. Being first is lonely. It\'s also how everyone else finds the way.',
  },
];

export const questById = (id) => QUESTS.find((q) => q.id === id);
