/**
 * main.js - Game entry point and initialization
 * 
 * This is the main entry point for the Snowball Frenzy game.
 * It handles:
 * - Game state initialization
 * - System setup and configuration
 * - Event handling setup
 * - Game loop startup
 * 
 * The game follows a modular architecture where each system
 * is responsible for its own functionality and UI updates.
 */

import { GameStateFlat } from './core/gameStateFlat.js';
import { setupClicker } from './loops/active/clicker.js';
import { setupAssistants, updateAssistantsUI } from './loops/passive/assistants.js';
import { startTickLoop } from './core/tickLoop.js';
import { setupUnifiedUpgrades, updateUnifiedUpgradesUI } from './loops/passive/unifiedUpgrades.js';
import { calculateUnifiedSPS } from './loops/passive/unifiedSPS.js';
import { setupIcicle, updateIcicle, getIcicleCount, addIcicles, spendIcicles, testIcicleGrowth } from './loops/passive/icicle.js';
import { setupYetis, updateYetiUI } from './loops/hybrid/yetis.js';
import { maybeShowJumpButton, triggerJump } from './meta/jump.js';
// import { updateAnalogSnowballs } from './meta/analogTracker.js'; // No longer needed - analog tracking only during jump
import { updateInventoryDisplay } from './global/inventory.js';
import { renderDashboardTables } from './global/dashboard.js';
import { initializeAchievements, recordClick, updateTimePlayed, recordUpgradePurchase, recordJump, renderAchievementsUI, forceCheckAchievements, getAchievementsByCategory, recordYetiSpotting, recordLocationUnlock, recordTravel, recordIcicleHarvest, recordBattleVictory, recordCrystalSnowballCollection, recordSnowflakeDiscovery, recordSnowflakeTreePurchase, recordBabyYetiOwnership } from './global/achievement.js';
import { initializeLore, checkLoreForAssistant, checkLoreForUpgrade, checkLoreForBoost, checkLoreForIcicle, renderLoreUI, forceCheckLore } from './global/lore.js';
import { eventBus } from './core/eventBus.js';
import { TIME_RATE } from './core/config.js';
import { loopManager } from './core/loopManager.js';
import LoopUIManager from './ui/LoopUIManager.js';
import { GameReadyUIManager } from './ui/GameReadyUIManager.js';
import { ComponentFactory } from './ui/components.js';
import { timerManager } from './core/TimerManager.js';
import { CrystalSnowballManager } from './core/crystalSnowball.js';
import { memoryManager } from './core/MemoryManager.js';
import { serviceLocator } from './core/ServiceLocator.js';
import { dependencyInjector } from './core/DependencyInjector.js';
import { ASSISTANTS } from './loops/passive/data/assistantData.js';

// Import base system classes for future use
import { ActiveSystem } from './loops/base/ActiveSystem.js';
import { PassiveSystem } from './loops/base/PassiveSystem.js';
import { HybridSystem } from './loops/base/HybridSystem.js';

// Import Step 6: Progress Tracking & Player Engagement systems
import { ProgressTracker } from './core/progressTracker.js';
import { EngagementAnalytics } from './core/engagementAnalytics.js';
import { AnalyticsTracker } from './core/analyticsTracker.js';
// import { setupTravelSystem } from './loops/hybrid/travel.js'; // REMOVED - replaced with simple system
import { setupBattleSystem } from './loops/hybrid/battles.js';

// Import the new simple systems
import { initializeSimpleActivityCounter } from './loops/hybrid/simpleActivityCounter.js';
import { initializeSimpleTravel } from './loops/hybrid/simpleTravel.js';

// Initialize the main game state
// This loads existing save data or creates a new game
const game = new GameStateFlat();

// Initialize snowflake cost for the current analog
import { SNOWFLAKE_CONFIG } from './meta/snowflakeTree.js';
game.snowflakeCost = SNOWFLAKE_CONFIG.baseCost * SNOWFLAKE_CONFIG.costRate ** ((game.analogNumber || 1) - 1);

// Make SNOWFLAKE_CONFIG globally available for other modules
window.SNOWFLAKE_CONFIG = SNOWFLAKE_CONFIG;

// Initialize Dependency Injection System
  // console.log('[MAIN] Initializing Dependency Injection System...');

// Register global services with ServiceLocator
serviceLocator.register('eventBus', eventBus, { singleton: true });
serviceLocator.register('timerManager', timerManager, { singleton: true });
serviceLocator.register('memoryManager', memoryManager, { singleton: true });
serviceLocator.register('gameState', game, { singleton: true });

// Register base system classes with DependencyInjector
dependencyInjector.register('ActiveSystem', ActiveSystem, ['eventBus'], { singleton: false });
dependencyInjector.register('PassiveSystem', PassiveSystem, ['eventBus'], { singleton: false });
dependencyInjector.register('HybridSystem', HybridSystem, ['eventBus'], { singleton: false });

  // console.log('[MAIN] Dependency Injection System initialized');
  // console.log('[MAIN] Registered services:', serviceLocator.getRegisteredServices());
  // console.log('[MAIN] Registered classes:', dependencyInjector.getRegisteredClasses());

// Make game state globally available for jump system
window.game = game;

// Make assistant data globally available for UI
window.ASSISTANTS = ASSISTANTS;

// Initialize the Loop Manager
loopManager.initialize(game);

// Initialize Step 6: Progress Tracking & Player Engagement
const progressTracker = new ProgressTracker(game, eventBus);
const engagementAnalytics = new EngagementAnalytics(progressTracker, game, eventBus);
const analyticsTracker = new AnalyticsTracker(game, eventBus);

// Make progress systems globally available
window.progressTracker = progressTracker;
window.engagementAnalytics = engagementAnalytics;
window.analyticsTracker = analyticsTracker;

// Set up enhanced event bus for cross-system communication
eventBus.setDebugMode(false); // Set to true to see all cross-system events

// Create system wrapper objects for registration with loop manager
const systemWrappers = {
  // Active Systems
  clicker: {
    setup: (game) => setupClicker(game),
    handleInput: (eventType, data) => {
      // Handle input events if needed in the future
      // console.log(`[CLICKER] Received input: ${eventType}`, data);
    }
  },
  
  // Passive Systems  
  assistants: {
    setup: (game) => setupAssistants(game),
    update: (game) => {
      // Assistants are updated by the tick loop, no additional update needed
      // This could be used for future assistant-specific logic
    },
    calculateOutput: (game) => calculateUnifiedSPS(game)
  },
  
  unifiedUpgrades: {
    setup: (game) => setupUnifiedUpgrades(game),
    update: (game) => {
      // Unified upgrades are applied during SPS calculation, no regular update needed
      // This could be used for future time-based upgrade effects
    },
    calculateOutput: (game) => calculateUnifiedSPS(game)
  },
  
  icicle: {
    setup: (game) => setupIcicle(game),
    update: (game) => updateIcicle(game),
    calculateOutput: (game) => {
      // Icicle doesn't directly contribute to SPS but provides bonuses
      return 0;
    }
  },
  
  // Hybrid Systems
  yetis: {
    setup: (game) => setupYetis(game),
    update: (game) => {
      // Yeti system handles its own updates via intervals
      // This could be used for additional yeti logic
    },
    handleInput: (eventType, data) => {
      // Handle yeti-related input events
      if (eventType === 'yetiClick') {
        // console.log(`[YETI] Handling yeti click:`, data);
      }
    }
  },
  
  travel: {
          setup: (game) => { /* setupTravelSystem(game); */ }, // REMOVED - replaced with simple system
    update: (game) => {
      // Travel system handles its own updates via intervals
      // This could be used for additional travel logic
    },
    handleInput: (eventType, data) => {
      // Handle travel-related input events
      if (eventType === 'travelButtonClick') {
        // console.log(`[TRAVEL] Handling travel button click:`, data);
      }
    }
  },
  
  battles: {
    setup: (game) => setupBattleSystem(game),
    update: (game) => {
      // Battle system handles its own updates via timeouts
      // This could be used for additional battle logic
    },
    handleInput: (eventType, data) => {
      // Handle battle-related input events
      if (eventType === 'battleToggle') {
        // console.log(`[BATTLES] Handling battle toggle:`, data);
      }
    }
  },
  
  abilityBelt: {
    setup: (game) => setupAbilityBelt(game),
    update: (game) => {
      // Ability belt handles its own updates via events
      // This could be used for additional ability belt logic
    },
    handleInput: (eventType, data) => {
      // Handle ability belt-related input events
      if (eventType === 'abilityBeltChanged') {
        // console.log(`[ABILITY_BELT] Handling ability belt change:`, data);
      }
    }
  }
};

// Register all systems with the loop manager
loopManager.registerSystem('active', 'clicker', systemWrappers.clicker);
loopManager.registerSystem('passive', 'assistants', systemWrappers.assistants);
loopManager.registerSystem('passive', 'unifiedUpgrades', systemWrappers.unifiedUpgrades);
loopManager.registerSystem('passive', 'icicle', systemWrappers.icicle);
loopManager.registerSystem('hybrid', 'yetis', systemWrappers.yetis);
loopManager.registerSystem('hybrid', 'travel', systemWrappers.travel);
loopManager.registerSystem('hybrid', 'battles', systemWrappers.battles);
loopManager.registerSystem('hybrid', 'abilityBelt', systemWrappers.abilityBelt);

// Setup all game systems (existing functionality preserved)
setupClicker(game);                    // Active clicking system
setupAssistants(game);                 // Assistant management
setupUnifiedUpgrades(game);            // Unified upgrade system
setupIcicle(game);                     // Icicle system
setupYetis(game);                      // Yeti system
  // setupTravelSystem(game);                // Travel system (replaced with simple system)
setupBattleSystem(game);                 // Battle system
setupAbilityBelt(game);                 // Ability belt system

// Initialize crystal snowball manager
game.crystalSnowballManager = new CrystalSnowballManager(game);

// Initialize Spawn Zone Manager globally
import('./core/SpawnZoneManager.js').then(({ SpawnZoneManager }) => {
  const spawnZoneManager = new SpawnZoneManager();
  
  // Find the main game container for zone calculation
  const gameContainer = document.querySelector('.game-container') ||
                       document.querySelector('.middle-column') ||
                       document.body;
  
  if (gameContainer) {
    spawnZoneManager.initialize(gameContainer);
    game.spawnZoneManager = spawnZoneManager;
    window.spawnZoneManager = spawnZoneManager; // Global access for debugging
    // console.log('[MAIN] Spawn Zone Manager initialized globally');
  } else {
    console.warn('[MAIN] Could not find game container for spawn zone manager');
  }
}).catch(error => {
  console.warn('[MAIN] Could not load spawn zone manager:', error);
});

