/**
 * unifiedUpgradeData.js - Unified upgrade system data
 * 
 * This consolidates all upgrade types (boosts, global upgrades, yeti jr) into a single
 * data structure with simplified triggers and consistent effects.
 * 
 * TRIGGER TYPES:
 * - assistantCount: Requires specific number of assistants owned
 * - lifetimeSnowballs: Requires specific lifetime snowball count
 * - totalClicks: Requires specific total click count
 * - boostsOwned: Requires specific number of boosts purchased
 * - locationsUnlocked: Requires specific number of locations unlocked
 * - yetisSighted: Requires specific number of yetis encountered
 * - playTimeHours: Requires specific play time in hours
 * - prestigeCount: Requires specific prestige count
 * 
 * EFFECT TYPES:
 * - spsMultiplier: Multiplies global SPS by value
 * - clickMultiplier: Multiplies click power by value
 * - assistantMultiplier: Multiplies specific assistant SPS by value
 * - assistantGroupMultiplier: Multiplies assistant group SPS by value
 * - costReduction: Reduces assistant costs by percentage
 * - boostEffectiveness: Multiplies boost effects by value
 * - grantSnowballs: Grants one-time snowball amount
 * - unlockLocation: Unlocks specific location
 */

// Import existing data for migration
// Note: BOOSTS import removed - all boost data is now defined directly in this file
import { GLOBAL_UPGRADES } from '../../../global/data/globalUpgradeData.js';
import { ASSISTANTS } from './assistantData.js';

/**
 * Unified upgrade data structure
 * All upgrades use the same format for consistency and simplicity
 */
