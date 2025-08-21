/**
 * systems/yetis.js - Yeti system for buff management
 * 
 * This module handles the yeti buff system, including:
 * - Yeti buff activation and tracking
 * - Buff duration management
 * - UI updates for yeti status
 * - Integration with the location system
 * 
 * The yeti buff system provides temporary bonuses when players click on yetis,
 * with different yeti classes providing different passive bonuses and base effects.
 * 
 * ===== YETI SPAWN RATE CONFIGURATION =====
 * To adjust yeti spawn frequency, modify these values in loops/hybrid/data/yetiData.js:
 * 
 * - "meanAppearanceTime": 60, // Mean spawn time in seconds (currently 1 minute)
 * - "classAppearanceProbability": 0.25, // Currently unused - all classes have equal probability
 * 
 * The actual spawn time uses a normal distribution:
 * - Minimum: 30 seconds (hardcoded)
 * - Mean: meanAppearanceTime seconds
 * - Standard deviation: meanAppearanceTime / 3
 * - Check interval: Every 5 seconds (in setupYetis function)
 * - Spawn probability: 100% when timer triggers (no probability check)
 * - Class selection: Equal probability for each class (Harvester, Defender, Traveler, Scholar)
 * 
 * For faster testing, try: meanAppearanceTime: 30
 * For slower gameplay, try: meanAppearanceTime: 300
 */

import { YETI, YETI_BASE_EFFECT } from './data/yetiData.js';

import { eventBus } from '../../core/eventBus.js';
import { ANALOG_TEST } from '../../core/config.js';
import { 
  ANALOG_TEST_DATA, 
  getRandomPreviousAnalog,
  getTopAnalogs,
  getTwoRandomAnalogs,
  getAverageAnalog,
  getTotalAssistantCount 
} from './data/analogTestData.js';
import { getAbilityBelt, getAbilityById } from './abilityBelt.js';
import { markSPSDirty } from '../passive/unifiedUpgrades.js';

// Yeti spawning state
let nextYetiSpawnTime = 0;
let currentSpawnedYeti = null;

// Timer management for yeti system
let yetiTimerIds = {
  buffExpirationTimer: null,
  countdownTimer: null,
  spawnCheckTimer: null
};

/**
 * Resets the yeti spawning system (called when jumping to new analog)
 */
export function resetYetiSpawning() {
  nextYetiSpawnTime = 0;
  // console.log('[YETI SPAWN] Yeti spawning system reset');
}

/**
 * Check if a yeti is currently visible/spawned
 * @returns {boolean} True if a yeti is currently visible, false otherwise
 */
export function isYetiVisible() {
  return currentSpawnedYeti !== null;
}

/**
 * Get the currently spawned yeti
 * @returns {Object|null} The currently spawned yeti object or null if none
 */
export function getCurrentSpawnedYeti() {
  return currentSpawnedYeti;
}

// -------------------------------
// yetis.js
// -------------------------------

/**
 * Apply base effect for Harvester yeti (pull snowballs from previous analog)
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} analogData - Previous analog data
 * @param {number} effectValue - Percentage value (0.05 for 5%)
 * @returns {number} Amount of snowballs added
 */
function applyHarvesterEffect(game, analogData, effectValue) {
  // console.log(`[HARVESTER EFFECT] ========== HARVESTER EFFECT CALCULATION ==========`);
  // console.log(`[HARVESTER EFFECT] Effect value: ${effectValue}`);
  // console.log(`[HARVESTER EFFECT] Analog data ID: ${analogData.id}`);
  // console.log(`[HARVESTER EFFECT] Total snowballs generated: ${analogData.totalSnowballsGenerated.toExponential(2)}`);
  
  const snowballsToAdd = Math.ceil(analogData.totalSnowballsGenerated * effectValue);
  const beforeSnowballs = game.snowballs;
  
  // console.log(`[HARVESTER EFFECT] Calculation: ${analogData.totalSnowballsGenerated.toExponential(2)} × ${effectValue} = ${snowballsToAdd.toExponential(2)}`);
  // console.log(`[HARVESTER EFFECT] Rounding: ${(analogData.totalSnowballsGenerated * effectValue).toExponential(2)} → ${snowballsToAdd.toExponential(2)}`);
  
  game.snowballs = Number(game.snowballs) + snowballsToAdd;
  
  // console.log(`[HARVESTER EFFECT] Snowballs: ${beforeSnowballs.toExponential(2)} → ${game.snowballs.toExponential(2)} (+${snowballsToAdd.toExponential(2)})`);
  // console.log(`[HARVESTER EFFECT] ========== HARVESTER EFFECT COMPLETE ==========`);
  
  return snowballsToAdd;
}

/**
 * Apply base effect for Defender yeti (pull assistants from previous analog)
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} analogData - Previous analog data
 * @param {number} effectValue - Percentage value (0.05 for 5%)
 * @returns {Object} Object with assistant types and amounts added
 */
function applyDefenderEffect(game, analogData, effectValue) {
  // console.log(`[DEFENDER EFFECT] ========== DEFENDER EFFECT CALCULATION ==========`);
  // console.log(`[DEFENDER EFFECT] Effect value: ${effectValue}`);
  // console.log(`[DEFENDER EFFECT] Analog data ID: ${analogData.id}`);
  // console.log(`[DEFENDER EFFECT] Available assistants:`, analogData.assistants);
  
  let totalAdded = 0;
  const addedAssistants = {};
  
  for (const [assistantType, count] of Object.entries(analogData.assistants)) {
    // console.log(`[DEFENDER EFFECT] Processing ${assistantType}: ${count} assistants`);
    
    const assistantsToAdd = Math.ceil(count * effectValue);
    // console.log(`[DEFENDER EFFECT] Calculation: ${count} × ${effectValue} = ${assistantsToAdd}`);
    // console.log(`[DEFENDER EFFECT] Rounding: ${(count * effectValue)} → ${assistantsToAdd}`);
    
    if (assistantsToAdd > 0) {
      if (!game.assistants[assistantType]) {
        game.assistants[assistantType] = 0;
      }
      const beforeAssistants = game.assistants[assistantType];
      game.assistants[assistantType] += assistantsToAdd;
      addedAssistants[assistantType] = assistantsToAdd;
      totalAdded += assistantsToAdd;
      
      // console.log(`[DEFENDER EFFECT] ${assistantType}: ${beforeAssistants} → ${game.assistants[assistantType]} (+${assistantsToAdd})`);
    } else {
      // console.log(`[DEFENDER EFFECT] ${assistantType}: No assistants to add (${assistantsToAdd})`);
    }
  }
  
  // console.log(`[DEFENDER EFFECT] Total assistants added: ${totalAdded}`);
  // console.log(`[DEFENDER EFFECT] Assistant breakdown:`, addedAssistants);
  // console.log(`[DEFENDER EFFECT] ========== DEFENDER EFFECT COMPLETE ==========`);
  
  return addedAssistants;
}

/**
 * Apply base effect for Traveler yeti (pull icicles from previous analog)
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} analogData - Previous analog data
 * @param {number} effectValue - Percentage value (0.05 for 5%)
 * @returns {number} Amount of icicles added
 */
