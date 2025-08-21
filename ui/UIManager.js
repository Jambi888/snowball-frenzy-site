/**
 * ui/UIManager.js - Unified UI Framework
 * 
 * This module provides a centralized UI management system that:
 * - Manages all UI components and their updates
 * - Integrates with the loop system and event bus
 * - Provides consistent styling and behavior
 * - Optimizes performance through batched updates
 * - Supports reactive UI updates based on game state
 */

import { eventBus } from '../core/eventBus.js';
import { getAcceleration } from '../global/dashboard.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.components = new Map();
    this.containers = new Map();
    this.updateQueue = new Set();
    this.isUpdating = false;
    this.performanceMetrics = {
      totalUpdates: 0,
      totalUpdateTime: 0,
      averageUpdateTime: 0,
      lastUpdateTime: 0,
      batchedUpdates: 0,
      componentCounts: {}
    };
    
    // Theme configuration
    this.theme = {
      colors: {
        primary: '#2196F3',
        secondary: '#FF9800',
        success: '#4CAF50',
        warning: '#FF5722',
        error: '#F44336',
        text: '#333333',
        background: '#FFFFFF',
        border: '#DDDDDD',
        hover: '#E3F2FD'
      },
      fonts: {
        main: 'Arial, sans-serif',
        mono: 'Courier New, monospace'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      },
      borderRadius: '4px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    };
    
    // Initialize containers
    this.initializeContainers();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Start update cycle
    this.startUpdateCycle();
    
    // console.log('[UI_MANAGER] Unified UI Framework initialized');
  }
  
  /**
   * Initialize UI containers and register them
   */
  initializeContainers() {
    // Register all main containers
    this.containers.set('left-column', document.querySelector('.left-column'));
    this.containers.set('middle-column', document.querySelector('.middle-column'));
    this.containers.set('right-column', document.querySelector('.right-column'));
    
    // Register system-specific containers
    this.containers.set('assistants', document.getElementById('assistants-container'));
    this.containers.set('unified-upgrades', document.getElementById('unified-upgrades-container'));
    this.containers.set('yeti', document.getElementById('yeti-container'));
    this.containers.set('icicle', document.getElementById('icicle-container'));
    this.containers.set('inventory', document.getElementById('inventory-content'));
    this.containers.set('dashboard', document.getElementById('dashboard-content'));
    this.containers.set('achievements', document.getElementById('achievements-container'));
    this.containers.set('lore', document.getElementById('lore-container'));
    
    // Register currency displays
    this.containers.set('currency-left', document.querySelector('.left-column #currency-display'));
    this.containers.set('currency-right', document.querySelector('.right-column #currency-display'));
    this.containers.set('currency-dashboard', document.getElementById('dashboard-currency-display'));
    
    // console.log('[UI_MANAGER] Registered containers:', Array.from(this.containers.keys()));
  }
  
  /**
   * Set up event listeners for reactive UI updates
   */
  setupEventListeners() {
    // Game state change events
    eventBus.on('gameStateChanged', (data) => {
      this.queueUpdate('currency');
      this.queueUpdate('dashboard');
    }, 'UIManager');
    
    // System-specific events
    eventBus.on('assistantPurchased', () => {
      this.queueUpdate('assistants');
      this.queueUpdate('inventory');
      this.queueUpdate('currency');
    }, 'UIManager');
    
    eventBus.on('upgradePurchased', () => {
      this.queueUpdate('unified-upgrades');
      this.queueUpdate('inventory');
      this.queueUpdate('currency');
    }, 'UIManager');
    
    eventBus.on('yetiSpotted', () => {
      this.queueUpdate('yeti');
      this.queueUpdate('inventory'); // Update inventory to freeze ability belt
    }, 'UIManager');
    
    eventBus.on('yetiBuffActivated', () => {
      this.queueUpdate('yeti');
      this.queueUpdate('inventory'); // Update inventory - belt stays frozen due to active buff
    }, 'UIManager');
    
    eventBus.on('yetiBuffExpired', () => {
      this.queueUpdate('yeti');
      this.queueUpdate('inventory'); // Update inventory to potentially unfreeze ability belt
    }, 'UIManager');
    
    eventBus.on('yetiDespawned', () => {
      this.queueUpdate('yeti');
      this.queueUpdate('inventory'); // Update inventory to potentially unfreeze ability belt
    }, 'UIManager');
    
    eventBus.on('abilityBeltChanged', () => {
      this.queueUpdate('inventory'); // Update inventory when ability belt changes
    }, 'UIManager');
    
    eventBus.on('assistantLeveledUp', () => {
      this.queueUpdate('assistants');
      this.queueUpdate('currency'); // Add currency update for wallet display
    }, 'UIManager');
    
    eventBus.on('icicleHarvested', () => {
      this.queueUpdate('icicle');
      this.queueUpdate('currency'); // Add currency update for wallet display
    }, 'UIManager');
    
    eventBus.on('iciclesAdded', () => {
      this.queueUpdate('currency'); // Update wallet when icicles are added
    }, 'UIManager');
    
    eventBus.on('iciclesSpent', () => {
      this.queueUpdate('assistants');
      this.queueUpdate('currency'); // Update wallet when icicles are spent
    }, 'UIManager');
    
    eventBus.on('achievementUnlocked', () => {
      this.queueUpdate('achievements');
    }, 'UIManager');
    
    eventBus.on('loreUnlocked', () => {
      this.queueUpdate('lore');
    }, 'UIManager');
    
    // Loop system events
    eventBus.on('passiveSystemUpdated', (data) => {
      if (data.system === 'assistants') {
        this.queueUpdate('assistants');
      }
    }, 'UIManager');
    
    eventBus.on('hybridSystemUpdated', (data) => {
      if (data.system === 'yetis') {
        this.queueUpdate('yeti');
      }
    }, 'UIManager');
    
    // Performance events
    eventBus.on('performanceUpdate', () => {
      this.queueUpdate('dashboard');
    }, 'UIManager');
  }
  
  /**
   * Queue a UI component for update
   * @param {string} componentType - Type of component to update
   */
  queueUpdate(componentType) {
    this.updateQueue.add(componentType);
  }
  
  /**
   * Start the UI update cycle
   */
  startUpdateCycle() {
    // Use requestAnimationFrame for smooth updates
    const updateCycle = () => {
      if (this.updateQueue.size > 0 && !this.isUpdating) {
        this.processBatchedUpdates();
      }
      requestAnimationFrame(updateCycle);
    };
    
    requestAnimationFrame(updateCycle);
    
    // Also run a slower cycle for less critical updates
    setInterval(() => {
      this.queueUpdate('currency');
      this.queueUpdate('dashboard');
    }, 1000);
  }
  
  /**
   * Process all queued updates in a batch
   */
  processBatchedUpdates() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    const startTime = performance.now();
    
    try {
      const updates = Array.from(this.updateQueue);
      this.updateQueue.clear();
      
      // Process updates in priority order
      const priorityOrder = ['currency', 'assistants', 'unified-upgrades', 'yeti', 'icicle', 'inventory', 'dashboard', 'achievements', 'lore'];
      
      const sortedUpdates = updates.sort((a, b) => {
        const aIndex = priorityOrder.indexOf(a);
        const bIndex = priorityOrder.indexOf(b);
        return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      });
      
      for (const componentType of sortedUpdates) {
        try {
          this.updateComponent(componentType);
        } catch (error) {
          // console.error(`[UI_MANAGER] Error updating ${componentType}:`, error);
        }
      }
      
      // Update performance metrics
      const updateTime = performance.now() - startTime;
      this.performanceMetrics.totalUpdates++;
      this.performanceMetrics.totalUpdateTime += updateTime;
      this.performanceMetrics.averageUpdateTime = this.performanceMetrics.totalUpdateTime / this.performanceMetrics.totalUpdates;
      this.performanceMetrics.lastUpdateTime = updateTime;
      this.performanceMetrics.batchedUpdates++;
      
      if (updateTime > 10) {
        // console.warn(`[UI_MANAGER] Slow batch update: ${updateTime.toFixed(2)}ms for ${updates.length} components`);
      }
      
    } finally {
      this.isUpdating = false;
    }
  }
  
  /**
   * Update a specific component
   * @param {string} componentType - Type of component to update
   */
  updateComponent(componentType) {
    const startTime = performance.now();
    
    try {
      switch (componentType) {
        case 'currency':
          this.renderCurrencyDisplays();
          break;
        case 'assistants':
          this.renderAssistants();
          break;
        case 'unified-upgrades':
          this.renderUnifiedUpgrades();
          break;
        case 'yeti':
          this.renderYetiSystem();
          break;
        case 'icicle':
          this.renderIcicleSystem();
          break;
        case 'inventory':
          this.renderInventory();
          break;
        case 'dashboard':
          this.renderDashboard();
          break;
        case 'achievements':
          this.renderAchievements();
          break;
        case 'lore':
          this.renderLore();
          break;
        default:
          // console.warn(`[UI_MANAGER] Unknown component type: ${componentType}`);
      }
      
      // Update component performance tracking
      if (!this.performanceMetrics.componentCounts[componentType]) {
        this.performanceMetrics.componentCounts[componentType] = 0;
      }
      this.performanceMetrics.componentCounts[componentType]++;
      
    } catch (error) {
      // console.error(`[UI_MANAGER] Error rendering ${componentType}:`, error);
    }
    
    const updateTime = performance.now() - startTime;
    if (updateTime > 5) {
      // console.warn(`[UI_MANAGER] Slow component update: ${componentType} took ${updateTime.toFixed(2)}ms`);
    }
  }
  
  /**
   * Create a styled component with consistent theming
   * @param {string} type - HTML element type
   * @param {Object} options - Component options
   * @returns {HTMLElement} - Styled element
   */
  createComponent(type, options = {}) {
    const element = document.createElement(type);
    
    // Apply base styles
    element.style.fontFamily = this.theme.fonts.main;
    element.style.color = this.theme.colors.text;
    
    // Apply component-specific styles
    if (options.styles) {
      Object.assign(element.style, options.styles);
    }
    
    // Apply CSS classes
    if (options.className) {
      element.className = options.className;
    }
    
    // Apply component type styles
    switch (type) {
      case 'button':
        this.applyButtonStyles(element, options.variant || 'primary');
        break;
      case 'card':
        this.applyCardStyles(element);
        break;
      case 'container':
        this.applyContainerStyles(element);
        break;
    }
    
    // Set content
    if (options.textContent) {
      element.textContent = options.textContent;
    }
    
    if (options.innerHTML) {
      element.innerHTML = options.innerHTML;
    }
    
    // Add event listeners
    if (options.onClick) {
      element.addEventListener('click', options.onClick);
    }
    
    return element;
  }
  
  /**
   * Apply button styles based on variant
   * @param {HTMLElement} element - Button element
   * @param {string} variant - Button variant (primary, secondary, success, warning, error)
   */
  applyButtonStyles(element, variant) {
    const baseStyles = {
      border: 'none',
      borderRadius: this.theme.borderRadius,
      padding: `${this.theme.spacing.sm} ${this.theme.spacing.md}`,
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '14px',
      transition: 'all 0.2s ease',
      boxShadow: this.theme.boxShadow
    };
    
    let variantStyles = {};
    switch (variant) {
      case 'primary':
        variantStyles = {
          backgroundColor: this.theme.colors.primary,
          color: 'white'
        };
        break;
      case 'secondary':
        variantStyles = {
          backgroundColor: this.theme.colors.secondary,
          color: 'white'
        };
        break;
      case 'success':
        variantStyles = {
          backgroundColor: this.theme.colors.success,
          color: 'white'
        };
        break;
      case 'warning':
        variantStyles = {
          backgroundColor: this.theme.colors.warning,
          color: 'white'
        };
        break;
      case 'error':
        variantStyles = {
          backgroundColor: this.theme.colors.error,
          color: 'white'
        };
        break;
    }
    
    Object.assign(element.style, baseStyles, variantStyles);
    
    // Add hover effect
    element.addEventListener('mouseenter', () => {
      element.style.opacity = '0.9';
      element.style.transform = 'translateY(-1px)';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    });
  }
  
  /**
   * Apply card styles
   * @param {HTMLElement} element - Card element
   */
  applyCardStyles(element) {
    const cardStyles = {
      border: `1px solid ${this.theme.colors.border}`,
      borderRadius: this.theme.borderRadius,
      padding: this.theme.spacing.md,
      margin: this.theme.spacing.sm,
      backgroundColor: this.theme.colors.background,
      boxShadow: this.theme.boxShadow,
      transition: 'all 0.2s ease'
    };
    
    Object.assign(element.style, cardStyles);
    
    // Add hover effect
    element.addEventListener('mouseenter', () => {
      element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      element.style.transform = 'translateY(-2px)';
    });
    
    element.addEventListener('mouseleave', () => {
      element.style.boxShadow = this.theme.boxShadow;
      element.style.transform = 'translateY(0)';
    });
  }
  
  /**
   * Apply container styles
   * @param {HTMLElement} element - Container element
   */
  applyContainerStyles(element) {
    const containerStyles = {
      padding: this.theme.spacing.md,
      margin: this.theme.spacing.sm
    };
    
    Object.assign(element.style, containerStyles);
  }
  
  /**
   * Render currency displays
   * Updates the existing DOM elements with current game values
   */
  renderCurrencyDisplays() {
    // Get current values with proper number conversion
    const snowballs = Number(this.game.snowballs) || 0;
    const lifetime = Number(this.game.lifetimeSnowballs) || 0;
    const currentAnalogSnowballs = Number(this.game.currentAnalogSnowballs) || 0;
    const sps = Number(this.game.sps) || 0;
    const snowflakes = Number(this.game.snowflakes) || 0;
    const icicleCount = Number(this.game.icicles) || 0;
    const analog = Number(this.game.analogNumber) || 1;
    const acceleration = getAcceleration(this.game);
    
    // Create the full currency display HTML structure
    const currencyHTML = `
      Snowball Wallet: <span id="snowball-count">${snowballs.toExponential(2)}</span><br>
      Lifetime Snowballs: <span id="lifetime-count">${lifetime.toExponential(2)}</span><br>
      Analog <span id="current-analog-number">${analog}</span> Snowballs: <span id="current-analog-snowballs">${currentAnalogSnowballs.toExponential(2)}</span><br>
      SPS: <span id="sps-display">${sps.toExponential(2)}</span><br>
      Acceleration: <span id="acceleration-display">${acceleration.toExponential(2)}</span> /s²<br>
      Snowflakes: <span id="snowflake-count">${snowflakes.toExponential(2)}</span><br>
      Icicles: <span id="icicle-count">${icicleCount}</span><span id="icicle-progress">(0% complete)</span><br>
      Analog: <span id="analog-count">${analog}</span>
    `;
    
    // Update all currency display containers
    const containers = [
      'currency-left',
      'currency-right', 
      'currency-dashboard'
    ];
    
    containers.forEach(containerKey => {
      const container = this.containers.get(containerKey);
      if (container) {
        // Find the currency display element within the container
        let currencyDisplay = container.querySelector('#currency-display');
        if (!currencyDisplay) {
          // If no currency display exists, create one
          currencyDisplay = document.createElement('div');
          currencyDisplay.id = 'currency-display';
          container.appendChild(currencyDisplay);
        }
        currencyDisplay.innerHTML = currencyHTML;
      }
    });
    
    // Add buff indicators to currency displays
    this.updateBuffIndicators();
  }
  
  /**
   * Update buff indicators in currency displays
   */
  updateBuffIndicators() {
    const buffIndicators = this.getBuffIndicators();
    
    // Update buff indicators in left column
    const leftCurrency = this.containers.get('currency-left');
    if (leftCurrency) {
      this.updateBuffIndicatorInDisplay(leftCurrency, buffIndicators);
    }
    
    // Update buff indicators in right column
    const rightCurrency = this.containers.get('currency-right');
    if (rightCurrency) {
      this.updateBuffIndicatorInDisplay(rightCurrency, buffIndicators);
    }
    
    // Update buff indicators in dashboard
    const dashboardCurrency = this.containers.get('currency-dashboard');
    if (dashboardCurrency) {
      this.updateBuffIndicatorInDisplay(dashboardCurrency, buffIndicators);
    }
  }
  
  /**
   * Update buff indicator in a specific currency display
   * @param {HTMLElement} container - Currency display container
   * @param {string} buffHtml - Buff indicator HTML
   */
  updateBuffIndicatorInDisplay(container, buffHtml) {
    if (!container) return;
    
    let buffIndicator = container.querySelector('.buff-indicator');
    if (!buffIndicator) {
      buffIndicator = document.createElement('div');
      buffIndicator.className = 'buff-indicator';
      container.appendChild(buffIndicator);
    }
    
    buffIndicator.innerHTML = buffHtml;
    buffIndicator.style.display = buffHtml ? 'block' : 'none';
  }
  
  /**
   * Generate buff indicators HTML
   * @returns {string} - HTML string for buff indicators
   */
  getBuffIndicators() {
    let indicators = [];
    
    // Check for yeti buffs
    if (window.getYetiBuffRemainingTime) {
      const yetiTime = window.getYetiBuffRemainingTime(this.game);
      const yetiClass = window.getYetiBuffClass ? window.getYetiBuffClass(this.game) : '';
      
      if (yetiTime > 0) {
        indicators.push(`🐾 Yeti: ${yetiClass} (${yetiTime}s)`);
      }
    }
    
    // Check for location buffs
    if (window.getLocationBuffRemainingTime) {
      const locationTime = window.getLocationBuffRemainingTime();
      const locationClass = window.getLocationBuffClass ? window.getLocationBuffClass(this.game) : '';
      
      if (locationTime > 0) {
        indicators.push(`Location: ${locationClass} (${locationTime}s)`);
      }
    }
    
    return indicators.length > 0 ? indicators.join('<br>') : '';
  }
  
  /**
   * Safely update element text content
   * @param {string} id - Element ID
   * @param {string} value - New text content
   */
  safeUpdateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }
  
  /**
   * Render assistants system
   */
  renderAssistants() {
    const container = this.containers.get('assistants');
    if (!container) return;
    
    // Disabled old assistant UI - using new GameReadyUIManager instead
    // This will be implemented by calling the existing assistant UI system
    // but with consistent styling through our component system
    // if (window.updateAssistantsUI) {
    //   window.updateAssistantsUI(this.game);
    // }
  }
  
  /**
   * Render unified upgrades system
   */
  renderUnifiedUpgrades() {
    const container = this.containers.get('unified-upgrades');
    if (!container) return;
    
    if (window.updateUnifiedUpgradesUI) {
      window.updateUnifiedUpgradesUI(this.game);
    }
  }
  
  /**
   * Render yeti system
   */
  renderYetiSystem() {
    const container = this.containers.get('yeti');
    if (!container) return;
    
    if (window.updateYetiUI) {
      window.updateYetiUI(this.game);
    }
  }
  
  /**
   * Render icicle system
   */
  renderIcicleSystem() {
    const container = this.containers.get('icicle');
    if (!container) return;
    
    if (window.updateIcicle) {
      window.updateIcicle(this.game);
    }
  }
  
  /**
   * Render inventory
   */
  renderInventory() {
    const container = this.containers.get('inventory');
    if (!container) return;
    
    if (window.updateInventoryDisplay) {
      window.updateInventoryDisplay(this.game);
    }
  }
  
  /**
   * Render dashboard
   */
  renderDashboard() {
    const container = this.containers.get('dashboard');
    if (!container) return;
    
    if (window.renderDashboardTables) {
      window.renderDashboardTables(this.game);
    }
  }
  
  /**
   * Render achievements
   */
  renderAchievements() {
    const container = this.containers.get('achievements');
    if (!container) return;
    
    if (window.renderAchievementsUI) {
      window.renderAchievementsUI(this.game);
    }
  }
  
  /**
   * Render lore
   */
  renderLore() {
    const container = this.containers.get('lore');
    if (!container) return;
    
    if (window.renderLoreUI) {
      window.renderLoreUI(this.game);
    }
  }
  
  /**
   * Force update all components
   */
  forceUpdateAll() {
    const allComponents = ['currency', 'assistants', 'unified-upgrades', 'yeti', 'icicle', 'inventory', 'dashboard', 'achievements', 'lore'];
    allComponents.forEach(component => this.queueUpdate(component));
  }
  
  /**
   * Get performance metrics
   * @returns {Object} - Performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
  
  /**
   * Get component statistics
   * @returns {Object} - Component statistics
   */
  getComponentStats() {
    return {
      registeredContainers: this.containers.size,
      registeredComponents: this.components.size,
      queuedUpdates: this.updateQueue.size,
      isUpdating: this.isUpdating,
      componentCounts: { ...this.performanceMetrics.componentCounts }
    };
  }
  
  /**
   * Enable or disable debug mode
   * @param {boolean} enabled - Whether to enable debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    if (enabled) {
      // console.log('[UI_MANAGER] Debug mode enabled');
      // Add debug UI elements
      this.addDebugUI();
    } else {
      // console.log('[UI_MANAGER] Debug mode disabled');
      this.removeDebugUI();
    }
  }
  
  /**
   * Add debug UI elements
   */
  addDebugUI() {
    // Add debug info to the page
    const debugContainer = document.createElement('div');
    debugContainer.id = 'ui-debug-container';
    debugContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      max-width: 300px;
    `;
    
    document.body.appendChild(debugContainer);
    
    // Update debug info every second
    setInterval(() => {
      if (this.debugMode) {
        const metrics = this.getPerformanceMetrics();
        const stats = this.getComponentStats();
        
        debugContainer.innerHTML = `
          <strong>UI Manager Debug</strong><br>
          Updates: ${metrics.totalUpdates}<br>
          Avg Time: ${metrics.averageUpdateTime.toFixed(2)}ms<br>
          Last Time: ${metrics.lastUpdateTime.toFixed(2)}ms<br>
          Batched: ${metrics.batchedUpdates}<br>
          Queued: ${stats.queuedUpdates}<br>
          Updating: ${stats.isUpdating ? 'Yes' : 'No'}
        `;
      }
    }, 1000);
  }
  
  /**
   * Remove debug UI elements
   */
  removeDebugUI() {
    const debugContainer = document.getElementById('ui-debug-container');
    if (debugContainer) {
      debugContainer.remove();
    }
  }
}

// Export for use in other modules
export default UIManager; 