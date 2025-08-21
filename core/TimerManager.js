/**
 * core/TimerManager.js - Centralized timer management with frequency consolidation
 * 
 * This module provides a centralized timer management system that:
 * - Consolidates timers with similar frequencies for better performance
 * - Provides performance monitoring and debugging capabilities
 * - Ensures proper cleanup and memory management
 * - Offers backward-compatible migration interface
 * 
 * Key features:
 * - Frequency grouping: Multiple timers with same interval share one underlying timer
 * - Performance tracking: Monitor timer overhead and execution times
 * - Clean shutdown: Proper cleanup of all timers
 * - Debug mode: Detailed logging and performance metrics
 */

export class TimerManager {
  constructor() {
    // Frequency groups - each frequency has one master timer
    this.frequencyGroups = new Map();
    
    // Individual timer registrations
    this.timers = new Map();
    
    // Performance metrics
    this.performance = {
      totalTimers: 0,
      consolidatedTimers: 0,
      averageExecutionTime: 0,
      totalExecutionTime: 0,
      executionCount: 0,
      frequencyDistribution: new Map(),
      memoryStats: null // Will be populated by MemoryManager
    };
    
    // Configuration
    this.config = {
      debugMode: false,
      performanceMonitoring: true,
      consolidationThreshold: 2, // Minimum timers needed to consolidate
      maxExecutionTime: 16, // Warn if timer execution exceeds 16ms
      cleanupInterval: 300000 // Clean up dead timers every 5 minutes
    };
    
    // State tracking
    this.isShuttingDown = false;
    this.nextTimerId = 1;
    
    this.log('[TIMER_MANAGER] Initialized');
  }
  
  /**
   * Register a timer with frequency consolidation
   * @param {Function} callback - Function to call
   * @param {number} interval - Interval in milliseconds
   * @param {string} name - Descriptive name for debugging
   * @param {Object} options - Additional options
   * @returns {string} Timer ID for cleanup
   */
  setInterval(callback, interval, name = 'anonymous', options = {}) {
    if (this.isShuttingDown) {
      this.log(`[TIMER_MANAGER] Ignoring timer registration during shutdown: ${name}`);
      return null;
    }
    
    const timerId = `timer_${this.nextTimerId++}`;
    const normalizedInterval = this.normalizeInterval(interval);
    
    // Create timer registration
    const timer = {
      id: timerId,
      name,
      callback,
      interval: normalizedInterval,
      originalInterval: interval,
      enabled: true,
      priority: options.priority || 'normal',
      maxExecutionTime: options.maxExecutionTime || this.config.maxExecutionTime,
      executionCount: 0,
      totalExecutionTime: 0,
      lastExecution: 0,
      created: Date.now()
    };
    
    // Register timer
    this.timers.set(timerId, timer);
    this.performance.totalTimers++;
    
    // Add to frequency group
    this.addToFrequencyGroup(timer);
    
    this.log(`[TIMER_MANAGER] Registered timer: ${name} (${normalizedInterval}ms) -> ${timerId}`);
    
    return timerId;
  }
  
  /**
   * Register a one-time timeout
   * @param {Function} callback - Function to call
   * @param {number} delay - Delay in milliseconds
   * @param {string} name - Descriptive name for debugging
   * @returns {string} Timer ID for cleanup
   */
  setTimeout(callback, delay, name = 'anonymous') {
    if (this.isShuttingDown) {
      this.log(`[TIMER_MANAGER] Ignoring timeout registration during shutdown: ${name}`);
      return null;
    }
    
    const timerId = `timeout_${this.nextTimerId++}`;
    
    // Use native setTimeout for one-time delays
    const nativeTimeoutId = globalThis.setTimeout(() => {
      const startTime = performance.now();
      
      try {
        callback();
      } catch (error) {
        console.error(`[TIMER_MANAGER] Error in timeout ${name}:`, error);
      } finally {
        // Clean up timeout registration
        this.timers.delete(timerId);
        
        // Update performance metrics
        const executionTime = performance.now() - startTime;
        this.updatePerformanceMetrics(executionTime);
        
        this.log(`[TIMER_MANAGER] Timeout completed: ${name} (${executionTime.toFixed(2)}ms)`);
      }
    }, delay);
    
    // Register timeout for tracking
    this.timers.set(timerId, {
      id: timerId,
      name,
      callback,
      type: 'timeout',
      delay,
      nativeId: nativeTimeoutId,
      created: Date.now()
    });
    
    this.log(`[TIMER_MANAGER] Registered timeout: ${name} (${delay}ms) -> ${timerId}`);
    
    return timerId;
  }
  
