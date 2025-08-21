/**
 * core/gameStateFlat.js - New Flat State Architecture
 * 
 * This is the new simplified GameState class that replaces the complex nested
 * structure with a flat, high-performance design. This eliminates the need for:
 * - currentAnalog.* nesting
 * - meta.* nesting  
 * - loops.* nesting
 * - Bi-directional state synchronization
 * - Complex getter/setter patterns
 * 
 * ARCHITECTURAL DECISIONS:
 * 
 * 1. FLAT STRUCTURE: All properties are directly accessible
 *    - OLD: game.currentAnalog.snowballs
 *    - NEW: game.snowballs
 * 
 * 2. PERFORMANT COLLECTIONS: Maps and Sets for better performance
 *    - Objects: O(n) property access, larger memory footprint
 *    - Maps: O(1) access, optimized for frequent operations
 *    - Sets: O(1) membership testing, no duplicate values
 * 
 * 3. LOGICAL ORGANIZATION: Properties grouped by domain but not nested
 *    - Currency and core progression
 *    - Lifetime statistics  
 *    - Game collections (assistants, boosts, etc.)
 *    - Active buffs and temporary state
 *    - System multipliers
 * 
 * 4. DEPENDENCY INJECTION: Managers are injected, not embedded
 *    - SaveManager handles all persistence
 *    - TimerManager handles all timing
 *    - EventManager handles communication
 * 
 * 5. CLEAR NAMING: Self-documenting property names
 *    - No abbreviations unless universally understood (sps, spc)
 *    - Consistent naming patterns
 *    - Type hints in comments
 */

import { STARTING_SNOWBALLS } from './config.js';
import { TIME_RATE } from './config.js';
import { ASSISTANTS } from '../loops/passive/data/assistantData.js';
import { SaveManager } from './SaveManager.js';

/**
 * GameState - Flat, high-performance game state management
 * 
 * This class represents the complete game state using a flat structure
 * for optimal performance and maintainability. All game data is directly
 * accessible without nested object traversal.
 * 
 * PERFORMANCE CHARACTERISTICS:
 * - Direct property access: O(1) vs O(n) for nested objects
 * - Maps for collections: Optimized for frequent lookups
 * - Sets for unique collections: O(1) membership testing
 * - No synchronization overhead: Single source of truth
 * 
 * MIGRATION STRATEGY:
 * - Replace all nested access patterns with direct access
 * - Convert object collections to Maps/Sets where appropriate  
 * - Eliminate all getter/setter complexity
 * - Remove bi-directional sync methods
 */