function applyTravelerEffect(game, analogData, effectValue) {
  // console.log(`[TRAVELER EFFECT] ========== TRAVELER EFFECT CALCULATION ==========`);
  // console.log(`[TRAVELER EFFECT] Effect value: ${effectValue}`);
  // console.log(`[TRAVELER EFFECT] Analog data ID: ${analogData.id}`);
  // console.log(`[TRAVELER EFFECT] Snowflakes purchased: ${analogData.snowflakesPurchased}`);
  
  const snowflakesToAdd = Math.ceil(analogData.snowflakesPurchased * effectValue);
  const beforeSnowflakes = game.snowflakes || 0;
  
  // console.log(`[TRAVELER EFFECT] Calculation: ${analogData.snowflakesPurchased} × ${effectValue} = ${snowflakesToAdd}`);
  // console.log(`[TRAVELER EFFECT] Rounding: ${(analogData.snowflakesPurchased * effectValue)} → ${snowflakesToAdd}`);
  
  if (!game.snowflakes) game.snowflakes = 0;
  game.snowflakes += snowflakesToAdd;
  
  // console.log(`[TRAVELER EFFECT] Snowflakes: ${beforeSnowflakes} → ${game.snowflakes} (+${snowflakesToAdd})`);
  // console.log(`[TRAVELER EFFECT] ========== TRAVELER EFFECT COMPLETE ==========`);
  
  return snowflakesToAdd;
}

/**
 * Apply base effect for Scholar yeti (pull snowflakes from previous analog)
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} analogData - Previous analog data
 * @param {number} effectValue - Percentage value (0.05 for 5%)
 * @returns {number} Amount of snowflakes added
 */
function applyScholarEffect(game, analogData, effectValue) {
  // console.log(`[SCHOLAR EFFECT] ========== SCHOLAR EFFECT CALCULATION ==========`);
  // console.log(`[SCHOLAR EFFECT] Effect value: ${effectValue}`);
  // console.log(`[SCHOLAR EFFECT] Analog data ID: ${analogData.id}`);
  // console.log(`[SCHOLAR EFFECT] Icicles generated: ${analogData.iciclesGenerated}`);
  
  const iciclesToAdd = Math.ceil(analogData.iciclesGenerated * effectValue);
  const beforeIcicles = game.icicles || 0;
  
  // console.log(`[SCHOLAR EFFECT] Calculation: ${analogData.iciclesGenerated} × ${effectValue} = ${iciclesToAdd}`);
  // console.log(`[SCHOLAR EFFECT] Rounding: ${(analogData.iciclesGenerated * effectValue)} → ${iciclesToAdd}`);
  
  if (!game.icicles) game.icicles = 0;
  game.icicles += iciclesToAdd;
  
  // console.log(`[SCHOLAR EFFECT] Icicles: ${beforeIcicles} → ${game.icicles} (+${iciclesToAdd})`);
  // console.log(`[SCHOLAR EFFECT] ========== SCHOLAR EFFECT COMPLETE ==========`);
  
  return iciclesToAdd;
}

/**
 * Apply the immediate base effect for a yeti class
 * @param {GameStateFlat} game - The current game state object
 * @param {string} yetiClass - The class of yeti to apply effect for
 * @returns {Object|null} Object with effect amounts applied, or null if no effect
 */
function applyYetiBaseEffect(game, yetiClass) {
  // console.log(`[YETI EFFECT] ========== APPLYING YETI BASE EFFECT ==========`);
  // console.log(`[YETI EFFECT] Yeti Class: ${yetiClass}`);
  // console.log(`[YETI EFFECT] Current classX2Buff: ${game.classX2Buff || 1}`);
  
  // Check if there are any abilities in the belt that match this yeti class
  const matchingAbilities = getMatchingAbilities(game, yetiClass);
  
  if (matchingAbilities.length > 0) {
    // Apply all matching abilities instead of base effect
    // console.log(`[YETI EFFECT] Found ${matchingAbilities.length} matching abilities for ${yetiClass}`);
    // console.log(`[YETI EFFECT] Abilities found:`, matchingAbilities.map(a => `${a.name} (${a.id})`));
    // console.log(`[YETI EFFECT] Using abilities instead of base effect`);
    return applyAbilityEffects(game, matchingAbilities);
  }
  
  // No matching abilities found, use base effect
  const baseEffect = YETI_BASE_EFFECT[yetiClass];
  if (!baseEffect) {
    console.error(`[YETI EFFECT] No base effect found for class: ${yetiClass}`);
    return null;
  }
  
  // console.log(`[YETI EFFECT] No matching abilities found - using base effect`);
  // console.log(`[YETI EFFECT] Base effect:`, baseEffect);
  
  // Get random previous analog based on test mode
  let analogData;
  if (ANALOG_TEST) {
    const currentAnalog = game.analogNumber || 1;
    // console.log(`[YETI EFFECT] Current analog: ${currentAnalog}, looking for previous analogs`);
    
    // For testing purposes, if we're on analog 1, simulate being on analog 11
    // so we can access all test data (analogs 1-10)
    const effectiveAnalog = currentAnalog === 1 ? 11 : currentAnalog;
    
    analogData = getRandomPreviousAnalog(effectiveAnalog);
    if (!analogData) {
      // console.log(`[YETI EFFECT] No previous analogs available (current: ${currentAnalog}, effective: ${effectiveAnalog})`);
      // console.log(`[YETI EFFECT] Available test analogs: ${ANALOG_TEST_DATA.analogs.map(a => a.id).join(', ')}`);
      return null;
    }
  } else {
    // Use real analog data from game state
    const currentAnalog = game.analogNumber || 1;
    
    // Get random previous analog from real analog history
    if (!game.analogs || game.analogs.length === 0) {
      // console.log(`[YETI EFFECT] No previous analogs available (current: ${currentAnalog})`);
      return null;
    }
    
    // Get the most recent analog data
    const rawAnalogData = game.analogs[game.analogs.length - 1];
    
    // console.log(`[ANALOG DATA] Raw analog data:`, rawAnalogData);
    
    analogData = {
      id: rawAnalogData.number,
      startingLifetimeSnowballs: 0, // Not tracked in real data
      endingLifetimeSnowballs: rawAnalogData.lifetimeSnowballs || 0,
      endingSnowballWallet: rawAnalogData.snowballs || 0,
      endingSPS: rawAnalogData.finalSPS || 0,
      // Use actual tracked values from analog summary
      iciclesGenerated: rawAnalogData.iciclesHarvested || Math.floor((rawAnalogData.finalSPS || 0) * 0.1),
      snowflakesPurchased: rawAnalogData.preMeltdownSnowflakes || 0,
      totalSnowballsGenerated: rawAnalogData.currentAnalogSnowballs || 0,
      assistants: rawAnalogData.assistants || {}
    };
    
    // console.log(`[ANALOG DATA] Converted analog data:`, analogData);
    
    // console.log(`[YETI EFFECT] Using real analog data from analog ${analogData.id}:`, {
    //   totalSnowballsGenerated: analogData.totalSnowballsGenerated,
    //   assistants: analogData.assistants,
    //   endingSPS: analogData.endingSPS
    // });
  }
  
  // console.log(`[YETI EFFECT] Using analog data:`, {
  //   id: analogData.id,
  //   totalSnowballsGenerated: analogData.totalSnowballsGenerated,
  //   assistants: analogData.assistants,
  //   iciclesGenerated: analogData.iciclesGenerated,
  //   snowflakesPurchased: analogData.snowflakesPurchased
  // });
  
  // console.log(`[YETI EFFECT] Applying ${yetiClass} base effect from analog ${analogData.id}`);
  // console.log(`[YETI EFFECT] Effect type: ${baseEffect.effectType}, Value: ${baseEffect.value}`);
  
  let appliedAmounts = null;
  
  // Apply the appropriate effect based on effectType
  switch (baseEffect.effectType) {
    case 'pullSnowballs':
      // console.log(`[YETI EFFECT] Applying Harvester effect (pullSnowballs)`);
      appliedAmounts = { snowballs: applyHarvesterEffect(game, analogData, baseEffect.value) };
      break;
    case 'pullAssistants':
      // console.log(`[YETI EFFECT] Applying Defender effect (pullAssistants)`);
      appliedAmounts = { assistants: applyDefenderEffect(game, analogData, baseEffect.value) };
      break;
    case 'pullIcicles':
      // console.log(`[YETI EFFECT] Applying Scholar effect (pullIcicles)`);
      appliedAmounts = { icicles: applyScholarEffect(game, analogData, baseEffect.value) };
      break;
    case 'pullSnowflakes':
      // console.log(`[YETI EFFECT] Applying Traveler effect (pullSnowflakes)`);
      appliedAmounts = { snowflakes: applyTravelerEffect(game, analogData, baseEffect.value) };
      break;
    default:
      console.error(`[YETI EFFECT] Unknown effect type: ${baseEffect.effectType}`);
  }
  
  // console.log(`[YETI EFFECT] Applied amounts:`, appliedAmounts);
  // console.log(`[YETI EFFECT] ========== BASE EFFECT COMPLETE ==========`);
  
  return appliedAmounts;
}

