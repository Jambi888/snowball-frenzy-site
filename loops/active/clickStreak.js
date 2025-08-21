/**
 * loops/active/clickStreak.js - Advanced Click Streak System
 * 
 * This module handles the click streak mechanics including:
 * - Tracking sustained clicking rates (TARGET_CLICK_RATE+ clicks per second)
 * - Managing streak tiers with escalating bonuses
 * - Applying temporary click multipliers
 * - Tracking streak statistics and achievements
 * - Player level multiplier system (10^playerLevel)
 * 
 * Streak Requirements:
 * - TARGET_CLICK_RATE clicks per second sustained for various durations
 * - Bonuses applied for duration equal to streak duration
 * - Progressive tiers with increasing multipliers
 * 
 * Player Level System:
 * - Player level (0-10) provides exponential click multiplier
 * - Level 0 = 1x, Level 1 = 10x, Level 2 = 100x, ..., Level 10 = 10^10x
 * - Player level progression will be based on achievements and lore (TODO)
 */

import { TIME_RATE } from '../../core/config.js';

// Configuration constants
const TARGET_CLICK_RATE = 5; // Required clicks per second to maintain streak (adjustable for testing)

/**
 * Get the current target click rate
 * @returns {number} The target click rate
 */
export function getTargetClickRate() {
  return TARGET_CLICK_RATE;
}

/**
 * Update click streak system with a new click
 * @param {GameStateFlat} game - The game state object
 * @param {number} timestamp - When the click occurred (real time)
 */
export function updateClickStreak(game, timestamp = Date.now()) {
  const streakSystem = game.loops.active.clicking.streakSystem;
  const gameTime = game.getGameTime();
  
  // Update last click time in game state (using game time for consistency)
  game.loops.active.clicking.lastClickTime = gameTime;
  
  // Add click to recent clicks for rate calculation
  streakSystem.recentClicks.push(gameTime);
  
  // Remove clicks older than 5 seconds
  const fiveSecondsAgo = gameTime - (5000 * TIME_RATE);
  streakSystem.recentClicks = streakSystem.recentClicks.filter(clickTime => clickTime >= fiveSecondsAgo);
  
  // Calculate current click rate (clicks per second)
  if (streakSystem.recentClicks.length >= 2) {
    const timeSpan = (streakSystem.recentClicks[streakSystem.recentClicks.length - 1] - streakSystem.recentClicks[0]) / 1000;
    streakSystem.currentClickRate = timeSpan > 0 ? streakSystem.recentClicks.length / timeSpan : 0;
  } else {
    streakSystem.currentClickRate = streakSystem.recentClicks.length;
  }
  
  // Debug: Log click rate and streak status (remove this after testing)
  // console.log(`Click rate: ${streakSystem.currentClickRate.toFixed(2)}, Target: ${TARGET_CLICK_RATE}, Active: ${streakSystem.isActive}, Duration: ${streakSystem.duration.toFixed(2)}s`);
  
  // Track clicks in current second
  const currentSecond = Math.floor(gameTime / 1000);
  if (currentSecond !== streakSystem.lastSecondTimestamp) {
    // New second started
    if (streakSystem.clicksInCurrentSecond >= TARGET_CLICK_RATE) {
      // Previous second qualified, increment qualifying seconds
      streakSystem.qualifyingSeconds++;
    } else if (streakSystem.isActive) {
      // Failed to maintain rate, end streak
      endStreak(game);
    }
    
    streakSystem.lastSecondTimestamp = currentSecond;
    streakSystem.clicksInCurrentSecond = 1;
  } else {
    streakSystem.clicksInCurrentSecond++;
  }
  
  // Check if we should start a new streak
  if (!streakSystem.isActive && streakSystem.currentClickRate >= TARGET_CLICK_RATE) {
    startStreak(game, gameTime);
  }
  
  // Update streak duration if active
  if (streakSystem.isActive) {
    streakSystem.duration = (gameTime - streakSystem.startTime) / 1000;
    
    // Check for tier upgrades
    checkStreakTiers(game);
  }
  
  // Update active bonus expiration
  updateActiveBonus(game, gameTime);
}

