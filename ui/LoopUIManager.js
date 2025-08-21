/**
 * ui/LoopUIManager.js - Loop-System UI Manager
 * 
 * This module extends the UIManager to provide specialized rendering
 * for the Active, Passive, and Hybrid loop systems. It integrates deeply
 * with the loop manager and provides system-specific UI components.
 */

import UIManager from './UIManager.js';
import { ComponentFactory } from './components.js';
import { eventBus } from '../core/eventBus.js';

export class LoopUIManager extends UIManager {
  constructor(game) {
    super(game);
    
    // Loop-specific UI state
    this.loopComponents = {
      active: new Map(),
      passive: new Map(),
      hybrid: new Map()
    };
    
    // System-specific update handlers
    this.systemUpdaters = {
      active: {
        clicker: this.renderClickerSystem.bind(this),
        abilities: this.renderAbilitiesSystem.bind(this)
      },
      passive: {
        assistants: this.renderAssistantsSystem.bind(this),
        boosts: this.renderBoostsSystem.bind(this),
        icicle: this.renderIcicleSystem.bind(this),
        global: this.renderGlobalSystem.bind(this)
      },
      hybrid: {
        yetis: this.renderYetiSystem.bind(this),
        locations: this.renderLocationsSystem.bind(this),
        events: this.renderEventsSystem.bind(this)
      }
    };
    
    // Set up loop-specific event listeners
    this.setupLoopEventListeners();
    
    // console.log('[LOOP_UI_MANAGER] Loop-specific UI Manager initialized');
  }
  
  /**
   * Set up event listeners for loop system events
   */
  setupLoopEventListeners() {
    // Loop Manager events
    eventBus.on('loopManagerUpdate', (data) => {
      this.queueUpdate('loop-performance');
    }, 'LoopUIManager');
    
    // Active system events
    eventBus.on('activeSystemUpdated', (data) => {
      this.queueLoopUpdate('active', data.system);
    }, 'LoopUIManager');
    
    // Passive system events
    eventBus.on('passiveSystemUpdated', (data) => {
      this.queueLoopUpdate('passive', data.system);
    }, 'LoopUIManager');
    
    // Hybrid system events
    eventBus.on('hybridSystemUpdated', (data) => {
      this.queueLoopUpdate('hybrid', data.system);
    }, 'LoopUIManager');
    
    // Cross-system events
    eventBus.on('crossSystemEvent', (data) => {
      // Update all related systems when cross-system events occur
      if (data.fromSystem) {
        this.queueLoopUpdate(data.fromSystemType, data.fromSystem);
      }
      if (data.toSystem) {
        this.queueLoopUpdate(data.toSystemType, data.toSystem);
      }
    }, 'LoopUIManager');
    
    // State synchronization events
    eventBus.on('loopStateChanged', (data) => {
      this.queueLoopUpdate(data.loopType, data.system);
    }, 'LoopUIManager');
    
    // Override assistant purchased event to prevent old UI flashing
    // The new GameReadyUIManager handles assistant UI updates
    eventBus.off('assistantPurchased', null, 'UIManager'); // Remove parent listener
    eventBus.on('assistantPurchased', (data) => {
      // Only update inventory and currency, not the old assistants UI
      this.queueUpdate('inventory');
      this.queueUpdate('currency');
    }, 'LoopUIManager');
  }
  
  /**
   * Queue a loop-specific system for update
   * @param {string} loopType - 'active', 'passive', or 'hybrid'
   * @param {string} systemName - Name of the system
   */
  queueLoopUpdate(loopType, systemName) {
    this.updateQueue.add(`${loopType}-${systemName}`);
  }
  
  /**
   * Update a loop-specific component
   * @param {string} componentType - Type of component to update
   */
  updateComponent(componentType) {
    // Handle loop-specific updates
    if (componentType.includes('-')) {
      const [loopType, systemName] = componentType.split('-');
      
      if (this.systemUpdaters[loopType] && this.systemUpdaters[loopType][systemName]) {
        this.systemUpdaters[loopType][systemName]();
        return;
      }
    }
    
    // Handle new loop-specific updates
    switch (componentType) {
      case 'loop-performance':
        this.renderLoopPerformance();
        break;
      case 'loop-stats':
        this.renderLoopStats();
        break;
      default:
        // Fall back to parent implementation
        super.updateComponent(componentType);
    }
  }
  