/**
 * Activates a yeti buff for the specified yeti class
 * @param {GameStateFlat} game - The current game state object
 * @param {string} yetiClass - The class of yeti to activate (Harvester, Defender, Traveler, Scholar)
 * @returns {boolean} True if buff was activated successfully, false otherwise
 */
export function activateYetiBuff(game, yetiClass) {
  // console.log(`[YETI REWARD] ========== YETI REWARD TRIGGERED ==========`);
  // console.log(`[YETI REWARD] Yeti Class: ${yetiClass}`);
  // console.log(`[YETI REWARD] Current classX2Buff: ${game.classX2Buff || 1}`);
  // console.log(`[YETI REWARD] Current yeti buff: ${game.currentYetiBuff ? game.currentYetiBuff.class : 'None'}`);
  // console.log(`[YETI REWARD] Current location buff: ${game.currentLocationBuff ? game.currentLocationBuff.class : 'None'}`);
  
  // Find the yeti data for the specified class
  const yetiData = YETI.yetis.find(yeti => yeti.class === yetiClass);
  
  if (!yetiData) {
    console.error(`[YETI REWARD] Yeti class "${yetiClass}" not found`);
    return false;
  }

  // Check if there's already an active buff
  if (game.currentYetiBuff && game.currentYetiBuff.class === yetiClass) {
    // console.log(`[YETI REWARD] Yeti buff already active: ${game.currentYetiBuff.class} - skipping`);
    return false;
  }

  // Look up the base effect for this yeti class
  const baseEffect = YETI_BASE_EFFECT[yetiClass];
  
  if (!baseEffect) {
    console.error(`[YETI REWARD] Base effect for class "${yetiClass}" not found`);
    return false;
  }

  // console.log(`[YETI REWARD] Base effect found:`, baseEffect);

  // Create the yeti buff object
  const buff = {
    class: yetiClass,
    name: yetiData.name,
    startTime: game.getGameTime(), // Use game time instead of real time
    duration: baseEffect.duration * 1000, // Convert seconds to milliseconds
    baseEffect: baseEffect
  };

  // Apply the buff
  game.currentYetiBuff = buff;
  game.yetisSighted = (game.yetisSighted || 0) + 1;

  // console.log(`[YETI REWARD] Buff applied: ${yetiData.name} (${yetiClass})`);
  // console.log(`[YETI REWARD] Buff duration: ${YETI_BUFF_DURATION_MS}ms`);

  // Apply immediate base effect
  // console.log(`[YETI REWARD] Applying immediate base effect for ${yetiClass}...`);
  const appliedAmounts = applyYetiBaseEffect(game, yetiClass);
  // console.log(`[YETI REWARD] Applied amounts result:`, appliedAmounts);
  
  // Store the original amounts in the buff object for stacking
  if (appliedAmounts) {
    buff.originalAmounts = appliedAmounts;
    // console.log(`[YETI REWARD] Stored original amounts for stacking:`, appliedAmounts);
  } else {
    // console.log(`[YETI REWARD] No amounts applied - no analog data available`);
  }

  // Emit yeti buff activated event
  if (window.eventBus) {
    // console.log(`[YETI EVENT] Emitting yetiBuffActivated event:`, {
    //   yetiClass: yetiClass,
    //   yetiName: yetiData.name,
    //   baseEffect: baseEffect,
    //   appliedAmounts: appliedAmounts
    // });
    
    window.eventBus.emit('yetiBuffActivated', {
      yetiClass: yetiClass,
      yetiName: yetiData.name,
      baseEffect: baseEffect,
      appliedAmounts: appliedAmounts // Include the amounts that were applied
    });
  }

  // console.log(`[YETI REWARD] Activated ${yetiClass} buff: ${yetiData.name}`);
  
  // Update UI
  updateYetiUI(game);
  
  // Check buff stacking after activation
  // console.log(`[YETI REWARD] Checking buff stacking...`);
  if (game.checkBuffStacking) {
    const beforeStacking = game.classX2Buff || 1;
    game.checkBuffStacking();
    const afterStacking = game.classX2Buff || 1;
    // console.log(`[YETI REWARD] Buff stacking check: ${beforeStacking} → ${afterStacking}`);
    
    if (afterStacking > beforeStacking) {
      // console.log(`[YETI REWARD] 🎯 STACKING ACTIVATED! classX2Buff = ${afterStacking}`);
      // console.log(`[YETI REWARD] Original amounts will be reapplied with ${afterStacking}x multiplier`);
    }
  }
  
  // Mark SPS as dirty since yeti buff was activated - Phase 3
  markSPSDirty();
  
  // Trigger SPS recalculation to apply the yeti buff
  if (window.calculateSPSWithBoosts) {
    window.calculateSPSWithBoosts(game);
  }
  
  // console.log(`[YETI REWARD] ========== YETI REWARD COMPLETE ==========`);
  
  return true;
}

/**
 * Checks if the current yeti buff has expired and clears it if so
 * @param {GameStateFlat} game - The current game state object
 * @returns {boolean} True if buff was cleared, false if still active
 */
export function checkYetiBuffExpiration(game) {
  if (!game.currentYetiBuff) {
    return false;
  }

  const now = game.getGameTime(); // Use game time instead of real time
  const buffStartTime = game.currentYetiBuff.startTime;
  const buffDuration = game.currentYetiBuff.duration;

  if (now - buffStartTime >= buffDuration) {
    // Buff has expired
    const expiredClass = game.currentYetiBuff.class;
    game.currentYetiBuff = null;

    // Emit yeti buff expired event
    if (window.eventBus) {
      window.eventBus.emit('yetiBuffExpired', {
        yetiClass: expiredClass
      });
    }

    // console.log(`[YETI] ${expiredClass} buff expired`);
    
    // Update UI
    updateYetiUI(game);
    
    // Check buff stacking after expiration
    if (game.checkBuffStacking) {
      game.checkBuffStacking();
    }
    
    // Trigger SPS recalculation to remove the yeti buff
    if (window.calculateSPSWithBoosts) {
      window.calculateSPSWithBoosts(game);
    }
    
    return true;
  }

  return false;
}

/**
 * Gets the remaining time for the current yeti buff in seconds
 * @param {GameStateFlat} game - The current game state object
 * @returns {number} Remaining time in seconds, or 0 if no active buff
 */
export function getYetiBuffRemainingTime(game) {
  if (!game.currentYetiBuff) {
    return 0;
  }

  const now = game.getGameTime(); // Use game time instead of real time
  const buffStartTime = game.currentYetiBuff.startTime;
  const buffDuration = game.currentYetiBuff.duration;
  const elapsed = now - buffStartTime;
  const remaining = Math.max(0, buffDuration - elapsed);

  return Math.ceil(remaining / 1000); // Convert to seconds
}

/**
 * Gets the class of the current yeti buff
 * @param {GameStateFlat} game - The current game state object
 * @returns {string} Yeti class name or empty string if no active buff
 */
export function getYetiBuffClass(game) {
  if (!game.currentYetiBuff) {
    return '';
  }

  return game.currentYetiBuff.class;
}

