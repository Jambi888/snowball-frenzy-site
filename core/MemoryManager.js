/**
 * core/MemoryManager.js - Memory management and object pooling system
 * 
 * This module provides comprehensive memory management for the game:
 * - Memory usage monitoring and tracking
 * - Object pooling for high-frequency objects
 * - Automatic cleanup and garbage collection helpers
 * - Memory leak detection and prevention
 * - Integration with existing performance monitoring
 * 
 * Key features:
 * - Real-time memory usage tracking
 * - Object pools for frequently created/destroyed objects
 * - Automatic cleanup based on best practice thresholds
 * - Memory leak detection for long-running sessions
 * - Performance monitoring integration
 */

export class MemoryManager {
  constructor() {
    // Memory monitoring state
    this.monitoring = {
      enabled: true,
      baselineMemory: 0,
      currentMemory: 0,
      peakMemory: 0,
      lastCleanup: Date.now(),
      cleanupInterval: 300000, // 5 minutes
      measurements: []
    };
    
    // Memory thresholds (best practices)
    this.thresholds = {
      warning: 0.8, // 80% of baseline
      cleanup: 0.9, // 90% of baseline
      critical: 0.95, // 95% of baseline
      maxPoolSize: 1000, // Maximum objects per pool
      maxHistorySize: 100 // Maximum performance history entries
    };
    
    // Object pools for high-frequency objects
    this.pools = {
      spsCalculation: new ObjectPool('spsCalculation', this.createSPSCalculationObject),
      costCalculation: new ObjectPool('costCalculation', this.createCostCalculationObject),
      uiUpdate: new ObjectPool('uiUpdate', this.createUIUpdateObject),
      eventObject: new ObjectPool('eventObject', this.createEventObject),
      saveSnapshot: new ObjectPool('saveSnapshot', this.createSaveSnapshotObject)
    };
    
    // Memory leak detection
    this.leakDetection = {
      enabled: true,
      objectCounts: new Map(),
      lastSnapshot: Date.now(),
      snapshotInterval: 60000, // 1 minute
      growthThreshold: 0.1 // 10% growth per minute triggers warning
    };
    
    // Performance metrics
    this.performance = {
      totalAllocations: 0,
      totalDeallocations: 0,
      poolHits: 0,
      poolMisses: 0,
      cleanupCount: 0,
      lastCleanupTime: 0
    };
    
    // Initialize monitoring
    this.monitoring = {
      baselineMemory: this.getCurrentMemory(),
      currentMemory: 0,
      peakMemory: 0,
      lastCheck: Date.now(),
      checkInterval: 5000, // 5 seconds
      warnings: [],
      errors: []
    };
    
    // console.log('[MEMORY_MANAGER] Initialized with object pooling and monitoring');
    
    // Set baseline memory
    this.monitoring.baselineMemory = this.getCurrentMemory();
    // console.log(`[MEMORY_MANAGER] Baseline memory set to: ${(this.monitoring.baselineMemory / 1024 / 1024).toFixed(2)}MB`);
    
    if (!this.monitoring.baselineMemory) {
      // console.warn('[MEMORY_MANAGER] Performance.memory not available - memory monitoring disabled');
    }
    
    // Start monitoring interval
    this.startMonitoring();
  }
  
  /**
   * Get current memory usage
   * @returns {number} Current memory usage in bytes
   */
  getCurrentMemory() {
    if (typeof performance !== 'undefined' && performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Initialize memory monitoring
   */
  initializeMonitoring() {
    if (typeof performance !== 'undefined' && performance.memory) {
      this.monitoring.baselineMemory = performance.memory.usedJSHeapSize;
      this.monitoring.currentMemory = this.monitoring.baselineMemory;
      this.monitoring.peakMemory = this.monitoring.baselineMemory;
      
      // console.log(`[MEMORY_MANAGER] Baseline memory set to: ${(this.monitoring.baselineMemory / 1024 / 1024).toFixed(2)}MB`);
    } else {
      // console.warn('[MEMORY_MANAGER] Performance.memory not available - memory monitoring disabled');
      this.monitoring.enabled = false;
    }
    
    // Start monitoring interval
    this.startMonitoring();
  }
  
  /**
   * Start memory monitoring
   */
  startMonitoring() {
    if (!this.monitoring.enabled) return;
    
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.updateMemoryUsage();
      this.checkMemoryThresholds();
      this.detectMemoryLeaks();
    }, 30000);
    
    // Periodic cleanup every 5 minutes
    setInterval(() => {
      this.performCleanup();
    }, this.monitoring.cleanupInterval);
  }
  