  /**
   * Render the clicker system (Active)
   */
  renderClickerSystem() {
    const container = this.containers.get('left-column');
    if (!container) return;
    
    const clickButton = container.querySelector('#click-button');
    if (clickButton) {
      // Apply consistent styling to click button
      Object.assign(clickButton.style, {
        backgroundColor: this.theme.colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: this.theme.borderRadius,
        padding: `${this.theme.spacing.md} ${this.theme.spacing.lg}`,
        fontSize: '18px',
        fontWeight: 'bold',
        cursor: 'pointer',
        boxShadow: this.theme.boxShadow,
        transition: 'all 0.2s ease',
        width: '100%',
        marginBottom: this.theme.spacing.md
      });
      
      // Enhanced hover effects
      clickButton.addEventListener('mouseenter', () => {
        clickButton.style.backgroundColor = this.theme.colors.hover;
        clickButton.style.transform = 'scale(1.05)';
      });
      
      clickButton.addEventListener('mouseleave', () => {
        clickButton.style.backgroundColor = this.theme.colors.primary;
        clickButton.style.transform = 'scale(1)';
      });
    }
    
    // Add click statistics if available
    if (this.game.loops?.active?.clicking) {
      const stats = this.game.loops.active.clicking;
      this.updateClickStats(container, stats);
    }
  }
  