/**
 * Start a new click streak
 * @param {GameStateFlat} game - The game state object
 * @param {number} timestamp - When the streak started
 */
function startStreak(game, timestamp) {
  const streakSystem = game.loops.active.clicking.streakSystem;
  
  streakSystem.isActive = true;
  streakSystem.startTime = timestamp;
  streakSystem.duration = 0;
  streakSystem.qualifyingSeconds = 0;
  
  // Emit streak started event
  if (window.eventBus) {
    window.eventBus.emit('clickStreakStarted', {
      timestamp: timestamp,
      currentRate: streakSystem.currentClickRate
    });
  }
}

/**
 * End the current click streak
 * @param {GameStateFlat} game - The game state object
 */
function endStreak(game) {
  const streakSystem = game.loops.active.clicking.streakSystem;
  
  if (!streakSystem.isActive) return;
  
  const finalDuration = streakSystem.duration;
  
  // Update statistics
  if (finalDuration > streakSystem.stats.bestStreak) {
    streakSystem.stats.bestStreak = finalDuration;
  }
  streakSystem.stats.totalStreakTime += finalDuration;
  
  // Reset streak tracking
  streakSystem.isActive = false;
  streakSystem.duration = 0;
  streakSystem.qualifyingSeconds = 0;
  streakSystem.clicksInCurrentSecond = 0;
  streakSystem.lastSecondTimestamp = 0;
  
  // Clear click rate tracking
  streakSystem.recentClicks = [];
  streakSystem.currentClickRate = 0;
  
  // Reset UI to default state
  resetStreakUI();
  
  // Emit streak ended event
  if (window.eventBus) {
    window.eventBus.emit('clickStreakEnded', {
      duration: finalDuration,
      bestStreak: streakSystem.stats.bestStreak
    });
  }
}

/**
 * Reset the streak UI to default state
 */
function resetStreakUI() {
  // Reset click rate display
  const rateElement = document.getElementById('click-rate');
  if (rateElement) {
    rateElement.textContent = '0.0';
  }
  
  // Reset streak duration
  const durationElement = document.getElementById('streak-duration');
  if (durationElement) {
    durationElement.textContent = '0.0s';
  }
  
  // Reset bonus display
  const bonusElement = document.getElementById('streak-bonus');
  if (bonusElement) {
    bonusElement.textContent = '1.0x';
    bonusElement.style.color = '';
    bonusElement.style.fontWeight = '';
  }
  
  // Reset bonus time
  const bonusTimeElement = document.getElementById('bonus-time');
  if (bonusTimeElement) {
    bonusTimeElement.textContent = '0s';
  }
  
  // Reset next tier display
  const nextTierElement = document.getElementById('next-tier');
  if (nextTierElement) {
    nextTierElement.textContent = '2x at 1s';
  }
  
  // Reset progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = '0%';
    progressBar.style.background = '#9E9E9E';
  }
  
  // Reset streak display styling
  const streakDisplay = document.getElementById('streak-display');
  if (streakDisplay) {
    streakDisplay.style.border = '1px solid #ddd';
    streakDisplay.style.background = '#f9f9f9';
  }
}

/**
 * Check if the current streak qualifies for any tier bonuses
 * @param {GameStateFlat} game - The game state object
 */
function checkStreakTiers(game) {
  const streakSystem = game.loops.active.clicking.streakSystem;
  const currentDuration = streakSystem.duration;
  
  // Find the highest tier we qualify for
  let qualifyingTier = -1;
  for (let i = 0; i < streakSystem.tiers.length; i++) {
    if (currentDuration >= streakSystem.tiers[i].duration) {
      qualifyingTier = i;
    }
  }
  
  // If we found a qualifying tier and it's better than our current bonus
  if (qualifyingTier >= 0 && qualifyingTier > streakSystem.activeBonus.tier) {
    applyStreakBonus(game, qualifyingTier);
  }
}

