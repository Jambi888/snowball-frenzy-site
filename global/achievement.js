/**
 * ACHIEVEMENT SYSTEM - Comprehensive achievement tracking and awarding system
 * 
 * This module provides a complete achievement system for Snowball Frenzy, handling
 * player progress tracking, achievement condition checking, and award distribution.
 * 
 * SYSTEM OVERVIEW:
 * The achievement system consists of two main types of achievements:
 * 1. THRESHOLD ACHIEVEMENTS - Unlocked when specific stats reach target values
 * 2. EVENT ACHIEVEMENTS - Unlocked when specific game events occur
 * 
 * CORE COMPONENTS:
 * 
 * 1. PROGRESS TRACKING
 *    - Tracks 17+ different player statistics
 *    - Updates automatically when game state changes
 *    - Persists across game sessions
 *    - Calculates derived stats (SPS, totals, etc.)
 * 
 * 2. EVENT SYSTEM INTEGRATION
 *    - Listens to 15+ different game events
 *    - Handles complex event conditions
 *    - Supports event parameters and validation
 *    - Emits achievement unlock events for other systems
 * 
 * 3. ACHIEVEMENT CHECKING
 *    - Real-time condition evaluation
 *    - Batch processing for performance
 *    - Prevents duplicate unlocks
 *    - Handles both threshold and event conditions
 * 
 * 4. NOTIFICATION SYSTEM
 *    - Visual achievement unlock notifications
 *    - Animated display with achievement details
 *    - Auto-dismissal after 5 seconds
 *    - EventBus integration for system-wide notifications
 * 
 * 5. UI INTEGRATION
 *    - Real-time achievement display updates
 *    - Category-based organization
 *    - Progress bars and unlock status
 *    - Timestamp tracking for unlock dates
 * 
 * TRACKED STATISTICS:
 * 
 * Basic Stats:
 * - total_clicks: Total manual clicks performed
 * - lifetime_snowballs: Total snowballs earned across all sessions
 * - assistants_owned: Total assistants currently owned
 * - upgrades_purchased: Total upgrades purchased (boosts + global + persistent)
 * - jumps_completed: Number of prestige/jumps completed
 * - time_played_seconds: Total play time in seconds
 * 
 * Advanced Stats:
 * - ability_belt_level: Current ability belt level from battle progression
 * - combos_created: Total ability combos created
 * - yetis_spotted: Total yetis encountered
 * - locations_unlocked: Number of locations unlocked
 * - travel_count: Number of travel actions completed
 * - icicles_harvested: Total icicles collected
 * - battles_won: Total battle victories
 * - battle_streak: Current battle win streak
 * - sps: Current snowballs per second rate
 * 
 * New Stats (v1.1):
 * - crystal_snowballs_collected: Total crystal snowballs collected
 * - snowflakes_found: Total snowflakes discovered
 * - snowflake_tree_purchases: Total snowflake tree upgrades purchased
 * - baby_yeti_owned: Total Baby Yetis owned
 * 
 * EVENT TYPES AND TRIGGERS:
 * 
 * Click Events:
 * - snowballClicked: Triggered on manual snowball clicks
 * - streakTierAchieved: Triggered when click streak tiers are reached
 * - speedClicker: Triggered when high click rates are maintained
 * 
 * Purchase Events:
 * - assistantPurchased: Triggered when assistants are bought
 * - upgradePurchased: Triggered when upgrades are purchased
 * 
 * Progression Events:
 * - jumpCompleted: Triggered when prestige/jumps are completed
 * - firstPrestige: Triggered on first prestige completion
 * 
 * Gameplay Events:
 * - abilityUsed: Triggered when abilities are activated
 * - yetiSpotted: Triggered when yetis are encountered
 * - rareYetiFound: Triggered when rare yeti variants are found
 * - locationUnlocked: Triggered when new locations are unlocked
 * - travelCompleted: Triggered when travel actions complete
 * - icicleHarvested: Triggered when icicles are collected
 * - icicleLevelUp: Triggered when icicles are used for leveling
 * - battleWon: Triggered when battles are won
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Batch achievement checking to reduce processing overhead
 * - Efficient stat calculation with caching
 * - Event listener cleanup to prevent memory leaks
 * - Lazy loading of achievement data
 * - Optimized UI updates with change detection
 * 
 * INTEGRATION POINTS:
 * - GameStateFlat: Main game state integration
 * - EventBus: Event system integration
 * - UIManager: UI display integration
 * - SaveManager: Persistence integration
 * - ProgressTracker: Analytics integration
 * 
 * USAGE EXAMPLES:
 * 
 * Initialize the system:
 * ```javascript
 * initializeAchievements(gameState);
 * ```
 * 
 * Record a click:
 * ```javascript
 * recordClick(gameState);
 * ```
 * 
 * Check achievements manually:
 * ```javascript
 * forceCheckAchievements(gameState);
 * ```
 * 
 * Get achievement progress:
 * ```javascript
 * const progress = getAchievementProgress(gameState);
 * ```
 * 
 * Get achievements by category:
 * ```javascript
 * const categories = getAchievementsByCategory(gameState);
 * ```
 */