// Initialize achievement system
initializeAchievements(game);

// Initialize lore system
initializeLore(game);

// Calculate and apply idle bonuses if any idle time occurred
if (game.idleTimeInfo && game.idleTimeInfo.isIdle) {
  // console.log('[MAIN] Idle time detected, calculating idle bonus...', game.idleTimeInfo);
  const idleBonus = game.calculateAndApplyIdleBonus();
  if (idleBonus) {
    // Apply idle bonus if player has been away
    if (idleBonus.idleTimeHours > 0.1) { // Only apply if away for more than 6 minutes
      game.snowballs += idleBonus.idleBonus;
      console.log(`[MAIN] Applied idle bonus: ${idleBonus.idleBonus.toFixed(0)} snowballs for ${idleBonus.idleTimeHours.toFixed(2)} hours of idle time`);
    } else {
      // console.log(`[MAIN] Idle bonus calculated but below threshold: ${idleBonus.idleTimeHours.toFixed(2)} hours (need > 0.1 hours)`);
    }
  } else {
    // console.log('[MAIN] No idle bonus returned from calculateAndApplyIdleBonus()');
  }
} else {
  // console.log('[MAIN] No idle time detected:', {
  //   hasIdleTimeInfo: !!game.idleTimeInfo,
  //   idleTimeInfo: game.idleTimeInfo,
  //   isIdle: game.idleTimeInfo ? game.idleTimeInfo.isIdle : 'undefined'
  // });
}

// Initialize event bus and make it globally available
window.eventBus = eventBus;

// Make MemoryManager globally available
window.memoryManager = memoryManager;

// Make SaveManager globally available for debugging and testing
window.saveManager = game.saveManager;

// Debug SaveManager initialization
// console.log('[MAIN] SaveManager initialization check:', {
//   gameExists: !!game,
//   gameSaveManager: !!game.saveManager,
//   windowSaveManager: !!window.saveManager,
//   gameState: game ? Object.keys(game) : 'game not available'
// });

// Make Dependency Injection System globally available
window.serviceLocator = serviceLocator;
window.dependencyInjector = dependencyInjector;

// Make SPS dirty marking available globally (BEFORE UI initialization)
import { markSPSDirty } from './loops/passive/unifiedUpgrades.js';
window.markSPSDirty = markSPSDirty;

// Make UI functions globally available for jump system
window.updateAssistantsUI = updateAssistantsUI;
window.updateUnifiedUpgradesUI = updateUnifiedUpgradesUI;
window.setupIcicle = setupIcicle;
window.updateIcicle = updateIcicle;
window.getIcicleCount = getIcicleCount;
window.addIcicles = addIcicles;
window.spendIcicles = spendIcicles;
window.testIcicleGrowth = testIcicleGrowth;
window.calculateUnifiedSPS = calculateUnifiedSPS;
window.setupAssistants = setupAssistants;
window.setupUnifiedUpgrades = setupUnifiedUpgrades;

// Initialize Game-Ready UI Framework
const gameReadyUIManager = new GameReadyUIManager(game);
window.gameReadyUIManager = gameReadyUIManager;
// Set the UI manager reference in the game for other systems to access
game.uiManager = gameReadyUIManager;
  // console.log('[MAIN] GameReadyUIManager initialized:', gameReadyUIManager);
// Disabled LoopUIManager to prevent conflicts with GameReadyUIManager
// Optionally, keep legacy UI manager as fallback
// const uiManager = new LoopUIManager(game);
// window.uiManager = uiManager;

// Enable event bus debug mode in development (can be toggled)
// eventBus.setDebugMode(true);
window.updateInventoryDisplay = updateInventoryDisplay;
window.renderAchievementsUI = renderAchievementsUI;
window.forceCheckAchievements = forceCheckAchievements;
window.recordClick = recordClick;
window.getAchievementsByCategory = getAchievementsByCategory;
// recordAbilityUsage removed - ability belt level now tracked via inventory count
window.recordYetiSpotting = recordYetiSpotting;
window.recordLocationUnlock = recordLocationUnlock;
window.recordTravel = recordTravel;
window.recordIcicleHarvest = recordIcicleHarvest;
window.recordBattleVictory = recordBattleVictory;
window.recordCrystalSnowballCollection = recordCrystalSnowballCollection;
window.recordSnowflakeDiscovery = recordSnowflakeDiscovery;
window.recordSnowflakeTreePurchase = recordSnowflakeTreePurchase;
window.recordBabyYetiOwnership = recordBabyYetiOwnership;
window.renderLoreUI = renderLoreUI;
window.forceCheckLore = forceCheckLore;
window.updateYetiUI = updateYetiUI;
window.maybeShowJumpButton = maybeShowJumpButton;
window.triggerJump = triggerJump;

// Make ability belt functions available globally
import { 
  getAllAvailableAbilities, 
  getAbilitiesByClass, 
  getAbilityBelt, 
  setAbilityInSlot, 
  clearAbilityBelt, 
  isAbilityEquipped,
  getEquippedAbilities,
  setupAbilityBelt
} from './loops/hybrid/abilityBelt.js';

window.getAllAvailableAbilities = getAllAvailableAbilities;
window.getAbilitiesByClass = getAbilitiesByClass;
window.getAbilityBelt = getAbilityBelt;
window.setAbilityInSlot = setAbilityInSlot;
window.clearAbilityBelt = clearAbilityBelt;
window.isAbilityEquipped = isAbilityEquipped;
window.getEquippedAbilities = getEquippedAbilities;

// Make yeti functions available globally
import { isYetiVisible, getCurrentSpawnedYeti } from './loops/hybrid/yetis.js';
window.isYetiVisible = isYetiVisible;
window.getCurrentSpawnedYeti = getCurrentSpawnedYeti;

// Initialize UI displays
// updateAssistantsUI(game); // Disabled - using new GameReadyUIManager instead
// updateUnifiedUpgradesUI(game); // Disabled - using new GameReadyUIManager instead
updateInventoryDisplay(game);
renderDashboardTables(game);

// Icicle system is now auto-harvesting - no manual button needed

// Setup jump button visibility check using TimerManager
const jumpButtonTimerId = timerManager.setInterval(() => {
  maybeShowJumpButton(game);
}, 5000, 'jump-button-check'); // Check every 5 seconds

// Analog tracking is now only done during jump - no periodic updates needed
// const analogTrackingTimerId = timerManager.setInterval(() => {
//   updateAnalogSnowballs(game);
// }, 60000, 'analog-tracking');

// Add icicle update to global game loop using TimerManager
const icicleTimerId = timerManager.setInterval(() => {
  updateIcicle(game);
}, 1000 / TIME_RATE, 'icicle-update'); // Scale interval with TIME_RATE for consistent game-time updates

// Store the timer ID globally so it can be cleared during meltdown
window.icicleInterval = icicleTimerId;
window.jumpButtonTimerId = jumpButtonTimerId;
// window.analogTrackingTimerId = analogTrackingTimerId; // No longer needed

// Start the passive income loop
// This runs the game tick loop with boost-aware SPS calculation
startTickLoop(game, calculateUnifiedSPS);

// Unified upgrade system handles all upgrade availability automatically
// No separate global upgrade checker needed

  // Patch GameStateFlat to update dashboard tables on display update
// Now compatible with the unified UI framework
const origUpdateDisplay = game.updateDisplay.bind(game);

// Add throttled update system for right column to prevent flashing
let lastRightColumnUpdate = 0;
const RIGHT_COLUMN_UPDATE_INTERVAL = 1000; // Update every 1 second to prevent flashing

// Add separate high-frequency update for SPS display
let lastSPSUpdate = 0;
const SPS_UPDATE_INTERVAL = 500; // Update SPS every 500ms for smooth display without flashing

game.updateDisplay = function() {
  try {
    origUpdateDisplay();
    renderDashboardTables(this);
    
    // If UI Manager is available, trigger dashboard update
    if (window.uiManager) {
      window.uiManager.queueUpdate('dashboard');
    }
    
    // Update SPS display frequently (not throttled)
    if (window.gameReadyUIManager) {
      const now = Date.now();
      if (now - lastSPSUpdate >= SPS_UPDATE_INTERVAL) {
        // Update SPS-related displays
        window.gameReadyUIManager.updateDashboardPerformance();
        window.gameReadyUIManager.updateMiniWallet();
        lastSPSUpdate = now;
      }
    }
    
    // Update GameReadyUIManager if available (throttled to prevent flashing)
    if (window.gameReadyUIManager) {
      const now = Date.now();
      if (now - lastRightColumnUpdate >= RIGHT_COLUMN_UPDATE_INTERVAL) {
        window.gameReadyUIManager.updateRightColumn();
        lastRightColumnUpdate = now;
      }
    }
  } catch (error) {
          // console.error('[MAIN] Error in updateDisplay override:', error);
    
    // Fallback: try to update through UI Manager only
    if (window.uiManager) {
      window.uiManager.queueUpdate('currency');
      window.uiManager.queueUpdate('dashboard');
      
      // Emit game state change event
      if (window.eventBus) {
        window.eventBus.emit('gameStateChanged', {
          snowballs: this.snowballs,
          lifetime: this.lifetimeSnowballs,
          currentAnalogSnowballs: this.currentAnalogSnowballs,
          sps: this.sps,
          snowflakes: this.snowflakes,
          analog: this.analogNumber
        });
      }
    }
  }
};

// Setup time tracking for achievements (check every 2 seconds instead of 1) using TimerManager
let lastTimeUpdate = game.getGameTime();
const timeTrackingTimerId = timerManager.setInterval(() => {
  updateTimePlayed(game);
  lastTimeUpdate = game.getGameTime();
}, 2000, 'time-tracking'); // Update every 2 seconds

// Add frequent achievement checking (every 1 second) using TimerManager
const achievementCheckTimerId = timerManager.setInterval(() => {
  if (game && game.achievements) {
    forceCheckAchievements(game);
  }
}, 1000, 'achievement-check'); // Check achievements every second

// Store timer IDs globally for potential cleanup
window.timeTrackingTimerId = timeTrackingTimerId;
window.achievementCheckTimerId = achievementCheckTimerId;

// Add main timer cleanup function
window.cleanupMainTimers = function() {
  // console.log('[MAIN] Cleaning up main timers...');
  const timerIds = [
    window.jumpButtonTimerId,
    window.analogTrackingTimerId, 
    window.icicleInterval, // Note: icicleInterval is the icicleTimerId
    window.timeTrackingTimerId,
    window.achievementCheckTimerId
  ];
  
  let cleanedCount = 0;
  timerIds.forEach((timerId, index) => {
    if (timerId && timerManager.clearTimer(timerId)) {
      cleanedCount++;
    }
  });
  
  // console.log(`[MAIN] Cleaned up ${cleanedCount} main timers`);
  return cleanedCount;
};

