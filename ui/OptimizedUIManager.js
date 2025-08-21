/**
 * ui/OptimizedUIManager.js - Optimized UI Management System
 * 
 * This module provides a high-performance UI management system designed for
 * complex game interfaces with real-time updates and user interactions.
 * 
 * Key features:
 * - Priority-based update system (critical, secondary, tertiary)
 * - Performance monitoring and optimization
 * - Safety checks to protect core game mechanics
 * - Component lifecycle management
 * - Event-driven reactive updates
 * - Batching for non-critical updates
 */

import { eventBus } from '../core/eventBus.js';

// Priority levels for UI updates
const PRIORITIES = {
  CRITICAL: 10,    // Clicks, purchases, wallet - immediate response
  SECONDARY: 5,    // SPS updates, location indicators - smooth updates
  TERTIARY: 1      // Achievements, lore, background - batched updates
};

// Component types for the three-column layout + banner
const COMPONENT_TYPES = {
  CLICKER_PANEL: 'clicker',      // Left column - critical interactions
  DASHBOARD: 'dashboard',        // Center column - performance data
  ASSISTANTS: 'assistants',      // Right column - purchases and upgrades
  BANNER: 'banner'              // Top banner - notifications and meta controls
};

export class OptimizedUIManager {
  constructor(game) {
    this.game = game;
    
    // Component registry with lifecycle management
    this.components = new Map();
    this.componentStates = new Map();
    
    // Priority-based update queue
    this.updateQueue = new Map();
    this.isUpdating = false;
    
    // Performance monitoring
    this.performanceMetrics = {
      totalUpdates: 0,
      totalUpdateTime: 0,
      averageUpdateTime: 0,
      lastUpdateTime: 0,
      criticalUpdates: 0,
      secondaryUpdates: 0,
      tertiaryUpdates: 0,
      errors: 0,
      componentCounts: {}
    };
    
    // Layout containers
    this.containers = {
      clicker: null,
      dashboard: null,
      assistants: null,
      banner: null
    };
    
    // Configuration
    this.config = {
      enablePerformanceMonitoring: true,
      enableSafetyChecks: true,
      maxUpdateTime: 16, // 16ms target for critical updates
      batchSize: 10,
      debugMode: false
    };
    
    // Initialize the UI system
    this.initialize();
    
            // console.log('[OPTIMIZED_UI] OptimizedUIManager initialized');
  }
  
  /**
   * Initialize the UI system
   */
  initialize() {
    try {
      // Inject stable CSS
      this.injectStableCSS();
      
      // Create layout containers
      this.createLayout();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Start update cycle
      this.startUpdateCycle();
      
      // Initialize basic testing UI
      this.initializeTestingUI();
      
    } catch (error) {
      // console.error('[OPTIMIZED_UI] Initialization error:', error);
      throw error;
    }
  }
  
