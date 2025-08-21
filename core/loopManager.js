/**
 * core/loopManager.js - Central coordination system for all game loops
 * 
 * This module manages the three main loop types:
 * - Active: Player-initiated actions (clicking, abilities)
 * - Passive: Automated systems (assistants, boosts)
 * - Hybrid: Mixed systems (yetis, locations)
 * 
 * The Loop Manager provides:
 * - Centralized registration and coordination
 * - Performance monitoring
 * - Debugging capabilities
 * - Consistent update cycles
 */

import { eventBus } from './eventBus.js';
import { TIME_RATE } from './config.js';
import { timerManager } from './TimerManager.js';

export class LoopManager {
  constructor() {
    if (LoopManager.instance) {
      // console.warn('[LOOP_MANAGER] Already initialized, skipping');
      return LoopManager.instance;
    }
    
    this.systems = {
      active: new Map(),
      passive: new Map(),
      hybrid: new Map()
    };
    
    this.performance = {
      active: { totalTime: 0, updateCount: 0 },
      passive: { totalTime: 0, updateCount: 0 },
      hybrid: { totalTime: 0, updateCount: 0 }
    };
    
    this.debugMode = false;
    this.isInitialized = false;
    
    // Timer management
    this.timerIds = {
      passiveSystemTimer: null,
      hybridSystemTimer: null,
      performanceMonitorTimer: null
    };
    
    // Bind methods to preserve context
    this.registerSystem = this.registerSystem.bind(this);
    this.updateSystemType = this.updateSystemType.bind(this);
  }

  /**
   * Initialize the loop manager and start coordination
   * @param {GameStateFlat} game - The main game state object
   */
  initialize(game) {
    if (this.isInitialized) {
      // console.warn('[LOOP_MANAGER] Already initialized, skipping');
      return;
    }

    this.game = game;
    this.isInitialized = true;
    
    // console.log('[LOOP_MANAGER] Initializing loop coordination system');
    
    // Set up event listeners for system communication
    this.setupEventListeners();
    
    // Start the coordination cycle
    this.startCoordination();
    
    // console.log('[LOOP_MANAGER] Loop manager initialized successfully');
  }

  /**
   * Register a system with the loop manager
   * @param {string} type - System type: 'active', 'passive', or 'hybrid'
   * @param {string} name - System name identifier
   * @param {Object} system - System object with required methods
   */
  registerSystem(type, name, system) {
    if (!['active', 'passive', 'hybrid'].includes(type)) {
      throw new Error(`[LOOP_MANAGER] Invalid system type: ${type}`);
    }

    if (!system || typeof system !== 'object') {
      throw new Error(`[LOOP_MANAGER] Invalid system object for ${name}`);
    }

    // Validate required methods based on system type
    const requiredMethods = this.getRequiredMethods(type);
    for (const method of requiredMethods) {
      if (typeof system[method] !== 'function') {
        // console.warn(`[LOOP_MANAGER] System ${name} missing required method: ${method}`);
      }
    }

    // Add system metadata
    system._metadata = {
      name,
      type,
      registeredAt: Date.now(),
      lastUpdate: 0,
      updateCount: 0,
      averageUpdateTime: 0
    };

    this.systems[type].set(name, system);
    
    // console.log(`[LOOP_MANAGER] Registered ${type} system: ${name}`);
    
    // Emit registration event
    eventBus.emit('systemRegistered', {
      type,
      name,
      system
    });
  }

  /**
   * Get required methods for a system type
   * @param {string} type - System type
   * @returns {Array} Array of required method names
   */
  getRequiredMethods(type) {
    const methodMap = {
      active: ['setup', 'handleInput'],
      passive: ['setup', 'update', 'calculateOutput'],
      hybrid: ['setup', 'update', 'handleInput']
    };
    
    return methodMap[type] || [];
  }

  /**
   * Set up event listeners for system communication
   */
  setupEventListeners() {
    // Listen for state changes that might affect multiple systems
    eventBus.on('snowballsChanged', this.handleSnowballsChanged.bind(this), 'LoopManager', { priority: 10 });
    eventBus.on('assistantPurchased', this.handleAssistantPurchased.bind(this), 'LoopManager', { priority: 10 });
    eventBus.on('boostPurchased', this.handleBoostPurchased.bind(this), 'LoopManager', { priority: 10 });
    eventBus.on('yetiBuffActivated', this.handleYetiBuffActivated.bind(this), 'LoopManager', { priority: 10 });
    
    // Performance monitoring events
    eventBus.on('systemPerformanceWarning', this.handlePerformanceWarning.bind(this), 'LoopManager');
    
    // Cross-system communication routes
    this.setupCrossSystemRoutes();
  }
  