// Add comprehensive timer cleanup function
window.cleanupAllTimers = function() {
  // console.log('[MAIN] Starting comprehensive timer cleanup...');
  let totalCleaned = 0;
  
  // Main timers
  if (window.cleanupMainTimers) {
    totalCleaned += window.cleanupMainTimers();
  }
  
  // Analytics timers
  if (window.analyticsTracker && window.analyticsTracker.cleanup) {
    totalCleaned += window.analyticsTracker.cleanup();
  }
  if (window.progressTracker && window.progressTracker.cleanup) {
    totalCleaned += window.progressTracker.cleanup();
  }
  if (window.engagementAnalytics && window.engagementAnalytics.cleanup) {
    totalCleaned += window.engagementAnalytics.cleanup();
  }
  
  // Loop manager timers
  if (window.loopManager && window.loopManager.cleanup) {
    totalCleaned += window.loopManager.cleanup();
  }
  
  // Hybrid system timers
  if (window.cleanupYetiTimers) {
    totalCleaned += window.cleanupYetiTimers();
  }
  if (window.cleanupTravelSystem) {
    window.cleanupTravelSystem(); // This function doesn't return count
  }
  if (window.cleanupBattleSystem) {
    window.cleanupBattleSystem(); // This function doesn't return count
  }
  
  // Other system timers
  if (window.cleanupTickLoop) {
    window.cleanupTickLoop();
  }
  
  // Final TimerManager cleanup
  const remaining = timerManager.cleanup();
  totalCleaned += remaining;
  
  // Show performance metrics
  const metrics = timerManager.getPerformanceMetrics();
  // console.log('[MAIN] TimerManager Performance Summary:', metrics);
  
  // console.log(`[MAIN] Comprehensive cleanup complete. Total timers cleaned: ${totalCleaned}`);
  return totalCleaned;
};

// Add TimerManager debugging utilities
window.debugTimerManager = function() {
  // console.log('[TIMER_DEBUG] TimerManager Debug Information:');
  // console.log('[TIMER_DEBUG] Performance Metrics:', timerManager.getPerformanceMetrics());
  // console.log('[TIMER_DEBUG] Active Timers:', timerManager.getActiveTimers());
  // console.log('[TIMER_DEBUG] Frequency Groups:', timerManager.getFrequencyGroups());
};

// Add TimerManager test utilities
window.testTimerManager = async function() {
  // console.log('[TIMER_TEST] Starting TimerManager test suite...');
  
  // Import and run the test suite
  try {
    const { TimerManagerTest } = await import('./test/timerManagerTest.js');
    const tester = new TimerManagerTest();
    await tester.runAllTests();
    // console.log('[TIMER_TEST] Test suite completed successfully!');
  } catch (error) {
    console.error('[TIMER_TEST] Failed to run test suite:', error);
  }
};

// Setup achievement tracking for upgrades
// Override the original purchase functions to record achievements
const originalPurchaseFunctions = {
  boost: null,
  globalUpgrade: null,
  snowflakeUpgrade: null
};

// Track boost purchases
window.recordBoostPurchase = function() {
  recordUpgradePurchase(game, 'boost');
};

// Track global upgrade purchases
window.recordGlobalUpgradePurchase = function() {
  recordUpgradePurchase(game, 'global');
};

// Track snowflake upgrade purchases
window.recordSnowflakeUpgradePurchase = function() {
  recordUpgradePurchase(game, 'persistent');
};

// Track jump completions
window.recordJumpCompletion = function() {
  recordJump(game);
};

// ===== LOOP MANAGER DEBUGGING =====
// Make loop manager functions available for testing
window.enableLoopManagerDebug = function() {
  loopManager.setDebugMode(true);
  // console.log('[MAIN] Loop Manager debug mode enabled');
  // console.log('Available debug commands:');
  // console.log('  loopManager.getStatistics() - View system statistics');
  // console.log('  loopManager.reportPerformanceMetrics() - Force performance report');
  // console.log('  loopManager.pauseAll() / loopManager.resumeAll() - Pause/resume systems');
};

window.disableLoopManagerDebug = function() {
  loopManager.setDebugMode(false);
  // console.log('[MAIN] Loop Manager debug mode disabled');
};

// Function to enable full debug mode (both loop manager and event bus)
window.enableFullDebugMode = function() {
  loopManager.setDebugMode(true);
  eventBus.setDebugMode(true);
  // console.log('[MAIN] Full debug mode enabled - Loop Manager + Event Bus');
  // console.log('You will now see:');
  // console.log('  - System performance metrics');
  // console.log('  - All cross-system events');
  // console.log('  - Event routing and transformations');
  // console.log('  - Priority-based event processing');
};

// Function to disable full debug mode
window.disableFullDebugMode = function() {
  loopManager.setDebugMode(false);
  eventBus.setDebugMode(false);
  // console.log('[MAIN] Full debug mode disabled');
};

// Function to test currency display fix
window.testCurrencyDisplayFix = function() {
  // console.log('[TEST] Testing currency display fix...');
  
  try {
    // Test adding snowballs to trigger display update
    const oldSnowballs = game.snowballs;
    // console.log('[TEST] Current snowballs:', oldSnowballs);
    
    // Add some snowballs
    game.addSnowballs(1000, 'test');
    // console.log('[TEST] Added 1000 snowballs');
    
    // Check if display was updated
    const newSnowballs = game.snowballs;
    // console.log('[TEST] New snowballs:', newSnowballs);
    
    if (newSnowballs > oldSnowballs) {
      // console.log('[TEST] ✅ Currency display fix working correctly!');
      // console.log('[TEST] No more null reference errors should occur');
    } else {
      // console.log('[TEST] ❌ Currency display fix might not be working properly');
    }
    
    // Test UI Manager currency update
    if (window.uiManager) {
      // console.log('[TEST] Testing UI Manager currency update...');
      window.uiManager.queueUpdate('currency');
              // console.log('[TEST] ✅ UI Manager currency update queued');
    }
    
    // Test event bus emission
    if (window.eventBus) {
      // console.log('[TEST] Testing event bus emission...');
      eventBus.emit('gameStateChanged', {
        snowballs: game.snowballs,
        lifetime: game.lifetimeSnowballs,
        sps: game.sps
      });
              // console.log('[TEST] ✅ Event bus emission successful');
    }
    
    // console.log('[TEST] ✅ All currency display tests passed!');
    // console.log('[TEST] The TypeError: Cannot set properties of null error should be fixed');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error during currency display test:', error);
  }
};

// ===== STEP 6: PROGRESS TRACKING & PLAYER ENGAGEMENT TESTING =====

// Function to test progress tracking system
window.testProgressTracking = function() {
  // console.log('[TEST] Testing progress tracking system...');
  
  // Test basic progress tracking
  const summary = progressTracker.getProgressSummary();
  // console.log('Progress Summary:', summary);
  
  // Test analytics
  const analytics = progressTracker.getAnalytics();
  // console.log('Analytics:', analytics);
  
  // Test recommendations
  const recommendations = progressTracker.getRecommendations();
  // console.log('Recommendations:', recommendations);
  
  // console.log('[TEST] Progress tracking test complete');
};

// Momentum functions (accessible globally for hybrid systems)
// Using new AnalyticsTracker system
window.getMomentum = function() {
  return analyticsTracker.getMomentumScore();
};

window.getMomentumStats = function() {
  return analyticsTracker.getAnalyticsSummary().momentum;
};

window.isMomentumHigh = function(threshold = 7) {
  return analyticsTracker.getMomentumScore() >= threshold;
};

window.getMomentumEventMultiplier = function() {
  // Calculate event multiplier based on momentum (same logic as before)
  const momentum = analyticsTracker.getMomentumScore();
  return Math.max(1, 1 + (momentum * 0.1));
};

// Travel button functions (using new AnalyticsTracker)
window.getTravelButtonStatus = function() {
  return analyticsTracker.getTravelButtonStatus();
};

// Configuration functions for momentum system
window.setTravelUnlockTime = function(seconds) {
  if (analyticsTracker && analyticsTracker.setTravelUnlockTime) {
    analyticsTracker.setTravelUnlockTime(seconds);
  }
};

window.enableMomentumDebug = function() {
  if (analyticsTracker && analyticsTracker.enableDebugMode) {
    analyticsTracker.enableDebugMode();
  }
};

window.disableMomentumDebug = function() {
  if (analyticsTracker && analyticsTracker.disableDebugMode) {
    analyticsTracker.disableDebugMode();
  }
};

window.testMomentum = function() {
  // console.log('[TEST] Testing momentum system...');
  
  const stats = getMomentumStats();
  // console.log('Current momentum:', stats.current);
  // console.log('Momentum stats:', stats);
  // console.log('Is momentum high?', isMomentumHigh());
  // console.log('Event multiplier:', getMomentumEventMultiplier());
  
  // console.log('[TEST] Momentum test complete');
};

window.simulateMomentumActivity = function() {
  // console.log('[TEST] Simulating high momentum activity...');
  
  // Simulate rapid clicking
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      eventBus.emit('click', { value: 1, streak: i + 1 });
    }, i * 100);
  }
  
  // Simulate purchases
  setTimeout(() => {
    eventBus.emit('assistantPurchased', { assistantId: 'test' });
  }, 1200);
  
  setTimeout(() => {
    eventBus.emit('boostPurchased', { boostId: 'test' });
  }, 1500);
  
  setTimeout(() => {
    eventBus.emit('yetiSpotted', { yetiClass: 'test' });
  }, 1800);
  
  setTimeout(() => {
    console.log('Activity simulation complete. Check momentum with: testMomentum()');
  }, 2000);
};

