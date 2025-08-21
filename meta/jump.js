/**
 * systems/jump.js - Jump system for progression between analogs
 * 
 * This module handles the jump system, which allows players to progress to new "analogs"
 * (dimensions/iterations) while preserving certain upgrades and converting assets to snowflakes.
 * 
 * The jump process:
 * 1. Trigger jump - takes peak snapshot and converts snowballs to snowflakes
 * 2. Snowflake shop - allows spending snowflakes on persistent upgrades
 * 3. Confirm jump - resets game state and applies upgrades
 * 4. Reinitialize - sets up all systems for the new analog
 * 
 * Note: Meltdown process has been removed to simplify the flow since yeti system uses pre-meltdown values
 */

// -------------------------------
// jump.js
// -------------------------------

import { resetGameForJump } from './jumpUtils.js';
// import { initiateMeltdown } from './meltdown.js'; // No longer used - meltdown removed from flow
import { applySnowflakeUpgrades, SNOWFLAKE_TREE, purchaseSnowflakeUpgrade } from './snowflakeTree.js';
import { trackAnalog } from './analogTracker.js';
import { STARTING_SNOWBALLS } from '../core/config.js';
import { ASSISTANTS } from '../loops/passive/data/assistantData.js';
import { UNIFIED_UPGRADES } from '../loops/passive/data/unifiedUpgradeData.js';

/**
 * Shows the jump button - now always active regardless of snowball count
 * @param {GameStateFlat} game - The current game state object
 */
export function maybeShowJumpButton(game) {
  const jumpButton = document.getElementById('jump-button');
  
  if (jumpButton) {
    // Always show the button and keep it enabled
    jumpButton.style.display = 'block';
    jumpButton.disabled = false;
    jumpButton.classList.remove('disabled');
  }
}

/**
 * Initiates the jump process by taking peak snapshot and converting snowballs to snowflakes
 * @param {GameStateFlat} game - The current game state object
 */
export async function triggerJump(game) {
  // Emit jump initiated event
  if (window.eventBus) {
    window.eventBus.emit('jumpInitiated', {
      analogNumber: game.analogNumber,
      currentAnalogSnowballs: game.currentAnalogSnowballs,
      lifetimeSnowballs: game.lifetimeSnowballs
    });
  }
  
  // Step 1: Take peak snapshot for yeti system (pre-meltdown values)
  // REMOVED: trackAnalog(game); - This was causing duplication with endCurrentAnalog()
  
  // Step 2: Calculate snowflake cost and convert snowballs
  // Set the snowflake cost for this analog (consistent rate across all analogs)
  const { SNOWFLAKE_CONFIG } = await import('./snowflakeTree.js');
  const snowflakeCost = SNOWFLAKE_CONFIG.baseCost * SNOWFLAKE_CONFIG.costRate ** ((game.analogNumber || 1) - 1);
  game.snowflakeCost = snowflakeCost;
  
  // Use currentAnalogSnowballs (this analog only) instead of lifetimeSnowballs (all analogs)
  const snowballsToConvert = game.currentAnalogSnowballs || 0;
  const snowflakesEarned = Math.floor(snowballsToConvert / snowflakeCost);
  
  // Convert snowballs to snowflakes
  game.snowballs = 0;
  game.snowflakes = (game.snowflakes || 0) + snowflakesEarned;
  
  // console.log(`[JUMP] Converted ${snowballsToConvert.toLocaleString()} snowballs to ${snowflakesEarned} snowflakes (rate: ${snowflakeCost.toLocaleString()}:1)`);
  
  // Emit conversion completed event
  if (window.eventBus) {
    window.eventBus.emit('jumpConversionCompleted', {
      snowballsConverted: snowballsToConvert,
      snowflakesEarned: snowflakesEarned,
      conversionRate: snowflakeCost
    });
  }
  
  // Step 3: Proceed to snowflake shop (handled by UI)
  // The UI will call showSnowflakeShopInOverlay() directly
}

/**
 * Completes the jump process by resetting the game and applying upgrades
 * @param {GameStateFlat} game - The current game state object
 */