import { ACHIEVEMENTS } from './data/acheivementData.js';

// -------------------------------
// achievement.js
// -------------------------------

/**
 * Initialize the achievement system for a game state
 * @param {GameStateFlat} game - The current game state object
 */
export function initializeAchievements(game) {
  // console.log('[ACHIEVEMENTS DEBUG] initializeAchievements called');
  
  // Initialize achievement tracking if it doesn't exist
  if (!game.achievements) {
    // console.log('[ACHIEVEMENTS DEBUG] Creating new achievements object');
    game.achievements = {
      unlocked: [],
      unlockedTimestamps: {}, // Track when each achievement was unlocked
      progress: {},
      lastCheck: game.getGameTime()
    };
  } else {
    // console.log('[ACHIEVEMENTS DEBUG] Achievements object already exists:', game.achievements);
    // Ensure unlockedTimestamps exists for backward compatibility
    if (!game.achievements.unlockedTimestamps) {
      game.achievements.unlockedTimestamps = {};
    }
    if (!game.achievements.progress) {
      game.achievements.progress = {};
    }
    // Initialize lastCheck if it doesn't exist
    if (!game.achievements.lastCheck) {
      game.achievements.lastCheck = game.getGameTime();
    }
  }
  
  // Initialize progress tracking for all stats
  initializeProgressTracking(game);
  
  // Set up event listeners for achievement triggers
  if (window.eventBus) {
    // Listen for snowball clicks
    window.eventBus.on('snowballClicked', (data) => {
      recordClick(game);
    }, 'achievements');
    
    // Listen for assistant purchases
    window.eventBus.on('assistantPurchased', (data) => {
      checkAchievements(game);
    }, 'achievements');
    
    // Listen for upgrade purchases
    window.eventBus.on('upgradePurchased', (data) => {
      checkAchievements(game);
    }, 'achievements');
    
    // Listen for jump completions
    window.eventBus.on('jumpCompleted', (data) => {
      recordJump(game);
    }, 'achievements');
    
    // Listen for click streak achievements
    // Streak achievements now use threshold-based tracking via highest_streak_tier
    
    // Ability belt level is now tracked via inventory count in updateProgressFromGameState
    
    // Listen for yeti spotting
    window.eventBus.on('yetiSpotted', (data) => {
      recordYetiSpotting(game);
    }, 'achievements');
    
    // Listen for location unlocks
    window.eventBus.on('locationUnlocked', (data) => {
      recordLocationUnlock(game);
    }, 'achievements');
    
    // Listen for travel events
    window.eventBus.on('travelCompleted', (data) => {
      recordTravel(game);
    }, 'achievements');
    
    // Listen for icicle harvesting
    window.eventBus.on('icicleHarvested', (data) => {
      recordIcicleHarvest(game);
    }, 'achievements');
    
    // Listen for battle victories
    window.eventBus.on('battleWon', (data) => {
      recordBattleVictory(game);
    }, 'achievements');
    
    // Listen for first prestige
    window.eventBus.on('firstPrestige', (data) => {
      checkEventAchievementInternal(game, 'firstPrestige', 1);
    }, 'achievements');
    
    // Listen for speed clicking
    window.eventBus.on('speedClicker', (data) => {
      checkEventAchievementInternal(game, 'speedClicker', data);
    }, 'achievements');
    
    // Listen for rare yeti finds
    window.eventBus.on('rareYetiFound', (data) => {
      checkEventAchievementInternal(game, 'rareYetiFound', data.variant);
    }, 'achievements');
    
    // Listen for icicle level ups
    window.eventBus.on('icicleLevelUp', (data) => {
      checkEventAchievementInternal(game, 'icicleLevelUp', data.level);
    }, 'achievements');
    
    // Listen for crystal snowball collection
    window.eventBus.on('crystalSnowballCollected', (data) => {
      recordCrystalSnowballCollection(game);
    }, 'achievements');
    
    // Listen for snowflake discovery
    window.eventBus.on('snowflakeDiscovered', (data) => {
      recordSnowflakeDiscovery(game);
    }, 'achievements');
    
    // Listen for snowflake tree purchases
    window.eventBus.on('snowflakeTreePurchased', (data) => {
      recordSnowflakeTreePurchase(game);
    }, 'achievements');
    
    // Listen for Baby Yeti ownership changes
    window.eventBus.on('babyYetiOwnershipChanged', (data) => {
      recordBabyYetiOwnership(game);
    }, 'achievements');
  }
  
  // console.log('[ACHIEVEMENTS] Achievement system initialized');
}

