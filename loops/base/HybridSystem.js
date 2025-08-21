/**
 * loops/base/HybridSystem.js - Base class for hybrid game systems
 * 
 * Hybrid systems combine both active and passive elements.
 * They run background processes but also respond to player input.
 * Examples: yetis, locations, events, challenges
 * 
 * Key characteristics:
 * - Both time-driven AND event-driven
 * - Background processes with player interaction
 * - Often temporary or conditional effects
 * - Can switch between active and passive modes
 */

import { serviceLocator } from '../../core/ServiceLocator.js';
import { TICK_INTERVAL_MS } from '../../core/config.js';

export class HybridSystem {
  constructor(name, eventBus = null, options = {}) {
    this.name = name;
    this.type = 'hybrid';
    this.isEnabled = true;
    this.isInitialized = false;
    
    // Dependency injection
    this.eventBus = eventBus || serviceLocator.get('eventBus');
    
    // Configuration options
    this.options = {
      updateInterval: 1000, // Hybrid systems typically update less frequently
      enableActiveMode: true,
      enablePassiveMode: true,
      enableStateTransitions: true,
      debugMode: false,
      ...options
    };
    
    // State tracking
    this.state = {
      mode: 'passive', // 'active', 'passive', or 'mixed'
      lastUpdate: 0,
      lastInteraction: 0,
      activeEffects: new Map(),
      passiveEffects: new Map(),
      transitions: []
    };
    
    // Active system properties
    this.activeState = {
      isWaitingForInput: false,
      inputHandlers: new Map(),
      cooldowns: new Map(),
      combos: 0
    };
    
    // Passive system properties  
    this.passiveState = {
      isRunning: false,
      generators: new Map(),
      multipliers: new Map(),
      timers: new Map()
    };
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Performance tracking
    this.performance = {
      activeUpdates: 0,
      passiveUpdates: 0,
      totalUpdateTime: 0,
      inputsProcessed: 0,
      stateTransitions: 0
    };
  }

  /**
   * Initialize the hybrid system
   * @param {GameStateFlat} game - The main game state object
   */
  setup(game) {
    if (this.isInitialized) {
      // console.warn(`[${this.name}] Already initialized, skipping`);
      return;
    }

    this.game = game;
    this.isInitialized = true;
    
    // console.log(`[${this.name}] Initializing hybrid system`);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize state
    this.initializeState(game);
    
    // Call subclass initialization
    this.onSetup(game);
    
    // Emit initialization event
    this.eventBus.emit('hybridSystemInitialized', {
      name: this.name,
      system: this
    });
    
    // console.log(`[${this.name}] Hybrid system initialized successfully`);
  }

