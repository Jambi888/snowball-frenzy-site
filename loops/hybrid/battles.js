/**
 * =====================================================================
 * BATTLES SYSTEM - Evil Yeti Combat after Travel
 * =====================================================================
 * 
 * This module implements a comprehensive battle system that triggers
 * after player travel completion. The system includes:
 * 
 * CORE FEATURES:
 * - Battle enable/disable toggle UI
 * - Evil yeti spawning with configurable probability
 * - Bell curve-based power calculation for balanced encounters
 * - Class advantage system for strategic depth
 * - Resource stealing penalties for losses
 * - Ability belt progression for victories
 * - Resource protection to prevent negative values
 * 
 * BATTLE PHASES IMPLEMENTED:
 * 
 * Phase A: Basic battle spawning and UI
 * Phase B: Engagement mechanics and debuff system
 * Phase C: Bell curve power calculation and reveal system
 * Phase D: Battle resolution and victory/defeat outcomes
 * Phase E: Class advantage system with instant wins and rewards
 * 
 * STRATEGIC MECHANICS:
 * - Battles can occur regardless of resource amounts
 * - Evil yetis spawn with power based on bell curve distribution
 * - Class advantages provide instant wins and snowball rewards
 * - Stacked class buffs (yeti + location) provide 2x rewards
 * - Defeats result in resource theft based on evil yeti class
 * 
 * REWARD/PENALTY SYSTEM:
 * 
 * BATTLE OUTCOMES (4 Conditions):
 * 
 * 1. NORMAL WIN (No Buff Matches)
 *    - Condition: Player snowballs ≥ Yeti power, no class advantage
 *    - Rewards: Ability Belt Level +1, Snowball reward = Yeti power
 *    - Win Type: 'normal' / 'powerVictory'
 *    - Note: Ability Belt Level is a future enhancement, currently provides no gameplay benefit
 * 
 * 2. WIN WITH ONE BUFF MATCH
 *    - Condition: Player snowballs ≥ Yeti power + Yeti OR Location buff of opposite class
 *    - Rewards: Ability Belt Level +1, Snowball reward = Yeti power × 2
 *    - Win Type: 'class_advantage' / 'classAdvantage'
 * 
 * 3. WIN WITH TWO BUFF MATCHES (Triple Reward)
 *    - Condition: Player snowballs ≥ Yeti power + BOTH Yeti AND Location buff of opposite class
 *    - Rewards: Ability Belt Level +1, Snowball reward = Yeti power × 3
 *    - Win Type: 'class_advantage' / 'classAdvantage' (with triple reward flag)
 * 
 * 4. LOSS
 *    - Condition: Player snowballs < Yeti power
 *    - Penalties (by Evil Yeti class):
 *      * Siphon: Steal 5% of snowballs
 *      * Assailant: Steal 1 random assistant
 *      * Anchor: Steal 1 snowflake
 *      * Scrambler: Steal 1 icicle
 *    - Loss Type: 'penalty'
 * 
 * CLASS ADVANTAGE SYSTEM:
 * Evil Yeti Class → Player Advantage Class
 * - Siphon ↔ Harvester
 * - Assailant ↔ Defender  
 * - Anchor ↔ Traveler
 * - Scrambler ↔ Scholar
 * 
 * BUFF STACKING MECHANICS:
 * - No Buff: No class advantage = 1x reward (Yeti power)
 * - Single Buff: Yeti buff OR Location buff of opposite class = 2x reward (Yeti power × 2)
 * - Double Buff: Yeti buff AND Location buff of same opposite class = 3x reward (Yeti power × 3)
 * 
 * BALANCE ANALYSIS:
 * 
 * WIN RATE CALCULATION:
 * - Class Advantage Wins: ~25% (instant wins when buffs match opposite class)
 * - Power-Based Wins: ~84% (85% bell curve midpoint, 50%-120% range, 0.15 stdDev)
 * - Total Win Rate: ~89% (25% + 84% with some overlap)
 * - With 10-second SPS advantage: ~92-94% effective win rate
 * 
 * POWER MEASUREMENT TIMING:
 * - Yeti Power: Calculated at spawn time (locked in when yeti appears)
 * - Player Power: Measured at battle resolution (1 second after engagement)
 * - Timing Advantage: Player gains 3-5% additional snowballs from SPS during delay
 * - Strategic Impact: Players can wait to engage, allowing SPS to build up
 * 
 * BELL CURVE PARAMETERS (Phase C.2):
 * - Midpoint: 85% of player power (balanced for ~89% win rate)
 * - Range: 50% - 120% of player power
 * - Standard Deviation: 0.15 (moderate spread)
 * - Distribution: Normal distribution using Box-Muller transform
 * 
 * INTEGRATION POINTS:
 * - Travel system (triggers after travel completion)
 * - Location system (class buffs for advantages)
 * - Yeti system (class buffs for advantages)
 * - Game state (persistent battle statistics and progression)
 */

import { eventBus } from '../../core/eventBus.js';
import { EVIL_YETI, EVIL_YETI_BASE_EFFECT } from './data/evilYetiData.js';

/**
 * =====================================================================
 * BATTLE SYSTEM STATE MANAGEMENT
 * =====================================================================
 * 
 * Central state object for the battle system. This manages all active
 * battle-related data and is synchronized with the game state.
 */
let battleSystem = {
  initialized: false,           // Whether the system has been set up
  yetiBattles: true,           // Battle system enabled/disabled (Phase A) - enabled by default
  battleProbability: 1.0,      // Spawn chance after travel (1.0 = 100% for testing, 0.3 = 30% for gameplay)
  currentEvilYeti: null,       // Currently spawned evil yeti object with power/class data
  spawnTimeout: null,          // Timeout handle for evil yeti despawn timer
  abilityBeltLevel: 0,         // Player's combat progression level (Phase D.3)
  currentDebuff: null,         // Active battle debuff state (Phase B)
  debuffTimeout: null,         // Timeout handle for debuff penalty trigger
  
  // Timer management for battle system
  timerIds: {
    spawnTimeout: null,
    debuffTimeout: null,
    countdownInterval: null
  }
};

/**
 * Initialize the battle system
 * @param {GameStateFlat} game - The current game state object
 */