  /**
   * Update current memory usage
   */
  updateMemoryUsage() {
    if (typeof performance !== 'undefined' && performance.memory) {
      const previousMemory = this.monitoring.currentMemory;
      this.monitoring.currentMemory = performance.memory.usedJSHeapSize;
      this.monitoring.peakMemory = Math.max(this.monitoring.peakMemory, this.monitoring.currentMemory);
      
      // Store measurement
      this.monitoring.measurements.push({
        timestamp: Date.now(),
        memory: this.monitoring.currentMemory,
        change: this.monitoring.currentMemory - previousMemory
      });
      
      // Keep only last 100 measurements
      if (this.monitoring.measurements.length > 100) {
        this.monitoring.measurements.shift();
      }
    }
  }
  
  /**
   * Check memory thresholds and trigger actions
   */
  checkMemoryThresholds() {
    if (!this.monitoring.baselineMemory) return;
    
    const usageRatio = this.monitoring.currentMemory / this.monitoring.baselineMemory;
    
    if (usageRatio >= this.thresholds.critical) {
      // console.warn('[MEMORY_MANAGER] Critical memory usage detected:', usageRatio.toFixed(2));
      this.forceCleanup();
    } else if (usageRatio >= this.thresholds.cleanup) {
      // console.warn('[MEMORY_MANAGER] High memory usage detected:', usageRatio.toFixed(2));
      this.performCleanup();
    } else if (usageRatio >= this.thresholds.warning) {
      // console.log('[MEMORY_MANAGER] Memory usage warning:', usageRatio.toFixed(2));
    }
  }
  
  /**
   * Detect potential memory leaks
   */
  detectMemoryLeaks() {
    if (!this.leakDetection.enabled) return;
    
    const now = Date.now();
    if (now - this.leakDetection.lastSnapshot < this.leakDetection.snapshotInterval) return;
    
    // Take snapshot of current object counts
    const currentSnapshot = this.takeObjectSnapshot();
    this.leakDetection.lastSnapshot = now;
    
    // Compare with previous snapshot
    for (const [objectType, currentCount] of currentSnapshot) {
      const previousCount = this.leakDetection.objectCounts.get(objectType) || 0;
      const growth = (currentCount - previousCount) / Math.max(previousCount, 1);
      
      if (growth > 1.5) {
        // console.warn(`[MEMORY_MANAGER] Potential memory leak detected in ${objectType}: ${growth.toFixed(2)} growth`);
        this.monitoring.warnings.push({
          type: 'leak',
          objectType: objectType,
          growth: growth,
          timestamp: Date.now()
        });
      }
    }
    
    this.leakDetection.objectCounts = currentSnapshot;
  }
  
  /**
   * Take snapshot of current object counts
   */
  takeObjectSnapshot() {
    const snapshot = new Map();
    
    // Count objects in pools
    for (const [poolName, pool] of Object.entries(this.pools)) {
      snapshot.set(`${poolName}_pool`, pool.getSize());
    }
    
    // Count other important objects
    if (window.game) {
      snapshot.set('assistants', Object.keys(window.game.assistants || {}).length);
      snapshot.set('boosts', Object.keys(window.game.boosts || {}).length);
      snapshot.set('achievements', Object.keys(window.game.achievements || {}).length);
    }
    
    return snapshot;
  }
  