/**
 * Apply a streak bonus from the specified tier
 * @param {GameStateFlat} game - The game state object
 * @param {number} tierIndex - Index of the tier to apply
 */
function applyStreakBonus(game, tierIndex) {
  const streakSystem = game.loops.active.clicking.streakSystem;
  const tier = streakSystem.tiers[tierIndex];
  const currentTime = game.getGameTime();
  
  // Apply the bonus
  streakSystem.activeBonus = {
    multiplier: tier.multiplier,
    startTime: currentTime,
    duration: tier.bonusDuration * 1000, // convert to milliseconds
    tier: tierIndex
  };
  
  // Update statistics
  streakSystem.stats.streaksAchieved[tierIndex]++;
  streakSystem.stats.totalBonusTime += tier.bonusDuration;
  
  // Trigger achievement for this streak tier
  if (window.eventBus) {
    window.eventBus.emit('streakTierAchieved', {
      tier: tierIndex + 1,
      multiplier: tier.multiplier,
      duration: tier.duration,
      streakDuration: streakSystem.duration
    });
  }
  
  // Emit bonus activated event
  if (window.eventBus) {
    window.eventBus.emit('streakBonusActivated', {
      tier: tierIndex,
      multiplier: tier.multiplier,
      duration: tier.bonusDuration,
      streakDuration: streakSystem.duration
    });
  }
}

/**
 * Update active bonus status and handle expiration
 * @param {GameStateFlat} game - The game state object
 * @param {number} currentTime - Current game time
 */
function updateActiveBonus(game, currentTime) {
  const streakSystem = game.loops.active.clicking.streakSystem;
  const bonus = streakSystem.activeBonus;
  
  // Check if bonus has expired
  if (bonus.multiplier > 1 && currentTime >= bonus.startTime + bonus.duration) {
    // Bonus expired
    streakSystem.activeBonus = {
      multiplier: 1,
      startTime: 0,
      duration: 0,
      tier: 0
    };
    
    // Emit bonus expired event
    if (window.eventBus) {
      window.eventBus.emit('streakBonusExpired', {
        previousMultiplier: bonus.multiplier,
        expiredAt: currentTime
      });
    }
  }
}

/**
 * Get the player level multiplier
 * @param {GameStateFlat} game - The game state object
 * @returns {number} The player level multiplier (10^playerLevel)
 */
export function getPlayerLevelMultiplier(game) {
  const playerLevel = game.playerLevel || 0;
  return Math.pow(10, playerLevel);
}

/**
 * Get the current effective click multiplier including all bonuses
 * @param {GameStateFlat} game - The game state object
 * @returns {number} The total click multiplier
 */
export function getEffectiveClickMultiplier(game) {
  // Base click multiplier from upgrades
  const baseMultiplier = game.clickMultiplier || 1;
  
  // Click streak multiplier
  const streakMultiplier = game.loops.active.clicking.streakSystem.activeBonus.multiplier;
  
  // Player level multiplier: 10^(playerLevel)
  // Level 0 = 1x, Level 1 = 10x, Level 2 = 100x, ..., Level 10 = 10^10x
  const playerLevelMultiplier = getPlayerLevelMultiplier(game);
  
  // Crystal snowball boost multiplier
  let crystalSnowballMultiplier = 1;
  if (game.crystalSnowballManager && typeof game.crystalSnowballManager.getCrystalSnowballMultiplier === 'function') {
    crystalSnowballMultiplier = game.crystalSnowballManager.getCrystalSnowballMultiplier();
  }
  
  // Calculate total multiplier
  const totalMultiplier = baseMultiplier * streakMultiplier * playerLevelMultiplier * crystalSnowballMultiplier;
  

  
  return totalMultiplier;
}