export function setupBattleSystem(game) {
  if (battleSystem.initialized) {
            // console.log('[BATTLES] Battle system already initialized');
    return;
  }
  
          // console.log('[BATTLES] Setting up battle system');
  
  // Initialize battle system state in game if not present
  if (!game.battles) {
    game.battles = {
      yetiBattles: false,
      battleProbability: 0.0,
      abilityBeltLevel: 0,
      currentEvilYeti: null,
      currentDebuff: null,
      battleHistory: []
    };
  }
  
  // Set initial state based on battlesActive
  if (game.battlesActive) {
    game.battles.yetiBattles = true;
    game.battles.battleProbability = 1.0;
            // console.log('[BATTLES] Battle system enabled due to Concord upgrade');
  } else {
    game.battles.yetiBattles = false;
    game.battles.battleProbability = 0.0;
            // console.log('[BATTLES] Battle system disabled - unlock required');
  }
  
  // Initialize battle system state in game if not present
  if (!game.battles) {
    game.battles = {
      yetiBattles: true, // Battles enabled by default
      battleProbability: 1.0,
      abilityBeltLevel: 0,
      currentEvilYeti: null,
      currentDebuff: null,
      battleHistory: []
    };
  } else {
    // If battles object exists but battlesActive is now true, reset the disabled values
    if (game.battlesActive) {
      game.battles.yetiBattles = true;
      game.battles.battleProbability = 1.0;
      // console.log('[BATTLES] Reset battle state to enabled values');
    }
  }
  
  // Ensure ability belt level is initialized (Phase D.3)
  if (game.battles.abilityBeltLevel === undefined) {
    game.battles.abilityBeltLevel = 0;
  }
  
  // Sync battle system state with game state
  battleSystem.yetiBattles = game.battles.yetiBattles;
  battleSystem.battleProbability = game.battles.battleProbability;
  battleSystem.abilityBeltLevel = game.battles.abilityBeltLevel;
  battleSystem.currentDebuff = game.battles.currentDebuff;
  
  // console.log('[BATTLES] Battle system state synced:');
  // console.log('[BATTLES]   battlesActive:', game.battlesActive);
  // console.log('[BATTLES]   yetiBattles:', battleSystem.yetiBattles);
  // console.log('[BATTLES]   battleProbability:', battleSystem.battleProbability);
  
  // Set up event listeners
  setupBattleEventListeners();
  
  // Initialize UI
  updateBattleUI();
  
  // Remove the periodic UI updates since we'll use a separate container
  // that won't be overwritten by the travel system
  
  // Make functions available globally
  window.toggleBattles = () => toggleBattles(game);
  window.battleSystem = battleSystem;
  window.updateBattleUI = updateBattleUI; // For debugging
  window.engageEvilYeti = (yetiId) => engageEvilYeti(game, yetiId);
  window.checkClassAdvantage = (yetiClass) => checkClassAdvantage(game, yetiClass);
  window.testBattleUI = () => {
    // console.log('[BATTLES] Testing battle UI...');
    // console.log('Travel container exists:', !!document.getElementById('travel-container'));
    // console.log('Battle toggle container exists:', !!document.getElementById('battle-toggle-container'));
    // console.log('Battle system state:', battleSystem);
    updateBattleUI();
  };
  
  /**
   * Test function for bell curve distribution (Phase C)
   * 
   * Generates statistical analysis of the bell curve power distribution
   * to verify that the parameters produce the expected results. Shows
   * min, max, average values and distribution histogram.
   * 
   * Use this to validate changes to bell curve parameters:
   * - Average should be close to center value (0.85)
   * - Most values should cluster around center (80-90% range)
   * - Extreme values should be rare but present
   * 
   * Usage: window.testBellCurve() or window.testBellCurve(5000)
   */
  window.testBellCurve = (samples = 1000) => {
    // console.log(`[BATTLES] Testing bell curve distribution with ${samples} samples...`);
    
    const results = [];
    for (let i = 0; i < samples; i++) {
      const value = generateBellCurveRandom(0.85, 0.5, 1.2, 0.15); 
      results.push(value);
    }
    
    // Calculate statistical measures
    const min = Math.min(...results);
    const max = Math.max(...results);
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    
    // Create histogram to visualize distribution
    const bins = 10;
    const binSize = (max - min) / bins;
    const histogram = new Array(bins).fill(0);
    
    results.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
      histogram[binIndex]++;
    });
    
    // console.log(`[BATTLES] Bell curve stats:`);
    // console.log(`[BATTLES] Min: ${min.toFixed(3)}, Max: ${max.toFixed(3)}, Avg: ${avg.toFixed(3)}`);
    // console.log(`[BATTLES] Expected avg: 0.85`);
    // console.log(`[BATTLES] Histogram:`, histogram.map((count, i) => {
    //   const binStart = (min + i * binSize).toFixed(2);
    //   const binEnd = (min + (i + 1) * binSize).toFixed(2);
    //   return `${binStart}-${binEnd}: ${count}`;
    // }));
    
    return { min, max, avg, histogram, results };
  };
  
  /**
   * Test function for battle scenarios (Phase D)
   * 
   * Simulates various battle power scenarios to show win/loss outcomes
   * based on current player snowball count. Useful for testing battle
   * balance and understanding power thresholds.
   * 
   * Shows how different yeti power levels would affect battle outcomes
   * without actually triggering battles or consuming resources.
   * 
   * Usage: window.testBattleScenarios()
   */
  window.testBattleScenarios = () => {
    // console.log(`[BATTLES] Testing battle scenarios...`);
    
    if (!window.game) {
      // console.log('[BATTLES] No game object found');
      return;
    }
    
    const game = window.game;
    // console.log(`[BATTLES] Current player snowballs: ${game.snowballs.toLocaleString()}`);
    // console.log(`[BATTLES] Current ability belt level: ${game.battles.abilityBeltLevel}`);
    
    // Test scenarios covering various power ratios
    const scenarios = [
      { name: 'Easy Win', multiplier: 0.3 },   // 30% of player power
      { name: 'Close Win', multiplier: 0.95 }, // 95% of player power
      { name: 'Close Loss', multiplier: 1.05 }, // 105% of player power
      { name: 'Big Loss', multiplier: 1.5 }    // 150% of player power
    ];
    
    scenarios.forEach(scenario => {
      const testYeti = {
        name: `Test ${scenario.name}`,
        class: 'Siphon',
        snowballPower: Math.floor(game.snowballs * scenario.multiplier),
        snowballPowerPercent: scenario.multiplier
      };
      
      const willWin = game.snowballs >= testYeti.snowballPower;
      // console.log(`[BATTLES] ${scenario.name}: Yeti power ${testYeti.snowballPower.toLocaleString()} → Player ${willWin ? 'WINS' : 'LOSES'}`);
    });
  };
  
  // =====================================================================
  // TESTING AND DEBUGGING FUNCTIONS
  // =====================================================================
  
  /**
   * Test function for class advantages (Phase E)
   * 
   * Analyzes current player buff state against all evil yeti classes
   * to show which battles would result in class advantages. Useful for
   * strategic planning and system debugging.
   * 
   * Usage: window.testClassAdvantages()
   */
  window.testClassAdvantages = () => {
    // console.log(`[BATTLES] ========== TESTING CLASS ADVANTAGES ==========`);
    
    if (!window.game) {
      // console.log('[BATTLES] No game object found');
      return;
    }
    
    const game = window.game;
    const evilClasses = ['Siphon', 'Assailant', 'Anchor', 'Scrambler'];
    
    // console.log(`[BATTLES] Current player buffs:`);
    // console.log(`[BATTLES] Yeti buff: ${game.currentYetiBuff ? game.currentYetiBuff.class : 'None'}`);
    // console.log(`[BATTLES] Location buff: ${game.currentLocationBuff ? game.currentLocationBuff.class : 'None'}`);
    // console.log(`[BATTLES] ClassX2 multiplier: ${game.classX2Buff || 1}`);
    // console.log('');
    
    evilClasses.forEach(yetiClass => {
      const result = checkClassAdvantage(game, yetiClass);
      const oppositeClass = EVIL_YETI_BASE_EFFECT[yetiClass]?.opposite || 'Unknown';
      
      // console.log(`[BATTLES] vs ${yetiClass} (need ${oppositeClass}):`);
      // console.log(`[BATTLES]   Advantage: ${result.hasAdvantage ? '✅ YES' : '❌ NO'}`);
      // if (result.hasAdvantage) {
      //   console.log(`[BATTLES]   Source: ${result.advantageSource}`);
      //   console.log(`[BATTLES]   Double reward: ${result.hasDoubleReward ? '✅ YES' : '❌ NO'}`);
      // }
      // console.log('');
    });
    
    // console.log(`[BATTLES] ========== CLASS ADVANTAGE TEST COMPLETE ==========`);
  };
  
  battleSystem.initialized = true;
          // console.log('[BATTLES] Battle system initialized');
}