/**
 * Initialize progress tracking for all achievement stats
 * @param {GameStateFlat} game - The current game state object
 */
function initializeProgressTracking(game) {
  // console.log('[ACHIEVEMENTS DEBUG] initializeProgressTracking called');
  const progress = game.achievements.progress;
  
  // Initialize all tracked stats
  progress.total_clicks = progress.total_clicks || 0;
  progress.effective_clicks = progress.effective_clicks || 0;
  progress.lifetime_snowballs = progress.lifetime_snowballs || 0;
  progress.assistants_owned = progress.assistants_owned || 0;
  progress.upgrades_purchased = progress.upgrades_purchased || 0;
  progress.jumps_completed = progress.jumps_completed || 0;
  progress.time_played_seconds = progress.time_played_seconds || 0;
  
  // New stats for expanded achievements
  // Ability belt level is now tracked via inventory count
  progress.yetis_spotted = progress.yetis_spotted || 0;
  progress.locations_unlocked = progress.locations_unlocked || 0;
  progress.travel_count = progress.travel_count || 0;
  progress.icicles_harvested = progress.icicles_harvested || 0;
  progress.battles_won = progress.battles_won || 0;
  progress.battle_streak = progress.battle_streak || 0;
  progress.ability_belt_level = progress.ability_belt_level || 0;
  progress.highest_streak_tier = progress.highest_streak_tier || 0;
  progress.sps = progress.sps || 0;
  
  // New stats for v1.1 achievements
  progress.crystal_snowballs_collected = progress.crystal_snowballs_collected || 0;
  progress.snowflakes_found = progress.snowflakes_found || 0;
  progress.snowflake_tree_purchases = progress.snowflake_tree_purchases || 0;
  progress.baby_yeti_owned = progress.baby_yeti_owned || 0;
  
  // console.log('[ACHIEVEMENTS DEBUG] Initial progress values:', progress);
  
  // Calculate current values
  updateProgressFromGameState(game);
}

/**
 * Update progress tracking from current game state
 * @param {GameStateFlat} game - The current game state object
 */
function updateProgressFromGameState(game) {
  const progress = game.achievements.progress;
  
  // Update from game state
  progress.lifetime_snowballs = game.lifetimeSnowballs || 0;
  progress.assistants_owned = calculateTotalAssistants(game);
  progress.upgrades_purchased = calculateTotalUpgrades(game);
  progress.jumps_completed = (game.analogNumber || 1) - 1; // Jumps completed = current analog - 1
  
  // Calculate SPS (Snowballs Per Second)
  progress.sps = calculateSPS(game);
  
  // Update location stats - Use simple inventory counts
  progress.locations_unlocked = game.locationsVisited || 0; // Count visited locations from travel system
  progress.travel_count = game.travelCount || 0;
  
  // Update battle stats
  progress.battles_won = game.battlesWon || 0;
  progress.battle_streak = game.battleStreak || 0;
  progress.ability_belt_level = game.battles?.abilityBeltLevel || 0;
  progress.highest_streak_tier = calculateHighestStreakTier(game);
  
  // Update new v1.1 stats - Use simple inventory counts
  progress.crystal_snowballs_collected = game.crystalSnowballsCollected || 0;
  progress.snowflakes_found = game.snowflakes || 0; // Use wallet count instead of discovery
  progress.snowflake_tree_purchases = (game.persistentUpgrades || []).length; // Count all persistent upgrades
  progress.baby_yeti_owned = calculateBabyYetiOwned(game); // Count Yeti Jr upgrades
  
  // console.log(`[ACHIEVEMENTS DEBUG] Progress updated:`, {
  //   lifetime_snowballs: progress.lifetime_snowballs,
  //   assistants_owned: progress.assistants_owned,
  //   upgrades_purchased: progress.upgrades_purchased,
  //   jumps_completed: progress.jumps_completed,
  //   sps: progress.sps,
  //   locations_unlocked: progress.locations_unlocked,
  //   battles_won: progress.battles_won
  // });
}

/**
 * Calculate total assistants owned
 * @param {GameStateFlat} game - The current game state object
 * @returns {number} Total number of assistants owned
 */