export function confirmJump(game) {
  // Start the jump process
  // console.log(`[JUMP DEBUG] === JUMP STARTED ===`);
  
  // Store current values for debugging
  const beforeReset = {
    globalSpsMultiplier: game.globalSpsMultiplier || 1,
    assistantMultipliers: game.assistantMultipliers || {},
    clickMultiplier: game.clickMultiplier || 1,
    persistentUpgrades: game.persistentUpgrades || []
  };
  
  // console.log(`[JUMP DEBUG] Before reset - globalSpsMultiplier: ${beforeReset.globalSpsMultiplier}`);
  // console.log(`[JUMP DEBUG] Before reset - assistantMultipliers:`, beforeReset.assistantMultipliers);
  // console.log(`[JUMP DEBUG] Before reset - clickMultiplier: ${beforeReset.clickMultiplier}`);
  // console.log(`[JUMP DEBUG] Before reset - persistentUpgrades:`, beforeReset.persistentUpgrades);
  
  // Emit analog ending event
  if (window.eventBus) {
    window.eventBus.emit('analogEnding', {
      analogNumber: game.analogNumber,
      currentAnalogSnowballs: game.currentAnalogSnowballs,
      lifetimeSnowballs: game.lifetimeSnowballs,
      assistants: { ...game.assistants },
      boosts: { ...game.boosts },
      globalUpgrades: { ...game.globalUpgrades }
    });
  }
  
  // Step 1: End current analog and save its data
  // NOTE: endCurrentAnalog() captures the following data for the Analog Summary:
  // - lifetimeSnowballs: Snowballs generated during this analog only (not cumulative across all analogs)
  // - snowballs: Current snowball wallet value (pre-conversion, shows net after purchases)
  // - icicles: Current icicle wallet value (persistent currency, shows net after purchases/usage)
  // - snowflakes: Current snowflake wallet value (persistent currency, shows net after purchases/usage)
  // - finalSPS: SPS without crystal snowball multiplier (peak performance)
  // - assistants: Final assistant counts for this analog
  game.endCurrentAnalog();
  
  // Emit analog ended event
  if (window.eventBus) {
    window.eventBus.emit('analogEnded', {
      analogNumber: game.analogNumber - 1, // Previous analog number
      nextAnalogNumber: game.analogNumber
    });
  }
  
  // Step 2: Reset game and apply snowflake upgrades
  resetGameForJump(game);
  
  // console.log(`[JUMP DEBUG] After reset - globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
  // console.log(`[JUMP DEBUG] After reset - assistantMultipliers:`, game.assistantMultipliers || {});
  // console.log(`[JUMP DEBUG] After reset - clickMultiplier: ${game.clickMultiplier || 1}`);
  
  // Set starting snowballs after reset
  game.snowballs = STARTING_SNOWBALLS;
  game.currentAnalogSnowballs = STARTING_SNOWBALLS;
  
  applySnowflakeUpgrades(game);

  // Apply analog start logic for new snowflake effects
  applyAnalogStartLogic(game);

  // console.log(`[JUMP DEBUG] After applySnowflakeUpgrades - globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
  // console.log(`[JUMP DEBUG] After applySnowflakeUpgrades - assistantMultipliers:`, game.assistantMultipliers || {});
  // console.log(`[JUMP DEBUG] After applySnowflakeUpgrades - clickMultiplier: ${game.clickMultiplier || 1}`);
  // console.log(`[JUMP DEBUG] After applySnowflakeUpgrades - startingSnowballs: ${game.startingSnowballs || 0}`);
  // console.log(`[JUMP DEBUG] After applySnowflakeUpgrades - startingAssistants:`, game.startingAssistants || {});
  // console.log(`[JUMP DEBUG] After applySnowflakeUpgrades - startingBabyYeti:`, game.startingBabyYeti || []);

  // Emit analog starting event
  if (window.eventBus) {
    window.eventBus.emit('analogStarting', {
      analogNumber: game.analogNumber,
      startingSnowballs: game.snowballs,
      persistentUpgrades: game.persistentUpgrades || []
    });
  }

  // Step 3: Reinitialize game systems after reset
  if (window.setupAssistants) {
    window.setupAssistants(game);
  }
  if (window.setupBoosts) {
    window.setupBoosts(game);
  }
  if (window.setupGlobalUpgrades) {
    window.setupGlobalUpgrades(game);
  }
  if (window.setupIcicle) {
    window.setupIcicle(game);
  }
  if (window.setupYetis) {
    window.setupYetis(game);
  }
  if (window.resetYetiSpawning) {
    window.resetYetiSpawning();
  }
  
  // Reinitialize achievement and lore systems to restore event listeners
  if (window.initializeAchievements) {
    window.initializeAchievements(game);
  }
  if (window.initializeLore) {
    window.initializeLore(game);
  }
  
  // console.log(`[JUMP DEBUG] After system setup - globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
  // console.log(`[JUMP DEBUG] After system setup - assistantMultipliers:`, game.assistantMultipliers || {});
  // console.log(`[JUMP DEBUG] After system setup - clickMultiplier: ${game.clickMultiplier || 1}`);

  // Step 4: Refresh all UI components with new game state
  // NOTE: SPS calculation is deferred until player interaction (buying assistants, boosts, etc.)
  // This is intentional - the calculateSPSWithBoosts function may not be available during jump
  // and forcing SPS calculation here could cause timing issues. SPS will update naturally
  // when the player makes their first purchase or interaction in the new analog.
  if (window.calculateSPSWithBoosts) {
    window.calculateSPSWithBoosts(game);
  }
  
  // console.log(`[JUMP DEBUG] After SPS calculation - globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
  // console.log(`[JUMP DEBUG] After SPS calculation - assistantMultipliers:`, game.assistantMultipliers || {});
  // console.log(`[JUMP DEBUG] After SPS calculation - clickMultiplier: ${game.clickMultiplier || 1}`);
  // console.log(`[JUMP DEBUG] After SPS calculation - SPS: ${game.sps || 0}`);
  
  game.updateDisplay();
  
  if (window.updateAssistantsUI) {
    window.updateAssistantsUI(game);
  }
  
  if (window.updateBoostsUI) {
    window.updateBoostsUI(game);
  }
  
  if (window.updateInventoryDisplay) {
    window.updateInventoryDisplay(game);
  }
  
  if (window.startGlobalUpgradeChecker) {
    window.startGlobalUpgradeChecker(game);
  }
  
  // Record jump completion for achievements
  if (window.recordJumpCompletion) {
    window.recordJumpCompletion();
  }
  
  // Emit analog started event
  if (window.eventBus) {
    window.eventBus.emit('analogStarted', {
      analogNumber: game.analogNumber,
      currentSPS: game.sps,
      assistants: { ...game.assistants },
      boosts: { ...game.boosts },
      globalUpgrades: { ...game.globalUpgrades }
    });
  }
  
  // console.log(`[JUMP DEBUG] === JUMP COMPLETED ===`);
}