  /**
   * Inject stable CSS that won't conflict with DOM updates
   */
  injectStableCSS() {
    const style = document.createElement('style');
    style.textContent = `
      /* Stable hover effects for assistant items */
      .assistant-item:hover {
        background: #f8f9fa !important;
        border-color: #2196F3 !important;
      }
      
      /* Stable button hover effects */
      .buy-assistant-btn.affordable:hover {
        background: linear-gradient(135deg, #45a049 0%, #3d8b40 100%) !important;
      }
      
      .buy-assistant-btn.affordable:active {
        background: #3d8b40 !important;
        transform: translateY(1px);
      }
      
      /* Smooth transitions to prevent flashing */
      .assistant-item,
      .buy-assistant-btn,
      .upgrade-item,
      .assistant-box {
        transition: all 0.2s ease !important;
      }
      
      /* Prevent rapid changes that cause flashing */
      .assistant-item:hover,
      .upgrade-item:hover,
      .assistant-box:hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      /* Smooth button transitions */
      .buy-assistant-btn.affordable:hover,
      .buy-assistant-btn.affordable:active {
        transition: background 0.2s ease, transform 0.1s ease !important;
      }
      
      /* Prevent text flashing during updates */
      .snowball-counter,
      .sps-display,
      .assistant-count,
      .upgrade-cost {
        transition: opacity 0.1s ease !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Create the three-column layout + banner
   */
  createLayout() {
    // Create main container
    const mainContainer = document.createElement('div');
    mainContainer.id = 'optimized-ui-container';
    mainContainer.style.cssText = `
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
    `;
    
    // Create banner
    const banner = document.createElement('div');
    banner.id = 'ui-banner';
    banner.style.cssText = `
      background-color: #2196F3;
      color: white;
      padding: 8px 16px;
      font-weight: bold;
      text-align: center;
      min-height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    banner.textContent = 'Snowball Frenzy - Optimized UI';
    
    // Create main content area
    const contentArea = document.createElement('div');
    contentArea.style.cssText = `
      display: flex;
      flex: 1;
      overflow: hidden;
    `;
    
    // Create three columns
    const clickerPanel = document.createElement('div');
    clickerPanel.id = 'clicker-panel';
    clickerPanel.style.cssText = `
      flex: 1;
      background-color: white;
      border-right: 1px solid #ddd;
      padding: 16px;
      overflow-y: auto;
    `;
    
    const dashboardPanel = document.createElement('div');
    dashboardPanel.id = 'dashboard-panel';
    dashboardPanel.style.cssText = `
      flex: 1;
      background-color: white;
      border-right: 1px solid #ddd;
      padding: 16px;
      overflow-y: auto;
    `;
    
    const assistantsPanel = document.createElement('div');
    assistantsPanel.id = 'assistants-panel';
    assistantsPanel.style.cssText = `
      flex: 1;
      background-color: white;
      padding: 16px;
      overflow-y: auto;
    `;
    
    // Assemble layout
    contentArea.appendChild(clickerPanel);
    contentArea.appendChild(dashboardPanel);
    contentArea.appendChild(assistantsPanel);
    
    mainContainer.appendChild(banner);
    mainContainer.appendChild(contentArea);
    
    // Replace existing content or append to body
    const existingContainer = document.getElementById('optimized-ui-container');
    if (existingContainer) {
      existingContainer.replaceWith(mainContainer);
    } else {
      document.body.appendChild(mainContainer);
    }
    
    // Store container references
    this.containers.clicker = clickerPanel;
    this.containers.dashboard = dashboardPanel;
    this.containers.assistants = assistantsPanel;
    this.containers.banner = banner;
    
            // console.log('[OPTIMIZED_UI] Layout created successfully');
  }
  
  /**
   * Set up event listeners for reactive updates
   */
  setupEventListeners() {
    // Core game events
    eventBus.on('snowballsChanged', this.handleSnowballsChanged.bind(this), 'OptimizedUI', { priority: PRIORITIES.CRITICAL });
    eventBus.on('assistantPurchased', this.handleAssistantPurchased.bind(this), 'OptimizedUI', { priority: PRIORITIES.CRITICAL });
    eventBus.on('boostPurchased', this.handleBoostPurchased.bind(this), 'OptimizedUI', { priority: PRIORITIES.CRITICAL });
    eventBus.on('spsChanged', this.handleSPSChanged.bind(this), 'OptimizedUI', { priority: PRIORITIES.SECONDARY });
    eventBus.on('achievementUnlocked', this.handleAchievementUnlocked.bind(this), 'OptimizedUI', { priority: PRIORITIES.TERTIARY });
    eventBus.on('loreDiscovered', this.handleLoreDiscovered.bind(this), 'OptimizedUI', { priority: PRIORITIES.TERTIARY });
    eventBus.on('gameStateChanged', this.handleGameStateChanged.bind(this), 'OptimizedUI', { priority: PRIORITIES.SECONDARY });
    
    // Performance monitoring
    eventBus.on('performanceWarning', this.handlePerformanceWarning.bind(this), 'OptimizedUI');
    
    // Set up stable event delegation
    this.setupStableEventDelegation();
    
            // console.log('[OPTIMIZED_UI] Event listeners configured');
  }
  
  /**
   * Set up stable event delegation that won't be affected by DOM updates
   */
  setupStableEventDelegation() {
    // Use event delegation for assistant purchase buttons
    document.addEventListener('click', (event) => {
      if (event.target.matches('.buy-assistant-btn.affordable')) {
        event.preventDefault();
        event.stopPropagation();
        
        const assistantId = event.target.getAttribute('data-assistant-id');
        if (assistantId) {
          this.purchaseAssistant(assistantId);
        }
      }
    });
    
    // Use event delegation for main click button
    document.addEventListener('click', (event) => {
      if (event.target.matches('#click-button')) {
        event.preventDefault();
        event.stopPropagation();
        this.handleMainClick();
      }
    });
    
            // console.log('[OPTIMIZED_UI] Stable event delegation configured');
  }
  