/**
 * Set up event listeners for battle system
 */
function setupBattleEventListeners() {
  // Listen for travel completion to check for battles
  eventBus.on('travelInitiated', (data) => {
    // console.log('[BATTLES] Travel completed, checking for battle...');
    checkForBattle(window.game, data);
  }, 'BattleSystem');
  
  // Listen for battle system state changes
  eventBus.on('battleToggled', (data) => {
    updateBattleUI();
    // console.log('[BATTLES] Battle system toggled:', data.enabled);
  }, 'BattleSystem');
}

/**
 * Toggle battles on/off
 * @param {GameStateFlat} game - The current game state object
 */
function toggleBattles(game) {
  battleSystem.yetiBattles = !battleSystem.yetiBattles;
  game.battles.yetiBattles = battleSystem.yetiBattles;
  
  // If battles are disabled, clear any current evil yeti
  if (!battleSystem.yetiBattles && battleSystem.currentEvilYeti) {
    clearEvilYeti();
  }
  
  // Save game state
  game.save();
  
  // Update UI
  updateBattleUI();
  
  // Emit event
  eventBus.emit('battleToggled', {
    enabled: battleSystem.yetiBattles
  });
  
  // console.log(`[BATTLES] Battles ${battleSystem.yetiBattles ? 'enabled' : 'disabled'}`);
}

/**
 * Update the battle system UI
 */
function updateBattleUI() {
  const travelContainer = document.getElementById('travel-container');
  if (!travelContainer) {
    // console.log('[BATTLES] Travel container not found, skipping UI update');
    return;
  }
  
  // Create or find battle container that's separate from travel container
  let battleContainer = document.getElementById('battle-container');
  if (!battleContainer) {
    battleContainer = document.createElement('div');
    battleContainer.id = 'battle-container';
    battleContainer.className = 'battle-container';
    
    // Insert the battle container right after the travel container
    travelContainer.parentNode.insertBefore(battleContainer, travelContainer.nextSibling);
    // console.log('[BATTLES] Created separate battle container');
  }
  
  // Create or update battle toggle section
  let battleToggleContainer = document.getElementById('battle-toggle-container');
  if (!battleToggleContainer) {
    battleToggleContainer = document.createElement('div');
    battleToggleContainer.id = 'battle-toggle-container';
    battleToggleContainer.className = 'battle-toggle-container';
    battleContainer.appendChild(battleToggleContainer);
  }
  
  // Update battle toggle button - disabled for now, battles enabled by default
  battleToggleContainer.innerHTML = `
    <div class="battle-toggle-section">
      <button id="battle-toggle-button" class="battle-toggle-button disabled" 
              disabled title="Battles enabled by default (toggle disabled)">
        ⚔️ Battles ON
      </button>
      <p class="battle-info">
        Evil yetis may appear after travel (enabled by default)
      </p>
      <p class="ability-belt-info">
        🎖️ Ability Belt Level: ${window.game ? window.game.battles.abilityBeltLevel : 0}
      </p>
    </div>
  `;
  
  // Battle container is now handled by GameReadyUIManager
  // No need to update old display
}

/**
 * Check for battle after travel completion
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} travelData - Data from travel completion event
 */
function checkForBattle(game, travelData) {
  // Check if battle system is active (controlled by Concord upgrade)
  if (!game.battlesActive) {
    // console.log('[BATTLES] Battle system is disabled - unlock required');
    return;
  }
  
  // Always enable battles when battlesActive is true, regardless of previous state
  if (game.battlesActive) {
    battleSystem.yetiBattles = true;
    battleSystem.battleProbability = 1.0;
    // console.log('[BATTLES] Battles enabled due to Concord upgrade');
  }
  
  // Only check if battles are enabled
  if (!battleSystem.yetiBattles) {
    // console.log('[BATTLES] Battles disabled, skipping battle check');
    return;
  }
  
  // Check battle probability
  const battleRoll = Math.random();
  // console.log(`[BATTLES] Battle probability check: ${battleRoll.toFixed(3)} vs ${battleSystem.battleProbability}`);
  
  if (battleRoll <= battleSystem.battleProbability) {
    // console.log('[BATTLES] Battle triggered! Spawning evil yeti in 10 seconds...');
    
    // Add 10-second delay before spawning
    const timerManager = window.timerManager;
    if (timerManager) {
      timerManager.setTimeout(() => {
        spawnEvilYeti(game);
      }, 10000, 'battle-spawn-delay');
    } else {
      // Fallback to legacy setTimeout
      setTimeout(() => {
        spawnEvilYeti(game);
      }, 10000);
    }
  } else {
    // console.log('[BATTLES] No battle this time');
  }
}

/**
 * =====================================================================
 * BELL CURVE POWER DISTRIBUTION (Phase C.2)
 * =====================================================================
 * 
 * Generate evil yeti snowball power using a bell curve (normal) distribution.
 * This creates realistic power variation where most yetis cluster around
 * the center value (85% of player snowballs) with fewer extreme values.
 * 
 * CURRENT CONFIGURATION:
 * - Uses Box-Muller transform for true normal distribution
 * - Center: 0.85 (85% of player snowballs)
 * - Range: 0.5 to 1.2 (50% to 120% of player snowballs)
 * - Standard deviation: 0.15 (controls curve width)
 * 
 * POWER DISTRIBUTION RESULTS:
 * - ~68% of yetis will be within 1 std dev (70%-100% of player power)
 * - ~95% of yetis will be within 2 std dev (55%-115% of player power)
 * - ~99.7% of yetis will be within 3 std dev (40%-130%, clamped to 50%-120%)
 * 
 * TUNING PARAMETERS FOR GAME BALANCE:
 * 
 * To make battles EASIER (favor player):
 * - Decrease center: 0.85 → 0.75 (yetis average 75% of player power)
 * - Decrease stdDev: 0.15 → 0.10 (tighter distribution, more predictable)
 * - Decrease max: 1.2 → 1.0 (remove overpowered yetis)
 * 
 * To make battles HARDER (challenge player):
 * - Increase center: 0.85 → 0.95 (yetis average 95% of player power)
 * - Increase stdDev: 0.15 → 0.20 (wider distribution, more extreme cases)
 * - Increase max: 1.2 → 1.5 (allow very powerful yetis)
 * 
 * To make battles more PREDICTABLE:
 * - Decrease stdDev: 0.15 → 0.05 (very tight distribution)
 * 
 * To make battles more RANDOM:
 * - Increase stdDev: 0.15 → 0.25 (very wide distribution)
 * 
 * @param {number} center - The center value of the bell curve (0.85 = 85% of player power)
 * @param {number} min - Minimum allowed value (0.5 = 50% of player power)
 * @param {number} max - Maximum allowed value (1.2 = 120% of player power)
 * @param {number} stdDev - Standard deviation controlling curve width (0.15 = moderate spread)
 * @returns {number} - Random percentage (0.5-1.2) to multiply by player snowballs
 */
function generateBellCurveRandom(center, min, max, stdDev = 0.15) {
  // Box-Muller transform for generating normal distribution
  // This is mathematically precise (not an approximation like other methods)
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1) to avoid log(0)
  while(v === 0) v = Math.random();
  
  // Generate standard normal random variable (mean=0, stdDev=1)
  const z0 = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  
  // Transform to our desired distribution (mean=center, stdDev=stdDev)
  let result = center + (z0 * stdDev);
  
  // Clamp to min/max bounds to prevent extreme outliers
  result = Math.max(min, Math.min(max, result));
  
  return result;
}