function calculateTotalAssistants(game) {
  const assistants = game.assistants || {};
  const total = Object.values(assistants).reduce((total, count) => total + count, 0);
  // console.log(`[ACHIEVEMENTS DEBUG] Total assistants calculated: ${total}`, assistants);
  return total;
}

/**
 * Calculate total upgrades purchased
 * @param {GameStateFlat} game - The current game state object
 * @returns {number} Total number of upgrades purchased
 */
function calculateTotalUpgrades(game) {
  // Count all types of upgrades
  const boosts = game.boosts || {};
  const globalUpgrades = game.globalUpgrades || {};
  const persistentUpgrades = game.persistentUpgrades || {};
  const unifiedUpgrades = game.unifiedUpgrades || {};
  
  const boostCount = Object.values(boosts).filter(owned => owned).length;
  const globalUpgradeCount = Object.values(globalUpgrades).filter(owned => owned).length;
  const persistentUpgradeCount = Object.values(persistentUpgrades).filter(owned => owned).length;
  const unifiedUpgradeCount = Object.values(unifiedUpgrades).filter(owned => owned).length;
  
  const total = boostCount + globalUpgradeCount + persistentUpgradeCount + unifiedUpgradeCount;
  // console.log(`[ACHIEVEMENTS DEBUG] Total upgrades calculated: ${total} (boosts: ${boostCount}, global: ${globalUpgradeCount}, persistent: ${persistentUpgradeCount}, unified: ${unifiedUpgradeCount})`);
  return total;
}

/**
 * Calculate current SPS (Snowballs Per Second)
 * @param {GameStateFlat} game - The current game state object
 * @returns {number} Current SPS value
 */
function calculateSPS(game) {
  // Use the actual game SPS if available
  if (game.sps !== undefined) {
    return game.sps;
  }
  
  // Get SPS from the unified SPS system if available
  if (game.unifiedSPS && typeof game.unifiedSPS.getTotalSPS === 'function') {
    return game.unifiedSPS.getTotalSPS();
  }
  
  // Fallback calculation
  const assistants = game.assistants || {};
  let totalSPS = 0;
  
  for (const [assistantId, count] of Object.entries(assistants)) {
    if (count > 0) {
      // Get base SPS for this assistant type
      const baseSPS = getAssistantBaseSPS(assistantId);
      totalSPS += baseSPS * count;
    }
  }
  
  return totalSPS;
}

/**
 * Get base SPS for an assistant type
 * @param {string} assistantId - Assistant identifier
 * @returns {number} Base SPS value
 */
function getAssistantBaseSPS(assistantId) {
  // This would ideally come from assistant data, but for now use reasonable defaults
  const baseSPSMap = {
    'additionalArm': 1,
    'snowballMachine': 5,
    'yeti': 10,
    'babyYeti': 25,
    'snowstorm': 50,
    'avalanche': 100,
    'iceDragon': 250,
    'snowPrincess': 500,
    'winterFortress': 1000,
    'snowSingularity': 2500,
    'orbitalSnowCannon': 5000,
    'templeofWinter': 10000
  };
  
  return baseSPSMap[assistantId] || 1;
}

/**
 * Calculate number of locations unlocked
 * @param {GameStateFlat} game - The current game state object
 * @returns {number} Number of unlocked locations
 */
function calculateLocationsUnlocked(game) {
  const locations = game.locations || {};
  return Object.values(locations).filter(unlocked => unlocked).length;
}

/**
 * Calculate total snowflake tree purchases
 * @param {GameStateFlat} game - The current game state object
 * @returns {number} Total snowflake tree upgrades purchased
 */
function calculateSnowflakeTreePurchases(game) {
  const snowflakeTree = game.snowflakeTree || {};
  return Object.values(snowflakeTree).filter(purchased => purchased).length;
}

/**
 * Calculate total Baby Yetis owned
 * @param {GameStateFlat} game - The current game state object
 * @returns {number} Total Baby Yetis owned
 */
function calculateBabyYetiOwned(game) {
  const unifiedUpgrades = game.unifiedUpgrades || {};
  let babyYetiCount = 0;
  
  // Count all Yeti Jr upgrades (yetiJr6 through yetiJr40)
  for (let i = 6; i <= 40; i++) {
    if (unifiedUpgrades[`yetiJr${i}`]) {
      babyYetiCount++;
    }
  }
  
  return babyYetiCount;
}

/**
 * Calculate the highest streak tier achieved
 * @param {GameStateFlat} game - The current game state object
 * @returns {number} Highest streak tier achieved (0-6)
 */