// Function to test engagement analytics
window.testEngagementAnalytics = function() {
  // console.log('[TEST] Testing engagement analytics...');
  
  try {
    // Test real-time metrics
    // console.log('[TEST] Real-time engagement:', engagementAnalytics.realTime.currentEngagement);
    // console.log('[TEST] Real-time attention:', engagementAnalytics.realTime.currentAttention);
    // console.log('[TEST] Real-time motivation:', engagementAnalytics.realTime.currentMotivation);
    
    // Test personalized insights
    const personalizedInsights = engagementAnalytics.getPersonalizedInsights();
    // console.log('[TEST] ✅ Personalized Insights:', personalizedInsights);
    
    // Test interaction tracking
    // console.log('[TEST] Testing interaction tracking...');
    
    // Simulate a few clicks
    for (let i = 0; i < 5; i++) {
      eventBus.emit('click', {
        value: 10 + i,
        streak: i + 1,
        interval: 500 + Math.random() * 1000
      });
    }
    
    // Simulate a purchase
    eventBus.emit('assistantPurchased', {
      assistantId: 'additionalArm',
      cost: 100,
      deliberationTime: 2000
    });
    
    // console.log('[TEST] ✅ Interactions tracked successfully');
    
    // Test insights generation
    setTimeout(() => {
      engagementAnalytics.generateInsights();
      const insights = engagementAnalytics.insights;
      // console.log('[TEST] ✅ Generated Insights:', insights);
    }, 1000);
    
    // console.log('[TEST] ✅ Engagement analytics working correctly!');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error testing engagement analytics:', error);
  }
};

// NOTE: testMilestoneUnlocking function removed - milestone system replaced by achievement system

// Function to test player phase advancement
window.testPhaseAdvancement = function() {
  // console.log('[TEST] [DEPRECATED] Phase advancement system has been simplified');
  
  try {
    // DEPRECATED: Complex phase advancement has been replaced with simpler analytics
    // Use analytics to track player progress instead
    
    const analytics = analyticsTracker.getAnalyticsSummary();
    // console.log('[TEST] Current analytics summary:', analytics);
    
    // Show engagement metrics instead of phases
    // console.log('[TEST] Player engagement:');
    // console.log('  - Engagement Score:', analytics.engagement.score.toFixed(2));
    // console.log('  - Total Play Time:', analytics.engagement.totalPlayTime, 'seconds');
    // console.log('  - Session Length:', analytics.engagement.sessionLength.toFixed(1), 'minutes');
    // console.log('  - Momentum:', analytics.momentum.current.toFixed(1));
    
    // Show system usage distribution
    const systemUsage = analytics.systemUsage;
    const total = systemUsage.active + systemUsage.passive + systemUsage.hybrid;
    if (total > 0) {
      // console.log('[TEST] System Usage Distribution:');
      // console.log('  - Active (clicking):', ((systemUsage.active / total) * 100).toFixed(1) + '%');
      // console.log('  - Passive (assistants):', ((systemUsage.passive / total) * 100).toFixed(1) + '%');
      // console.log('  - Hybrid (yetis/travel):', ((systemUsage.hybrid / total) * 100).toFixed(1) + '%');
    }
    
    // console.log('[TEST] ✅ Analytics tracking working correctly');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error testing analytics system:', error);
  }
};

// Function to simulate player behavior for testing
window.simulatePlayerBehavior = function(duration = 30000) {
  // console.log('[TEST] Simulating player behavior for', duration / 1000, 'seconds...');
  
  try {
    let clickCount = 0;
    let purchaseCount = 0;
    
    // Simulate clicking behavior
    const clickInterval = setInterval(() => {
      const streak = Math.floor(clickCount / 5) + 1;
      const interval = 300 + Math.random() * 800;
      
      eventBus.emit('click', {
        value: 10 + Math.random() * 20,
        streak: streak,
        interval: interval
      });
      
      clickCount++;
      
      // Occasionally purchase assistants
      if (clickCount % 10 === 0 && Math.random() > 0.5) {
        eventBus.emit('assistantPurchased', {
          assistantId: 'additionalArm',
          cost: 100 * (purchaseCount + 1),
          deliberationTime: 1000 + Math.random() * 3000
        });
        purchaseCount++;
      }
      
      // Occasionally spot yetis
      if (clickCount % 15 === 0 && Math.random() > 0.7) {
        eventBus.emit('yetiSpotted', {
          yetiClass: 'Harvester'
        });
      }
      
    }, 500 + Math.random() * 1000);
    
    // Stop simulation after duration
    setTimeout(() => {
      clearInterval(clickInterval);
      // console.log('[TEST] ✅ Player behavior simulation completed');
      // console.log('[TEST] Generated:', clickCount, 'clicks,', purchaseCount, 'purchases');
      
      // Show updated analytics
      const summary = progressTracker.getProgressSummary();
      // console.log('[TEST] Updated Progress Summary:', summary);
      
      const analytics = engagementAnalytics.getAnalyticsSummary();
      // console.log('[TEST] Updated Analytics:', analytics);
      
    }, duration);
    
    // console.log('[TEST] ✅ Simulation started (will run for', duration / 1000, 'seconds)');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error during behavior simulation:', error);
  }
};

// Function to enable Step 6 debug mode
window.enableProgressTrackingDebug = function() {
  progressTracker.setDebugMode(true);
  engagementAnalytics.setDebugMode(true);
  // console.log('[MAIN] Step 6 debug mode enabled - Progress Tracking + Engagement Analytics');
  // console.log('Available debug commands:');
  // console.log('  testProgressTracking() - Test progress tracking system');
  // console.log('  testEngagementAnalytics() - Test engagement analytics');
      // NOTE: Milestone system removed - replaced by achievement system
  // console.log('  testPhaseAdvancement() - Test player phase advancement');
  // console.log('  simulatePlayerBehavior(duration) - Simulate player actions');
  // console.log('  progressTracker.getProgressSummary() - View progress summary');
  // console.log('  engagementAnalytics.getAnalyticsSummary() - View analytics');
};

// Function to disable Step 6 debug mode
window.disableProgressTrackingDebug = function() {
  progressTracker.setDebugMode(false);
  engagementAnalytics.setDebugMode(false);
  // console.log('[MAIN] Step 6 debug mode disabled');
};

// Function to get comprehensive Step 6 status
window.getStep6Status = function() {
  // console.log('[STEP 6] === Progress Tracking & Player Engagement Status ===');
  
  try {
    // Progress Tracker Status
    // console.log('\n[PROGRESS TRACKER]');
    const summary = progressTracker.getProgressSummary();
    // console.log('Current Phase:', summary.currentPhase);
    // console.log('Engagement Score:', summary.engagementScore.toFixed(2));
    // console.log('Total Play Time:', Math.floor(summary.totalPlayTime / 60), 'minutes');
    // console.log('System Preference:', summary.systemPreference);
    // NOTE: Milestone tracking removed - replaced by achievement system
    
    // Skill Development
    // console.log('\nSkill Development:');
    Object.entries(summary.skillDevelopment).forEach(([skill, level]) => {
      // console.log(`  ${skill}: ${(level * 100).toFixed(1)}%`);
    });
    
    // Engagement Analytics Status
    // console.log('\n[ENGAGEMENT ANALYTICS]');
    const analytics = engagementAnalytics.getAnalyticsSummary();
    // console.log('Real-time Engagement:', (analytics.realTime.currentEngagement * 100).toFixed(1) + '%');
    // console.log('Real-time Attention:', (analytics.realTime.currentAttention * 100).toFixed(1) + '%');
    // console.log('Real-time Motivation:', (analytics.realTime.currentMotivation * 100).toFixed(1) + '%');
    
    // Key Metrics
    // console.log('\nKey Metrics:');
    Object.entries(analytics.keyMetrics).forEach(([metric, value]) => {
      if (typeof value === 'number') {
        // console.log(`  ${metric}: ${(value * 100).toFixed(1)}%`);
      } else {
        // console.log(`  ${metric}: ${value}`);
      }
    });
    
    // Recent Recommendations
    const recommendations = progressTracker.getRecommendations();
    if (recommendations.length > 0) {
      // console.log('\nTop Recommendations:');
      recommendations.slice(0, 3).forEach((rec, index) => {
        // console.log(`  ${index + 1}. [${rec.type}] ${rec.message}`);
      });
    }
    
    // NOTE: Milestone display removed - replaced by achievement system
    
    // console.log('\n[STEP 6] === Status Complete ===');
    
    return {
      progressSummary: summary,
      analyticsSummary: analytics,
      recommendations: recommendations
    };
    
  } catch (error) {
    // console.error('[STEP 6] ❌ Error getting status:', error);
  }
};

// Function to test base class functionality
window.testBaseClasses = function() {
  // console.log('[TEST] Testing base class functionality...');
  
  try {
    // Test ActiveSystem
    // console.log('[TEST] Testing ActiveSystem...');
    const testActive = new ActiveSystem('test-active');
    // console.log('✅ ActiveSystem created successfully');
    
    // Test PassiveSystem
    // console.log('[TEST] Testing PassiveSystem...');
    const testPassive = new PassiveSystem('test-passive');
    // console.log('✅ PassiveSystem created successfully');
    
    // Test HybridSystem
    // console.log('[TEST] Testing HybridSystem...');
    const testHybrid = new HybridSystem('test-hybrid');
    // console.log('✅ HybridSystem created successfully');
    
    // console.log('[TEST] ✅ All base classes working correctly!');
    // console.log('[TEST] You can now create systems by extending these base classes');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error testing base classes:', error);
  }
};

// Function to test enhanced state management
window.testLoopState = function() {
  // console.log('[TEST] Testing enhanced loop state management...');
  
  try {
    // Test accessing loop state
    // console.log('[TEST] Testing loop state access...');
    const clickingState = game.getLoopState('active', 'clicking');
    // console.log('✅ Active clicking state:', clickingState);
    
    const assistantState = game.getLoopState('passive', 'assistants');
    // console.log('✅ Passive assistant state:', assistantState);
    
    const yetiState = game.getLoopState('hybrid', 'travel');
    // console.log('✅ Hybrid travel state:', yetiState);
    
    // Test recording interactions
    // console.log('[TEST] Testing interaction recording...');
    game.recordClick(100);
    // console.log('✅ Click recorded');
    
    game.recordAssistantPurchase('additionalArm', 1, 5);
    // console.log('✅ Assistant purchase recorded');
    
    game.recordYetiInteraction('Harvester', 'spawn', { location: 'test' });
    // console.log('✅ Yeti interaction recorded');
    
    // Test state updates
    // console.log('[TEST] Testing state updates...');
    game.updateLoopState('active', 'clicking', { 
      clickCombo: 5,
      customProperty: 'test'
    });
    // console.log('✅ Loop state updated');
    
    // console.log('[TEST] ✅ All loop state functionality working correctly!');
    // console.log('[TEST] Enhanced state structure is ready for use');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error testing loop state:', error);
  }
};

// Function to inspect current loop state
window.inspectLoopState = function() {
  // console.log('[INSPECT] Complete loop state structure:');
  // console.log('Active systems:', game.loops.active);
  // console.log('Passive systems:', game.loops.passive);
  // console.log('Hybrid systems:', game.loops.hybrid);
  
  return {
    active: game.loops.active,
    passive: game.loops.passive,
    hybrid: game.loops.hybrid
  };
};

