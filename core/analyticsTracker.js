/**
 * core/analyticsTracker.js - Clean Analytics and Engagement Tracking
 * 
 * This module provides analytics tracking separate from achievements.
 * It focuses on:
 * - Momentum tracking for hybrid systems
 * - Travel button unlock progression
 * - Player engagement metrics
 * - Session analytics
 * - Performance monitoring
 * 
 * This replaces the overlapping parts of progressTracker while keeping
 * achievements in their own dedicated system.
 */

export class AnalyticsTracker {
  constructor(gameState, eventBus) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.debugMode = true; // Enable debug mode by default for testing
    
    // Configuration for momentum system
    this.config = {
      // Travel button unlock time in seconds (at maximum momentum)
      travelUnlockTimeSeconds: 120, // 10 minutes for production, 60 for testing
      // Momentum decay rate per second
      momentumDecayRate: 0.1,
      // Momentum window size in milliseconds
      momentumWindowSize: 10000, // 10 seconds
      // Maximum momentum value
      maxMomentum: 10
    };
    
    // Timer management for analytics
    this.timerIds = {
      momentumTimer: null,
      engagementTimer: null,
      saveTimer: null,
      trendsTimer: null
    };
    
    // ===============================
    // MOMENTUM TRACKING
    // ===============================
    // Core system for hybrid unlocks and travel progression
    
    this.momentum = {
      current: 0, // 0-10 scale
      history: [], // Last 100 momentum readings
      lastUpdate: Date.now(),
      actionWeights: {
        click: 1.0,
        assistantPurchased: 2.0,
        boostPurchased: 2.5,
        yetiSpotted: 3.0,
        locationUnlocked: 4.0,
        abilityUsed: 2.0,
        icicleHarvested: 1.5,
        globalUpgradePurchased: 3.0
      },
      decayRate: this.config.momentumDecayRate,
      maxMomentum: this.config.maxMomentum,
      windowSize: this.config.momentumWindowSize,
      
      // Travel button progression tracking
      travelButton: {
        progress: 0, // Current progress toward unlocking travel
        maxProgress: this.config.travelUnlockTimeSeconds, // Configurable unlock time
        unlocked: false, // Once unlocked, stays unlocked
        progressHistory: [], // Track progress over time
        momentumSamples: [], // Store momentum samples for averaging
        sampleInterval: 1000, // Sample every second
        lastProgressUpdate: Date.now()
      }
    };
    
    // ===============================
    // ENGAGEMENT ANALYTICS
    // ===============================
    // Track player engagement patterns
    
    this.engagement = {
      overall: {
        totalPlayTime: 0,
        sessionCount: 0,
        averageSessionLength: 0,
        longestSession: 0,
        shortestSession: Infinity,
        lastPlayTime: Date.now(),
        playPattern: 'casual', // casual, regular, intense
        engagementScore: 0.5,
        retentionScore: 0.5
      },
      preferences: {
        preferredSystem: 'balanced', // active, passive, hybrid, balanced
        systemUsageDistribution: { active: 0.33, passive: 0.33, hybrid: 0.34 },
        complexityPreference: 0.5, // 0=simple, 1=complex
        pacePreference: 0.5, // 0=slow, 1=fast
        goalOrientation: 0.5 // 0=exploration, 1=optimization
      }
    };
    
    // ===============================
    // SESSION TRACKING
    // ===============================
    // Real-time session metrics
    
    this.session = {
      startTime: Date.now(),
      systemUsage: { active: 0, passive: 0, hybrid: 0 },
      actionsPerformed: [],
      engagementLevel: 0.5,
      focusLevel: 0.5,
      recentActivity: []
    };
    
    // ===============================
    // TRENDS & ANALYTICS
    // ===============================
    // Long-term pattern analysis
    
    this.trends = {
      daily: {},
      weekly: {},
      monthly: {}
    };
    
    this.setupEventListeners();
    this.initializeTracking();
    this.startPeriodicUpdates();
    