/**
 * Spawn an evil yeti for battle
 * @param {GameStateFlat} game - The current game state object
 */
function spawnEvilYeti(game) {
  // Clear any existing evil yeti
  if (battleSystem.currentEvilYeti) {
    clearEvilYeti();
  }
  
  // Select evil yeti (one per class, so just select randomly from all yetis)
  const selectedYeti = EVIL_YETI.yetis[Math.floor(Math.random() * EVIL_YETI.yetis.length)];
  const selectedClass = selectedYeti.class;
  
  // Calculate yeti snowball power using bell curve (Phase C.2)
  const playerSnowballs = game.snowballs;
  const snowballPowerPercent = generateBellCurveRandom(0.85, 0.5, 1.2, 0.15);
  const snowballPower = Math.floor(snowballPowerPercent * playerSnowballs);
  
  // Calculate display range for estimation (before engagement)
  const lowPower = Math.floor(0.5 * playerSnowballs);
  const highPower = Math.floor(1.2 * playerSnowballs);
  
  // Create evil yeti spawn object
  const evilYetiSpawn = {
    ...selectedYeti,
    id: `evil-yeti-${Date.now()}`, // Add unique ID
    spawnTime: Date.now(),
    duration: EVIL_YETI_BASE_EFFECT[selectedClass].duration * 1000, // Convert to milliseconds
    snowballPower: snowballPower,
    snowballPowerPercent: snowballPowerPercent,
    lowPower: lowPower,
    highPower: highPower,
    effect: EVIL_YETI_BASE_EFFECT[selectedClass]
  };
  
  battleSystem.currentEvilYeti = evilYetiSpawn;
  game.battles.currentEvilYeti = evilYetiSpawn;
  
  // Set despawn timeout using TimerManager
  const timerManager = window.timerManager;
  if (timerManager) {
    battleSystem.timerIds.spawnTimeout = timerManager.setTimeout(() => {
      // console.log('[BATTLES] Evil yeti despawned due to timeout');
      clearEvilYeti();
    }, evilYetiSpawn.duration, 'battle-spawn-timeout');
    battleSystem.spawnTimeout = battleSystem.timerIds.spawnTimeout; // Keep legacy reference
  } else {
    // Fallback to legacy setTimeout
    battleSystem.spawnTimeout = setTimeout(() => {
      // console.log('[BATTLES] Evil yeti despawned due to timeout');
      clearEvilYeti();
    }, evilYetiSpawn.duration);
  }
  
  // Update UI using new battle container
  if (window.showBattleSpawn) {
    window.showBattleSpawn(evilYetiSpawn);
  } else {
    // console.warn('[BATTLES] showBattleSpawn function not available');
  }
  
  // Save game state
  game.save();
  
  // console.log(`[BATTLES] Evil yeti spawned:`, {
  //   name: selectedYeti.name,
  //   class: selectedClass,
  //   estimatedRange: `${lowPower.toLocaleString()} - ${highPower.toLocaleString()}`,
  //   actualPower: snowballPower.toLocaleString(),
  //   actualPercent: (snowballPowerPercent * 100).toFixed(1) + '%',
  //   duration: evilYetiSpawn.duration / 1000
  // });
  
  // Emit event
  eventBus.emit('evilYetiSpawned', {
    yeti: evilYetiSpawn,
    playerSnowballs: playerSnowballs
  });
}

/**
 * Clear the current evil yeti spawn
 * 
 * Removes the currently spawned evil yeti and cleans up associated timers.
 * This function is called when:
 * - A new yeti spawns (replaces the old one)
 * - The yeti despawns due to timeout
 * - The battle system is cleaned up
 * 
 * Uses TimerManager for proper timer cleanup when available, with fallback
 * to legacy clearTimeout for compatibility.
 */
function clearEvilYeti() {
  const timerManager = window.timerManager;
  
  if (battleSystem.timerIds.spawnTimeout && timerManager) {
    timerManager.clearTimer(battleSystem.timerIds.spawnTimeout);
    battleSystem.timerIds.spawnTimeout = null;
    battleSystem.spawnTimeout = null;
  } else if (battleSystem.spawnTimeout) {
    // Fallback to legacy clearTimeout
    clearTimeout(battleSystem.spawnTimeout);
    battleSystem.spawnTimeout = null;
  }
  
  // Only clear debuff if it's not from an engaged battle
  if (battleSystem.currentDebuff && !battleSystem.currentDebuff.engaged) {
    // console.log('[BATTLES] Clearing unengaged debuff');
    clearDebuff();
  } else if (battleSystem.currentDebuff && battleSystem.currentDebuff.engaged) {
    // console.log('[BATTLES] Preserving engaged battle debuff');
  }
  
  battleSystem.currentEvilYeti = null;
  if (window.game && window.game.battles) {
    window.game.battles.currentEvilYeti = null;
  }
  
  // Update UI - hide battle container
  if (window.hideBattleContainer) {
    window.hideBattleContainer();
  } else {
    // console.warn('[BATTLES] hideBattleContainer function not available');
  }
  
  // Save game state
  if (window.game) {
    window.game.save();
  }
}

/**
 * Engage an evil yeti in battle (Phase B & C)
 * @param {GameStateFlat} game - The current game state object
 * @param {string} yetiId - The ID of the yeti to engage
 */
function engageEvilYeti(game, yetiId) {
  if (!battleSystem.currentEvilYeti || battleSystem.currentEvilYeti.id !== yetiId) {
    // console.log('[BATTLES] Cannot engage - yeti not found or mismatch');
    return;
  }
  
  // Don't allow double engagement
  if (battleSystem.currentDebuff && battleSystem.currentDebuff.yetiId === yetiId) {
    // console.log('[BATTLES] Already engaged with this yeti');
    return;
  }
  
  const yeti = battleSystem.currentEvilYeti;
  // console.log(`[BATTLES] Player engaged ${yeti.name} (${yeti.class})!`);
  
  // Apply debuff immediately and resolve battle instantly
  applyEvilYetiDebuff(game, yeti);
  
  // Battle resolves immediately - determine winner (Phase D.1)
  // console.log(`[BATTLES] Battle resolving immediately...`);
  const timerManager = window.timerManager;
  
  if (timerManager) {
    battleSystem.timerIds.debuffTimeout = timerManager.setTimeout(() => {
      if (battleSystem.currentDebuff && battleSystem.currentDebuff.yetiId === yetiId) {
        resolveBattle(game, battleSystem.currentDebuff);
      }
    }, 1000, 'battle-resolution-timeout'); // 1 second delay for UI feedback
    battleSystem.debuffTimeout = battleSystem.timerIds.debuffTimeout; // Keep legacy reference
  } else {
    // Fallback to legacy setTimeout
    setTimeout(() => {
      if (battleSystem.currentDebuff && battleSystem.currentDebuff.yetiId === yetiId) {
        resolveBattle(game, battleSystem.currentDebuff);
      }
    }, 1000);
  }
  
  // Battle UI is now handled by GameReadyUIManager
  // No need to update old display
  
  // Emit event
  eventBus.emit('evilYetiEngaged', {
    yeti: yeti,
    debuffClass: yeti.class,
    effect: yeti.effect
  });
}

/**
 * Apply evil yeti debuff to player
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} yeti - The evil yeti object
 */