  /**
   * Start the update cycle with priority-based processing
   */
  startUpdateCycle() {
    const updateCycle = () => {
      if (!this.isUpdating && this.updateQueue.size > 0) {
        this.processUpdates();
      }
      requestAnimationFrame(updateCycle);
    };
    
    requestAnimationFrame(updateCycle);
    
    // Slower cycle for tertiary updates (batching) - reduced frequency to prevent flashing
    setInterval(() => {
      this.queueUpdate('dashboard', PRIORITIES.TERTIARY);
    }, 3000); // 3 seconds for non-critical updates (reduced frequency)
    
    // Medium cycle for secondary updates - reduced frequency to prevent flashing
    setInterval(() => {
      this.queueUpdate('assistants', PRIORITIES.SECONDARY);
    }, 2000); // 2 seconds for assistant updates
    
            // console.log('[OPTIMIZED_UI] Update cycle started');
  }
  
  /**
   * Queue a component update with priority
   */
  queueUpdate(componentType, priority = PRIORITIES.SECONDARY) {
    if (!this.updateQueue.has(componentType)) {
      this.updateQueue.set(componentType, priority);
    } else {
      // Use highest priority if already queued
      const existingPriority = this.updateQueue.get(componentType);
      this.updateQueue.set(componentType, Math.max(existingPriority, priority));
    }
  }
  
  /**
   * Process all queued updates in priority order
   */
  processUpdates() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    const startTime = performance.now();
    
