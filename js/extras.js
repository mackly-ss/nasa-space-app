// Extras for each relic: a four-beat comic, a quiz and (for most) a mini game, plus messages
// between machines, badges and ranks. Mars and Moon content adapted from the author's own
// ECHO's Lost Memories; Surveyor 1 and the deep-space probes are new.

// Comic beats: [narration, the machine's own words]
export const BEATS = ['The problem', 'The clever engineering', 'The discovery', 'Where it is now'];

export const EXTRAS = {
 "apollo-12": {
  "panels": [
   [
    "1967. Nobody knew if the Moon’s ground was solid rock or deep, fluffy dust that could swallow a spaceship whole.",
    "W-what if I sink? Nobody has ever checked!"
   ],
   [
    "So NASA sent a robot scout first: three small braking engines, three springy legs, a TV camera and a little scoop to dig.",
    "Engines on. Legs ready. Scoop… ready-ish."
   ],
   [
    "Its engines didn’t switch off in time, so it bounced twice. Then it dug into the ground. Firm! Solid enough to stand on.",
    "I BOUNCED! …But I didn’t sink. Tell the astronauts it’s safe!"
   ],
   [
    "Two and a half years later, Apollo 12 astronauts landed nearby, walked over, and took its camera home to study.",
    "Real visitors! I was so nervous I forgot to wave."
   ]
  ],
  "quiz": {
   "q": "Who came to visit Surveyor 3 on the Moon?",
   "o": [
    "Apollo 12 astronauts",
    "A Soviet rover",
    "Nobody, ever"
   ],
   "a": 0,
   "why": "Pete Conrad and Alan Bean walked over in November 1969 and brought parts of it back to Earth."
  },
  "game": {
   "type": "land",
   "mode": "vertical",
   "title": "Land it softly",
   "how": "Hold down the mouse, your finger, or the Space bar to fire the braking engines. Touch down slower than 3 m/s. (The real Surveyor bounced. Can you do better?)",
   "art": "surveyor"
  }
 },
 "apollo-11": {
  "panels": [
   [
    "July 20, 1969. Neil Armstrong and Buzz Aldrin ride the lunar module Eagle down. The computer is steering them toward a field of boulders.",
    "Steady. Breathe. We do this together."
   ],
   [
    "Eagle was built in two halves: a bottom half with legs and a big landing engine, and a top half to fly the crew back up.",
    "My job is the bottom half. I hold the ground so they can leave."
   ],
   [
    "Neil flies past the boulders and lands safely. They bring home about 21.5 kg of rock, which show the Moon was once covered by an ocean of melted rock.",
    "They walked, they worked, and they came back with treasure."
   ],
   [
    "After about 21 hours, the top half blasts off. The bottom half stays behind as the launch pad, with a plaque: “We came in peace for all mankind.”",
    "I’m still holding that promise. Every single day."
   ]
  ],
  "quiz": {
   "q": "What did Eagle’s bottom half do when the astronauts left?",
   "o": [
    "Exploded into pieces",
    "Worked as a launch pad for the top half",
    "Flew them back to Earth"
   ],
   "a": 1,
   "why": "The descent stage stayed on the Moon and acted as a launch pad for the ascent stage."
  },
  "game": {
   "type": "land",
   "mode": "steer",
   "title": "Fly past the boulders",
   "how": "Hold to fire the engine, and move left or right to steer. Land gently in the flat zone between the flags.",
   "art": "eagle"
  }
 },
 "apollo-14": {
  "panels": [
   [
    "1971. Scientists wanted to measure the distance to the Moon really precisely. No ruler is that long. But light might work.",
    "Light travels. I simply send it back."
   ],
   [
    "Apollo 14 astronauts set up 100 glass corner-cubes. A corner-cube bounces light straight back to where it came from, from almost any angle.",
    "No batteries. No moving parts. Just patience."
   ],
   [
    "Observatories on Earth fire lasers at it and time the echo: about 2.5 seconds there and back. Result: the Moon drifts away about 3.8 cm a year.",
    "We drift apart slowly. About as fast as your fingernails grow."
   ],
   [
    "More than 50 years later, it still works. Observatories still aim lasers at it today.",
    "I am still here. Send me your light anytime."
   ]
  ],
  "quiz": {
   "q": "What have laser bounces off the mirror revealed?",
   "o": [
    "The Moon is hollow inside",
    "The Moon spins faster every year",
    "The Moon drifts about 3.8 cm farther away each year"
   ],
   "a": 2,
   "why": "Measuring the light’s round trip very precisely shows the Moon slowly moving away from Earth."
  },
  "game": {
   "type": "aim",
   "title": "Hit the mirror",
   "how": "Drag to aim the laser from Earth. The Moon slowly moves, so keep the beam on the mirror. When it turns green, press Fire.",
   "art": "reflector"
  }
 },
 "apollo-15": {
  "panels": [
   [
    "1971. Walking on the Moon in a stiff spacesuit is slow and tiring. Astronauts couldn’t go far from their lander.",
    "Somebody call for a ride?"
   ],
   [
    "Engineers built an electric car that folded flat against the side of the lunar module. Its wheels were woven from wire instead of rubber.",
    "Folded like origami! Pull the strap and… ta-da, I unfold!"
   ],
   [
    "Dave Scott and Jim Irwin drove about 28 km. They found the “Genesis Rock”, a piece of the Moon’s ancient crust over 4 billion years old.",
    "Best road trip ever. We found treasure older than almost anything!"
   ],
   [
    "When the mission ended, the astronauts parked it for good.",
    "Parking spot: forever. At least there are no parking tickets on the Moon."
   ]
  ],
  "quiz": {
   "q": "How did the Moon buggy travel to the Moon?",
   "o": [
    "Folded flat on the side of the lunar module",
    "It flew there by itself",
    "Astronauts built it from a kit on the Moon"
   ],
   "a": 0,
   "why": "It was stored folded against the lunar module and unfolded on the surface."
  },
  "game": {
   "type": "assemble",
   "title": "Unfold the buggy",
   "how": "Drag each part onto its glowing spot on the buggy. Each part tells you its job.",
   "art": "rover"
  },
  "parts": [
   {
    "kind": "wheel",
    "name": "Wire-mesh wheel",
    "role": "Woven wire wheels grip the dust and never go flat.",
    "at": [
     144,
     148
    ]
   },
   {
    "kind": "seat",
    "name": "Seats",
    "role": "Two folding seats for the astronauts.",
    "at": [
     100,
     112
    ]
   },
   {
    "kind": "dish",
    "name": "Dish antenna",
    "role": "Beams TV pictures and voices straight to Earth.",
    "at": [
     152,
     58
    ]
   },
   {
    "kind": "battery",
    "name": "Battery",
    "role": "Powers an electric motor inside each wheel.",
    "at": [
     49,
     119
    ]
   }
  ]
 },
 "apollo-16": {
  "panels": [
   [
    "1972. What’s inside the Moon? Nobody can dig that deep. But you can listen.",
    "Shhh… I hear something."
   ],
   [
    "Astronauts set up a seismometer: an instrument so sensitive it felt tiny shakes in the ground, powered by a small nuclear battery.",
    "I feel every tiny tremble. Even footsteps."
   ],
   [
    "Listening stations at four Apollo sites felt thousands of moonquakes. The waves revealed a crust, a mantle and a small core.",
    "The Moon has a heartbeat. A slow, deep one."
   ],
   [
    "In 1977, NASA switched the stations off.",
    "My ears are off now. But what I heard still teaches scientists today."
   ]
  ],
  "quiz": {
   "q": "How did the seismometres help scientists study the Moon?",
   "o": [
    "They took photos of craters",
    "They used moonquakes to map the Moon’s insides",
    "They measured Earth’s temperature"
   ],
   "a": 1,
   "why": "Quake waves change as they pass through different layers, so they reveal what’s inside."
  },
  "game": {
   "type": "tune",
   "title": "Catch the moonquake",
   "how": "Drag the two sliders until your wave (green) matches the quake signal (orange, dashed).",
   "art": "seismo"
  }
 },
 "apollo-17": {
  "panels": [
   [
    "December 1972. Gene Cernan and Harrison Schmitt land in a valley called Taurus–Littrow. It’s the last Apollo mission.",
    "The last trip? Then let’s make it count."
   ],
   [
    "Schmitt was a geologist, the first scientist to walk on the Moon. The buggy carried him to the rocks he picked.",
    "I brought a real rock expert. He knows exactly what to look for."
   ],
   [
    "Near a crater, Schmitt spotted something nobody expected: orange soil. It was made of tiny glass beads from ancient volcanoes.",
    "Orange?! On the grey Moon?!"
   ],
   [
    "They parked it so its camera could film them leaving. Nobody has walked on the Moon since.",
    "I filmed them leave. Then I waited. I’m still waiting."
   ]
  ],
  "quiz": {
   "q": "What surprising colour did Apollo 17 find in the Moon’s soil?",
   "o": [
    "Bright blue",
    "Orange",
    "Green"
   ],
   "a": 1,
   "why": "The orange came from tiny volcanic glass beads."
  },
  "game": {
   "type": "find",
   "target": "orange",
   "count": 3,
   "title": "Spot the orange soil",
   "how": "Schmitt spotted orange soil in the grey dust. Find all 3 orange patches.",
   "art": "rover"
  }
 },
 "viking-1": {
  "panels": [
   [
    "1976. Could anything live on Mars? Nobody had ever tested its soil.",
    "A hypothesis! I love a good hypothesis."
   ],
   [
    "Viking 1 carried a tiny robot lab, a scoop arm, cameras and a weather station, all powered by nuclear batteries.",
    "Scoop. Feed the lab. Wait. Measure. Science is mostly waiting."
   ],
   [
    "It landed on July 20, 1976, exactly 7 years after Apollo 11, and sent the first photos from the surface of Mars. Its life tests gave confusing results.",
    "The results were… weird. I need more data. Always more data."
   ],
   [
    "It worked for over 6 years, until a wrong command pointed its antenna away from Earth.",
    "I’m still here. I just can’t call home."
   ]
  ],
  "quiz": {
   "q": "What was Viking 1’s mini-lab searching for?",
   "o": [
    "Signs of life in the soil",
    "Gold",
    "Drinkable water"
   ],
   "a": 0,
   "why": "Its biology experiments tested Martian soil for signs of living things."
  },
  "game": {
   "type": "assemble",
   "title": "Rebuild the lander lab",
   "how": "Drag each part onto its glowing spot on Viking 1.",
   "art": "viking"
  },
  "parts": [
   {
    "kind": "dish",
    "name": "Dish antenna",
    "role": "Sends photos and data home to Earth.",
    "at": [
     143,
     36
    ]
   },
   {
    "kind": "lab",
    "name": "Biology lab",
    "role": "Tests the soil for signs of life.",
    "at": [
     100,
     86
    ]
   },
   {
    "kind": "arm",
    "name": "Scoop arm",
    "role": "Digs up soil and feeds the lab.",
    "at": [
     46,
     138
    ]
   },
   {
    "kind": "boom",
    "name": "Weather boom",
    "role": "Measures the wind and temperature.",
    "at": [
     52,
     56
    ]
   }
  ]
 },
 "viking-2": {
  "panels": [
   [
    "1976. Viking 1’s twin was sent much farther north, to a flat plain called Utopia.",
    "My twin got the famous first. I got Utopia. Fair trade."
   ],
   [
    "It had the same cameras, weather station and soil lab, so scientists could compare two very different places.",
    "Two landers, two places. That’s how you do science."
   ],
   [
    "In winter, its cameras saw a thin white layer of frost on the ground. Mars has seasons!",
    "Frost! It’s cold here. And kind of beautiful."
   ],
   [
    "Its batteries failed in April 1980.",
    "Goodnight from Utopia. Say hi to my twin."
   ]
  ],
  "quiz": {
   "q": "What did Viking 2 photograph during the Martian winter?",
   "o": [
    "Rain clouds",
    "Frost on the ground",
    "A snowman"
   ],
   "a": 1,
   "why": "It saw a thin layer of frost on the rocks and soil around it."
  },
  "game": {
   "type": "find",
   "target": "frost",
   "count": 4,
   "title": "Spot the winter frost",
   "how": "Winter has come to Utopia. Find all 4 patches of white frost.",
   "art": "viking"
  }
 },
 "sojourner": {
  "panels": [
   [
    "1997. NASA hadn’t landed on Mars in 21 years. The new plan was cheaper, faster, and a little bit wild.",
    "Wild is my middle name!"
   ],
   [
    "Instead of landing legs, the Pathfinder lander wrapped itself in giant airbags and bounced across the ground. Then little Sojourner rolled out.",
    "Boing! Boing! Boing! …Can we do that again?"
   ],
   [
    "It became the first rover to drive on another planet, studying rocks the team named Barnacle Bill and Yogi.",
    "Barnacle Bill is my best friend. He’s a rock."
   ],
   [
    "It was planned to last a week. It kept going for almost three months.",
    "I was small. But I went first."
   ]
  ],
  "quiz": {
   "q": "How did Pathfinder and Sojourner land on Mars?",
   "o": [
    "Lowered by a sky crane",
    "Bouncing inside airbags",
    "On a parachute only"
   ],
   "a": 1,
   "why": "Giant airbags cushioned the lander as it bounced across the ground."
  },
  "game": {
   "type": "land",
   "mode": "airbag",
   "title": "Bounce down on airbags",
   "how": "Pathfinder is falling under its parachute. Press “Inflate airbags!” when the altitude metre reaches the green zone.",
   "art": "minirover"
  }
 },
 "spirit": {
  "panels": [
   [
    "2004. Spirit landed in Gusev Crater, hoping it had once been a lake.",
    "Let’s find some water history. Let’s go!"
   ],
   [
    "Six wheels, a robot arm full of science tools, solar panels. When one front wheel broke, the team drove Spirit backwards, dragging the broken wheel.",
    "Broken wheel? Fine. I’ll drive backwards."
   ],
   [
    "The dragging wheel scraped up bright white soil. It was almost pure silica, a sign of ancient hot springs, the kind of place tiny life loves on Earth.",
    "My broken wheel made the discovery! Ha!"
   ],
   [
    "In 2009 it got stuck in soft sand. Its last message came in March 2010.",
    "I couldn’t escape. But I never stopped trying."
   ]
  ],
  "quiz": {
   "q": "What did Spirit’s broken wheel uncover?",
   "o": [
    "A fossil",
    "Liquid water",
    "Bright silica soil"
   ],
   "a": 2,
   "why": "Dragging the stuck wheel scraped up silica, a clue to ancient hot springs."
  },
  "game": {
   "type": "dig",
   "target": "silica",
   "title": "Drag the broken wheel",
   "how": "Drag the stuck wheel back and forth across the lighter soil to scrape it open.",
   "art": "bigrover"
  }
 },
 "opportunity": {
  "panels": [
   [
    "2004. Spirit’s twin landed on the other side of Mars and rolled straight into a small crater.",
    "Hole in one!"
   ],
   [
    "Same design as Spirit, plus a grinder to look inside rocks. It was built to drive for 90 days.",
    "90 days? Watch me."
   ],
   [
    "It found tiny round pebbles nicknamed “blueberries” that formed in water. Proof that liquid water once soaked the ground.",
    "Blueberries! Don’t eat them, they’re made of iron minerals."
   ],
   [
    "It drove 45 km, more than a marathon, over 14 years. In 2018 a giant dust storm blocked out the Sun.",
    "I ran a marathon on Mars. Then the sky went dark."
   ]
  ],
  "quiz": {
   "q": "How far did Opportunity drive on Mars?",
   "o": [
    "4.5 m",
    "About 45 km, more than a marathon",
    "4,500 km"
   ],
   "a": 1,
   "why": "It drove 45.16 km, longer than a 42.2 km marathon."
  },
  "game": {
   "type": "find",
   "target": "berry",
   "count": 5,
   "title": "Collect the blueberries",
   "how": "Find all 5 tiny round, bluish “blueberries” hidden among the pebbles.",
   "art": "bigrover"
  }
 },
 "phoenix": {
  "panels": [
   [
    "2008. Scientists suspected ice was hiding under the soil near Mars’s north pole. Someone had to go dig.",
    "A cold, dark winter is coming? I’m in."
   ],
   [
    "Phoenix had a robot arm with a scoop, tiny ovens to bake soil samples, and a laser to watch the weather.",
    "Dig, bake, sniff. That’s the plan."
   ],
   [
    "Its trench showed bright white chunks that slowly vanished. It was water ice turning straight into gas. Phoenix even saw snow falling from clouds.",
    "ICE! I found it! And… is that snow?"
   ],
   [
    "When winter came, there wasn’t enough sunlight. It went silent in November 2008.",
    "I was built for one summer. It was enough."
   ]
  ],
  "quiz": {
   "q": "What did Phoenix find just under the soil?",
   "o": [
    "Water ice",
    "Oil",
    "Ancient bones"
   ],
   "a": 0,
   "why": "Its trenches exposed water ice, which slowly turned to gas in the sunlight."
  },
  "game": {
   "type": "dig",
   "target": "ice",
   "title": "Dig for ice",
   "how": "Drag the scoop over the lighter soil to dig a trench. Look for something bright and white.",
   "art": "phoenix"
  }
 },
 "insight": {
  "panels": [
   [
    "2018. The inside of Mars was a mystery. How thick is its crust? Is its core solid or liquid?",
    "To see inside, I just have to listen."
   ],
   [
    "InSight set a super-sensitive seismometre right on the ground and covered it with a dome to block the wind. It was built from Phoenix’s design.",
    "Phoenix was like a big sibling. Same body, new job."
   ],
   [
    "It felt 1,319 marsquakes. The waves showed Mars has a crust, a mantle and a big liquid metal core.",
    "Every quake is a message from deep inside."
   ],
   [
    "Dust slowly covered its solar panels. Its last message came in December 2022.",
    "I listened until the very end."
   ]
  ],
  "quiz": {
   "q": "What did InSight use to study the inside of Mars?",
   "o": [
    "Marsquakes",
    "A drill to the core",
    "X-ray photos"
   ],
   "a": 0,
   "why": "Its seismometre recorded how quake waves travel through the planet."
  },
  "game": {
   "type": "assemble",
   "title": "Set up the listening station",
   "how": "Drag each part onto its glowing spot on InSight.",
   "art": "insight"
  },
  "parts": [
   {
    "kind": "solar",
    "name": "Solar panel",
    "role": "Round panels unfold like fans to make power.",
    "at": [
     44,
     102
    ]
   },
   {
    "kind": "solar",
    "name": "Solar panel",
    "role": "Two of them, each about 2 m across.",
    "at": [
     156,
     102
    ]
   },
   {
    "kind": "arm",
    "name": "Robot arm",
    "role": "Lifts instruments off the deck onto the ground.",
    "at": [
     136,
     58
    ]
   },
   {
    "kind": "dome",
    "name": "Seismometre + dome",
    "role": "Feels marsquakes. The dome blocks wind and heat.",
    "at": [
     154,
     154
    ]
   }
  ]
 },
 "ingenuity": {
  "panels": [
   [
    "2021. The air on Mars is only about 1% as thick as Earth’s. Flying there should be almost impossible.",
    "Almost impossible? Sounds fun."
   ],
   [
    "Ingenuity weighed only 1.8 kg and spun two rotors about 2,400 times a minute to grip the thin air. It rode to Mars under the Perseverance rover.",
    "Rotors spinning. Hold on to your helmets!"
   ],
   [
    "On April 19, 2021 it lifted off: the first powered flight on another planet. Planned for 5 flights, it made 72.",
    "I’m flying! On MARS!"
   ],
   [
    "In January 2024, its rotor blades were damaged on its last flight.",
    "I can’t fly anymore. But I proved it could be done."
   ]
  ],
  "quiz": {
   "q": "How many flights did Ingenuity make?",
   "o": [
    "1",
    "5",
    "72"
   ],
   "a": 2,
   "why": "It was planned for 5 test flights but kept going for 72."
  },
  "game": {
   "type": "land",
   "mode": "fly",
   "title": "Fly on Mars",
   "how": "Hold to spin the rotors and climb. Hover inside the green band for 3 seconds, then let go and land gently.",
   "art": "heli"
  }
 },
 "surveyor-1": {
  "panels": [
   [
    "June 1966. No American spacecraft had ever landed gently on another world. Some scientists feared the Moon was covered in deep, loose dust.",
    "What if the ground is like quicksand?"
   ],
   [
    "Surveyor 1 had no pilot. Its own radar measured how fast it was falling, and a braking rocket slowed it down.",
    "No pilot. Just me, my radar and a lot of maths."
   ],
   [
    "It touched down at about 3 metres per second, roughly a jogging pace. Its feet sank only a few centimetres. The ground was solid.",
    "I'm standing! Tell the astronauts: it's safe."
   ],
   [
    "It sent home more than 11,000 pictures before going quiet in January 1967. It still stands in the Ocean of Storms.",
    "My camera's off now. But I showed you the way down."
   ]
  ],
  "quiz": {
   "q": "What big question did Surveyor 1 help answer?",
   "o": [
    "Whether the Moon's ground could hold up a spacecraft",
    "Whether the Moon has water",
    "How old the Moon is"
   ],
   "a": 0,
   "why": "It landed gently and stayed standing, which showed the surface was firm enough for later landings, including Apollo."
  },
  "game": {
   "type": "land",
   "mode": "vertical",
   "title": "Land it softly",
   "how": "Hold down the mouse, your finger or the Space bar to fire the braking rocket. Touch down slower than 3 m/s, just like Surveyor 1 did.",
   "art": "surveyor"
  }
 },
 "kepler": {
  "panels": [
   [
    "For centuries, nobody knew whether planets around other stars were rare or common.",
    "Are planets rare? Someone had to look."
   ],
   [
    "Kepler was a space telescope that stared at the same patch of sky, about 150,000 stars, for four years. It watched for tiny dips in starlight when a planet passed in front.",
    "Don't blink. Don't blink. Don't blink."
   ],
   [
    "It found more than 2,600 planets and showed that most stars probably have at least one.",
    "Planets everywhere! The galaxy is full of them."
   ],
   [
    "In 2018 its fuel ran out and it was switched off. It still follows Earth around the Sun, slowly falling farther behind.",
    "I'm resting now. Keep looking up for me."
   ]
  ],
  "quiz": {
   "q": "How did Kepler find planets around other stars?",
   "o": [
    "By spotting tiny dips in a star's light",
    "By taking close-up photos of each planet",
    "By listening for radio signals"
   ],
   "a": 0,
   "why": "When a planet passes in front of its star, the star's light dims very slightly. Kepler measured those tiny dips."
  }
 },
 "near": {
  "panels": [
   [
    "Asteroids are leftovers from when the planets formed. In the 1990s, no spacecraft had ever stayed with one.",
    "Rocks from the very beginning. I want to know their story."
   ],
   [
    "NEAR Shoemaker spent a year orbiting Eros, a peanut-shaped asteroid about 34 km long, mapping its craters and boulders.",
    "Round and round a space peanut. Best job ever."
   ],
   [
    "When the mission was ending, the team tried something it was never built for: a slow landing. It touched down at about walking pace.",
    "I wasn't built to land. I did it anyway."
   ],
   [
    "It kept sending science from the surface for about two weeks. It still rests on Eros today.",
    "First on an asteroid. Not a bad place to rest."
   ]
  ],
  "quiz": {
   "q": "What was special about the end of NEAR Shoemaker's mission?",
   "o": [
    "It landed on an asteroid, though it wasn't built to",
    "It flew into the Sun",
    "It flew back to Earth"
   ],
   "a": 0,
   "why": "The team guided it down to the surface of Eros in 2001. It survived and kept sending data for about two weeks."
  },
  "game": {
   "type": "land",
   "mode": "vertical",
   "g": 14,
   "sky": "#05060c",
   "ground": "#7d7266",
   "title": "Touch down on Eros",
   "how": "Eros has very little gravity, so you fall slowly, but you still need to brake. Hold to fire the thrusters and touch down slower than 3 m/s.",
   "art": "near"
  }
 },
 "dawn": {
  "panels": [
   [
    "Vesta and Ceres are the two biggest objects in the asteroid belt. Both are like small worlds, but nobody had seen them up close.",
    "Two worlds. One spacecraft. Let's go."
   ],
   [
    "Dawn used ion engines: electric engines that push about as hard as a sheet of paper resting on your hand, but can keep going for years.",
    "Gentle push. Very gentle. For a very, very long time."
   ],
   [
    "It orbited Vesta for over a year, then flew on to Ceres, where it found bright spots made of salt, left by salty water from underground.",
    "Salt? On Ceres? Something wet was down there."
   ],
   [
    "In 2018 it ran out of fuel. It is still circling Ceres, in an orbit chosen so it won't crash for decades.",
    "Out of fuel, still going round. That's fine by me."
   ]
  ],
  "quiz": {
   "q": "What did Dawn find on Ceres?",
   "o": [
    "Bright spots made of salt",
    "A frozen ocean on the surface",
    "Old landers from another country"
   ],
   "a": 0,
   "why": "The bright spots are salts left behind when salty water from below reached the surface."
  }
 },
 "pioneer-10": {
  "panels": [
   [
    "In 1972, nobody knew whether a spacecraft could cross the asteroid belt without being smashed by rocks.",
    "Is the belt a wall of rocks? Only one way to find out."
   ],
   [
    "Pioneer 10 ran on nuclear batteries instead of solar panels, because sunlight is too weak that far from the Sun.",
    "No sunshine out here. I brought my own power."
   ],
   [
    "It crossed the belt safely and became the first spacecraft to fly past Jupiter, sending back the first close-up pictures.",
    "Jupiter! It's enormous. And I'm the first to see it."
   ],
   [
    "Its last faint signal reached Earth in 2003. It is still heading out of the solar system, carrying a plaque that shows who sent it.",
    "If someone finds me: hello. We were here."
   ]
  ],
  "quiz": {
   "q": "Why did Pioneer 10 use nuclear batteries instead of solar panels?",
   "o": [
    "Sunlight is too weak far from the Sun",
    "Solar panels hadn't been invented",
    "Nuclear batteries are lighter"
   ],
   "a": 0,
   "why": "Near Jupiter, sunlight is about 25 times weaker than at Earth, so solar panels of the time could not make enough power."
  }
 },
 "pioneer-11": {
  "panels": [
   [
    "After Pioneer 10 reached Jupiter, NASA sent its twin even farther, to a planet no spacecraft had visited: Saturn.",
    "Jupiter was my twin's. I want Saturn."
   ],
   [
    "Pioneer 11 used Jupiter's gravity like a slingshot to swing across the solar system towards Saturn.",
    "Thanks for the boost, Jupiter."
   ],
   [
    "In 1979 it became the first spacecraft to fly past Saturn. It flew close to the rings and found a new ring nobody had seen.",
    "Rings! And one more than you knew about."
   ],
   [
    "By 1995 it could no longer point its antenna at Earth. It drifts on in the opposite direction from its twin, carrying the same plaque.",
    "Different direction from my twin. Same message."
   ]
  ],
  "quiz": {
   "q": "What was Pioneer 11 the first spacecraft to do?",
   "o": [
    "Fly past Saturn",
    "Land on Jupiter",
    "Leave the Milky Way"
   ],
   "a": 0,
   "why": "In 1979 it flew past Saturn and its rings. Its data helped plan the route the two Voyager probes took."
  }
 }
};