function applyEvilYetiDebuff(game, yeti) {
  const now = Date.now();
  
  // Create debuff object
  const debuff = {
    yetiId: yeti.id || `${yeti.class}-${now}`, // Fallback ID
    class: yeti.class,
    startTime: now,
    effect: yeti.effect,
    yeti: yeti,
    engaged: true // Mark as engaged battle
  };
  
  battleSystem.currentDebuff = debuff;
  game.battles.currentDebuff = debuff;
  
  // console.log(`[BATTLES] Applied ${yeti.class} debuff for immediate battle`);
  
  // Save game state
  game.save();
}

/**
 * Resolve the battle between player and evil yeti (Phase D & E)
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} debuff - The debuff object containing yeti info
 */
/**
 * Resolve battle between player and evil yeti
 * 
 * BATTLE OUTCOMES:
 * 1. Normal Win: Player snowballs ≥ Yeti power (no class advantage)
 *    - Reward: Ability Belt Level +1, Snowballs = Yeti power
 * 
 * 2. Class Advantage Win: Player snowballs ≥ Yeti power + class advantage
 *    - Reward: Ability Belt Level +1, Snowballs = Yeti power × 2
 * 
 * 3. Triple Class Advantage Win: Player snowballs ≥ Yeti power + both buffs
 *    - Reward: Ability Belt Level +1, Snowballs = Yeti power × 3
 * 
 * 4. Loss: Player snowballs < Yeti power
 *    - Penalty: Resource theft based on yeti class
 * 
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} debuff - The active debuff object containing yeti data
 */
function resolveBattle(game, debuff) {
  const yeti = debuff.yeti;
  const playerSnowballs = game.snowballs;
  const yetiPower = yeti.snowballPower;
  const yetiClass = yeti.class;
  
  // console.log(`[BATTLES] ========== BATTLE RESOLUTION ==========`);
  // console.log(`[BATTLES] Player snowballs: ${playerSnowballs.toLocaleString()}`);
  // console.log(`[BATTLES] Yeti power: ${yetiPower.toLocaleString()}`);
  // console.log(`[BATTLES] Evil yeti class: ${yetiClass}`);
  
  // Phase E: Check for class advantage (instant win)
  const classAdvantageResult = checkClassAdvantage(game, yetiClass);
  
  let playerWins = false;
  let winType = 'normal';
  let snowballReward = 0;
  
  if (classAdvantageResult.hasAdvantage) {
    // Phase E.1: Instant win due to class advantage
    playerWins = true;
    winType = 'class_advantage';
    snowballReward = yetiPower * 2; // Base 2x reward for class advantage
    
    // Phase E.3: Check for 3x multiplier (both buffs)
    if (classAdvantageResult.hasDoubleReward) {
      snowballReward = yetiPower * 3; // Triple reward for both buffs
      // console.log(`[BATTLES] 🎯 TRIPLE REWARD ACTIVATED! Base reward: ${yetiPower.toLocaleString()} → Final reward: ${snowballReward.toLocaleString()}`);
    } else {
      // console.log(`[BATTLES] 🎯 DOUBLE REWARD ACTIVATED! Base reward: ${yetiPower.toLocaleString()} → Final reward: ${snowballReward.toLocaleString()}`);
    }
    
    // console.log(`[BATTLES] 🌟 INSTANT WIN! Class advantage (${classAdvantageResult.advantageSource})`);
    // console.log(`[BATTLES] Snowball reward: ${snowballReward.toLocaleString()}${classAdvantageResult.hasDoubleReward ? ' (3x bonus!)' : ' (2x bonus!)'}`);
    
  } else {
    // Phase D.1: Normal battle resolution
    playerWins = playerSnowballs >= yetiPower;
    if (playerWins) {
      snowballReward = yetiPower; // 1x reward for normal win
      // console.log(`[BATTLES] Normal battle: PLAYER WINS - Reward: ${snowballReward.toLocaleString()}`);
    } else {
      // console.log(`[BATTLES] Normal battle: EVIL YETI WINS`);
    }
  }
  
  if (playerWins) {
    // console.log(`[BATTLES] 🎉 VICTORY! (${winType})`);
    
    // Phase D.3 & E.2: Player wins - increase ability belt level
    game.battles.abilityBeltLevel = (game.battles.abilityBeltLevel || 0) + 1;
    // console.log(`[BATTLES] ⬆️ Ability Belt Level increased to ${game.battles.abilityBeltLevel}`);
    
    // Phase E.2: Add snowball reward for all wins
    if (snowballReward > 0) {
      game.snowballs += snowballReward;
      // console.log(`[BATTLES] 💰 Acquired ${snowballReward.toLocaleString()} snowballs from defeated yeti!`);
    }
    
    // Show battle results in new UI
    const battleResult = {
      playerWon: true,
      winType: winType === 'class_advantage' ? 'classAdvantage' : 'powerVictory',
      playerPower: playerSnowballs,
      yetiPower: yetiPower,
      yeti: yeti,
      abilityLevel: game.battles.abilityBeltLevel,
      snowballReward: snowballReward
    };
    
    if (window.showBattleResults) {
      window.showBattleResults(battleResult);
    } else {
      // console.warn('[BATTLES] showBattleResults function not available');
    }
    
    // Track victory
    trackBattleResult(game, yeti, true, winType);
    
    // Emit battleWon event for achievement system
    if (window.eventBus) {
      window.eventBus.emit('battleWon', {
        yetiClass: yeti.class,
        yetiPower: yetiPower,
        winType: winType,
        abilityLevel: game.battles.abilityBeltLevel
      });
    }
    
    // Emit battleResult event for UI systems
    if (window.eventBus) {
      window.eventBus.emit('battleResult', {
        result: 'victory',
        enemy: yeti,
        damageDealt: yetiPower,
        damageTaken: 0,
        rewards: {
          snowballs: snowballReward,
          abilityLevel: game.battles.abilityBeltLevel
        }
      });
    }
    
  } else {
    // console.log(`[BATTLES] 😈 EVIL YETI WINS! (${playerSnowballs.toLocaleString()} < ${yetiPower.toLocaleString()})`);
    
    // Show battle results in new UI
    const battleResult = {
      playerWon: false,
      winType: 'powerVictory',
      playerPower: playerSnowballs,
      yetiPower: yetiPower,
      yeti: yeti
    };
    
    if (window.showBattleResults) {
      window.showBattleResults(battleResult);
    }
    
    // Phase D.2: Evil yeti wins - apply penalty
    triggerDebuffPenalty(game, debuff);
    return; // Exit early since penalty function handles cleanup
  }
  
  // console.log(`[BATTLES] ========== BATTLE COMPLETE ==========`);
  
  // Clear debuff for victory
  clearDebuff();
  
  // Update display
  game.updateDisplay();
  
  // Save game state
  game.save();
}