  /**
   * Perform routine cleanup
   */
  performCleanup() {
    const startTime = performance.now();
    
    // Clean up object pools
    for (const [poolName, pool] of Object.entries(this.pools)) {
      pool.cleanup();
    }
    
    // Clean up performance history arrays
    this.cleanupPerformanceHistory();
    
    // Clean up temporary objects
    this.cleanupTemporaryObjects();
    
    // Update performance metrics
    const cleanupTime = performance.now() - startTime;
    // console.log(`[MEMORY_MANAGER] Cleanup completed in ${cleanupTime.toFixed(2)}ms`);
    
    // Check if we need forced cleanup
    if (this.monitoring.currentMemory > this.monitoring.baselineMemory * 3) {
      // console.warn('[MEMORY_MANAGER] Performing forced cleanup');
      this.performForcedCleanup();
    }
  }
  
  /**
   * Force aggressive cleanup
   */
  forceCleanup() {
    // console.warn('[MEMORY_MANAGER] Performing forced cleanup');
    
    // Clear all object pools
    for (const [poolName, pool] of Object.entries(this.pools)) {
      pool.clear();
    }
    
    // Clear performance history
    this.cleanupPerformanceHistory();
    
    // Clear temporary objects
    this.cleanupTemporaryObjects();
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // console.warn('[MEMORY_MANAGER] Forced cleanup completed');
  }
  
  /**
   * Clean up performance history arrays
   */
  cleanupPerformanceHistory() {
    if (window.game) {
      // Clean up SPS performance history
      if (window.game._spsPerformanceHistory && window.game._spsPerformanceHistory.length > this.thresholds.maxHistorySize) {
        window.game._spsPerformanceHistory = window.game._spsPerformanceHistory.slice(-this.thresholds.maxHistorySize);
      }
      
      // Clean up other performance arrays
      if (window.game.spsHistory && window.game.spsHistory.length > this.thresholds.maxHistorySize) {
        window.game.spsHistory = window.game.spsHistory.slice(-this.thresholds.maxHistorySize);
      }
      
      if (window.game.clickHistory && window.game.clickHistory.length > this.thresholds.maxHistorySize) {
        window.game.clickHistory = window.game.clickHistory.slice(-this.thresholds.maxHistorySize);
      }
    }
  }
  
  /**
   * Clean up temporary objects
   */
  cleanupTemporaryObjects() {
    // Clear cost calculation cache if it gets too large
    if (window.costCache && window.costCache.size > this.thresholds.maxPoolSize) {
      window.costCache.clear();
    }
    
    // Clear other temporary caches
    if (window.upgradeLookupTable && window.upgradeLookupTable.size > this.thresholds.maxPoolSize) {
      // Don't clear this one as it's built once at startup
    }
  }
  
  /**
   * Get object from pool (with performance optimization)
   */
  getFromPool(poolName, ...args) {
    const pool = this.pools[poolName];
    if (!pool) {
      // console.error(`[MEMORY_MANAGER] Pool not found: ${poolName}`);
      return null;
    }
    
    // Performance optimization: Skip pooling for simple objects if hit rate is low
    const poolStats = pool.getStats();
    const totalRequests = poolStats.created + poolStats.reused;
    const hitRate = totalRequests > 0 ? poolStats.reused / totalRequests : 0;
    
    // Skip pooling if hit rate is below 20% (indicates poor reuse)
    if (totalRequests > 100 && hitRate < 0.2) {
      this.performance.poolMisses++;
      return null; // Let caller create object directly
    }
    
    const object = pool.get(...args);
    
    if (object) {
      this.performance.poolHits++;
    } else {
      this.performance.poolMisses++;
    }
    
    return object;
  }
  
  /**
   * Return object to pool
   */
  returnToPool(poolName, object) {
    const pool = this.pools[poolName];
    if (!pool) {
      console.error(`[MEMORY_MANAGER] Pool not found: ${poolName}`);
      return;
    }
    
    pool.return(object);
  }
  