export class GameStateFlat {
  constructor() {
    // ===============================
    // CORE CURRENCY & PROGRESSION
    // ===============================
    // These are the most frequently accessed properties in the game
    
    /** @type {number} Current snowball balance - accessed every frame */
    this.snowballs = 0;
    
    /** @type {number} Snowballs per click - used in click calculations */
    this.spc = 1;
    
    /** @type {number} Snowballs per second - calculated frequently, displayed constantly */
    this.sps = 0;
    
    /** @type {number} Current analog number - meta progression level */
    this.analogNumber = 1;
    
    /** @type {number} Snowflakes - permanent meta currency */
    this.snowflakes = 0;
    
    /** @type {number} Player level (0-10) - affects click multiplier exponentially */
    this.playerLevel = 0;
    
    /** @type {number} Starting snowballs from snowflake upgrades */
    this.startingSnowballs = 0;
    
    /** @type {object} Starting assistants from snowflake upgrades {assistantId: percentage} */
    this.startingAssistants = {};
    
    /** @type {Array<string>} Starting baby yeti upgrades from snowflake upgrades */
    this.startingBabyYeti = [];
    
    
    // ===============================
    // LIFETIME STATISTICS
    // ===============================
    // These track permanent progress across all analogs
    
    /** @type {number} Total snowballs earned across all analogs */
    this.lifetimeSnowballs = 0;
    
    /** @type {number} Total snowballs from clicking across all analogs */
    this.lifetimeClicks = 0;
    
    /** @type {number} Total play time in milliseconds across all analogs */
    this._totalPlayTime = 0;
    
    /** @type {number} Snowballs earned in current analog only */
    this.currentAnalogSnowballs = 0;
    
    /** @type {Map<string, number>} Lifetime snowballs per assistant type */
    this._lifetimeFromAssistants = new Map();
    
    
    // ===============================  
    // GAME COLLECTIONS
    // ===============================
    // Using Maps and Sets for optimal performance with frequent access
    
    /** @type {Map<string, number>} Assistant ID -> count owned */
    this._assistants = new Map();
    
    /** @type {Map<string, number>} Assistant ID -> current level */
    this._assistantLevels = new Map();
    
    /** @type {Map<string, number>} Assistant ID -> multiplier (1.0 = no bonus) */
    this._assistantMultipliers = new Map();
    
    /** @type {Set<string>} Owned boost IDs - Sets prevent duplicates automatically */
    this._boosts = new Set();
    
    /** @type {Set<string>} Owned global upgrade IDs */
    this._globalUpgrades = new Set();
    
    /** @type {Map<string, object>} Achievement ID -> achievement data */
    this._achievements = new Map();
    
    /** @type {object} Achievement progress (persists across analogs) */
    this._achievementsObject = {
      unlocked: [],
      unlockedTimestamps: {},
      progress: {},
      lastCheck: 0
    };
    
    /** @type {object} Lore progress (persists across analogs) */
    this.lore = {
      unlocked: [],
      unlockedTimestamps: {},
      viewed: {}
    };
    
    /** @type {Set<string>} Unlocked location IDs */
    this.unlockedLocations = new Set();
    
    /** @type {Array<string>} Persistent upgrades that survive analog resets */
    this.persistentUpgrades = [];
    
    // ===============================
    // CONCORD MECHANIC ACTIVATION FLAGS
    // ===============================
    // These flags control whether advanced game mechanics are active
    // They are set by snowflake upgrades and persist across analogs
    
    /** @type {boolean} Yeti spawns active (set by 'activateYetiSpawns' upgrade) */
    this.yetiSpawnsActive = false;
    
    /** @type {boolean} Travel system active (set by 'activateTravel' upgrade) */
    this.travelActive = false;
    
    /** @type {boolean} Abilities system active (set by 'activateAbilities' upgrade) */
    this.abilitiesActive = false;
    
    /** @type {boolean} Battle system active (set by 'activateBattle' upgrade) */
    this.battlesActive = false;
    
    /** @type {Array<object>} Historical data from completed analogs */
    this.analogs = [];
    
    /** @type {number} When the current analog started */
    this.analogStartTime = Date.now();
    
    // ===============================
    // IDLE TIME TRACKING & BONUSES
    // ===============================
    // Track idle time and apply bonuses when game is reloaded
    //
    // 🎯 IDLE PROGRESSION CONFIGURATION
    // =================================
    // The idle bonus system allows players to earn snowballs while offline.
    // Players earn a percentage of their normal SPS during idle time.
    //
    // 📊 HOW IDLE BONUSES WORK:
    // - When the game loads, it calculates time since last save
    // - If more than 5 minutes have passed, it's considered "idle time"
    // - Idle bonus = (Normal SPS × Idle Time × Idle Bonus Rate × Idle Bonus Multiplier)
    // - Maximum idle time is capped at 24 hours to prevent abuse
    //
    // ⚙️ CONFIGURATION OPTIONS:
    // - idleBonusRate: Base percentage of normal SPS earned while idle (default: 1%)
    // - idleBonusMultiplier: Multiplier from snowflake upgrades (default: 1x)
    // - maxIdleTime: Maximum idle time to reward (set in SaveManager: 24 hours)
    // - idleThreshold: Minimum time to be considered idle (set in SaveManager: 5 minutes)
    //
    // 🔧 HOW TO CHANGE DEFAULT IDLE PROGRESSION:
    // ==========================================
    // 1. Change the base idle bonus rate:
    //    - Modify 'idleBonusRate' below (0.01 = 1%, 0.05 = 5%, 0.10 = 10%)
    //    - This affects ALL players (new and existing)
    //
    // 2. Change the idle bonus multiplier:
    //    - Modify 'idleBonusMultiplier' below (1 = no bonus, 2 = double bonus)
    //    - This is typically controlled by snowflake upgrades
    //
    // 3. Change maximum idle time (in SaveManager.js):
    //    - Modify 'maxIdleTime' in SaveManager constructor
    //    - Default: 24 hours (24 * 60 * 60 * 1000 milliseconds)
    //
    // 4. Change idle threshold (in SaveManager.js):
    //    - Modify the idle detection logic in calculateAndStoreIdleTime()
    //    - Default: 5 minutes (5 * 60 * 1000 milliseconds)
    //
    // 📈 EXAMPLE CONFIGURATIONS:
    // - Conservative: idleBonusRate = 0.005 (0.5% of normal SPS)
    // - Balanced: idleBonusRate = 0.01 (1% of normal SPS) - CURRENT DEFAULT
    // - Generous: idleBonusRate = 0.02 (2% of normal SPS)
    // - Very Generous: idleBonusRate = 0.05 (5% of normal SPS)
    //
    // 🎮 GAMEPLAY IMPACT:
    // - Higher rates make the game more "idle-friendly"
    // - Lower rates encourage active play
    // - Consider balance with other progression systems
    //
    // 🚀 IMPROVEMENTS IMPLEMENTED (Recommendations 1-4 & 6):
    // ======================================================
    // 1. SPS VALIDATION: Ensures SPS is valid before idle bonus calculation
    //    - Type checking and NaN validation
    //    - Fallback to 0 if SPS is invalid
    //    - Prevents calculation errors and crashes
    //
    // 2. RATE BOUNDS: Validates and clamps idle bonus rate to reasonable limits
    //    - Minimum: 0% (no idle bonus)
    //    - Maximum: 200% (double idle bonus)
    //    - Automatic clamping with warning logs
    //    - Prevents excessive or negative rates
    //
    // 3. HISTORY CLEANUP: Prevents memory bloat from excessive idle bonus records
    //    - Keeps only last 50 records by default
    //    - Automatic cleanup during bonus application
    //    - Manual cleanup method available
    //    - Prevents save file bloat over time
    //
    // 4. ERROR HANDLING: Comprehensive error detection and recovery
    //    - Validation of calculation results
    //    - Prevention of negative bonuses
    //    - Graceful fallbacks for invalid data
    //    - Detailed error logging for debugging
    //
    // 6. ENHANCED DEBUGGING: Comprehensive logging and monitoring
    //    - Detailed idle bonus calculation logs
    //    - SPS and snowball context capture
    //    - Idle bonus statistics and history
    //    - System validation and health checks
    //
    // 📋 AVAILABLE METHODS:
    // - calculateAndApplyIdleBonus(): Main idle bonus calculation
    // - getIdleBonusStats(): Get comprehensive idle bonus statistics
    // - validateIdleBonusSystem(): Validate and fix system issues
    // - cleanupIdleBonusHistory(): Manual cleanup of old records
    // - getFormattedIdleBonusRate(): Get formatted rate for display
    // - getIdleBonusRateDescription(): Get human-readable description
    //
    // 🔍 DEBUGGING:
    // - Console logs with [IDLE_BONUS] tag for all operations
    // - Detailed calculation breakdown in logs
    // - SPS and snowball context captured during idle
    // - Validation results and automatic fixes logged
    //
    // ⚠️ IMPORTANT NOTES:
    // - Idle bonuses use current SPS (may include temporary bonuses)
    // - Crystal snowball multiplier is NOT removed for idle calculations
    // - This represents player's current earning potential during idle time
    // - Snowflake upgrades add 5% each (additive, not multiplicative)
    // - Maximum possible rate: 101% with all 20 upgrades
    
    /** @type {object} Idle time tracking and bonuses */
    this.idleTime = {
      info: null,                        // Current idle time information from SaveManager
      totalIdleTime: 0,                  // Total idle time across all sessions
      totalIdleGains: 0,                 // Total snowballs earned from idle bonuses
      idleBonusRate: 0.01,              // 🔧 DEFAULT IDLE BONUS RATE: 1% of normal SPS
                                       // Change this value to adjust base idle progression
                                       // 0.01 = 1%, 0.05 = 5%, 0.10 = 10%, etc.
      idleBonusMultiplier: 1,           // 🔧 IDLE BONUS MULTIPLIER: Multiplier from snowflake upgrades
                                       // This will be increased by snowflake tree upgrades
                                       // 1 = no bonus, 2 = double bonus, 3 = triple bonus, etc.
      lastIdleCalculation: 0,           // When idle bonuses were last calculated
      idleBonusesApplied: []            // History of applied idle bonuses
    };
    
    
    // ===============================
    // ACTIVE BUFFS & TEMPORARY STATE  
    // ===============================
    // These represent temporary game state that can change rapidly
    
    /** @type {object|null} Current yeti buff: {class, startTime, duration} */
    this.currentYetiBuff = null;
    
    /** @type {object|null} Current location buff: {locationId, startTime, duration} */
    this.currentLocationBuff = null;
    
    /** @type {object} Icicle state: {startTime, harvested, broken, lastCheckedHour} */
    this.icicleState = {
      startTime: 0,
      harvested: false,
      broken: false,
      lastCheckedHour: 0
    };
    
    /** @type {number} Pending icicle level-ups waiting to be applied */
    this.iciclePendingLevels = 0;
    
    /** @type {number} Yetis sighted in current analog */
    this.yetisSighted = 0;
    
    /** @type {number} Locations visited in current analog */
    this.locationsVisited = 0;
    
    /** @type {number} Evil yetis battled in current analog */
    this.evilYetisBattled = 0;
    
    /** @type {number} Prestige count for current analog */
    this.prestigeCount = 0;
    
    /** @type {object} Battle system state */
    this.battles = {
      yetiBattles: false,
      battleProbability: 1.0,
      abilityBeltLevel: 0,
      currentEvilYeti: null,
      currentDebuff: null,
      battleHistory: []
    };
    
    
    // ===============================
    // SYSTEM MULTIPLIERS
    // ===============================
    // These affect game calculations and are accessed frequently
    
    /** @type {number} Global SPS multiplier applied to all assistants */
    this.globalSpsMultiplier = 1;
    
    /** @type {number} Click power multiplier */
    this.clickMultiplier = 1;
    
    /** @type {number} Class stacking buff multiplier (2 when same class buffs active) */
    this.classX2Buff = 1;
    
    /** @type {number} Travel location discount for global upgrades (1 = no discount) */
    this.travelDiscountGlobalUpgrades = 1;
    
    /** @type {number} Travel location discount for assistants (1 = no discount) */
    this.travelDiscountAssistants = 1;
    
    /** @type {number} Travel location SPS multiplier (1 = no bonus) */
    this.travelSPSMultiplier = 1;
    
    /** @type {number} Travel location discount for boosts (1 = no discount) */
    this.travelDiscountBoosts = 1;
    
    /** @type {object} Unified upgrades storage {upgradeId: boolean} */
    this.unifiedUpgrades = {};
    
    /** @type {number} Global SPS multiplier from unified upgrades */
    this.globalSpsMultiplier = 1;
    
    /** @type {number} Assistant cost reduction percentage */
    this.assistantCostReduction = 0;
    
    /** @type {number} Boost effectiveness multiplier */
    this.boostEffectiveness = 1;
    
    
    // ===============================
    // PERFORMANCE TRACKING
    // ===============================
    // These help with calculations and performance optimization
    
    /** @type {Array<{time: number, sps: number}>} Rolling SPS history for acceleration calculation */
    this.spsHistory = [];
    
    /** @type {object} Per-assistant SPS breakdown for calculations */
    this._spsByAssistant = {};
    
    /** @type {number} When this analog started (timestamp) */
    this.analogStartTime = Date.now();
    
    /** @type {Array<object>} Historical analog data */
    this.analogHistory = [];
    
    
    // ===============================
    // CLICK STREAK SYSTEM
    // ===============================
    // Flattened from loops.active.clicking.streakSystem
    
    /** @type {number} Total clicks ever made */
    this.totalClicks = 0;
    
    /** @type {object} Click streak system - comprehensive structure */
    this.clickStreak = {
      isActive: false,
      startTime: 0,
      duration: 0,
      bestStreak: 0,
      currentStreak: 0,
      clicksInCurrentSecond: 0,
      lastSecondTimestamp: 0,
      qualifyingSeconds: 0,
      recentClicks: [],
      currentClickRate: 0,
      stats: {
        bestStreak: 0,
        totalStreakTime: 0,
        streaksAchieved: [0, 0, 0, 0, 0, 0],
        totalBonusTime: 0
      },
      activeBonus: {
        multiplier: 1,
        startTime: 0,
        duration: 0,
        tier: 0
      },
      tiers: [
        { duration: 1, multiplier: 2, bonusDuration: 5 },
        { duration: 3, multiplier: 3, bonusDuration: 8 },
        { duration: 5, multiplier: 4, bonusDuration: 10 },
        { duration: 10, multiplier: 5, bonusDuration: 15 },
        { duration: 15, multiplier: 6, bonusDuration: 20 },
        { duration: 20, multiplier: 8, bonusDuration: 30 }
      ]
    };
    
    /** @type {number} Timestamp of last click */
    this.lastClickTime = 0;
    
    /** @type {boolean} Whether streak bonus is currently active */
    this.streakBonusActive = false;
    
    /** @type {number} Current streak bonus multiplier */
    this.streakBonusMultiplier = 1;
    
    /** @type {number} When current streak bonus expires */
    this.streakBonusExpiresAt = 0;
    
    /** @type {number} Best streak ever achieved */
    this.bestStreakEver = 0;
    
    
    // ===============================
    // ABILITY SYSTEM
    // ===============================
    // Flattened from loops.hybrid.abilities
    
    /** @type {Array<string|null>} 4-slot ability belt [slot1, slot2, slot3, slot4] */
    this.abilityBelt = [null, null, null, null];
    
    /** @type {Set<string>} Unlocked ability IDs */
    this.unlockedAbilities = new Set();
    
    /** @type {Map<string, number>} Ability ID -> usage count */
    this.abilityUsage = new Map();
    
    
    // ===============================
    // INITIALIZATION
    // ===============================
    
    // Initialize SaveManager FIRST (before load)
    this.saveManager = new SaveManager(this);
    
    // Load existing save data or set defaults
    this.load();
    
    // Initialize assistant levels from data
    this.initializeAssistantLevels();
    
    // Mark as initialized
    this._initialized = true;
    
    // Initialize the game state
    this.initializeGameState();
    
    // console.log('[GAMESTATE_FLAT] Flat state architecture initialized');
  }