/**
 * =====================================================================
 * CLASS ADVANTAGE SYSTEM (Phase E)
 * =====================================================================
 * 
 * Implements strategic class-based combat advantages. Players with active
 * buffs of the "opposite" class to an evil yeti gain significant advantages:
 * 
 * CLASS OPPOSITES:
 * - Siphon (steals snowballs) ↔ Harvester (generates snowballs)
 * - Assailant (steals assistants) ↔ Defender (protects assistants)  
 * - Anchor (steals snowflakes) ↔ Traveler (generates through travel)
 * - Scrambler (steals icicles) ↔ Scholar (generates through knowledge)
 * 
 * ADVANTAGE CONDITIONS (Phase E.1):
 * - Player has yeti buff of opposite class = INSTANT WIN
 * - Player has location buff of opposite class = INSTANT WIN
 * - Either condition triggers, no snowball power comparison needed
 * 
 * REWARDS (Phase E.2):
 * - Normal victory: Ability belt level +1
 * - Class advantage victory: Ability belt level +1 + acquire yeti's snowballs
 * 
 * DOUBLE REWARDS (Phase E.3):
 * - When BOTH yeti and location buffs are active (classX2Buff > 1)
 * - Snowball reward is doubled (2x yeti's snowball power)
 * - Example: Defeat 50k power Siphon with both Harvester buffs = 100k snowballs
 * 
 * This creates strategic depth where maintaining specific class buffs
 * provides massive advantages against corresponding evil yeti types.
 * 
 * @param {GameStateFlat} game - The current game state object  
 * @param {string} yetiClass - The evil yeti's class (Siphon/Assailant/Anchor/Scrambler)
 * @returns {Object} Result object: { hasAdvantage, hasDoubleReward, advantageSource }
 */
export function checkClassAdvantage(game, yetiClass) {
  // Get the opposite class for this evil yeti from the data configuration
  const oppositeClass = EVIL_YETI_BASE_EFFECT[yetiClass]?.opposite;
  
  if (!oppositeClass) {
    // console.log(`[BATTLES] No opposite class found for ${yetiClass}`);
    return { hasAdvantage: false, hasDoubleReward: false, advantageSource: '' };
  }
  
  // console.log(`[BATTLES] Checking class advantage: ${yetiClass} vs player ${oppositeClass} buffs`);
  
  // Check current player buffs from yeti and location systems ONLY
  const yetiBuffClass = game.currentYetiBuff ? game.currentYetiBuff.class : null;
  const locationBuffClass = game.currentLocationBuff ? game.currentLocationBuff.class : null;
  const classX2Buff = game.classX2Buff || 1; // >1 when both yeti and location buffs are same class
  
  // console.log(`[BATTLES] Player buffs - Yeti: ${yetiBuffClass}, Location: ${locationBuffClass}, X2: ${classX2Buff}`);
  
  // Phase E.1: Check if player has yeti OR location buff of opposite class
  const hasYetiAdvantage = yetiBuffClass === oppositeClass;
  const hasLocationAdvantage = locationBuffClass === oppositeClass;
  const hasAdvantage = hasYetiAdvantage || hasLocationAdvantage;
  
  if (!hasAdvantage) {
    // console.log(`[BATTLES] No class advantage (need ${oppositeClass} buff)`);
    return { hasAdvantage: false, hasDoubleReward: false, advantageSource: '' };
  }
  
  // Determine the source of advantage for display purposes
  let advantageSource = '';
  if (hasYetiAdvantage && hasLocationAdvantage) {
    advantageSource = `${oppositeClass} yeti + location buffs`;
  } else if (hasYetiAdvantage) {
    advantageSource = `${oppositeClass} yeti buff`;
  } else {
    advantageSource = `${oppositeClass} location buff`;
  }
  
  // Phase E.3: Check for double reward (requires both buffs active)
  // Double reward if: both yeti and location buffs are active (classX2Buff > 1)
  const hasDoubleReward = (classX2Buff > 1 && hasYetiAdvantage && hasLocationAdvantage);
  
  // console.log(`[BATTLES] Class advantage found! Source: ${advantageSource}, Double reward: ${hasDoubleReward}`);
  // console.log(`[BATTLES] Double reward conditions - Buff stacking: ${classX2Buff > 1 && hasYetiAdvantage && hasLocationAdvantage}`);
  
  return {
    hasAdvantage: true,
    hasDoubleReward: hasDoubleReward,
    advantageSource: advantageSource
  };
}

/**
 * Show battle victory message
 * @param {Object} yeti - The defeated yeti
 * @param {number} newAbilityLevel - The new ability belt level
 * @param {string} winType - Type of victory ('normal' or 'class_advantage')
 * @param {number} snowballReward - Snowballs gained from victory
 */