function calculateHighestStreakTier(game) {
  const streakSystem = game.loops?.active?.clicking?.streakSystem;
  if (!streakSystem) return 0;
  
  // Get the highest tier from streak statistics
  const stats = streakSystem.stats || {};
  const streaksAchieved = stats.streaksAchieved || [];
  
  // Find the highest tier that has been achieved at least once
  for (let i = streaksAchieved.length - 1; i >= 0; i--) {
    if (streaksAchieved[i] > 0) {
      return i + 1; // Convert to 1-based tier number
    }
  }
  
  return 0;
}

/**
/**
 * Record a click event for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 * @param {number} effectiveSnowballs - Snowballs generated from this click (with multipliers)
 */
export function recordClick(game, effectiveSnowballs = 1) {
  // console.log('[ACHIEVEMENTS DEBUG] recordClick called');
  if (!game.achievements) {
    // console.log('[ACHIEVEMENTS DEBUG] No achievements object found, returning');
    return;
  }
  
  // Track raw clicks (user physical clicks)
  game.achievements.progress.total_clicks++;
  
  // Track effective clicks (snowballs generated from clicks with all multipliers)
  if (!game.achievements.progress.effective_clicks) {
    game.achievements.progress.effective_clicks = 0;
  }
  game.achievements.progress.effective_clicks += effectiveSnowballs;
  
  // console.log(`[ACHIEVEMENTS DEBUG] Click recorded. Total clicks: ${game.achievements.progress.total_clicks}, Effective snowballs: ${game.achievements.progress.effective_clicks}`);
  checkAchievements(game);
}

/**
 * Update time played tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function updateTimePlayed(game) {
  if (!game.achievements) return;
  
  const now = game.getGameTime();
  const lastCheck = game.achievements.lastCheck || now;
  const timeDiff = Math.floor((now - lastCheck) / 1000); // Convert to seconds
  
  game.achievements.progress.time_played_seconds += timeDiff;
  game.achievements.lastCheck = now;
  
  // console.log(`[ACHIEVEMENTS DEBUG] Time updated. Total time: ${game.achievements.progress.time_played_seconds}s`);
  checkAchievements(game);
}

/**
 * Record an upgrade purchase for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 * @param {string} upgradeType - Type of upgrade ('boost', 'global', 'persistent')
 */
export function recordUpgradePurchase(game, upgradeType) {
  // console.log(`[ACHIEVEMENTS DEBUG] recordUpgradePurchase called with type: ${upgradeType}`);
  if (!game.achievements) {
    // console.log('[ACHIEVEMENTS DEBUG] No achievements object found, returning');
    return;
  }
  
  // Update progress from current game state
  updateProgressFromGameState(game);
  // console.log(`[ACHIEVEMENTS DEBUG] Progress updated. Upgrades purchased: ${game.achievements.progress.upgrades_purchased}`);
  checkAchievements(game);
}

/**
 * Record a jump completion for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordJump(game) {
  // console.log('[ACHIEVEMENTS DEBUG] recordJump called');
  if (!game.achievements) {
    // console.log('[ACHIEVEMENTS DEBUG] No achievements object found, returning');
    return;
  }
  
  // Update progress from current game state
  updateProgressFromGameState(game);
  // console.log(`[ACHIEVEMENTS DEBUG] Progress updated. Jumps completed: ${game.achievements.progress.jumps_completed}`);
  checkAchievements(game);
}

// Ability belt level is now tracked via inventory count in updateProgressFromGameState

/**
 * Record yeti spotting for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordYetiSpotting(game) {
  if (!game.achievements) return;
  
  game.achievements.progress.yetis_spotted++;
  checkAchievements(game);
}

/**
 * Record location unlock for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordLocationUnlock(game) {
  if (!game.achievements) return;
  
  // Update progress from current game state
  updateProgressFromGameState(game);
  checkAchievements(game);
}

/**
 * Record travel completion for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordTravel(game) {
  if (!game.achievements) return;
  
  game.achievements.progress.travel_count++;
  checkAchievements(game);
}

/**
 * Record icicle harvest for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordIcicleHarvest(game) {
  if (!game.achievements) return;
  
  game.achievements.progress.icicles_harvested++;
  checkAchievements(game);
}

/**
 * Record battle victory for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordBattleVictory(game) {
  if (!game.achievements) return;
  
  game.achievements.progress.battles_won++;
  // Update battle streak (this would need to be tracked in the battle system)
  checkAchievements(game);
}

/**
 * Record crystal snowball collection for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordCrystalSnowballCollection(game) {
  if (!game.achievements) return;
  
  game.achievements.progress.crystal_snowballs_collected++;
  checkAchievements(game);
}

/**
 * Record snowflake discovery for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordSnowflakeDiscovery(game) {
  if (!game.achievements) return;
  
  game.achievements.progress.snowflakes_found++;
  checkAchievements(game);
}

/**
 * Record snowflake tree purchase for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordSnowflakeTreePurchase(game) {
  if (!game.achievements) return;
  
  game.achievements.progress.snowflake_tree_purchases++;
  checkAchievements(game);
}

/**
 * Record Baby Yeti ownership for achievement tracking
 * @param {GameStateFlat} game - The current game state object
 */
