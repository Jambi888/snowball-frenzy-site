/**
 * core/DependencyInjector.js - Constructor Injection Support
 * 
 * This module provides utilities for constructor-based dependency injection.
 * It works alongside the ServiceLocator to provide a complete DI solution.
 * 
 * Key features:
 * - Constructor parameter injection
 * - Dependency validation
 * - Automatic dependency resolution
 * - Factory pattern support
 * - Testing utilities
 */

import { serviceLocator } from './ServiceLocator.js';

export class DependencyInjector {
  constructor() {
    this.registry = new Map();
    this.factories = new Map();
    this.validationEnabled = true;
    this.serviceLocator = serviceLocator; // Expose for testing
  }
  
  /**
   * Register a class with its dependencies
   * @param {string} name - Class name
   * @param {Function} ClassConstructor - Class constructor
   * @param {Array} dependencies - Array of dependency names
   * @param {Object} options - Registration options
   */
  register(name, ClassConstructor, dependencies = [], options = {}) {
    const metadata = {
      name,
      constructor: ClassConstructor,
      dependencies,
      singleton: options.singleton !== false,
      instance: null,
      factory: options.factory || null,
      created: Date.now()
    };
    
    this.registry.set(name, metadata);
    
    // Register with service locator if it's a singleton
    if (metadata.singleton) {
      serviceLocator.register(name, () => this.create(name), {
        dependencies,
        singleton: true
      });
    }
    
    // console.log(`[DEPENDENCY_INJECTOR] Registered class: ${name} with ${dependencies.length} dependencies`);
  }
  
  /**
   * Create an instance of a registered class
   * @param {string} name - Class name
   * @param {Object} context - Optional context
   * @param {Object} overrides - Optional dependency overrides
   * @returns {Object} Class instance
   */
  create(name, context = null, overrides = {}) {
    const metadata = this.registry.get(name);
    if (!metadata) {
      throw new Error(`[DEPENDENCY_INJECTOR] Class '${name}' not registered`);
    }
    
    // Check if singleton instance exists
    if (metadata.singleton && metadata.instance) {
      return metadata.instance;
    }
    
    // Resolve dependencies
    const resolvedDependencies = this.resolveDependencies(metadata.dependencies, context, overrides);
    
    // Create instance
    let instance;
    if (metadata.factory) {
      instance = metadata.factory(...resolvedDependencies);
    } else {
      instance = new metadata.constructor(...resolvedDependencies);
    }
    
    // Store singleton instance
    if (metadata.singleton) {
      metadata.instance = instance;
    }
    
    return instance;
  }
  
  /**
   * Resolve dependencies for a class
   * @param {Array} dependencies - Array of dependency names
   * @param {Object} context - Optional context
   * @param {Object} overrides - Optional dependency overrides
   * @returns {Array} Resolved dependencies
   */
  resolveDependencies(dependencies, context = null, overrides = {}) {
    return dependencies.map(dep => {
      // Check for overrides first
      if (overrides.hasOwnProperty(dep)) {
        return overrides[dep];
      }
      
      // Check for context
      if (dep === 'context' && context) {
        return context;
      }
      
      // Get from service locator
      if (serviceLocator.has(dep)) {
        return serviceLocator.get(dep, context);
      }
      
      // Check if it's a registered class
      if (this.registry.has(dep)) {
        return this.create(dep, context);
      }
      
      throw new Error(`[DEPENDENCY_INJECTOR] Dependency '${dep}' not found`);
    });
  }
  
  /**
   * Register a factory function
   * @param {string} name - Factory name
   * @param {Function} factory - Factory function
   * @param {Array} dependencies - Factory dependencies
   */
  registerFactory(name, factory, dependencies = []) {
    this.factories.set(name, { factory, dependencies });
    
    serviceLocator.register(name, (...args) => factory(...args), {
      dependencies,
      singleton: false
    });
    
    // console.log(`[DEPENDENCY_INJECTOR] Registered factory: ${name}`);
  }
  
  /**
   * Create an instance using a factory
   * @param {string} name - Factory name
   * @param {Object} context - Optional context
   * @param {Object} overrides - Optional dependency overrides
   * @returns {Object} Factory result
   */
  createWithFactory(name, context = null, overrides = {}) {
    const factoryData = this.factories.get(name);
    if (!factoryData) {
      throw new Error(`[DEPENDENCY_INJECTOR] Factory '${name}' not registered`);
    }
    
    const resolvedDependencies = this.resolveDependencies(factoryData.dependencies, context, overrides);
    return factoryData.factory(...resolvedDependencies);
  }
  
