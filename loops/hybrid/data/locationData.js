// data/locationData.js
export const LOCATION = {
  "locations": [
    {
      "id": "frostPeak",
      "class": "Harvester",
      "name": "Frost Peak",
      "icon": "./images/frostPeak.png",
      "description": "Where frozen time fuels the harvest of ancient snowballs.",
      "colorTheme": "green",
    },
    {
      "id": "ancientGrove",
      "class": "Harvester", 
      "name": "Ancient Grove",
      "icon": "./images/ancientGrove.png",
      "description": "Ancient trees whisper secrets of forgotten harvests.",
      "colorTheme": "green",
    },
    {
      "id": "glacierForge",
      "class": "Defender",
      "name": "Glacier Forge",
      "icon": "./images/glacierForge.png",
      "description": "Forged in frost and guarded by forgotten assistants.",
      "colorTheme": "red",
    },
    {
      "id": "ironCitadel",
      "class": "Defender",
      "name": "Iron Citadel", 
      "icon": "./images/ironCitadel.png",
      "description": "Fortress walls echo with the strength of loyal defenders.",
      "colorTheme": "red",
    },
    {
      "id": "twilightCrossing",
      "class": "Traveler",
      "name": "Twilight Crossing",
      "icon": "./images/twilightCrossing.png",
      "description": "Crossing dimensions leaves golden trails of opportunity.",
      "colorTheme": "yellow",
    },
    {
      "id": "starBridge",
      "class": "Traveler",
      "name": "Star Bridge",
      "icon": "./images/starBridge.png",
      "description": "A bridge of starlight connecting distant realms.",
      "colorTheme": "yellow", 
    },
    {
      "id": "crystalLibrary",
      "class": "Scholar",
      "name": "Crystal Library",
      "icon": "./images/crystalLibrary.png",
      "description": "Archives of forgotten truths echo through the crystals.",
      "colorTheme": "gray",
    },
    {
      "id": "wisdomHall",
      "class": "Scholar",
      "name": "Wisdom Hall",
      "icon": "./images/wisdomHall.png",
      "description": "Halls of learning where knowledge becomes power.",
      "colorTheme": "gray",
    }
  ]
}

export const LOCATION_PASSIVE_EFFECT = {
  "Harvester": {
    "baseProbability": 0.25, // 25% chance per class
    "description": "Reduce global upgrade costs by 50% for 60s",
    "duration": 60,
    "effectType": "discountGlobalUpgrades", 
    "value": 0.5
  },
  "Defender": {
    "baseProbability": 0.25, // 25% chance per class
    "description": "Reduce assistant costs by 50% for 60s", 
    "duration": 60,
    "effectType": "discountAssistants",
    "value": 0.5
  },
  "Traveler": {
    "baseProbability": 0.25, // 25% chance per class
    "description": "Increase snowball generation rate by 5x for 60s",
    "duration": 60,
    "effectType": "snowballRate",
    "value": 4.0
  },
  "Scholar": {
    "baseProbability": 0.25, // 25% chance per class
    "description": "Force spawn a random crystal snowball",
    "duration": 60,
    "effectType": "spawnCrystalSnowball", 
    "value": 1
  }
}