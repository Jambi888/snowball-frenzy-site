/**
 * systems/eventBus.js - Enhanced Event-driven communication system
 * 
 * This module provides a centralized event bus for decoupled communication
 * between different game systems. Instead of direct system calls, systems
 * can emit and listen for events.
 * 
 * Enhanced features:
 * - Decoupled system communication
 * - System-specific event channels
 * - Event filtering and routing
 * - Priority-based event processing
 * - Event history and replay
 * - Cross-system communication helpers
 * - Event validation and error handling
 * - Batch event processing
 */

class EventBus {
  constructor() {
    this.listeners = {};
    this.systemChannels = {
      active: {},
      passive: {},
      hybrid: {},
      global: this.listeners // Global channel uses main listeners
    };
    this.eventHistory = [];
    this.eventQueue = [];
    this.debugMode = false;
    this.maxHistorySize = 1000;
    this.batchSize = 10;
    this.processing = false;
    
    // Performance metrics
    this.stats = {
      totalEvents: 0,
      totalListeners: 0,
      processingTime: 0,
      errors: 0
    };
    
    // Cross-system communication patterns
    this.crossSystemRoutes = new Map();
    
    // Start batch processing
    this.startBatchProcessing();
  }
  
  /**
   * Subscribe to an event
   * @param {string} eventName - Name of the event to listen for
   * @param {Function} callback - Function to call when event occurs
   * @param {string} systemName - Optional name for debugging
   * @param {Object} options - Additional options
   */
  on(eventName, callback, systemName = 'unknown', options = {}) {
    const {
      systemType = 'global',
      priority = 0,
      filter = null,
      once = false
    } = options;
    
    // Determine target channel
    const channel = this.systemChannels[systemType] || this.listeners;
    
    if (!channel[eventName]) {
      channel[eventName] = [];
    }
    
    const listener = {
      callback,
      systemName,
      systemType,
      priority,
      filter,
      once,
      registeredAt: Date.now()
    };
    
    channel[eventName].push(listener);
    
    // Sort by priority (higher priority first)
    channel[eventName].sort((a, b) => b.priority - a.priority);
    
    this.stats.totalListeners++;
    
    if (this.debugMode) {
      // console.log(`[EVENTBUS] ${systemName} (${systemType}) subscribed to ${eventName} with priority ${priority}`);
    }
    
    return listener; // Return listener for removal
  }
  
  /**
   * Unsubscribe from an event
   * @param {string} eventName - Name of the event
   * @param {Function|Object} callbackOrListener - The callback function or listener object to remove
   * @param {string} systemType - System type to target specific channel
   */
  off(eventName, callbackOrListener, systemType = 'global') {
    const channel = this.systemChannels[systemType] || this.listeners;
    
    if (channel[eventName]) {
      const isListener = typeof callbackOrListener === 'object' && callbackOrListener.callback;
      
      channel[eventName] = channel[eventName].filter(listener => {
        if (isListener) {
          return listener !== callbackOrListener;
        } else {
          return listener.callback !== callbackOrListener;
        }
      });
      
      this.stats.totalListeners--;
    }
  }
  
  /**
   * Emit an event to all listeners with enhanced routing
   * @param {string} eventName - Name of the event to emit
   * @param {any} data - Data to pass to event listeners
   * @param {Object} options - Emission options
   */
  emit(eventName, data = {}, options = {}) {
    const {
      systemType = 'all',
      priority = false,
      batch = true,
      immediate = false
    } = options;
    
    const event = {
      name: eventName,
      data,
      timestamp: Date.now(),
      systemType,
      priority,
      processed: false,
      id: this.generateEventId()
    };
    
    // Add to history
    this.addToHistory(event);
    
    if (immediate || !batch) {
      this.processEvent(event);
    } else {
      this.eventQueue.push(event);
    }
    
    this.stats.totalEvents++;
  }
  
  /**
   * Process a single event
   */
  processEvent(event) {
    const startTime = performance.now();
    
    try {
      if (this.debugMode) {
        // console.log(`[EVENTBUS] Processing ${event.name}:`, event.data);
      }
      
      // Get all relevant channels
      const channels = this.getRelevantChannels(event.systemType);
      const allListeners = [];
      
      // Collect listeners from all relevant channels
      channels.forEach(channel => {
        if (channel[event.name]) {
          allListeners.push(...channel[event.name]);
        }
      });
      
      // Sort by priority and process
      allListeners
        .sort((a, b) => b.priority - a.priority)
        .forEach(listener => {
          try {
            // Apply filter if present
            if (listener.filter && !listener.filter(event.data)) {
              return;
            }
            
            listener.callback(event.data, event);
            
            // Remove 'once' listeners
            if (listener.once) {
              this.off(event.name, listener, listener.systemType);
            }
            
          } catch (error) {
            // console.error(`[EVENTBUS] Error in ${listener.systemName} handling ${event.name}:`, error);
            this.stats.errors++;
          }
        });
      
      event.processed = true;
      
    } catch (error) {
      // console.error(`[EVENTBUS] Error processing event ${event.name}:`, error);
      this.stats.errors++;
    }
    
    this.stats.processingTime += performance.now() - startTime;
  }
  