export const UNIFIED_UPGRADES = [
  // ===== BOOSTS (all boost data defined directly) =====
  // Additional Arm Boosts
  {
    id: 'quickDraw',
    name: 'Quick Draw',
    icon: './images/additionalArm_small.png',
    description: 'Unleash the hidden power of your Additional Arms! Quick Draw multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 15,
    trigger: {
      type: 'assistantCount',
      assistantId: 'additionalArm',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'additionalArm',
      value: 0.25
    },
    order: 1
  },
  {
    id: 'doubleTrouble',
    name: 'Double Trouble',
    icon: './images/additionalArm_small.png',
    description: 'Supercharge your Additional Arms to incredible levels! Double Trouble multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 40,
    trigger: {
      type: 'assistantCount',
      assistantId: 'additionalArm',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'additionalArm',
      value: 0.5
    },
    order: 2
  },
  {
    id: 'rapidReflexes',
    name: 'Rapid Reflexes',
    icon: './images/additionalArm_small.png',
    description: 'Transform your Additional Arms into unstoppable snowball factories! Rapid Reflexes multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 80,
    trigger: {
      type: 'assistantCount',
      assistantId: 'additionalArm',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'additionalArm',
      value: 0.75
    },
    order: 3
  },
  {
    id: 'snowstormStrikes',
    name: 'Snowstorm Strikes',
    icon: './images/additionalArm_small.png',
    description: 'Unlock the ultimate potential of your Additional Arms! Snowstorm Strikes multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 200,
    trigger: {
      type: 'assistantCount',
      assistantId: 'additionalArm',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'additionalArm',
      value: 1.0
    },
    order: 4
  },

  // Neighbor Kids Boosts
  {
    id: 'slingshots',
    name: 'Slingshots',
    icon: './images/neighborKids_small.png',
    description: 'Unleash the hidden power of your Neighbor Kids! Slingshots multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 50,
    trigger: {
      type: 'assistantCount',
      assistantId: 'neighborKids',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'neighborKids',
      value: 0.25
    },
    order: 5
  },
  {
    id: 'sugarRush',
    name: 'Sugar Rush',
    icon: './images/neighborKids_small.png',
    description: 'Supercharge your Neighbor Kids to incredible levels! Sugar Rush multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 120,
    trigger: {
      type: 'assistantCount',
      assistantId: 'neighborKids',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'neighborKids',
      value: 0.5
    },
    order: 6
  },
  {
    id: 'snowGoggles',
    name: 'Snow Goggles',
    icon: './images/neighborKids_small.png',
    description: 'Transform your Neighbor Kids into unstoppable snowball factories! Snow Goggles multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 320,
    trigger: {
      type: 'assistantCount',
      assistantId: 'neighborKids',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'neighborKids',
      value: 0.75
    },
    order: 7
  },
  {
    id: 'iceBoots',
    name: 'Ice Boots',
    icon: './images/neighborKids_small.png',
    description: 'Unlock the ultimate potential of your Neighbor Kids! Ice Boots multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 750,
    trigger: {
      type: 'assistantCount',
      assistantId: 'neighborKids',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'neighborKids',
      value: 1.0
    },
    order: 8
  },

  // Ball Machine Boosts
  {
    id: 'spinCalibration',
    name: 'Spin Calibration',
    icon: './images/ballMachine_small.png',
    description: 'Unleash the hidden power of your Ball Machine! Spin Calibration multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 120,
    trigger: {
      type: 'assistantCount',
      assistantId: 'ballMachine',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'ballMachine',
      value: 0.25
    },
    order: 9
  },
  {
    id: 'rapidReload',
    name: 'Rapid Reload',
    icon: './images/ballMachine_small.png',
    description: 'Supercharge your Ball Machine to incredible levels! Rapid Reload multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 350,
    trigger: {
      type: 'assistantCount',
      assistantId: 'ballMachine',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'ballMachine',
      value: 0.5
    },
    order: 10
  },
  {
    id: 'targetingSensor',
    name: 'Targeting Sensor',
    icon: './images/ballMachine_small.png',
    description: 'Transform your Ball Machine into unstoppable snowball factories! Targeting Sensor multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 800,
    trigger: {
      type: 'assistantCount',
      assistantId: 'ballMachine',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'ballMachine',
      value: 0.75
    },
    order: 11
  },
  {
    id: 'dualLaunchers',
    name: 'Dual Launchers',
    icon: './images/ballMachine_small.png',
    description: 'Unlock the ultimate potential of your Ball Machine! Dual Launchers multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 2000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'ballMachine',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'ballMachine',
      value: 1.0
    },
    order: 12
  },

  // Polar Bear Family Boosts
  {
    id: 'bearClaws',
    name: 'Bear Claws',
    icon: './images/polarBearFamily_small.png',
    description: 'Unleash the hidden power of your Polar Bear Family! Bear Claws multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 300,
    trigger: {
      type: 'assistantCount',
      assistantId: 'polarBearFamily',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'polarBearFamily',
      value: 0.25
    },
    order: 13
  },
  {
    id: 'iceToss',
    name: 'Ice Toss',
    icon: './images/polarBearFamily_small.png',
    description: 'Supercharge your Polar Bear Family to incredible levels! Ice Toss multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 750,
    trigger: {
      type: 'assistantCount',
      assistantId: 'polarBearFamily',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'polarBearFamily',
      value: 0.5
    },
    order: 14
  },
  {
    id: 'polarPrecision',
    name: 'Polar Precision',
    icon: './images/polarBearFamily_small.png',
    description: 'Transform your Polar Bear Family into unstoppable snowball factories! Polar Precision multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 2000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'polarBearFamily',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'polarBearFamily',
      value: 0.75
    },
    order: 15
  },
  {
    id: 'grizzlyBlitz',
    name: 'Grizzly Blitz',
    icon: './images/polarBearFamily_small.png',
    description: 'Unlock the ultimate potential of your Polar Bear Family! Grizzly Blitz multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 5000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'polarBearFamily',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'polarBearFamily',
      value: 1.0
    },
    order: 16
  },

  // Snow Blower Boosts
  {
    id: 'turboFan',
    name: 'Turbo Fan',
    icon: './images/snowBlower_small.png',
    description: 'Unleash the hidden power of your Snow Blower! Turbo Fan multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 1500,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowBlower',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowBlower',
      value: 0.25
    },
    order: 17
  },
  {
    id: 'heatedChute',
    name: 'Heated Chute',
    icon: './images/snowBlower_small.png',
    description: 'Supercharge your Snow Blower to incredible levels! Heated Chute multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 4000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowBlower',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowBlower',
      value: 0.5
    },
    order: 18
  },
  {
    id: 'reverseJet',
    name: 'Reverse Jet',
    icon: './images/snowBlower_small.png',
    description: 'Transform your Snow Blower into unstoppable snowball factories! Reverse Jet multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 9500,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowBlower',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowBlower',
      value: 0.75
    },
    order: 19
  },
  {
    id: 'snowSurge',
    name: 'Snow Surge',
    icon: './images/snowBlower_small.png',
    description: 'Unlock the ultimate potential of your Snow Blower! Snow Surge multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 25000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowBlower',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowBlower',
      value: 1.0
    },
    order: 20
  },

  // Hockey Team Boosts
  {
    id: 'coachingStaff',
    name: 'Coaching Staff',
    icon: './images/hockeyTeam_small.png',
    description: 'Unleash the hidden power of your Hockey Team! Coaching Staff multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 7500,
    trigger: {
      type: 'assistantCount',
      assistantId: 'hockeyTeam',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'hockeyTeam',
      value: 0.25
    },
    order: 21
  },
  {
    id: 'newSticks',
    name: 'New Sticks',
    icon: './images/hockeyTeam_small.png',
    description: 'Supercharge your Hockey Team to incredible levels! New Sticks multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 20000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'hockeyTeam',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'hockeyTeam',
      value: 0.5
    },
    order: 22
  },
  {
    id: 'puckLauncher',
    name: 'Puck Launcher',
    icon: './images/hockeyTeam_small.png',
    description: 'Transform your Hockey Team into unstoppable snowball factories! Puck Launcher multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 50000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'hockeyTeam',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'hockeyTeam',
      value: 0.75
    },
    order: 23
  },
  {
    id: 'overtimeDrive',
    name: 'Overtime Drive',
    icon: './images/hockeyTeam_small.png',
    description: 'Unlock the ultimate potential of your Hockey Team! Overtime Drive multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 120000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'hockeyTeam',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'hockeyTeam',
      value: 1.0
    },
    order: 24
  },

  // Igloo Arsenal Boosts
  {
    id: 'iceTurrets',
    name: 'Ice Turrets',
    icon: './images/iglooArsenal_small.png',
    description: 'Unleash the hidden power of your Igloo Arsenal! Ice Turrets multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 35000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'iglooArsenal',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'iglooArsenal',
      value: 0.25
    },
    order: 25
  },
  {
    id: 'frostShields',
    name: 'Frost Shields',
    icon: './images/iglooArsenal_small.png',
    description: 'Supercharge your Igloo Arsenal to incredible levels! Frost Shields multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 95000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'iglooArsenal',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'iglooArsenal',
      value: 0.5
    },
    order: 26
  },
  {
    id: 'glacierAmmo',
    name: 'Glacier Ammo',
    icon: './images/iglooArsenal_small.png',
    description: 'Transform your Igloo Arsenal into unstoppable snowball factories! Glacier Ammo multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 240000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'iglooArsenal',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'iglooArsenal',
      value: 0.75
    },
    order: 27
  },
  {
    id: 'snowShells',
    name: 'Snow Shells',
    icon: './images/iglooArsenal_small.png',
    description: 'Unlock the ultimate potential of your Igloo Arsenal! Snow Shells multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 600000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'iglooArsenal',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'iglooArsenal',
      value: 1.0
    },
    order: 28
  },

  // Golfing Range Boosts
  {
    id: 'pressureBoost',
    name: 'Pressure Boost',
    icon: './images/golfingRange_small.png',
    description: 'Unleash the hidden power of your Golfing Range! Pressure Boost multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 200000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'golfingRange',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'golfingRange',
      value: 0.25
    },
    order: 29
  },
  {
    id: 'autoTargeting',
    name: 'Auto Targeting',
    icon: './images/golfingRange_small.png',
    description: 'Supercharge your Golfing Range to incredible levels! Auto Targeting multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 500000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'golfingRange',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'golfingRange',
      value: 0.5
    },
    order: 30
  },
  {
    id: 'quadBarrel',
    name: 'Quad Barrel',
    icon: './images/golfingRange_small.png',
    description: 'Transform your Golfing Range into unstoppable snowball factories! Quad Barrel multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 1300000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'golfingRange',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'golfingRange',
      value: 0.75
    },
    order: 31
  },
  {
    id: 'snowStream',
    name: 'Snow Stream',
    icon: './images/golfingRange_small.png',
    description: 'Unlock the ultimate potential of your Golfing Range! Snow Stream multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 3100000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'golfingRange',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'golfingRange',
      value: 1.0
    },
    order: 32
  },

  // Snowstorm Boosts
  {
    id: 'coldFront',
    name: 'Cold Front',
    icon: './images/snowstorm_small.png',
    description: 'Unleash the hidden power of your Snowstorm! Cold Front multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 950000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowstorm',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowstorm',
      value: 0.25
    },
    order: 33
  },
  {
    id: 'jetstreamShift',
    name: 'Jetstream Shift',
    icon: './images/snowstorm_small.png',
    description: 'Supercharge your Snowstorm to incredible levels! Jetstream Shift multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 2500000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowstorm',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowstorm',
      value: 0.5
    },
    order: 34
  },
  {
    id: 'frozenCyclone',
    name: 'Frozen Cyclone',
    icon: './images/snowstorm_small.png',
    description: 'Transform your Snowstorm into unstoppable snowball factories! Frozen Cyclone multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 6500000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowstorm',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowstorm',
      value: 0.75
    },
    order: 35
  },
  {
    id: 'whiteout',
    name: 'Whiteout',
    icon: './images/snowstorm_small.png',
    description: 'Unlock the ultimate potential of your Snowstorm! Whiteout multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 15500000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowstorm',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowstorm',
      value: 1.0
    },
    order: 36
  },

  // Snow Princess Boosts
  {
    id: 'magicMittens',
    name: 'Magic Mittens',
    icon: './images/snowPrincess_small.png',
    description: 'Unleash the hidden power of your Snow Princess! Magic Mittens multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 4800000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowPrincess',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowPrincess',
      value: 0.25
    },
    order: 37
  },
  {
    id: 'frozenFury',
    name: 'Frozen Fury',
    icon: './images/snowPrincess_small.png',
    description: 'Supercharge your Snow Princess to incredible levels! Frozen Fury multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 12400000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowPrincess',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowPrincess',
      value: 0.5
    },
    order: 38
  },
  {
    id: 'snowDance',
    name: 'Snow Dance',
    icon: './images/snowPrincess_small.png',
    description: 'Transform your Snow Princess into unstoppable snowball factories! Snow Dance multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 31800000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowPrincess',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowPrincess',
      value: 0.75
    },
    order: 39
  },
  {
    id: 'northernLights',
    name: 'Northern Lights',
    icon: './images/snowPrincess_small.png',
    description: 'Unlock the ultimate potential of your Snow Princess! Northern Lights multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 78000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowPrincess',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowPrincess',
      value: 1.0
    },
    order: 40
  },

  // Winter Fortress Boosts
  {
    id: 'icicleCannons',
    name: 'Icicle Cannons',
    icon: './images/winterFortress_small.png',
    description: 'Unleash the hidden power of your Winter Fortress! Icicle Cannons multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 23800000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'winterFortress',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'winterFortress',
      value: 0.25
    },
    order: 41
  },
  {
    id: 'arcticGuard',
    name: 'Arctic Guard',
    icon: './images/winterFortress_small.png',
    description: 'Supercharge your Winter Fortress to incredible levels! Arctic Guard multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 61700000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'winterFortress',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'winterFortress',
      value: 0.5
    },
    order: 42
  },
  {
    id: 'blizzardBunker',
    name: 'Blizzard Bunker',
    icon: './images/winterFortress_small.png',
    description: 'Transform your Winter Fortress into unstoppable snowball factories! Blizzard Bunker multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 160000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'winterFortress',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'winterFortress',
      value: 0.75
    },
    order: 43
  },
  {
    id: 'permafrostCore',
    name: 'Permafrost Core',
    icon: './images/winterFortress_small.png',
    description: 'Unlock the ultimate potential of your Winter Fortress! Permafrost Core multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 390000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'winterFortress',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'winterFortress',
      value: 1.0
    },
    order: 44
  },

  // Wizard Blizzard Boosts
  {
    id: 'enchantedGloves',
    name: 'Enchanted Gloves',
    icon: './images/wizardBlizzard_small.png',
    description: 'Unleash the hidden power of your Wizard Blizzard! Enchanted Gloves multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 120000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'wizardBlizzard',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'wizardBlizzard',
      value: 0.25
    },
    order: 45
  },
  {
    id: 'tomeofTundra',
    name: 'Tome of Tundra',
    icon: './images/wizardBlizzard_small.png',
    description: 'Supercharge your Wizard Blizzard to incredible levels! Tome of Tundra multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 310000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'wizardBlizzard',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'wizardBlizzard',
      value: 0.5
    },
    order: 46
  },
  {
    id: 'blizzardRing',
    name: 'Blizzard Ring',
    icon: './images/wizardBlizzard_small.png',
    description: 'Transform your Wizard Blizzard into unstoppable snowball factories! Blizzard Ring multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 795000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'wizardBlizzard',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'wizardBlizzard',
      value: 0.75
    },
    order: 47
  },
  {
    id: 'frostNova',
    name: 'Frost Nova',
    icon: './images/wizardBlizzard_small.png',
    description: 'Unlock the ultimate potential of your Wizard Blizzard! Frost Nova multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 1950000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'wizardBlizzard',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'wizardBlizzard',
      value: 1.0
    },
    order: 48
  },

  // Avalanche Boosts
  {
    id: 'landslideProtocol',
    name: 'Landslide Protocol',
    icon: './images/avalanche_small.png',
    description: 'Unleash the hidden power of your Avalanche! Landslide Protocol multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 620000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'avalanche',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'avalanche',
      value: 0.25
    },
    order: 49
  },
  {
    id: 'echoWave',
    name: 'Echo Wave',
    icon: './images/avalanche_small.png',
    description: 'Supercharge your Avalanche to incredible levels! Echo Wave multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 1600000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'avalanche',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'avalanche',
      value: 0.5
    },
    order: 50
  },
  {
    id: 'slideSurge',
    name: 'Slide Surge',
    icon: './images/avalanche_small.png',
    description: 'Transform your Avalanche into unstoppable snowball factories! Slide Surge multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 3500000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'avalanche',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'avalanche',
      value: 0.75
    },
    order: 51
  },
  {
    id: 'cliffCrash',
    name: 'Cliff Crash',
    icon: './images/avalanche_small.png',
    description: 'Unlock the ultimate potential of your Avalanche! Cliff Crash multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 5700000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'avalanche',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'avalanche',
      value: 1.0
    },
    order: 52
  },

  // Snow Hurricane Boosts
  {
    id: 'eyeoftheStorm',
    name: 'Eye of the Storm',
    icon: './images/snowHurricane_small.png',
    description: 'Unleash the hidden power of your Snow Hurricane! Eye of the Storm multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 3100000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowHurricane',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowHurricane',
      value: 0.25
    },
    order: 53
  },
  {
    id: 'polarVortex',
    name: 'Polar Vortex',
    icon: './images/snowHurricane_small.png',
    description: 'Supercharge your Snow Hurricane to incredible levels! Polar Vortex multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 7800000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowHurricane',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowHurricane',
      value: 0.5
    },
    order: 54
  },
  {
    id: 'cycloneEcho',
    name: 'Cyclone Echo',
    icon: './images/snowHurricane_small.png',
    description: 'Transform your Snow Hurricane into unstoppable snowball factories! Cyclone Echo multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 18000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowHurricane',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowHurricane',
      value: 0.75
    },
    order: 55
  },
  {
    id: 'winterWall',
    name: 'Winter Wall',
    icon: './images/snowHurricane_small.png',
    description: 'Unlock the ultimate potential of your Snow Hurricane! Winter Wall multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 28000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowHurricane',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowHurricane',
      value: 1.0
    },
    order: 56
  },

  // Ice Dragon Boosts
  {
    id: 'moltenCore',
    name: 'Molten Core',
    icon: './images/iceDragon_small.png',
    description: 'Unleash the hidden power of your Ice Dragon! Molten Core multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 16000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'iceDragon',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'iceDragon',
      value: 0.25
    },
    order: 57
  },
  {
    id: 'frostbiteRoar',
    name: 'Frostbite Roar',
    icon: './images/iceDragon_small.png',
    description: 'Supercharge your Ice Dragon to incredible levels! Frostbite Roar multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 39000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'iceDragon',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'iceDragon',
      value: 0.5
    },
    order: 58
  },
  {
    id: 'cryoHowl',
    name: 'Cryo Howl',
    icon: './images/iceDragon_small.png',
    description: 'Transform your Ice Dragon into unstoppable snowball factories! Cryo Howl multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 88000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'iceDragon',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'iceDragon',
      value: 0.75
    },
    order: 59
  },
  {
    id: 'dragonGale',
    name: 'Dragon Gale',
    icon: './images/iceDragon_small.png',
    description: 'Unlock the ultimate potential of your Ice Dragon! Dragon Gale multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 140000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'iceDragon',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'iceDragon',
      value: 1.0
    },
    order: 60
  },

  // Frost Giant Boosts
  {
    id: 'frozenFootsteps',
    name: 'Frozen Footsteps',
    icon: './images/frostGiant_small.png',
    description: 'Unleash the hidden power of your Frost Giant! Frozen Footsteps multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 75000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'frostGiant',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'frostGiant',
      value: 0.25
    },
    order: 61
  },
  {
    id: 'glacierGauntlets',
    name: 'Glacier Gauntlets',
    icon: './images/frostGiant_small.png',
    description: 'Supercharge your Frost Giant to incredible levels! Glacier Gauntlets multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 190000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'frostGiant',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'frostGiant',
      value: 0.5
    },
    order: 62
  },
  {
    id: 'frozenRoar',
    name: 'Frozen Roar',
    icon: './images/frostGiant_small.png',
    description: 'Transform your Frost Giant into unstoppable snowball factories! Frozen Roar multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 420000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'frostGiant',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'frostGiant',
      value: 0.75
    },
    order: 63
  },
  {
    id: 'arcticSmash',
    name: 'Arctic Smash',
    icon: './images/frostGiant_small.png',
    description: 'Unlock the ultimate potential of your Frost Giant! Arctic Smash multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 680000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'frostGiant',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'frostGiant',
      value: 1.0
    },
    order: 64
  },

  // Orbital Snow Cannon Boosts
  {
    id: 'satNavLock',
    name: 'SatNav Lock',
    icon: './images/orbitalSnowCannon_small.png',
    description: 'Unleash the hidden power of your Orbital Snow Cannon! SatNav Lock multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 380000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'orbitalSnowCannon',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'orbitalSnowCannon',
      value: 0.25
    },
    order: 65
  },
  {
    id: 'cryoPayload',
    name: 'Cryo Payload',
    icon: './images/orbitalSnowCannon_small.png',
    description: 'Supercharge your Orbital Snow Cannon to incredible levels! Cryo Payload multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 940000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'orbitalSnowCannon',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'orbitalSnowCannon',
      value: 0.5
    },
    order: 66
  },
  {
    id: 'orbitalSpin',
    name: 'Orbital Spin',
    icon: './images/orbitalSnowCannon_small.png',
    description: 'Transform your Orbital Snow Cannon into unstoppable snowball factories! Orbital Spin multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 2100000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'orbitalSnowCannon',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'orbitalSnowCannon',
      value: 0.75
    },
    order: 67
  },
  {
    id: 'stratosnow',
    name: 'Stratosnow',
    icon: './images/orbitalSnowCannon_small.png',
    description: 'Unlock the ultimate potential of your Orbital Snow Cannon! Stratosnow multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 3400000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'orbitalSnowCannon',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'orbitalSnowCannon',
      value: 1.0
    },
    order: 68
  },

  // Temple of Winter Boosts
  {
    id: 'monasticDiscipline',
    name: 'Monastic Discipline',
    icon: './images/templeofWinter_small.png',
    description: 'Unleash the hidden power of your Temple of Winter! Monastic Discipline multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 2000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'templeofWinter',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'templeofWinter',
      value: 0.25
    },
    order: 69
  },
  {
    id: 'frozenZen',
    name: 'Frozen Zen',
    icon: './images/templeofWinter_small.png',
    description: 'Supercharge your Temple of Winter to incredible levels! Frozen Zen multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 5000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'templeofWinter',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'templeofWinter',
      value: 0.5
    },
    order: 70
  },
  {
    id: 'chapelChill',
    name: 'Chapel Chill',
    icon: './images/templeofWinter_small.png',
    description: 'Transform your Temple of Winter into unstoppable snowball factories! Chapel Chill multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 11000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'templeofWinter',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'templeofWinter',
      value: 0.75
    },
    order: 71
  },
  {
    id: 'icicleChant',
    name: 'Icicle Chant',
    icon: './images/templeofWinter_small.png',
    description: 'Unlock the ultimate potential of your Temple of Winter! Icicle Chant multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 18000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'templeofWinter',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'templeofWinter',
      value: 1.0
    },
    order: 72
  },

  // Cryo Core Boosts
  {
    id: 'coolantOverclock',
    name: 'Coolant Overclock',
    icon: './images/cryoCore_small.png',
    description: 'Unleash the hidden power of your Cryo Core! Coolant Overclock multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 10000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'cryoCore',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'cryoCore',
      value: 0.25
    },
    order: 73
  },
  {
    id: 'quantumFrost',
    name: 'Quantum Frost',
    icon: './images/cryoCore_small.png',
    description: 'Supercharge your Cryo Core to incredible levels! Quantum Frost multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 25000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'cryoCore',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'cryoCore',
      value: 0.5
    },
    order: 74
  },
  {
    id: 'nanoIce',
    name: 'Nano Ice',
    icon: './images/cryoCore_small.png',
    description: 'Transform your Cryo Core into unstoppable snowball factories! Nano Ice multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 56000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'cryoCore',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'cryoCore',
      value: 0.75
    },
    order: 75
  },
  {
    id: 'cryoSync',
    name: 'Cryo Sync',
    icon: './images/cryoCore_small.png',
    description: 'Unlock the ultimate potential of your Cryo Core! Cryo Sync multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 91000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'cryoCore',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'cryoCore',
      value: 1.0
    },
    order: 76
  },

  // Snow Singularity Boosts
  {
    id: 'infiniteFeedback',
    name: 'Infinite Feedback',
    icon: './images/snowSingularity_small.png',
    description: 'Unleash the hidden power of your Snow Singularity! Infinite Feedback multiplies their snowball production by 1.25x',
    type: 'boost',
    cost: 50000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowSingularity',
      value: 10
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowSingularity',
      value: 0.25
    },
    order: 77
  },
  {
    id: 'eventHorizon',
    name: 'Event Horizon',
    icon: './images/snowSingularity_small.png',
    description: 'Supercharge your Snow Singularity to incredible levels! Event Horizon multiplies their snowball production by 1.5x',
    type: 'boost',
    cost: 120000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowSingularity',
      value: 20
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowSingularity',
      value: 0.5
    },
    order: 78
  },
  {
    id: 'feedbackLoop',
    name: 'Feedback Loop',
    icon: './images/snowSingularity_small.png',
    description: 'Transform your Snow Singularity into unstoppable snowball factories! Feedback Loop multiplies their snowball production by 1.75x',
    type: 'boost',
    cost: 280000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowSingularity',
      value: 30
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowSingularity',
      value: 0.75
    },
    order: 79
  },
  {
    id: 'frozenDimension',
    name: 'Frozen Dimension',
    icon: './images/snowSingularity_small.png',
    description: 'Unlock the ultimate potential of your Snow Singularity! Frozen Dimension multiplies their snowball production by 2.0x',
    type: 'boost',
    cost: 460000000000000,
    trigger: {
      type: 'assistantCount',
      assistantId: 'snowSingularity',
      value: 40
    },
    effect: {
      type: 'assistantMultiplier',
      assistantId: 'snowSingularity',
      value: 1.0
    },
    order: 80
  },

  // ===== GLOBAL UPGRADES (LEGACY - Currently Unused) =====
  // NOTE: These upgrades are defined but not currently integrated into the game logic.
  // They may be used in future updates or can be removed if no longer needed.
  {
    id: 'teamSpirit',
    name: 'Team Spirit',
    icon: 'test.png',
    description: 'Your assistants work better together.',
    type: 'global',
    cost: 100,
    trigger: {
      type: 'assistantCount',
      value: 10
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.1
    },
    order: 100
  },
  {
    id: 'assemblyLine',
    name: 'Assembly Line',
    icon: 'test.png',
    description: 'Streamlined assistant production reduces costs.',
    type: 'global',
    cost: 500,
    trigger: {
      type: 'assistantCount',
      value: 20
    },
    effect: {
      type: 'costReduction',
      value: 0.1
    },
    order: 101
  },
  {
    id: 'snowballMastery',
    name: 'Snowball Mastery',
    icon: 'test.png',
    description: 'You\'ve learned to pack snowballs more effectively.',
    type: 'global',
    cost: 10000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 100000
    },
    effect: {
      type: 'clickMultiplier',
      value: 2
    },
    order: 102
  },
  {
    id: 'massProduction',
    name: 'Mass Production',
    icon: 'test.png',
    description: 'Industrial-scale snowball production methods.',
    type: 'global',
    cost: 100000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1000000
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.1
    },
    order: 103
  },
  {
    id: 'callousedFingers',
    name: 'Calloused Fingers',
    icon: 'test.png',
    description: 'Your fingers have toughened from constant clicking.',
    type: 'global',
    cost: 500,
    trigger: {
      type: 'totalClicks',
      value: 1000
    },
    effect: {
      type: 'clickMultiplier',
      value: 2
    },
    order: 104
  },
  {
    id: 'clickReflexes',
    name: 'Click Reflexes',
    icon: 'test.png',
    description: 'Lightning-fast clicking reflexes.',
    type: 'global',
    cost: 2500,
    trigger: {
      type: 'totalClicks',
      value: 5000
    },
    effect: {
      type: 'clickMultiplier',
      value: 2
    },
    order: 105
  },


  // ===== YETI JR UPGRADES (Baby Yeti SPS boosts) =====
  {
    id: 'yetiJr6',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e4,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e6
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 206
  },
  {
    id: 'yetiJr7',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e5,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e7
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 207
  },
  {
    id: 'yetiJr8',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'A small yeti joins your snowball production team! This little helper provides a 1% boost to your snowball production speed. More yetis = more snowballs!',
    type: 'yetiJr',
    cost: 1e6,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e8
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 208
  },
  {
    id: 'yetiJr9',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'A small yeti joins your snowball production team! This little helper provides a 1% boost to your snowball production speed. More yetis = more snowballs!',
    type: 'yetiJr',
    cost: 1e7,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e9
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 209
  },
  {
    id: 'yetiJr10',
      name: 'Baby Yeti 1% Bonus',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e8,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e10
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 210
  },
  {
    id: 'yetiJr11',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e9,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e11
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 211
  },
  {
    id: 'yetiJr12',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e10,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e12
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 212
  },
  {
    id: 'yetiJr13',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e11,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e13
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 213
  },
  {
    id: 'yetiJr14',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'A baby yeti helps with snowball production.',
    type: 'yetiJr',
    cost: 1e12,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e14
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 214
  },
  {
    id: 'yetiJr15',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e13,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e15
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 215
  },
  {
    id: 'yetiJr16',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e14,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e16
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 216
  },
  {
    id: 'yetiJr17',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'A baby yeti helps with snowball production.',
    type: 'yetiJr',
    cost: 1e15,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e17
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 217
  },
  {
    id: 'yetiJr18',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e16,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e18
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 218
  },
  {
    id: 'yetiJr19',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'A baby yeti helps with snowball production.',
    type: 'yetiJr',
    cost: 1e17,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e19
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 219
  },
  {
    id: 'yetiJr20',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e18,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e20
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 220
  },
  {
    id: 'yetiJr21',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
      description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e19,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e21
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 221
  },
  {
    id: 'yetiJr22',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e20,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e22
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 222
  },
  {
    id: 'yetiJr23',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e21,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e23
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 223
  },
  {
    id: 'yetiJr24',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e22,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e24
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 224
  },
  {
    id: 'yetiJr25',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e23,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e25
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 225
  },
  {
    id: 'yetiJr26',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e24,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e26
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 226
  },
  {
    id: 'yetiJr27',
      name: 'Baby Yeti 1% Bonus',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e25,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e27
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 227
  },
  {
    id: 'yetiJr28',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e26,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e28
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 228
  },
  {
    id: 'yetiJr29',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e27,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e29
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 229
  },
  {
    id: 'yetiJr30',
    name: 'Yeti Crew Recruit',
    icon: './images/babyYeti1.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 1% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e28,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e30
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.01
    },
    order: 230
  },
  {
    id: 'yetiJr31',
    name: 'Yeti Crew Member',
    icon: './images/babyYeti2.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 2% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 3e8,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e10
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.02
    },
    order: 231
  },
  {
    id: 'yetiJr32',
    name: 'Yeti Crew Member',
    icon: './images/babyYeti2.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 2% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 3e13,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e15
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.02
    },
    order: 232
  },
  {
    id: 'yetiJr33',
    name: 'Yeti Crew Member',
    icon: './images/babyYeti2.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 2% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 3e18,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e20
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.02
    },
    order: 233
  },
  {
    id: 'yetiJr34',
      name: 'Baby Yeti 2% Bonus',
    icon: './images/babyYeti2.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 2% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 3e23,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e25
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.02
    },
    order: 234
  },
  {
    id: 'yetiJr35',
    name: 'Yeti Crew Member',
    icon: './images/babyYeti2.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 2% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 3e28,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e30
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.02
    },
    order: 235
  },
  {
    id: 'yetiJr36',
    name: 'Yeti Crew Expert',
    icon: './images/babyYeti3.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 3% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 7e7,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e9
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.03
    },
    order: 236
  },
  {
    id: 'yetiJr37',
    name: 'Yeti Crew Expert',
    icon: './images/babyYeti3.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 3% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 7e16,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e18
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.03
    },
    order: 237
  },
  {
    id: 'yetiJr38',
    name: 'Yeti Crew Expert',
    icon: './images/babyYeti3.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 3% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 7e25,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e27
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.03
    },
    order: 238
  },
  {
    id: 'yetiJr39',
    name: 'Yeti Crew Elite',
    icon: './images/babyYeti5.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 5% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e11,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e12
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.05
    },
    order: 239
  },
  {
    id: 'yetiJr40',
    name: 'Yeti Crew Elite',
    icon: './images/babyYeti5.png',
    description: 'Another yeti crew member arrives to help with production! This dedicated worker adds 5% to your snowball per second rate. Your yeti crew grows stronger!',
    type: 'yetiJr',
    cost: 1e23,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1e24
    },
    effect: {
      type: 'spsMultiplier',
      value: 0.05
    },
    order: 240
  },

  // ===== CLICK MULTIPLIER UPGRADES (non-persistent, reset on jumps) =====
  {
    id: 'clickMult1',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 1.5x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 900,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 10000
    },
    effect: {
      type: 'clickMultiplier',
      value: 0.5
    },
    order: 301
  },
  {
    id: 'clickMult2',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 2.0x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 9000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 100000
    },
    effect: {
      type: 'clickMultiplier',
      value: 1.0
    },
    order: 302
  },
  {
    id: 'clickMult3',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 3.0x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 90000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1000000
    },
    effect: {
      type: 'clickMultiplier',
      value: 2.0
    },
    order: 303
  },
  {
    id: 'clickMult4',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 5.0x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 900000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 10000000
    },
    effect: {
      type: 'clickMultiplier',
      value: 4.0
    },
    order: 304
  },
  {
    id: 'clickMult5',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 9.0x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 9000000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 100000000
    },
    effect: {
      type: 'clickMultiplier',
      value: 8.0
    },
    order: 305
  },
  {
    id: 'clickMult6',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 17.0x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 90000000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1000000000
    },
    effect: {
      type: 'clickMultiplier',
      value: 16.0
    },
    order: 306
  },
  {
    id: 'clickMult7',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 33.0x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 900000000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 10000000000
    },
    effect: {
      type: 'clickMultiplier',
      value: 32.0
    },
    order: 307
  },
  {
    id: 'clickMult8',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 65.0x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 9000000000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 100000000000
    },
    effect: {
      type: 'clickMultiplier',
      value: 64.0
    },
    order: 308
  },
  {
    id: 'clickMult9',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 129.0x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 90000000000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 1000000000000
    },
    effect: {
      type: 'clickMultiplier',
      value: 128.0
    },
    order: 309
  },
  {
    id: 'clickMult10',
    name: 'Tip of the Iceberg',
    icon: './images/clickMult.png',
    description: 'Like an iceberg, each click reveals hidden power beneath the surface. This upgrade multiplies your click power by 257.0x, making every snowball throw count for much more.',
    type: 'clickMultiplier',
    cost: 900000000000,
    trigger: {
      type: 'lifetimeSnowballs',
      value: 10000000000000
    },
    effect: {
      type: 'clickMultiplier',
      value: 256.0
    },
    order: 310
  }
];

/**
 * Get upgrades by type
 * @param {string} type - Upgrade type ('boost', 'global', 'yetiJr')
 * @returns {Array} Array of upgrades of specified type
 */
export function getUpgradesByType(type) {
  return UNIFIED_UPGRADES.filter(upgrade => upgrade.type === type);
}

/**
 * Get all available upgrades (for future crystal snowball system)
 * @returns {Array} Array of all upgrades
 */
export function getAllUpgrades() {
  return UNIFIED_UPGRADES;
}

/**
 * Get upgrade by ID
 * @param {string} id - Upgrade ID
 * @returns {Object|null} Upgrade object or null if not found
 */
export function getUpgradeById(id) {
  return UNIFIED_UPGRADES.find(upgrade => upgrade.id === id) || null;
} 