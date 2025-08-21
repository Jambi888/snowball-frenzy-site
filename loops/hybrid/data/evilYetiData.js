// data/evilYetiData.js
export const EVIL_YETI = {
    "yetis": [
      {
        "class": "Siphon",
        "name": "Vorag the Siphon",
        "icon": "loops/hybrid/data/images/siphon.png",
        "description": "Siphon of the Hollow Maw",
        "colorTheme": "green"
      },
      {
        "class": "Assailant",
        "name": "Korrith the Assailant",
        "icon": "loops/hybrid/data/images/assailant.png",
        "description": "Assailant of the Shattered Wall",
        "colorTheme": "red"
      },
      {
        "class": "Anchor",
        "name": "Dravik the Anchor",
        "icon": "loops/hybrid/data/images/anchor.png",
        "description": "Anchor of the Frozen Path",
        "colorTheme": "yellow"
      },
      {
        "class": "Scrambler",
        "name": "Severra the Scrambler",
        "icon": "loops/hybrid/data/images/scrambler.png",
        "description": "Scrambler of the Broken Code",
        "colorTheme": "gray"
      },
 //     {
 //       "class": "Siphon",
 //       "name": "Siphon test 2",
 //       "description": "Siphon test 2 description",
 //       "colorTheme": "purple"
 //     },
 //     {
 //       "class": "Assailant",
 //       "name": "Assailant test 2",
 //       "description": "Assailant test 2 description",
 //       "colorTheme": "orange"
 //     },
 //     {
 //       "class": "Anchor",
 //       "name": "Anchor test 2",
 //       "description": "Anchor test 2 description",
 //       "colorTheme": "yellow"
 //     },
 //     {
 //       "class": "Scrambler",
 //       "name": "Scrambler test 2",
 //       "description": "Scrambler test 2 description",
 //       "colorTheme": "brown"
 //     }
    ]
  }

export const EVIL_YETI_BASE_EFFECT = {
    "classAppearanceProbability": 0.25, // 25% chance per class
    "Siphon": {
      "description": "Steal 10% of snowballs from wallet",
      "opposite": "Harvester",
      "duration": 10,
      "effectType": "stealSnowballs",
      "value": 0.05,
      "target": "snowballs",
      "colorTheme": "red"
    },
    "Assailant": {
      "description": "Steal 1 random assistant",
      "opposite": "Defender",
      "duration": 10,
      "effectType": "stealAssistants",
      "value": 1,
      "target": "assistant",
      "colorTheme": "orange"
    },
    "Anchor": {
      "description": "Steal 1  snowflakes from wallet",
      "opposite": "Traveler",
      "duration": 10,
      "effectType": "stealSnowflakes",
      "value": 1,
      "target": "snowflake",
      "colorTheme": "gray"

    },
    "Scrambler": {
      "description": "Steal 1 icicles from wallet",
      "opposite": "Scholar",
      "duration": 10,
      "effectType": "stealIcicles",
      "value": 1,
      "target": "icicle",
      "colorTheme": "black"
    }
  }