  /**
   * Set up cross-system communication routes
   */
  setupCrossSystemRoutes() {
    // Active to Passive: Clicks affect passive multipliers
    eventBus.addCrossSystemRoute('active', 'passive', 'clickComboAchieved', (data) => ({
      ...data,
      multiplierBonus: data.combo * 0.01 // 1% bonus per combo level
    }));
    
    // Passive to Active: SPS milestones unlock active abilities
    eventBus.addCrossSystemRoute('passive', 'active', 'spsThresholdReached', (data) => ({
      ...data,
      unlockedAbilities: this.calculateUnlockedAbilities(data.sps)
    }));
    
    // Hybrid to All: Location changes affect all systems
    eventBus.addCrossSystemRoute('hybrid', 'all', 'locationChanged', (data) => ({
      ...data,
      globalEffects: this.calculateLocationEffects(data.location)
    }));
    
    // Passive to Hybrid: High SPS triggers special events
    eventBus.addCrossSystemRoute('passive', 'hybrid', 'highSpsDetected', (data) => ({
      ...data,
      specialEventChance: Math.min(data.sps / 1000000, 0.1) // Max 10% chance
    }));
  }

  /**
   * Start the coordination cycle using TimerManager
   */
  startCoordination() {
    // Coordinate passive systems (most frequent) using TimerManager
    this.timerIds.passiveSystemTimer = timerManager.setInterval(() => {
      this.updateSystemType('passive');
    }, 100, 'loop-manager-passive'); // Every 100ms
    
    // Coordinate hybrid systems (medium frequency) using TimerManager
    this.timerIds.hybridSystemTimer = timerManager.setInterval(() => {
      this.updateSystemType('hybrid');
    }, 1000, 'loop-manager-hybrid'); // Every 1 second
    
    // Active systems are event-driven, no regular updates needed
    // Performance monitoring using TimerManager
    this.timerIds.performanceMonitorTimer = timerManager.setInterval(() => {
      this.reportPerformanceMetrics();
    }, 30000, 'loop-manager-performance'); // Every 30 seconds
    
    // console.log('[LOOP_MANAGER] Started coordination cycle with TimerManager');
  }

  /**
   * Update all systems of a specific type
   * @param {string} type - System type to update
   */
  updateSystemType(type) {
    if (!this.game || !this.systems[type]) {
      return;
    }

    const startTime = performance.now();
    const systems = this.systems[type];
    
    for (const [name, system] of systems) {
      try {
        const systemStartTime = performance.now();
        
        // Call system update if it exists
        if (typeof system.update === 'function') {
          system.update(this.game);
        }
        
        // Update system metadata
        const systemEndTime = performance.now();
        const updateTime = systemEndTime - systemStartTime;
        
        system._metadata.lastUpdate = Date.now();
        system._metadata.updateCount++;
        system._metadata.averageUpdateTime = 
          (system._metadata.averageUpdateTime * (system._metadata.updateCount - 1) + updateTime) / 
          system._metadata.updateCount;
        
        // Warn about slow systems
        if (updateTime > 16) { // Flag slow updates (over 16ms)
          // console.warn(`[LOOP_MANAGER] Slow ${type} system: ${name} took ${updateTime.toFixed(2)}ms`);
        }
        
      } catch (error) {
        // console.error(`[LOOP_MANAGER] Error updating ${type} system ${name}:`, error);
      }
    }
    
    // Update performance metrics
    const totalTime = performance.now() - startTime;
    this.performance[type].totalTime += totalTime;
    this.performance[type].updateCount++;
    
    if (this.debugMode && totalTime > 5) {
      // console.log(`[LOOP_MANAGER] ${type} update cycle took ${totalTime.toFixed(2)}ms`);
    }
  }

  /**
   * Handle snowballs changed event
   * @param {Object} data - Event data
   */
  handleSnowballsChanged(data) {
    // Notify systems that might care about snowball changes
    this.broadcastToSystems('snowballsChanged', data);
  }

  /**
   * Handle assistant purchased event
   * @param {Object} data - Event data
   */
  handleAssistantPurchased(data) {
    // Notify systems that might care about assistant purchases
    this.broadcastToSystems('assistantPurchased', data);
  }

  /**
   * Handle boost purchased event
   * @param {Object} data - Event data
   */
  handleBoostPurchased(data) {
    // Notify systems that might care about boost purchases
    this.broadcastToSystems('boostPurchased', data);
  }

  /**
   * Handle yeti buff activated event
   * @param {Object} data - Event data
   */
  handleYetiBuffActivated(data) {
    // Notify systems that might care about yeti buffs
    this.broadcastToSystems('yetiBuffActivated', data);
  }

  /**
   * Handle performance warning
   * @param {Object} data - Event data
   */
  handlePerformanceWarning(data) {
    if (data.type === 'performance') {
      // console.warn(`[LOOP_MANAGER] Performance warning from ${data.system}:`, data.message);
    }
  }

  /**
   * Broadcast an event to all systems
   * @param {string} eventName - Name of the event
   * @param {Object} data - Event data
   */
  broadcastToSystems(eventName, data) {
    for (const [type, systems] of Object.entries(this.systems)) {
      for (const [name, system] of systems) {
        if (typeof system.handleEvent === 'function') {
          try {
            system.handleEvent(eventName, data);
          } catch (error) {
            // console.error(`[LOOP_MANAGER] Error broadcasting ${eventName} to ${type} system ${name}:`, error);
          }
        }
      }
    }
  }