  /**
   * Clear a specific timer
   * @param {string} timerId - Timer ID to clear
   */
  clearTimer(timerId) {
    if (!timerId || !this.timers.has(timerId)) {
      return false;
    }
    
    const timer = this.timers.get(timerId);
    
    if (timer.type === 'timeout') {
      // Clear native timeout
      globalThis.clearTimeout(timer.nativeId);
    } else {
      // Remove from frequency group
      this.removeFromFrequencyGroup(timer);
    }
    
    this.timers.delete(timerId);
    this.performance.totalTimers--;
    
    this.log(`[TIMER_MANAGER] Cleared timer: ${timer.name} -> ${timerId}`);
    
    return true;
  }
  
  /**
   * Clear all timers and shut down
   */
  shutdown() {
    this.log('[TIMER_MANAGER] Shutting down...');
    this.isShuttingDown = true;
    
    // Clear all frequency group master timers
    for (const [interval, group] of this.frequencyGroups) {
      if (group.masterTimerId) {
        globalThis.clearInterval(group.masterTimerId);
      }
    }
    
    // Clear all individual timeouts
    for (const [timerId, timer] of this.timers) {
      if (timer.type === 'timeout' && timer.nativeId) {
        globalThis.clearTimeout(timer.nativeId);
      }
    }
    
    // Clear collections
    this.frequencyGroups.clear();
    this.timers.clear();
    
    this.log('[TIMER_MANAGER] Shutdown complete');
  }
  
  /**
   * Add timer to appropriate frequency group
   * @param {Object} timer - Timer object
   */
  addToFrequencyGroup(timer) {
    const interval = timer.interval;
    
    if (!this.frequencyGroups.has(interval)) {
      // Create new frequency group
      this.frequencyGroups.set(interval, {
        interval,
        timers: new Map(),
        masterTimerId: null,
        executionCount: 0,
        averageExecutionTime: 0,
        created: Date.now()
      });
    }
    
    const group = this.frequencyGroups.get(interval);
    group.timers.set(timer.id, timer);
    
    // Start master timer if this is the first timer in group
    if (group.timers.size === 1) {
      this.startMasterTimer(group);
    }
    
    // Update frequency distribution
    this.performance.frequencyDistribution.set(interval, group.timers.size);
    
    this.log(`[TIMER_MANAGER] Added to frequency group ${interval}ms (${group.timers.size} timers)`);
  }
  
  /**
   * Remove timer from frequency group
   * @param {Object} timer - Timer object
   */
  removeFromFrequencyGroup(timer) {
    const interval = timer.interval;
    const group = this.frequencyGroups.get(interval);
    
    if (!group) return;
    
    group.timers.delete(timer.id);
    
    // Stop master timer if no timers left
    if (group.timers.size === 0) {
      if (group.masterTimerId) {
        globalThis.clearInterval(group.masterTimerId);
      }
      this.frequencyGroups.delete(interval);
      this.performance.frequencyDistribution.delete(interval);
    } else {
      this.performance.frequencyDistribution.set(interval, group.timers.size);
    }
    
    this.log(`[TIMER_MANAGER] Removed from frequency group ${interval}ms (${group.timers.size} timers remaining)`);
  }
  
