/**
 * loops/base/ActiveSystem.js - Base class for active game systems
 * 
 * Active systems respond to player input and provide immediate feedback.
 * Examples: clicking, abilities, mini-games, combos
 * 
 * Key characteristics:
 * - Event-driven (respond to user input)
 * - Immediate feedback
 * - Optional cooldowns or limitations
 * - Can affect other systems
 */

import { serviceLocator } from '../../core/ServiceLocator.js';

export class ActiveSystem {
  constructor(name, eventBus = null, options = {}) {
    this.name = name;
    this.type = 'active';
    this.isEnabled = true;
    this.isInitialized = false;
    
    // Dependency injection
    this.eventBus = eventBus || serviceLocator.get('eventBus');
    
    // Configuration options
    this.options = {
      enableCooldowns: false,
      enableCombos: false,
      enableEffects: true,
      debugMode: false,
      ...options
    };
    
    // State tracking
    this.state = {
      lastAction: 0,
      actionCount: 0,
      combo: 0,
      effects: new Map()
    };
    
    // Event handlers
    this.eventHandlers = new Map();
    
    // Performance tracking
    this.performance = {
      inputsProcessed: 0,
      totalProcessingTime: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Initialize the active system
   * Must be implemented by subclasses
   * @param {GameStateFlat} game - The main game state object
   */
  setup(game) {
    if (this.isInitialized) {
      // console.warn(`[${this.name}] Already initialized, skipping`);
      return;
    }

    this.game = game;
    this.isInitialized = true;
    
    // console.log(`[${this.name}] Initializing active system`);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Call subclass initialization
    this.onSetup(game);
    
    // Emit initialization event
    this.eventBus.emit('activeSystemInitialized', {
      name: this.name,
      system: this
    });
    
    // console.log(`[${this.name}] Active system initialized successfully`);
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
   * Handle user input
   * This is the main entry point for active systems
   * @param {string} inputType - Type of input (click, keypress, etc.)
   * @param {Object} inputData - Input-specific data
   */
  handleInput(inputType, inputData = {}) {
    if (!this.isEnabled || !this.isInitialized) {
      return false;
    }

    const startTime = performance.now();
    
    try {
      // Check cooldowns if enabled
      if (this.options.enableCooldowns && !this.canPerformAction(inputType)) {
        return false;
      }
      
      // Process the input
      const result = this.processInput(inputType, inputData);
      
      // Update state tracking
      this.updateActionState(inputType, inputData);
      
      // Handle combos if enabled
      if (this.options.enableCombos) {
        this.updateComboState(inputType, inputData);
      }
      
      // Apply effects if enabled
      if (this.options.enableEffects && result) {
        this.applyEffects(inputType, inputData, result);
      }
      
      // Emit input processed event
      this.eventBus.emit('activeInputProcessed', {
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
      // Update performance metrics
      const processingTime = performance.now() - startTime;
      this.updatePerformanceMetrics(processingTime);
    }
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
   * Check if an action can be performed (cooldown logic)
   * @param {string} inputType - Type of input
   * @returns {boolean} Whether the action can be performed
   */
  canPerformAction(inputType) {
    // Default implementation - no cooldowns
    return true;
  }

  /**
   * Update action state tracking
   * @param {string} inputType - Type of input
   * @param {Object} inputData - Input data
   */
  updateActionState(inputType, inputData) {
    this.state.lastAction = this.game.getGameTime();
    this.state.actionCount++;
  }

  /**
   * Update combo state
   * @param {string} inputType - Type of input
   * @param {Object} inputData - Input data
   */
  updateComboState(inputType, inputData) {
    const now = this.game.getGameTime();
    const timeSinceLastAction = now - this.state.lastAction;
    
    // Reset combo if too much time has passed
    if (timeSinceLastAction > 2000) { // 2 seconds
      this.state.combo = 0;
    }
    
    this.state.combo++;
  }

  /**
   * Apply effects from the action
   * @param {string} inputType - Type of input
   * @param {Object} inputData - Input data
   * @param {any} result - Result from processInput
   */
  applyEffects(inputType, inputData, result) {
    // Default implementation - no effects
    // Override in subclasses to add visual effects, sounds, etc.
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
   * @param {number} processingTime - Time taken to process input
   */
  updatePerformanceMetrics(processingTime) {
    this.performance.inputsProcessed++;
    this.performance.totalProcessingTime += processingTime;
    this.performance.averageProcessingTime = 
      this.performance.totalProcessingTime / this.performance.inputsProcessed;
  }

  /**
   * Enable the system
   */
  enable() {
    this.isEnabled = true;
    // console.log(`[${this.name}] Active system enabled`);
  }

  /**
   * Disable the system
   */
  disable() {
    this.isEnabled = false;
    // console.log(`[${this.name}] Active system disabled`);
  }

  /**
   * Get current combo count
   * @returns {number} Current combo count
   */
  getCombo() {
    return this.state.combo;
  }

  /**
   * Reset combo count
   */
  resetCombo() {
    this.state.combo = 0;
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
      actionCount: this.state.actionCount,
      combo: this.state.combo,
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