  /**
   * Report performance metrics
   */
  reportPerformanceMetrics() {
    if (!this.debugMode) return;
    
    // console.log('[LOOP_MANAGER] Performance Report:');
    
    for (const [type, metrics] of Object.entries(this.performance)) {
      if (metrics.updateCount > 0) {
        const avgTime = metrics.totalTime / metrics.updateCount;
        // console.log(`  ${type}: ${metrics.updateCount} updates, avg ${avgTime.toFixed(2)}ms`);
      }
    }
    
    // Report individual system performance
    for (const [type, systems] of Object.entries(this.systems)) {
      // console.log(`  ${type} systems:`);
      for (const [name, system] of systems) {
        const meta = system._metadata;
        // console.log(`    ${name}: ${meta.updateCount} updates, avg ${meta.averageUpdateTime.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    // console.log(`[LOOP_MANAGER] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get system statistics
   * @returns {Object} System statistics
   */
  getStatistics() {
    const stats = {
      totalSystems: 0,
      systemsByType: {},
      performance: { ...this.performance }
    };
    
    for (const [type, systems] of Object.entries(this.systems)) {
      stats.systemsByType[type] = systems.size;
      stats.totalSystems += systems.size;
    }
    
    return stats;
  }

  /**
   * Get a specific system
   * @param {string} type - System type
   * @param {string} name - System name
   * @returns {Object|null} System object or null if not found
   */
  getSystem(type, name) {
    return this.systems[type]?.get(name) || null;
  }

  /**
   * Cleanup all loop manager timers
   */
  cleanup() {
    // console.log('[LOOP_MANAGER] Cleaning up timers...');
    let cleanedCount = 0;
    
    Object.entries(this.timerIds).forEach(([name, timerId]) => {
      if (timerId && timerManager.clearTimer(timerId)) {
        cleanedCount++;
        this.timerIds[name] = null;
      }
    });
    
    // console.log(`[LOOP_MANAGER] Cleaned up ${cleanedCount} timers`);
    return cleanedCount;
  }

  /**
   * Pause all systems (useful for debugging)
   */
  pauseAll() {
    // console.log('[LOOP_MANAGER] Pausing all systems');
    this.paused = true;
  }

  /**
   * Resume all systems
   */
  resumeAll() {
    // console.log('[LOOP_MANAGER] Resuming all systems');
    this.paused = false;
  }
  
  /**
   * Calculate unlocked abilities based on SPS
   */
  calculateUnlockedAbilities(sps) {
    const abilities = [];
    if (sps >= 100) abilities.push('doubleClick');
    if (sps >= 1000) abilities.push('clickFrenzy');
    if (sps >= 10000) abilities.push('autoClicker');
    if (sps >= 100000) abilities.push('clickMultiplier');
    return abilities;
  }
  
  /**
   * Calculate location effects for all systems
   */
  calculateLocationEffects(location) {
    const effects = {
      active: {},
      passive: {},
      hybrid: {}
    };
    
    switch (location) {
      case 'frostyCave':
        effects.passive.spsMultiplier = 1.1;
        effects.active.clickMultiplier = 1.05;
        break;
      case 'icyPeak':
        effects.active.clickMultiplier = 1.2;
        effects.hybrid.yetiSpawnRate = 1.5;
        break;
      case 'snowyForest':
        effects.passive.spsMultiplier = 1.05;
        effects.hybrid.yetiSpawnRate = 1.2;
        break;
    }
    
    return effects;
  }
  
  /**
   * Enhanced broadcast to systems with better targeting
   */
  broadcastToSystemType(systemType, eventName, data) {
    eventBus.broadcastToSystemType(systemType, eventName, data);
  }
  
  /**
   * Get comprehensive performance statistics
   * @returns {Object} Detailed performance statistics
   */
  getPerformanceStats() {
    const stats = {
      systemCounts: {
        active: this.systems.active.size,
        passive: this.systems.passive.size,
        hybrid: this.systems.hybrid.size
      },
      performance: { ...this.performance },
      systemDetails: {},
      eventBusStats: eventBus.getEventStats()
    };
    
    // Get individual system performance
    for (const [type, systems] of Object.entries(this.systems)) {
      stats.systemDetails[type] = {};
      for (const [name, system] of systems) {
        if (system._metadata) {
          stats.systemDetails[type][name] = {
            updateCount: system._metadata.updateCount,
            averageUpdateTime: system._metadata.averageUpdateTime,
            lastUpdate: system._metadata.lastUpdate,
            registeredAt: system._metadata.registeredAt
          };
        }
      }
    }
    
    return stats;
  }
}

// Create global instance
export const loopManager = new LoopManager();

// Make it globally available for debugging
window.loopManager = loopManager; 