/**
 * Get abilities from the belt that match the yeti class
 * @param {GameStateFlat} game - The current game state object
 * @param {string} yetiClass - The class of yeti to match against
 * @returns {Array} Array of matching ability objects
 */
function getMatchingAbilities(game, yetiClass) {
  const belt = getAbilityBelt(game);
  const matchingAbilities = [];
  
  // Check each slot in the belt
  for (let i = 1; i <= 4; i++) {
    const slotKey = `slot${i}`;
    const abilityId = belt[slotKey];
    
    if (abilityId) {
      const ability = getAbilityById(abilityId);
      if (ability && ability.class === yetiClass.toLowerCase()) {
        matchingAbilities.push(ability);
      }
    }
  }
  
  return matchingAbilities;
}

/**
 * Apply multiple ability effects
 * @param {GameStateFlat} game - The current game state object
 * @param {Array} abilities - Array of ability objects to apply
 * @returns {Object} Object with combined effect amounts applied
 */
function applyAbilityEffects(game, abilities) {
  // console.log(`[ABILITY EFFECT] ========== APPLYING ABILITY EFFECTS ==========`);
  // console.log(`[ABILITY EFFECT] Number of abilities: ${abilities.length}`);
  // console.log(`[ABILITY EFFECT] Current classX2Buff: ${game.classX2Buff || 1}`);
  
  let totalAppliedAmounts = {
    snowballs: 0,
    assistants: {},
    icicles: 0,
    snowflakes: 0
  };
  
  for (let i = 0; i < abilities.length; i++) {
    const ability = abilities[i];
    // console.log(`[ABILITY EFFECT] --- Applying ability ${i + 1}/${abilities.length} ---`);
    // console.log(`[ABILITY EFFECT] Ability: ${ability.name} (${ability.id})`);
    // console.log(`[ABILITY EFFECT] Class: ${ability.class}`);
    // console.log(`[ABILITY EFFECT] Effect:`, ability.effect);
    
    const effectResult = applyAbilityEffect(game, ability);
    if (effectResult) {
      // console.log(`[ABILITY EFFECT] Ability result:`, effectResult);
      // Sum up the results
      for (const [key, value] of Object.entries(effectResult)) {
        if (totalAppliedAmounts.hasOwnProperty(key)) {
          if (key === 'assistants') {
            // Special handling for assistants - merge objects instead of adding
            if (value && typeof value === 'object') {
              for (const [assistantType, count] of Object.entries(value)) {
                if (count > 0) {
                  totalAppliedAmounts.assistants[assistantType] = (totalAppliedAmounts.assistants[assistantType] || 0) + count;
                }
              }
            }
          } else {
            // For numeric values (snowballs, icicles, snowflakes), add normally
            const before = totalAppliedAmounts[key];
            totalAppliedAmounts[key] += value;
            // console.log(`[ABILITY EFFECT] ${key}: ${before} → ${totalAppliedAmounts[key]} (+${value})`);
          }
        }
      }
    } else {
      // console.log(`[ABILITY EFFECT] No effect result for this ability`);
    }
  }
  
  // console.log(`[ABILITY EFFECT] Total applied amounts:`, totalAppliedAmounts);
  // console.log(`[ABILITY EFFECT] ========== ABILITY EFFECTS COMPLETE ==========`);
  
  return totalAppliedAmounts;
}

/**
 * Apply a single ability effect
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} ability - The ability object to apply
 * @returns {Object|null} Object with effect amounts applied, or null if no effect
 */
function applyAbilityEffect(game, ability) {
  // console.log(`[ABILITY EFFECT] ========== APPLYING SINGLE ABILITY ==========`);
  // console.log(`[ABILITY EFFECT] Ability: ${ability.name} (${ability.id})`);
  // console.log(`[ABILITY EFFECT] Class: ${ability.class}`);
  // console.log(`[ABILITY EFFECT] Effect:`, ability.effect);
  
  const effect = ability.effect;
  if (!effect) {
    console.error(`[ABILITY EFFECT] No effect found for ability: ${ability.id}`);
    return null;
  }
  
  // console.log(`[ABILITY EFFECT] Effect type: ${effect.effectType}`);
  // console.log(`[ABILITY EFFECT] Effect value: ${effect.value}`);
  // console.log(`[ABILITY EFFECT] Effect target: ${effect.target}`);
  
  // Get analog data based on the target
  const analogData = getAnalogDataForTarget(game, effect.target);
  if (!analogData) {
    // console.log(`[ABILITY EFFECT] No analog data available for target: ${effect.target}`);
    return null;
  }
  
  // console.log(`[ABILITY EFFECT] Analog data retrieved:`, Array.isArray(analogData) ? `${analogData.length} analogs` : `Single analog (${analogData.id})`);
  
  let appliedAmounts = null;
  
  // Apply the appropriate effect based on effectType
  switch (effect.effectType) {
    case 'pullSnowballs':
      // console.log(`[ABILITY EFFECT] Applying pullSnowballs effect`);
      if (Array.isArray(analogData)) {
        // Multiple analogs - sum the effects
        // console.log(`[ABILITY EFFECT] Processing ${analogData.length} analogs for snowballs`);
        let totalSnowballs = 0;
        for (let i = 0; i < analogData.length; i++) {
          const analog = analogData[i];
          // console.log(`[ABILITY EFFECT] Processing analog ${i + 1}/${analogData.length}: ${analog.id}`);
          const snowballsFromAnalog = applyHarvesterEffect(game, analog, effect.value);
          totalSnowballs += snowballsFromAnalog;
          // console.log(`[ABILITY EFFECT] Snowballs from analog ${analog.id}: ${snowballsFromAnalog.toExponential(2)}`);
        }
        // console.log(`[ABILITY EFFECT] Total snowballs from all analogs: ${totalSnowballs.toExponential(2)}`);
        appliedAmounts = { snowballs: totalSnowballs };
      } else {
        // console.log(`[ABILITY EFFECT] Processing single analog: ${analogData.id}`);
        appliedAmounts = { snowballs: applyHarvesterEffect(game, analogData, effect.value) };
      }
      break;
    case 'pullAssistants':
      // console.log(`[ABILITY EFFECT] Applying pullAssistants effect`);
      if (Array.isArray(analogData)) {
        // Multiple analogs - merge the effects properly
        // console.log(`[ABILITY EFFECT] Processing ${analogData.length} analogs for assistants`);
        const totalAssistants = {};
        for (let i = 0; i < analogData.length; i++) {
          const analog = analogData[i];
          // console.log(`[ABILITY EFFECT] Processing analog ${i + 1}/${analogData.length}: ${analog.id}`);
          const assistantsFromAnalog = applyDefenderEffect(game, analog, effect.value);
          // Merge the assistant objects properly
          for (const [assistantType, count] of Object.entries(assistantsFromAnalog)) {
            if (count > 0) {
              totalAssistants[assistantType] = (totalAssistants[assistantType] || 0) + count;
            }
          }
          // console.log(`[ABILITY EFFECT] Assistants from analog ${analog.id}:`, assistantsFromAnalog);
        }
        // console.log(`[ABILITY EFFECT] Total assistants from all analogs:`, totalAssistants);
        appliedAmounts = { assistants: totalAssistants };
      } else {
        // console.log(`[ABILITY EFFECT] Processing single analog: ${analogData.id}`);
        appliedAmounts = { assistants: applyDefenderEffect(game, analogData, effect.value) };
      }
      break;
    case 'pullIcicles':
      // console.log(`[ABILITY EFFECT] Applying pullIcicles effect`);
      if (Array.isArray(analogData)) {
        // Multiple analogs - sum the effects
        // console.log(`[ABILITY EFFECT] Processing ${analogData.length} analogs for icicles`);
        let totalIcicles = 0;
        for (let i = 0; i < analogData.length; i++) {
          const analog = analogData[i];
          // console.log(`[ABILITY EFFECT] Processing analog ${i + 1}/${analogData.length}: ${analog.id}`);
          const iciclesFromAnalog = applyScholarEffect(game, analog, effect.value);
          totalIcicles += iciclesFromAnalog;
          // console.log(`[ABILITY EFFECT] Icicles from analog ${analog.id}: ${iciclesFromAnalog}`);
        }
        // console.log(`[ABILITY EFFECT] Total icicles from all analogs: ${totalIcicles}`);
        appliedAmounts = { icicles: totalIcicles };
      } else {
        // console.log(`[ABILITY EFFECT] Processing single analog: ${analogData.id}`);
        appliedAmounts = { icicles: applyScholarEffect(game, analogData, effect.value) };
      }
      break;
    case 'pullSnowflakes':
      // console.log(`[ABILITY EFFECT] Applying pullSnowflakes effect`);
      if (Array.isArray(analogData)) {
        // Multiple analogs - sum the effects
        // console.log(`[ABILITY EFFECT] Processing ${analogData.length} analogs for snowflakes`);
        let totalSnowflakes = 0;
        for (let i = 0; i < analogData.length; i++) {
          const analog = analogData[i];
          // console.log(`[ABILITY EFFECT] Processing analog ${i + 1}/${analogData.length}: ${analog.id}`);
          const snowflakesFromAnalog = applyTravelerEffect(game, analog, effect.value);
          totalSnowflakes += snowflakesFromAnalog;
          // console.log(`[ABILITY EFFECT] Snowflakes from analog ${analog.id}: ${snowflakesFromAnalog}`);
        }
        // console.log(`[ABILITY EFFECT] Total snowflakes from all analogs: ${totalSnowflakes}`);
        appliedAmounts = { snowflakes: totalSnowflakes };
      } else {
        // console.log(`[ABILITY EFFECT] Processing single analog: ${analogData.id}`);
        appliedAmounts = { snowflakes: applyTravelerEffect(game, analogData, effect.value) };
      }
      break;
    default:
      console.error(`[ABILITY EFFECT] Unknown effect type: ${effect.effectType}`);
  }
  
  // console.log(`[ABILITY EFFECT] Final applied amounts:`, appliedAmounts);
  // console.log(`[ABILITY EFFECT] ========== SINGLE ABILITY COMPLETE ==========`);
  
  return appliedAmounts;
}

