// data/abilitiesData.js
export const SLOT_ABILITIES = {
    "harvester": {
        "abilities": [
          {
            "id": "harvesterAbilityTopAnalogs",
            "name": "Top Echo Snowballs",
            "description": "Reward: 5% of snowballs from one random Echo in the top half of producers",
            "effect": {
              "effectType": "pullSnowballs",
              "value": 0.05,
              "target": "topAnalogs"
            }
          },
          {
            "id": "harvesterAbilityTwoAnalogs",
            "name": "Dual Snowball Pull",
            "description": "Reward: 5% of snowballs from two random Echoes",
            "effect": {
              "effectType": "pullSnowballs",
              "value": 0.05,
              "target": "twoRandomAnalogs"
            }
          },
          {
            "id": "harvesterAbilityDoubleRandom",
            "name": "Double Snowballs",
            "description": "Reward: 10% of snowballs from a random Echo",
            "effect": {
              "effectType": "pullSnowballs",
              "value": 0.10,
              "target": "randomAnalog"
            }
          },
          {
            "id": "harvesterAbilityAverageAnalogs",
            "name": "Average Snowballs",
            "description": "Reward: 5% of snowballs from the average of all Echoes",
            "effect": {
              "effectType": "pullSnowballs",
              "value": 0.05,
              "target": "averageAnalog"
            }
          }
        ]
      },
      "defender": {
        "abilities": [
          {
            "id": "defenderAbilityTopAnalogs",
            "name": "Top Echo Assistants",
            "description": "Reward: 5% of assistants from one random Echo in the top half of producers",
            "effect": {
              "effectType": "pullAssistants",
              "value": 0.05,
              "target": "topAnalogs"
            }
          },
          {
            "id": "defenderAbilityTwoAnalogs",
            "name": "Dual Assist Pull",
            "description": "Reward: 5% of assistants from two random Echoes",
            "effect": {
              "effectType": "pullAssistants",
              "value": 0.05,
              "target": "twoRandomAnalogs"
            }
          },
          {
            "id": "defenderAbilityDoubleRandom",
            "name": "Double Assistants",
            "description": "Reward: 10% of assistants from a random Echo",
            "effect": {
              "effectType": "pullAssistants",
              "value": 0.10,
              "target": "randomAnalog"
            }
          },
          {
            "id": "defenderAbilityAverageAnalogs",
            "name": "Average Assistants",
            "description": "Reward: 5% of assistants from the average of all Echoes",
            "effect": {
              "effectType": "pullAssistants",
              "value": 0.05,
              "target": "averageAnalog"
            }
          }
        ]
      },
      "traveler": {
        "abilities": [
          {
            "id": "travelerAbilityTopAnalogs",
            "name": "Top Echo Snowflakes",
            "description": "Reward: 5% of snowflakes from one random Echo in the top half of producers",
            "effect": {
              "effectType": "pullSnowflakes",
              "value": 0.05,
              "target": "topAnalogs"
            }
          },
          {
            "id": "travelerAbilityTwoAnalogs",
            "name": "Dual Snowflake Pull",
            "description": "Reward: 5% of snowflakes from two random Echoes",
            "effect": {
              "effectType": "pullSnowflakes",
              "value": 0.05,
              "target": "twoRandomAnalogs"
            }
          },
          {
            "id": "travelerAbilityDoubleRandom",
            "name": "Double Snowflakes",
            "description": "Reward: 10% of snowflakes from a random Echo",
            "effect": {
              "effectType": "pullSnowflakes",
              "value": 0.10,
              "target": "randomAnalog"
            }
          },
          {
            "id": "travelerAbilityAverageAnalogs",
            "name": "Average Snowflakes",
            "description": "Reward: 5% of snowflakes from the average of all Echoes",
            "effect": {
              "effectType": "pullSnowflakes",
              "value": 0.05,
              "target": "averageAnalog"
            }
          }
        ]
      },
      "scholar": {
        "abilities": [
          {
            "id": "scholarAbilityTopAnalogs",
            "name": "Top Echo Icicles",
            "description": "Reward: 5% of icicles from one random Echo in the top half of producers",
            "effect": {
              "effectType": "pullIcicles",
              "value": 0.05,
              "target": "topAnalogs"
            }
          },
          {
            "id": "scholarAbilityTwoAnalogs",
            "name": "Dual Icicle Pull",
            "description": "Reward: 5% of icicles from two random Echoes",
            "effect": {
              "effectType": "pullIcicles",
              "value": 0.5,
              "target": "twoRandomAnalogs"
            }
          },
          {
            "id": "scholarAbilityDoubleRandom",
            "name": "Double Icicles",
            "description": "Reward: 10% of icicles from a random Echo",
            "effect": {
              "effectType": "pullIcicles",
              "value": 0.1,
              "target": "randomAnalog"
            }
          },
          {
            "id": "scholarAbilityAverageAnalogs",
            "name": "Average Icicles",
            "description": "Reward: 5% of icicles from the average of all Echoes",
            "effect": {
              "effectType": "pullIcicles",
              "value": 0.05,
              "target": "averageAnalog"
            }
          }
        ]
      }
  }