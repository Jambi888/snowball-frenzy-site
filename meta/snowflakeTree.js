/**
 * meta/snowflakeTree.js - Persistent upgrade system for jumps
 * 
 * This module handles the snowflake upgrade system that persists across jumps.
 * Snowflakes are earned by converting assets during jumps and can be spent on
 * permanent upgrades that carry over to new analogs.
 * 
 * Key features:
 * - Defines available snowflake upgrades
 * - Handles upgrade purchasing and application
 * - Manages persistent upgrade effects
 * - Provides snowflake conversion configuration
 */

import { ASSISTANTS } from '../loops/passive/data/assistantData.js';

// -------------------------------
// snowflakeTree.js
// -------------------------------

/**
 * Configuration for snowflake conversion rates
 * The cost of snowflakes increases with each analog level
 */
export const SNOWFLAKE_CONFIG = {
  baseCost: 1e7,      // Base cost: 100 million snowballs per snowflake
  costRate: 1         // No increase per analog level - consistent rate
  };
  
/**
 * Available snowflake upgrades that persist across jumps
 * Each upgrade provides permanent bonuses that carry over to new analogs
 * 
 * CATEGORIES:
 * - concordUpgrades (500-599): Unlock advanced game mechanics (Yetis, Travel, Abilities, Battles)
 * - idleMultiplier (100-199): Start new analog with idle bonus multipliers
 * - startingSnowballs (200-299): Start new analog with snowballs from previous analog
 * - startingAssistants (300-399): Start new analog with assistants already owned
 * - startingBabyYeti (400-499): Start new analog with baby yetis already owned
 */
  export const SNOWFLAKE_TREE = [
  // ===============================
  // CONCORD UPGRADES BRANCH (500-599)
  // ===============================
  // 
  // CONCORD UPGRADES OVERVIEW:
  // ===============================
  // This branch provides access to advanced game mechanics that are unlocked
  // as the player progresses into mid-game. These upgrades must be purchased
  // in order (500 -> 501 -> 502 -> 503) and unlock specific game systems.
  //
  // UPGRADE PROGRESSION:
  // - Order 500: Activate Yeti Spawns - Unlocks yeti spawn mechanics
  // - Order 501: Activate Travel - Unlocks momentum and travel systems
  // - Order 502: Activate Abilities - Unlocks ability belt functionality
  // - Order 503: Activate Battle - Unlocks battle mechanics
  //
  // TECHNICAL IMPLEMENTATION:
  // - Effect types: 'activateYetiSpawns', 'activateTravel', 'activateAbilities', 'activateBattle'
  // - These upgrades unlock UI elements and game mechanics
  // - Applied in applySnowflakeUpgrades() function
  // - Each upgrade enables a specific game system
  //
  // UI PLACEMENT:
  // - Displayed as a single row of 4 upgrades at the top of the snowflake tree
  // - Category: 'concordUpgrades'
  // - Must be purchased in sequential order
  //
  // Advanced mechanics unlocked through Concord upgrades
  // These upgrades must be purchased in order and unlock specific game systems
  {
    id: 'activateYetiSpawns',
    name: 'Activate Yeti Spawns',
    category: 'concordUpgrades',
    order: 500,
    cost: 8,
    icon: './meta/images/snowflakeYetis.png',
    effect: {
      type: 'activateYetiSpawns',
      value: true
    },
    description: 'Unlocks Yeti Spawns'
  },
  {
    id: 'activateTravel',
    name: 'Activate Travel',
    category: 'concordUpgrades',
    order: 501,
    cost: 70,
    icon: './meta/images/snowflakeLocations.png',
    effect: {
      type: 'activateTravel',
      value: true
    },
    description: 'Unlocks Travel'
  },
  {
    id: 'activateAbilities',
    name: 'Activate Abilities',
    category: 'concordUpgrades',
    order: 502,
    cost: 150,
    icon: './meta/images/snowflakeAbilities.png',
    effect: {
      type: 'activateAbilities',
      value: true
    },
    description: 'Unlocks Abilities'
  },
  {
    id: 'activateBattle',
    name: 'Activate Battle',
    category: 'concordUpgrades',
    order: 503,
    cost: 200,
    icon: './meta/images/snowflakeBattles.png',
    effect: {
      type: 'activateBattle',
      value: true
    },
    description: 'Unlocks Battle'
  },

  // ===============================
  // IDLE BONUS MULTIPLIER BRANCH (100-199)
  // ===============================
  // 
  // IDLE BONUS SYSTEM OVERVIEW:
  // ===============================
  // This branch provides permanent idle bonus upgrades that persist across jumps.
  // Each upgrade adds a flat 5% to the idle bonus rate, and all upgrades stack additively.
  //
  // CALCULATION LOGIC:
  // - Base idle rate: 0.01 (1% of normal SPS)
  // - Each upgrade adds: 0.05 (5% of normal SPS)
  // - Final idle rate = base rate + (number of upgrades × 0.05)
  // - Idle SPS = base SPS × idle rate
  //
  // EXAMPLES:
  // - No upgrades: 0.01 = 1% idle rate
  // - 1 upgrade: 0.01 + 0.05 = 0.06 = 6% idle rate
  // - 5 upgrades: 0.01 + (5 × 0.05) = 0.26 = 26% idle rate
  // - 20 upgrades: 0.01 + (20 × 0.05) = 1.01 = 101% idle rate
  //
  // UPGRADE PROGRESSION:
  // - Orders 100-119 provide 20 total upgrades
  // - Each upgrade costs 1-20 snowflakes (increasing cost)
  // - All upgrades are independent and stack together
  // - Maximum possible idle rate: 101% of normal SPS
  //
  // TECHNICAL IMPLEMENTATION:
  // - Effect type: 'idleBonusMultiplier' (legacy name, but now additive)
  // - Value: 0.05 (5% additive bonus)
  // - Applied in applySnowflakeUpgrades() function
  // - Final calculation: idle rate = base rate + sum of all upgrade values
  //
  // Start new analog with idle bonus rate increases
  // These bonuses STACK ADDITIVELY - all owned upgrades contribute to final rate
  {
    id: 'idleBonus_0_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 100,
    cost: 20,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_1x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 101,
    cost: 35,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_1_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 102,
    cost: 55,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_2x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 103,
    cost: 80,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_2_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 104,
    cost: 110,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_3x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 105,
    cost: 155,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_3_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 106,
    cost: 215,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_4x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 107,
    cost: 290,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_4_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 108,
    cost: 380,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 109,
    cost: 485,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_5_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 110,
    cost: 605,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_6x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 111,
    cost: 740,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_6_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 112,
    cost: 890,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_7x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 113,
    cost: 1055,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_7_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 114,
    cost: 1235,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_8x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 115,
    cost: 1430,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_8_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 116,
    cost: 1640,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_9x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 117,
    cost: 1865,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_9_5x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 118,
    cost: 2105,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },
  {
    id: 'idleBonus_10x',
    name: 'Idle Bonus +5%',
    category: 'idleMultiplier',
    order: 119,
    cost: 2360,
    icon: './meta/images/snowflakeClock.png',
    effect: {
      type: 'idleBonusMultiplier',
      value: 0.05  // 5% additive bonus to idle rate
    },
    description: 'Idle bonus rate: +5%'
  },

  // ===============================
  // STARTING SNOWBALLS BRANCH (200-299)
  // ===============================
  // Start new analog with snowballs equal to percentage of previous analog
  {
    id: 'startingSnowballs_100k',
    name: 'Snowball Legacy 100k',
    category: 'startingSnowballs',
    order: 200,
    cost: 2,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 100000  // 100,000 snowballs (special case)
    },
    description: 'Start new Echo with 100,000 snowballs'
  },
  {
    id: 'startingSnowballs_400k',
    name: 'Snowball Legacy 400k',
    category: 'startingSnowballs',
    order: 201,
    cost: 9,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 400000  // 400,000 snowballs (special case)
    },
    description: 'Start new Echo with 400,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_1',
    name: 'Snowball Legacy 500k I',
    category: 'startingSnowballs',
    order: 202,
    cost: 20,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_2',
    name: 'Snowball Legacy 500k II',
    category: 'startingSnowballs',
    order: 203,
    cost: 35,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_3',
    name: 'Snowball Legacy 500k III',
    category: 'startingSnowballs',
    order: 204,
    cost: 61,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_4',
    name: 'Snowball Legacy 500k IV',
    category: 'startingSnowballs',
    order: 205,
    cost: 106,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_5',
    name: 'Snowball Legacy 500k V',
    category: 'startingSnowballs',
    order: 206,
    cost: 185,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_6',
    name: 'Snowball Legacy 500k VI',
    category: 'startingSnowballs',
    order: 207,
    cost: 323,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_7',
    name: 'Snowball Legacy 500k VII',
    category: 'startingSnowballs',
    order: 208,
    cost: 10,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_8',
    name: 'Snowball Legacy 500k VIII',
    category: 'startingSnowballs',
    order: 209,
    cost: 11,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_9',
    name: 'Snowball Legacy 500k IX',
    category: 'startingSnowballs',
    order: 210,
    cost: 12,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_10',
    name: 'Snowball Legacy 500k X',
    category: 'startingSnowballs',
    order: 211,
    cost: 13,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_11',
    name: 'Snowball Legacy 500k XI',
    category: 'startingSnowballs',
    order: 212,
    cost: 14,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
      description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_12',
    name: 'Snowball Legacy 500k XII',
    category: 'startingSnowballs',
    order: 213,
    cost: 15,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_13',
    name: 'Snowball Legacy 500k XIII',
    category: 'startingSnowballs',
    order: 214,
    cost: 16,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_14',
    name: 'Snowball Legacy 500k XIV',
    category: 'startingSnowballs',
    order: 215,
    cost: 17,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_15',
    name: 'Snowball Legacy 500k XV',
    category: 'startingSnowballs',
    order: 216,
    cost: 18,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_16',
    name: 'Snowball Legacy 500k XVI',
    category: 'startingSnowballs',
    order: 217,
    cost: 19,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_17',
    name: 'Snowball Legacy 500k XVII',
    category: 'startingSnowballs',
    order: 218,
    cost: 20,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },
  {
    id: 'startingSnowballs_500k_18',
    name: 'Snowball Legacy 500k XVIII',
    category: 'startingSnowballs',
    order: 219,
    cost: 21,
    icon: './meta/images/snowflakeSnowball.png',
    effect: {
      type: 'startingSnowballs',
      value: 500000  // 500,000 snowballs (consistent pattern)
    },
    description: 'Start new Echo with 500,000 snowballs'
  },

  // ===============================
  // STARTING ASSISTANTS BRANCH (300-399)
  // ===============================
  // Start new analog with assistants from previous analog
  // Each assistant gets 2 upgrades: 50% + 50% = 100% of previous analog count
  
  // Additional Arm - 50% of previous analog
  {
    id: 'startingAssistants_additionalArm_50',
    name: 'Additional Arm Legacy 50%',
    category: 'startingAssistants',
    order: 300,
    cost: 1,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'additionalArm',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Additional Arms from previous Echo'
  },
  // Additional Arm - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_additionalArm_100',
    name: 'Additional Arm Legacy 100%',
    category: 'startingAssistants',
    order: 301,
    cost: 2,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'additionalArm',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Additional Arms from previous Echo'
  },
  
  // Neighbor Kids - 50% of previous analog
  {
    id: 'startingAssistants_neighborKids_50',
    name: 'Neighbor Kids Legacy 50%',
    category: 'startingAssistants',
    order: 302,
    cost: 3,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'neighborKids',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Neighbor Kids from previous Echo'
  },
  // Neighbor Kids - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_neighborKids_100',
    name: 'Neighbor Kids Legacy 100%',
    category: 'startingAssistants',
    order: 303,
    cost: 5,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'neighborKids',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Neighbor Kids from previous Echo'
  },
  
  // Ball Machine - 50% of previous analog
  {
    id: 'startingAssistants_ballMachine_50',
    name: 'Ball Machine Legacy 50%',
    category: 'startingAssistants',
    order: 304,
    cost: 8,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'ballMachine',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Ball Machines from previous Echo'
  },
  // Ball Machine - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_ballMachine_100',
    name: 'Ball Machine Legacy 100%',
    category: 'startingAssistants',
    order: 305,
    cost: 12,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'ballMachine',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Ball Machines from previous Echo'
  },
  
  // Polar Bear Family - 50% of previous analog
  {
    id: 'startingAssistants_polarBearFamily_50',
    name: 'Polar Bear Family Legacy 50%',
    category: 'startingAssistants',
    order: 306,
    cost: 18,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'polarBearFamily',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Polar Bear Families from previous Echo'
  },
  // Polar Bear Family - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_polarBearFamily_100',
    name: 'Polar Bear Family Legacy 100%',
    category: 'startingAssistants',
    order: 307,
    cost: 10,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'polarBearFamily',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Polar Bear Families from previous Echo'
  },
  
  // Snow Blower - 50% of previous analog
  {
    id: 'startingAssistants_snowBlower_50',
    name: 'Snow Blower Legacy 50%',
    category: 'startingAssistants',
    order: 308,
    cost: 11,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowBlower',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Snow Blowers from previous Echo'
  },
  // Snow Blower - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_snowBlower_100',
    name: 'Snow Blower Legacy 100%',
    category: 'startingAssistants',
    order: 309,
    cost: 12,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowBlower',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Snow Blowers from previous Echo'
  },
  
  // Hockey Team - 50% of previous analog
  {
    id: 'startingAssistants_hockeyTeam_50',
    name: 'Hockey Team Legacy 50%',
    category: 'startingAssistants',
    order: 310,
    cost: 13,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'hockeyTeam',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Hockey Teams from previous Echo'
  },
  // Hockey Team - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_hockeyTeam_100',
    name: 'Hockey Team Legacy 100%',
    category: 'startingAssistants',
    order: 311,
    cost: 14,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'hockeyTeam',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Hockey Teams from previous Echo'
  },
  
  // Igloo Arsenal - 50% of previous analog
  {
    id: 'startingAssistants_iglooArsenal_50',
    name: 'Igloo Arsenal Legacy 50%',
    category: 'startingAssistants',
    order: 312,
    cost: 15,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'iglooArsenal',
      value: 0.5  // 50% of previous analog count
    },
      description: 'Start new Echo with 50% of Igloo Arsenals from previous Echo'
  },
  // Igloo Arsenal - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_iglooArsenal_100',
    name: 'Igloo Arsenal Legacy 100%',
    category: 'startingAssistants',
    order: 313,
    cost: 16,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'iglooArsenal',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Igloo Arsenals from previous Echo'
  },
  
  // Golfing Range - 50% of previous analog
  {
    id: 'startingAssistants_golfingRange_50',
    name: 'Golfing Range Legacy 50%',
    category: 'startingAssistants',
    order: 314,
    cost: 17,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'golfingRange',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Golfing Ranges from previous Echo'
  },
  // Golfing Range - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_golfingRange_100',
    name: 'Golfing Range Legacy 100%',
    category: 'startingAssistants',
    order: 315,
    cost: 18,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'golfingRange',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Golfing Ranges from previous Echo'
  },
  
  // Snowstorm - 50% of previous analog
  {
    id: 'startingAssistants_snowstorm_50',
    name: 'Snowstorm Legacy 50%',
    category: 'startingAssistants',
    order: 316,
    cost: 19,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowstorm',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Snowstorms from previous Echo'
  },
  // Snowstorm - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_snowstorm_100',
    name: 'Snowstorm Legacy 100%',
    category: 'startingAssistants',
    order: 317,
    cost: 20,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowstorm',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Snowstorms from previous Echo'
  },
  
  // Snow Princess - 50% of previous analog
  {
    id: 'startingAssistants_snowPrincess_50',
    name: 'Snow Princess Legacy 50%',
    category: 'startingAssistants',
    order: 318,
    cost: 21,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowPrincess',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Snow Princesses from previous Echo'
  },
  // Snow Princess - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_snowPrincess_100',
    name: 'Snow Princess Legacy 100%',
    category: 'startingAssistants',
    order: 319,
    cost: 22,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowPrincess',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Snow Princesses from previous Echo'
  },
  
  // Winter Fortress - 50% of previous analog
  {
    id: 'startingAssistants_winterFortress_50',
    name: 'Winter Fortress Legacy 50%',
    category: 'startingAssistants',
    order: 320,
    cost: 23,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'winterFortress',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Winter Fortresses from previous Echo'
  },
  // Winter Fortress - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_winterFortress_100',
    name: 'Winter Fortress Legacy 100%',
    category: 'startingAssistants',
    order: 321,
    cost: 24,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'winterFortress',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Winter Fortresses from previous Echo'
  },
  
  // Wizard Blizzard - 50% of previous analog
  {
    id: 'startingAssistants_wizardBlizzard_50',
    name: 'Wizard Blizzard Legacy 50%',
    category: 'startingAssistants',
    order: 322,
    cost: 25,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'wizardBlizzard',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Wizard Blizzards from previous Echo'
  },
  // Wizard Blizzard - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_wizardBlizzard_100',
    name: 'Wizard Blizzard Legacy 100%',
    category: 'startingAssistants',
    order: 323,
    cost: 26,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'wizardBlizzard',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Wizard Blizzards from previous Echo'
  },
  
  // Avalanche - 50% of previous analog
  {
    id: 'startingAssistants_avalanche_50',
    name: 'Avalanche Legacy 50%',
    category: 'startingAssistants',
    order: 324,
    cost: 27,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'avalanche',
      value: 0.5  // 50% of previous analog count
    },
      description: 'Start new Echo with 50% of Avalanches from previous Echo'
  },
  // Avalanche - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_avalanche_100',
    name: 'Avalanche Legacy 100%',
    category: 'startingAssistants',
    order: 325,
    cost: 28,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'avalanche',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Avalanches from previous Echo'
  },
  
  // Snow Hurricane - 50% of previous analog
  {
    id: 'startingAssistants_snowHurricane_50',
    name: 'Snow Hurricane Legacy 50%',
    category: 'startingAssistants',
    order: 326,
    cost: 29,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowHurricane',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Snow Hurricanes from previous Echo'
  },
  // Snow Hurricane - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_snowHurricane_100',
    name: 'Snow Hurricane Legacy 100%',
    category: 'startingAssistants',
    order: 327,
    cost: 30,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowHurricane',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Snow Hurricanes from previous Echo'
  },
  
  // Ice Dragon - 50% of previous analog
  {
    id: 'startingAssistants_iceDragon_50',
    name: 'Ice Dragon Legacy 50%',
    category: 'startingAssistants',
    order: 328,
    cost: 31,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'iceDragon',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Ice Dragons from previous Echo'
  },
  // Ice Dragon - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_iceDragon_100',
    name: 'Ice Dragon Legacy 100%',
    category: 'startingAssistants',
    order: 329,
    cost: 32,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'iceDragon',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Ice Dragons from previous Echo'
  },
  
  // Frost Giant - 50% of previous analog
  {
    id: 'startingAssistants_frostGiant_50',
    name: 'Frost Giant Legacy 50%',
    category: 'startingAssistants',
    order: 330,
    cost: 33,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'frostGiant',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Frost Giants from previous Echo'
  },
  // Frost Giant - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_frostGiant_100',
    name: 'Frost Giant Legacy 100%',
    category: 'startingAssistants',
    order: 331,
    cost: 34,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'frostGiant',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Frost Giants from previous Echo'
  },
  
  // Orbital Snow Cannon - 50% of previous analog
  {
    id: 'startingAssistants_orbitalSnowCannon_50',
    name: 'Orbital Snow Cannon Legacy 50%',
    category: 'startingAssistants',
    order: 332,
    cost: 35,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'orbitalSnowCannon',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Orbital Snow Cannons from previous Echo'
  },
  // Orbital Snow Cannon - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_orbitalSnowCannon_100',
    name: 'Orbital Snow Cannon Legacy 100%',
    category: 'startingAssistants',
    order: 333,
    cost: 36,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'orbitalSnowCannon',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Orbital Snow Cannons from previous Echo'
  },
  
  // Temple of Winter - 50% of previous analog
  {
    id: 'startingAssistants_templeofWinter_50',
    name: 'Temple of Winter Legacy 50%',
    category: 'startingAssistants',
    order: 334,
    cost: 37,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'templeofWinter',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Temples of Winter from previous Echo'
  },
  // Temple of Winter - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_templeofWinter_100',
    name: 'Temple of Winter Legacy 100%',
    category: 'startingAssistants',
    order: 335,
    cost: 38,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'templeofWinter',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Temples of Winter from previous Echo'
  },
  
  // Cryo Core - 50% of previous analog
  {
    id: 'startingAssistants_cryoCore_50',
    name: 'Cryo Core Legacy 50%',
    category: 'startingAssistants',
    order: 336,
    cost: 39,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'cryoCore',
      value: 0.5  // 50% of previous analog count
    },
      description: 'Start new Echo with 50% of Cryo Cores from previous Echo'
  },
  // Cryo Core - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_cryoCore_100',
    name: 'Cryo Core Legacy 100%',
    category: 'startingAssistants',
    order: 337,
    cost: 40,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'cryoCore',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Cryo Cores from previous Echo'
  },
  
  // Snow Singularity - 50% of previous analog
  {
    id: 'startingAssistants_snowSingularity_50',
    name: 'Snow Singularity Legacy 50%',
    category: 'startingAssistants',
    order: 338,
    cost: 41,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowSingularity',
      value: 0.5  // 50% of previous analog count
    },
    description: 'Start new Echo with 50% of Snow Singularities from previous Echo'
  },
  // Snow Singularity - 100% of previous analog (second 50%)
  {
    id: 'startingAssistants_snowSingularity_100',
    name: 'Snow Singularity Legacy 100%',
    category: 'startingAssistants',
    order: 339,
    cost: 42,
    icon: './meta/images/snowflakeAssistants.png',
    effect: {
      type: 'startingAssistants',
      assistantId: 'snowSingularity',
      value: 0.5  // Second 50% for total of 100%
    },
    description: 'Start new Echo with 100% of Snow Singularities from previous Echo'
  },

  // ===============================
  // STARTING BABY YETI BRANCH (400-499)
  // ===============================
  // Start new analog with specific yetiJr upgrades already owned
  // Each upgrade corresponds to a yetiJr upgrade from unifiedUpgradeData.js
  // Orders 400-434 map to yetiJr6-40 (orders 206-240)
  
  // Yeti Jr 6 (order 206) -> startingBabyYeti order 400
  {
    id: 'startingBabyYeti_yetiJr6',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 400,
    cost: 10,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr6'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 7 (order 207) -> startingBabyYeti order 401
  {
    id: 'startingBabyYeti_yetiJr7',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 401,
    cost: 15,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr7'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 8 (order 208) -> startingBabyYeti order 402
  {
    id: 'startingBabyYeti_yetiJr8',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 402,
    cost: 23,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr8'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 9 (order 209) -> startingBabyYeti order 403
  {
    id: 'startingBabyYeti_yetiJr9',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 403,
    cost: 35,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr9'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 10 (order 210) -> startingBabyYeti order 404
  {
    id: 'startingBabyYeti_yetiJr10',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 404,
    cost: 53,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr10'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 11 (order 211) -> startingBabyYeti order 405
  {
    id: 'startingBabyYeti_yetiJr11',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 405,
    cost: 80,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr11'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 12 (order 212) -> startingBabyYeti order 406
  {
    id: 'startingBabyYeti_yetiJr12',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 406,
    cost: 11,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr12'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 13 (order 213) -> startingBabyYeti order 407
  {
    id: 'startingBabyYeti_yetiJr13',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 407,
    cost: 12,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr13'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 14 (order 214) -> startingBabyYeti order 408
  {
    id: 'startingBabyYeti_yetiJr14',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 408,
    cost: 13,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr14'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 15 (order 215) -> startingBabyYeti order 409
  {
    id: 'startingBabyYeti_yetiJr15',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 409,
    cost: 14,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr15'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 16 (order 216) -> startingBabyYeti order 410
  {
    id: 'startingBabyYeti_yetiJr16',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 410,
    cost: 15,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr16'
    },
      description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 17 (order 217) -> startingBabyYeti order 411
  {
    id: 'startingBabyYeti_yetiJr17',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 411,
    cost: 16,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr17'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 18 (order 218) -> startingBabyYeti order 412
  {
    id: 'startingBabyYeti_yetiJr18',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 412,
    cost: 17,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr18'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 19 (order 219) -> startingBabyYeti order 413
  {
    id: 'startingBabyYeti_yetiJr19',
      name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 413,
    cost: 18,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr19'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 20 (order 220) -> startingBabyYeti order 414
  {
    id: 'startingBabyYeti_yetiJr20',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 414,
    cost: 19,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr20'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 21 (order 221) -> startingBabyYeti order 415
  {
    id: 'startingBabyYeti_yetiJr21',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 415,
    cost: 20,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr21'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 22 (order 222) -> startingBabyYeti order 416
  {
    id: 'startingBabyYeti_yetiJr22',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 416,
    cost: 21,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr22'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 23 (order 223) -> startingBabyYeti order 417
  {
    id: 'startingBabyYeti_yetiJr23',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 417,
    cost: 22,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr23'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 24 (order 224) -> startingBabyYeti order 418
  {
    id: 'startingBabyYeti_yetiJr24',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 418,
    cost: 23,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr24'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 25 (order 225) -> startingBabyYeti order 419
  {
    id: 'startingBabyYeti_yetiJr25',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 419,
    cost: 24,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr25'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 26 (order 226) -> startingBabyYeti order 420
  {
    id: 'startingBabyYeti_yetiJr26',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 420,
    cost: 25,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr26'
    },
      description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 27 (order 227) -> startingBabyYeti order 421
  {
    id: 'startingBabyYeti_yetiJr27',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 421,
    cost: 26,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr27'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 28 (order 228) -> startingBabyYeti order 422
  {
    id: 'startingBabyYeti_yetiJr28',
      name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 422,
    cost: 27,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr28'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 29 (order 229) -> startingBabyYeti order 423
  {
    id: 'startingBabyYeti_yetiJr29',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 423,
    cost: 28,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr29'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 30 (order 230) -> startingBabyYeti order 424
  {
    id: 'startingBabyYeti_yetiJr30',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 424,
    cost: 29,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr30'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 31 (order 231) -> startingBabyYeti order 425
  {
    id: 'startingBabyYeti_yetiJr31',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 425,
    cost: 30,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr31'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 32 (order 232) -> startingBabyYeti order 426
  {
    id: 'startingBabyYeti_yetiJr32',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 426,
    cost: 31,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr32'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 33 (order 233) -> startingBabyYeti order 427
  {
    id: 'startingBabyYeti_yetiJr33',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 427,
    cost: 32,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr33'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 34 (order 234) -> startingBabyYeti order 428
  {
    id: 'startingBabyYeti_yetiJr34',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 428,
    cost: 33,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr34'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 35 (order 235) -> startingBabyYeti order 429
  {
    id: 'startingBabyYeti_yetiJr35',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 429,
    cost: 34,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr35'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 36 (order 236) -> startingBabyYeti order 430
  {
    id: 'startingBabyYeti_yetiJr36',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 430,
    cost: 35,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr36'
    },
      description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 37 (order 237) -> startingBabyYeti order 431
  {
    id: 'startingBabyYeti_yetiJr37',
      name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 431,
    cost: 36,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr37'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 38 (order 238) -> startingBabyYeti order 432
  {
    id: 'startingBabyYeti_yetiJr38',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 432,
    cost: 37,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr38'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 39 (order 239) -> startingBabyYeti order 433
  {
    id: 'startingBabyYeti_yetiJr39',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 433,
    cost: 38,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr39'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },
  
  // Yeti Jr 40 (order 240) -> startingBabyYeti order 434
  {
    id: 'startingBabyYeti_yetiJr40',
    name: 'Yeti Crew Legacy',
    category: 'startingBabyYeti',
    order: 434,
    cost: 39,
    icon: './meta/images/snowflakeBabyYeti.png',
    effect: {
      type: 'startingBabyYeti',
      yetiJrId: 'yetiJr40'
    },
    description: 'Start new Echo with Yeti Crew already owned'
  },

];

/**
 * Purchases a snowflake upgrade if the player has enough snowflakes
 * @param {GameStateFlat} game - The current game state object
 * @param {string} upgradeId - The ID of the upgrade to purchase
 * @returns {boolean} True if purchase was successful, false otherwise
 */
  export function purchaseSnowflakeUpgrade(game, upgradeId) {
    const upgrade = SNOWFLAKE_TREE.find(u => u.id === upgradeId);
    if (!upgrade) {
    // console.log(`[SNOWFLAKE TREE] Upgrade not found: ${upgradeId}`);
      return false;
    }
  
  const currentSnowflakes = game.snowflakes || 0;
  if (currentSnowflakes < upgrade.cost) {
    // console.log(`[SNOWFLAKE TREE] Not enough snowflakes: ${currentSnowflakes} < ${upgrade.cost}`);
      return false;
    }
  
    // Check if already owned
  const persistentUpgrades = game.persistentUpgrades || [];
  if (persistentUpgrades.includes(upgradeId)) {
    // console.log(`[SNOWFLAKE TREE] Upgrade already owned: ${upgradeId}`);
      return false;
    }
  
  // Purchase the upgrade
    game.snowflakes -= upgrade.cost;
  persistentUpgrades.push(upgradeId);
  game.persistentUpgrades = persistentUpgrades;

  // Emit upgrade purchased event
  if (window.eventBus) {
    window.eventBus.emit('upgradePurchased', {
      upgradeId: upgradeId,
      type: 'persistent',
      cost: upgrade.cost
    });
  }
  
  // Emit snowflakeTreePurchased event for achievement system
  if (window.eventBus) {
    window.eventBus.emit('snowflakeTreePurchased', {
      upgradeId: upgradeId,
      cost: upgrade.cost
    });
  }

  // console.log(`[SNOWFLAKE TREE] Purchased upgrade: ${upgradeId}`);
  return true;
}

/**
 * Applies all owned snowflake upgrades to the game state
 * This function is called after a jump to restore persistent bonuses
 * @param {GameStateFlat} game - The current game state object
 */
export function applySnowflakeUpgrades(game) {
  // console.log(`[SNOWFLAKE DEBUG] === APPLYING SNOWFLAKE UPGRADES ===`);
  // console.log(`[SNOWFLAKE DEBUG] persistentUpgrades:`, game.persistentUpgrades || []);
  // console.log(`[SNOWFLAKE DEBUG] appliedSnowflakeUpgrades:`, game.appliedSnowflakeUpgrades || []);
  // console.log(`[SNOWFLAKE DEBUG] Starting globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
  
  const persistentUpgrades = game.persistentUpgrades || [];
  
  // Track which upgrades have been applied to avoid duplicates
  const appliedUpgrades = game.appliedSnowflakeUpgrades || [];
  
  // console.log(`[SNOWFLAKE DEBUG] Processing ${persistentUpgrades.length} persistent upgrades...`);
  
  for (const upgradeId of persistentUpgrades) {
    // console.log(`[SNOWFLAKE DEBUG] Checking upgrade: ${upgradeId}`);
    
    // Skip if already applied
    if (appliedUpgrades.includes(upgradeId)) {
      // console.log(`[SNOWFLAKE DEBUG] Skipping already applied upgrade: ${upgradeId}`);
      continue;
    }
    
    const upgrade = SNOWFLAKE_TREE.find(u => u.id === upgradeId);
    if (!upgrade) {
      // console.log(`[SNOWFLAKE DEBUG] Upgrade not found: ${upgradeId}`);
      continue;
    }

    const effect = upgrade.effect;
    // console.log(`[SNOWFLAKE DEBUG] Applying upgrade: ${upgradeId} with effect:`, effect);
    // console.log(`[SNOWFLAKE DEBUG] Before applying ${upgradeId} - globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
    
    switch (effect.type) {
      // ===============================
      // LEGACY EFFECTS (Backward Compatibility)
      // ===============================
      case 'globalSpsMultiplier':
        // Apply global SPS multiplier
        const oldGlobalSps = game.globalSpsMultiplier || 1;
        game.globalSpsMultiplier = oldGlobalSps * effect.value;
        // console.log(`[SNOWFLAKE DEBUG] globalSpsMultiplier: ${oldGlobalSps} -> ${game.globalSpsMultiplier} (multiplied by ${effect.value})`);
        break;
        
      case 'assistantMultiplier':
        // Apply assistant-specific multiplier to all assistants
        if (!game.assistantMultipliers) {
          game.assistantMultipliers = {};
        }
        // Apply to all assistants
        for (const assistant of ASSISTANTS) {
          const oldAssistantMult = game.assistantMultipliers[assistant.id] || 1;
          game.assistantMultipliers[assistant.id] = oldAssistantMult * effect.value;
          // console.log(`[SNOWFLAKE DEBUG] assistantMultipliers[${assistant.id}]: ${oldAssistantMult} -> ${game.assistantMultipliers[assistant.id]} (multiplied by ${effect.value})`);
        }
        break;
        
      case 'clickMultiplier':
        // Apply click multiplier
        const oldClickMult = game.clickMultiplier || 1;
        game.clickMultiplier = oldClickMult * effect.value;
        // console.log(`[SNOWFLAKE DEBUG] clickMultiplier: ${oldClickMult} -> ${game.clickMultiplier} (multiplied by ${effect.value})`);
        break;

      // ===============================
      // NEW EFFECTS (Phase 2 Categories) - ALL STACKING
      // ===============================
      case 'idleBonusMultiplier':
        // Apply idle bonus rate (additive stacking - all owned upgrades contribute)
        // Each upgrade adds a flat percentage to the idle bonus rate
        const baseIdleRate = 0.01; // Base rate from gameStateFlat.js (1%)
        const oldIdleRate = game.idleBonusRate || baseIdleRate;
        
        // Add the upgrade value directly to the idle rate (additive, not multiplicative)
        const newIdleRate = oldIdleRate + effect.value;
        game.idleBonusRate = newIdleRate;
        
        // Keep the multiplier at 1 since we're now using additive rates
        game.idleBonusMultiplier = 1;
        
        // console.log(`[SNOWFLAKE DEBUG] idleBonusRate: ${(oldIdleRate * 100).toFixed(1)}% -> ${(newIdleRate * 100).toFixed(1)}% (added ${(effect.value * 100).toFixed(1)}%)`);
        // console.log(`[SNOWFLAKE DEBUG] Final idle rate: ${(newIdleRate * 100).toFixed(1)}% of normal SPS`);
        break;

      case 'startingSnowballs':
        // Store the starting snowballs amount for use during analog initialization
        if (!game.startingSnowballs) {
          game.startingSnowballs = 0;
        }
        game.startingSnowballs += effect.value;
        // console.log(`[SNOWFLAKE DEBUG] startingSnowballs: ${game.startingSnowballs.toLocaleString()} (added ${effect.value.toLocaleString()})`);
        break;

      case 'startingAssistants':
        if (!game.startingAssistants) {
          game.startingAssistants = {};
        }
        const assistantId = effect.assistantId;
        const percentage = effect.value;
        game.startingAssistants[assistantId] = (game.startingAssistants[assistantId] || 0) + percentage;
        // console.log(`[SNOWFLAKE DEBUG] startingAssistants[${assistantId}]: ${(game.startingAssistants[assistantId] * 100).toFixed(1)}% (added ${(percentage * 100).toFixed(1)}%)`);
        break;

      case 'startingBabyYeti':
        if (!game.startingBabyYeti) {
          game.startingBabyYeti = [];
        }
        const yetiJrId = effect.yetiJrId;
        if (!game.startingBabyYeti.includes(yetiJrId)) {
          game.startingBabyYeti.push(yetiJrId);
          // console.log(`[SNOWFLAKE DEBUG] startingBabyYeti: added ${yetiJrId} (total: ${game.startingBabyYeti.length})`);
        }
        break;

      // ===============================
      // CONCORD UPGRADES (Mechanic Unlocks)
      // ===============================
      case 'activateYetiSpawns':
        // Unlock yeti spawn mechanics
        game.yetiSpawnsActive = true;
        // console.log(`[SNOWFLAKE DEBUG] Yeti spawns activated`);
        
        // Re-initialize yeti system if it was already set up
        if (window.setupYetis) {
          // console.log(`[SNOWFLAKE DEBUG] Re-initializing yeti system...`);
          window.setupYetis(game);
        }
        break;

      case 'activateTravel':
        // Unlock travel and momentum systems
        game.travelActive = true;
        // console.log(`[SNOWFLAKE DEBUG] Travel system activated`);
        
        // Re-initialize travel system if it was already set up
        if (window.setupTravelSystem) {
          // console.log(`[SNOWFLAKE DEBUG] Re-initializing travel system...`);
          window.setupTravelSystem(game);
        }
        break;

      case 'activateAbilities':
        // Unlock ability belt functionality
        game.abilitiesActive = true;
        // console.log(`[SNOWFLAKE DEBUG] Abilities system activated`);
        
        // Re-initialize ability belt system if it was already set up
        if (window.setupAbilityBelt) {
          // console.log(`[SNOWFLAKE DEBUG] Re-initializing ability belt system...`);
          window.setupAbilityBelt(game);
        }
        break;

      case 'activateBattle':
        // Unlock battle mechanics
        game.battlesActive = true;
        // console.log(`[SNOWFLAKE DEBUG] Battle system activated`);
        
        // Update battle system state if it exists
        if (game.battles) {
          game.battles.yetiBattles = true;
          game.battles.battleProbability = 1.0;
          // console.log(`[SNOWFLAKE DEBUG] Battle system state updated to enabled`);
        }
        break;
        
      default:
        // console.log(`[SNOWFLAKE DEBUG] Unknown effect type: ${effect.type}`);
        break;
    }
    
    // Mark this upgrade as applied
    appliedUpgrades.push(upgradeId);
    // console.log(`[SNOWFLAKE DEBUG] Marked upgrade as applied: ${upgradeId}`);
    // console.log(`[SNOWFLAKE DEBUG] After applying ${upgradeId} - globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
  }
  
  // Store the list of applied upgrades
  game.appliedSnowflakeUpgrades = appliedUpgrades;
  // console.log(`[SNOWFLAKE DEBUG] Final appliedSnowflakeUpgrades:`, appliedUpgrades);
  // console.log(`[SNOWFLAKE DEBUG] Final globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
  // console.log(`[SNOWFLAKE DEBUG] === SNOWFLAKE UPGRADES APPLIED ===`);
}

/**
 * Gets all upgrades for a specific category
 * @param {string} category - The category to filter by
 * @returns {Array} Array of upgrades in that category, sorted by order
 */
export function getUpgradesByCategory(category) {
  return SNOWFLAKE_TREE
    .filter(upgrade => upgrade.category === category)
    .sort((a, b) => a.order - b.order);
}

/**
 * Gets all available categories
 * @returns {Array} Array of unique category names
 */
export function getAvailableCategories() {
  const categories = [...new Set(SNOWFLAKE_TREE.map(upgrade => upgrade.category))];
  return categories.sort();
}

/**
 * Validates the snowflake tree structure
 * @returns {Object} Validation result with errors and warnings
 */
export function validateSnowflakeTree() {
  const result = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Check for required fields
  for (const upgrade of SNOWFLAKE_TREE) {
    if (!upgrade.id) {
      result.errors.push(`Upgrade missing id: ${JSON.stringify(upgrade)}`);
      result.valid = false;
    }
    if (!upgrade.name) {
      result.errors.push(`Upgrade ${upgrade.id} missing name`);
      result.valid = false;
    }
    if (!upgrade.category) {
      result.errors.push(`Upgrade ${upgrade.id} missing category`);
      result.valid = false;
    }
    if (typeof upgrade.order !== 'number') {
      result.errors.push(`Upgrade ${upgrade.id} missing or invalid order`);
      result.valid = false;
    }
    if (!upgrade.effect || !upgrade.effect.type) {
      result.errors.push(`Upgrade ${upgrade.id} missing or invalid effect`);
      result.valid = false;
    }
  }

  // Check for duplicate IDs
  const ids = SNOWFLAKE_TREE.map(u => u.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    result.errors.push(`Duplicate upgrade IDs: ${duplicateIds.join(', ')}`);
    result.valid = false;
  }

  // Check for duplicate orders within categories
  const categories = getAvailableCategories();
  for (const category of categories) {
    const categoryUpgrades = getUpgradesByCategory(category);
    const orders = categoryUpgrades.map(u => u.order);
    const duplicateOrders = orders.filter((order, index) => orders.indexOf(order) !== index);
    if (duplicateOrders.length > 0) {
      result.errors.push(`Duplicate orders in category ${category}: ${duplicateOrders.join(', ')}`);
      result.valid = false;
    }
  }

  // Check order ranges
  for (const upgrade of SNOWFLAKE_TREE) {
    const expectedRange = {
      'concordUpgrades': [500, 599],
      'idleMultiplier': [100, 199],
      'startingSnowballs': [200, 299],
      'startingAssistants': [300, 399],
      'startingBabyYeti': [400, 499]
    };
    
    const range = expectedRange[upgrade.category];
    if (range && (upgrade.order < range[0] || upgrade.order > range[1])) {
      result.warnings.push(`Upgrade ${upgrade.id} order ${upgrade.order} outside expected range for category ${upgrade.category} (${range[0]}-${range[1]})`);
    }
  }

  return result;
}

/**
 * Gets the next available order number for a category
 * @param {string} category - The category to get the next order for
 * @returns {number} Next available order number
 */
export function getNextOrderForCategory(category) {
  const categoryUpgrades = getUpgradesByCategory(category);
  if (categoryUpgrades.length === 0) {
    // Return the starting order for the category
    const categoryStarts = {
      'concordUpgrades': 500,
      'idleMultiplier': 100,
      'startingSnowballs': 200,
      'startingAssistants': 300,
      'startingBabyYeti': 400
    };
    return categoryStarts[category] || 100;
  }
  
  // Return the highest order + 1
  const maxOrder = Math.max(...categoryUpgrades.map(u => u.order));
  return maxOrder + 1;
}
  