export function recordBabyYetiOwnership(game) {
  if (!game.achievements) return;
  
  // Update progress from current game state
  updateProgressFromGameState(game);
  checkAchievements(game);
}

/**
 * Check event-based achievements (internal function)
 * @param {GameStateFlat} game - The current game state object
 * @param {string} eventType - Type of event that occurred
 * @param {any} eventValue - Value associated with the event
 */
function checkEventAchievementInternal(game, eventType, eventValue) {
  // console.log(`[ACHIEVEMENTS DEBUG] checkEventAchievement called: ${eventType}, value: ${eventValue}`);
  if (!game.achievements) {
    // console.log('[ACHIEVEMENTS DEBUG] No achievements object found, returning');
    return;
  }
  
  const unlocked = game.achievements.unlocked;
  const newlyUnlocked = [];
  
  for (const achievement of ACHIEVEMENTS.achievements) {
    // Skip if already unlocked
    if (unlocked.includes(achievement.id)) {
      continue;
    }
    
    // Check if this is an event-based achievement that matches our event
    if (achievement.type === 'event' && 
        achievement.condition.event === eventType) {
      
      let shouldUnlock = false;
      
      // Check specific event conditions
      if (eventType === 'streakTierAchieved' && 
          achievement.condition.tier === eventValue) {
        shouldUnlock = true;
      } else if (eventType === 'firstPrestige' && 
                 achievement.condition.jump === eventValue) {
        shouldUnlock = true;
      } else if (eventType === 'speedClicker' && 
                 eventValue.cps >= achievement.condition.cps && 
                 eventValue.duration >= achievement.condition.duration) {
        shouldUnlock = true;
      } else if (eventType === 'rareYetiFound' && 
                 achievement.condition.variant === 'any') {
        shouldUnlock = true;
      } else if (eventType === 'icicleLevelUp' && 
                 achievement.condition.level === eventValue) {
        shouldUnlock = true;
      }
      
      if (shouldUnlock) {
        unlocked.push(achievement.id);
        newlyUnlocked.push(achievement);
        
        // Record the timestamp when this achievement was unlocked
        game.achievements.unlockedTimestamps[achievement.id] = Date.now();
        
        // console.log(`[ACHIEVEMENTS] 🏆 Event Achievement Unlocked: ${achievement.name} - ${achievement.description}`);
        
        // Emit achievement unlocked event for other systems
        if (window.eventBus) {
          window.eventBus.emit('achievementUnlocked', {
            achievementId: achievement.id,
            achievement: achievement
          });
        }
      }
    }
  }
  
  // Show notification for newly unlocked achievements
  if (newlyUnlocked.length > 0) {
    // console.log(`[ACHIEVEMENTS DEBUG] Showing notification for ${newlyUnlocked.length} newly unlocked event achievements`);
    showAchievementNotification(newlyUnlocked);
  }
  
  // Refresh the achievement UI to show updated progress
  if (window.renderAchievementsUI) {
    window.renderAchievementsUI(game);
  }
}

/**
 * Check all achievements and award any that are newly unlocked
 * @param {GameStateFlat} game - The current game state object
 */