/**
 * Get analog data based on the target type
 * @param {GameStateFlat} game - The current game state object
 * @param {string} target - The target type (randomAnalog, topAnalogs, twoRandomAnalogs, averageAnalog)
 * @returns {Object|Array|null} Analog data object, array of analog data, or null if not found
 */
function getAnalogDataForTarget(game, target) {
  if (!ANALOG_TEST) {
    // Use real analog data from game state
    if (!game.analogs || game.analogs.length === 0) {
      // console.log(`[ANALOG DATA] No previous analogs available`);
      return null;
    }
    
    switch (target) {
      case 'randomAnalog':
        // Get a random previous analog
        const randomIndex = Math.floor(Math.random() * game.analogs.length);
        return convertRealAnalogData(game.analogs[randomIndex]);
        
      case 'topAnalogs':
        // Get the top performing analog (by snowballs generated)
        const sortedBySnowballs = [...game.analogs].sort((a, b) => 
          (b.currentAnalogSnowballs || 0) - (a.currentAnalogSnowballs || 0)
        );
        return convertRealAnalogData(sortedBySnowballs[0]);
        
      case 'twoRandomAnalogs':
        // Get two random unique analogs
        if (game.analogs.length < 2) {
          // If only 1 analog, duplicate it to simulate having 2 analogs
          const singleAnalog = convertRealAnalogData(game.analogs[0]);
          return [singleAnalog, singleAnalog];
        }
        const shuffled = [...game.analogs].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2).map(convertRealAnalogData);
        
      case 'averageAnalog':
        // Calculate average analog data
        const avgAnalog = calculateAverageAnalogData(game.analogs);
        return avgAnalog;
        
      default:
        console.error(`[ANALOG DATA] Unknown target type: ${target}`);
        return null;
    }
  }
  
  const currentAnalog = game.analogNumber || 1;
  // For testing purposes, if we're on analog 1, simulate being on analog 11
  const effectiveAnalog = currentAnalog === 1 ? 11 : currentAnalog;
  
  switch (target) {
    case 'randomAnalog':
      return getRandomPreviousAnalog(effectiveAnalog);
    case 'topAnalogs':
      return getTopAnalogs(effectiveAnalog);
    case 'twoRandomAnalogs':
      return getTwoRandomAnalogs(effectiveAnalog);
    case 'averageAnalog':
      return getAverageAnalog(effectiveAnalog);
    default:
      console.error(`[ANALOG DATA] Unknown target type: ${target}`);
      return null;
  }
}

/**
 * Convert real analog data to the format expected by yeti effects
 * @param {Object} analogData - Real analog data from game state
 * @returns {Object} Converted analog data
 */
function convertRealAnalogData(analogData) {
  // console.log(`[CONVERT REAL ANALOG] Converting analog data:`, analogData);
  
  const converted = {
    id: analogData.number,
    startingLifetimeSnowballs: 0, // Not tracked in real data
    endingLifetimeSnowballs: analogData.lifetimeSnowballs || 0,
    endingSnowballWallet: analogData.snowballs || 0,
    endingSPS: analogData.finalSPS || 0,
    // Use actual tracked values from analog summary
    iciclesGenerated: analogData.iciclesHarvested || 0,
    snowflakesPurchased: analogData.preMeltdownSnowflakes || 0,
    totalSnowballsGenerated: analogData.currentAnalogSnowballs || 0,
    assistants: analogData.assistants || {}
  };
  
  // console.log(`[CONVERT REAL ANALOG] Converted data:`, converted);
  return converted;
}

/**
 * Calculate average analog data from real analog history
 * @param {Array} analogs - Array of real analog data
 * @returns {Object} Average analog data
 */
function calculateAverageAnalogData(analogs) {
  if (analogs.length === 0) return null;
  
  const totalAnalogs = analogs.length;
  
  // Calculate averages for all relevant fields
  const avgSnowballs = analogs.reduce((sum, analog) => sum + (analog.snowballs || 0), 0) / totalAnalogs;
  const avgSPS = analogs.reduce((sum, analog) => sum + (analog.finalSPS || 0), 0) / totalAnalogs;
  const avgCurrentAnalogSnowballs = analogs.reduce((sum, analog) => sum + (analog.currentAnalogSnowballs || 0), 0) / totalAnalogs;
  
  // Average assistants
  const avgAssistants = {};
  const assistantKeys = Object.keys(analogs[0].assistants || {});
  
  for (const key of assistantKeys) {
    const total = analogs.reduce((sum, analog) => sum + (analog.assistants?.[key] || 0), 0);
    avgAssistants[key] = Math.floor(total / totalAnalogs);
  }
  
  // Average icicles and snowflakes
  const avgIciclesGenerated = analogs.reduce((sum, analog) => sum + (analog.iciclesHarvested || 0), 0) / totalAnalogs;
  const avgSnowflakesPurchased = analogs.reduce((sum, analog) => sum + (analog.preMeltdownSnowflakes || 0), 0) / totalAnalogs;
  
  return {
    id: 'average',
    startingLifetimeSnowballs: 0,
    endingLifetimeSnowballs: avgSnowballs,
    endingSnowballWallet: avgSnowballs,
    endingSPS: avgSPS,
    iciclesGenerated: Math.floor(avgIciclesGenerated),
    snowflakesPurchased: Math.floor(avgSnowflakesPurchased),
    totalSnowballsGenerated: avgCurrentAnalogSnowballs,
    assistants: avgAssistants
  };
}

