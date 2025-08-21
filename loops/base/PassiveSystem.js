/**
 * loops/base/PassiveSystem.js - Base class for passive game systems
 * 
 * Passive systems run automatically in the background and generate resources
 * or provide bonuses without direct player intervention.
 * Examples: assistants, boosts, idle bonuses, background processes
 * 
 * Key characteristics:
 * - Time-driven (regular updates)
 * - Continuous operation
 * - Resource generation or bonus application
 * - Can be affected by multipliers
 */

import { serviceLocator } from '../../core/ServiceLocator.js';
import { TICK_INTERVAL_MS } from '../../core/config.js';

export class PassiveSystem {
  constructor(name, eventBus = null, options = {}) {
    this.name = name;
    this.type = 'passive';
    this.isEnabled = true;
    this.isInitialized = false;
    
    // Dependency injection
    this.eventBus = eventBus || serviceLocator.get('eventBus');
    
    // Configuration options
    this.options = {
      updateInterval: TICK_INTERVAL_MS, // How often to update (ms)
      enableMultipliers: true,
      enableBoosts: true,
      enableDecay: false,
      debugMode: false,
      ...options
    };
    
    // State tracking
    this.state = {
      lastUpdate: 0,
      totalOutput: 0,
      outputRate: 0,
      multipliers: new Map(),
      boosts: new Map(),  
      efficiency: 1.0
    };
    
    // Resource tracking
    this.resources = {
      generated: 0,
      generatedThisSecond: 0,
      generatedLastSecond: 0,
      generationHistory: []
    };
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Performance tracking
    this.performance = {
      updatesProcessed: 0,
      totalUpdateTime: 0,
      averageUpdateTime: 0,
      skippedUpdates: 0
    };
    
    // Update interval tracking
    this.lastGenerationTime = Date.now();
  }

  /**
   * Initialize the passive system
   * @param {GameStateFlat} game - The main game state object
   */
  setup(game) {
    if (this.isInitialized) {
      // console.warn(`[${this.name}] Already initialized, skipping`);
      return;
    }

    this.game = game;
    this.isInitialized = true;
    
    // console.log(`[${this.name}] Initializing passive system`);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize state
    this.initializeState(game);
    
    // Call subclass initialization
    this.onSetup(game);
    
    // Emit initialization event
    eventBus.emit('passiveSystemInitialized', {
      name: this.name,
      system: this
    });
    
    // console.log(`[${this.name}] Passive system initialized successfully`);
  }

  /**
   * Initialize system state
   * @param {GameStateFlat} game - The main game state object
   */
  initializeState(game) {
    this.state.lastUpdate = game.getGameTime();
    this.lastGenerationTime = Date.now();
  }

  /**
   * Subclass-specific setup logic
   * Override this method in subclasses
   * @param {GameStateFlat} game - The main game state object
   */
  onSetup(game) {
    // Override in subclasses
  }

  /**
   * Update the passive system
   * Called regularly by the loop manager
   * @param {GameStateFlat} game - The main game state object
   */
  update(game) {
    if (!this.isEnabled || !this.isInitialized) {
      this.performance.skippedUpdates++;
      return;
    }

    const startTime = performance.now();
    
    try {
      const now = game.getGameTime();
      const deltaTime = now - this.state.lastUpdate;
      
      // Skip update if not enough time has passed
      if (deltaTime < this.options.updateInterval) {
        return;
      }
      
      // Calculate output for this update cycle
      const baseOutput = this.calculateBaseOutput(game, deltaTime);
      const multipliedOutput = this.applyMultipliers(baseOutput);
      const finalOutput = this.applyBoosts(multipliedOutput);
      
      // Apply efficiency and decay if enabled
      const effectiveOutput = this.applyEfficiency(finalOutput);
      
      // Generate resources or apply effects
      this.generateOutput(game, effectiveOutput, deltaTime);
      
      // Update tracking
      this.updateResourceTracking(effectiveOutput);
      this.state.lastUpdate = now;
      this.state.totalOutput += effectiveOutput;
      this.state.outputRate = effectiveOutput / (deltaTime / 1000); // per second
      
      // Emit update event
      eventBus.emit('passiveSystemUpdated', {
        system: this.name,
        output: effectiveOutput,
        deltaTime,
        outputRate: this.state.outputRate
      });
      
    } catch (error) {
      // console.error(`[${this.name}] Error during update:`, error);
    } finally {
      // Update performance metrics
      const updateTime = performance.now() - startTime;
      this.updatePerformanceMetrics(updateTime);
    }
  }

