/**
 * systems/icicle.js - Simple icicle harvesting system
 * 
 * This module handles the icicle mechanic - the simplest currency in the game.
 * 
 * Simple cycle:
 * 1. Icicle starts growing
 * 2. Icicle matures in matureTime
 * 3. Icicle auto-harvests and adds to wallet
 * 4. Restart at step 1
 */

export const ICICLE_CONFIG = {
  matureTime: 600,       // Time in seconds for icicle to mature
  harvestAmount: 1,     // Number of icicles harvested per cycle
  levelUpValue: 0.01    // 1% assistant level multiplier per level-up
};

/**
 * Initialize the icicle system
 * @param {GameStateFlat} game - The game state object
 */
export function setupIcicle(game) {
  // Initialize icicles as simple currency
  if (game.icicles === undefined) {
    game.icicles = 0;
  }

  // Initialize icicle growth state
  if (!game.icicleGrowth) {
    game.icicleGrowth = {
      startTime: 0,
      isGrowing: false
    };
  }

  // Start icicle growth immediately
  if (!game.icicleGrowth.isGrowing) {
    game.icicleGrowth.startTime = game.getGameTimeSeconds();
    game.icicleGrowth.isGrowing = true;

  }
  

}

/**
 * Update icicle growth and auto-harvest when mature
 * @param {GameStateFlat} game - The game state object
 */
export function updateIcicle(game) {
  if (!game.icicleGrowth || !game.icicleGrowth.isGrowing) {

    return;
  }

  const now = game.getGameTimeSeconds();
  const age = now - game.icicleGrowth.startTime;
  
  // Ensure UI is updated even on first call
  if (age === 0) {
    updateIcicleUI(game, 0);
  }

  // Check if icicle is mature
  if (age >= ICICLE_CONFIG.matureTime) {
    // Auto-harvest the icicle
    game.icicles = (game.icicles || 0) + ICICLE_CONFIG.harvestAmount;
    

    
    // Emit icicle harvested event
    if (window.eventBus) {
      window.eventBus.emit('icicleHarvested', {
        amount: ICICLE_CONFIG.harvestAmount,
        total: game.icicles
      });
    }
    
    // Update display
    if (game.updateDisplay) {
      game.updateDisplay();
    }
    
    // Start new growth cycle
    game.icicleGrowth.startTime = game.getGameTimeSeconds();
    
    // Update UI
    updateIcicleUI(game, 0);
  } else {
    // Update UI with growth progress
    updateIcicleUI(game, age);
    

  }
}

/**
 * Update the icicle UI display
 * @param {GameStateFlat} game - The game state object
 * @param {number} age - Current age of icicle in seconds
 */
function updateIcicleUI(game, age) {
  const percentToMature = (age / ICICLE_CONFIG.matureTime) * 100;
  const timeRemaining = Math.max(0, ICICLE_CONFIG.matureTime - age);

  // UI updates disabled - icicle system works fine without visual indicator
  // Progress element creation removed to avoid console spam
}

/**
 * Get current icicle count
 * @param {GameStateFlat} game - The game state object
 * @returns {number} Number of icicles in wallet
 */
export function getIcicleCount(game) {
  return game.icicles || 0;
}

/**
 * Add icicles to wallet (for external sources like Scholar yeti)
 * @param {GameStateFlat} game - The game state object
 * @param {number} amount - Amount to add
 * @param {string} source - Source of icicles
 */
export function addIcicles(game, amount, source = 'unknown') {
  if (amount <= 0) return;
  
  game.icicles = (game.icicles || 0) + amount;
  
  // Emit event
  if (window.eventBus) {
    window.eventBus.emit('iciclesAdded', {
      amount: amount,
      source: source,
      total: game.icicles
    });
  }
  
  // Update display
  if (game.updateDisplay) {
    game.updateDisplay();
  }
}

/**
 * Spend icicles from wallet (for assistant level-ups, etc.)
 * @param {GameStateFlat} game - The game state object
 * @param {number} amount - Amount to spend
 * @returns {boolean} True if successful, false if insufficient
 */
export function spendIcicles(game, amount) {
  if (amount <= 0) return true;
  if ((game.icicles || 0) < amount) return false;
  
  game.icicles -= amount;
  
  // Emit event
  if (window.eventBus) {
    window.eventBus.emit('iciclesSpent', {
      amount: amount,
      total: game.icicles
    });
  }
  
  // Update display
  if (game.updateDisplay) {
    game.updateDisplay();
  }
  
  return true;
}

/**
 * Test function to manually trigger icicle growth (for debugging)
 * @param {GameStateFlat} game - The game state object
 */
export function testIcicleGrowth(game) {
  // Force start icicle growth
  if (!game.icicleGrowth) {
    game.icicleGrowth = {
      startTime: 0,
      isGrowing: false
    };
  }
  
  game.icicleGrowth.startTime = game.getGameTimeSeconds();
  game.icicleGrowth.isGrowing = true;
}