// Make functions available globally for onclick handlers
window.confirmJumpFromUI = function () {
  if (!window.game) {
    // console.error(`[JUMP DEBUG] Game object not found in window!`);
    return false;
  }
  confirmJump(window.game);
};

// Make triggerJump available globally
window.triggerJump = function(game) {
  triggerJump(game);
};

/**
 * Apply analog start logic for new snowflake effects
 * This function handles the application of startingSnowballs, startingAssistants, and startingBabyYeti effects
 * @param {GameStateFlat} game - The current game state object
 */
export function applyAnalogStartLogic(game) {
  // Apply analog start logic
  // console.log(`[ANALOG_START] === APPLYING ANALOG START LOGIC ===`);
  
  // Apply starting snowballs
  const oldSnowballs = game.snowballs;
  game.snowballs += game.startingSnowballs;
  // console.log(`[ANALOG_START] Starting snowballs: ${oldSnowballs.toLocaleString()} -> ${game.snowballs.toLocaleString()} (added ${game.startingSnowballs.toLocaleString()})`);
  
  // Apply starting assistants
  if (game.startingAssistants && Object.keys(game.startingAssistants).length > 0) {
    // console.log(`[ANALOG_START] Applying starting assistants:`, game.startingAssistants);
    
    // Get current analog number
    const currentAnalogNumber = game.analogNumber;
    // console.log(`[ANALOG_START] Current analog number: ${currentAnalogNumber}`);
    
    // Get available analogs
    const availableAnalogs = game.analogs;
    // console.log(`[ANALOG_START] Available analogs:`, availableAnalogs);
    
    Object.entries(game.startingAssistants).forEach(([assistantId, percentage]) => {
      // Get the previous analog's assistant count from analog tracking
      // Note: analogNumber has already been incremented, so we look at the previous analog
      const previousAnalogIndex = game.analogNumber - 2; // -2 because analogNumber is already incremented
      const previousAnalogData = game.analogs && game.analogs[previousAnalogIndex];
      
      // console.log(`[ANALOG_START] Looking for ${assistantId} in previous analog ${previousAnalogIndex}:`, previousAnalogData);
      
      const previousCount = previousAnalogData && previousAnalogData.assistants && previousAnalogData.assistants[assistantId] || 0;
      
      // Calculate how many assistants to start with
      const startingCount = Math.round(previousCount * percentage);
      
      // console.log(`[ANALOG_START] ${assistantId}: previous analog index ${previousAnalogIndex}, previous count ${previousCount}, percentage ${(percentage * 100).toFixed(1)}%, starting count ${startingCount}`);
      
      if (startingCount > 0) {
        // Set assistants using the flat architecture (replace, don't add)
        game._assistants.set(assistantId, startingCount);
        
        // console.log(`[ANALOG_START] ${assistantId}: 0 -> ${startingCount} (${(percentage * 100).toFixed(1)}% of previous analog's ${previousCount})`);
      } else {
        // console.log(`[ANALOG_START] ${assistantId}: No assistants to add (previous count: ${previousCount}, percentage: ${(percentage * 100).toFixed(1)}%)`);
      }
    });
  }
  
  // Apply starting baby yeti upgrades
  if (game.startingBabyYeti && Object.keys(game.startingBabyYeti).length > 0) {
    // console.log(`[ANALOG_START] Applying starting baby yeti upgrades:`, game.startingBabyYeti);
    
    game.startingBabyYeti.forEach(yetiJrId => {
      // Find the corresponding unified upgrade
      const yetiJrUpgrade = UNIFIED_UPGRADES.find(upgrade => upgrade.id === yetiJrId);
      
      if (yetiJrUpgrade) {
        // Add the upgrade to the unified upgrade system
        if (!game.unifiedUpgrades) {
          game.unifiedUpgrades = {};
        }
        game.unifiedUpgrades[yetiJrId] = true;
        
        // Apply the upgrade's effect immediately
        if (yetiJrUpgrade.effect && yetiJrUpgrade.effect.type === 'spsMultiplier') {
          const currentMultiplier = game.globalSpsMultiplier;
          game.globalSpsMultiplier += yetiJrUpgrade.effect.value;
          // console.log(`[ANALOG_START] ${yetiJrId}: globalSpsMultiplier ${currentMultiplier} -> ${game.globalSpsMultiplier} (added ${yetiJrUpgrade.effect.value})`);
          
          // console.log(`[ANALOG_START] Applied ${yetiJrId} upgrade to unified system`);
        } else {
          // console.warn(`[ANALOG_START] YetiJr upgrade not found: ${yetiJrId}`);
        }
      } else {
        console.warn(`[ANALOG_START] YetiJr upgrade not found: ${yetiJrId}`);
      }
    });
  }
  
  // console.log(`[ANALOG_START] === ANALOG START LOGIC COMPLETED ===`);
  
  // Clear starting snowballs after they've been applied
  if (game.startingSnowballs > 0) {
    // console.log(`[ANALOG_START] Clearing starting snowballs: ${game.startingSnowballs.toLocaleString()}`);
    game.startingSnowballs = 0;
  }
  
  // Clear starting assistants after they've been applied
  if (game.startingAssistants && Object.keys(game.startingAssistants).length > 0) {
    // console.log(`[ANALOG_START] Clearing starting assistants:`, game.startingAssistants);
    game.startingAssistants = {};
  }
}