    try {
      // Sort updates by priority (highest first)
      const sortedUpdates = Array.from(this.updateQueue.entries())
        .sort((a, b) => b[1] - a[1]);
      
      this.updateQueue.clear();
      
      // Process critical updates first (immediate)
      const criticalUpdates = sortedUpdates.filter(([_, priority]) => priority === PRIORITIES.CRITICAL);
      const otherUpdates = sortedUpdates.filter(([_, priority]) => priority !== PRIORITIES.CRITICAL);
      
      // Process critical updates immediately
      for (const [componentType, priority] of criticalUpdates) {
        this.updateComponent(componentType, priority);
      }
      
      // Process other updates (can be batched)
      for (const [componentType, priority] of otherUpdates) {
        this.updateComponent(componentType, priority);
      }
      
      // Update performance metrics
      const updateTime = performance.now() - startTime;
      this.updatePerformanceMetrics(updateTime, sortedUpdates.length);
      
      // Performance warning if too slow
      if (updateTime > this.config.maxUpdateTime) {
        // console.warn(`[OPTIMIZED_UI] Slow update cycle: ${updateTime.toFixed(2)}ms`);
        this.handlePerformanceWarning(updateTime);
      }
      
    } catch (error) {
      // console.error('[OPTIMIZED_UI] Update cycle error:', error);
      this.handleUIError(error);
    } finally {
      this.isUpdating = false;
    }
  }
  
  /**
   * Update a specific component
   */
  updateComponent(componentType, priority) {
    const startTime = performance.now();
    
    try {
      switch (componentType) {
        case 'clicker':
          this.updateClickerPanel();
          break;
        case 'dashboard':
          this.updateDashboard();
          break;
        case 'assistants':
          this.updateAssistantsPanel();
          break;
        case 'banner':
          this.updateBanner();
          break;
        case 'tab-inventory':
          // Handle inventory tab updates - delegate to GameReadyUIManager if available
          if (window.gameReadyUIManager && window.gameReadyUIManager.updateInventory) {
            window.gameReadyUIManager.updateInventory();
          }
          break;
        case 'tab-dashboard':
          // Handle dashboard tab updates - delegate to GameReadyUIManager if available
          if (window.gameReadyUIManager && window.gameReadyUIManager.updateDashboard) {
            window.gameReadyUIManager.updateDashboard();
          }
          break;
        case 'tab-achievements':
          // Handle achievements tab updates - delegate to GameReadyUIManager if available
          if (window.gameReadyUIManager && window.gameReadyUIManager.updateAchievements) {
            window.gameReadyUIManager.updateAchievements();
          }
          break;
        case 'tab-lore':
          // Handle lore tab updates - delegate to GameReadyUIManager if available
          if (window.gameReadyUIManager && window.gameReadyUIManager.updateLore) {
            window.gameReadyUIManager.updateLore();
          }
          break;
        case 'all':
          // Handle all updates - delegate to GameReadyUIManager if available
          if (window.gameReadyUIManager && window.gameReadyUIManager.update) {
            window.gameReadyUIManager.update('all');
          }
          break;
        case 'miniWallet':
          // Handle mini wallet updates - delegate to GameReadyUIManager if available
          if (window.gameReadyUIManager && window.gameReadyUIManager.updateMiniWallet) {
            window.gameReadyUIManager.updateMiniWallet();
          }
          break;
        default:
          // console.warn(`[OPTIMIZED_UI] Unknown component type: ${componentType}`);
      }
      
      // Track component performance
      if (!this.performanceMetrics.componentCounts[componentType]) {
        this.performanceMetrics.componentCounts[componentType] = 0;
      }
      this.performanceMetrics.componentCounts[componentType]++;
      
      // Track priority counts
      switch (priority) {
        case PRIORITIES.CRITICAL:
          this.performanceMetrics.criticalUpdates++;
          break;
        case PRIORITIES.SECONDARY:
          this.performanceMetrics.secondaryUpdates++;
          break;
        case PRIORITIES.TERTIARY:
          this.performanceMetrics.tertiaryUpdates++;
          break;
      }
      
    } catch (error) {
      // console.error(`[OPTIMIZED_UI] Error updating ${componentType}:`, error);
      this.handleUIError(error);
    }
    
    const updateTime = performance.now() - startTime;
    if (updateTime > 5) {
      // console.warn(`[OPTIMIZED_UI] Slow component update: ${componentType} took ${updateTime.toFixed(2)}ms`);
    }
  }
  
  /**
   * Initialize basic testing UI
   */
  initializeTestingUI() {
    // Create basic testing displays
    this.createTestingDisplays();
    
    // Trigger initial updates for all components
    this.queueUpdate('clicker', PRIORITIES.CRITICAL);
    this.queueUpdate('dashboard', PRIORITIES.CRITICAL);
    this.queueUpdate('assistants', PRIORITIES.CRITICAL);
    
    // console.log('[OPTIMIZED_UI] Testing UI initialized');
  }
  
  /**
   * Create basic testing displays
   */
  createTestingDisplays() {
    // Clicker panel - basic snowball display and click button
    const clickerContainer = this.containers.clicker;
    clickerContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h2>Clicker Panel</h2>
        <div id="snowball-display" style="font-size: 24px; font-weight: bold; margin: 10px 0;">
          Snowballs: <span id="snowball-count">0</span>
        </div>
        <div id="sps-display" style="font-size: 18px; margin: 10px 0;">
          SPS: <span id="sps-count">0</span>
        </div>
        <button id="click-button" style="
          font-size: 20px; 
          padding: 20px 40px; 
          background-color: #4CAF50; 
          color: white; 
          border: none; 
          border-radius: 8px; 
          cursor: pointer;
          margin: 10px;
        ">CLICK!</button>
      </div>
    `;
    
    // Dashboard panel - basic performance data
    const dashboardContainer = this.containers.dashboard;
    dashboardContainer.innerHTML = `
      <div>
        <h2>Dashboard</h2>
        <div id="wallet-display" style="margin: 10px 0;">
          <strong>Wallet:</strong> <span id="wallet-amount">0</span> snowballs
        </div>
        <div id="total-sps-display" style="margin: 10px 0;">
          <strong>Total SPS:</strong> <span id="total-sps">0</span>
        </div>
        <div id="assistant-counts" style="margin: 10px 0;">
          <strong>Assistants:</strong> <span id="assistant-total">0</span>
        </div>
        <div id="dashboard-info">
          <!-- Enhanced dashboard information will be populated here -->
        </div>
      </div>
    `;
    
    // Assistants panel - basic assistant list
    const assistantsContainer = this.containers.assistants;
    assistantsContainer.innerHTML = `
      <div>
        <h2>Assistants & Upgrades</h2>
        <div id="assistants-list">
          <!-- Assistants will be populated here -->
        </div>
      </div>
    `;
    
    // Set up click handler for the main click button
    const clickButton = document.getElementById('click-button');
    if (clickButton) {
      clickButton.addEventListener('click', () => {
        this.handleMainClick();
      });
    }
  }
  
  /**
   * Handle main click button
   */
  handleMainClick() {
    try {
      // Trigger the main click event
      if (this.game && this.game.addSnowballs) {
        // Calculate click power (base SPC)
        const basePower = this.game.spc || 1;
        
        // Add snowballs from click
        this.game.addSnowballs(basePower, 'click');
        
        // Record click if available
        if (this.game.recordClick) {
          this.game.recordClick(basePower);
        }
        
        // Emit click event if event bus is available
        if (window.eventBus) {
          window.eventBus.emit('snowballClicked', {
            amount: basePower,
            basePower: basePower,
            source: 'click',
            totalSnowballs: this.game.snowballs
          });
        }
        
        // Record click for achievements if available
        if (window.recordClick) {
          window.recordClick(this.game);
        }
      } else {
        // Fallback to console logging
        // console.log('[OPTIMIZED_UI] Main click triggered (no game.addSnowballs available)');
      }
      
      // Queue immediate update for critical feedback
      this.queueUpdate('clicker', PRIORITIES.CRITICAL);
      this.queueUpdate('dashboard', PRIORITIES.CRITICAL);
      
    } catch (error) {
      // console.error('[OPTIMIZED_UI] Click handler error:', error);
      this.handleUIError(error);
    }
  }
  
  /**
   * Update clicker panel
   */
  updateClickerPanel() {
    try {
      const snowballCount = document.getElementById('snowball-count');
      const spsCount = document.getElementById('sps-count');
      
      if (snowballCount && this.game) {
        snowballCount.textContent = this.formatNumber(this.game.snowballs || 0);
      }
      
      if (spsCount && this.game) {
        spsCount.textContent = this.formatNumber(this.game.sps || 0);
      }
      
    } catch (error) {
      // console.error('[OPTIMIZED_UI] Clicker panel update error:', error);
      this.handleUIError(error);
    }
  }
  
  /**
   * Update dashboard
   */
  updateDashboard() {
    try {
      const walletAmount = document.getElementById('wallet-amount');
      const totalSps = document.getElementById('total-sps');
      const assistantTotal = document.getElementById('assistant-total');
      
      if (walletAmount && this.game) {
        walletAmount.textContent = this.formatNumber(this.game.snowballs || 0);
      }
      
      if (totalSps && this.game) {
        totalSps.textContent = this.formatNumber(this.game.sps || 0);
      }
      
      if (assistantTotal && this.game && this.game.assistants) {
        const totalAssistants = Object.values(this.game.assistants)
          .reduce((sum, count) => sum + (count || 0), 0);
        assistantTotal.textContent = totalAssistants;
      }
      
      // Enhanced dashboard information
      const dashboardInfo = document.getElementById('dashboard-info');
      if (dashboardInfo && this.game) {
        const assistantData = this.getAssistantData();
        const totalAssistants = assistantData.reduce((sum, assistant) => sum + assistant.count, 0);
        const baseSPS = assistantData.reduce((sum, assistant) => sum + (assistant.count * assistant.sps), 0);
        const actualSPS = this.game.sps || 0;
        const multiplier = actualSPS > 0 && baseSPS > 0 ? (actualSPS / baseSPS).toFixed(2) : '1.00';
        
        dashboardInfo.innerHTML = `
          <div style="
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 10px 0;
          ">
            <h4 style="margin: 0 0 10px 0; text-align: center;">Game Statistics</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; text-align: center;">
              <div>
                <div style="font-size: 12px; opacity: 0.9;">Total Assistants</div>
                <div style="font-weight: bold; font-size: 16px;">${totalAssistants}</div>
              </div>
              <div>
                <div style="font-size: 12px; opacity: 0.9;">Base SPS</div>
                <div style="font-weight: bold; font-size: 16px;">${this.formatNumber(baseSPS)}/s</div>
              </div>
              <div>
                <div style="font-size: 12px; opacity: 0.9;">Total SPS</div>
                <div style="font-weight: bold; font-size: 16px;">${this.formatNumber(actualSPS)}/s</div>
              </div>
              <div>
                <div style="font-size: 12px; opacity: 0.9;">Multiplier</div>
                <div style="font-weight: bold; font-size: 16px;">×${multiplier}</div>
              </div>
            </div>
          </div>
        `;
      }
      
    } catch (error) {
      // console.error('[OPTIMIZED_UI] Dashboard update error:', error);
      this.handleUIError(error);
    }
  }
  
  /**
   * Update assistants panel
   */
  updateAssistantsPanel() {
    try {
      const assistantsList = document.getElementById('assistants-list');
      if (!assistantsList || !this.game || !this.game.assistants) return;
      
      let html = '';
      
      // Get assistant data
      const assistantData = this.getAssistantData();
      
      // Add header with summary
      const totalAssistants = assistantData.reduce((sum, assistant) => sum + assistant.count, 0);
      const totalSPS = assistantData.reduce((sum, assistant) => sum + (assistant.count * assistant.sps), 0);
      
      html += `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          text-align: center;
        ">
          <h3 style="margin: 0 0 10px 0;">Assistants Overview</h3>
          <div style="display: flex; justify-content: space-around;">
            <div>
              <strong>Total Owned</strong><br>
              ${totalAssistants}
            </div>
            <div>
              <strong>Base SPS</strong><br>
              ${this.formatNumber(totalSPS)}/s
            </div>
            <div>
              <strong>Available</strong><br>
              ${this.formatNumber(this.game.snowballs || 0)}
            </div>
          </div>
        </div>
      `;
      
      assistantData.forEach(assistant => {
        const canAfford = (this.game.snowballs || 0) >= assistant.cost;
        const currentSPS = assistant.count * assistant.sps;
        const nextSPS = (assistant.count + 1) * assistant.sps;
        const spsGain = nextSPS - currentSPS;
        
        // Calculate efficiency (SPS per snowball spent)
        const efficiency = assistant.cost > 0 ? (spsGain / assistant.cost) : 0;
        
        // Color coding based on efficiency
        let efficiencyColor = '#666';
        if (efficiency > 0.1) efficiencyColor = '#4CAF50';
        else if (efficiency > 0.01) efficiencyColor = '#FF9800';
        else if (efficiency > 0.001) efficiencyColor = '#2196F3';
        
        const buttonStyle = canAfford ? 
          'background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);' : 
          'background: #ccc; color: #666; cursor: not-allowed;';
        
        html += `
          <div style="
            border: 1px solid #e0e0e0; 
            padding: 15px; 
            margin: 8px 0; 
            border-radius: 8px;
            background: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          " class="assistant-item" data-assistant-id="${assistant.id}">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
              <div>
                <div style="font-weight: bold; font-size: 16px; color: #333;">${assistant.name}</div>
                <div style="color: #666; font-size: 12px; margin-top: 2px;">${assistant.description}</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 14px; color: #333;">
                  <strong>Owned: ${assistant.count}</strong>
                </div>
                <div style="font-size: 12px; color: #666;">
                  Base: ${this.formatNumber(assistant.sps)}/s each
                </div>
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
              <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
                <div style="font-size: 12px; color: #666;">Current SPS</div>
                <div style="font-weight: bold; color: #333;">${this.formatNumber(currentSPS)}/s</div>
              </div>
              <div style="background: #f8f9fa; padding: 8px; border-radius: 4px;">
                <div style="font-size: 12px; color: #666;">Next Purchase</div>
                <div style="font-weight: bold; color: #333;">+${this.formatNumber(spsGain)}/s</div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="flex: 1;">
                <div style="font-size: 12px; color: #666;">Cost</div>
                <div style="font-weight: bold; color: #333;">${this.formatNumber(assistant.cost)} snowballs</div>
                <div style="font-size: 11px; color: ${efficiencyColor};">
                  Efficiency: ${(efficiency * 1000).toFixed(1)} SPS/k snowball
                </div>
              </div>
              <button 
                class="buy-assistant-btn ${canAfford ? 'affordable' : 'unaffordable'}"
                data-assistant-id="${assistant.id}"
                style="
                  ${buttonStyle}
                  border: none; 
                  padding: 10px 20px; 
                  border-radius: 6px; 
                  font-weight: bold;
                  font-size: 14px;
                  min-width: 120px;
                  position: relative;
                  z-index: 10;
                "
                ${!canAfford ? 'disabled' : ''}
              >
                ${canAfford ? `Buy ${assistant.name}` : 'Cannot Afford'}
              </button>
            </div>
          </div>
        `;
      });
      
      assistantsList.innerHTML = html;
      
    } catch (error) {
      // console.error('[OPTIMIZED_UI] Assistants panel update error:', error);
      this.handleUIError(error);
    }
  }
  
  /**
   * Update banner
   */
  updateBanner() {
    // Banner updates for notifications will be implemented later
    // For now, just keep the basic banner
  }
  
  /**
   * Get assistant data for display
   */
  getAssistantData() {
    if (!this.game || !this.game.assistants) return [];
    
    // Import assistant data
    const ASSISTANTS = [
      { id: 'additionalArm', name: 'Additional Arm', cost: 5, costRate: 1.07, sps: 1, description: 'An extra limb just for throwing snowballs!' },
      { id: 'neighborKids', name: 'Neighbor Kids', cost: 20, costRate: 1.08, sps: 2, description: 'The local kids lend a hand, and an arm!' },
      { id: 'ballMachine', name: 'Ball Machine', cost: 50, costRate: 1.09, sps: 5, description: 'Like a baseball machine, but snowier.' },
      { id: 'polarBearFamily', name: 'Polar Bear Family', cost: 120, costRate: 1.1, sps: 12, description: 'Surprisingly cooperative and very fluffy.' },
      { id: 'snowBlower', name: 'Snow Blower', cost: 600, costRate: 1.115, sps: 60, description: 'Loud, fast, and relentless.' },
      { id: 'hockeyTeam', name: 'Hockey Team', cost: 3000, costRate: 1.12, sps: 300, description: 'Slapshot after slapshot!' },
      { id: 'iglooArsenal', name: 'Igloo Arsenal', cost: 15000, costRate: 1.13, sps: 1500, description: 'Defended by walls of frozen ammo.' },
      { id: 'golfingRange', name: 'Golfing Range', cost: 80000, costRate: 1.14, sps: 8000, description: 'FORE!! Be careful of the slice.' },
      { id: 'snowstorm', name: 'Snowstorm', cost: 400000, costRate: 1.145, sps: 40000, description: 'Nature joins the fight.' },
      { id: 'snowPrincess', name: 'Snow Princess', cost: 2000000, costRate: 1.15, sps: 200000, description: 'A regal force of frozen magic.' },
      { id: 'winterFortress', name: 'Winter Fortress', cost: 10000000, costRate: 1.155, sps: 1000000, description: 'Towers, turrets, and terror.' },
      { id: 'wizardBlizzard', name: 'Wizard Blizzard', cost: 50000000, costRate: 1.16, sps: 5000000, description: 'Spells with serious snow output.' },
      { id: 'avalanche', name: 'Avalanche', cost: 250000000, costRate: 1.165, sps: 25000000, description: 'Nothing stands in its way.' },
      { id: 'snowHurricane', name: 'Snow Hurricane', cost: 1250000000, costRate: 1.17, sps: 125000000, description: 'Spins and slings snowballs nonstop.' },
      { id: 'iceDragon', name: 'Ice Dragon', cost: 6250000000, costRate: 1.175, sps: 625000000, description: 'Ancient, mighty, and very cold.' },
      { id: 'frostGiant', name: 'Frost Giant', cost: 30000000000, costRate: 1.18, sps: 3000000000, description: 'Every step crushes snow into ammo.' },
      { id: 'orbitalSnowCannon', name: 'Orbital Snow Cannon', cost: 150000000000, costRate: 1.185, sps: 15000000000, description: 'Space snow superiority.' },
      { id: 'templeofWinter', name: 'Temple of Winter', cost: 800000000000, costRate: 1.19, sps: 80000000000, description: 'Spiritual snowball power.' },
      { id: 'cryoCore', name: 'Cryo Core', cost: 4000000000000, costRate: 1.195, sps: 400000000000, description: 'A cold engine of destruction.' },
      { id: 'snowSingularity', name: 'Snow Singularity', cost: 20000000000000, costRate: 1.2, sps: 2000000000000, description: 'Pulls snow from the Universe' }
    ];
    
    const assistants = [];
    
    ASSISTANTS.forEach(assistantDef => {
      const count = this.game.assistants[assistantDef.id] || 0;
      const currentCost = assistantDef.cost * Math.pow(assistantDef.costRate, count);
      
      assistants.push({
        id: assistantDef.id,
        name: assistantDef.name,
        count: count,
        cost: currentCost,
        description: assistantDef.description,
        sps: assistantDef.sps
      });
    });
    
    return assistants;
  }
  
  /**
   * Purchase assistant
   */
  purchaseAssistant(assistantId) {
    try {
      if (this.game && this.game.assistants) {
        // Get assistant data
        const assistantData = this.getAssistantData();
        const assistant = assistantData.find(a => a.id === assistantId);
        
        if (assistant && this.game.snowballs >= assistant.cost) {
          // Deduct cost
          this.game.snowballs -= assistant.cost;
          
          // Increment assistant count
          if (!this.game.assistants[assistantId]) {
            this.game.assistants[assistantId] = 0;
          }
          this.game.assistants[assistantId]++;
          
          // Save game
          if (this.game.save) {
            this.game.save();
          }
          
          // Recalculate SPS if available
          if (window.calculateSPSWithBoosts) {
            window.calculateSPSWithBoosts(this.game);
          }
          
          // Emit assistant purchased event
          if (window.eventBus) {
            window.eventBus.emit('assistantPurchased', {
              assistantId: assistantId,
              count: this.game.assistants[assistantId],
              cost: assistant.cost
            });
          }
          
          // console.log(`[OPTIMIZED_UI] Successfully purchased ${assistantId}`);
        } else {
          // console.log(`[OPTIMIZED_UI] Cannot purchase ${assistantId}: insufficient funds or assistant not found`);
        }
      } else {
        // console.log(`[OPTIMIZED_UI] Purchase assistant: ${assistantId} (no game.assistants available)`);
      }
      
      // Queue immediate updates
      this.queueUpdate('assistants', PRIORITIES.CRITICAL);
      this.queueUpdate('dashboard', PRIORITIES.CRITICAL);
      
    } catch (error) {
      // console.error('[OPTIMIZED_UI] Purchase error:', error);
      this.handleUIError(error);
    }
  }
  
  /**
   * Event handlers
   */
  handleSnowballsChanged(data) {
    this.queueUpdate('clicker', PRIORITIES.CRITICAL);
    this.queueUpdate('dashboard', PRIORITIES.CRITICAL);
  }
  
  handleAssistantPurchased(data) {
    this.queueUpdate('assistants', PRIORITIES.CRITICAL);
    this.queueUpdate('dashboard', PRIORITIES.CRITICAL);
  }
  
  handleBoostPurchased(data) {
    this.queueUpdate('assistants', PRIORITIES.CRITICAL);
    this.queueUpdate('dashboard', PRIORITIES.CRITICAL);
  }
  
  handleSPSChanged(data) {
    this.queueUpdate('clicker', PRIORITIES.SECONDARY);
    this.queueUpdate('dashboard', PRIORITIES.SECONDARY);
  }
  
  handleAchievementUnlocked(data) {
    this.queueUpdate('banner', PRIORITIES.TERTIARY);
    // Also update achievements tab if it's currently active
    if (this.game && this.game.uiManager && this.game.uiManager.activeTab === 'achievements') {
      this.game.uiManager.updateAchievements();
    }
  }
  
  handleLoreDiscovered(data) {
    this.queueUpdate('banner', PRIORITIES.TERTIARY);
  }

  handleGameStateChanged(data) {
    // Update achievements if the achievements tab is active
    if (this.game && this.game.uiManager && this.game.uiManager.activeTab === 'achievements') {
      this.game.uiManager.updateAchievements();
    }
  }
  
  handlePerformanceWarning(data) {
    // console.warn('[OPTIMIZED_UI] Performance warning:', data);
  }
  
  /**
   * Error handling with safety checks
   */
  handleUIError(error) {
    this.performanceMetrics.errors++;
    // console.error('[OPTIMIZED_UI] UI Error:', error);
    
    // Game mechanics continue even if UI fails
    // Log to console for debugging
    // console.log('[OPTIMIZED_UI] Game mechanics continue normally despite UI error');
  }
  
  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(updateTime, updateCount) {
    this.performanceMetrics.totalUpdates++;
    this.performanceMetrics.totalUpdateTime += updateTime;
    this.performanceMetrics.averageUpdateTime = this.performanceMetrics.totalUpdateTime / this.performanceMetrics.totalUpdates;
    this.performanceMetrics.lastUpdateTime = updateTime;
  }
  
  /**
   * Format numbers for display
   */
  formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return Math.floor(num).toString();
  }
  
  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }
  
  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled) {
    this.config.debugMode = enabled;
    // console.log(`[OPTIMIZED_UI] Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Force update all components
   */
  forceUpdateAll() {
    Object.keys(COMPONENT_TYPES).forEach(componentType => {
      this.queueUpdate(COMPONENT_TYPES[componentType], PRIORITIES.CRITICAL);
    });
  }
}

// Export for use in other modules
export default OptimizedUIManager; 