function checkAchievements(game) {
  // console.log('[ACHIEVEMENTS DEBUG] checkAchievements called');
  if (!game.achievements) {
    // console.log('[ACHIEVEMENTS DEBUG] No achievements object found, returning');
    return;
  }
  
  const unlocked = game.achievements.unlocked;
  const progress = game.achievements.progress;
  const newlyUnlocked = [];
  
  // console.log(`[ACHIEVEMENTS DEBUG] Checking ${ACHIEVEMENTS.achievements.length} achievements. Already unlocked: ${unlocked.length}`);
  // console.log(`[ACHIEVEMENTS DEBUG] Current progress:`, progress);
  
  for (const achievement of ACHIEVEMENTS.achievements) {
    // Skip if already unlocked
    if (unlocked.includes(achievement.id)) {
      // console.log(`[ACHIEVEMENTS DEBUG] Achievement ${achievement.id} already unlocked, skipping`);
      continue;
    }
    
    // Check if achievement condition is met
    const isUnlocked = isAchievementUnlocked(achievement, progress);
    // console.log(`[ACHIEVEMENTS DEBUG] Achievement ${achievement.id} (${achievement.name}): ${isUnlocked ? 'UNLOCKED' : 'not unlocked'}`);
    
    if (isUnlocked) {
      unlocked.push(achievement.id);
      newlyUnlocked.push(achievement);
      
      // Record the timestamp when this achievement was unlocked
      game.achievements.unlockedTimestamps[achievement.id] = Date.now();
      
      // console.log(`[ACHIEVEMENTS] 🏆 Unlocked: ${achievement.name} - ${achievement.description}`);
      
      // Emit achievement unlocked event for other systems
      if (window.eventBus) {
        window.eventBus.emit('achievementUnlocked', {
          achievementId: achievement.id,
          achievement: achievement
        });
      }
    }
  }
  
  // Show notification for newly unlocked achievements
  if (newlyUnlocked.length > 0) {
    // console.log(`[ACHIEVEMENTS DEBUG] Showing notification for ${newlyUnlocked.length} newly unlocked achievements`);
    showAchievementNotification(newlyUnlocked);
  } else {
    // console.log('[ACHIEVEMENTS DEBUG] No new achievements unlocked');
  }
  
  // Refresh the achievement UI to show updated progress
  if (window.renderAchievementsUI) {
    window.renderAchievementsUI(game);
  }
}

/**
 * Check if an achievement should be unlocked based on current progress
 * @param {Object} achievement - The achievement object
 * @param {Object} progress - Current progress tracking
 * @returns {boolean} True if achievement should be unlocked
 */
function isAchievementUnlocked(achievement, progress) {
  if (achievement.type === 'event') {
    // Event-based achievements are handled by event listeners, not by this function
    return false;
  }
  
  // Handle threshold-based achievements
  const condition = achievement.condition;
  const currentValue = progress[condition.stat] || 0;
  const targetValue = condition.value;
  const isUnlocked = currentValue >= targetValue;
  
  // console.log(`[ACHIEVEMENTS DEBUG] Checking ${achievement.id}: ${currentValue}/${targetValue} ${condition.stat} - ${isUnlocked ? 'UNLOCKED' : 'not unlocked'}`);
  
  return isUnlocked;
}

/**
 * Show achievement notification
 * @param {Array} achievements - Array of newly unlocked achievements
 */