  /**
   * Update click statistics display
   * @param {HTMLElement} container - Container element
   * @param {Object} stats - Click statistics
   */
  updateClickStats(container, stats) {
    let statsContainer = container.querySelector('#click-stats');
    
    if (!statsContainer) {
      statsContainer = ComponentFactory.createSystemPanel({
        title: 'Click Statistics',
        collapsible: true,
        collapsed: true
      }).createElement();
      statsContainer.id = 'click-stats';
      container.appendChild(statsContainer);
    }
    
    const content = statsContainer.querySelector('div:last-child');
    if (content) {
      content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <div style="text-align: center; padding: 8px; background: rgba(33, 150, 243, 0.1); border-radius: 4px;">
            <div style="font-size: 20px; font-weight: bold; color: ${this.theme.colors.primary};">${stats.totalClicks || 0}</div>
            <div style="font-size: 12px; color: #666;">Total Clicks</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(255, 152, 0, 0.1); border-radius: 4px;">
            <div style="font-size: 20px; font-weight: bold; color: ${this.theme.colors.secondary};">${stats.clickStreak || 0}</div>
            <div style="font-size: 12px; color: #666;">Current Streak</div>
          </div>
        </div>
      `;
    }
  }
  
  /**
   * Render abilities system (Active)
   */
  renderAbilitiesSystem() {
    // Future implementation for active abilities
    // console.log('[LOOP_UI_MANAGER] Rendering abilities system (placeholder)');
  }
  
  /**
   * Render assistants system (Passive) with enhanced UI
   */
  renderAssistantsSystem() {
    const container = this.containers.get('assistants');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Create system panel
    const panel = ComponentFactory.createSystemPanel({
      title: 'Assistants',
      collapsible: false
    });
    
    container.appendChild(panel.createElement());
    
    // Add assistant data if available
    if (this.game.loops?.passive?.assistants) {
      const assistantState = this.game.loops.passive.assistants;
      this.renderAssistantDetails(panel, assistantState);
    }
    
    // Disabled old assistant UI - using new GameReadyUIManager instead
    // Fall back to existing system if loop state not available
    // if (window.updateAssistantsUI) {
    //   window.updateAssistantsUI(this.game);
    // }
  }
  
  /**
   * Render detailed assistant information
   * @param {SystemPanelComponent} panel - Panel component
   * @param {Object} assistantState - Assistant state from loop system
   */
  renderAssistantDetails(panel, assistantState) {
    // Add efficiency display
    const efficiencyDisplay = ComponentFactory.createStatDisplay({
      label: 'Assistant Efficiency',
      value: assistantState.efficiency || 1.0,
      format: 'percentage',
      color: this.theme.colors.success
    });
    
    panel.addComponent(efficiencyDisplay);
    
    // Add statistics
    if (assistantState.statistics) {
      const stats = assistantState.statistics;
      
      const totalGeneration = ComponentFactory.createStatDisplay({
        label: 'Total Generation',
        value: stats.totalGeneration || 0,
        format: 'currency',
        color: this.theme.colors.primary
      });
      
      panel.addComponent(totalGeneration);
    }
  }
  
  /**
   * Render boosts system (Passive)
   */
  renderBoostsSystem() {
    if (window.updateBoostsUI) {
      window.updateBoostsUI(this.game);
    }
  }
  
  /**
   * Render global system (Passive)
   */
  renderGlobalSystem() {
    // Enhanced global upgrades rendering with loop state
    if (window.checkForUnlockedGlobalUpgrades) {
      window.checkForUnlockedGlobalUpgrades(this.game);
    }
    
    // Add global statistics if available
    if (this.game.loops?.passive?.global?.statistics) {
      this.renderGlobalStats();
    }
  }
  
  /**
   * Render global statistics
   */
  renderGlobalStats() {
    const container = this.containers.get('global-upgrades');
    if (!container) return;
    
    const stats = this.game.loops.passive.global.statistics;
    
    let statsContainer = container.querySelector('#global-stats');
    if (!statsContainer) {
      statsContainer = document.createElement('div');
      statsContainer.id = 'global-stats';
      statsContainer.style.cssText = `
        margin-top: 16px;
        padding: 12px;
        background: rgba(0,0,0,0.05);
        border-radius: 4px;
        font-size: 12px;
      `;
      container.appendChild(statsContainer);
    }
    
    statsContainer.innerHTML = `
      <strong>Global Statistics</strong><br>
      Upgrades Purchased: ${stats.totalUpgradesPurchased || 0}<br>
      Total Cost: ${(stats.totalUpgradeCost || 0).toExponential(2)}<br>
      Recent Purchases: ${(stats.upgradeHistory || []).length}
    `;
  }
  
  /**
   * Render yeti system (Hybrid) with enhanced display
   */
  renderYetiSystem() {
    const container = this.containers.get('yeti');
    if (!container) return;
    
    // Enhanced yeti display
    if (window.updateYetiUI) {
      window.updateYetiUI(this.game);
    }
    
    // Add yeti statistics if available
    if (this.game.loops?.hybrid?.yetis?.statistics) {
      this.renderYetiStats(container);
    }
  }
  
  /**
   * Render yeti statistics
   * @param {HTMLElement} container - Yeti container
   */
  renderYetiStats(container) {
    const stats = this.game.loops.hybrid.yetis.statistics;
    
    let statsContainer = container.querySelector('#yeti-stats');
    if (!statsContainer) {
      const panel = ComponentFactory.createSystemPanel({
        title: 'Yeti Statistics',
        collapsible: true,
        collapsed: true
      });
      
      statsContainer = panel.createElement();
      statsContainer.id = 'yeti-stats';
      container.appendChild(statsContainer);
    }
    
    const content = statsContainer.querySelector('div:last-child');
    if (content) {
      content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
          <div><strong>Interactions:</strong> ${stats.totalInteractions || 0}</div>
          <div><strong>Buff Uptime:</strong> ${((stats.buffUptime || 0) / 1000).toFixed(1)}s</div>
          <div><strong>Avg Duration:</strong> ${((stats.averageBuffDuration || 0) / 1000).toFixed(1)}s</div>
          <div><strong>Favorite:</strong> ${this.game.loops.hybrid.yetis.preferences?.favoriteYetiClass || 'None'}</div>
        </div>
      `;
    }
  }
  
  /**
   * Render locations system (Hybrid)
   */
  renderLocationsSystem() {
    // Future implementation for location system
    // console.log('[LOOP_UI_MANAGER] Rendering locations system (placeholder)');
  }
  
  /**
   * Render events system (Hybrid)
   */
  renderEventsSystem() {
    // Future implementation for events system
    // console.log('[LOOP_UI_MANAGER] Rendering events system (placeholder)');
  }
  
  /**
   * Render loop performance metrics
   */
  renderLoopPerformance() {
    const container = this.containers.get('dashboard');
    if (!container) return;
    
    // Get performance data from loop manager
    if (window.loopManager) {
      const stats = window.loopManager.getPerformanceStats();
      this.renderPerformancePanel(container, stats);
    }
  }
  