  /**
   * Calculate base output - must be implemented by subclasses
   * @param {GameStateFlat} game - The main game state object
   * @param {number} deltaTime - Time since last update (ms)
   * @returns {number} Base output amount
   */
  calculateBaseOutput(game, deltaTime) {
    throw new Error(`[${this.name}] calculateBaseOutput must be implemented by subclasses`);
  }

  /**
   * Calculate the final output value
   * This is the main method called by the loop manager
   * @param {GameStateFlat} game - The main game state object
   * @returns {number} Current output rate
   */
  calculateOutput(game) {
    if (!this.isEnabled || !this.isInitialized) {
      return 0;
    }
    
    const baseOutput = this.calculateBaseOutput(game, 1000); // 1 second
    const multipliedOutput = this.applyMultipliers(baseOutput);
    const boostedOutput = this.applyBoosts(multipliedOutput);
    return this.applyEfficiency(boostedOutput);
  }

  /**
   * Apply multipliers to the base output
   * @param {number} baseOutput - Base output amount
   * @returns {number} Multiplied output
   */
  applyMultipliers(baseOutput) {
    if (!this.options.enableMultipliers) {
      return baseOutput;
    }
    
    let multiplied = baseOutput;
    
    for (const [source, multiplier] of this.state.multipliers) {
      multiplied *= multiplier;
    }
    
    // console.log(`[${this.name}] Added multiplier from ${source}: ${value}x`);
    return multiplied;
  }

  /**
   * Apply boosts to the output
   * @param {number} output - Output after multipliers
   * @returns {number} Boosted output
   */
  applyBoosts(output) {
    if (!this.options.enableBoosts) {
      return output;
    }
    
    let boosted = output;
    
    for (const [source, boost] of this.state.boosts) {
      if (boost.type === 'multiplier') {
        boosted *= boost.value;
      } else if (boost.type === 'additive') {
        boosted += boost.value;
      }
    }
    
    return boosted;
  }

  /**
   * Apply efficiency and decay effects
   * @param {number} output - Output after boosts
   * @returns {number} Final effective output
   */
  applyEfficiency(output) {
    let effective = output * this.state.efficiency;
    
    // Apply decay if enabled
    if (this.options.enableDecay) {
      const decayFactor = this.calculateDecay();
      effective *= decayFactor;
    }
    
    return effective;
  }

  /**
   * Calculate decay factor (for systems that reduce over time)
   * @returns {number} Decay factor (0.0 to 1.0)
   */
  calculateDecay() {
    // Default implementation - no decay
    return 1.0;
  }

  /**
   * Generate the actual output/effect
   * Must be implemented by subclasses
   * @param {GameStateFlat} game - The main game state object
   * @param {number} output - Final output amount
   * @param {number} deltaTime - Time since last update (ms)
   */
  generateOutput(game, output, deltaTime) {
    throw new Error(`[${this.name}] generateOutput must be implemented by subclasses`);
  }

  /**
   * Update resource generation tracking
   * @param {number} output - Output generated this update
   */
  updateResourceTracking(output) {
    this.resources.generated += output;
    
    // Track per-second generation
    const now = Date.now();
    if (now - this.lastGenerationTime >= 1000) {
      this.resources.generatedLastSecond = this.resources.generatedThisSecond;
      this.resources.generatedThisSecond = 0;
      this.lastGenerationTime = now;
      
      // Store in history (keep last 60 seconds)
      this.resources.generationHistory.push(this.resources.generatedLastSecond);
      if (this.resources.generationHistory.length > 60) {
        this.resources.generationHistory.shift();
      }
    }
    
    this.resources.generatedThisSecond += output;
  }