// Function to compare old vs new state structures
window.compareStateStructures = function() {
  // console.log('[COMPARE] Legacy vs Enhanced State Comparison:');
  
  // console.log('Legacy structure (currentAnalog):');
  // console.log('  assistants:', game.currentAnalog.assistants);
  // console.log('  boosts:', game.currentAnalog.boosts);
  // console.log('  yetisSighted:', game.currentAnalog.yetisSighted);
  
  // console.log('Enhanced structure (loops):');
  // console.log('  passive.assistants.owned:', game.loops.passive.assistants.owned);
  // console.log('  passive.boosts.owned:', game.loops.passive.boosts.owned);
  // console.log('  hybrid.travel.sighted:', game.loops.hybrid.travel.sighted);
  
  return {
    legacy: {
      assistants: game.currentAnalog.assistants,
      boosts: game.currentAnalog.boosts,
      yetisSighted: game.currentAnalog.yetisSighted
    },
    enhanced: {
      assistants: game.loops.passive.assistants.owned,
      boosts: game.loops.passive.boosts.owned,
      yetisSighted: game.loops.hybrid.travel.sighted
    }
  };
};

// Function to test sync fixes
window.testSyncFixes = function() {
  // console.log('[TEST] Testing synchronization fixes...');
  
  try {
    // Test 1: Check initial sync state
    // console.log('[TEST] 1. Checking initial sync state...');
    const beforeAssistants = { ...game.currentAnalog.assistants };
    const beforeLoopAssistants = { ...game.loops.passive.assistants.owned };
    // console.log('✅ Before - Legacy assistants:', beforeAssistants);
    // console.log('✅ Before - Loop assistants:', beforeLoopAssistants);
    
    // Test 2: Direct property modification (should auto-sync via setter)
    // console.log('[TEST] 2. Testing setter auto-sync...');
    const oldCount = game.assistants.additionalArm || 0;
    game.assistants = { ...game.assistants, additionalArm: oldCount + 1 };
    // console.log('✅ After setter - Legacy assistants:', game.currentAnalog.assistants);  
    // console.log('✅ After setter - Loop assistants:', game.loops.passive.assistants.owned);
    
    // Test 3: Save/load cycle
    // console.log('[TEST] 3. Testing save/load sync...');
    game.save();
    // console.log('✅ Save completed with full sync');
    
    // console.log('[TEST] ✅ All sync fixes working correctly!');
    // console.log('[TEST] Assistant purchases should now work properly');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error testing sync fixes:', error);
  }
};

// Function to test enhanced event bus
window.testCrossSystemCommunication = function() {
  // console.log('[TEST] Testing cross-system communication...');
  
  try {
    // Test 1: System-specific channels
    // console.log('[TEST] 1. Testing system-specific channels...');
    
    let activeReceived = false;
    let passiveReceived = false;
    
    // Subscribe to active channel
    eventBus.on('testEvent', () => { activeReceived = true; }, 'TestSystem', { 
      systemType: 'active' 
    });
    
    // Subscribe to passive channel
    eventBus.on('testEvent', () => { passiveReceived = true; }, 'TestSystem', { 
      systemType: 'passive' 
    });
    
    // Emit to active only
    eventBus.emit('testEvent', { test: true }, { systemType: 'active', immediate: true });
    
    // console.log(`✅ Active received: ${activeReceived}, Passive received: ${passiveReceived}`);
    
    // Test 2: Cross-system helpers
    // console.log('[TEST] 2. Testing cross-system helpers...');
    
    let crossSystemReceived = false;
    eventBus.onCrossSystem('active', 'testCrossEvent', () => { 
      crossSystemReceived = true;
    }, 'TestCrossSystem');
    
    eventBus.activeToPassive('testCrossEvent', { data: 'test' });
    
    setTimeout(() => {
      // console.log(`✅ Cross-system event received: ${crossSystemReceived}`);
    }, 100);
    
    // Test 3: Event history
    // console.log('[TEST] 3. Testing event history...');
    const history = eventBus.getEventHistory();
    // console.log(`✅ Event history contains ${history.length} events`);
    // console.log('Recent events:', history.slice(-3).map(e => e.name));
    
    // Test 4: Priority events
    // console.log('[TEST] 4. Testing priority events...');
    const results = [];
    
    eventBus.on('priorityTest', () => results.push('normal'), 'TestNormal', { priority: 0 });
    eventBus.on('priorityTest', () => results.push('high'), 'TestHigh', { priority: 10 });
    eventBus.on('priorityTest', () => results.push('low'), 'TestLow', { priority: -5 });
    
    eventBus.emit('priorityTest', {}, { immediate: true });
    
    // console.log(`✅ Priority order: ${results.join(' -> ')} (should be: high -> normal -> low)`);
    
    // Test 5: Event statistics
    // console.log('[TEST] 5. Testing event statistics...');
    const stats = eventBus.getEventStats();
    // console.log('✅ Event Bus Statistics:');
    // console.log('  Channels:', Object.keys(stats.channels));
    // console.log('  Performance:', stats.performance);
    // console.log('  Queue:', stats.queue);
    // console.log('  Routes:', stats.routes);
    
    // console.log('[TEST] ✅ All cross-system communication tests passed!');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error testing cross-system communication:', error);
  }
};

// Function to test loop manager integration
window.testLoopManagerIntegration = function() {
  // console.log('[TEST] Testing Loop Manager integration...');
  
  try {
    // Test 1: Performance statistics
    // console.log('[TEST] 1. Testing performance statistics...');
    const perfStats = loopManager.getPerformanceStats();
    // console.log('✅ Performance stats:', perfStats);
    
    // Test 2: Cross-system routes
    // console.log('[TEST] 2. Testing cross-system routes...');
    
    let routeTriggered = false;
    eventBus.on('spsThresholdReached', (data) => {
      // console.log('✅ SPS threshold route triggered:', data);
      routeTriggered = true;
    }, 'TestRoute', { systemType: 'active' });
    
    // Simulate passive system triggering cross-system event
    eventBus.emit('spsThresholdReached', { sps: 50000 }, { 
      systemType: 'passive', 
      immediate: true 
    });
    
    setTimeout(() => {
      // console.log(`✅ Cross-system route worked: ${routeTriggered}`);
    }, 100);
    
    // Test 3: System communication
    // console.log('[TEST] 3. Testing system broadcasting...');
    loopManager.broadcastToSystemType('passive', 'testBroadcast', { test: true });
    // console.log('✅ System broadcast sent');
    
    // console.log('[TEST] ✅ All Loop Manager integration tests passed!');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error testing Loop Manager integration:', error);
  }
};

// Function to demonstrate cross-system communication patterns
window.demonstrateCrossSystemPatterns = function() {
  // console.log('[DEMO] Demonstrating cross-system communication patterns...');
  
  try {
    // Pattern 1: Active affects Passive
    // console.log('[DEMO] Pattern 1: Active click affects passive multipliers');
    eventBus.emit('clickComboAchieved', { combo: 10 }, { 
      systemType: 'active', 
      immediate: true 
    });
    
    // Pattern 2: Passive affects Hybrid
    // console.log('[DEMO] Pattern 2: High SPS triggers hybrid events');
    eventBus.emit('highSpsDetected', { sps: 1000000 }, { 
      systemType: 'passive', 
      immediate: true 
    });
    
    // Pattern 3: Hybrid affects All
    // console.log('[DEMO] Pattern 3: Location change affects all systems');
    eventBus.emit('locationChanged', { location: 'icyPeak' }, { 
      systemType: 'hybrid', 
      immediate: true 
    });
    
    // console.log('[DEMO] ✅ Cross-system patterns demonstrated!');
    // console.log('[DEMO] Check console for route transformations and effects');
    
  } catch (error) {
    // console.error('[DEMO] ❌ Error demonstrating patterns:', error);
  }
};

// ===== BASE SYSTEM CLASSES =====
// Make base classes available globally for future development
window.ActiveSystem = ActiveSystem;
window.PassiveSystem = PassiveSystem;
window.HybridSystem = HybridSystem;

// Example of how to create a new system using base classes:
/*
// Creating a new Active System:
class ClickComboSystem extends ActiveSystem {
  constructor() {
    super('clickCombo', { enableCombos: true });
  }
  
  processInput(inputType, inputData) {
    if (inputType === 'click') {
      const combo = this.getCombo();
      const multiplier = 1 + (combo * 0.1);
      return { multiplier, combo };
    }
    return false;
  }
}

// Creating a new Passive System:
class WeatherSystem extends PassiveSystem {
  calculateBaseOutput(game, deltaTime) {
    return (deltaTime / 1000) * 10; // 10 bonus per second
  }
  
  generateOutput(game, output, deltaTime) {
    game.addSnowballs(output, 'weather');
  }
}

// Creating a new Hybrid System:
class SeasonalEventSystem extends HybridSystem {
  processInput(inputType, inputData) {
    if (inputType === 'participate') {
      this.switchToActiveMode();
      return { participated: true };
    }
    return false;
  }
  
  updatePassiveMode(game, deltaTime) {
    // Background event preparation
  }
}

// Register with loop manager:
const comboSystem = new ClickComboSystem();
loopManager.registerSystem('active', 'clickCombo', comboSystem);
comboSystem.setup(game);
*/

// Log successful initialization
  // console.log('[MAIN] ✅ Step 5 Complete: Unified UI Framework');
  // console.log('[MAIN] 🎮 Systems registered:', loopManager.getStatistics());
  // console.log('[MAIN] 📚 Base classes available: ActiveSystem, PassiveSystem, HybridSystem');
  // console.log('[MAIN] 🗂️ Enhanced state structure: game.loops.{active/passive/hybrid}');
  // console.log('[MAIN] 🔄 Auto-sync: Legacy ↔ Loop state synchronized automatically');
  // console.log('[MAIN] 🌐 Event Bus: System channels, priorities, history, cross-system routes');
  // console.log('[MAIN] 🎨 UI Framework: Unified rendering, components, performance optimization');
  // console.log('[MAIN] 📊 UI Manager: Event-driven updates, batching, loop integration');
  // console.log('[MAIN] 🧩 Component Library: Cards, buttons, panels, notifications, progress bars');
  // console.log('[MAIN] 🔧 Debug commands:');
  // console.log('[MAIN]   enableFullDebugMode() - Enable all debugging (recommended)');
  // console.log('[MAIN]   enableLoopManagerDebug() - Enable loop manager debugging only');
  // console.log('[MAIN]   testBaseClasses() - Test base class functionality');
  // console.log('[MAIN]   testLoopState() - Test enhanced state management');
  // console.log('[MAIN]   testSyncFixes() - Test synchronization fixes');
  // console.log('[MAIN]   testCrossSystemCommunication() - Test event bus enhancements');
  // console.log('[MAIN]   testLoopManagerIntegration() - Test loop manager integration');
  // console.log('[MAIN]   demonstrateCrossSystemPatterns() - Demo communication patterns');
  // console.log('[MAIN]   testGlobalUpgradeSync() - Test global upgrade sync and display');
  // console.log('[MAIN]   testUnifiedUI() - Test unified UI framework');
  // console.log('[MAIN]   testComponentLibrary() - Test component library');
  // console.log('[MAIN]   enableUIDebugMode() / disableUIDebugMode() - Toggle UI debugging');
  // console.log('[MAIN]   inspectLoopState() - Inspect current loop state structure');
  // console.log('[MAIN]   compareStateStructures() - Compare legacy vs enhanced state');
  // console.log('[MAIN] 🚀 Ready for Step 6: Progress Tracking & Player Engagement');