  /**
   * Validate dependencies for a class
   * @param {string} name - Class name
   * @returns {boolean} True if dependencies are valid
   */
  validateDependencies(name) {
    if (!this.validationEnabled) {
      return true;
    }
    
    const metadata = this.registry.get(name);
    if (!metadata) {
      throw new Error(`[DEPENDENCY_INJECTOR] Class '${name}' not registered`);
    }
    
    for (const dep of metadata.dependencies) {
      if (dep === 'context') {
        continue; // Context is always available
      }
      
      if (!serviceLocator.has(dep) && !this.registry.has(dep)) {
        throw new Error(`[DEPENDENCY_INJECTOR] Invalid dependency '${dep}' for class '${name}'`);
      }
    }
    
    return true;
  }
  
  /**
   * Get dependency graph for a class
   * @param {string} name - Class name
   * @returns {Object} Dependency graph
   */
  getDependencyGraph(name) {
    const metadata = this.registry.get(name);
    if (!metadata) {
      return null;
    }
    
    const graph = {
      name,
      dependencies: metadata.dependencies,
      resolved: {},
      circular: false
    };
    
    // Check each dependency
    for (const dep of metadata.dependencies) {
      if (dep === 'context') {
        graph.resolved[dep] = 'context';
        continue;
      }
      
      if (serviceLocator.has(dep)) {
        graph.resolved[dep] = 'service';
      } else if (this.registry.has(dep)) {
        graph.resolved[dep] = 'class';
        // Recursively check nested dependencies
        const nestedGraph = this.getDependencyGraph(dep);
        if (nestedGraph) {
          graph.resolved[dep] = nestedGraph;
        }
      } else {
        graph.resolved[dep] = 'missing';
      }
    }
    
    return graph;
  }
  
  /**
   * Create a mock instance for testing
   * @param {string} name - Class name
   * @param {Object} mocks - Mock dependencies
   * @returns {Object} Mocked instance
   */
  createMock(name, mocks = {}) {
    const metadata = this.registry.get(name);
    if (!metadata) {
      throw new Error(`[DEPENDENCY_INJECTOR] Class '${name}' not registered`);
    }
    
    // Create mock dependencies
    const mockDependencies = metadata.dependencies.map(dep => {
      if (mocks.hasOwnProperty(dep)) {
        return mocks[dep];
      }
      
      // Create default mock
      return this.createDefaultMock(dep);
    });
    
    return new metadata.constructor(...mockDependencies);
  }
  
  /**
   * Create a default mock for a dependency
   * @param {string} name - Dependency name
   * @returns {Object} Default mock
   */
  createDefaultMock(name) {
    // Create a basic mock object with common methods
    const mock = {
      name: `mock_${name}`,
      // Add common methods that might be called
      log: () => {},
      warn: () => {},
      error: () => {},
      debug: () => {},
      get: () => null,
      set: () => {},
      update: () => {},
      initialize: () => {},
      destroy: () => {}
    };
    
    // Add properties that might be accessed
    Object.defineProperty(mock, 'isMock', {
      value: true,
      writable: false
    });
    
    return mock;
  }
  
  /**
   * Get all registered classes
   * @returns {Array} Array of registered class names
   */
  getRegisteredClasses() {
    return Array.from(this.registry.keys());
  }
  
  /**
   * Get all registered factories
   * @returns {Array} Array of registered factory names
   */
  getRegisteredFactories() {
    return Array.from(this.factories.keys());
  }
  
  /**
   * Clear all registrations
   */
  clear() {
    this.registry.clear();
    this.factories.clear();
    // console.log('[DEPENDENCY_INJECTOR] Cleared all registrations');
  }
  
  /**
   * Enable or disable dependency validation
   * @param {boolean} enabled - Whether to enable validation
   */
  setValidationEnabled(enabled) {
    this.validationEnabled = enabled;

  }
}

// Create global dependency injector instance
export const dependencyInjector = new DependencyInjector();

// Backward compatibility helpers
export function registerClass(name, ClassConstructor, dependencies = [], options = {}) {
  return dependencyInjector.register(name, ClassConstructor, dependencies, options);
}

export function createInstance(name, context = null, overrides = {}) {
  return dependencyInjector.create(name, context, overrides);
}

export function registerFactory(name, factory, dependencies = []) {
  return dependencyInjector.registerFactory(name, factory, dependencies);
} 