  /**
   * Render performance panel
   * @param {HTMLElement} container - Container element
   * @param {Object} stats - Performance statistics
   */
  renderPerformancePanel(container, stats) {
    let perfContainer = container.querySelector('#performance-panel');
    
    if (!perfContainer) {
      const panel = ComponentFactory.createSystemPanel({
        title: 'Loop Performance',
        collapsible: true,
        collapsed: true
      });
      
      perfContainer = panel.createElement();
      perfContainer.id = 'performance-panel';
      container.appendChild(perfContainer);
    }
    
    const content = perfContainer.querySelector('div:last-child');
    if (content) {
      content.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; font-size: 12px;">
          <div style="text-align: center; padding: 8px; background: rgba(33, 150, 243, 0.1); border-radius: 4px;">
            <div style="font-weight: bold; color: ${this.theme.colors.primary};">${stats.active?.updateCount || 0}</div>
            <div>Active Updates</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(76, 175, 80, 0.1); border-radius: 4px;">
            <div style="font-weight: bold; color: ${this.theme.colors.success};">${stats.passive?.updateCount || 0}</div>
            <div>Passive Updates</div>
          </div>
          <div style="text-align: center; padding: 8px; background: rgba(255, 152, 0, 0.1); border-radius: 4px;">
            <div style="font-weight: bold; color: ${this.theme.colors.secondary};">${stats.hybrid?.updateCount || 0}</div>
            <div>Hybrid Updates</div>
          </div>
        </div>
        <div style="margin-top: 8px; font-size: 11px; color: #666;">
          Avg Times: Active ${(stats.active?.averageTime || 0).toFixed(2)}ms | 
          Passive ${(stats.passive?.averageTime || 0).toFixed(2)}ms | 
          Hybrid ${(stats.hybrid?.averageTime || 0).toFixed(2)}ms
        </div>
      `;
    }
  }
  
  /**
   * Render enhanced currency displays with loop state information
   */
  renderCurrencyDisplays() {
    // Call parent implementation
    super.renderCurrencyDisplays();
    
    // Add loop state indicators
    this.addLoopStateIndicators();
  }
  
  /**
   * Add loop state indicators to currency displays
   */
  addLoopStateIndicators() {
    const displays = ['currency-left', 'currency-right'];
    
    displays.forEach(displayId => {
      const container = this.containers.get(displayId);
      if (container) {
        // Add loop status indicator
        let indicator = container.querySelector('#loop-indicator');
        
        if (!indicator) {
          indicator = document.createElement('div');
          indicator.id = 'loop-indicator';
          indicator.style.cssText = `
            margin-top: 8px;
            padding: 4px 8px;
            background: rgba(33, 150, 243, 0.1);
            border-radius: 4px;
            font-size: 11px;
            text-align: center;
          `;
          container.appendChild(indicator);
        }
        
        // Update indicator content
        const activeSystemCount = window.loopManager?.systems?.active?.size || 0;
        const passiveSystemCount = window.loopManager?.systems?.passive?.size || 0;
        const hybridSystemCount = window.loopManager?.systems?.hybrid?.size || 0;
        
        indicator.innerHTML = `
          🔄 Systems: A:${activeSystemCount} P:${passiveSystemCount} H:${hybridSystemCount}
        `;
      }
    });
  }
  
  /**
   * Show a notification specific to loop systems
   * @param {string} message - Notification message
   * @param {string} loopType - Loop type ('active', 'passive', 'hybrid')
   * @param {string} systemName - System name
   */
  showLoopNotification(message, loopType, systemName) {
    const colors = {
      active: 'info',
      passive: 'success',
      hybrid: 'warning'
    };
    
    const fullMessage = `[${loopType.toUpperCase()}/${systemName}] ${message}`;
    ComponentFactory.showNotification(fullMessage, colors[loopType] || 'info');
  }
  
  /**
   * Get loop-specific performance metrics
   * @returns {Object} - Loop performance metrics
   */
  getLoopPerformanceMetrics() {
    const baseMetrics = this.getPerformanceMetrics();
    
    // Add loop-specific metrics
    const loopMetrics = {
      loopComponents: {
        active: this.loopComponents.active.size,
        passive: this.loopComponents.passive.size,
        hybrid: this.loopComponents.hybrid.size
      }
    };
    
    return {
      ...baseMetrics,
      ...loopMetrics
    };
  }
}

export default LoopUIManager; 