/**
 * Test global upgrade sync and display
 */
window.testGlobalUpgradeSync = function() {
  // console.log('=== Testing Global Upgrade Sync ===');
  
  const beforeUpgrades = { ...game.globalUpgrades };
  const beforeLoopUpgrades = game.loops?.passive?.global?.globalUpgrades ? { ...game.loops.passive.global.globalUpgrades } : {};
  
  // console.log('Before test:');
  // console.log('Legacy globalUpgrades:', beforeUpgrades);
  // console.log('Loop state globalUpgrades:', beforeLoopUpgrades);
  
  // Test manual sync
  // console.log('Testing sync methods...');
  game.syncToLoopState();
  
  // console.log('After sync to loop state:');
  // console.log('Loop state globalUpgrades:', game.loops?.passive?.global?.globalUpgrades);
  
  // Test purchase recording
  if (game.recordGlobalUpgradePurchase) {
    // console.log('Testing purchase recording...');
    game.recordGlobalUpgradePurchase('testUpgrade', 100);
    
    // console.log('After purchase recording:');
    // console.log('Legacy globalUpgrades:', game.globalUpgrades);
    // console.log('Loop state globalUpgrades:', game.loops?.passive?.global?.globalUpgrades);
    // console.log('Statistics:', game.loops?.passive?.global?.statistics);
    
    // Clean up test
    delete game.globalUpgrades.testUpgrade;
    if (game.loops?.passive?.global?.globalUpgrades) {
      delete game.loops.passive.global.globalUpgrades.testUpgrade;
    }
  }
  
  // Test inventory display
  if (window.updateInventoryDisplay) {
    // console.log('Updating inventory display...');
    updateInventoryDisplay(game);
  }
  
  // console.log('Global upgrade sync test complete.');
};

/**
 * Test the unified UI framework
 */
window.testUnifiedUI = function() {
  // console.log('=== Testing Unified UI Framework ===');
  
  try {
    // Test 1: UI Manager initialization
    // console.log('[TEST] 1. Testing UI Manager...');
    // console.log('✅ UI Manager initialized:', !!window.uiManager);
    // console.log('✅ Containers registered:', uiManager.containers.size);
    // console.log('✅ Event listeners:', uiManager.updateQueue.size);
    
    // Test 2: Component Factory
    // console.log('[TEST] 2. Testing Component Factory...');
    
    // Create a test notification
    ComponentFactory.showNotification('UI Framework Test', 'success', 2000);
    
    // Create test components
    const testCard = ComponentFactory.createCard({
      textContent: 'Test Card Component',
      clickable: true,
      onClick: () => console.log('Card clicked!')
    });
    
    const testButton = ComponentFactory.createButton({
      textContent: 'Test Button',
      variant: 'primary',
      onClick: () => console.log('Button clicked!')
    });
    
    // console.log('✅ Test components created successfully');
    
    // Test 3: Force UI updates
    // console.log('[TEST] 3. Testing UI updates...');
    uiManager.forceUpdateAll();
    // console.log('✅ UI force update triggered');
    
    // Test 4: Performance metrics
    // console.log('[TEST] 4. Testing performance metrics...');
    const metrics = uiManager.getPerformanceMetrics();
    // console.log('✅ Performance metrics:', {
    //   totalUpdates: metrics.totalUpdates,
    //   averageUpdateTime: metrics.averageUpdateTime.toFixed(2) + 'ms',
    //   batchedUpdates: metrics.batchedUpdates
    // });
    
    // Test 5: Loop-specific features
    // console.log('[TEST] 5. Testing loop-specific features...');
    if (uiManager.getLoopPerformanceMetrics) {
      const loopMetrics = uiManager.getLoopPerformanceMetrics();
      // console.log('✅ Loop metrics:', loopMetrics.loopComponents);
    }
    
    // Test 6: Component stats
    // console.log('[TEST] 6. Testing component statistics...');
    const stats = uiManager.getComponentStats();
    // console.log('✅ Component stats:', stats);
    
    // console.log('[TEST] ✅ All UI Framework tests passed!');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error testing UI Framework:', error);
  }
};

/**
 * Test component library
 */
window.testComponentLibrary = function() {
  // console.log('=== Testing Component Library ===');
  
  try {
    // Test different component types
    // console.log('[TEST] Creating test components...');
    
    // Create a test container in the dashboard
    const dashboard = document.getElementById('dashboard-content');
    if (dashboard) {
      // Create a test panel
      const testPanel = ComponentFactory.createSystemPanel({
        title: 'UI Framework Test',
        collapsible: true
      });
      
      // Add test components to the panel
      const statDisplay = ComponentFactory.createStatDisplay({
        label: 'Test Metric',
        value: 42.5,
        format: 'number',
        color: '#2196F3'
      });
      
      const progressBar = ComponentFactory.createProgressBar({
        value: 75,
        max: 100,
        color: '#4CAF50',
        showText: true
      });
      
      const button = ComponentFactory.createButton({
        textContent: 'Test Action',
        variant: 'success',
        onClick: () => {
          ComponentFactory.showNotification('Button clicked!', 'success');
          progressBar.updateProgress(Math.random() * 100);
          statDisplay.updateStat(Math.random() * 100);
        }
      });
      
      testPanel.addComponent(statDisplay);
      testPanel.addComponent(progressBar);
      testPanel.addComponent(button);
      
      dashboard.appendChild(testPanel.createElement());
      
      // console.log('✅ Test components added to dashboard');
      
      // Clean up after 10 seconds
      setTimeout(() => {
        testPanel.destroy();
        // console.log('✅ Test components cleaned up');
      }, 10000);
    }
    
    // Test notifications
    setTimeout(() => ComponentFactory.showNotification('Info notification', 'info'), 1000);
    setTimeout(() => ComponentFactory.showNotification('Warning notification', 'warning'), 2000);
    setTimeout(() => ComponentFactory.showNotification('Error notification', 'error'), 3000);
    
    // console.log('[TEST] ✅ Component library test complete!');
    
  } catch (error) {
    // console.error('[TEST] ❌ Error testing component library:', error);
  }
};

/**
 * Enable UI debug mode
 */
window.enableUIDebugMode = function() {
  if (window.uiManager) {
    uiManager.setDebugMode(true);
    // console.log('✅ UI Debug mode enabled');
  } else {
    // console.warn('❌ UI Manager not available');
  }
};

/**
 * Disable UI debug mode
 */
window.disableUIDebugMode = function() {
  if (window.uiManager) {
    uiManager.setDebugMode(false);
    // console.log('✅ UI Debug mode disabled');
  } else {
    // console.warn('❌ UI Manager not available');
  }
};

// ===== STEP 6 COMPLETION MESSAGE =====
// console.log('');
// console.log('[MAIN] ========================================');
// console.log('[MAIN] 🎯 Step 6: Progress Tracking & Player Engagement Complete!');
// console.log('[MAIN] ========================================');
// console.log('[MAIN] ✅ Progress Tracker: Comprehensive tracking across Active/Passive/Hybrid systems');
// console.log('[MAIN] ✅ Engagement Analytics: Real-time behavior analysis and insights');
    // console.log('[MAIN] ✅ Achievement System: Comprehensive achievement tracking with 80+ achievements');
// console.log('[MAIN] ✅ Player Journey: Phase progression from beginner to expert');
// console.log('[MAIN] ✅ Real-time Metrics: Attention, motivation, flow, and engagement tracking');
// console.log('[MAIN] ✅ Personalized Insights: Adaptive recommendations based on player behavior');
// console.log('[MAIN] ✅ Data Persistence: Progress and analytics saved with game state');
// console.log('[MAIN] ✅ Event Integration: Seamless tracking of all player interactions');
// console.log('[MAIN]');
// console.log('[MAIN] 🎮 Available Step 6 commands:');
// console.log('[MAIN]   testProgressTracking() - Test progress tracking system');
// console.log('[MAIN]   testEngagementAnalytics() - Test engagement analytics');
    // NOTE: Milestone testing removed - replaced by achievement system
// console.log('[MAIN]   testPhaseAdvancement() - Test player phase advancement');
// console.log('[MAIN]   simulatePlayerBehavior(30000) - Simulate player activity');
// console.log('[MAIN]   enableProgressTrackingDebug() - Enable Step 6 debug mode');
// console.log('[MAIN]   getStep6Status() - View comprehensive progress status');
// console.log('[MAIN]');
// console.log('[MAIN] 📊 Quick Start - Try these commands:');
// console.log('[MAIN]   getStep6Status() - See current player progress and engagement');
// console.log('[MAIN]   simulatePlayerBehavior(10000) - Generate 10 seconds of activity');
// console.log('[MAIN]   progressTracker.getRecommendations() - Get personalized recommendations');
// console.log('[MAIN]');
// console.log('[MAIN] 🚀 ALL 6 STEPS COMPLETE! Active/Passive/Hybrid Architecture Implemented');
// console.log('[MAIN]   Step 1: ✅ Loop Manager (Central coordination)');
// console.log('[MAIN]   Step 2: ✅ Base Classes (Consistent interfaces)');
// console.log('[MAIN]   Step 3: ✅ Enhanced State Management (Structured data)');
// console.log('[MAIN]   Step 4: ✅ Cross-System Communication (Advanced event bus)');
// console.log('[MAIN]   Step 5: ✅ Unified UI Framework (Consistent rendering)');
// console.log('[MAIN]   Step 6: ✅ Progress Tracking & Engagement (Player analytics)');
// console.log('[MAIN] ========================================'); 

// Simple systems are now initialized directly - no fallback functions needed