  /**
   * Start master timer for frequency group
   * @param {Object} group - Frequency group
   */
  startMasterTimer(group) {
    group.masterTimerId = globalThis.setInterval(() => {
      if (this.isShuttingDown) return;
      
      const groupStartTime = performance.now();
      const activeTimers = Array.from(group.timers.values()).filter(t => t.enabled);
      
      // Execute all timers in this frequency group
      for (const timer of activeTimers) {
        const timerStartTime = performance.now();
        
        try {
          timer.callback();
          timer.executionCount++;
          timer.lastExecution = Date.now();
          
        } catch (error) {
          // Check if this is a test error (expected during testing)
          if (timer.name.startsWith('test-') && error.message.includes('expected')) {
            console.warn(`[TIMER_MANAGER] Test error handled gracefully in ${timer.name}:`, error.message);
          } else {
            console.error(`[TIMER_MANAGER] Error in timer ${timer.name}:`, error);
          }
        } finally {
          // Update timer performance metrics
          const executionTime = performance.now() - timerStartTime;
          timer.totalExecutionTime += executionTime;
          
          // Warn about slow timers
          if (executionTime > timer.maxExecutionTime) {
            console.warn(`[TIMER_MANAGER] Slow timer: ${timer.name} took ${executionTime.toFixed(2)}ms`);
          }
        }
      }
      
      // Update group performance metrics
      const groupExecutionTime = performance.now() - groupStartTime;
      group.executionCount++;
      group.averageExecutionTime = (group.averageExecutionTime * (group.executionCount - 1) + groupExecutionTime) / group.executionCount;
      
      this.updatePerformanceMetrics(groupExecutionTime);
      
      if (this.config.debugMode && groupExecutionTime > 5) {
        this.log(`[TIMER_MANAGER] Frequency group ${group.interval}ms executed ${activeTimers.length} timers in ${groupExecutionTime.toFixed(2)}ms`);
      }
      
    }, group.interval);
    
    this.performance.consolidatedTimers++;
    this.log(`[TIMER_MANAGER] Started master timer for frequency group ${group.interval}ms`);
  }
  
  /**
   * Normalize interval to reduce frequency fragmentation
   * @param {number} interval - Original interval
   * @returns {number} Normalized interval
   */
  normalizeInterval(interval) {
    // Common intervals that should be grouped together
    const commonIntervals = [100, 1000, 5000, 10000, 30000, 60000];
    
    // If exact match with common interval, use it
    if (commonIntervals.includes(interval)) {
      return interval;
    }
    
    // For intervals close to common ones, snap to common interval
    for (const common of commonIntervals) {
      const tolerance = common * 0.1; // 10% tolerance
      if (Math.abs(interval - common) <= tolerance) {
        this.log(`[TIMER_MANAGER] Normalized ${interval}ms to ${common}ms`);
        return common;
      }
    }
    
    // For custom intervals, round to nearest 100ms to increase consolidation chances
    const rounded = Math.round(interval / 100) * 100;
    if (rounded !== interval && rounded > 0) {
      this.log(`[TIMER_MANAGER] Rounded ${interval}ms to ${rounded}ms`);
      return rounded;
    }
    
    return interval;
  }
  
  /**
   * Update global performance metrics
   * @param {number} executionTime - Time taken for execution
   */
  updatePerformanceMetrics(executionTime) {
    this.performance.totalExecutionTime += executionTime;
    this.performance.executionCount++;
    this.performance.averageExecutionTime = this.performance.totalExecutionTime / this.performance.executionCount;
  }
  
