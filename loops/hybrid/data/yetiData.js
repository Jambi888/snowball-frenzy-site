// data/yetiData.js
export const YETI = {
    "meanAppearanceTime": 360, // 6 minutes in seconds (mean spawn time)
    "classAppearanceProbability": 0.25, // Currently unused - all classes have equal probability
    "yetis": [
      {
        "class": "Harvester",
        "name": "Granek the Harvester",
        "icon": "./loops/hybrid/data/images/harvester.png",
        "description": "Granek bends time to pull snowballs from forgotten analogs.",
        "colorTheme": "green"
      },
      {
        "class": "Defender",
        "name": "Valken the Defender",
        "icon": "./loops/hybrid/data/images/defender.png",
        "description": "Valken calls loyal assistants from analogs long past.",
        "colorTheme": "red"
      },
      {
        "class": "Traveler",
        "name": "Thalos the Traveler",
        "icon": "./loops/hybrid/data/images/traveler.png",
        "description": "Thalos walks the multiverse and stands in many places at once.",
        "colorTheme": "yellow"
      },
      {
        "class": "Scholar",
        "name": "Myra the Scholar",
        "icon": "./loops/hybrid/data/images/scholar.png",
        "description": "Myra deciphers the codes that bind analogs together.",
        "colorTheme": "gray"
      },
 //     {Neith
 //       "class": "Harvester",
 //       "name": "Harvester Test",
 //       "description": "Harvester Test Description",
 //       "colorTheme": "purple"
 //     },
 //     {
 //       "class": "Defender",
 //       "name": "Defender Test",
 //       "description": "Defender Test Description",
 //       "colorTheme": "orange"
 //     },
 //     {
 //       "class": "Traveler",
 //       "name": "Traveler Test",
 //       "description": "Traveler Test Description",
 //       "colorTheme": "yellow"
 //     },
 //     {
 //       "class": "Scholar",
 //       "name": "Scholar Test",
 //       "description": "Scholar Test Description",
 //       "colorTheme": "brown"
 //     }
    ]
  }

export const YETI_BASE_EFFECT = {
    "Harvester": {
      "description": "Reward: 5% of snowballs from a random previous Echo",
      "duration": 20,
      "effectType": "pullSnowballs",
      "value": 0.05,
      "target": "randomAnalog"
    },
    "Defender": {
      "description": "Reward: 5% of assistants from a random previous Echo",
      "duration": 20,
      "effectType": "pullAssistants",
      "value": 0.05,
      "target": "randomAnalog"
    },
    "Traveler": {
      "description": "Reward: 5% of snowflakes from a random previous Echo",
      "duration": 20,
      "effectType": "pullSnowflakes",
      "value": 0.05,
      "target": "randomAnalog"

    },
    "Scholar": {
      "description": "Reward: 5% of icicles from a random previous Echo",
      "duration": 20,
      "effectType": "pullIcicles",
      "value": 0.05,
      "target": "randomAnalog"
    }
  }