/**
 * Gets the current yeti buff's passive bonus effect
 * @param {GameStateFlat} game - The current game state object
 * @returns {Object|null} Passive bonus effect or null if no active buff
 * @deprecated Passive bonuses are no longer used. Use getCurrentYetiBaseEffect() instead.
 */
export function getCurrentYetiPassiveBonus(game) {
  // Passive bonuses are no longer used in the new system
  return null;
}

/**
 * Gets the current yeti buff's base effect
 * @param {GameStateFlat} game - The current game state object
 * @returns {Object|null} Base effect or null if no active buff
 */
export function getCurrentYetiBaseEffect(game) {
  if (!game.currentYetiBuff) {
    return null;
  }

  return game.currentYetiBuff.baseEffect;
}

/**
 * Updates the yeti UI to reflect the current buff status
 * @param {GameStateFlat} game - The current game state object
 */
export function updateYetiUI(game) {
  const yetiContainer = document.getElementById('yeti-container');
  if (!yetiContainer) {
    return;
  }

  if (!game.currentYetiBuff) {
    // No active buff
    yetiContainer.innerHTML = `
      <div class="yeti-status">
        <h3>Yeti Buffs</h3>
        <p>No active yeti buff</p>
        <div class="yeti-buttons">
          <button onclick="window.activateYetiBuffFromUI('Harvester')" class="yeti-button harvester">Activate Harvester</button>
          <button onclick="window.activateYetiBuffFromUI('Defender')" class="yeti-button defender">Activate Defender</button>
          <button onclick="window.activateYetiBuffFromUI('Traveler')" class="yeti-button traveler">Activate Traveler</button>
          <button onclick="window.activateYetiBuffFromUI('Scholar')" class="yeti-button scholar">Activate Scholar</button>
        </div>
      </div>
    `;
  } else {
    // Active buff
    const remainingTime = getYetiBuffRemainingTime(game);
    const yetiData = YETI.yetis.find(yeti => yeti.class === game.currentYetiBuff.class);
    
    yetiContainer.innerHTML = `
      <div class="yeti-status active">
        <h3>Active Yeti Buff</h3>
        <div class="yeti-buff-info">
          <h4>${yetiData.name} (${game.currentYetiBuff.class})</h4>
          <p>${yetiData.description}</p>
          <p><strong>Time Remaining:</strong> <span id="yeti-countdown">${remainingTime}s</span></p>
          <p><strong>Effect:</strong> ${game.currentYetiBuff.baseEffect.description}</p>
        </div>
      </div>
    `;
  }
}

/**
 * Generates a random time using a bell curve distribution around the mean
 * Uses Box-Muller transform to create a normal distribution
 * @param {number} mean - Mean time in seconds
 * @param {number} stdDev - Standard deviation (defaults to mean/3 for reasonable spread)
 * @returns {number} Random time in seconds
 */
function generateRandomSpawnTime(mean, stdDev = mean / 3) {
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  // Apply to our distribution
  const randomTime = mean + (z0 * stdDev);
  
  // Ensure minimum time (at least 30 seconds)
  return Math.max(30, randomTime);
}

/**
 * Determines which yeti class should spawn based on probabilities
 * @returns {string} Yeti class name (always returns a class)
 */
function determineYetiClass() {
  // Get unique yeti classes (no duplicates)
  const uniqueClasses = [...new Set(YETI.yetis.map(yeti => yeti.class))];
  
  // Each class has equal probability (classAppearanceProbability is used for weighting if needed)
  // For now, simple random selection with equal probability
  const randomIndex = Math.floor(Math.random() * uniqueClasses.length);
  return uniqueClasses[randomIndex];
}

/**
 * Creates a visual yeti element on the screen
 * @param {string} yetiClass - The class of yeti to spawn
 * @param {GameStateFlat} game - The current game state object
 */
function spawnYetiOnScreen(yetiClass, game) {
  // Remove any existing yeti
  if (currentSpawnedYeti) {
    currentSpawnedYeti.remove();
    currentSpawnedYeti = null;
  }
  
  // Find all yetis of the specified class
  const yetisOfClass = YETI.yetis.filter(yeti => yeti.class === yetiClass);
  if (yetisOfClass.length === 0) {
    // console.error(`[YETI SPAWN] No yetis found for class "${yetiClass}"`);
    return;
  }
  
  // Randomly select one yeti from this class
  const randomIndex = Math.floor(Math.random() * yetisOfClass.length);
  const yetiData = yetisOfClass[randomIndex];
  
  // Create yeti element
  const yetiElement = document.createElement('div');
  yetiElement.className = 'spawned-yeti';
  yetiElement.id = 'spawned-yeti';
  yetiElement.innerHTML = `
    <div class="yeti-sprite ${yetiClass.toLowerCase()}" title="${yetiData.name}">
      <img src="${yetiData.icon}" alt="${yetiData.name}" class="yeti-icon" />
      <span class="yeti-name">${yetiData.name}</span>
      <span class="yeti-class">${yetiData.class}</span>
    </div>
  `;
  
  // Use SpawnZoneManager for positioning if available
  let x, y;
  if (window.spawnZoneManager) {
    const position = window.spawnZoneManager.getRandomPositionInZoneType('yeti', 120, 80);
    if (position) {
      x = position.x;
      y = position.y;
      // Register spawn with spawn zone manager
      window.spawnZoneManager.registerSpawn('spawned-yeti', x, y, 120, 80, 'yeti');
    } else {
      // Fallback to random positioning
      const maxX = window.innerWidth - 120;
      const maxY = window.innerHeight - 80;
      x = Math.random() * maxX;
      y = Math.random() * maxY;
    }
  } else {
    // Fallback to random positioning
    const maxX = window.innerWidth - 120;
    const maxY = window.innerHeight - 80;
    x = Math.random() * maxX;
    y = Math.random() * maxY;
  }
  
  yetiElement.style.position = 'fixed';
  yetiElement.style.left = `${x}px`;
  yetiElement.style.top = `${y}px`;
  yetiElement.style.zIndex = '1000';
  
  // Add click handler
  yetiElement.addEventListener('click', () => {
    // console.log(`[YETI SPAWN] Yeti clicked: ${yetiClass}`);
    
    // Add visual feedback - flash and scale effect
    yetiElement.style.transform = 'scale(1.2)';
    yetiElement.style.filter = 'brightness(1.5)';
    yetiElement.style.transition = 'all 0.2s ease-in-out';
    
    // Add a brief delay before activating the buff to show the visual feedback
    setTimeout(() => {
      activateYetiBuff(game, yetiClass);
      despawnYeti();
    }, 200);
  });
  
  // Add to page
  document.body.appendChild(yetiElement);
  currentSpawnedYeti = yetiElement;
  
  // Emit yeti spawned events
  if (window.eventBus) {
    window.eventBus.emit('yetiSpotted', {
      yetiClass: yetiClass,
      yetiName: yetiData.name,
      timestamp: Date.now()
    });
    
    // Also emit yetiSpawned event for Concord panel
    window.eventBus.emit('yetiSpawned', {
      yeti: {
        name: yetiData.name,
        class: yetiClass,
        power: yetiData.power || 1000
      },
      timestamp: Date.now()
    });
  }
  
  // console.log(`[YETI SPAWN] Spawned ${yetiClass} yeti: ${yetiData.name} at (${x.toFixed(0)}, ${y.toFixed(0)})`);
  
  // Auto-despawn after 30 seconds if not clicked
  setTimeout(() => {
    if (currentSpawnedYeti === yetiElement) {
      // console.log(`[YETI SPAWN] Yeti ${yetiClass} despawned (timeout)`);
      despawnYeti();
    }
  }, 30000);
}

/**
 * Removes the currently spawned yeti from the screen
 */