  /**
   * Initialize the game state with default values
   */
  initializeGameState() {
    // Set default values
    this.setDefaults();
    
    // Initialize assistant levels
    this.initializeAssistantLevels();
    
    // Initialize other game state
    this.analogStartTime = Date.now();
    this.lastSaveTime = Date.now();
    
    // Mark as initialized
    this._initialized = true;
  }
  
  /**
   * Initialize assistant levels from assistant data
   * This ensures all assistants have their default levels set
   */
  initializeAssistantLevels() {
    for (const assistant of ASSISTANTS) {
      if (!this._assistantLevels.has(assistant.id)) {
        this._assistantLevels.set(assistant.id, assistant.level || 0);
      }
    }
  }
  
  /**
   * Mark a section as changed for incremental saves
   * @param {string} section - Section that changed
   */
  markChanged(section) {
    if (this.saveManager) {
      this.saveManager.markChanged(section);
    }
  }
  
  /**
   * Property getter for boosts (compatibility with object access)
   * @returns {object} Boosts as object for backward compatibility
   */
  get boosts() {
    const boostsSet = this._boosts;  // The actual Set
    const self = this;  // Reference to GameStateFlat instance
    return new Proxy({}, {
      get(target, prop) {
        // Expose Set methods
        if (prop === 'add') {
          return (value) => {
            boostsSet.add(value);
            target[value] = true;
            // Mark inventory as changed for incremental saves
            if (self.markChanged) {
              self.markChanged('inventory');
            }
            return boostsSet;
          };
        }
        if (prop === 'delete') {
          return (value) => {
            const result = boostsSet.delete(value);
            delete target[value];
            // Mark inventory as changed for incremental saves
            if (self.markChanged) {
              self.markChanged('inventory');
            }
            return result;
          };
        }
        if (prop === 'has') {
          return (value) => boostsSet.has(value);
        }
        if (prop === 'clear') {
          return () => {
            boostsSet.clear();
            Object.keys(target).forEach(key => delete target[key]);
            // Mark inventory as changed for incremental saves
            if (self.markChanged) {
              self.markChanged('inventory');
            }
          };
        }
        if (prop === 'size') {
          return boostsSet.size;
        }
        if (prop === 'forEach') {
          return (callback) => boostsSet.forEach(callback);
        }
        if (prop === 'values') {
          return () => boostsSet.values();
        }
        if (prop === 'keys') {
          return () => boostsSet.keys();
        }
        
        // Object-style access
        if (typeof prop === 'string') {
          return boostsSet.has(prop);
        }
        return target[prop];
      },
      set(target, prop, value) {
        if (typeof prop === 'string') {
          if (value) {
            boostsSet.add(prop);
          } else {
            boostsSet.delete(prop);
          }
          target[prop] = value;
          // Mark inventory as changed for incremental saves
          if (self.markChanged) {
            self.markChanged('inventory');
          }
        } else {
          target[prop] = value;
        }
        return true;
      },
      has(target, prop) {
        return boostsSet.has(prop);
      }
    });
  }
  
  /**
   * Property setter for boosts (compatibility)
   * @param {object|Set} boosts - New boosts object or Set
   */
  set boosts(boosts) {
    if (boosts instanceof Set) {
      this._boosts = boosts;
    } else if (boosts && typeof boosts === 'object') {
      this._boosts.clear();
      for (const [id, owned] of Object.entries(boosts)) {
        if (owned) {
          this._boosts.add(id);
        }
      }
    }
  }
  
  /**
   * Property getter for assistantMultipliers (compatibility with object access)
   * @returns {object} Assistant multipliers as object for backward compatibility
   */
  get assistantMultipliers() {
    const multipliersMap = this._assistantMultipliers;  // The actual Map
    const self = this;  // Reference to GameStateFlat instance
    return new Proxy(Object.fromEntries(multipliersMap), {
      get(target, prop) {
        if (typeof prop === 'string') {
          return multipliersMap.get(prop) || 1;
        }
        return target[prop];
      },
      set(target, prop, value) {
        if (typeof prop === 'string') {
          multipliersMap.set(prop, value);
          target[prop] = value;
          // Mark assistants as changed for incremental saves
          if (self.markChanged) {
            self.markChanged('assistants');
          }
        } else {
          target[prop] = value;
        }
        return true;
      },
      has(target, prop) {
        return multipliersMap.has(prop);
      }
    });
  }
  
  /**
   * Property setter for assistantMultipliers (compatibility)
   * @param {object} multipliers - New assistant multipliers object
   */
  set assistantMultipliers(multipliers) {
    if (multipliers instanceof Map) {
      this._assistantMultipliers = multipliers;
    } else if (multipliers && typeof multipliers === 'object') {
      this._assistantMultipliers.clear();
      for (const [id, multiplier] of Object.entries(multipliers)) {
        this._assistantMultipliers.set(id, multiplier);
      }
    }
  }
  
  /**
   * Compatibility layer for nested loops structure
   * Provides access to the old nested structure for compatibility with existing code
   */
  get loops() {
    const self = this;
    return {
      active: {
        clicking: {
          streakSystem: this.clickStreak,
          lastClickTime: this.lastClickTime,
          totalClicks: this.totalClicks
        }
      },
      passive: {
        assistants: {
          owned: this.assistants
        }
      },
      hybrid: {
        yetis: {
          sighted: this.yetisSighted
        },
        abilities: {
          abilityBelt: new Proxy({
            slot1: this.abilityBelt[0],
            slot2: this.abilityBelt[1],
            slot3: this.abilityBelt[2],
            slot4: this.abilityBelt[3]
          }, {
            get(target, prop) {
              if (prop === 'slot1') return self.abilityBelt[0];
              if (prop === 'slot2') return self.abilityBelt[1];
              if (prop === 'slot3') return self.abilityBelt[2];
              if (prop === 'slot4') return self.abilityBelt[3];
              return target[prop];
            },
            set(target, prop, value) {
              if (prop === 'slot1') {
                self.abilityBelt[0] = value;
                target[prop] = value;
                return true;
              }
              if (prop === 'slot2') {
                self.abilityBelt[1] = value;
                target[prop] = value;
                return true;
              }
              if (prop === 'slot3') {
                self.abilityBelt[2] = value;
                target[prop] = value;
                return true;
              }
              if (prop === 'slot4') {
                self.abilityBelt[3] = value;
                target[prop] = value;
                return true;
              }
              target[prop] = value;
              return true;
            }
          }),
          usage: this.abilityUsage
        }
      }
    };
  }
  
  /**
   * Add snowballs to the player's balance
   * High-performance version with minimal overhead
   * 
   * @param {number} amount - Amount to add
   * @param {string} source - Source type ('click', 'assistant', etc.)
   * @param {string|null} sourceId - Specific source ID (assistant ID, etc.)
   */
  addSnowballs(amount, source = 'unknown', sourceId = null) {
    // Ensure numeric amount to prevent string concatenation
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return;
    
    // Update balances - direct property access for performance
    this.snowballs += numericAmount;
    this.lifetimeSnowballs += numericAmount;
    this.currentAnalogSnowballs += numericAmount;
    
    // Track source-specific statistics
    if (source === 'click') {
      this.lifetimeClicks += numericAmount;
    } else if (source === 'assistant' && sourceId) {
      const current = this._lifetimeFromAssistants.get(sourceId) || 0;
      this._lifetimeFromAssistants.set(sourceId, current + numericAmount);
      this.markChanged('assistants');
    }
    
    // Mark core data as changed for incremental saves
    this.markChanged('core');
    
    // Note: Save and display update will be handled by managers
  }
  
