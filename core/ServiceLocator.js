/**
 * core/ServiceLocator.js - Service Locator Pattern Implementation
 * 
 * This module provides a centralized service registry for dependency injection.
 * It manages global services and provides a clean interface for service discovery
 * and dependency management.
 * 
 * Key features:
 * - Service registration and retrieval
 * - Dependency lifecycle management
 * - Circular dependency detection
 * - Service validation and error handling
 * - Performance monitoring
 * - Backward compatibility with existing global services
 */

export class ServiceLocator {
  constructor() {
    // Initialize the service locator
    this.services = new Map();
    
    // Service metadata for lifecycle management
    this.metadata = new Map();
    
    // Dependency graph for circular dependency detection
    this.dependencyGraph = new Map();
    
    // Performance metrics
    this.performance = {
      totalLookups: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLookupTime: 0,
      totalLookupTime: 0
    };
    
    // Configuration
    this.config = {
      debugMode: false,
      enableCaching: true,
      maxCacheSize: 100,
      validateDependencies: true,
      autoInitialize: true
    };
    
    // Cache for frequently accessed services
    this.cache = new Map();
    
    // console.log('[SERVICE_LOCATOR] Initialized');
  }
  
  /**
   * Register a service with the locator
   * @param {string} name - Service name
   * @param {Function|Object} service - Service factory function or instance
   * @param {Object} options - Registration options
   */
  register(name, service, options = {}) {
    if (this.services.has(name)) {
      console.warn(`[SERVICE_LOCATOR] Service '${name}' already registered, overwriting`);
    }
    
    const metadata = {
      name,
      type: typeof service === 'function' ? 'factory' : 'singleton',
      dependencies: options.dependencies || [],
      singleton: options.singleton !== false,
      lazy: options.lazy !== false,
      instance: null,
      created: Date.now(),
      lastAccessed: null,
      accessCount: 0
    };
    
    this.services.set(name, service);
    this.metadata.set(name, metadata);
    
    // Add to dependency graph
    this.dependencyGraph.set(name, new Set(metadata.dependencies));
    
    this.log(`[SERVICE_LOCATOR] Registered service: ${name} (${metadata.type})`);
  }
  
  /**
   * Get a service from the locator
   * @param {string} name - Service name
   * @param {Object} context - Optional context for factory functions
   * @returns {Object} Service instance
   */
  get(name, context = null) {
    const startTime = performance.now();
    
    // Check cache first
    if (this.config.enableCaching && this.cache.has(name)) {
      this.performance.cacheHits++;
      this.performance.totalLookups++;
      this.updatePerformanceMetrics(performance.now() - startTime);
      return this.cache.get(name);
    }
    
    this.performance.cacheMisses++;
    this.performance.totalLookups++;
    
    if (!this.services.has(name)) {
      throw new Error(`[SERVICE_LOCATOR] Service '${name}' not found`);
    }
    
    // Check for circular dependencies during retrieval
    if (this.config.validateDependencies) {
      this.checkCircularDependency(name);
    }
    
    const service = this.services.get(name);
    const metadata = this.metadata.get(name);
    
    let instance;
    
    if (metadata.type === 'factory') {
      // Factory function - create new instance
      const dependencies = this.resolveDependencies(metadata.dependencies, context);
      instance = service(...dependencies);
    } else {
      // Singleton - return existing or create new
      if (metadata.singleton && metadata.instance) {
        instance = metadata.instance;
      } else {
        instance = service;
        if (metadata.singleton) {
          metadata.instance = instance;
        }
      }
    }
    
    // Update metadata
    metadata.lastAccessed = Date.now();
    metadata.accessCount++;
    
    // Cache if enabled
    if (this.config.enableCaching && metadata.singleton) {
      this.cache.set(name, instance);
      this.cleanupCache();
    }
    
    this.updatePerformanceMetrics(performance.now() - startTime);
    this.log(`[SERVICE_LOCATOR] Retrieved service: ${name}`);
    
    return instance;
  }
  
  /**
   * Resolve dependencies for a service
   * @param {Array} dependencies - Array of dependency names
   * @param {Object} context - Optional context
   * @returns {Array} Resolved dependencies
   */
  resolveDependencies(dependencies, context = null) {
    return dependencies.map(dep => {
      if (dep === 'context' && context) {
        return context;
      }
      return this.get(dep);
    });
  }
  