function despawnYeti() {
  if (currentSpawnedYeti) {
    // Unregister from spawn zone manager if available
    if (window.spawnZoneManager) {
      window.spawnZoneManager.unregisterSpawn('spawned-yeti');
    }
    
    currentSpawnedYeti.remove();
    currentSpawnedYeti = null;
    
    // Emit yeti despawned event
    if (window.eventBus) {
      window.eventBus.emit('yetiDespawned', {
        timestamp: Date.now()
      });
    }
  }
}

/**
 * Checks if it's time to spawn a yeti and handles spawning logic
 * @param {GameStateFlat} game - The current game state object
 */
export function checkYetiSpawn(game) {
  // Check if yeti spawns are active (controlled by Concord upgrade)
  if (!game.yetiSpawnsActive) {
    // Yeti spawns are disabled - set a very long spawn time (effectively never spawn)
    if (nextYetiSpawnTime === 0) {
      nextYetiSpawnTime = game.getGameTimeSeconds() + 32000000; // ~1 year
    }
    return;
  }
  
  const currentTime = game.getGameTimeSeconds();
  
  // Initialize next spawn time if not set
  if (nextYetiSpawnTime === 0) {
    nextYetiSpawnTime = currentTime + generateRandomSpawnTime(YETI.meanAppearanceTime);
    // console.log(`[YETI SPAWN] Next yeti spawn scheduled at ${nextYetiSpawnTime.toFixed(0)}s (in ${(nextYetiSpawnTime - currentTime).toFixed(0)}s)`);
  }
  
  // Check if it's time to spawn
  if (currentTime >= nextYetiSpawnTime) {
    const yetiClass = determineYetiClass();
    
    // console.log(`[YETI SPAWN] Spawning yeti of class: ${yetiClass}`);
    spawnYetiOnScreen(yetiClass, game);
    
    // Schedule next spawn
    nextYetiSpawnTime = currentTime + generateRandomSpawnTime(YETI.meanAppearanceTime);
    // console.log(`[YETI SPAWN] Next yeti spawn scheduled at ${nextYetiSpawnTime.toFixed(0)}s (in ${(nextYetiSpawnTime - currentTime).toFixed(0)}s)`);
  }
}

// formatPassiveBonus function removed - passive bonuses are no longer used

/**
 * Updates the yeti countdown timer display
 * @param {GameStateFlat} game - The current game state object
 */
export function updateYetiCountdown(game) {
  const countdownElement = document.getElementById('yeti-countdown');
  if (countdownElement && game.currentYetiBuff) {
    const remainingTime = getYetiBuffRemainingTime(game);
    countdownElement.textContent = `${remainingTime}s`;
    
    // Add visual warning when time is running low
    if (remainingTime <= 10) {
      countdownElement.style.color = '#dc3545';
      countdownElement.style.fontWeight = 'bold';
    } else if (remainingTime <= 30) {
      countdownElement.style.color = '#ffc107';
      countdownElement.style.fontWeight = 'bold';
    } else {
      countdownElement.style.color = '';
      countdownElement.style.fontWeight = '';
    }
  }
}

/**
 * Sets up the yeti system
 * @param {GameStateFlat} game - The current game state object
 */
export function setupYetis(game) {
  // console.log('[YETI] Setting up yeti system');
  
  // Access global timerManager
  const timerManager = window.timerManager;
  if (!timerManager) {
    console.warn('[YETI] TimerManager not available, falling back to setInterval');
    setupYetisLegacy(game);
    return;
  }
  
  // Add yeti buff expiration check to the game loop using TimerManager
  yetiTimerIds.buffExpirationTimer = timerManager.setInterval(() => {
    checkYetiBuffExpiration(game);
  }, 1000, 'yeti-buff-expiration'); // Check every second
  
  // Add countdown timer update using TimerManager
  yetiTimerIds.countdownTimer = timerManager.setInterval(() => {
    updateYetiCountdown(game);
  }, 1000, 'yeti-countdown'); // Update countdown every second
  
  // Add yeti spawning check to the game loop using TimerManager
  yetiTimerIds.spawnCheckTimer = timerManager.setInterval(() => {
    checkYetiSpawn(game);
  }, 5000, 'yeti-spawn-check'); // Check every 5 seconds
  
  // Initial UI update
  updateYetiUI(game);
  
  // Make functions available globally for UI buttons
  window.activateYetiBuffFromUI = function(yetiClass) {
    activateYetiBuff(game, yetiClass);
  };
  
  window.updateYetiUI = updateYetiUI;
  window.updateYetiCountdown = updateYetiCountdown;
  window.getYetiBuffRemainingTime = getYetiBuffRemainingTime;
  window.getYetiBuffClass = getYetiBuffClass;
  window.getCurrentYetiPassiveBonus = getCurrentYetiPassiveBonus;
  window.getCurrentYetiBaseEffect = getCurrentYetiBaseEffect;
  window.checkYetiSpawn = checkYetiSpawn;
  window.despawnYeti = despawnYeti;
  window.resetYetiSpawning = resetYetiSpawning;
  window.reapplyYetiEffectAmounts = reapplyYetiEffectAmounts;
  
  // console.log('[YETI] Yeti system setup complete with TimerManager');
}

/**
 * Legacy fallback for yeti system setup
 * @param {GameStateFlat} game - The current game state object
 */
function setupYetisLegacy(game) {
  // Add yeti buff expiration check to the game loop
  setInterval(() => {
    checkYetiBuffExpiration(game);
  }, 1000); // Check every second
  
  // Add countdown timer update
  setInterval(() => {
    updateYetiCountdown(game);
  }, 1000); // Update countdown every second
  
  // Add yeti spawning check to the game loop
  setInterval(() => {
    checkYetiSpawn(game);
  }, 5000); // Check every 5 seconds
  
  // Initial UI update
  updateYetiUI(game);
  
  // Make functions available globally for UI buttons
  window.activateYetiBuffFromUI = function(yetiClass) {
    activateYetiBuff(game, yetiClass);
  };
  
  window.updateYetiUI = updateYetiUI;
  window.updateYetiCountdown = updateYetiCountdown;
  window.getYetiBuffRemainingTime = getYetiBuffRemainingTime;
  window.getYetiBuffClass = getYetiBuffClass;
  window.getCurrentYetiPassiveBonus = getCurrentYetiPassiveBonus;
  window.getCurrentYetiBaseEffect = getCurrentYetiBaseEffect;
  window.checkYetiSpawn = checkYetiSpawn;
  window.despawnYeti = despawnYeti;
  window.resetYetiSpawning = resetYetiSpawning;
  window.reapplyYetiEffectAmounts = reapplyYetiEffectAmounts;
  
  // console.log('[YETI] Yeti system setup complete with legacy setInterval');
}

/**
 * Cleanup yeti system timers
 */
export function cleanupYetiTimers() {
  const timerManager = window.timerManager;
  if (!timerManager) return 0;
  
  // console.log('[YETI] Cleaning up timers...');
  let cleanedCount = 0;
  
  Object.entries(yetiTimerIds).forEach(([name, timerId]) => {
    if (timerId && timerManager.clearTimer(timerId)) {
      cleanedCount++;
      yetiTimerIds[name] = null;
    }
  });
  
  // console.log(`[YETI] Cleaned up ${cleanedCount} timers`);
  return cleanedCount;
}

// Make functions available globally for other systems
window.activateYetiBuff = activateYetiBuff;
window.checkYetiBuffExpiration = checkYetiBuffExpiration;
window.getYetiBuffRemainingTime = getYetiBuffRemainingTime;
window.getYetiBuffClass = getYetiBuffClass;
window.getCurrentYetiPassiveBonus = getCurrentYetiPassiveBonus;
window.getCurrentYetiBaseEffect = getCurrentYetiBaseEffect;
window.updateYetiUI = updateYetiUI;
window.setupYetis = setupYetis;
window.cleanupYetiTimers = cleanupYetiTimers;