  /**
   * Update SPS history for acceleration calculation
   * Maintains a rolling window of the last 30 entries
   */
  updateSpsHistory() {
    const currentTime = this.getGameTime();
    
    this.spsHistory.push({
      time: currentTime,
      sps: this.sps
    });
    
    // Keep only last 30 entries (6 seconds at 200ms tick rate)
    if (this.spsHistory.length > 30) {
      this.spsHistory.shift();
    }
  }
  
  /**
   * Get current game time (accelerated by TIME_RATE)
   * @returns {number} Current game time in milliseconds
   */
  getGameTime() {
    return Date.now() * TIME_RATE;
  }
  
  /**
   * Get current game time in seconds
   * @returns {number} Current game time in seconds
   */
  getGameTimeSeconds() {
    return Math.floor(this.getGameTime() / 1000);
  }
  
  /**
   * Convert real time to game time (accelerated)
   * @param {number} realTime - Real time in milliseconds
   * @returns {number} Game time in milliseconds
   */
  realTimeToGameTime(realTime) {
    return realTime * TIME_RATE;
  }
  
  /**
   * End the current analog and prepare for the next one
   * Creates analog summary, increments analog number, and resets current analog state
   */
  endCurrentAnalog() {
    // Calculate snowflakes from lifetime snowballs
    const snowflakeCost = this.snowflakeCost || 1000000; // Default rate
    const snowflakesEarned = Math.floor(this.lifetimeSnowballs / snowflakeCost);
    
    // Remove crystal snowball multiplier from SPS to get base SPS
    const crystalSnowballMultiplier = this.crystalSnowballMultiplier || 1;
    const spsWithoutCrystal = this.sps / crystalSnowballMultiplier;
    
    const analogSummary = {
      number: this.analogNumber,
      startTime: this.analogStartTime || Date.now(),
      endTime: Date.now(),
      finalSPS: spsWithoutCrystal, // SPS without crystal snowball bonus
      assistants: Object.fromEntries(this._assistants || new Map()),
      snowballs: this.snowballs, // Pre-conversion wallet
      currentAnalogSnowballs: this.currentAnalogSnowballs,
      lifetimeSnowballs: this.currentAnalogSnowballs, // Snowballs generated during this analog only (not cumulative)
      lifetimeFromAssistants: Object.fromEntries(this._lifetimeFromAssistants || new Map()),
      iciclesHarvested: this.icicles || 0, // Current icicle wallet value
      preMeltdownSnowflakes: this.snowflakes || 0, // Current snowflake wallet value
      achievements: this._achievementsObject || {},
      lore: this.lore || { unlocked: [], unlockedTimestamps: {}, viewed: {} } // lore is already a plain object, not a Map
    };
    
    // Add to analogs history (ensure the array exists)
    if (!this.analogs) {
      this.analogs = [];
    }
    this.analogs.push(analogSummary);
    
    // Advance to next analog
    this.analogNumber++;
    
    // Update snowflake cost for the new analog
    if (window.SNOWFLAKE_CONFIG) {
      this.snowflakeCost = window.SNOWFLAKE_CONFIG.baseCost * window.SNOWFLAKE_CONFIG.costRate ** (this.analogNumber - 1);
    }
    
    // console.log(`[GAMESTATE_FLAT] Analog ${analogSummary.number} completed, starting analog ${this.analogNumber}`);
    
    // Reset analog-specific state
    
    this.save();
    
    // console.log(`[GAMESTATE_FLAT] Analog ${analogSummary.number} completed, starting analog ${this.analogNumber}`);
  }
  
  /**
   * Load game state using SaveManager
   */
  load() {
    if (!this.saveManager) {
      // console.error('[GAMESTATE_FLAT] SaveManager not initialized');
      this.setDefaults();
      return false;
    }
    return this.saveManager.load();
  }
  
  /**
   * Load data from flat save structure
   * @param {object} data - Parsed save data
   */
  loadFlatData(data) {
    // Load primitive values
    this.snowballs = data.snowballs || 0;
    this.spc = data.spc || 1;
    this.sps = data.sps || 0;
    this.analogNumber = data.analogNumber || 1;
    this.snowflakes = data.snowflakes || 0;
    this.playerLevel = data.playerLevel || 0;
    
    // Load lifetime statistics
    this.lifetimeSnowballs = data.lifetimeSnowballs || 0;
    this.lifetimeClicks = data.lifetimeClicks || 0;
    this._totalPlayTime = data.totalPlayTime || 0;
    this.currentAnalogSnowballs = data.currentAnalogSnowballs || 0;
    
    // Load Maps
    if (data.lifetimeFromAssistants) {
      this._lifetimeFromAssistants = new Map(Object.entries(data.lifetimeFromAssistants));
    }
    if (data.assistants) {
      this._assistants = new Map(Object.entries(data.assistants));
    }
    if (data.assistantLevels) {
      this._assistantLevels = new Map(Object.entries(data.assistantLevels));
    }
    if (data.assistantMultipliers) {
      this._assistantMultipliers = new Map(Object.entries(data.assistantMultipliers));
    }
    if (data.achievements) {
      this._achievementsObject = data.achievements;
    } else {
      // Initialize achievements if not present in save data
      this._achievementsObject = {
        unlocked: [],
        unlockedTimestamps: {},
        progress: {},
        lastCheck: 0
      };
    }
    if (data.lore) {
      this.lore = {
        unlocked: data.lore.unlocked || [],
        unlockedTimestamps: data.lore.unlockedTimestamps || {},
        viewed: data.lore.viewed || {}
      };
    } else {
      // Initialize lore if not present in save data
      this.lore = {
        unlocked: [],
        unlockedTimestamps: {},
        viewed: {}
      };
    }
    if (data.abilityUsage) {
      this.abilityUsage = new Map(Object.entries(data.abilityUsage));
    }
    
    // Load Sets
    if (data.boosts) {
      this._boosts = new Set(data.boosts);
    }
    if (data.globalUpgrades) {
      this._globalUpgrades = new Set(data.globalUpgrades);
    }
    if (data.unlockedLocations) {
      this.unlockedLocations = new Set(data.unlockedLocations);
    }
    if (data.unlockedAbilities) {
      this.unlockedAbilities = new Set(data.unlockedAbilities);
    }
    
    // Load arrays and objects
    this.persistentUpgrades = data.persistentUpgrades || [];
    this.analogHistory = data.analogHistory || [];
    this.analogs = data.analogs || [];
    this.spsHistory = data.spsHistory || [];
    this.abilityBelt = data.abilityBelt || [null, null, null, null];
    
    // Load object properties
    this.currentYetiBuff = data.currentYetiBuff || null;
    this.currentLocationBuff = data.currentLocationBuff || null;
    this.icicleState = data.icicleState || { startTime: 0, harvested: false, broken: false, lastCheckedHour: 0 };
    this.battles = data.battles || {
      yetiBattles: false,
      battleProbability: 1.0,
      abilityBeltLevel: 0,
      currentEvilYeti: null,
      currentDebuff: null,
      battleHistory: []
    };
    
    // Load snowflake upgrade properties
    this.startingSnowballs = data.startingSnowballs || 0;
    this.startingAssistants = data.startingAssistants || {};
    this.startingBabyYeti = data.startingBabyYeti || [];
    
    // Load Concord mechanic activation flags
    this.yetiSpawnsActive = data.yetiSpawnsActive || false;
    this.travelActive = data.travelActive || false;
    this.abilitiesActive = data.abilitiesActive || false;
    this.battlesActive = data.battlesActive || false;
    
    // Load multipliers and counters
    this.globalSpsMultiplier = data.globalSpsMultiplier || 1;
    this.clickMultiplier = data.clickMultiplier || 1;
    this.classX2Buff = data.classX2Buff || 1;
    this.iciclePendingLevels = data.iciclePendingLevels || 0;
    this.yetisSighted = data.yetisSighted || 0;
    this.locationsVisited = data.locationsVisited || 0;
    this.evilYetisBattled = data.evilYetisBattled || 0;
    this.prestigeCount = data.prestigeCount || 0;
    
    // Load click streak data
    this.totalClicks = data.totalClicks || 0;
    if (data.clickStreak && typeof data.clickStreak === 'object') {
      this.clickStreak = {
        ...this.clickStreak,
        ...data.clickStreak
      };
    } else {
      // Handle old save format where clickStreak was just a number
      this.clickStreak.bestStreak = data.clickStreak || 0;
      this.clickStreak.currentStreak = data.clickStreak || 0;
    }
    this.lastClickTime = data.lastClickTime || 0;
    this.streakBonusActive = data.streakBonusActive || false;
    this.streakBonusMultiplier = data.streakBonusMultiplier || 1;
    this.streakBonusExpiresAt = data.streakBonusExpiresAt || 0;
    this.bestStreakEver = data.bestStreakEver || 0;
    
    // Load travel discounts
    this.travelDiscountGlobalUpgrades = data.travelDiscountGlobalUpgrades || 1;
    this.travelDiscountAssistants = data.travelDiscountAssistants || 1;
    this.travelSPSMultiplier = data.travelSPSMultiplier || 1;
    this.travelDiscountBoosts = data.travelDiscountBoosts || 1;
    
    this.analogStartTime = data.analogStartTime || Date.now();
  }
  