  /**
   * Reset memory baseline (useful for testing or after major cleanup)
   */
  resetBaseline() {
    if (typeof performance !== 'undefined' && performance.memory) {
      const oldBaseline = this.monitoring.baselineMemory;
      this.monitoring.baselineMemory = performance.memory.usedJSHeapSize;
      this.monitoring.currentMemory = this.monitoring.baselineMemory;
      
      console.log(`[MEMORY_MANAGER] Baseline reset: ${(oldBaseline / 1024 / 1024).toFixed(2)}MB → ${(this.monitoring.baselineMemory / 1024 / 1024).toFixed(2)}MB`);
    }
  }
  
  /**
   * Get memory usage statistics
   */
  getMemoryStats() {
    const usageRatio = this.monitoring.baselineMemory ? this.monitoring.currentMemory / this.monitoring.baselineMemory : 0;
    
    // Debug logging for memory ratio issues
    if (usageRatio < 0.5 || usageRatio > 2.0) {
      // console.warn(`[MEMORY_MANAGER] Unusual memory ratio detected: ${usageRatio.toFixed(3)} (current: ${(this.monitoring.currentMemory / 1024 / 1024).toFixed(2)}MB, baseline: ${(this.monitoring.baselineMemory / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    return {
      current: this.monitoring.currentMemory,
      baseline: this.monitoring.baselineMemory,
      peak: this.monitoring.peakMemory,
      usageRatio: usageRatio,
      lastCleanup: this.monitoring.lastCleanup,
      poolStats: Object.fromEntries(
        Object.entries(this.pools).map(([name, pool]) => [name, pool.getStats()])
      ),
      performance: this.performance
    };
  }
  
  // Object creation functions for pools
  createSPSCalculationObject() {
    return {
      time: 0,
      duration: 0,
      assistantCount: 0,
      boostCount: 0
    };
  }
  
  createCostCalculationObject() {
    return {
      assistantId: '',
      count: 0,
      cost: 0,
      timestamp: 0
    };
  }
  
  createUIUpdateObject() {
    return {
      elementId: '',
      updateType: '',
      data: null,
      timestamp: 0
    };
  }
  
  createEventObject() {
    return {
      type: '',
      data: null,
      timestamp: 0,
      source: ''
    };
  }
  
  createSaveSnapshotObject() {
    return {
      version: '',
      timestamp: 0,
      data: null,
      size: 0
    };
  }
}

/**
 * ObjectPool - Generic object pooling system
 */
class ObjectPool {
  constructor(name, createFunction, resetFunction = null) {
    this.name = name;
    this.createFunction = createFunction;
    this.resetFunction = resetFunction;
    this.available = [];
    this.inUse = new Set();
    this.stats = {
      created: 0,
      reused: 0,
      returned: 0
    };
  }
  
  /**
   * Get object from pool
   */
  get(...args) {
    if (this.available.length > 0) {
      const object = this.available.pop();
      this.inUse.add(object);
      this.stats.reused++;
      
      // Reset object if reset function provided
      if (this.resetFunction) {
        this.resetFunction(object, ...args);
      }
      
      return object;
    } else {
      const object = this.createFunction(...args);
      this.inUse.add(object);
      this.stats.created++;
      return object;
    }
  }
  
  /**
   * Return object to pool
   */
  return(object) {
    if (this.inUse.has(object)) {
      this.inUse.delete(object);
      this.available.push(object);
      this.stats.returned++;
    }
  }
  
  /**
   * Clean up pool
   */
  cleanup() {
    // Keep only reasonable number of available objects
    if (this.available.length > 100) {
      this.available = this.available.slice(-100);
    }
  }
  
  /**
   * Clear pool
   */
  clear() {
    this.available = [];
    this.inUse.clear();
  }
  
  /**
   * Get pool statistics
   */
  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
      ...this.stats
    };
  }
  
  /**
   * Get pool size
   */
  getSize() {
    return this.available.length + this.inUse.size;
  }
}

// Export singleton instance
export const memoryManager = new MemoryManager(); 