/**
 * Test function to manually trigger yeti spawning for debugging
 * @param {GameStateFlat} game - The current game state object
 */
export function testYetiSpawning(game) {
  // console.log('[YETI TEST] Manual yeti spawn test triggered');
  // console.log('[YETI TEST] Current game time:', game.getGameTimeSeconds());
  // console.log('[YETI TEST] Mean appearance time:', YETI.meanAppearanceTime);
  // console.log('[YETI TEST] Class appearance probability:', YETI.classAppearanceProbability);
  // console.log('[YETI TEST] Available yeti classes:', [...new Set(YETI.yetis.map(yeti => yeti.class))]);
  
  // Force a yeti spawn
  const yetiClass = determineYetiClass();
  if (yetiClass) {
    // console.log('[YETI TEST] Force spawning yeti class:', yetiClass);
    spawnYetiOnScreen(yetiClass, game);
  } else {
    // console.log('[YETI TEST] No yeti would spawn (probability check)');
  }
}

// Make test function globally available
window.testYetiSpawning = testYetiSpawning;

/**
 * Test function to activate a specific yeti buff
 * @param {GameStateFlat} game - The current game state object
 * @param {string} yetiClass - The class of yeti to activate (optional, defaults to 'Harvester')
 */
export function testYetiBuff(game, yetiClass = 'Harvester') {
  if (!game) {
    // console.log('[YETI TEST] No game object found');
    return;
  }
  
  // console.log(`[YETI TEST] Activating ${yetiClass} buff for testing`);
  const success = activateYetiBuff(game, yetiClass);
  
  if (success) {
    // console.log('[YETI TEST] Buff activated successfully - check console for base effect results!');
    
    // Show the current game state after the effect
    setTimeout(() => {
      // console.log('[YETI TEST] Current game state after effect:');
      // console.log(`  Snowballs: ${Number(game.snowballs).toExponential(2)}`);
      // console.log(`  Icicles: ${game.icicles || 0}`);
      // console.log(`  Snowflakes: ${game.snowflakes || 0}`);
      // console.log(`  Assistant count: ${Object.values(game.assistants || {}).reduce((sum, count) => sum + count, 0)}`);
    }, 100);
  } else {
    // console.log('[YETI TEST] Failed to activate buff');
  }
}

// Make test function globally available
window.testYetiBuff = testYetiBuff;

/**
 * Test all yeti base effects in sequence
 * @param {GameStateFlat} game - The current game state object
 */
export function testAllYetiEffects(game) {
  if (!game) {
    // console.log('[YETI TEST] No game object found');
    return;
  }
  
  // console.log('[YETI TEST] Testing all yeti base effects...');
  
  const yetiClasses = ['Harvester', 'Defender', 'Traveler', 'Scholar'];
  
  yetiClasses.forEach((yetiClass, index) => {
    // console.log(`\n[YETI TEST] ===== Testing ${yetiClass} (${index + 1}/4) =====`);
    
    // Store initial state
    const initialState = {
      snowballs: game.snowballs,
      icicles: game.icicles || 0,
      snowflakes: game.snowflakes || 0,
      assistants: { ...game.assistants }
    };
    
    // Activate the buff
    const success = activateYetiBuff(game, yetiClass);
    
    if (success) {
      // Show the changes
      setTimeout(() => {
        const changes = {
          snowballs: game.snowballs - initialState.snowballs,
          icicles: (game.icicles || 0) - initialState.icicles,
          snowflakes: (game.snowflakes || 0) - initialState.snowflakes,
          assistants: {}
        };
        
        // Calculate assistant changes
        for (const [type, count] of Object.entries(game.assistants)) {
          const initialCount = initialState.assistants[type] || 0;
          if (count !== initialCount) {
            changes.assistants[type] = count - initialCount;
          }
        }
        
        // console.log(`[YETI TEST] Changes from ${yetiClass}:`, changes);
      }, 100);
    }
    
    // console.log(`[YETI TEST] Moving to next class...\n`);
  });
  
  // console.log('\n[YETI TEST] All yeti effect tests completed!');
}

// Make test function globally available
window.testAllYetiEffects = testAllYetiEffects;

/**
 * Reapply stored yeti effect amounts (used for stacking)
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} originalAmounts - The original amounts to reapply
 */
function reapplyYetiEffectAmounts(game, originalAmounts) {
  // console.log(`[YETI STACKING] ========== REAPPLYING YETI EFFECTS ==========`);
  // console.log(`[YETI STACKING] Current classX2Buff: ${game.classX2Buff || 1}`);
  // console.log(`[YETI STACKING] Original amounts:`, originalAmounts);
  
  if (!originalAmounts) {
    // console.log(`[YETI STACKING] No original amounts to reapply`);
    return;
  }
  
  // Calculate the multiplier effect
  const multiplier = game.classX2Buff || 1;
  // console.log(`[YETI STACKING] Applying ${multiplier}x multiplier to original amounts`);
  
  // Apply the stored amounts with multiplier
  if (originalAmounts.snowballs) {
    const beforeSnowballs = game.snowballs;
    const amountToAdd = originalAmounts.snowballs * multiplier;
    game.snowballs = Number(game.snowballs) + amountToAdd;
    // console.log(`[YETI STACKING] Snowballs: ${beforeSnowballs.toExponential(2)} → ${game.snowballs.toExponential(2)} (+${amountToAdd.toExponential(2)})`);
    // console.log(`[YETI STACKING] Original: ${originalAmounts.snowballs.toExponential(2)}, Multiplier: ${multiplier}x, Final: ${amountToAdd.toExponential(2)}`);
  }
  
  if (originalAmounts.assistants) {
    // console.log(`[YETI STACKING] Applying assistant multiplier: ${multiplier}x`);
    for (const [assistantType, originalAmount] of Object.entries(originalAmounts.assistants)) {
      if (!game.assistants[assistantType]) {
        game.assistants[assistantType] = 0;
      }
      const beforeAssistants = game.assistants[assistantType];
      const amountToAdd = originalAmount * multiplier;
      game.assistants[assistantType] += amountToAdd;
      // console.log(`[YETI STACKING] ${assistantType}: ${beforeAssistants} → ${game.assistants[assistantType]} (+${amountToAdd})`);
      // console.log(`[YETI STACKING] Original: ${originalAmount}, Multiplier: ${multiplier}x, Final: ${amountToAdd}`);
    }
  }
  
  if (originalAmounts.icicles) {
    const beforeIcicles = game.icicles || 0;
    const amountToAdd = originalAmounts.icicles * multiplier;
    if (!game.icicles) game.icicles = 0;
    game.icicles += amountToAdd;
    // console.log(`[YETI STACKING] Icicles: ${beforeIcicles} → ${game.icicles} (+${amountToAdd})`);
    // console.log(`[YETI STACKING] Original: ${originalAmounts.icicles}, Multiplier: ${multiplier}x, Final: ${amountToAdd}`);
  }
  
  if (originalAmounts.snowflakes) {
    const beforeSnowflakes = game.snowflakes || 0;
    const amountToAdd = originalAmounts.snowflakes * multiplier;
    if (!game.snowflakes) game.snowflakes = 0;
    game.snowflakes += amountToAdd;
    // console.log(`[YETI STACKING] Snowflakes: ${beforeSnowflakes} → ${game.snowflakes} (+${amountToAdd})`);
    // console.log(`[YETI STACKING] Original: ${originalAmounts.snowflakes}, Multiplier: ${multiplier}x, Final: ${amountToAdd}`);
  }
  
  // console.log(`[YETI STACKING] ========== REAPPLICATION COMPLETE ==========`);
  
  // Update display after reapplying effects
  game.updateDisplay();
}