  /**
   * Set default values for new game
   */
  setDefaults() {
    this.snowballs = STARTING_SNOWBALLS;
    this.lifetimeSnowballs = STARTING_SNOWBALLS;
    this.currentAnalogSnowballs = STARTING_SNOWBALLS;
    this.lifetimeClicks = STARTING_SNOWBALLS;
    this.analogStartTime = Date.now();
    
    // Reset collection tracking
    this.yetisSighted = 0;
    this.locationsVisited = 0;
    this.evilYetisBattled = 0;
    
    // Concord mechanics start disabled in new games
    this.yetiSpawnsActive = false;
    this.travelActive = false;
    this.abilitiesActive = false;
    this.battlesActive = false;
    
    // Ensure lore is properly initialized
    if (!this.lore) {
      this.lore = {
        unlocked: [],
        unlockedTimestamps: {},
        viewed: {}
      };
    }
    
    // Ensure achievements are properly initialized
    if (!this._achievementsObject) {
      this._achievementsObject = {
        unlocked: [],
        unlockedTimestamps: {},
        progress: {},
        lastCheck: 0
      };
    }
  }
  
  /**
   * Save game state using SaveManager
   * @param {boolean} forceFullSave - Force a full save instead of incremental
   */
  save(forceFullSave = false) {
    if (!this.saveManager) {
      // console.error('[GAMESTATE_FLAT] SaveManager not initialized');
      return false;
    }
    return this.saveManager.save(forceFullSave);
  }
  
  /**
   * Get buff stacking status
   * Determines if same-class yeti and location buffs are active
   * @returns {object} Object with isStacking, multiplier, yetiClass, and locationClass
   */
  getBuffStackingStatus() {
    // Default status when no stacking
    const defaultStatus = {
      isStacking: false,
      multiplier: 1,
      yetiClass: this.currentYetiBuff?.class || null,
      locationClass: this.currentLocationBuff?.class || null
    };
    
    // Check if both buffs are active
    if (!this.currentYetiBuff || !this.currentLocationBuff) {
      return defaultStatus;
    }
    
    // Get classes from both buffs
    const yetiClass = this.currentYetiBuff.class;
    const locationClass = this.currentLocationBuff.class;
    
    // Check if classes match (same class = stacking active)
    const isStacking = yetiClass && locationClass && (yetiClass === locationClass);
    
    return {
      isStacking: isStacking,
      multiplier: isStacking ? 2 : 1, // 2x multiplier when stacking
      yetiClass: yetiClass,
      locationClass: locationClass
    };
  }
  
  /**
   * Update the game display
   * This method handles updating the UI elements with current game state
   * TODO: This will be moved to a separate UI manager in the future
   */
  updateDisplay() {
    // Update basic currency displays
    this.updateCurrencyDisplays();
    
    // Emit game state change event for other systems
    if (typeof window !== 'undefined' && window.eventBus) {
      window.eventBus.emit('gameStateChanged', {
        snowballs: this.snowballs,
        lifetime: this.lifetimeSnowballs,
        sps: this.sps,
        snowflakes: this.snowflakes,
        analogNumber: this.analogNumber
      });
    }
  }
  
  /**
   * Update currency displays with current values
   */
  updateCurrencyDisplays() {
    const safeUpdateElement = (id, value) => {
      if (typeof document !== 'undefined') {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = value;
        }
      }
    };
    