// Travel system testing functions
window.testTravel = function() {
  // console.log('[TEST] Testing travel system...');
  
  const status = getTravelButtonStatus();
  // console.log('Travel button status:', status);
  
  const momentum = getMomentum();
  // console.log('Current momentum:', momentum);
  
  const momentumStats = getMomentumStats();
  // console.log('Momentum stats:', momentumStats);
  
  // console.log('[TEST] Travel system test complete');
};

// Travel system testing functions - REMOVED - replaced with simple system

window.getAllSystemStatus = function() {
  // console.log('[TEST] Getting all system status...');
  
  // console.log('=== MOMENTUM ===');
  // console.log('Current momentum:', getMomentum());
  // console.log('Momentum stats:', getMomentumStats());
  
  // console.log('=== TRAVEL ===');
  // console.log('Travel status:', getTravelButtonStatus());
  
  // console.log('=== ANALYTICS TRACKING ===');
  // console.log('Analytics summary:', analyticsTracker.getAnalyticsSummary());
  
  // console.log('=== LOOP MANAGER ===');
  // console.log('Loop manager stats:', getLoopManagerStats());
  
  // console.log('[TEST] System status complete');
};

// ===== LOCATION TRAVEL SYSTEM TEST =====
/**
 * Test the location travel system
 */
function testLocationTravelSystem() {
  // console.log('\n=== LOCATION TRAVEL SYSTEM TEST ===');
  
  // Test travel button status
  // console.log('1. Testing travel button status...');
  const travelStatus = getTravelButtonStatus();
  // console.log('Travel button status:', travelStatus);
  
  // Test location buff activation
  // console.log('2. Testing location buff activation...');
  const testLocation = {
    id: 'frostPeak',
    class: 'Harvester',
    name: 'Frost Peak',
    description: 'Where frozen time fuels the harvest of ancient snowballs.',
    colorTheme: 'green',
    passiveBonus: {
      effectType: 'snowballRate',
      value: 0.10,
      duration: 60
    }
  };
  
  const activated = activateLocationBuff(testLocation);
  console.log('Location buff activated:', activated);
  
  // Test location buff status
  console.log('3. Testing location buff status...');
  const locationBuff = game.currentLocationBuff;
  console.log('Current location buff:', locationBuff);
  
  // Test progress tracking
  console.log('4. Testing progress tracking...');
  if (progressTracker) {
    const locationStats = progressTracker.progress.hybrid.locations;
    console.log('Location statistics:', locationStats);
  }
  
  // Test location buff remaining time
  console.log('5. Testing location buff remaining time...');
  const remainingTime = getLocationBuffRemainingTime();
  console.log('Remaining time:', remainingTime + 's');
  
  // Test travel UI update
  console.log('6. Testing travel UI update...');
  updateTravelUI();
  console.log('Travel UI updated');
  
  // Test location visit tracking
  console.log('7. Testing location visit tracking...');
  if (progressTracker && progressTracker.progress.hybrid.locations.visits) {
    const visits = progressTracker.progress.hybrid.locations.visits;
    console.log('Location visits:', visits);
  }
  
  // Test location buff and yeti buff stacking
  console.log('8. Testing buff stacking...');
  // console.log('Current yeti buff:', game.currentYetiBuff);
  // console.log('Current location buff:', game.currentLocationBuff);
  // console.log('Both buffs can be active simultaneously:', !!(game.currentYetiBuff && game.currentLocationBuff));
  
  console.log('\n=== Location Travel System Test Complete ===');
  
  return {
    travelStatus: travelStatus,
    locationBuff: locationBuff,
    remainingTime: remainingTime,
    testPassed: activated
  };
}

// Make test function globally available
window.testLocationTravelSystem = testLocationTravelSystem;

// -------------------------------
// Buff Stacking Test Functions
// -------------------------------

/**
 * Test the buff stacking system with comprehensive scenarios
 * @param {GameStateFlat} game - The current game state object
 */
function testBuffStacking(game) {
  console.log('\n=== BUFF STACKING TEST ===');
  console.log('Testing the combination of yeti and location buffs...\n');
  
  // Clear any existing buffs
  game.currentYetiBuff = null;
  game.currentLocationBuff = null;
  game.classX2Buff = 1;
  
  // Test 1: Individual buffs (should not stack)
  console.log('TEST 1: Individual buffs (no stacking)');
  console.log('----------------------------------------');
  
  // Activate only yeti buff
  console.log('1a. Activating Harvester yeti buff only...');
  if (window.activateYetiBuff) {
    window.activateYetiBuff(game, 'Harvester');
  }
  
  let stackingStatus = game.getBuffStackingStatus();
  console.log('Stacking status:', stackingStatus);
  console.log('Expected: No stacking (multiplier = 1)');
  console.log('Actual:', stackingStatus.isStacking ? 'STACKING' : 'NOT STACKING', `(multiplier = ${stackingStatus.multiplier})`);
  
  // Clear buffs
  game.currentYetiBuff = null;
  game.currentLocationBuff = null;
  game.classX2Buff = 1;
  
  // Test 2: Same class buffs (should stack)
  console.log('\nTEST 2: Same class buffs (should stack)');
  console.log('----------------------------------------');
  
  // Record initial state
  const initialSnowballs = Number(game.snowballs);
  const initialTravelDiscount = game.travelDiscountGlobalUpgrades;
  
  console.log('2a. Activating Harvester yeti buff...');
  if (window.activateYetiBuff) {
    window.activateYetiBuff(game, 'Harvester');
  }
  
  const afterYetiSnowballs = Number(game.snowballs);
  const yetiEffectAmount = afterYetiSnowballs - initialSnowballs;
  console.log(`Yeti effect: Added ${yetiEffectAmount.toExponential(2)} snowballs`);
  
  console.log('2b. Activating Harvester location buff...');
  if (window.testLocationEffect) {
    window.testLocationEffect(game, 'Harvester');
  }
  
  const afterBothSnowballs = Number(game.snowballs);
  const totalEffectAmount = afterBothSnowballs - initialSnowballs;
  console.log(`Total effect: Added ${totalEffectAmount.toExponential(2)} snowballs`);
  
  stackingStatus = game.getBuffStackingStatus();
  console.log('Stacking status:', stackingStatus);
  console.log('Expected: Stacking active (multiplier = 2)');
  console.log('Actual:', stackingStatus.isStacking ? 'STACKING' : 'NOT STACKING', `(multiplier = ${stackingStatus.multiplier})`);
  
  // Check if yeti effect was doubled
  const expectedStackedSnowballs = initialSnowballs + (yetiEffectAmount * 2);
  const actualStackedSnowballs = afterBothSnowballs;
  console.log(`Expected total snowballs: ${expectedStackedSnowballs.toExponential(2)}`);
  console.log(`Actual total snowballs: ${actualStackedSnowballs.toExponential(2)}`);
  
  // Check location effect stacking
  console.log(`Travel discount multiplier: ${game.travelDiscountGlobalUpgrades} (should be 0.8 for 20% discount)`);
  
  // Clear buffs
  game.currentYetiBuff = null;
  game.currentLocationBuff = null;
  game.classX2Buff = 1;
  
  // Test 3: Different class buffs (should not stack)
  console.log('\nTEST 3: Different class buffs (should not stack)');
  console.log('------------------------------------------------');
  
  console.log('3a. Activating Harvester yeti buff...');
  if (window.activateYetiBuff) {
    window.activateYetiBuff(game, 'Harvester');
  }
  
  console.log('3b. Activating Defender location buff...');
  if (window.testLocationEffect) {
    window.testLocationEffect(game, 'Defender');
  }
  
  stackingStatus = game.getBuffStackingStatus();
  console.log('Stacking status:', stackingStatus);
  console.log('Expected: No stacking (different classes)');
  console.log('Actual:', stackingStatus.isStacking ? 'STACKING' : 'NOT STACKING', `(multiplier = ${stackingStatus.multiplier})`);
  
  // Clear buffs
  game.currentYetiBuff = null;
  game.currentLocationBuff = null;
  game.classX2Buff = 1;
  
  console.log('\nBUFF STACKING TEST COMPLETE!');
  console.log('=====================================\n');
  
  return {
    testPassed: true,
    finalStackingStatus: stackingStatus
  };
}

/**
 * Test buff stacking with all class combinations
 * @param {GameStateFlat} game - The current game state object
 */
function testAllClassStacking(game) {
  console.log('\n=== ALL CLASS STACKING TEST ===');
  console.log('Testing stacking for all class combinations...\n');
  
  const classes = ['Harvester', 'Defender', 'Traveler', 'Scholar'];
  
  for (const className of classes) {
    console.log(`\n--- Testing ${className} Class Stacking ---`);
    
    // Clear any existing buffs
    game.currentYetiBuff = null;
    game.currentLocationBuff = null;
    game.classX2Buff = 1;
    
    // Activate yeti buff
    console.log(`1. Activating ${className} yeti buff...`);
    if (window.activateYetiBuff) {
      window.activateYetiBuff(game, className);
    }
    
    // Activate location buff
    console.log(`2. Activating ${className} location buff...`);
    if (window.testLocationEffect) {
      window.testLocationEffect(game, className);
    }
    
    // Check stacking
    const stackingStatus = game.getBuffStackingStatus();
    console.log(`3. Stacking status: ${stackingStatus.isStacking ? 'ACTIVE' : 'INACTIVE'} (multiplier = ${stackingStatus.multiplier})`);
    
    if (stackingStatus.isStacking) {
      console.log(`   ✓ ${className} class stacking working correctly`);
    } else {
      console.log(`   ✗ ${className} class stacking failed`);
    }
    
    // Clear buffs
    game.currentYetiBuff = null;
    game.currentLocationBuff = null;
    game.classX2Buff = 1;
  }
  
  console.log('\nALL CLASS STACKING TEST COMPLETE!');
  console.log('==================================\n');
}

/**
 * Test buff expiration and stacking deactivation
 * @param {GameStateFlat} game - The current game state object
 */
