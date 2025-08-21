/**
 * systems/jumpUtils.js - Utility functions for the jump system
 * 
 * This module contains utility functions that support the jump system,
 * including threshold calculations and game state reset functionality.
 * 
 * Key functions:
 * - getJumpThreshold: Calculates the snowball threshold needed to jump to next analog
 * - resetGameForJump: Resets game state while preserving persistent data
 */

import { JUMP_THRESHOLD } from '../core/config.js';

// -------------------------------
// jumpUtils.js
// -------------------------------

/**
 * Calculates the lifetime snowball threshold required to jump to the next analog
 * The threshold increases exponentially with each analog level
 * @param {number} analog - The current analog level
 * @returns {number} The snowball threshold needed for the next jump
 */
export function getJumpThreshold(analog) {
  // Base threshold starts at JUMP_THRESHOLD (1 million) snowballs
  // Each analog level increases the threshold by a factor of 10
  return JUMP_THRESHOLD * Math.pow(10, analog - 1);
}

/**
 * Resets the game state for a jump while preserving persistent data
 * This function clears all temporary game state but keeps:
 * - Lifetime snowballs count
 * - Current analog level
 * - Snowflakes and persistent upgrades
 * - Analog tracking data
 * 
 * @param {GameStateFlat} game - The current game state object
 */
/**
 * Reset game state for a new analog while preserving persistent data
 * 
 * PERSISTENCE RULES:
 * - ✅ Snowflake upgrades: Always persistent
 * - ✅ Assistant levels (icicle level-ups): Always persistent  
 * - ✅ Location/yetis/battles: Always persistent
 * - ❌ Boosts: Reset on jump (not persistent)
 * - ❌ Baby Yeti upgrades: Reset on jump UNLESS player has corresponding snowflake upgrade
 * - ❌ Regular upgrades: Reset on jump (not persistent)
 */