  /**
   * Get performance report
   * @returns {Object} Performance metrics
   */
  getPerformanceReport() {
    const frequencyBreakdown = {};
    for (const [interval, count] of this.performance.frequencyDistribution) {
      frequencyBreakdown[`${interval}ms`] = count;
    }
    
    // Get memory stats if MemoryManager is available
    let memoryStats = null;
    if (window.memoryManager) {
      memoryStats = window.memoryManager.getMemoryStats();
    }
    
    return {
      totalTimers: this.performance.totalTimers,
      consolidatedMasterTimers: this.performance.consolidatedTimers,
      consolidationRatio: this.performance.totalTimers > 0 ? 
        (this.performance.consolidatedTimers / this.performance.totalTimers * 100).toFixed(1) + '%' : '0%',
      averageExecutionTime: this.performance.averageExecutionTime.toFixed(2) + 'ms',
      totalExecutions: this.performance.executionCount,
      frequencyDistribution: frequencyBreakdown,
      activeFrequencyGroups: this.frequencyGroups.size,
      uptime: ((Date.now() - (this.performance.startTime || Date.now())) / 1000).toFixed(1) + 's',
      memoryStats: memoryStats
    };
  }
  
  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Debug mode state
   */
  setDebugMode(enabled) {
    this.config.debugMode = enabled;
    this.log(`[TIMER_MANAGER] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Log message if debug mode is enabled
   * @param {string} message - Message to log
   */
  log(message) {
    if (this.config.debugMode) {
      console.log(message);
    }
  }
  
  /**
   * Get timer information for debugging
   * @returns {Object} Timer debugging information
   */
  getDebugInfo() {
    const timerList = [];
    
    for (const [timerId, timer] of this.timers) {
      timerList.push({
        id: timerId,
        name: timer.name,
        interval: timer.interval,
        type: timer.type || 'interval',
        enabled: timer.enabled,
        executionCount: timer.executionCount || 0,
        averageExecutionTime: timer.executionCount > 0 ? 
          (timer.totalExecutionTime / timer.executionCount).toFixed(2) + 'ms' : '0ms',
        lastExecution: timer.lastExecution || 'never'
      });
    }
    
    return {
      timers: timerList,
      frequencyGroups: Array.from(this.frequencyGroups.keys()),
      performance: this.getPerformanceReport(),
      config: this.config
    };
  }

  /**
   * Get performance metrics for debugging
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return this.getPerformanceReport();
  }

  /**
   * Get active timers for debugging
   * @returns {Array} List of active timers
   */
  getActiveTimers() {
    const activeTimers = [];
    for (const [timerId, timer] of this.timers) {
      if (timer.enabled !== false) {
        activeTimers.push({
          id: timerId,
          name: timer.name,
          type: timer.type || 'interval',
          interval: timer.interval || timer.delay
        });
      }
    }
    return activeTimers;
  }

  /**
   * Get frequency groups for debugging
   * @returns {Object} Frequency group information
   */
  getFrequencyGroups() {
    const groups = {};
    for (const [interval, group] of this.frequencyGroups) {
      groups[`${interval}ms`] = {
        interval: interval,
        timerCount: group.timers.size,
        executionCount: group.executionCount,
        averageExecutionTime: group.averageExecutionTime.toFixed(2) + 'ms'
      };
    }
    return groups;
  }

  /**
   * Cleanup all timers (alias for shutdown)
   * @returns {number} Number of timers cleaned up
   */
  cleanup() {
    const timerCount = this.timers.size;
    this.shutdown();
    return timerCount;
  }

  /**
   * Reset the TimerManager to allow new timer registrations after shutdown
   */
  reset() {
    this.isShuttingDown = false;
    this.timers.clear();
    this.frequencyGroups.clear();
    this.performance = {
      totalTimers: 0,
      consolidatedTimers: 0,
      totalExecutionTime: 0,
      executionCount: 0,
      averageExecutionTime: 0,
      frequencyDistribution: new Map(),
      startTime: Date.now()
    };
    this.log('[TIMER_MANAGER] Reset complete - ready for new timers');
  }

  /**
   * Clean up test timers without shutting down the entire TimerManager
   * @param {string} prefix - Timer name prefix to identify test timers
   * @returns {number} Number of test timers cleaned up
   */
  cleanupTestTimers(prefix = 'test-') {
    let cleanedCount = 0;
    
    for (const [timerId, timer] of this.timers) {
      if (timer.name.startsWith(prefix)) {
        this.clearTimer(timerId);
        cleanedCount++;
      }
    }
    
    this.log(`[TIMER_MANAGER] Cleaned up ${cleanedCount} test timers`);
    return cleanedCount;
  }
}

// Create global timer manager instance
export const timerManager = new TimerManager();

// Backward compatibility helpers for migration
export function setInterval(callback, interval, name = 'legacy') {
  return timerManager.setInterval(callback, interval, name);
}

export function setTimeout(callback, delay, name = 'legacy') {
  return timerManager.setTimeout(callback, delay, name);
}

export function clearInterval(timerId) {
  return timerManager.clearTimer(timerId);
}

export function clearTimeout(timerId) {
  return timerManager.clearTimer(timerId);
}

// Make timer manager available globally for debugging
if (typeof window !== 'undefined') {
  window.timerManager = timerManager;
} 