function testBuffExpirationStacking(game) {
  console.log('\n=== BUFF EXPIRATION STACKING TEST ===');
  console.log('Testing stacking deactivation when buffs expire...\n');
  
  // Clear any existing buffs
  game.currentYetiBuff = null;
  game.currentLocationBuff = null;
  game.classX2Buff = 1;
  
  // Activate same class buffs
  console.log('1. Activating Harvester yeti buff...');
  if (window.activateYetiBuff) {
    window.activateYetiBuff(game, 'Harvester');
  }
  
  console.log('2. Activating Harvester location buff...');
  if (window.testLocationEffect) {
    window.testLocationEffect(game, 'Harvester');
  }
  
  let stackingStatus = game.getBuffStackingStatus();
  console.log('3. Initial stacking status:', stackingStatus.isStacking ? 'ACTIVE' : 'INACTIVE');
  
  // Simulate yeti buff expiration
  console.log('4. Simulating yeti buff expiration...');
  game.currentYetiBuff = null;
  game.checkBuffStacking();
  
  stackingStatus = game.getBuffStackingStatus();
  console.log('5. Stacking status after yeti expiration:', stackingStatus.isStacking ? 'ACTIVE' : 'INACTIVE');
  console.log('   Expected: INACTIVE (only location buff remaining)');
  
  // Simulate location buff expiration
  console.log('6. Simulating location buff expiration...');
  game.currentLocationBuff = null;
  game.checkBuffStacking();
  
  stackingStatus = game.getBuffStackingStatus();
  console.log('7. Final stacking status:', stackingStatus.isStacking ? 'ACTIVE' : 'INACTIVE');
  console.log('   Expected: INACTIVE (no buffs remaining)');
  
  console.log('\nBUFF EXPIRATION STACKING TEST COMPLETE!');
  console.log('========================================\n');
  
  return {
    testPassed: !stackingStatus.isStacking,
    finalStackingStatus: stackingStatus
  };
}

// Make test functions globally available
window.testBuffStacking = testBuffStacking;
window.testAllClassStacking = testAllClassStacking;
window.testBuffExpirationStacking = testBuffExpirationStacking;

/**
 * Test function to activate specific yeti and location buffs for manual testing
 * @param {GameStateFlat} game - The current game state object
 * @param {string} yetiClass - The yeti class to activate (Harvester, Defender, Traveler, Scholar)
 * @param {string} locationClass - The location class to activate (Harvester, Defender, Traveler, Scholar)
 */
function testStackingEffects(game, yetiClass, locationClass) {
  console.log(`\n=== MANUAL STACKING TEST ===`);
  console.log(`Testing ${yetiClass} yeti + ${locationClass} location combination...\n`);
  
  // Clear any existing buffs first
  console.log('1. Clearing existing buffs...');
  game.currentYetiBuff = null;
  game.currentLocationBuff = null;
  game.classX2Buff = 1;
  
  // Record initial state
  const initialSnowballs = Number(game.snowballs);
  const initialAssistants = Object.values(game.assistants || {}).reduce((sum, count) => sum + count, 0);
  const initialIcicles = game.icicles || 0;
  const initialSnowflakes = game.snowflakes || 0;
  
  console.log('Initial state:');
  console.log(`  Snowballs: ${initialSnowballs.toExponential(2)}`);
  console.log(`  Total Assistants: ${initialAssistants}`);
  console.log(`  Icicles: ${initialIcicles}`);
  console.log(`  Snowflakes: ${initialSnowflakes}`);
  
  // Activate yeti buff
  console.log(`\n2. Activating ${yetiClass} yeti buff...`);
  if (window.activateYetiBuff) {
    const yetiSuccess = window.activateYetiBuff(game, yetiClass);
    if (yetiSuccess) {
      console.log(`   ✓ ${yetiClass} yeti buff activated`);
    } else {
      console.log(`   ✗ Failed to activate ${yetiClass} yeti buff`);
      return false;
    }
  } else {
    console.log('   ✗ activateYetiBuff function not available');
    return false;
  }
  
  // Activate location buff
  console.log(`\n3. Activating ${locationClass} location buff...`);
  if (window.testLocationEffect) {
    const locationSuccess = window.testLocationEffect(game, locationClass);
    if (locationSuccess) {
      console.log(`   ✓ ${locationClass} location buff activated`);
    } else {
      console.log(`   ✗ Failed to activate ${locationClass} location buff`);
      return false;
    }
  } else {
    console.log('   ✗ testLocationEffect function not available');
    return false;
  }
  
  // Check final stacking status
  console.log('\n4. Final Status:');
  const stackingStatus = game.getBuffStackingStatus();
  console.log(`   Stacking: ${stackingStatus.isStacking ? 'ACTIVE' : 'INACTIVE'} (multiplier = ${stackingStatus.multiplier})`);
  console.log(`   Yeti Class: ${stackingStatus.yetiClass || 'None'}`);
  console.log(`   Location Class: ${stackingStatus.locationClass || 'None'}`);
  
  if (yetiClass === locationClass) {
    console.log(`   Expected: STACKING (same class: ${yetiClass})`);
  } else {
    console.log(`   Expected: NOT STACKING (different classes: ${yetiClass} vs ${locationClass})`);
  }
  
  // Show current multipliers
  console.log('\n5. Current Effect Multipliers:');
  console.log(`   Global Upgrades: ${game.travelDiscountGlobalUpgrades || 1} ${game.travelDiscountGlobalUpgrades < 1 ? '(discount active)' : ''}`);
  console.log(`   Assistants: ${game.travelDiscountAssistants || 1} ${game.travelDiscountAssistants < 1 ? '(discount active)' : ''}`);
  console.log(`   SPS: ${game.travelSPSMultiplier || 1} ${game.travelSPSMultiplier > 1 ? '(bonus active)' : ''}`);
  console.log(`   Boosts: ${game.travelDiscountBoosts || 1} ${game.travelDiscountBoosts < 1 ? '(discount active)' : ''}`);
  
  // Show resource changes
  const finalSnowballs = Number(game.snowballs);
  const finalAssistants = Object.values(game.assistants || {}).reduce((sum, count) => sum + count, 0);
  const finalIcicles = game.icicles || 0;
  const finalSnowflakes = game.snowflakes || 0;
  
  console.log('\n6. Resource Changes:');
  console.log(`   Snowballs: ${(finalSnowballs - initialSnowballs).toExponential(2)} added`);
  console.log(`   Assistants: ${finalAssistants - initialAssistants} added`);
  console.log(`   Icicles: ${finalIcicles - initialIcicles} added`);
  console.log(`   Snowflakes: ${finalSnowflakes - initialSnowflakes} added`);
  
  console.log('\n=== MANUAL TEST SETUP COMPLETE ===');
  console.log('You can now test the UI with these active buffs!');
  console.log('=========================================\n');
  
  return {
    yetiClass: yetiClass,
    locationClass: locationClass,
    stackingActive: stackingStatus.isStacking,
    stackingMultiplier: stackingStatus.multiplier,
    resourceChanges: {
      snowballs: finalSnowballs - initialSnowballs,
      assistants: finalAssistants - initialAssistants,
      icicles: finalIcicles - initialIcicles,
      snowflakes: finalSnowflakes - initialSnowflakes
    }
  };
}

// Make test function globally available
window.testStackingEffects = testStackingEffects;

// Make icicle functions globally available
window.updateIcicle = updateIcicle;
window.getIcicleCount = getIcicleCount;
window.addIcicles = addIcicles;
window.spendIcicles = spendIcicles;

// Test TimerManager functionality
window.testTimerManager = () => {
  // console.log('[TIMER_DEBUG] TimerManager Debug Information:');
  // console.log('[TIMER_DEBUG] Performance Metrics:', timerManager.getPerformanceMetrics());
  // console.log('[TIMER_DEBUG] Active Timers:', timerManager.getActiveTimers());
  // console.log('[TIMER_DEBUG] Frequency Groups:', timerManager.getFrequencyGroups());
  
  // Run the test suite
  // console.log('[TIMER_TEST] Starting TimerManager test suite...');
  
  const testResults = timerManager.runTestSuite();
  
  if (testResults.success) {
    // console.log('[TIMER_TEST] Test suite completed successfully!');
  } else {
    console.error('[TIMER_TEST] Test suite failed:', testResults.errors);
  }
  
  return testResults;
};

// Test progress tracking system
window.testProgressTracking = () => {
  // console.log('[TEST] Testing progress tracking system...');
  
  const summary = window.progressTracker.getProgressSummary();
  const analytics = window.progressTracker.getAnalytics();
  const recommendations = window.progressTracker.getRecommendations();
  
  // console.log('Progress Summary:', summary);
  // console.log('Analytics:', analytics);
  // console.log('Recommendations:', recommendations);
  
  // console.log('[TEST] Progress tracking test complete');
  
  return { summary, analytics, recommendations };
};

// Test momentum system
window.testMomentum = () => {
  // console.log('[TEST] Testing momentum system...');
  
  const stats = window.analyticsTracker.momentum.getStats();
  const isHigh = isMomentumHigh();
  const multiplier = getMomentumEventMultiplier();
  
  // console.log('Current momentum:', stats.current);
  // console.log('Momentum stats:', stats);
  // console.log('Is momentum high?', isMomentumHigh());
  // console.log('Event multiplier:', getMomentumEventMultiplier());
  
  // console.log('[TEST] Momentum test complete');
  
  return { stats, isHigh, multiplier };
};

// Simulate high momentum activity
window.simulateHighMomentum = () => {
  // console.log('[TEST] Simulating high momentum activity...');
  
  // Simulate rapid clicking
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      window.analyticsTracker.momentum.recordActivity('click', 1);
    }, i * 10);
  }
  
  // Simulate rapid upgrades
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      window.analyticsTracker.momentum.recordActivity('upgrade', 1);
    }, i * 100);
  }
  
  // Simulate rapid achievements
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      window.analyticsTracker.momentum.recordActivity('achievement', 1);
    }, i * 200);
  }
  
  // console.log('Activity simulation complete. Check momentum with: testMomentum()');
};

// Fallback functions for when travel system is not yet initialized
window.updateTravelUI = function() {
  // console.log('[MAIN] updateTravelUI not yet initialized by travel system');
  return false;
};

window.getTravelButtonStatus = function() {
  // console.log('[MAIN] getTravelButtonStatus not yet initialized by travel system');
  return { 
    unlocked: false, 
    progress: 0,
    progressPercentage: '0.0',
    currentMomentum: 0,
    averageMomentum: 0,
    estimatedTimeToUnlock: Infinity,
    progressHistory: []
  };
};

window.resetTravelButton = function() {
  // console.log('[MAIN] resetTravelButton not yet initialized by travel system');
  return false;
};

// Initialize systems
setupBattleSystem(game);                // Battle system
initializeSimpleActivityCounter();      // Simple activity counter (replaces complex momentum)
initializeSimpleTravel();               // Simple travel system (replaces complex travel)

// Simple system test functions
window.testSimpleActivity = function() {
  if (window.testActivityCounter) {
    window.testActivityCounter();
  } else {

  }
};

window.testSimpleTravel = function() {
  if (window.testSimpleTravel) {
    window.testSimpleTravel();
  } else {

  }
};

window.getSimpleStatus = function() {
  if (window.getActivityStatus) {
    const status = window.getActivityStatus();

    return status;
  } else {
    
    return null;
  }
};
