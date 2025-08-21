/**
 * systems/analogTracker.js - Analog progression tracking system
 * 
 * This module tracks the player's progression through different "analogs" (dimensions/iterations).
 * It maintains a history of each analog's performance and provides data for the jump system.
 * 
 * Key features:
 * - Tracks lifetime snowballs earned in each analog
 * - Maintains analog history for analysis
 * - Provides data for jump threshold calculations
 * - Updates analog snowball counts periodically
 */

// -------------------------------
// analogTracker.js
// -------------------------------

/**
 * Tracks the current analog's performance before a jump
 * Records comprehensive metrics for historical analysis
 * @param {GameStateFlat} game - The current game state object
 */
export function trackAnalog(game) {
  const currentAnalog = game.currentAnalog || 1;
  
  // Initialize analog history if it doesn't exist
  if (!game.analogHistory) {
    game.analogHistory = [];
  }
  
  // Calculate snowballs earned in this analog
  // This is the difference between current lifetime and previous analog's lifetime
  const previousLifetime = game.analogHistory.length > 0 
    ? game.analogHistory[game.analogHistory.length - 1].lifetimeSnowballs 
    : 0;
  
  const snowballsInThisAnalog = game.lifetimeSnowballs - previousLifetime;
  
  // Record comprehensive analog metrics
  const analogRecord = {
    analog: currentAnalog,
    timestamp: Date.now(),
    
    // Snowball metrics
    snowballWallet: game.snowballs || 0,
    analogSnowballs: snowballsInThisAnalog,
    lifetimeSnowballs: game.lifetimeSnowballs,
    sps: game.sps || 0,
    
    // Snowflake metrics
    preMeltdownSnowflakes: game.snowflakes || 0,
    
    // Icicle metrics
    iciclesHarvested: game.iciclesHarvested || 0,
    
    // Assistant metrics (for historical tracking) - use flat architecture format
    assistants: Object.fromEntries(game._assistants || new Map()),
    lifetimeFromAssistants: Object.fromEntries(game._lifetimeFromAssistants || new Map()),
    
    // Boost metrics - use flat architecture format
    boosts: Object.fromEntries(game._boosts || new Map()),
    
    // Global upgrade metrics - use flat architecture format
    globalUpgrades: Array.from(game._globalUpgrades || new Set())
  };
  
  game.analogHistory.push(analogRecord);
  
  // Emit analog tracked event
  if (window.eventBus) {
    window.eventBus.emit('analogTracked', {
      analogNumber: currentAnalog,
      analogRecord: analogRecord,
      totalAnalogs: game.analogHistory.length
    });
  }
  
  // console.log(`[ANALOG TRACKER] Tracked analog ${currentAnalog}:`, {
  //   snowballWallet: analogRecord.snowballWallet,
  //   analogSnowballs: analogRecord.analogSnowballs,
  //   lifetimeSnowballs: analogRecord.lifetimeSnowballs,
  //   sps: analogRecord.sps,
  //   preMeltdownSnowflakes: analogRecord.preMeltdownSnowflakes,
  //   iciclesHarvested: analogRecord.iciclesHarvested,
  //   totalAnalogs: game.analogHistory.length
  // });
}

/**
 * Updates the analog snowball count display
 * This function is called periodically to keep the UI updated
 * @param {GameStateFlat} game - The current game state object
 */
export function updateAnalogSnowballs(game) {
  // This function is no longer used for periodic updates
  // Analog tracking is now only done during jump
  // Keeping this function for any remaining legacy uses, but it's simplified
  
  const currentAnalog = game.analogNumber || 1;
  
  // Update the analog count display if needed
  const analogElement = document.getElementById('analog-count');
  if (analogElement) {
    analogElement.textContent = currentAnalog;
  }
  
  
}