// Pick up a message at `from`, deliver it by opening `to`.
export const MESSAGES = [
 {
  "from": "apollo-12",
  "to": "apollo-11",
  "msg": "I tested the ground for you. It’s solid. You can land.",
  "reply": "Message received, little scout. We landed safely because you went first."
 },
 {
  "from": "apollo-15",
  "to": "apollo-17",
  "msg": "Hey, little sibling. Drive far and find something amazing.",
  "reply": "Found ORANGE soil! Told you I would. Thanks for showing us the way."
 },
 {
  "from": "apollo-16",
  "to": "insight",
  "msg": "Listen closely. Planets whisper before they speak.",
  "reply": "I heard 1,319 whispers on Mars. You taught us how to listen."
 },
 {
  "from": "viking-2",
  "to": "viking-1",
  "msg": "Hi twin. Utopia is beautiful in winter. I saw frost!",
  "reply": "Frost?! Show-off. …I miss you too, twin."
 },
 {
  "from": "spirit",
  "to": "opportunity",
  "msg": "Tell my twin: I got stuck, but I never stopped trying.",
  "reply": "I knew it. I kept driving for both of us. 45 km, Spirit. That was for you."
 },
 {
  "from": "sojourner",
  "to": "ingenuity",
  "msg": "I was the first wheels on Mars. Go be the first wings!",
  "reply": "Wings: done! 72 flights. I followed your tracks all the way."
 }
];

// Ranks follow how many relics you have found (20 in all).
export const RANKS = [[0, 'Visitor'], [3, 'Field Researcher'], [7, 'Explorer'], [12, 'Archivist'], [20, 'Keeper of the Relics']];
