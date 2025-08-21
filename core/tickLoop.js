/**
 * core/tickLoop.js - Main game loop and passive income system
 * 
 * This module handles the core game loop that runs at regular intervals to:
 * - Calculate and apply passive snowball generation
 * - Update the game display
 * - Maintain consistent game timing
 * 
 * The tick loop is the heartbeat of the game, ensuring passive income
 * flows continuously even when the player isn't actively clicking.
 */

import { TICK_INTERVAL_MS, TIME_RATE } from './config.js';
import { processStreakSystemUpdates } from '../loops/active/clickStreak.js';
import { isSPSDirty } from '../loops/passive/unifiedUpgrades.js';

// Main game loop timer ID for cleanup
let mainTickLoopId = null;

/**
 * Start the main game loop that runs at regular intervals
 * 
 * @param {GameStateFlat} game - The main game state object
 * @param {Function} calculateSPS - Function to recalculate snowballs per second (should be calculateSPSWithBoosts)
 * 
 * The tick loop performs these operations every TICK_INTERVAL_MS milliseconds:
 * 1. Recalculates total SPS and per-assistant SPS
 * 2. Adds passive snowballs from all assistants (with time acceleration)
 * 3. Updates the main game display
 */
export function startTickLoop(game, calculateSPS) {
  const timerManager = window.timerManager;
  
  if (timerManager) {
    mainTickLoopId = timerManager.setInterval(() => {
    // 1. Recalculate total SPS and per-assistant SPS only if dirty - Phase 3
    // This ensures multipliers and boosts are properly applied
    if (isSPSDirty()) {
      calculateSPS(game);
    }

    // 1.5. Update SPS history for acceleration calculation
    // Track SPS over time to calculate acceleration
    game.updateSpsHistory();

    // 2. Add passive snowballs (spread across time with acceleration)
    // Each assistant contributes their SPS * (tick interval / 1000) * timeRate snowballs
    // BUT ONLY if meltdown is not active
    
    // FUTURE IMPLEMENTATION: Replace TIME_RATE with game.timeRate for purchasable upgrades
    // const timeMultiplier = game.timeRate || TIME_RATE;
    const timeMultiplier = TIME_RATE;
    
    // Stop passive generation during meltdown
    if (!game.meltdownActive) {
      for (const assistantId of Object.keys(game._spsByAssistant || {})) {
        const sps = game._spsByAssistant[assistantId];
        game.addSnowballs(sps * (TICK_INTERVAL_MS / 1000) * timeMultiplier, 'assistant', assistantId);
      }
    }

    // 3. Update display (snowballs, lifetime, sps)
    // Shows current values to the player
    game.updateDisplay();

    // 4. Process click streak system updates
    // Handle bonus expiration and UI updates
    processStreakSystemUpdates(game);

    // 5. Update crystal snowball system
    if (game.crystalSnowballManager) {
      game.crystalSnowballManager.update();
    }

    // ⚠️ Do NOT call updateBoostsUI() here anymore
    // UI updates are handled separately to avoid performance issues
  }, TICK_INTERVAL_MS, 'main-tick-loop');
    // console.log('[TICK_LOOP] Started main game loop with TimerManager');
  } else {
    // Fallback to legacy setInterval
    mainTickLoopId = setInterval(() => {
      // 1. Recalculate total SPS and per-assistant SPS only if dirty - Phase 3
      // This ensures multipliers and boosts are properly applied
      if (isSPSDirty()) {
        calculateSPS(game);
      }

      // 1.5. Update SPS history for acceleration calculation
      // Track SPS over time to calculate acceleration
      game.updateSpsHistory();

      // 2. Add passive snowballs (spread across time with acceleration)
      // Each assistant contributes their SPS * (tick interval / 1000) * timeRate snowballs
      // BUT ONLY if meltdown is not active
      
      // FUTURE IMPLEMENTATION: Replace TIME_RATE with game.timeRate for purchasable upgrades
      // const timeMultiplier = game.timeRate || TIME_RATE;
      const timeMultiplier = TIME_RATE;
      
      // Stop passive generation during meltdown
      if (!game.meltdownActive) {
        for (const assistantId of Object.keys(game._spsByAssistant || {})) {
          const sps = game._spsByAssistant[assistantId];
          game.addSnowballs(sps * (TICK_INTERVAL_MS / 1000) * timeMultiplier, 'assistant', assistantId);
        }
      }

      // 3. Update display (snowballs, lifetime, sps)
      // Shows current values to the player
      game.updateDisplay();

      // 4. Process click streak system updates
      // Handle bonus expiration and UI updates
      processStreakSystemUpdates(game);

      // 5. Update crystal snowball system
      if (game.crystalSnowballManager) {
        game.crystalSnowballManager.update();
      }

      // ⚠️ Do NOT call updateBoostsUI() here anymore
      // UI updates are handled separately to avoid performance issues
    }, TICK_INTERVAL_MS);
    // console.log('[TICK_LOOP] Started main game loop with legacy setInterval');
  }
}

/**
 * Cleanup main tick loop timer
 */
export function cleanupTickLoop() {
  const timerManager = window.timerManager;
  
  if (mainTickLoopId && timerManager) {
    if (timerManager.clearTimer(mainTickLoopId)) {
      // console.log('[TICK_LOOP] Cleaned up main tick loop timer with TimerManager');
    }
    mainTickLoopId = null;
  } else if (mainTickLoopId) {
    // Fallback to legacy clearInterval
    clearInterval(mainTickLoopId);
    mainTickLoopId = null;
    // console.log('[TICK_LOOP] Cleaned up main tick loop timer with legacy clearInterval');
  }
}