  /**
   * Check if a service is registered
   * @param {string} name - Service name
   * @returns {boolean} True if service exists
   */
  has(name) {
    return this.services.has(name);
  }
  
  /**
   * Get all registered service names
   * @returns {Array} Array of service names
   */
  getRegisteredServices() {
    return Array.from(this.services.keys());
  }
  
  /**
   * Get service metadata
   * @param {string} name - Service name
   * @returns {Object} Service metadata
   */
  getMetadata(name) {
    return this.metadata.get(name) || null;
  }
  
  /**
   * Check for circular dependency for a specific service
   * @param {string} serviceName - Service name to check
   */
  checkCircularDependency(serviceName) {
    const visited = new Set();
    const recursionStack = new Set();
    
    if (this.hasCircularDependency(serviceName, visited, recursionStack)) {
      throw new Error(`[SERVICE_LOCATOR] Circular dependency detected involving service: ${serviceName}`);
    }
  }
  
  /**
   * Detect circular dependencies using DFS
   */
  detectCircularDependencies() {
    const visited = new Set();
    const recursionStack = new Set();
    
    for (const service of this.services.keys()) {
      if (!visited.has(service)) {
        if (this.hasCircularDependency(service, visited, recursionStack)) {
          throw new Error(`[SERVICE_LOCATOR] Circular dependency detected involving service: ${service}`);
        }
      }
    }
  }
  
  /**
   * Check for circular dependency using DFS
   * @param {string} service - Service name
   * @param {Set} visited - Visited services
   * @param {Set} recursionStack - Current recursion stack
   * @returns {boolean} True if circular dependency found
   */
  hasCircularDependency(service, visited, recursionStack) {
    visited.add(service);
    recursionStack.add(service);
    
    const dependencies = this.dependencyGraph.get(service) || new Set();
    
    for (const dep of dependencies) {
      if (!visited.has(dep)) {
        if (this.hasCircularDependency(dep, visited, recursionStack)) {
          return true;
        }
      } else if (recursionStack.has(dep)) {
        return true;
      }
    }
    
    recursionStack.delete(service);
    return false;
  }
  
  /**
   * Clean up cache to prevent memory leaks
   */
  cleanupCache() {
    if (this.cache.size > this.config.maxCacheSize) {
      const entries = Array.from(this.cache.entries());
      const toRemove = entries.slice(0, Math.floor(this.config.maxCacheSize * 0.2));
      
      for (const [name] of toRemove) {
        this.cache.delete(name);
      }
      
      this.log(`[SERVICE_LOCATOR] Cleaned up ${toRemove.length} cache entries`);
    }
  }
  
  /**
   * Update performance metrics
   * @param {number} lookupTime - Time taken for lookup
   */
  updatePerformanceMetrics(lookupTime) {
    this.performance.totalLookupTime += lookupTime;
    this.performance.averageLookupTime = this.performance.totalLookupTime / this.performance.totalLookups;
  }
  
  /**
   * Get performance report
   * @returns {Object} Performance metrics
   */
  getPerformanceReport() {
    const cacheHitRate = this.performance.totalLookups > 0 
      ? this.performance.cacheHits / this.performance.totalLookups 
      : 0;
    
    return {
      totalServices: this.services.size,
      totalLookups: this.performance.totalLookups,
      cacheHitRate: cacheHitRate.toFixed(3),
      averageLookupTime: this.performance.averageLookupTime.toFixed(3),
      cacheSize: this.cache.size,
      registeredServices: this.getRegisteredServices()
    };
  }
  
  /**
   * Clear all services and cache
   */
  clear() {
    this.services.clear();
    this.metadata.clear();
    this.dependencyGraph.clear();
    this.cache.clear();
    this.performance = {
      totalLookups: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLookupTime: 0,
      totalLookupTime: 0
    };
    
    this.log('[SERVICE_LOCATOR] Cleared all services');
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
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.config.debugMode = enabled;
    this.log(`[SERVICE_LOCATOR] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Create global service locator instance
export const serviceLocator = new ServiceLocator();

// Backward compatibility helpers
export function registerService(name, service, options = {}) {
  return serviceLocator.register(name, service, options);
}

export function getService(name, context = null) {
  return serviceLocator.get(name, context);
}

export function hasService(name) {
  return serviceLocator.has(name);
} 