export function resetGameForJump(game) {
  // console.log(`[RESET DEBUG] === RESETTING GAME FOR JUMP (FLAT ARCHITECTURE) ===`);
  
  // Store current values for debugging
  const currentGlobalSps = game.globalSpsMultiplier || 1;
  const currentAssistantMults = game.assistantMultipliers || {};
  const currentClickMult = game.clickMultiplier || 1;
  
  // console.log(`[RESET DEBUG] Before reset - globalSpsMultiplier: ${currentGlobalSps}`);
  // console.log(`[RESET DEBUG] Before reset - assistantMultipliers:`, currentAssistantMults);
  // console.log(`[RESET DEBUG] Before reset - clickMultiplier: ${currentClickMult}`);
  
  // Reset all temporary game state - flat architecture version
  game.snowballs = 0;
  game.currentAnalogSnowballs = 0;  // Reset current analog snowballs
  game.spc = 1;  // Reset snowballs per click
  game.sps = 0;  // Reset snowballs per second
  game.spsHistory = [];  // Reset SPS history
  
  // Clear all collections using the flat architecture
  game._assistants.clear();
  // NOTE: Assistant levels (icicle level-ups) are persistent across jumps
  // game._assistantLevels.clear(); // REMOVED - Assistant levels should persist
  game._assistantMultipliers.clear();
  
  // Clear boosts (not persistent)
  const currentBoosts = Array.from(game._boosts);
  // console.log(`[RESET DEBUG] Before clearing - Boosts:`, currentBoosts);
  game._boosts.clear();
  // console.log(`[RESET DEBUG] After clearing - Boosts cleared:`, Array.from(game._boosts));
  
  // Clear unified upgrades (this is what the UI checks for purchased status)
  // console.log(`[RESET DEBUG] Before clearing - Unified upgrades:`, game.unifiedUpgrades || {});
  game.unifiedUpgrades = {};
  // console.log(`[RESET DEBUG] After clearing - Unified upgrades cleared`);
  
  // Clear global upgrades EXCEPT Baby Yeti upgrades that have snowflake persistence
  // Baby Yeti upgrades should only persist if the player has the corresponding snowflake upgrade
  const globalUpgradesToKeep = new Set();
  if (game.startingBabyYeti && game.startingBabyYeti.length > 0) {
    game.startingBabyYeti.forEach(yetiJrId => {
      globalUpgradesToKeep.add(yetiJrId);
    });
  }
  
  // Clear all global upgrades except the persistent Baby Yeti ones
  const currentGlobalUpgrades = Array.from(game._globalUpgrades);
  // console.log(`[RESET DEBUG] Before clearing - Global upgrades:`, currentGlobalUpgrades);
  // console.log(`[RESET DEBUG] Baby Yeti upgrades to preserve:`, Array.from(globalUpgradesToKeep));
  
  game._globalUpgrades.clear();
  currentGlobalUpgrades.forEach(upgradeId => {
    if (globalUpgradesToKeep.has(upgradeId)) {
      game._globalUpgrades.add(upgradeId);
      // console.log(`[RESET DEBUG] Preserving Baby Yeti upgrade: ${upgradeId}`);
    } else {
      // console.log(`[RESET DEBUG] Clearing global upgrade: ${upgradeId}`);
    }
  });
  
  // console.log(`[RESET DEBUG] After clearing - Remaining global upgrades:`, Array.from(game._globalUpgrades));
  
  game.unlockedLocations.clear();
  game.abilityBelt = [null, null, null, null];  // Reset ability belt
  game.unlockedAbilities.clear();
  game.abilityUsage.clear();
  
  // Reset icicle state
  game.icicleState = {
    startTime: 0,
    harvested: false,
    broken: false,
    lastCheckedHour: 0
  };
  game.iciclePendingLevels = 0;
  
  // Reset other analog-specific state
  game.yetisSighted = 0;
  game.currentYetiBuff = null;
  game.currentLocationBuff = null;
  game.prestigeCount = 0;
  
  // Reset battle system state
  game.battles = {
    yetiBattles: false,
    battleProbability: 1.0,
    abilityBeltLevel: 0,
    currentEvilYeti: null,
    currentDebuff: null,
    battleHistory: []
  };
  
  // Reset assistant-related stats that should be cleared on jump
  game._lifetimeFromAssistants.clear(); // Reset per-assistant lifetime earnings for this analog
  game._spsByAssistant = {}; // Reset current SPS calculations
  
  // Reset multipliers that come from global upgrades (since globalUpgrades are being reset)
  game.globalSpsMultiplier = 1; // Reset to default
  game.clickMultiplier = 1; // Reset to default
  game.classX2Buff = 1; // Reset class stacking buff
  game.travelDiscountGlobalUpgrades = 1; // Reset travel discounts
  game.travelDiscountAssistants = 1;
  game.travelSPSMultiplier = 1;
  game.travelDiscountBoosts = 1;
  
  // Reset click streak system
  game.clickStreak.isActive = false;
  game.clickStreak.startTime = 0;
  game.clickStreak.duration = 0;
  game.clickStreak.currentStreak = 0;
  game.clickStreak.clicksInCurrentSecond = 0;
  game.clickStreak.lastSecondTimestamp = 0;
  game.clickStreak.qualifyingSeconds = 0;
  game.clickStreak.recentClicks = [];
  game.clickStreak.currentClickRate = 0;
  game.clickStreak.activeBonus = {
    multiplier: 1,
    startTime: 0,
    duration: 0,
    tier: 0
  };
  // Keep streak statistics across jumps
  
  // Reset other temporary state
  game.lastClickTime = 0;
  game.streakBonusActive = false;
  game.streakBonusMultiplier = 1;
  game.streakBonusExpiresAt = 0;
  game.totalClicks = 0;
  
  // Reset snowflake upgrade tracking so effects are reapplied
  game.appliedSnowflakeUpgrades = [];
  
  // Preserve snowflakes and snowflake purchases
  game.snowflakePending = 0; // Any remainder from conversion
  // LifetimeSnowballs and analogs remain preserved
  
  // console.log(`[RESET DEBUG] After reset - globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
  // console.log(`[RESET DEBUG] After reset - assistantMultipliers:`, game.assistantMultipliers || {});
  // console.log(`[RESET DEBUG] After reset - clickMultiplier: ${game.clickMultiplier || 1}`);
  // console.log(`[RESET DEBUG] After reset - appliedSnowflakeUpgrades:`, game.appliedSnowflakeUpgrades || []);
  // console.log(`[RESET DEBUG] === GAME RESET COMPLETED ===`);
}
  