    // Update main currency displays
    safeUpdateElement('snowballs', this.snowballs.toExponential(2));
    safeUpdateElement('lifetime', this.lifetimeSnowballs.toExponential(2));
    safeUpdateElement('currentAnalogSnowballs', this.currentAnalogSnowballs.toExponential(2));
    safeUpdateElement('sps', this.sps.toExponential(2));
    safeUpdateElement('snowflakes', this.snowflakes.toExponential(2));
    safeUpdateElement('analogNumber', this.analogNumber.toString());
  }
  
  /**
   * Record a click event for analytics
   * @param {number} amount - Amount of snowballs gained from click
   * @param {number} timestamp - Timestamp of the click
   */
  recordClick(amount, timestamp = Date.now()) {
    // Update click statistics
    this.totalClicks++;
    this.lastClickTime = timestamp;
    
    // Track click timing for streak system
    const gameTime = this.getGameTime();
    
    // Simple click tracking - the detailed streak system will be handled elsewhere
    // console.log(`[GAMESTATE_FLAT] Click recorded: ${amount} snowballs, total clicks: ${this.totalClicks}`);
    
    // Emit click event
  }
  
  /**
   * Record an assistant purchase for analytics
   * @param {string} assistantId - ID of the assistant purchased
   * @param {number} count - Number of assistants purchased
   * @param {number} cost - Cost of the purchase
   */
  recordAssistantPurchase(assistantId, count, cost) {
    // Update assistant statistics
    const currentFromAssistant = this.lifetimeFromAssistants.get(assistantId) || 0;
    // Note: This records the purchase, not the snowballs earned
    // The actual snowball earnings are tracked in addSnowballs()
    
    // Record the purchase
    this.assistantPurchases[assistantId] = (this.assistantPurchases[assistantId] || 0) + count;
    
    // console.log(`[GAMESTATE_FLAT] Assistant purchase recorded: ${assistantId} x${count} for ${cost} snowballs`);
    
    // Emit purchase event
  }
  
  /**
   * Record a yeti interaction for analytics
   * @param {string} yetiClass - Class of the yeti
   * @param {string} interactionType - Type of interaction
   * @param {object} data - Additional data about the interaction
   */
  recordYetiInteraction(yetiClass, interactionType, data = {}) {
    // Update yeti statistics
    if (interactionType === 'spawn') {
      this.yetisSighted++;
    }
    
    // Record the interaction
    this.yetiInteractions[yetiClass] = this.yetiInteractions[yetiClass] || {};
    this.yetiInteractions[yetiClass][interactionType] = (this.yetiInteractions[yetiClass][interactionType] || 0) + 1;
    
    // console.log(`[GAMESTATE_FLAT] Yeti interaction recorded: ${yetiClass} ${interactionType}`, data);
    
    // Emit yeti interaction event
  }
  
  /**
   * Get loop state for a specific system
   * This is a compatibility method for the old nested loop system
   * @param {string} loopType - Type of loop ('active', 'passive', 'hybrid')
   * @param {string} systemName - Name of the system
   * @returns {object} System state object
   */
  getLoopState(loopType, systemName) {
    // Return appropriate state based on system
    switch (`${loopType}.${systemName}`) {
      case 'active.clicking':
        return {
          totalClicks: this.totalClicks,
          clickStreak: this.clickStreak,
          lastClickTime: this.lastClickTime,
          streakBonusActive: this.streakBonusActive,
          streakBonusMultiplier: this.streakBonusMultiplier
        };
      
      case 'passive.assistants':
        return {
          owned: Object.fromEntries(this._assistants),
          levels: Object.fromEntries(this._assistantLevels),
          multipliers: Object.fromEntries(this._assistantMultipliers)
        };
      
      case 'hybrid.travel':
        return {
          unlockedLocations: Array.from(this.unlockedLocations),
          currentLocationBuff: this.currentLocationBuff,
          travelDiscountGlobalUpgrades: this.travelDiscountGlobalUpgrades,
          travelDiscountAssistants: this.travelDiscountAssistants,
          travelSPSMultiplier: this.travelSPSMultiplier,
          travelDiscountBoosts: this.travelDiscountBoosts
        };
      
      default:
        // console.warn(`[GAMESTATE_FLAT] Unknown loop state requested: ${loopType}.${systemName}`);
        return null;
    }
  }
  
  /**
   * Property getter for achievements (compatibility)
   * @returns {object} Achievement state object with unlocked, unlockedTimestamps, progress, lastCheck
   */
  get achievements() {
    return this._achievementsObject || {
      unlocked: [],
      unlockedTimestamps: {},
      progress: {},
      lastCheck: 0
    };
  }
  
  /**
   * Property setter for achievements (compatibility)
   * @param {object} achievements - New achievement state
   */
  set achievements(achievements) {
    if (achievements && typeof achievements === 'object') {
      this._achievementsObject = achievements;
    } else {
      this._achievementsObject = {
        unlocked: [],
        unlockedTimestamps: {},
        progress: {},
        lastCheck: 0
      };
    }
  }
  
  /**
   * Property getter for meltdownActive (compatibility)
   * @returns {boolean} Whether meltdown is active
   */
  get meltdownActive() {
    return this._meltdownActive || false;
  }
  
  /**
   * Property setter for meltdownActive (compatibility)
   * @param {boolean} active - Whether meltdown is active
   */
  set meltdownActive(active) {
    this._meltdownActive = active;
  }
  
  /**
   * Property getter for _spsByAssistant (compatibility)
   * @returns {object} SPS breakdown by assistant
   */
  get _spsByAssistant() {
    return this._spsByAssistantCache || {};
  }
  
  /**
   * Property setter for _spsByAssistant (compatibility)
   * @param {object} spsByAssistant - SPS breakdown by assistant
   */
  set _spsByAssistant(spsByAssistant) {
    this._spsByAssistantCache = spsByAssistant;
  }
  
  /**
   * Property getter for assistants (compatibility with object access)
   * @returns {object} Assistants as object for backward compatibility
   */
  get assistants() {
    // Create a proxy object that behaves like the old object interface AND exposes Map methods
    const assistantsMap = this._assistants;  // The actual Map (from constructor)
    const self = this;  // Reference to GameStateFlat instance
    return new Proxy(Object.fromEntries(assistantsMap), {
      get(target, prop) {
        // Expose Map methods
        if (prop === 'set') {
          return (key, value) => {
            assistantsMap.set(key, value);
            target[key] = value;
            // Mark assistants as changed for incremental saves
            if (self.markChanged) {
              self.markChanged('assistants');
            }
            return assistantsMap;
          };
        }
        if (prop === 'get') {
          return (key) => assistantsMap.get(key);
        }
        if (prop === 'has') {
          return (key) => assistantsMap.has(key);
        }
        if (prop === 'delete') {
          return (key) => {
            const result = assistantsMap.delete(key);
            delete target[key];
            // Mark assistants as changed for incremental saves
            if (self.markChanged) {
              self.markChanged('assistants');
            }
            return result;
          };
        }
        if (prop === 'clear') {
          return () => {
            assistantsMap.clear();
            Object.keys(target).forEach(key => delete target[key]);
            // Mark assistants as changed for incremental saves
            if (self.markChanged) {
              self.markChanged('assistants');
            }
          };
        }
        if (prop === 'size') {
          return assistantsMap.size;
        }
        
        // Object-style access
        if (typeof prop === 'string') {
          return assistantsMap.get(prop) || 0;
        }
        return target[prop];
      },
      set(target, prop, value) {
        if (typeof prop === 'string') {
          assistantsMap.set(prop, value);
          target[prop] = value;
          // Mark assistants as changed for incremental saves
          if (self.markChanged) {
            self.markChanged('assistants');
          }
        } else {
          target[prop] = value;
        }
        return true;
      },
      has(target, prop) {
        return assistantsMap.has(prop);
      }
    });
  }
  
  /**
   * Property setter for assistants (compatibility)
   * @param {object} assistants - New assistants object
   */
  set assistants(assistants) {
    if (assistants instanceof Map) {
      this._assistants = assistants;
    } else if (assistants && typeof assistants === 'object') {
      this._assistants.clear();
      for (const [id, count] of Object.entries(assistants)) {
        this._assistants.set(id, count);
      }
    }
  }
  
  /**
   * Property getter for assistantLevels (compatibility with object access)
   * @returns {object} Assistant levels as object for backward compatibility
   */
  get assistantLevels() {
    const levelsMap = this._assistantLevels;  // The actual Map
    return new Proxy(Object.fromEntries(levelsMap), {
      get(target, prop) {
        if (typeof prop === 'string') {
          return levelsMap.get(prop) || 0;
        }
        return target[prop];
      },
      set(target, prop, value) {
        if (typeof prop === 'string') {
          levelsMap.set(prop, value);
          target[prop] = value;
        } else {
          target[prop] = value;
        }
        return true;
      },
      has(target, prop) {
        return levelsMap.has(prop);
      }
    });
  }
  
  /**
   * Property setter for assistantLevels (compatibility)
   * @param {object} levels - New assistant levels object
   */
  set assistantLevels(levels) {
    if (levels instanceof Map) {
      this._assistantLevels = levels;
    } else if (levels && typeof levels === 'object') {
      this._assistantLevels.clear();
      for (const [id, level] of Object.entries(levels)) {
        this._assistantLevels.set(id, level);
      }
    }
  }
  
  /**
   * Property getter for lifetimeFromAssistants (compatibility)
   * @returns {object} Lifetime from assistants as object for backward compatibility
   */
  get lifetimeFromAssistants() {
    const lifetimeMap = this._lifetimeFromAssistants;  // The actual Map
    return new Proxy(Object.fromEntries(lifetimeMap), {
      get(target, prop) {
        if (typeof prop === 'string') {
          return lifetimeMap.get(prop) || 0;
        }
        return target[prop];
      },
      set(target, prop, value) {
        if (typeof prop === 'string') {
          lifetimeMap.set(prop, value);
          target[prop] = value;
        } else {
          target[prop] = value;
        }
        return true;
      },
      has(target, prop) {
        return lifetimeMap.has(prop);
      }
    });
  }
  
  /**
   * Property setter for lifetimeFromAssistants (compatibility)
   * @param {object} lifetime - New lifetime from assistants object
   */
  set lifetimeFromAssistants(lifetime) {
    if (lifetime instanceof Map) {
      this._lifetimeFromAssistants = lifetime;
    } else if (lifetime && typeof lifetime === 'object') {
      this._lifetimeFromAssistants.clear();
      for (const [id, amount] of Object.entries(lifetime)) {
        this._lifetimeFromAssistants.set(id, amount);
      }
    }
  }
  
  /**
   * Property getter for globalUpgrades (compatibility with object access)
   * @returns {object} Global upgrades as object for backward compatibility
   */
  get globalUpgrades() {
    const upgradesSet = this._globalUpgrades;  // The actual Set
    return new Proxy({}, {
      get(target, prop) {
        if (typeof prop === 'string') {
          return upgradesSet.has(prop);
        }
        return target[prop];
      },
      set(target, prop, value) {
        if (typeof prop === 'string') {
          if (value) {
            upgradesSet.add(prop);
          } else {
            upgradesSet.delete(prop);
          }
          target[prop] = value;
        } else {
          target[prop] = value;
        }
        return true;
      },
      has(target, prop) {
        return upgradesSet.has(prop);
      }
    });
  }
  
  /**
   * Property setter for globalUpgrades (compatibility)
   * @param {object|Set} upgrades - New global upgrades object or Set
   */
  set globalUpgrades(upgrades) {
    if (upgrades instanceof Set) {
      this._globalUpgrades = upgrades;
    } else if (upgrades && typeof upgrades === 'object') {
      this._globalUpgrades.clear();
      for (const [id, owned] of Object.entries(upgrades)) {
        if (owned) {
          this._globalUpgrades.add(id);
        }
      }
    }
  }
  
  get totalPlayTime() {
    return this._totalPlayTime || 0;
  }
  
  set totalPlayTime(time) {
    this._totalPlayTime = time;
  }
  
  // Idle time getters and setters
  get idleTimeInfo() {
    return this.idleTime.info;
  }
  
  set idleTimeInfo(info) {
    this.idleTime.info = info;
  }
  
  get idleBonusRate() {
    return this.idleTime.idleBonusRate;
  }
  
  set idleBonusRate(rate) {
    // RECOMMENDATION 2: Rate Bounds - Validate and clamp idle bonus rate when setting
    const baseIdleRate = 0.01; // Base rate from constructor
    const maxIdleRate = 2.0; // Maximum 200% idle rate
    
    let validatedRate = rate;
    
    // Type validation
    if (typeof rate !== 'number' || isNaN(rate)) {
      console.warn('[IDLE_BONUS] Invalid idle bonus rate type:', rate, 'resetting to base rate');
      validatedRate = baseIdleRate;
    }
    
    // Bounds validation
    if (validatedRate < 0) {
      console.warn('[IDLE_BONUS] Negative idle bonus rate rejected:', rate, 'clamping to 0');
      validatedRate = 0;
    } else if (validatedRate > maxIdleRate) {
      console.warn('[IDLE_BONUS] Excessive idle bonus rate rejected:', rate, 'clamping to', maxIdleRate);
      validatedRate = maxIdleRate;
    }
    
    // Apply the validated rate
    this.idleTime.idleBonusRate = validatedRate;
    
    // Log rate changes for debugging
    if (rate !== validatedRate) {
      console.log(`[IDLE_BONUS] Rate adjusted from ${rate} to ${validatedRate} (${(validatedRate * 100).toFixed(1)}%)`);
    }
  }
  
  /**
   * Get idle bonus statistics for debugging and monitoring
   * @returns {object} Idle bonus statistics
   */
  getIdleBonusStats() {
    const stats = {
      currentRate: this.idleBonusRate,
      currentRatePercentage: (this.idleBonusRate * 100).toFixed(1) + '%',
      baseRate: 0.01,
      maxRate: 2.0,
      totalIdleGains: this.totalIdleGains,
      totalIdleTime: this.idleTime.totalIdleTime,
      bonusHistoryCount: this.idleTime.idleBonusesApplied.length,
      lastCalculation: this.idleTime.lastIdleCalculation,
      lastCalculationDate: this.idleTime.lastIdleCalculation ? new Date(this.idleTime.lastIdleCalculation).toISOString() : null,
      // RECOMMENDATION 6: Enhanced Debug Data - Include current game state context
      currentSPS: this.sps,
      currentSnowballs: this.snowballs,
      currentAnalogNumber: this.analogNumber,
      // Snowflake upgrade context
      persistentUpgradesCount: this.persistentUpgrades.length,
      idleBonusUpgrades: this.persistentUpgrades.filter(id => id.startsWith('idleBonus_')).length
    };
    
    // Add recent bonus history (last 5 entries)
    if (this.idleTime.idleBonusesApplied.length > 0) {
      stats.recentBonuses = this.idleTime.idleBonusesApplied
        .slice(-5)
        .map(record => ({
          timestamp: new Date(record.timestamp).toISOString(),
          idleTimeHours: record.idleTimeHours.toFixed(2),
          idleBonus: record.idleBonus.toFixed(0),
          effectiveRate: (record.effectiveRate * 100).toFixed(1) + '%',
          contextSPS: record.contextSPS,
          contextSnowballs: record.contextSnowballs
        }));
    }
    
    return stats;
  }
  
  get idleBonusMultiplier() {
    return this.idleTime.idleBonusMultiplier;
  }
  
  set idleBonusMultiplier(multiplier) {
    this.idleTime.idleBonusMultiplier = multiplier;
  }
  
  get totalIdleGains() {
    return this.idleTime.totalIdleGains;
  }
  
  set totalIdleGains(gains) {
    this.idleTime.totalIdleGains = gains;
  }
  
  /**
   * Force cleanup of old idle bonus records to prevent memory bloat
   * @param {number} maxRecords - Maximum number of records to keep (default: 50)
   */
  cleanupIdleBonusHistory(maxRecords = 50) {
    const currentCount = this.idleTime.idleBonusesApplied.length;
    if (currentCount > maxRecords) {
      const removedCount = currentCount - maxRecords;
      this.idleTime.idleBonusesApplied.splice(0, removedCount);
      console.log(`[IDLE_BONUS] Manual cleanup: removed ${removedCount} old idle bonus records`);
      this.markChanged('idleTime');
    } else {
      console.log(`[IDLE_BONUS] No cleanup needed: ${currentCount} records (max: ${maxRecords})`);
    }
  }
  
  /**
   * Validate idle bonus system state and fix any issues
   * @returns {object} Validation results
   */
  validateIdleBonusSystem() {
    const results = {
      valid: true,
      issues: [],
      fixes: []
    };
    
    // Check idle bonus rate
    if (typeof this.idleBonusRate !== 'number' || isNaN(this.idleBonusRate)) {
      results.valid = false;
      results.issues.push('Invalid idle bonus rate type or NaN');
      this.idleBonusRate = 0.01; // Reset to base rate
      results.fixes.push('Reset idle bonus rate to base rate (1%)');
    }
    
    // Check rate bounds
    if (this.idleBonusRate < 0) {
      results.valid = false;
      results.issues.push('Negative idle bonus rate detected');
      this.idleBonusRate = 0;
      results.fixes.push('Clamped idle bonus rate to 0%');
    } else if (this.idleBonusRate > 2.0) {
      results.valid = false;
      results.issues.push('Excessive idle bonus rate detected');
      this.idleBonusRate = 2.0;
      results.fixes.push('Clamped idle bonus rate to 200%');
    }
    
    // Check idle bonus history array
    if (!Array.isArray(this.idleTime.idleBonusesApplied)) {
      results.valid = false;
      results.issues.push('Invalid idle bonus history array');
      this.idleTime.idleBonusesApplied = [];
      results.fixes.push('Reinitialized idle bonus history array');
    }
    
    // Check for excessive history size
    if (this.idleTime.idleBonusesApplied.length > 100) {
      results.issues.push('Excessive idle bonus history size');
      this.cleanupIdleBonusHistory(50);
      results.fixes.push('Cleaned up idle bonus history to 50 records');
    }
    
    // Check last calculation time
    if (typeof this.idleTime.lastIdleCalculation !== 'number' || isNaN(this.idleTime.lastIdleCalculation)) {
      results.valid = false;
      results.issues.push('Invalid last calculation timestamp');
      this.idleTime.lastIdleCalculation = 0;
      results.fixes.push('Reset last calculation timestamp');
    }
    
    if (results.issues.length === 0) {
      results.message = 'Idle bonus system validation passed - no issues found';
    } else {
      results.message = `Idle bonus system validation completed with ${results.issues.length} issue(s) and ${results.fixes.length} fix(es)`;
    }
    
    return results;
  }
  
  /**
   * Get formatted idle bonus rate for display
   * @returns {string} Formatted idle bonus rate (e.g., "15.5%")
   */
  getFormattedIdleBonusRate() {
    const rate = this.idleBonusRate;
    if (typeof rate !== 'number' || isNaN(rate)) {
      return '1.0%'; // Fallback to base rate
    }
    return (rate * 100).toFixed(1) + '%';
  }
  
  /**
   * Get idle bonus rate description for UI display
   * @returns {string} Human-readable description of idle bonus rate
   */
  getIdleBonusRateDescription() {
    const rate = this.idleBonusRate;
    const baseRate = 0.01;
    const upgrades = this.persistentUpgrades.filter(id => id.startsWith('idleBonus_')).length;
    
    if (upgrades === 0) {
      return `Base idle bonus: ${(baseRate * 100).toFixed(1)}% of normal SPS`;
    } else if (upgrades === 1) {
      return `Idle bonus: ${(rate * 100).toFixed(1)}% of normal SPS (${upgrades} upgrade applied)`;
    } else {
      return `Idle bonus: ${(rate * 100).toFixed(1)}% of normal SPS (${upgrades} upgrades applied)`;
    }
  }
  
  /**
   * Calculate and apply idle bonuses based on stored idle time
   * @returns {object|null} Idle bonus information if applied, null if no idle time
   */
  calculateAndApplyIdleBonus() {
    // console.log('[IDLE_BONUS] calculateAndApplyIdleBonus called with idleTimeInfo:', this.idleTimeInfo);
    
    const idleInfo = this.idleTimeInfo;
    
    // No idle time to process
    if (!idleInfo || !idleInfo.isIdle || idleInfo.idleTimeMs <= 0) {
      // console.log('[IDLE_BONUS] Early return - no idle time to process:', {
      //   hasIdleInfo: !!idleInfo,
      //   isIdle: idleInfo ? idleInfo.isIdle : 'undefined',
      //   idleTimeMs: idleInfo ? idleInfo.idleTimeMs : 'undefined'
      // });
      return null;
    }
    
    // Check if we've already calculated bonuses for this idle period
    if (this.idleTime.lastIdleCalculation >= idleInfo.calculatedAt) {
      // console.log('[IDLE_BONUS] Early return - already calculated for this idle period:', {
      //   lastIdleCalculation: this.idleTime.lastIdleCalculation,
      //   calculatedAt: idleInfo.calculatedAt,
      //   lastIdleCalculationDate: new Date(this.idleTime.lastIdleCalculation).toISOString(),
      //   calculatedAtDate: new Date(idleInfo.calculatedAt).toISOString()
      // });
      return null;
    }
    
    // console.log('[IDLE_BONUS] Proceeding with idle bonus calculation...');
    
    // RECOMMENDATION 1: SPS Validation - Ensure SPS is valid before calculation
    if (typeof this.sps !== 'number' || isNaN(this.sps) || this.sps < 0) {
      console.warn('[IDLE_BONUS] Invalid SPS value detected:', this.sps, 'using fallback value');
      this.sps = 0; // Fallback to prevent calculation errors
    }
    
    // RECOMMENDATION 2: Rate Bounds - Validate idle bonus rate stays within reasonable bounds
    const baseIdleRate = 0.01; // Base rate from constructor
    const maxIdleRate = 2.0; // Maximum 200% idle rate to prevent excessive rewards
    
    let effectiveIdleRate = this.idleBonusRate;
    
    // Validate and clamp the idle bonus rate
    if (typeof effectiveIdleRate !== 'number' || isNaN(effectiveIdleRate)) {
      console.warn('[IDLE_BONUS] Invalid idle bonus rate detected:', effectiveIdleRate, 'resetting to base rate');
      effectiveIdleRate = baseIdleRate;
      this.idleBonusRate = baseIdleRate;
    }
    
    // Clamp rate to reasonable bounds
    if (effectiveIdleRate < 0) {
      console.warn('[IDLE_BONUS] Negative idle bonus rate detected:', effectiveIdleRate, 'clamping to 0');
      effectiveIdleRate = 0;
      this.idleBonusRate = 0;
    } else if (effectiveIdleRate > maxIdleRate) {
      console.warn('[IDLE_BONUS] Excessive idle bonus rate detected:', effectiveIdleRate, 'clamping to', maxIdleRate);
      effectiveIdleRate = maxIdleRate;
      this.idleBonusRate = maxIdleRate;
    }
    
    const idleTimeSeconds = idleInfo.idleTimeMs / 1000;
    
    // RECOMMENDATION 1: SPS Validation - Use validated SPS for calculation
    // Note: We use the current SPS which may include temporary bonuses
    // For idle bonuses, this is acceptable as it represents the player's current earning potential
    const normalEarnings = this.sps * idleTimeSeconds;
    const idleBonus = normalEarnings * effectiveIdleRate;
    
    // RECOMMENDATION 4: Error Handling - Validate calculation results
    if (isNaN(idleBonus) || !isFinite(idleBonus)) {
      console.error('[IDLE_BONUS] Invalid idle bonus calculation result:', {
        sps: this.snowballs,
        idleTimeSeconds,
        effectiveIdleRate,
        normalEarnings,
        idleBonus
      });
      return null;
    }
    
    // RECOMMENDATION 4: Error Handling - Ensure idle bonus is reasonable
    if (idleBonus < 0) {
      console.error('[IDLE_BONUS] Negative idle bonus calculated:', idleBonus, 'aborting');
      return null;
    }
    
    // RECOMMENDATION 6: Enhanced Debug Logging - Capture SPS and snowball count during idle
    console.log('[IDLE_BONUS] Idle bonus calculation:', {
      currentSPS: this.sps,
      currentSnowballs: this.snowballs,
      idleTimeMs: idleInfo.idleTimeMs,
      idleTimeHours: idleInfo.idleTimeHours,
      effectiveIdleRate: effectiveIdleRate,
      idleRatePercentage: (effectiveIdleRate * 100).toFixed(1) + '%',
      normalEarnings: normalEarnings,
      calculatedIdleBonus: idleBonus,
      capped: idleInfo.capped
    });
    
    // Apply the idle bonus
    this.addSnowballs(idleBonus, 'idle_bonus', 'offline_progression');
    this.totalIdleGains += idleBonus;
    
    // Record the bonus application
    const bonusRecord = {
      timestamp: Date.now(),
      idleTimeMs: idleInfo.idleTimeMs,
      idleTimeHours: idleInfo.idleTimeHours,
      normalEarnings: normalEarnings,
      idleBonus: idleBonus,
      effectiveRate: effectiveIdleRate,
      capped: idleInfo.capped,
      // RECOMMENDATION 6: Enhanced Debug Data - Include SPS and snowball context
      contextSPS: this.sps,
      contextSnowballs: this.snowballs
    };
    
    this.idleTime.idleBonusesApplied.push(bonusRecord);
    
    // RECOMMENDATION 3: History Cleanup - Keep only last 50 idle bonus records to prevent memory bloat
    if (this.idleTime.idleBonusesApplied.length > 50) {
      const removedCount = this.idleTime.idleBonusesApplied.length - 50;
      this.idleTime.idleBonusesApplied.splice(0, removedCount);
      console.log(`[IDLE_BONUS] Cleaned up ${removedCount} old idle bonus records to prevent memory bloat`);
    }
    
    // Update last calculation time
    this.idleTime.lastIdleCalculation = Date.now();
    
    // Mark idle time as changed for incremental saves
    if (this.saveManager) {
      this.saveManager.markChanged('idleTime');
    }
    
    // Emit idle bonus applied event
    if (window.eventBus) {
      window.eventBus.emit('idleBonusApplied', bonusRecord);
    }
    
    // RECOMMENDATION 6: Enhanced Debug Logging - Final application summary
    console.log(`[IDLE_BONUS] Idle bonus applied: ${idleBonus.toFixed(0)} snowballs (${idleInfo.idleTimeHours.toFixed(2)} hours at ${(effectiveIdleRate * 100).toFixed(1)}% rate)`);
    
    return bonusRecord;
  }
  
  /**
   * TESTING UTILITY: Simulate idle time for testing purposes
   * This method allows developers to test idle bonus calculations without waiting
   * 
   * @param {number} idleTimeMinutes - Minutes of idle time to simulate
   * @param {boolean} forceRecalculation - Force recalculation even if already calculated
   * @returns {object|null} Idle bonus result or null if no bonus applied
   */
  simulateIdleTime(idleTimeMinutes = 5, forceRecalculation = false) {
    // console.log(`[IDLE_BONUS_TEST] Simulating ${idleTimeMinutes} minutes of idle time...`);
    
    // Create simulated idle info
    const idleTimeMs = idleTimeMinutes * 60 * 1000; // Convert minutes to milliseconds
    const now = Date.now();
    
    const simulatedIdleInfo = {
      idleTimeMs: idleTimeMs,
      idleTimeHours: idleTimeMs / (1000 * 60 * 60),
      idleTimeDays: idleTimeMs / (1000 * 60 * 60 * 24),
      isIdle: idleTimeMs > 5 * 60 * 1000, // Same logic as SaveManager
      capped: false,
      originalIdleTimeMs: idleTimeMs,
      lastSaveTime: now - idleTimeMs,
      calculatedAt: now
    };
    
    // Store the simulated idle info
    this.idleTimeInfo = simulatedIdleInfo;
    
    // Reset last calculation if forcing recalculation
    if (forceRecalculation) {
      this.idleTime.lastIdleCalculation = 0;
      // console.log('[IDLE_BONUS_TEST] Forced recalculation - last calculation time reset');
    }
    
    // Log current state before calculation
    // console.log('[IDLE_BONUS_TEST] Current game state before idle bonus:', {
    //   currentSPS: this.sps,
    //   currentSnowballs: this.snowballs,
    //   idleBonusRate: this.idleBonusRate,
    //   idleBonusRatePercentage: (this.idleBonusRate * 100).toFixed(1) + '%',
    //   simulatedIdleTime: `${idleTimeMinutes} minutes (${(idleTimeMs / (1000 * 60 * 60)).toFixed(2)} hours)`
    // });
    
    // Calculate and apply idle bonus
    const result = this.calculateAndApplyIdleBonus();
    
    if (result) {
      // console.log('[IDLE_BONUS_TEST] ✅ Idle bonus simulation successful!', {
      //   simulatedIdleTime: `${idleTimeMinutes} minutes`,
      //   idleBonusApplied: result.idleBonus.toFixed(0),
      //   newSnowballTotal: this.snowballs.toFixed(0),
      //   effectiveRate: (result.effectiveRate * 100).toFixed(1) + '%'
      // });
    } else {
      // console.log('[IDLE_BONUS_TEST] ❌ No idle bonus applied. Possible reasons:', {
      //   alreadyCalculated: this.idleTime.lastIdleCalculation >= simulatedIdleInfo.calculatedAt,
      //   notIdle: !simulatedIdleInfo.isIdle,
      //   idleTimeMs: simulatedIdleInfo.idleTimeMs
      // });
    }
    
    return result;
  }
  
  /**
   * TESTING UTILITY: Get detailed idle bonus testing information
   * @returns {object} Comprehensive testing information
   */
  getIdleBonusTestInfo() {
    const info = {
      currentState: {
        sps: this.sps,
        snowballs: this.snowballs,
        idleBonusRate: this.idleBonusRate,
        idleBonusRatePercentage: (this.idleBonusRate * 100).toFixed(1) + '%',
        totalIdleGains: this.totalIdleGains
      },
      idleTimeInfo: this.idleTimeInfo,
      lastCalculation: this.idleTime.lastIdleCalculation,
      lastCalculationDate: this.idleTime.lastIdleCalculation ? new Date(this.idleTime.lastIdleCalculation).toISOString() : null,
      bonusHistory: {
        count: this.idleTime.idleBonusesApplied.length,
        recent: this.idleTime.idleBonusesApplied.slice(-3).map(record => ({
          timestamp: new Date(record.timestamp).toISOString(),
          idleTimeHours: record.idleTimeHours.toFixed(2),
          idleBonus: record.idleBonus.toFixed(0),
          effectiveRate: (record.effectiveRate * 100).toFixed(1) + '%'
        }))
      },
      testingCommands: {
        simulate1Min: 'game.simulateIdleTime(1)',
        simulate5Min: 'game.simulateIdleTime(5)',
        simulate1Hour: 'game.simulateIdleTime(60)',
        forceRecalculate: 'game.simulateIdleTime(5, true)',
        getStats: 'game.getIdleBonusStats()',
        validateSystem: 'game.validateIdleBonusSystem()',
        cleanupHistory: 'game.cleanupIdleBonusHistory(10)'
      }
    };
    
    // console.log('[IDLE_BONUS_TEST] Testing information:', info);
    return info;
  }
} 