/**
 * Get current streak status for UI display
 * @param {GameStateFlat} game - The game state object
 * @returns {Object} Streak status information
 */
export function getStreakStatus(game) {
  const streakSystem = game.loops.active.clicking.streakSystem;
  const currentTime = game.getGameTime();
  
  // Calculate time remaining on active bonus
  let bonusTimeRemaining = 0;
  if (streakSystem.activeBonus.multiplier > 1) {
    bonusTimeRemaining = Math.max(0, 
      (streakSystem.activeBonus.startTime + streakSystem.activeBonus.duration - currentTime) / 1000
    );
  }
  
  // Determine next tier information
  let nextTier = null;
  for (let i = 0; i < streakSystem.tiers.length; i++) {
    if (streakSystem.duration < streakSystem.tiers[i].duration) {
      nextTier = {
        index: i,
        duration: streakSystem.tiers[i].duration,
        multiplier: streakSystem.tiers[i].multiplier,
        progress: streakSystem.isActive ? (streakSystem.duration / streakSystem.tiers[i].duration) : 0
      };
      break;
    }
  }
  
  return {
    isActive: streakSystem.isActive,
    duration: streakSystem.duration,
    currentRate: streakSystem.currentClickRate,
    activeBonus: {
      multiplier: streakSystem.activeBonus.multiplier,
      timeRemaining: bonusTimeRemaining,
      tier: streakSystem.activeBonus.tier
    },
    nextTier: nextTier,
    statistics: {
      bestStreak: streakSystem.stats.bestStreak,
      totalStreakTime: streakSystem.stats.totalStreakTime,
      streaksAchieved: [...streakSystem.stats.streaksAchieved],
      totalBonusTime: streakSystem.stats.totalBonusTime
    }
  };
}

/**
 * Reset streak system (for testing or analog resets)
 * @param {GameStateFlat} game - The game state object
 * @param {boolean} keepStats - Whether to preserve statistics
 */
export function resetStreakSystem(game, keepStats = false) {
  const streakSystem = game.loops.active.clicking.streakSystem;
  
  // Reset active streak
  streakSystem.isActive = false;
  streakSystem.startTime = 0;
  streakSystem.duration = 0;
  streakSystem.clicksInCurrentSecond = 0;
  streakSystem.lastSecondTimestamp = 0;
  streakSystem.qualifyingSeconds = 0;
  
  // Reset click tracking
  streakSystem.recentClicks = [];
  streakSystem.currentClickRate = 0;
  
  // Reset active bonus
  streakSystem.activeBonus = {
    multiplier: 1,
    startTime: 0,
    duration: 0,
    tier: 0
  };
  
  // Optionally reset statistics
  if (!keepStats) {
    streakSystem.stats = {
      bestStreak: 0,
      totalStreakTime: 0,
      streaksAchieved: [0, 0, 0, 0, 0, 0],
      totalBonusTime: 0
    };
  }
}

/**
 * Get streak tier information for UI display
 * @param {GameStateFlat} game - The game state object
 * @returns {Array} Array of tier information
 */
export function getStreakTiers(game) {
  const streakSystem = game.loops.active.clicking.streakSystem;
  
  return streakSystem.tiers.map((tier, index) => ({
    index: index,
    duration: tier.duration,
    multiplier: tier.multiplier,
    bonusDuration: tier.bonusDuration,
    achieved: streakSystem.stats.streaksAchieved[index] > 0,
    timesAchieved: streakSystem.stats.streaksAchieved[index]
  }));
}

/**
 * Process streak system updates (called from tick loop)
 * @param {GameStateFlat} game - The game state object
 */
