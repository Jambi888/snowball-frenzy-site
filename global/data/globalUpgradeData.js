// globalUpgradeData.js
// 
// ⚠️  LEGACY FILE - DEPRECATED ⚠️
// 
// This file contains legacy global upgrade data that has been replaced by the unified upgrade system.
// 
// NEW SYSTEM:
// - Data: loops/passive/data/unifiedUpgradeData.js
// - Logic: loops/passive/unifiedUpgrades.js
// 
// This file will be reviewed and removed after confirming no remaining references.
// All upgrade functionality should now use the unified upgrade system.
//

export const GLOBAL_UPGRADES = [
  // ===== EARLY GAME UPGRADES (40 assistants, 1e6 snowballs) =====
  
  // Assistant-Based Upgrades
  {
    id: 'teamSpirit',
    name: 'Team Spirit',
    description: 'Your assistants work better together.',
    type: 'global',
    cost: 100,
    visible: true,
    trigger1: {
      type: 'assistantsNumberOwned',
      value: 10
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: .1
    }
  },
  {
    id: 'assemblyLine',
    name: 'Assembly Line',
    description: 'Streamlined assistant production reduces costs.',
    type: 'global',
    cost: 500,
    visible: true,
    trigger1: {
      type: 'assistantsNumberOwned',
      value: 20
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistantCostReduction',
      action: 'add',
      value: 0.1
    }
  },
  {
    id: 'animalTraining',
    name: 'Animal Training',
    description: 'Your human and animal assistants become more efficient.',
    type: 'global',
    cost: 2500,
    visible: true,
    trigger1: {
      type: 'assistantGroupOwned',
      value: 5,
      group: 'animals'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: .1,
      targetIds: 'group:animals'
    }
  },
  {
    id: 'machineMaintenance',
    name: 'Machine Maintenance',
    description: 'Your mechanical assistants operate at peak efficiency.',
    type: 'global',
    cost: 5000,
    visible: true,
    trigger1: {
      type: 'assistantGroupOwned',
      value: 5,
      group: 'machines'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: .1,
      targetIds: 'group:machines'
    }
  },

  // Snowball-Based Upgrades
  {
    id: 'snowballMastery',
    name: 'Snowball Mastery',
    description: 'You\'ve learned to pack snowballs more effectively.',
    type: 'global',
    cost: 10000,
    visible: true,
    trigger1: {
      type: 'lifetimeSnowballs',
      value: 100000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'clickPower',
      action: 'multiply',
      value: 2
    }
  },
  {
    id: 'massProduction',
    name: 'Mass Production',
    description: 'Industrial-scale snowball production methods.',
    type: 'global',
    cost: 100000,
    visible: true,
    trigger1: {
      type: 'lifetimeSnowballs',
      value: 1000000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: .1
    }
  },

  // Click-Based Upgrades
  {
    id: 'callousedFingers',
    name: 'Calloused Fingers',
    description: 'Your fingers have toughened from constant clicking.',
    type: 'global',
    cost: 500,
    visible: true,
    trigger1: {
      type: 'totalClicks',
      value: 1000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'clickPower',
      action: 'multiply',
      value: 2
    }
  },
  {
    id: 'clickReflexes',
    name: 'Click Reflexes',
    description: 'Lightning-fast clicking reflexes.',
    type: 'global',
    cost: 2500,
    visible: true,
    trigger1: {
      type: 'totalClicks',
      value: 5000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'clickPower',
      action: 'multiply',
      value: 2
    }
  },

  // ===== MID GAME UPGRADES (100 assistants, 1e10 snowballs) =====

  // Assistant-Based Upgrades
  {
    id: 'industrialRevolution',
    name: 'Industrial Revolution',
    description: 'Advanced manufacturing techniques reduce costs dramatically.',
    type: 'global',
    cost: 1000000,
    visible: true,
    trigger1: {
      type: 'assistantsNumberOwned',
      value: 50
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistantCostReduction',
      action: 'add',
      value: 0.1
    }
  },
  {
    id: 'magicalResonance',
    name: 'Magical Resonance',
    description: 'Magical beings amplify each other\'s power.',
    type: 'global',
    cost: 50000,
    visible: true,
    trigger1: {
      type: 'assistantGroupOwned',
      value: 5,
      group: 'magicalBeings'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: .5,
      targetIds: 'group:magicalBeings'
    }
  },
  {
    id: 'sportsDynasty',
    name: 'Sports Dynasty',
    description: 'Your sports teams dominate the competition.',
    type: 'global',
    cost: 25000,
    visible: true,
    trigger1: {
      type: 'assistantGroupOwned',
      value: 5,
      group: 'sports'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: .5,
      targetIds: 'group:sports'
    }
  },
  {
    id: 'architecturalMarvels',
    name: 'Architectural Marvels',
    description: 'Your buildings are engineering masterpieces.',
    type: 'global',
    cost: 75000,
    visible: true,
    trigger1: {
      type: 'assistantGroupOwned',
      value: 5,
      group: 'buildings'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: .5,
      targetIds: 'group:buildings'
    }
  },

  // Snowball-Based Upgrades
  {
    id: 'snowballEmpire',
    name: 'Snowball Empire',
    description: 'You control a vast snowball production empire.',
    type: 'global',
    cost: 10000000,
    visible: true,
    trigger1: {
      type: 'lifetimeSnowballs',
      value: 100000000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: .1
    }
  },
  {
    id: 'infiniteSnow',
    name: 'Infinite Snow',
    description: 'The snow never stops falling.',
    type: 'global',
    cost: 100000000,
    visible: true,
    trigger1: {
      type: 'lifetimeSnowballs',
      value: 10000000000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: .1
    }
  },

  // Boost-Based Upgrades
  {
    id: 'boostEfficiency',
    name: 'Boost Efficiency',
    description: 'Your boosts are more effective.',
    type: 'global',
    cost: 500000,
    visible: true,
    trigger1: {
      type: 'boostsPurchased',
      value: 10
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'boostEffectiveness',
      action: 'multiply',
      value: .1
    }
  },
  {
    id: 'boostMastery',
    name: 'Boost Mastery',
    description: 'You\'ve mastered the art of boost optimization.',
    type: 'global',
    cost: 2500000,
    visible: true,
    trigger1: {
      type: 'boostsPurchased',
      value: 25
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'boostEffectiveness',
      action: 'multiply',
      value: .1
    }
  },
  {
    id: 'costOptimization',
    name: 'Cost Optimization',
    description: 'Boost costs are reduced through efficient purchasing.',
    type: 'global',
    cost: 1000000,
    visible: true,
    trigger1: {
      type: 'boostsPurchased',
      value: 15
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'boostCostReduction',
      action: 'add',
      value: 0.15
    }
  },

  // Time-Based Upgrades
  {
    id: 'experience',
    name: 'Experience',
    description: 'Time spent playing has made you more efficient.',
    type: 'global',
    cost: 100000,
    visible: true,
    trigger1: {
      type: 'timePlayed',
      value: 3600 // 1 hour in seconds
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: .1
    }
  },
  {
    id: 'veteranStatus',
    name: 'Veteran Status',
    description: 'You\'re a seasoned snowball warrior.',
    type: 'global',
    cost: 1000000,
    visible: true,
    trigger1: {
      type: 'timePlayed',
      value: 36000 // 10 hours in seconds
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: .1
    }
  },

  // ===== LATE GAME UPGRADES (200+ assistants, 1e12+ snowballs) =====

  // Assistant-Based Upgrades
  {
    id: 'supremeCommander',
    name: 'Supreme Commander',
    description: 'You command an army of assistants with perfect efficiency.',
    type: 'global',
    cost: 1000000000,
    visible: true,
    trigger1: {
      type: 'assistantsNumberOwned',
      value: 150
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistantCostReduction',
      action: 'add',
      value: 0.3
    }
  },
  {
    id: 'mythicalBond',
    name: 'Mythical Bond',
    description: 'You\'ve formed a deep bond with mythical creatures.',
    type: 'global',
    cost: 500000000,
    visible: true,
    trigger1: {
      type: 'assistantGroupOwned',
      value: 5,
      group: 'mythicalBeasts'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: 3,
      targetIds: 'group:mythicalBeasts'
    }
  },
  {
    id: 'naturesWrath',
    name: 'Nature\'s Wrath',
    description: 'Natural forces amplify your power.',
    type: 'global',
    cost: 750000000,
    visible: true,
    trigger1: {
      type: 'assistantGroupOwned',
      value: 5,
      group: 'motherNature'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: 3,
      targetIds: 'group:motherNature'
    }
  },
  {
    id: 'spaceProgram',
    name: 'Space Program',
    description: 'Your space-based assistants reach new heights.',
    type: 'global',
    cost: 1000000000,
    visible: true,
    trigger1: {
      type: 'assistantGroupOwned',
      value: 5,
      group: 'space'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: 3,
      targetIds: 'group:space'
    }
  },

  // Snowball-Based Upgrades
  {
    id: 'snowballSingularity',
    name: 'Snowball Singularity',
    description: 'You\'ve achieved the impossible - infinite snowball production.',
    type: 'global',
    cost: 10000000000,
    visible: true,
    trigger1: {
      type: 'lifetimeSnowballs',
      value: 1000000000000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: 6
    }
  },
  {
    id: 'cosmicSnow',
    name: 'Cosmic Snow',
    description: 'Snow from the depths of space itself.',
    type: 'global',
    cost: 100000000000,
    visible: true,
    trigger1: {
      type: 'lifetimeSnowballs',
      value: 1000000000000000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: 11
    }
  },

  // Yeti-Based Upgrades
  {
    id: 'yetiHunter',
    name: 'Yeti Hunter',
    description: 'You\'ve become an expert at defeating yetis.',
    type: 'global',
    cost: 50000000,
    visible: true,
    trigger1: {
      type: 'yetisClicked',
      value: 100
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'clickPower',
      action: 'multiply',
      value: 2
    }
  },
  {
    id: 'yetiMaster',
    name: 'Yeti Master',
    description: 'You\'ve defeated every type of yeti known to exist.',
    type: 'global',
    cost: 500000000,
    visible: true,
    trigger1: {
      type: 'yetiClassesClicked',
      value: 4
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'clickPower',
      action: 'multiply',
      value: 3
    }
  },

  // Location-Based Upgrades
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'You\'ve traveled to many distant lands.',
    type: 'global',
    cost: 10000000,
    visible: true,
    trigger1: {
      type: 'locationsTraveled',
      value: 10
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: 1.5
    }
  },
  {
    id: 'worldTraveler',
    name: 'World Traveler',
    description: 'You\'ve visited every type of location in the world.',
    type: 'global',
    cost: 100000000,
    visible: true,
    trigger1: {
      type: 'locationClassesVisited',
      value: 4
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: 2
    }
  },

  // Battle-Based Upgrades
  {
    id: 'battleHardened',
    name: 'Battle Hardened',
    description: 'Years of combat have made you stronger.',
    type: 'global',
    cost: 50000000,
    visible: true,
    trigger1: {
      type: 'battlesWon',
      value: 50
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: 1.75
    }
  },
  {
    id: 'mechDestroyer',
    name: 'Mech Destroyer',
    description: 'You\'ve defeated every type of mechanical yeti.',
    type: 'global',
    cost: 500000000,
    visible: true,
    trigger1: {
      type: 'mechYetiClassesDefeated',
      value: 4
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: 2.5
    }
  },

  // Icicle-Based Upgrades
  {
    id: 'icicleFarmer',
    name: 'Icicle Farmer',
    description: 'You\'ve mastered the art of icicle harvesting.',
    type: 'global',
    cost: 25000000,
    visible: true,
    trigger1: {
      type: 'iciclesHarvested',
      value: 1000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'icicleRate',
      action: 'multiply',
      value: 1.5
    }
  },
  {
    id: 'icicleMaster',
    name: 'Icicle Master',
    description: 'You\'re the undisputed master of icicle collection.',
    type: 'global',
    cost: 250000000,
    visible: true,
    trigger1: {
      type: 'iciclesHarvested',
      value: 10000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'icicleRate',
      action: 'multiply',
      value: 2
    }
  },

  // Group Collection Upgrades
  {
    id: 'animalKingdom',
    name: 'Animal Kingdom',
    description: 'You have a complete collection of animal assistants.',
    type: 'global',
    cost: 1000000,
    visible: true,
    trigger1: {
      type: 'assistantGroupComplete',
      value: 5,
      group: 'animals'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: 1.5,
      targetIds: 'group:animals'
    }
  },
  {
    id: 'machineEmpire',
    name: 'Machine Empire',
    description: 'You have a complete collection of mechanical assistants.',
    type: 'global',
    cost: 5000000,
    visible: true,
    trigger1: {
      type: 'assistantGroupComplete',
      value: 5,
      group: 'machines'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: 1.5,
      targetIds: 'group:machines'
    }
  },
  {
    id: 'magicalAcademy',
    name: 'Magical Academy',
    description: 'You have a complete collection of magical beings.',
    type: 'global',
    cost: 10000000,
    visible: true,
    trigger1: {
      type: 'assistantGroupComplete',
      value: 5,
      group: 'magicalBeings'
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: 1.5,
      targetIds: 'group:magicalBeings'
    }
  },

  // ===== EXISTING UPGRADES (keeping for compatibility) =====
  {
    id: 'coloredSnowballs',
    name: 'Colored Snowballs',
    description: 'Fancy and fast.',
    type: 'global',
    cost: 10.0,
    visible: true,
    trigger1: {
      type: 'assistantsNumberOwned',
      value: 5
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: 2
    }
  },
  {
    id: 'coldFusionCores',
    name: 'Cold Fusion Cores',
    description: 'A tech breakthrough in snowball science.',
    type: 'global',
    cost: 10.0,
    visible: true,
    trigger1: {
      type: 'assistantsNumberOwned',
      value: 10
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: 2
    }
  },
  {
    id: 'perfectPacking',
    name: 'Perfect Packing',
    description: 'Denser snow = harder hits.',
    type: 'global',
    cost: 10.0,
    visible: true,
    trigger1: {
      type: 'lifetimeSnowballs',
      value: 1000
    },
    trigger2: {
      exists: false
    },
    join: '',
    effect: {
      target: 'sps',
      action: 'multiply',
      value: 2
    }
  },
  {
    id: 'test',
    name: 'test',
    description: 'test of join',
    type: '',
    cost: 10.0,
    visible: true,
    trigger1: {
      type: 'assistantsNumberOwned',
      value: 5
    },
    trigger2: {
      exists: true,
      type: 'lifetimeSnowballs',
      value: 10000
    },
    join: 'and',
    effect: {
      target: 'snowballs',
      action: 'grantOnce',
      value: 1000000
    }
  },
  {
    id: 'animalBehavior',
    name: 'Animal Behavior',
    description: 'Doubles the SPS of all two and four legged animals!',
    type: 'global',
    cost: 1000,
    visible: true,
    trigger1: {
      type: 'assistantsNumberOwned',
      value: 25
    },
    trigger2: {
      exists: false
    },
    join: 'AND',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: 3,
      targetIds: 'group:animals'
    }
  },
  {
    id: 'animalBehavior2',
    name: 'Animal Behavior 2',
    description: 'Doubles the SPS of all two and four legged animals!',
    type: 'global',
    cost: 1000,
    visible: true,
    trigger1: {
      type: 'assistantIdOwned',
      value: 'additionalArm'
    },
    trigger2: {
      exists: true,
      type: 'assistantIdOwned',
      value: 'neighborKids'
    },
    join: 'AND',
    effect: {
      target: 'assistants',
      action: 'multiply',
      value: 2,
      targetIds: 'group:animals'
    }
  }
];