  /**
   * Initialize system state
   * @param {GameStateFlat} game - The main game state object
   */
  initializeState(game) {
    this.state.lastUpdate = game.getGameTime();
    
    // Start in appropriate mode based on configuration
    if (this.options.enablePassiveMode) {
      this.switchToPassiveMode();
    } else if (this.options.enableActiveMode) {
      this.switchToActiveMode();
    }
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
   * Update the hybrid system
   * Called regularly by the loop manager
   * @param {GameStateFlat} game - The main game state object
   */
  update(game) {
    if (!this.isEnabled || !this.isInitialized) {
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
      
      // Update based on current mode
      if (this.state.mode === 'active' || this.state.mode === 'mixed') {
        this.updateActiveMode(game, deltaTime);
        this.performance.activeUpdates++;
      }
      
      if (this.state.mode === 'passive' || this.state.mode === 'mixed') {
        this.updatePassiveMode(game, deltaTime);
        this.performance.passiveUpdates++;
      }
      
      // Check for state transitions
      if (this.options.enableStateTransitions) {
        this.checkStateTransitions(game, deltaTime);
      }
      
      // Update timers and effects
      this.updateEffects(game, deltaTime);
      
      this.state.lastUpdate = now;
      
      // Emit update event
      this.eventBus.emit('hybridSystemUpdated', {
        system: this.name,
        mode: this.state.mode,
        deltaTime
      });
      
    } catch (error) {
      // console.error(`[${this.name}] Error during update:`, error);
    } finally {
      // Update performance metrics
      const updateTime = performance.now() - startTime;
      this.performance.totalUpdateTime += updateTime;
    }
  }

  /**
   * Update active mode functionality
   * Override in subclasses
   * @param {GameStateFlat} game - The main game state object
   * @param {number} deltaTime - Time since last update (ms)
   */
  updateActiveMode(game, deltaTime) {
    // Default implementation - update cooldowns
    for (const [action, cooldownEnd] of this.activeState.cooldowns) {
      if (game.getGameTime() >= cooldownEnd) {
        this.activeState.cooldowns.delete(action);
      }
    }
  }

  /**
   * Update passive mode functionality
   * Override in subclasses
   * @param {GameStateFlat} game - The main game state object
   * @param {number} deltaTime - Time since last update (ms)
   */
  updatePassiveMode(game, deltaTime) {
    // Default implementation - process generators
    for (const [generatorId, generator] of this.passiveState.generators) {
      if (generator.isActive) {
        const output = generator.calculateOutput(deltaTime);
        if (output > 0) {
          this.processPassiveOutput(game, generatorId, output);
        }
      }
    }
  }

  /**
   * Process passive output from generators
   * Override in subclasses
   * @param {GameStateFlat} game - The main game state object
   * @param {string} generatorId - ID of the generator
   * @param {number} output - Generated output
   */
  processPassiveOutput(game, generatorId, output) {
    // Default implementation - do nothing
    // Override in subclasses to handle specific output types
  }

  /**
   * Check for state transitions
   * @param {GameStateFlat} game - The main game state object
   * @param {number} deltaTime - Time since last update (ms)
   */
  checkStateTransitions(game, deltaTime) {
    // Default implementation - no transitions
    // Override in subclasses to implement specific transition logic
  }

  /**
   * Update active and passive effects
   * @param {GameStateFlat} game - The main game state object
   * @param {number} deltaTime - Time since last update (ms)
   */
  updateEffects(game, deltaTime) {
    const now = game.getGameTime();
    
    // Update active effects
    for (const [effectId, effect] of this.state.activeEffects) {
      if (effect.duration && now >= effect.startTime + effect.duration) {
        this.removeActiveEffect(effectId);
      }
    }
    
    // Update passive effects
    for (const [effectId, effect] of this.state.passiveEffects) {
      if (effect.duration && now >= effect.startTime + effect.duration) {
        this.removePassiveEffect(effectId);
      }
    }
  }

  /**
   * Handle user input
   * @param {string} inputType - Type of input
   * @param {Object} inputData - Input data
   */
  handleInput(inputType, inputData = {}) {
    if (!this.isEnabled || !this.isInitialized) {
      return false;
    }
    
    if (!this.options.enableActiveMode && this.state.mode !== 'mixed') {
      return false;
    }

    const startTime = performance.now();
    
    try {
      // Check if input is allowed (cooldowns, etc.)
      if (!this.canProcessInput(inputType, inputData)) {
        return false;
      }
      
      // Process the input
      const result = this.processInput(inputType, inputData);
      
      // Update interaction tracking
      this.state.lastInteraction = this.game.getGameTime();
      this.performance.inputsProcessed++;
      
      // Apply cooldown if needed
      this.applyCooldown(inputType, inputData);
      
      // Emit input processed event
      eventBus.emit('hybridInputProcessed', {
        system: this.name,
        inputType,
        inputData,
        result
      });
      
      return result;
      
    } catch (error) {
      // console.error(`[${this.name}] Error processing input ${inputType}:`, error);
      return false;
    } finally {
      const processingTime = performance.now() - startTime;
      // Could track input processing time separately if needed
    }
  }

  /**
   * Check if input can be processed
   * @param {string} inputType - Type of input
   * @param {Object} inputData - Input data
   * @returns {boolean} Whether input can be processed
   */
  canProcessInput(inputType, inputData) {
    // Check cooldowns
    const cooldownEnd = this.activeState.cooldowns.get(inputType);
    if (cooldownEnd && this.game.getGameTime() < cooldownEnd) {
      return false;
    }
    
    return true;
  }

  /**
   * Process input - must be implemented by subclasses
   * @param {string} inputType - Type of input
   * @param {Object} inputData - Input data
   */
  processInput(inputType, inputData) {
    throw new Error(`[${this.name}] processInput must be implemented by subclasses`);
  }

  /**
   * Apply cooldown after input processing
   * @param {string} inputType - Type of input
   * @param {Object} inputData - Input data
   */
  applyCooldown(inputType, inputData) {
    // Default implementation - no cooldowns
    // Override in subclasses to add specific cooldown logic
  }

  /**
   * Switch to active mode
   */
  switchToActiveMode() {
    if (this.state.mode !== 'active') {
      this.state.mode = 'active';
      this.activeState.isWaitingForInput = true;
      this.passiveState.isRunning = false;
      this.recordStateTransition('active');
      // console.log(`[${this.name}] Switched to active mode`);
    }
  }

  /**
   * Switch to passive mode
   */
  switchToPassiveMode() {
    if (this.state.mode !== 'passive') {
      this.state.mode = 'passive';
      this.activeState.isWaitingForInput = false;
      this.passiveState.isRunning = true;
      this.recordStateTransition('passive');
      // console.log(`[${this.name}] Switched to passive mode`);
    }
  }

  /**
   * Switch to mixed mode (both active and passive)
   */
  switchToMixedMode() {
    if (this.state.mode !== 'mixed') {
      this.state.mode = 'mixed';
      this.activeState.isWaitingForInput = true;
      this.passiveState.isRunning = true;
      this.recordStateTransition('mixed');
      // console.log(`[${this.name}] Switched to mixed mode`);
    }
  }

  /**
   * Record a state transition
   * @param {string} newMode - The new mode
   */
  recordStateTransition(newMode) {
    this.state.transitions.push({
      timestamp: this.game.getGameTime(),
      from: this.state.mode,
      to: newMode
    });
    
    // Keep only recent transitions (last 10)
    if (this.state.transitions.length > 10) {
      this.state.transitions.shift();
    }
    
    this.performance.stateTransitions++;
  }

  /**
   * Add an active effect
   * @param {string} effectId - ID of the effect
   * @param {Object} effect - Effect configuration
   */
  addActiveEffect(effectId, effect) {
    effect.startTime = this.game.getGameTime();
    this.state.activeEffects.set(effectId, effect);
    // console.log(`[${this.name}] Added active effect: ${effectId}`);
  }

  /**
   * Remove an active effect
   * @param {string} effectId - ID of the effect to remove
   */
  removeActiveEffect(effectId) {
    if (this.state.activeEffects.delete(effectId)) {
      // console.log(`[${this.name}] Removed active effect: ${effectId}`);
    }
  }

  /**
   * Add a passive effect
   * @param {string} effectId - ID of the effect
   * @param {Object} effect - Effect configuration
   */
  addPassiveEffect(effectId, effect) {
    effect.startTime = this.game.getGameTime();
    this.state.passiveEffects.set(effectId, effect);
    // console.log(`[${this.name}] Added passive effect: ${effectId}`);
  }

  /**
   * Remove a passive effect
   * @param {string} effectId - ID of the effect to remove
   */
  removePassiveEffect(effectId) {
    if (this.state.passiveEffects.delete(effectId)) {
      // console.log(`[${this.name}] Removed passive effect: ${effectId}`);
    }
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
   * Enable the system
   */
  enable() {
    this.isEnabled = true;
    // console.log(`[${this.name}] Hybrid system enabled`);
  }

  /**
   * Disable the system
   */
  disable() {
    this.isEnabled = false;
    // console.log(`[${this.name}] Hybrid system disabled`);
  }

  /**
   * Get system statistics
   * @returns {Object} System statistics
   */
  getStatistics() {
    return {
      name: this.name,
      type: this.type,
      mode: this.state.mode,
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      lastInteraction: this.state.lastInteraction,
      activeEffects: this.state.activeEffects.size,
      passiveEffects: this.state.passiveEffects.size,
      stateTransitions: this.state.transitions.length,
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
} 