    // console.log('[ANALYTICS_TRACKER] Analytics tracking initialized');
  }
  
  /**
   * Set up event listeners for tracking
   */
  setupEventListeners() {
    if (!window.eventBus) {
      // console.warn('[ANALYTICS_TRACKER] No eventBus available for event listeners');
      return;
    }
    
    // console.log('[ANALYTICS_TRACKER] Setting up event listeners...');
    
    // Track actions for momentum
    this.eventBus.on('snowballClicked', (data) => {
      this.recordAction('click', data);
    }, 'analytics');
    
    // Assistant purchased
    this.eventBus.on('assistantPurchased', (data) => {
      // console.log('[ANALYTICS_TRACKER] Assistant purchased event received:', data);
      this.recordAction('assistantPurchase', data);
    }, 'analytics');

    // Boost purchased
    this.eventBus.on('boostPurchased', (data) => {
      // console.log('[ANALYTICS_TRACKER] Boost purchased event received:', data);
      this.recordAction('boostPurchase', data);
    }, 'analytics');
    
    this.eventBus.on('yetiSpotted', (data) => {
      this.recordAction('yetiSpotted', data);
    }, 'analytics');
    
    this.eventBus.on('locationUnlocked', (data) => {
      this.recordAction('locationUnlocked', data);
    }, 'analytics');
    
    this.eventBus.on('abilityUsed', (data) => {
      this.recordAction('abilityUsed', data);
    }, 'analytics');
    
    this.eventBus.on('icicleHarvested', (data) => {
      this.recordAction('icicleHarvested', data);
    }, 'analytics');
    
    // Global upgrade purchased
    this.eventBus.on('globalUpgradePurchased', (data) => {
      // console.log('[ANALYTICS_TRACKER] Global upgrade purchased event received:', data);
      this.recordAction('globalUpgradePurchase', data);
    }, 'analytics');

    // Upgrade purchased
    this.eventBus.on('upgradePurchased', (data) => {
      // console.log('[ANALYTICS_TRACKER] Upgrade purchased event received:', data);
      // Map upgrade types to momentum action types
      let actionType = 'upgradePurchased'; // default
      if (data.type === 'global') {
        actionType = 'globalUpgradePurchased';
      } else if (data.type === 'boost') {
        actionType = 'boostPurchased';
      } else if (data.type === 'persistent') {
        actionType = 'globalUpgradePurchased'; // Treat persistent upgrades as global
      }
      this.recordAction(actionType, data);
    }, 'analytics');
    
    // console.log('[ANALYTICS_TRACKER] Event listeners set up successfully');
  }
  
  /**
   * Initialize tracking systems
   */
  initializeTracking() {
    // Load any saved analytics data
    this.loadAnalyticsData();
    
    // Initialize momentum tracking
    this.momentum.lastUpdate = Date.now();
    this.momentum.travelButton.lastProgressUpdate = Date.now();
  }
  
  /**
   * Record an action for momentum and engagement tracking
   */
  recordAction(actionType, data = {}) {
    const now = Date.now();
    
    // Add to recent activity
    this.session.recentActivity.push({
      type: actionType,
      time: now,
      data: data
    });
    
    // Keep only last 100 actions
    if (this.session.recentActivity.length > 100) {
      this.session.recentActivity.shift();
    }
    
    // Track system usage
    if (actionType === 'click') {
      this.session.systemUsage.active++;
    } else if (['assistantPurchased', 'boostPurchased', 'icicleHarvested'].includes(actionType)) {
      this.session.systemUsage.passive++;
    } else if (['yetiSpotted', 'locationUnlocked', 'abilityUsed'].includes(actionType)) {
      this.session.systemUsage.hybrid++;
    }
    
    // Always log in debug mode, and also log assistant/upgrade purchases for debugging
    if (this.debugMode || ['assistantPurchased', 'boostPurchased', 'globalUpgradePurchased'].includes(actionType)) {
      // console.log(`[ANALYTICS_TRACKER] Action recorded: ${actionType}`, data);
    }
  }
  
  /**
   * Update momentum based on recent activity
   */
  updateMomentum() {
    // DISABLED: This function is replaced by the simple activity counter system
    // The simple system directly manages momentum without complex calculations
    return;
    
    // OLD CODE BELOW - DISABLED
    /*
    const now = Date.now();
    
    // Calculate momentum based on recent actions
    const recentActions = this.getRecentActions(this.momentum.windowSize);
    let momentumScore = 0;
    
    // Calculate weighted score based on action types
    recentActions.forEach(action => {
      const weight = this.momentum.actionWeights[action.type] || 1.0;
      const timeFactor = this.getTimeFactor(action.time, now, this.momentum.windowSize);
      momentumScore += weight * timeFactor;
    });
    
    // Apply decay since last update
    const timeSinceUpdate = (now - this.momentum.lastUpdate) / 1000; // seconds
    const decayFactor = Math.pow(0.9, timeSinceUpdate * this.momentum.decayRate);
    momentumScore *= decayFactor;
    
    // Normalize to 0-10 scale
    this.momentum.current = Math.min(this.momentum.maxMomentum, Math.max(0, momentumScore));
    
    // Update history
    this.momentum.history.push({
      time: now,
      score: this.momentum.current,
      actionCount: recentActions.length
    });
    
    // Keep only last 100 readings
    if (this.momentum.history.length > 100) {
      this.momentum.history.shift();
    }
    
    this.momentum.lastUpdate = now;
    
    // Emit momentum change event for hybrid systems
    this.eventBus.emit('momentumChanged', {
      momentum: this.momentum.current,
      trend: this.getMomentumTrend(),
      actionCount: recentActions.length
    });
    
    if (this.debugMode) {
      // console.log('[ANALYTICS_TRACKER] Momentum updated:', this.momentum.current.toFixed(1));
    }
    */
  }
  
  /**
   * Update travel button progress
   */
  updateTravelButtonProgress() {
    // DISABLED: This function is replaced by the simple activity counter system
    // The simple system directly manages travel button progress
    return;
    
    // OLD CODE BELOW - DISABLED
    /*
    const travelButton = this.momentum.travelButton;
    const now = Date.now();
    
    // Skip if already unlocked
    if (travelButton.unlocked) {
      return;
    }
    
    // Calculate time since last update
    const timeSinceLastUpdate = now - travelButton.lastProgressUpdate;
    const secondsElapsed = timeSinceLastUpdate / 1000;
    
    // Calculate progress increment based on current momentum
    const currentMomentum = this.momentum.current;
    const progressIncrement = (currentMomentum * secondsElapsed) / travelButton.maxProgress;
    
    // Add progress (but don't exceed 1.0)
    const oldProgress = travelButton.progress;
    travelButton.progress = Math.min(1.0, travelButton.progress + progressIncrement);
    
    // Check if travel button should be unlocked
    if (travelButton.progress >= 1.0 && !travelButton.unlocked) {
      travelButton.unlocked = true;
      
      // Emit event for travel button unlock
      this.eventBus.emit('travelButtonUnlocked', {
        totalTime: now - this.session.startTime,
        averageMomentum: this.getAverageMomentum()
      });
      
      if (this.debugMode) {
        // console.log('[ANALYTICS_TRACKER] Travel button unlocked!');
      }
    }
    
    // Update progress history
    travelButton.progressHistory.push({
      time: now,
      progress: travelButton.progress,
      momentum: currentMomentum,
      progressIncrement: progressIncrement
    });
    
    // Keep only last 100 samples
    if (travelButton.progressHistory.length > 100) {
      travelButton.progressHistory.shift();
    }
    
    // Update momentum samples
    travelButton.momentumSamples.push(currentMomentum);
    
    // Keep only last 100 samples
    if (travelButton.momentumSamples.length > 100) {
      travelButton.momentumSamples.shift();
    }
    
    // Update last progress update time
    travelButton.lastProgressUpdate = now;
    */
  }
  
  /**
   * Get recent actions within the specified time window
   */
  getRecentActions(windowSize) {
    const now = Date.now();
    const cutoffTime = now - windowSize;
    
    return this.session.recentActivity.filter(action => action.time >= cutoffTime);
  }
  
  /**
   * Calculate time factor for momentum (newer actions have more weight)
   */
  getTimeFactor(actionTime, currentTime, windowSize) {
    const age = currentTime - actionTime;
    const normalizedAge = age / windowSize; // 0 to 1
    return Math.max(0, 1 - normalizedAge); // Linear decay
  }
  
  /**
   * Get momentum trend (increasing, decreasing, stable)
   */
  getMomentumTrend() {
    if (this.momentum.history.length < 5) return 'stable';
    
    const recent = this.momentum.history.slice(-5);
    const first = recent[0].score;
    const last = recent[recent.length - 1].score;
    const diff = last - first;
    
    if (diff > 0.5) return 'increasing';
    if (diff < -0.5) return 'decreasing';
    return 'stable';
  }
  
  /**
   * Get average momentum over time
   */
  getAverageMomentum() {
    const samples = this.momentum.travelButton.momentumSamples;
    if (samples.length === 0) return 0;
    
    const sum = samples.reduce((total, sample) => total + sample, 0);
    return sum / samples.length;
  }
  
  /**
   * Start periodic tracking updates using TimerManager
   */
  startPeriodicUpdates() {
    // Access global timerManager
    const timerManager = window.timerManager;
    if (!timerManager) {
      // console.warn('[ANALYTICS_TRACKER] TimerManager not available, falling back to setInterval');
      this.startPeriodicUpdatesLegacy();
      return;
    }
    
    // DISABLED: Momentum and travel button updates replaced by simple activity counter
    // this.timerIds.momentumTimer = timerManager.setInterval(() => {
    //   this.updateMomentum();
    //   this.updateTravelButtonProgress();
    // }, 1000, 'analytics-momentum');
    
    // Update engagement metrics every 10 seconds
    this.timerIds.engagementTimer = timerManager.setInterval(() => {
      this.updateEngagementMetrics();
    }, 10000, 'analytics-engagement');
    
    // Save analytics data every minute
    this.timerIds.saveTimer = timerManager.setInterval(() => {
      this.saveAnalyticsData();
    }, 60000, 'analytics-save');
    
    // Update trends daily
    this.timerIds.trendsTimer = timerManager.setInterval(() => {
      this.updateTrends();
    }, 24 * 60 * 60 * 1000, 'analytics-trends'); // 24 hours
    
    // console.log('[ANALYTICS_TRACKER] Started periodic updates with TimerManager');
  }
  
  /**
   * Legacy fallback for periodic updates
   */
  startPeriodicUpdatesLegacy() {
    // DISABLED: Momentum and travel button updates replaced by simple activity counter
    // setInterval(() => {
    //   this.updateMomentum();
    //   this.updateTravelButtonProgress();
    // }, 1000);
    
    // Update engagement metrics every 10 seconds
    setInterval(() => {
      this.updateEngagementMetrics();
    }, 10000);
    
    // Save analytics data every minute
    setInterval(() => {
      this.saveAnalyticsData();
    }, 60000);
    
    // Update trends daily
    setInterval(() => {
      this.updateTrends();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // console.log('[ANALYTICS_TRACKER] Started periodic updates with legacy setInterval');
  }
  
  /**
   * Update engagement metrics
   */
  updateEngagementMetrics() {
    const now = Date.now();
    const sessionLength = (now - this.session.startTime) / 1000 / 60; // minutes
    
    // Update session metrics
    this.engagement.overall.totalPlayTime += 10; // 10 seconds since last update
    
    // Calculate engagement based on activity
    const recentActions = this.getRecentActions(30000); // Last 30 seconds
    const activityLevel = Math.min(1, recentActions.length / 10); // Normalize to 0-1
    
    this.session.engagementLevel = activityLevel;
    this.engagement.overall.engagementScore = (this.engagement.overall.engagementScore * 0.9) + (activityLevel * 0.1);
  }
  
  /**
   * Update trends (daily, weekly, monthly)
   */
  updateTrends() {
    const now = new Date();
    const today = now.toDateString();
    
    // Daily trends
    if (!this.trends.daily[today]) {
      this.trends.daily[today] = {
        playTime: 0,
        actions: 0,
        averageMomentum: 0,
        systemUsage: { active: 0, passive: 0, hybrid: 0 }
      };
    }
    
    const dailyTrend = this.trends.daily[today];
    dailyTrend.playTime = this.engagement.overall.totalPlayTime;
    dailyTrend.actions = this.session.recentActivity.length;
    dailyTrend.averageMomentum = this.getAverageMomentum();
    dailyTrend.systemUsage = { ...this.session.systemUsage };
    
    // Clean up old trends (keep only last 30 days)
    const dailyKeys = Object.keys(this.trends.daily);
    if (dailyKeys.length > 30) {
      dailyKeys.slice(0, -30).forEach(key => {
        delete this.trends.daily[key];
      });
    }
  }
  
  /**
   * Get current momentum score
   */
  getMomentumScore() {
    return this.momentum.current;
  }
  
  /**
   * Get travel button status
   */
  getTravelButtonStatus() {
    const travelButton = this.momentum.travelButton;
    
    return {
      progress: travelButton.progress,
      progressPercentage: (travelButton.progress * 100).toFixed(1),
      unlocked: travelButton.unlocked,
      currentMomentum: this.momentum.current,
      averageMomentum: this.getAverageMomentum(),
      estimatedTimeToUnlock: this.getEstimatedTimeToUnlock(),
      progressHistory: travelButton.progressHistory.slice(-10) // Last 10 readings
    };
  }
  
  /**
   * Get estimated time to unlock travel button
   */
  getEstimatedTimeToUnlock() {
    const travelButton = this.momentum.travelButton;
    
    if (travelButton.unlocked) {
      return 0;
    }
    
    const currentMomentum = this.momentum.current;
    if (currentMomentum <= 0) {
      return Infinity;
    }
    
    const remainingProgress = 1.0 - travelButton.progress;
    const secondsRemaining = (remainingProgress * travelButton.maxProgress) / currentMomentum;
    
    return Math.ceil(secondsRemaining);
  }
  
  /**
   * Get analytics summary
   */
  getAnalyticsSummary() {
    return {
      momentum: {
        current: this.momentum.current,
        trend: this.getMomentumTrend(),
        average: this.getAverageMomentum()
      },
      travelButton: this.getTravelButtonStatus(),
      engagement: {
        score: this.engagement.overall.engagementScore,
        totalPlayTime: this.engagement.overall.totalPlayTime,
        sessionLength: (Date.now() - this.session.startTime) / 1000 / 60, // minutes
        activityLevel: this.session.engagementLevel
      },
      systemUsage: this.session.systemUsage
    };
  }
  
  /**
   * Load analytics data from game state
   */
  loadAnalyticsData() {
    if (this.gameState.analyticsData) {
      const data = this.gameState.analyticsData;
      
      // Load momentum data
      if (data.momentum) {
        Object.assign(this.momentum, data.momentum);
      }
      
      // Load engagement data
      if (data.engagement) {
        Object.assign(this.engagement, data.engagement);
      }
      
      // Load trends
      if (data.trends) {
        Object.assign(this.trends, data.trends);
      }
    }
  }
  
  /**
   * Save analytics data to game state
   */
  saveAnalyticsData() {
    this.gameState.analyticsData = {
      momentum: this.momentum,
      engagement: this.engagement,
      session: this.session,
      trends: this.trends,
      lastUpdate: Date.now()
    };
    
    // Save to localStorage through game state
    this.gameState.save();
    
    if (this.debugMode) {
      // console.log('[ANALYTICS_TRACKER] Analytics data saved');
    }
  }
  
  /**
   * Cleanup analytics timers
   */
  cleanup() {
    const timerManager = window.timerManager;
    if (!timerManager) return 0;
    
    // console.log('[ANALYTICS_TRACKER] Cleaning up timers...');
    let cleanedCount = 0;
    
    Object.entries(this.timerIds).forEach(([name, timerId]) => {
      if (timerId && timerManager.clearTimer(timerId)) {
        cleanedCount++;
        this.timerIds[name] = null;
      }
    });
    
    // Clean up timers
    if (this.timerManager) {
      this.timerManager.clearTimersByTag('analyticsTracker');
      // console.log(`[ANALYTICS_TRACKER] Cleaned up ${cleanedCount} timers`);
    }
    return cleanedCount;
  }

  /**
   * Reset analytics data (for testing)
   */
  resetAnalytics() {
    this.momentum.current = 0;
    this.momentum.history = [];
    this.momentum.travelButton.progress = 0;
    this.momentum.travelButton.unlocked = false;
    
    this.session.recentActivity = [];
    this.session.systemUsage = { active: 0, passive: 0, hybrid: 0 };
    
    this.engagement.overall.engagementScore = 0.5;
    
    // console.log('[ANALYTICS_TRACKER] Analytics reset');
  }

  /**
   * Set travel unlock time for testing/production
   * @param {number} seconds - Time in seconds to unlock at max momentum
   */
  setTravelUnlockTime(seconds) {
    this.momentum.travelUnlockTime = seconds;
    // console.log(`[ANALYTICS_TRACKER] Travel unlock time set to ${seconds} seconds (${seconds/60} minutes)`);
  }

  /**
   * Enable debug mode for momentum tracking
   */
  enableDebugMode() {
    this.debugMode = true;
    // console.log('[ANALYTICS_TRACKER] Debug mode enabled');
  }

  /**
   * Disable debug mode
   */
  disableDebugMode() {
    this.debugMode = false;
    // console.log('[ANALYTICS_TRACKER] Debug mode disabled');
  }
} 