  /**
   * Get relevant channels based on system type
   */
  getRelevantChannels(systemType) {
    if (systemType === 'all') {
      return Object.values(this.systemChannels);
    } else if (this.systemChannels[systemType]) {
      return [this.systemChannels[systemType], this.systemChannels.global];
    } else {
      return [this.systemChannels.global];
    }
  }
  
  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Add event to history
   */
  addToHistory(event) {
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }
  
  /**
   * Start batch processing of events
   */
  startBatchProcessing() {
    setInterval(() => {
      if (this.eventQueue.length > 0 && !this.processing) {
        this.processBatch();
      }
    }, 16); // ~60 FPS
  }
  
  /**
   * Process a batch of events
   */
  processBatch() {
    if (this.processing) return;
    
    this.processing = true;
    const batch = this.eventQueue.splice(0, this.batchSize);
    
    batch.forEach(event => {
      this.processEvent(event);
    });
    
    this.processing = false;
  }
  
  /**
   * Cross-system communication helpers
   */
  
  /**
   * Emit from active system to passive systems
   */
  activeToPassive(eventName, data = {}) {
    this.emit(`active:${eventName}`, data, { 
      systemType: 'passive',
      immediate: true 
    });
  }
  
  /**
   * Emit from passive system to active systems
   */
  passiveToActive(eventName, data = {}) {
    this.emit(`passive:${eventName}`, data, { 
      systemType: 'active',
      immediate: true 
    });
  }
  
  /**
   * Emit from hybrid system to both active and passive
   */
  hybridToAll(eventName, data = {}) {
    this.emit(`hybrid:${eventName}`, data, { 
      systemType: 'all',
      immediate: true 
    });
  }
  
  /**
   * Broadcast to all systems of a specific type
   */
  broadcastToSystemType(systemType, eventName, data = {}) {
    this.emit(eventName, data, { 
      systemType, 
      immediate: true 
    });
  }
  
  /**
   * Set up cross-system route
   */
  addCrossSystemRoute(fromSystem, toSystem, eventPattern, transform = null) {
    const routeId = `${fromSystem}->${toSystem}:${eventPattern}`;
    this.crossSystemRoutes.set(routeId, {
      fromSystem,
      toSystem,
      eventPattern,
      transform,
      created: Date.now()
    });
    
    // Listen for events matching pattern
    this.on(eventPattern, (data, event) => {
      const transformedData = transform ? transform(data, event) : data;
      this.broadcastToSystemType(toSystem, eventPattern, transformedData);
    }, `CrossSystemRoute:${routeId}`, { systemType: fromSystem });
  }
  
  /**
   * Subscribe to cross-system communication
   */
  onCrossSystem(fromSystemType, eventName, callback, systemName) {
    return this.on(`${fromSystemType}:${eventName}`, callback, systemName, {
      systemType: 'global',
      priority: 5
    });
  }
  
  /**
   * Enable or disable debug logging
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    // console.log(`[EVENTBUS] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Get comprehensive event statistics
   * @returns {Object} Detailed event statistics
   */
  getEventStats() {
    const channelStats = {};
    
    // Get stats for each channel
    Object.entries(this.systemChannels).forEach(([channelName, channel]) => {
      const events = {};
      Object.entries(channel).forEach(([eventName, listeners]) => {
        events[eventName] = listeners.length;
      });
      channelStats[channelName] = events;
    });
    
    return {
      channels: channelStats,
      performance: { ...this.stats },
      history: {
        total: this.eventHistory.length,
        recent: this.eventHistory.slice(-10).map(e => ({
          name: e.name,
          timestamp: e.timestamp,
          processed: e.processed
        }))
      },
      queue: {
        pending: this.eventQueue.length,
        processing: this.processing
      },
      routes: Array.from(this.crossSystemRoutes.keys())
    };
  }
  
  /**
   * Get event history
   */
  getEventHistory(filter = null) {
    if (!filter) return this.eventHistory;
    
    return this.eventHistory.filter(event => {
      if (typeof filter === 'string') {
        return event.name.includes(filter);
      } else if (typeof filter === 'function') {
        return filter(event);
      }
      return true;
    });
  }
  
  /**
   * Replay events from history
   */
  replayEvents(filter = null, startTime = 0) {
    const eventsToReplay = this.getEventHistory(filter)
      .filter(event => event.timestamp >= startTime)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    // console.log(`[EVENTBUS] Replaying ${eventsToReplay.length} events`);
    
    eventsToReplay.forEach(event => {
      this.emit(event.name, event.data, { immediate: true });
    });
  }
  
  /**
   * Clear all event listeners (useful for testing)
   */
  clear() {
    Object.keys(this.systemChannels).forEach(channelName => {
      this.systemChannels[channelName] = channelName === 'global' ? this.listeners : {};
    });
    this.listeners = {};
    this.eventHistory = [];
    this.eventQueue = [];
    this.crossSystemRoutes.clear();
    this.stats = {
      totalEvents: 0,
      totalListeners: 0,
      processingTime: 0,
      errors: 0
    };
    
    if (this.debugMode) {
      // console.log('[EVENTBUS] All listeners and history cleared');
    }
  }
}

// Create global event bus instance
const eventBus = new EventBus();

// Make it available globally
window.eventBus = eventBus;

export { eventBus }; 