function showBattleVictoryMessage(yeti, newAbilityLevel, winType = 'normal', snowballReward = 0) {
  const notification = document.createElement('div');
  notification.className = winType === 'class_advantage' 
    ? 'battle-victory-notification class-advantage' 
    : 'battle-victory-notification';
  
  let title = '🎉 Victory!';
  let description = 'Your combat prowess grows stronger!';
  
  if (winType === 'class_advantage') {
    title = '🌟 Class Advantage Victory!';
    description = 'Your class synergy dominated the battlefield!';
  } else {
    description = 'Your raw power overcame the evil yeti!';
  }
  
  let rewardText = '';
  if (snowballReward > 0) {
    rewardText = `<p><strong>💰 Snowballs Acquired:</strong> ${snowballReward.toLocaleString()}</p>`;
  }
  
  notification.innerHTML = `
    <div class="notification-content">
      <h3>${title}</h3>
      <p>You defeated <strong>${yeti.name}</strong> (${yeti.class})!</p>
      <p><strong>Ability Belt Level:</strong> ${newAbilityLevel}</p>
      ${rewardText}
      <p><em>${description}</em></p>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 6 seconds using TimerManager
  const timerManager = window.timerManager;
  if (timerManager) {
    timerManager.setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 6000, 'battle-victory-notification');
  } else {
    // Fallback to legacy setTimeout
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 6000);
  }
}

/**
 * =====================================================================
 * RESOURCE PENALTY SYSTEM (Phase D.2)
 * =====================================================================
 * 
 * Applies punishment when evil yetis win battles. Each evil yeti class
 * targets different player resources, creating varied threat profiles:
 * 
 * PENALTY TYPES:
 * - Siphon: Steals 5% of player's snowballs (percentage-based scaling)
 * - Assailant: Steals 1 random assistant (removes from player's collection)
 * - Anchor: Steals 1 snowflake (minimum 0 - cannot go negative)
 * - Scrambler: Steals 1 icicle level (minimum 0 - cannot go negative)
 * 
 * RESOURCE PROTECTION:
 * All resources are protected from going negative using Math.max(0, ...).
 * This prevents potential exploits and ensures consistent game state.
 * 
 * Since battles can now occur regardless of resource amounts,
 * all resources are protected from going negative using Math.max(0, ...).
 * 
 * DUPLICATE PREVENTION:
 * Each debuff can only trigger penalty once (penaltyApplied flag) to prevent
 * multiple applications from timing issues or system conflicts.
 * 
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} debuff - The debuff object containing penalty details
 */
/**
 * Get penalty details for battle result events
 * 
 * Extracts information about what was lost in a battle defeat
 * to provide detailed feedback to the player.
 * 
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} debuff - The debuff object containing penalty data
 * @returns {Object} Object containing penalty details and description
 */
function getPenaltyDetails(game, debuff) {
  const effect = debuff.effect;
  const yetiClass = debuff.class;
  
  switch (effect.effectType) {
    case 'stealSnowballs':
      const snowballsLost = Math.floor(game.snowballs * effect.value);
      return {
        type: 'snowballs',
        amount: snowballsLost,
        description: `${yetiClass} stole ${snowballsLost.toLocaleString()} snowballs (${(effect.value * 100)}% of your total)`
      };
      
    case 'stealAssistants':
      return {
        type: 'assistants',
        amount: effect.value,
        description: `${yetiClass} stole ${effect.value} random assistant${effect.value > 1 ? 's' : ''} from your collection`
      };
      
    case 'stealSnowflakes':
      return {
        type: 'snowflakes',
        amount: effect.value,
        description: `${yetiClass} stole ${effect.value} snowflake${effect.value > 1 ? 's' : ''} from your wallet`
      };
      
    case 'stealIcicles':
      return {
        type: 'icicles',
        amount: effect.value,
        description: `${yetiClass} stole ${effect.value} icicle${effect.value > 1 ? 's' : ''} from your wallet`
      };
      
    default:
      return {
        type: 'unknown',
        amount: 0,
        description: `${yetiClass} applied an unknown penalty`
      };
  }
}

/**
 * Apply penalty for losing a battle
 * 
 * PENALTY TYPES (by Evil Yeti Class):
 * - Siphon: Steal 5% of player snowballs
 * - Assailant: Steal 1 random assistant
 * - Anchor: Steal 1 snowflake from wallet
 * - Scrambler: Steal 1 icicle from wallet
 * 
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} debuff - The debuff object containing penalty data
 */
function triggerDebuffPenalty(game, debuff) {
  // Prevent multiple penalty applications from timing conflicts
  if (debuff.penaltyApplied) {
    // console.log(`[BATTLES] Penalty already applied for ${debuff.class}, skipping`);
    return;
  }
  
  const effect = debuff.effect;
  
  // console.log(`[BATTLES] ========== PENALTY TRIGGER ==========`);
  // console.log(`[BATTLES] Class: ${debuff.class}`);
  // console.log(`[BATTLES] Effect Type: ${effect.effectType}`);
  // console.log(`[BATTLES] Effect Value: ${effect.value}`);
  // console.log(`[BATTLES] Description: ${effect.description}`);
  // console.log(`[BATTLES] Player Resources Before - Snowballs: ${game.snowballs.toLocaleString()}, Assistants: ${JSON.stringify(Object.fromEntries(game._assistants))}, Snowflakes: ${game.snowflakes}, Icicles: ${game.iciclePendingLevels}`);
  
  // Mark penalty as applied to prevent duplicates
  debuff.penaltyApplied = true;
  
  switch (effect.effectType) {
    case 'stealSnowballs':
      const snowballsToSteal = Math.floor(game.snowballs * effect.value);
      game.snowballs = Math.max(0, game.snowballs - snowballsToSteal);
      // console.log(`[BATTLES] ✅ Siphon penalty applied - Stole ${snowballsToSteal.toLocaleString()} snowballs`);
      // Penalty details are now shown in the battle results container
      break;
      
    case 'stealAssistants':
      const assistantsToSteal = effect.value;
      // console.log(`[BATTLES] Attempting to steal ${assistantsToSteal} assistant(s)...`);
      const stolenAssistants = stealRandomAssistants(game, assistantsToSteal);
      // console.log(`[BATTLES] ✅ Assailant penalty applied - Stole ${stolenAssistants} assistant(s)`);
      // Penalty details are now shown in the battle results container
      break;
      
    case 'stealSnowflakes':
      const snowflakesToSteal = effect.value;
      const beforeSnowflakes = game.snowflakes;
      // Prevent negative snowflakes (Math.max ensures >=0)
      game.snowflakes = Math.max(0, game.snowflakes - snowflakesToSteal);
      // console.log(`[BATTLES] ✅ Anchor penalty applied - Stole ${snowflakesToSteal} snowflake(s) (${beforeSnowflakes} -> ${game.snowflakes})`);
      // Penalty details are now shown in the battle results container
      break;
      
    case 'stealIcicles':
      const iciclesToSteal = effect.value;
      const beforeIcicles = game.icicles;
      // Prevent negative icicles (Math.max ensures >=0)
      game.icicles = Math.max(0, game.icicles - iciclesToSteal);
      // console.log(`[BATTLES] ✅ Scrambler penalty applied - Stole ${iciclesToSteal} icicle(s) (${beforeIcicles} -> ${game.icicles})`);
      // Penalty details are now shown in the battle results container
      break;
      
    default:
      // console.error(`[BATTLES] Unknown penalty effect type: ${effect.effectType}`);
  }
  
  // console.log(`[BATTLES] Player Resources After - Snowballs: ${game.snowballs.toLocaleString()}, Assistants: ${JSON.stringify(Object.fromEntries(game._assistants))}, Snowflakes: ${game.snowflakes}, Icicles: ${game.icicles}`);
  // console.log(`[BATTLES] ========== PENALTY COMPLETE ==========`);
  
  // Clear the debuff after penalty is applied
  clearDebuff();
  
  // Update display
  game.updateDisplay();
  
  // Save game state
  game.save();
  
  // Track battle result
  trackBattleResult(game, debuff.yeti, false, 'penalty');
  
  // Emit battleResult event with penalty information for UI systems
  if (window.eventBus) {
    const penaltyDetails = getPenaltyDetails(game, debuff);
    window.eventBus.emit('battleResult', {
      result: 'defeat',
      enemy: debuff.yeti,
      damageDealt: 0,
      damageTaken: debuff.yeti.snowballPower,
      losses: penaltyDetails
    });
  }
}

/**
 * Steal random assistants from player
 * @param {GameStateFlat} game - The current game state object
 * @param {number} count - Number of assistants to steal
 * @returns {number} - Number of assistants actually stolen
 */
function stealRandomAssistants(game, count) {
  const availableAssistants = [];
  
  // Get all assistants that player owns using the new Map-based structure
  for (const [assistantId, owned] of game._assistants.entries()) {
    if (owned > 0) {
      for (let i = 0; i < owned; i++) {
        availableAssistants.push(assistantId);
      }
    }
  }
  
  if (availableAssistants.length === 0) {
    return 0;
  }
  
  const actualCount = Math.min(count, availableAssistants.length);
  
  for (let i = 0; i < actualCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableAssistants.length);
    const assistantId = availableAssistants[randomIndex];
    
    // Remove one of this assistant using the Map
    const currentCount = game._assistants.get(assistantId) || 0;
    game._assistants.set(assistantId, Math.max(0, currentCount - 1));
    
    // Remove from available list to avoid stealing the same instance twice
    availableAssistants.splice(randomIndex, 1);
  }
  
  // Recalculate SPS since assistants were removed
  if (window.calculateSPSWithBoosts) {
    window.calculateSPSWithBoosts(game);
  }
  
  return actualCount;
}

/**
 * Clear the current debuff
 * 
 * Removes the active battle debuff and cleans up associated timers.
 * This function is called when:
 * - Battle resolution completes (victory or defeat)
 * - Penalty is applied and processed
 * - Battle system cleanup occurs
 * 
 * Uses TimerManager for proper timer cleanup when available, with fallback
 * to legacy clearTimeout for compatibility. Also syncs the cleared state
 * with the game state to ensure consistency.
 */
function clearDebuff() {
  const timerManager = window.timerManager;
  
  if (battleSystem.timerIds.debuffTimeout && timerManager) {
    timerManager.clearTimer(battleSystem.timerIds.debuffTimeout);
    battleSystem.timerIds.debuffTimeout = null;
    battleSystem.debuffTimeout = null;
  } else if (battleSystem.debuffTimeout) {
    // Fallback to legacy clearTimeout
    clearTimeout(battleSystem.debuffTimeout);
    battleSystem.debuffTimeout = null;
  }
  
  battleSystem.currentDebuff = null;
  if (window.game && window.game.battles) {
    window.game.battles.currentDebuff = null;
  }
  
  // console.log('[BATTLES] Debuff cleared');
}

/**
 * Show battle penalty message
 * @param {string} message - The penalty message to show
 */
function showBattlePenaltyMessage(message) {
  const notification = document.createElement('div');
  notification.className = 'battle-penalty-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <h3>⚠️ Battle Penalty!</h3>
      <p>${message}</p>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 5 seconds using TimerManager
  const timerManager = window.timerManager;
  if (timerManager) {
    timerManager.setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 5000, 'battle-penalty-notification');
  } else {
    // Fallback to legacy setTimeout
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 5000);
  }
}

/**
 * Track battle result for statistics
 * 
 * Records battle outcomes for analysis and potential future features.
 * Each battle record includes timestamp, yeti details, outcome, and
 * player state at the time of battle.
 * 
 * The battle history is limited to the last 50 battles to prevent
 * memory bloat while maintaining a useful record of recent combat.
 * 
 * This data could be used for:
 * - Battle statistics and analytics
 * - Achievement tracking
 * - Balance analysis
 * - Player progression insights
 * 
 * @param {GameStateFlat} game - The current game state object
 * @param {Object} yeti - The yeti involved in battle
 * @param {boolean} playerWon - Whether player won
 * @param {string} result - Battle result type ('normal', 'class_advantage', 'penalty')
 */
function trackBattleResult(game, yeti, playerWon, result) {
  const battleRecord = {
    timestamp: Date.now(),
    yetiName: yeti.name,
    yetiClass: yeti.class,
    playerWon: playerWon,
    result: result,
    playerSnowballs: game.snowballs
  };
  
  if (!game.battles.battleHistory) {
    game.battles.battleHistory = [];
  }
  
  game.battles.battleHistory.push(battleRecord);
  
  // Keep only last 50 battle records
  if (game.battles.battleHistory.length > 50) {
    game.battles.battleHistory = game.battles.battleHistory.slice(-50);
  }
  
  // console.log(`[BATTLES] Battle result tracked:`, battleRecord);
}

/**
 * Update evil yeti spawn display
 * 
 * Manages the dynamic UI for evil yeti encounters. This function handles:
 * - Displaying spawned yeti information (name, class, estimated power range)
 * - Showing battle engagement state when player clicks to engage
 * - Revealing actual yeti power after engagement
 * - Displaying countdown timer for yeti despawn
 * - Showing battle resolution status
 * 
 * The display adapts based on the current battle state:
 * - Pre-engagement: Shows estimated power range and click-to-engage prompt
 * - During engagement: Shows actual power and battle resolution countdown
 * - Post-resolution: Clears display or shows completion status
 * 
 * Uses TimerManager for countdown updates when available, with fallback
 * to legacy setInterval for compatibility.
 */
// Old updateEvilYetiSpawnDisplay function removed - now using GameReadyUIManager battle container

/**
 * Clean up the battle system
 * 
 * Performs comprehensive cleanup of the battle system when the game
 * is shutting down or the system needs to be reset. This includes:
 * 
 * TIMER CLEANUP:
 * - Clears all active timers (spawn timeout, debuff timeout, countdown)
 * - Uses TimerManager when available for proper timer management
 * - Falls back to legacy clearTimeout/clearInterval for compatibility
 * 
 * STATE CLEANUP:
 * - Resets battle system state to initial values
 * - Clears current evil yeti and debuff references
 * - Maintains battle history for persistence
 * 
 * UI CLEANUP:
 * - Removes battle container from DOM
 * - Clears any active notifications
 * - Resets UI state
 * 
 * This function ensures no memory leaks or orphaned timers remain
 * when the battle system is deactivated or the game is closed.
 */
export function cleanupBattleSystem() {
  if (battleSystem.initialized) {
    const timerManager = window.timerManager;
    let cleanedCount = 0;
    
    if (timerManager) {
      // Use TimerManager to clear timers
      Object.entries(battleSystem.timerIds).forEach(([name, timerId]) => {
        if (timerId && timerManager.clearTimer(timerId)) {
          cleanedCount++;
          battleSystem.timerIds[name] = null;
        }
      });
      
      // Clear legacy timer references as well
      battleSystem.spawnTimeout = null;
      battleSystem.debuffTimeout = null;
      
      // console.log(`[BATTLES] Cleaned up ${cleanedCount} timers using TimerManager`);
    } else {
      // Fallback to legacy cleanup
      if (battleSystem.spawnTimeout) {
        clearTimeout(battleSystem.spawnTimeout);
        battleSystem.spawnTimeout = null;
        cleanedCount++;
      }
      
      if (battleSystem.debuffTimeout) {
        clearTimeout(battleSystem.debuffTimeout);
        battleSystem.debuffTimeout = null;
        cleanedCount++;
      }
      
      // console.log(`[BATTLES] Cleaned up ${cleanedCount} timers using legacy clearTimeout`);
    }
    
    // Remove battle container from DOM
    const battleContainer = document.getElementById('battle-container');
    if (battleContainer) {
      battleContainer.remove();
      // console.log('[BATTLES] Removed battle container from DOM');
    }
    
    // Remove event listeners
    eventBus.off('travelInitiated', 'BattleSystem');
    eventBus.off('battleToggled', 'BattleSystem');
    
    // Clear global functions
    delete window.toggleBattles;
    delete window.battleSystem;
    delete window.updateBattleUI;
    delete window.testBattleUI;
    delete window.engageEvilYeti;
    delete window.testBellCurve;
    delete window.testBattleScenarios;
    delete window.testClassAdvantages;
    
    battleSystem.initialized = false;
    // console.log('[BATTLES] Battle system cleaned up');
  }
}

// Export for testing
export { battleSystem };

/**
 * =====================================================================
 * FUTURE DEVELOPMENT CONSIDERATIONS
 * =====================================================================
 * 
 * This battle system is designed to be extensible. Here are potential
 * areas for future enhancement:
 * 
 * BATTLE COMPLEXITY:
 * - Multi-turn battles with tactical choices
 * - Equipment/items that modify battle outcomes
 * - Special abilities that can be unlocked and used
 * - Environmental factors (weather, terrain) affecting battles
 * 
 * EVIL YETI VARIETY:
 * - New evil yeti classes with unique mechanics
 * - Elite/boss yetis with special rewards
 * - Seasonal or event-specific evil yetis
 * - Yeti evolution/mutation based on player progress
 * 
 * PROGRESSION SYSTEMS:
 * - Expanded ability belt with diverse unlocks
 * - Battle mastery levels for different yeti classes
 * - Reputation system with yeti factions
 * - Battle-specific achievements and rewards
 * 
 * STRATEGIC DEPTH:
 * - Formation/positioning mechanics
 * - Resource management during battles
 * - Combo systems linking different game mechanics
 * - Diplomatic options (bribery, intimidation, etc.)
 * 
 * BALANCE TUNING:
 * - Dynamic difficulty based on player performance
 * - Seasonal balance adjustments
 * - Player feedback integration for fairness
 * - A/B testing for different parameter sets
 * 
 * PERFORMANCE OPTIMIZATION:
 * - Battle result caching for similar scenarios
 * - Batch processing of multiple battles
 * - Memory optimization for battle history
 * - Reduced DOM manipulation during battles
 * 
 * KEY PARAMETERS TO MONITOR:
 * - Player win/loss ratios across different progression levels
 * - Resource loss impact on player progression
 * - Class advantage usage patterns
 * - Bell curve distribution effectiveness
 * - Battle frequency and player engagement
 */