  /**
   * Add a multiplier to the system
   * @param {string} source - Source of the multiplier
   * @param {number} value - Multiplier value
   */
  addMultiplier(source, value) {
    this.state.multipliers.set(source, value);
    // console.log(`[${this.name}] Added multiplier from ${source}: ${value}x`);
  }

  /**
   * Remove a multiplier
   * @param {string} source - Source to remove
   */
  removeMultiplier(source) {
    if (this.state.multipliers.delete(source)) {
      // console.log(`[${this.name}] Removed multiplier from ${source}`);
    }
  }

  /**
   * Add a boost to the system
   * @param {string} source - Source of the boost
   * @param {Object} boost - Boost configuration {type: 'multiplier'|'additive', value: number}
   */
  addBoost(source, boost) {
    this.state.boosts.set(source, boost);
    // console.log(`[${this.name}] Added boost from ${source}:`, boost);
  }

  /**
   * Remove a boost
   * @param {string} source - Source to remove
   */
  removeBoost(source) {
    if (this.state.boosts.delete(source)) {
      // console.log(`[${this.name}] Removed boost from ${source}`);
    }
  }

  /**
   * Set system efficiency
   * @param {number} efficiency - Efficiency factor (0.0 to 1.0+)
   */
  setEfficiency(efficiency) {
    this.state.efficiency = Math.max(0, efficiency);
    // console.log(`[${this.name}] Efficiency set to ${this.state.efficiency}`);
  }

  /**
   * Set up event listeners for the system
   */
  setupEventListeners() {
    // Default implementation - no events
    // Override in subclasses to listen for specific events
  }

  /**
   * Handle events from other systems
   * @param {string} eventName - Name of the event
   * @param {Object} data - Event data
   */
  handleEvent(eventName, data) {
    if (this.eventHandlers.has(eventName)) {
      const handler = this.eventHandlers.get(eventName);
      try {
        handler.call(this, data);
      } catch (error) {
        // console.error(`[${this.name}] Error handling event ${eventName}:`, error);
      }
    }
  }

  /**
   * Register an event handler
   * @param {string} eventName - Name of the event to listen for
   * @param {Function} handler - Handler function
   */
  registerEventHandler(eventName, handler) {
    this.eventHandlers.set(eventName, handler);
    eventBus.on(eventName, (data) => this.handleEvent(eventName, data), this.name);
  }

  /**
   * Update performance metrics
   * @param {number} updateTime - Time taken for update
   */
  updatePerformanceMetrics(updateTime) {
    this.performance.updatesProcessed++;
    this.performance.totalUpdateTime += updateTime;
    this.performance.averageUpdateTime = 
      this.performance.totalUpdateTime / this.performance.updatesProcessed;
  }

  /**
   * Enable the system
   */
  enable() {
    this.isEnabled = true;
    // console.log(`[${this.name}] Passive system enabled`);
  }

  /**
   * Disable the system
   */
  disable() {
    this.isEnabled = false;
    // console.log(`[${this.name}] Passive system disabled`);
  }

  /**
   * Get system statistics
   * @returns {Object} System statistics
   */
  getStatistics() {
    return {
      name: this.name,
      type: this.type,
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      totalOutput: this.state.totalOutput,
      outputRate: this.state.outputRate,
      efficiency: this.state.efficiency,
      multipliers: Object.fromEntries(this.state.multipliers),
      boosts: Object.fromEntries(this.state.boosts),
      resources: { ...this.resources },
      performance: { ...this.performance }
    };
  }

  /**
   * Enable debug mode
   * @param {boolean} enabled - Whether to enable debug mode  
   */
  setDebugMode(enabled) {
    this.options.debugMode = enabled;
    // console.log(`[${this.name}] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Reset system state (useful for testing)
   */
  reset() {
    this.state.totalOutput = 0;
    this.state.outputRate = 0;
    this.resources.generated = 0;
    this.resources.generatedThisSecond = 0;
    this.resources.generatedLastSecond = 0;
    this.resources.generationHistory = [];
    // console.log(`[${this.name}] System state reset`);
  }
} 