function showAchievementNotification(achievements) {
  // Use central notification panel if available
  if (window.centralNotificationPanel) {
            // console.log('[ACHIEVEMENT] Using central notification panel');
    for (const achievement of achievements) {
      window.centralNotificationPanel.addMessage({
        type: 'achievement',
        icon: '🏆',
        title: 'Achievement Unlocked!',
        description: achievement.name,
        color: '#FFD700'
      });
    }
  } else {
    // Fallback to old notification system
            // console.warn('[ACHIEVEMENT] Central notification panel not available, using fallback');
        // console.log('[ACHIEVEMENT] Available globals:', Object.keys(window).filter(key => key.includes('notification') || key.includes('panel')));
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 1000;
      max-width: 300px;
      animation: slideIn 0.5s ease-out;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Build notification content
    let content = '<div style="font-weight: bold; margin-bottom: 5px;">🏆 Achievement Unlocked!</div>';
    
    for (const achievement of achievements) {
      content += `
        <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 5px;">
          <span style="font-size: 1.2em;">${achievement.icon}</span>
          <strong>${achievement.name}</strong><br>
          <small>${achievement.description}</small>
        </div>
      `;
    }
    
    notification.innerHTML = content;
    document.body.appendChild(notification);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.5s ease-in';
      notification.style.animationFillMode = 'forwards';
      
      // Add slideOut animation
      const slideOutStyle = document.createElement('style');
      slideOutStyle.textContent = `
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(slideOutStyle);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 5000);
  }
}

/**
 * Get achievement progress for display
 * @param {GameStateFlat} game - The current game state object
 * @returns {Object} Achievement progress data
 */
export function getAchievementProgress(game) {
  if (!game.achievements) return { unlocked: 0, total: 0, progress: {} };
  
  const unlocked = game.achievements.unlocked.length;
  const total = ACHIEVEMENTS.achievements.length;
  const progress = game.achievements.progress;
  
  return { unlocked, total, progress };
}

/**
 * Get achievements by category
 * @param {GameStateFlat} game - The current game state object
 * @returns {Object} Achievements grouped by category
 */
export function getAchievementsByCategory(game) {
  if (!game.achievements) return {};
  
  const unlocked = game.achievements.unlocked;
  const unlockedTimestamps = game.achievements.unlockedTimestamps || {};
  const progress = game.achievements.progress;
  const categories = {};
  
  for (const achievement of ACHIEVEMENTS.achievements) {
    const category = achievement.category;
    if (!categories[category]) {
      categories[category] = [];
    }
    
    const isUnlocked = unlocked.includes(achievement.id);
    const currentValue = progress[achievement.condition.stat] || 0;
    const targetValue = achievement.condition.value;
    const progressPercent = Math.min((currentValue / targetValue) * 100, 100);
    const unlockedAt = unlockedTimestamps[achievement.id] || null;
    
    categories[category].push({
      ...achievement,
      unlocked: isUnlocked,
      currentValue,
      targetValue,
      progressPercent,
      unlocked_at: unlockedAt
    });
  }
  
  return categories;
}

/**
 * Render achievements UI
 * @param {GameStateFlat} game - The current game state object
 */
export function renderAchievementsUI(game) {
  const container = document.getElementById('achievements-container');
  if (!container) return;
  
  const categories = getAchievementsByCategory(game);
  const { unlocked, total } = getAchievementProgress(game);
  
  let html = `
    <div style="margin-bottom: 20px;">
      <h3>Achievements (${unlocked}/${total})</h3>
      <div style="background: #f0f0f0; border-radius: 5px; height: 20px; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #4CAF50, #45a049); height: 100%; width: ${(unlocked/total)*100}%; transition: width 0.3s;"></div>
      </div>
    </div>
  `;
  
  for (const [category, achievements] of Object.entries(categories)) {
    const categoryUnlocked = achievements.filter(a => a.unlocked).length;
    const categoryTotal = achievements.length;
    
    html += `
      <div style="margin-bottom: 15px;">
        <h4>${category.charAt(0).toUpperCase() + category.slice(1)} (${categoryUnlocked}/${categoryTotal})</h4>
    `;
    
    for (const achievement of achievements) {
      const statusIcon = achievement.unlocked ? '✅' : '🔒';
      const progressBar = achievement.unlocked ? 
        '<div style="background: #4CAF50; height: 4px; width: 100%; border-radius: 2px;"></div>' :
        `<div style="background: #ddd; height: 4px; border-radius: 2px; overflow: hidden;">
           <div style="background: #4CAF50; height: 100%; width: ${achievement.progressPercent}%;"></div>
         </div>`;
      
      // Format unlock date if available
      let unlockDateText = '';
      if (achievement.unlocked && achievement.unlocked_at) {
        const unlockDate = new Date(achievement.unlocked_at);
        unlockDateText = `<br><small style="color: #4CAF50;">Unlocked: ${unlockDate.toLocaleDateString()} at ${unlockDate.toLocaleTimeString()}</small>`;
      }
      
      html += `
        <div style="border: 1px solid #ddd; margin: 5px 0; padding: 10px; border-radius: 5px; ${achievement.unlocked ? 'background: #f8fff8;' : ''}">
          <div style="display: flex; align-items: center; margin-bottom: 5px;">
            <span style="font-size: 1.2em; margin-right: 10px;">${achievement.icon}</span>
            <div style="flex: 1;">
              <strong>${achievement.name}</strong>
              <span style="float: right;">${statusIcon}</span>
            </div>
          </div>
          <p style="margin: 5px 0; color: #666;">${achievement.description}</p>
          ${progressBar}
          <small style="color: #888;">${achievement.currentValue}/${achievement.targetValue}</small>
          ${unlockDateText}
        </div>
      `;
    }
    
    html += '</div>';
  }
  
  container.innerHTML = html;
}

/**
 * Force check achievements immediately
 * @param {GameStateFlat} game - The current game state object
 */
export function forceCheckAchievements(game) {
  // console.log('[ACHIEVEMENTS DEBUG] forceCheckAchievements called');
  if (!game.achievements) {
    // console.log('[ACHIEVEMENTS DEBUG] No achievements object found, initializing...');
    initializeAchievements(game);
  }
  
  // Update progress from current game state
  updateProgressFromGameState(game);
  
  // Check achievements
  checkAchievements(game);
}

/**
 * Check event-based achievements (exported for external use)
 * @param {GameStateFlat} game - The current game state object
 * @param {string} eventType - Type of event that occurred
 * @param {any} eventValue - Value associated with the event
 */
export function checkEventAchievement(game, eventType, eventValue) {
  return checkEventAchievementInternal(game, eventType, eventValue);
}