export function processStreakSystemUpdates(game) {
  const currentTime = game.getGameTime();
  const streakSystem = game.loops.active.clicking.streakSystem;
  
  // Update active bonus expiration
  updateActiveBonus(game, currentTime);
  
  // Check if streak should end due to inactivity
  if (streakSystem.isActive) {
    const lastClickTime = game.loops.active.clicking.lastClickTime || 0;
    
    // Convert lastClickTime to game time if it's in real time
    const lastClickGameTime = lastClickTime > 1000000000000 ? 
      game.realTimeToGameTime(lastClickTime) : lastClickTime;
    
    const timeSinceLastClick = currentTime - lastClickGameTime;
    
    if (timeSinceLastClick > 2000) { // 2 seconds of inactivity
      endStreak(game);
    }
  }
  
  // Update UI
  updateStreakUI(game);
}

/**
 * Update the streak UI display
 * @param {GameStateFlat} game - The game state object
 */
export function updateStreakUI(game) {
  const status = getStreakStatus(game);
  const streakSystem = game.loops.active.clicking.streakSystem;
  
  // Update click rate
  const rateElement = document.getElementById('click-rate');
  if (rateElement) {
    rateElement.textContent = status.currentRate.toFixed(1);
  }
  
  // Update streak duration
  const durationElement = document.getElementById('streak-duration');
  if (durationElement) {
    durationElement.textContent = status.duration.toFixed(1) + 's';
  }
  
  // Update active bonus
  const bonusElement = document.getElementById('streak-bonus');
  if (bonusElement) {
    bonusElement.textContent = status.activeBonus.multiplier.toFixed(1) + 'x';
    
    // Color coding for bonus
    if (status.activeBonus.multiplier > 1) {
      bonusElement.style.color = '#4CAF50';
      bonusElement.style.fontWeight = 'bold';
    } else {
      bonusElement.style.color = '';
      bonusElement.style.fontWeight = '';
    }
  }
  
  // Update bonus time remaining
  const bonusTimeElement = document.getElementById('bonus-time');
  if (bonusTimeElement) {
    bonusTimeElement.textContent = Math.ceil(status.activeBonus.timeRemaining) + 's';
  }
  
  // Update next tier information
  const nextTierElement = document.getElementById('next-tier');
  if (nextTierElement) {
    if (status.nextTier) {
      nextTierElement.textContent = `${status.nextTier.multiplier}x at ${status.nextTier.duration}s`;
    } else if (status.isActive) {
      nextTierElement.textContent = 'Max tier reached!';
    } else {
      nextTierElement.textContent = `${streakSystem.tiers[0].multiplier}x at ${streakSystem.tiers[0].duration}s`;
    }
  }
  
  // Update progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    let progress = 0;
    
    if (status.nextTier) {
      progress = Math.min(100, status.nextTier.progress * 100);
    } else if (status.isActive) {
      // Max tier reached - show 100%
      progress = 100;
    } else {
      // No streak active - show 0% progress toward first tier
      progress = 0;
    }
    
    progressBar.style.width = progress + '%';
    
    // Color coding for progress
    if (progress >= 100) {
      progressBar.style.background = '#4CAF50';
    } else if (progress > 75) {
      progressBar.style.background = '#8BC34A';
    } else if (progress > 50) {
      progressBar.style.background = '#FF9800';
    } else if (progress > 25) {
      progressBar.style.background = '#2196F3';
    } else {
      progressBar.style.background = '#9E9E9E';
    }
  }
  
  // Update streak display visibility based on activity
  const streakDisplay = document.getElementById('streak-display');
  if (streakDisplay) {
    if (status.isActive || status.activeBonus.multiplier > 1) {
      streakDisplay.style.border = '2px solid #4CAF50';
      streakDisplay.style.background = '#f0fff0';
    } else if (status.currentRate > 3) {
      streakDisplay.style.border = '2px solid #FF9800';
      streakDisplay.style.background = '#fff8e1';
    } else {
      streakDisplay.style.border = '1px solid #ddd';
      streakDisplay.style.background = '#f9f9f9';
    }
  }
} 