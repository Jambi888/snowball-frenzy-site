/**
 * Progress Tracker - Comprehensive player progress and engagement tracking
 * Tracks progress across Active, Passive, and Hybrid systems
 * Provides analytics, milestones, and engagement metrics
 */

export class ProgressTracker {
  constructor(gameState, eventBus) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.debugMode = false;
    
    // Timer management for progress tracking
    this.timerIds = {
      sessionTimer: null,
      momentumTimer: null,
      saveTimer: null,
      trendsTimer: null
    };
    
    // Progress tracking for each loop type
    this.progress = {
      active: {
        clicking: {
          totalClicks: 0,
          clicksPerMinute: 0,
          averageClickValue: 0,
          longestClickStreak: 0,
          clickingSessionCount: 0,
          timeSpentClicking: 0,
          lastClickTime: 0,
          clickPatterns: [],
          preferredClickingStyle: 'normal', // normal, burst, steady
          clickEfficiency: 0
        },
        engagement: {
          activeSessionCount: 0,
          totalActiveTime: 0,
          averageSessionLength: 0,
          peakActiveTime: 0,
          activeFocus: 0.5 // 0-1 scale
        }
      },
      passive: {
        assistants: {
          totalAssistantsPurchased: 0,
          assistantDiversity: 0,
          optimalAssistantRatio: 0,
          upgradeEfficiency: 0,
          passiveIncome: 0,
          assistantPreferences: {},
          strategicDepth: 0
        },
        automation: {
          automationLevel: 0,
          passiveEfficiency: 0,
          idleTime: 0,
          totalIdleEarnings: 0,
          automationPreference: 0.5 // 0-1 scale (0=manual, 1=automated)
        },
        boosts: {
          totalBoostsPurchased: 0,
          boostEfficiency: 0,
          boostTiming: 0,
          stackingSkill: 0,
          boostPreferences: {}
        },
        engagement: {
          passiveSessionCount: 0,
          totalPassiveTime: 0,
          optimizationActions: 0,
          passiveFocus: 0.5 // 0-1 scale
        }
      },
      hybrid: {
        abilities: {
          totalAbilitiesUsed: 0,
          abilitiesPerSession: 0,
          favoriteAbilities: {},
          abilityEfficiency: {},
          comboCount: 0,
          advancedTechniques: 0,
          abilityMastery: 0,
          cooldownManagement: 0,
          synergyCombos: 0
        },
        yetis: {
          totalYetisSpotted: 0,
          yetiInteractionRate: 0,
          yetiPreferences: {},
          yetiTiming: 0,
          interactionEfficiency: 0,
          yetiMastery: 0
        },
        locations: {
          locationsUnlocked: 0,
          explorationRate: 0,
          locationPreferences: {},
          travelEfficiency: 0,
          discoveryRate: 0,
          visits: [],
          visitedLocations: {},
          uniqueLocationsVisited: 0,
          mostVisitedLocation: null,
          maxLocationVisits: 0,
          classDistribution: {},
          travelFrequency: 0
        },
        balance: {
          activePassiveBalance: 0.5, // 0=all active, 1=all passive
          hybridMastery: 0,
          switchingFrequency: 0,
          adaptability: 0,
          systemSynergy: 0
        },
        engagement: {
          hybridSessionCount: 0,
          totalHybridTime: 0,
          modeSwitch: 0,
          complexityHandling: 0,
          hybridFocus: 0.5 // 0-1 scale
        }
      }
    };
    
    // NOTE: Milestone system removed - replaced by comprehensive achievement system in global/achievement.js
    
    // Engagement analytics
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
      },
      behavior: {
        explorationRate: 0.5,
        optimizationRate: 0.5,
        experimentationRate: 0.5,
        consistencyRate: 0.5,
        focusRate: 0.5
      }
    };
    
    // Player journey mapping
    this.journey = {
      currentPhase: 'beginner', // beginner, intermediate, advanced, expert
      phaseStartTime: Date.now(),
      phaseDuration: 0,
      significantEvents: [],
      learningCurve: [],
      skillDevelopment: {
        active: 0,
        passive: 0,
        hybrid: 0,
        overall: 0
      }
    };
    
    // Real-time tracking
    this.tracking = {
      currentSession: {
        startTime: Date.now(),
        systemUsage: { active: 0, passive: 0, hybrid: 0 },
        actionsPerformed: [],
        engagementLevel: 0.5,
        focusLevel: 0.5
      },
      momentum: {
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
        decayRate: 0.1, // How quickly momentum decays per second
        maxMomentum: 10,
        windowSize: 10000, // 10 seconds in milliseconds
        // Travel button progression tracking
        travelButton: {
          progress: 0, // Current progress toward unlocking travel
          maxProgress: 150, // 150 seconds at max momentum to unlock (changed from 300 for faster progression)
          unlocked: false, // Once unlocked, stays unlocked
          progressHistory: [], // Track progress over time
          momentumSamples: [], // Store momentum samples for averaging
          sampleInterval: 1000, // Sample every second
          lastProgressUpdate: Date.now()
        }
      },
      recentActivity: [],
      trends: {
        daily: {},
        weekly: {},
        monthly: {}
      }
    };
    
    // Achievement system integration
    this.achievements = {
      unlocked: [],
      inProgress: [],
      categories: {
        progress: [],
        engagement: [],
        mastery: [],
        exploration: [],
        optimization: []
      }
    };
    
    this.setupEventListeners();
    this.initializeTracking();
    
    // console.log('[PROGRESS_TRACKER] Comprehensive progress tracking initialized');
  }
  
  /**
   * Set up event listeners for tracking
   */
  setupEventListeners() {
    // Active system events
    this.eventBus.on('click', (data) => {
      this.trackClick(data);
    }, 'ProgressTracker');
    
    this.eventBus.on('abilityUsed', (data) => {
      this.trackAbilityUsage(data);
    }, 'ProgressTracker');
    
    // Passive system events
    this.eventBus.on('assistantPurchased', (data) => {
      this.trackAssistantPurchase(data);
    }, 'ProgressTracker');
    
    this.eventBus.on('boostPurchased', (data) => {
      this.trackBoostPurchase(data);
    }, 'ProgressTracker');
    
    this.eventBus.on('icicleHarvested', (data) => {
      this.trackIcicleHarvest(data);
    }, 'ProgressTracker');
    
    this.eventBus.on('globalUpgradePurchased', (data) => {
      this.trackGlobalUpgradePurchase(data);
    }, 'ProgressTracker');
    
    // Hybrid system events
    this.eventBus.on('yetiSpotted', (data) => {
      this.trackYetiSpotting(data);
    }, 'ProgressTracker');
    
    this.eventBus.on('locationUnlocked', (data) => {
      this.trackLocationUnlock(data);
    }, 'ProgressTracker');
    
    // Location visit tracking
    this.eventBus.on('locationBuffActivated', (data) => {
      this.trackLocationVisit(data);
    }, 'ProgressTracker');
    
    // System switching events
    this.eventBus.on('systemSwitched', (data) => {
      this.trackSystemSwitch(data);
    }, 'ProgressTracker');
    
    // General game events
    this.eventBus.on('gameStateChanged', (data) => {
      this.updateEngagementMetrics(data);
    }, 'ProgressTracker');
    
    this.eventBus.on('achievementUnlocked', (data) => {
      this.trackAchievementUnlock(data);
    }, 'ProgressTracker');
  }
  
  /**
   * Initialize tracking systems
   */
  initializeTracking() {
    // Start session tracking
    this.tracking.currentSession.startTime = Date.now();
    
    // Set up periodic updates
    this.startPeriodicUpdates();
    
    // Initialize player phase
    this.determinePlayerPhase();
    
    // Load existing progress from game state
    this.loadProgressFromGameState();
    
    // console.log('[PROGRESS_TRACKER] Tracking systems initialized');
  }
  
  /**
   * Start periodic tracking updates using TimerManager
   */
  startPeriodicUpdates() {
    // Access global timerManager
    const timerManager = window.timerManager;
    if (!timerManager) {
      console.warn('[PROGRESS_TRACKER] TimerManager not available, falling back to setInterval');
      this.startPeriodicUpdatesLegacy();
      return;
    }
    
    // Update every 10 seconds
    this.timerIds.sessionTimer = timerManager.setInterval(() => {
      this.updateSessionMetrics();
      this.updateEngagementScores();
      this.updatePlayerJourney();
    }, 10000, 'progress-session');
    
    // Update momentum and travel button progression every second
    this.timerIds.momentumTimer = timerManager.setInterval(() => {
      this.updateMomentum();
      this.updateTravelButtonProgress();
    }, 1000, 'progress-momentum');
    
    // Save progress every minute
    this.timerIds.saveTimer = timerManager.setInterval(() => {
      this.saveProgressToGameState();
    }, 60000, 'progress-save');
    
    // Update trends daily
    this.timerIds.trendsTimer = timerManager.setInterval(() => {
      this.updateTrends();
    }, 24 * 60 * 60 * 1000, 'progress-trends'); // 24 hours
    
    // console.log('[PROGRESS_TRACKER] Started periodic updates with TimerManager');
  }
  
  /**
   * Legacy fallback for periodic updates
   */
  startPeriodicUpdatesLegacy() {
    // Update every 10 seconds
    setInterval(() => {
      this.updateSessionMetrics();
      this.updateEngagementScores();
      this.updatePlayerJourney();
    }, 10000);
    
    // Update momentum and travel button progression every second
    setInterval(() => {
      this.updateMomentum();
      this.updateTravelButtonProgress();
    }, 1000);
    
    // Save progress every minute
    setInterval(() => {
      this.saveProgressToGameState();
    }, 60000);
    
    // Update trends daily
    setInterval(() => {
      this.updateTrends();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // console.log('[PROGRESS_TRACKER] Started periodic updates with legacy setInterval');
  }
  
  /**
   * Track clicking activity
   */
  trackClick(data) {
    const clicking = this.progress.active.clicking;
    
    clicking.totalClicks++;
    clicking.lastClickTime = Date.now();
    clicking.clickPatterns.push({
      time: Date.now(),
      value: data.value || 1,
      streak: data.streak || 0
    });
    
    // Update streak tracking
    if (data.streak > clicking.longestClickStreak) {
      clicking.longestClickStreak = data.streak;
    }
    
    // Update clicking efficiency
    this.updateClickingEfficiency();
    
    // Track in current session
    this.tracking.currentSession.actionsPerformed.push({
      type: 'click',
      time: Date.now(),
      data: data
    });
    
    this.tracking.currentSession.systemUsage.active += 1;
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Click tracked:', clicking.totalClicks);
    }
  }
  
  /**
   * Track ability usage
   */
  trackAbilityUsage(data) {
    const abilities = this.progress.hybrid.abilities;
    
    abilities.totalAbilitiesUsed++;
    
    // Track favorite abilities
    const abilityId = data.abilityId || 'unknown';
    abilities.favoriteAbilities[abilityId] = (abilities.favoriteAbilities[abilityId] || 0) + 1;
    
    // Track efficiency
    if (data.effectiveness !== undefined) {
      abilities.abilityEfficiency[abilityId] = (abilities.abilityEfficiency[abilityId] || 0) + data.effectiveness;
    }
    
    // Track combos
    if (data.isCombo) {
      abilities.comboCount++;
    }
    
    // Track in current session
    this.tracking.currentSession.actionsPerformed.push({
      type: 'abilityUsed',
      time: Date.now(),
      data: data
    });
    
    this.tracking.currentSession.systemUsage.hybrid += 1;
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Ability usage tracked:', abilityId);
    }
  }
  
  /**
   * Track assistant purchases
   */
  trackAssistantPurchase(data) {
    const assistants = this.progress.passive.assistants;
    
    assistants.totalAssistantsPurchased++;
    
    // Track preferences
    const assistantId = data.assistantId || 'unknown';
    assistants.assistantPreferences[assistantId] = (assistants.assistantPreferences[assistantId] || 0) + 1;
    
    // Update diversity
    this.updateAssistantDiversity();
    
    // Track in current session
    this.tracking.currentSession.actionsPerformed.push({
      type: 'assistantPurchased',
      time: Date.now(),
      data: data
    });
    
    this.tracking.currentSession.systemUsage.passive += 1;
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Assistant purchase tracked:', assistantId);
    }
  }
  
  /**
   * Track boost purchases
   */
  trackBoostPurchase(data) {
    const boosts = this.progress.passive.boosts;
    
    boosts.totalBoostsPurchased++;
    
    // Track preferences
    const boostId = data.boostId || 'unknown';
    boosts.boostPreferences[boostId] = (boosts.boostPreferences[boostId] || 0) + 1;
    
    // Update efficiency
    this.updateBoostEfficiency();
    
    // Track in current session
    this.tracking.currentSession.actionsPerformed.push({
      type: 'boostPurchased',
      time: Date.now(),
      data: data
    });
    
    this.tracking.currentSession.systemUsage.passive += 1;
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Boost purchase tracked:', boostId);
    }
  }
  
  /**
   * Track yeti spotting
   */
  trackYetiSpotting(data) {
    const yetis = this.progress.hybrid.yetis;
    
    yetis.totalYetisSpotted++;
    
    // Track preferences
    const yetiClass = data.yetiClass || 'unknown';
    yetis.yetiPreferences[yetiClass] = (yetis.yetiPreferences[yetiClass] || 0) + 1;
    
    // Update interaction rate
    this.updateYetiInteractionRate();
    
    // Track in current session
    this.tracking.currentSession.actionsPerformed.push({
      type: 'yetiSpotted',
      time: Date.now(),
      data: data
    });
    
    this.tracking.currentSession.systemUsage.hybrid += 1;
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Yeti spotting tracked:', yetiClass);
    }
  }
  
  /**
   * Track location unlocking
   */
  trackLocationUnlock(data) {
    const locations = this.progress.hybrid.locations;
    
    locations.locationsUnlocked++;
    
    // Track preferences
    const locationId = data.locationId || 'unknown';
    locations.locationPreferences[locationId] = (locations.locationPreferences[locationId] || 0) + 1;
    
    // Update exploration rate
    this.updateExplorationRate();
    
    // Track in current session
    this.tracking.currentSession.actionsPerformed.push({
      type: 'locationUnlocked',
      time: Date.now(),
      data: data
    });
    
    this.tracking.currentSession.systemUsage.hybrid += 1;
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Location unlock tracked:', locationId);
    }
  }
  
  /**
   * Track location visits (when traveling to a location)
   */
  trackLocationVisit(data) {
    const locations = this.progress.hybrid.locations;
    
    // Initialize visits tracking if not exists
    if (!locations.visits) {
      locations.visits = [];
    }
    
    if (!locations.visitedLocations) {
      locations.visitedLocations = {};
    }
    
    const locationId = data.locationId || 'unknown';
    const locationClass = data.locationClass || 'unknown';
    const locationName = data.locationName || 'unknown';
    
    // Record the visit with timestamp
    const visit = {
      locationId: locationId,
      locationClass: locationClass,
      locationName: locationName,
      timestamp: Date.now(),
      gameTime: this.gameState.getGameTime()
    };
    
    locations.visits.push(visit);
    
    // Track total visits per location
    locations.visitedLocations[locationId] = (locations.visitedLocations[locationId] || 0) + 1;
    
    // Track location preferences by class
    if (!locations.locationPreferences) {
      locations.locationPreferences = {};
    }
    locations.locationPreferences[locationClass] = (locations.locationPreferences[locationClass] || 0) + 1;
    
    // Update location statistics
    this.updateLocationStatistics();
    
    // Track in current session
    this.tracking.currentSession.actionsPerformed.push({
      type: 'locationVisited',
      time: Date.now(),
      data: data
    });
    
    this.tracking.currentSession.systemUsage.hybrid += 1;
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Location visit tracked:', locationName, '(' + locationClass + ')');
    }
  }
  
  /**
   * Update location statistics
   */
  updateLocationStatistics() {
    const locations = this.progress.hybrid.locations;
    
    if (!locations.visits || locations.visits.length === 0) {
      return;
    }
    
    // Calculate total unique locations visited
    const uniqueLocations = Object.keys(locations.visitedLocations || {}).length;
    locations.uniqueLocationsVisited = uniqueLocations;
    
    // Calculate most visited location
    let mostVisitedLocation = null;
    let maxVisits = 0;
    
    for (const [locationId, visitCount] of Object.entries(locations.visitedLocations || {})) {
      if (visitCount > maxVisits) {
        maxVisits = visitCount;
        mostVisitedLocation = locationId;
      }
    }
    
    locations.mostVisitedLocation = mostVisitedLocation;
    locations.maxLocationVisits = maxVisits;
    
    // Calculate class distribution
    const classDistribution = {};
    for (const [locationClass, count] of Object.entries(locations.locationPreferences || {})) {
      classDistribution[locationClass] = count;
    }
    locations.classDistribution = classDistribution;
    
    // Calculate travel frequency (visits per hour)
    const totalVisits = locations.visits.length;
    const totalPlayTime = this.engagement.overall.totalPlayTime / 3600; // Convert to hours
    locations.travelFrequency = totalPlayTime > 0 ? totalVisits / totalPlayTime : 0;
  }
  
  /**
   * Track system switching
   */
  trackSystemSwitch(data) {
    const balance = this.progress.hybrid.balance;
    
    balance.switchingFrequency++;
    
    // Update adaptability
    this.updateAdaptability();
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] System switch tracked:', data.from, '->', data.to);
    }
  }
  
  /**
   * Track icicle harvesting
   */
  trackIcicleHarvest(data) {
    // Track in current session
    this.tracking.currentSession.actionsPerformed.push({
      type: 'icicleHarvested',
      time: Date.now(),
      data: data
    });
    
    this.tracking.currentSession.systemUsage.passive += 1;
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Icicle harvest tracked');
    }
  }
  
  /**
   * Track global upgrade purchases
   */
  trackGlobalUpgradePurchase(data) {
    // Track in current session
    this.tracking.currentSession.actionsPerformed.push({
      type: 'globalUpgradePurchased',
      time: Date.now(),
      data: data
    });
    
    this.tracking.currentSession.systemUsage.passive += 1;
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Global upgrade purchase tracked:', data.upgradeId);
    }
  }
  
  /**
   * Track achievement unlocking
   */
  trackAchievementUnlock(data) {
    // Add to achievements
    this.achievements.unlocked.push(data.achievementId);
    
    // Record significant event
    this.journey.significantEvents.push({
      type: 'achievement_unlock',
      achievement: data.achievementId,
      time: Date.now()
    });
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Achievement unlock tracked:', data.achievementId);
    }
  }
  
  /**
   * Update engagement metrics
   */
  updateEngagementMetrics(data) {
    // Update overall engagement
    this.engagement.overall.totalPlayTime += 10; // 10 seconds per update
    
    // Update system usage distribution
    const totalUsage = this.tracking.currentSession.systemUsage.active + 
                      this.tracking.currentSession.systemUsage.passive + 
                      this.tracking.currentSession.systemUsage.hybrid;
    
    if (totalUsage > 0) {
      this.engagement.preferences.systemUsageDistribution = {
        active: this.tracking.currentSession.systemUsage.active / totalUsage,
        passive: this.tracking.currentSession.systemUsage.passive / totalUsage,
        hybrid: this.tracking.currentSession.systemUsage.hybrid / totalUsage
      };
    }
    
    // Update engagement score
    this.updateEngagementScore();
  }
  
  /**
   * Update various efficiency metrics
   */
  updateClickingEfficiency() {
    const clicking = this.progress.active.clicking;
    const recentClicks = clicking.clickPatterns.slice(-100); // Last 100 clicks
    
    if (recentClicks.length > 0) {
      const avgValue = recentClicks.reduce((sum, click) => sum + click.value, 0) / recentClicks.length;
      clicking.averageClickValue = avgValue;
      
      // Calculate efficiency based on value and timing
      const timeSpan = recentClicks[recentClicks.length - 1].time - recentClicks[0].time;
      const clicksPerSecond = recentClicks.length / (timeSpan / 1000);
      clicking.clicksPerMinute = clicksPerSecond * 60;
      
      // Efficiency = (clicks per minute * average value) / theoretical maximum
      clicking.clickEfficiency = Math.min(1.0, (clicking.clicksPerMinute * avgValue) / 1000);
    }
  }
  
  updateAssistantDiversity() {
    const assistants = this.progress.passive.assistants;
    const uniqueTypes = Object.keys(assistants.assistantPreferences).length;
    assistants.assistantDiversity = uniqueTypes / 10; // Assuming 10 possible types
  }
  
  updateBoostEfficiency() {
    const boosts = this.progress.passive.boosts;
    // Calculate efficiency based on boost usage patterns
    const totalBoosts = boosts.totalBoostsPurchased;
    const uniqueTypes = Object.keys(boosts.boostPreferences).length;
    
    if (totalBoosts > 0) {
      boosts.boostEfficiency = Math.min(1.0, (uniqueTypes * 10) / totalBoosts);
    }
  }
  
  updateYetiInteractionRate() {
    const yetis = this.progress.hybrid.yetis;
    const totalInteractions = Object.values(yetis.yetiPreferences).reduce((sum, count) => sum + count, 0);
    
    if (totalInteractions > 0) {
      yetis.yetiInteractionRate = Math.min(1.0, totalInteractions / yetis.totalYetisSpotted);
    }
  }
  
  updateExplorationRate() {
    const locations = this.progress.hybrid.locations;
    // Calculate exploration rate based on location unlocking pattern
    locations.explorationRate = Math.min(1.0, locations.locationsUnlocked / 20); // Assuming 20 possible locations
  }
  
  updateAdaptability() {
    const balance = this.progress.hybrid.balance;
    const switches = balance.switchingFrequency;
    const playTime = this.engagement.overall.totalPlayTime;
    
    if (playTime > 0) {
      balance.adaptability = Math.min(1.0, switches / (playTime / 3600)); // Switches per hour
    }
  }
  
  updateEngagementScore() {
    const metrics = this.engagement.overall;
    const behavior = this.engagement.behavior;
    
    // Calculate based on various factors
    const timeScore = Math.min(1.0, metrics.totalPlayTime / 3600); // Hours played
    const sessionScore = Math.min(1.0, metrics.sessionCount / 10); // Sessions count
    const behaviorScore = (behavior.explorationRate + behavior.optimizationRate + behavior.focusRate) / 3;
    
    metrics.engagementScore = (timeScore + sessionScore + behaviorScore) / 3;
  }
  
  /**
   * Check and unlock milestones
   */
  // NOTE: Milestone checking and unlocking functions removed - replaced by achievement system
  
  /**
   * Update session metrics
   */
  updateSessionMetrics() {
    const session = this.tracking.currentSession;
    const overall = this.engagement.overall;
    
    session.duration = Date.now() - session.startTime;
    
    // Update overall metrics
    overall.totalPlayTime += 10; // 10 seconds
    
    if (session.duration > overall.longestSession) {
      overall.longestSession = session.duration;
    }
    
    if (session.duration < overall.shortestSession) {
      overall.shortestSession = session.duration;
    }
    
    // Update engagement level based on activity
    const recentActivity = session.actionsPerformed.filter(
      action => Date.now() - action.time < 60000 // Last minute
    );
    
    session.engagementLevel = Math.min(1.0, recentActivity.length / 10);
  }
  
  /**
   * Update engagement scores
   */
  updateEngagementScores() {
    this.updateEngagementScore();
    
    // Update system-specific engagement
    const systemUsage = this.tracking.currentSession.systemUsage;
    const totalUsage = systemUsage.active + systemUsage.passive + systemUsage.hybrid;
    
    if (totalUsage > 0) {
      this.progress.active.engagement.activeFocus = systemUsage.active / totalUsage;
      this.progress.passive.engagement.passiveFocus = systemUsage.passive / totalUsage;
      this.progress.hybrid.engagement.hybridFocus = systemUsage.hybrid / totalUsage;
    }
  }
  
  /**
   * Update player journey
   */
  updatePlayerJourney() {
    const journey = this.journey;
    
    // Update phase duration
    journey.phaseDuration = Date.now() - journey.phaseStartTime;
    
    // Check if phase should advance
    const shouldAdvance = this.shouldAdvancePhase();
    if (shouldAdvance) {
      this.advancePlayerPhase();
    }
    
    // Update skill development
    this.updateSkillDevelopment();
  }
  
  /**
   * Determine if player should advance to next phase
   */
  shouldAdvancePhase() {
    const progress = this.progress;
    const journey = this.journey;
    
    switch (journey.currentPhase) {
      case 'beginner':
        return progress.active.clicking.totalClicks >= 100 &&
               progress.passive.assistants.totalAssistantsPurchased >= 5;
      
      case 'intermediate':
        return progress.active.clicking.totalClicks >= 1000 &&
               progress.passive.assistants.totalAssistantsPurchased >= 25 &&
               progress.hybrid.yetis.totalYetisSpotted >= 5;
      
      case 'advanced':
        return progress.active.clicking.clickEfficiency >= 0.7 &&
               progress.passive.automation.automationLevel >= 0.7 &&
               progress.hybrid.balance.hybridMastery >= 0.7;
      
      default:
        return false;
    }
  }
  
  /**
   * Advance player to next phase
   */
  advancePlayerPhase() {
    const journey = this.journey;
    const previousPhase = journey.currentPhase;
    
    switch (journey.currentPhase) {
      case 'beginner':
        journey.currentPhase = 'intermediate';
        break;
      case 'intermediate':
        journey.currentPhase = 'advanced';
        break;
      case 'advanced':
        journey.currentPhase = 'expert';
        break;
    }
    
    // Record significant event
    journey.significantEvents.push({
      type: 'phase_advance',
      from: previousPhase,
      to: journey.currentPhase,
      time: Date.now(),
      duration: journey.phaseDuration
    });
    
    // Reset phase timing
    journey.phaseStartTime = Date.now();
    journey.phaseDuration = 0;
    
    // Emit event
    this.eventBus.emit('playerPhaseAdvanced', {
      from: previousPhase,
      to: journey.currentPhase,
      duration: journey.phaseDuration
    });
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Player phase advanced:', previousPhase, '->', journey.currentPhase);
    }
  }
  
  /**
   * Update skill development metrics
   */
  updateSkillDevelopment() {
    const skills = this.journey.skillDevelopment;
    const progress = this.progress;
    
    // Calculate skill levels based on various metrics
    skills.active = (
      progress.active.clicking.clickEfficiency +
      progress.active.engagement.activeFocus
    ) / 2;
    
    skills.passive = (
      progress.passive.assistants.upgradeEfficiency +
      progress.passive.automation.automationLevel +
      progress.passive.boosts.boostEfficiency
    ) / 3;
    
    skills.hybrid = (
      progress.hybrid.abilities.abilityMastery +
      progress.hybrid.yetis.yetiMastery +
      progress.hybrid.locations.explorationRate +
      progress.hybrid.balance.hybridMastery
    ) / 4;
    
    skills.overall = (skills.active + skills.passive + skills.hybrid) / 3;
  }
  
  /**
   * Determine current player phase
   */
  determinePlayerPhase() {
    const progress = this.progress;
    
    // Determine phase based on current progress
    if (progress.active.clicking.totalClicks >= 10000 &&
        progress.passive.automation.automationLevel >= 0.8 &&
        progress.hybrid.balance.hybridMastery >= 0.8) {
      this.journey.currentPhase = 'expert';
    } else if (progress.active.clicking.totalClicks >= 1000 &&
               progress.passive.assistants.totalAssistantsPurchased >= 25 &&
               progress.hybrid.yetis.totalYetisSpotted >= 5) {
      this.journey.currentPhase = 'advanced';
    } else if (progress.active.clicking.totalClicks >= 100 &&
               progress.passive.assistants.totalAssistantsPurchased >= 5) {
      this.journey.currentPhase = 'intermediate';
    } else {
      this.journey.currentPhase = 'beginner';
    }
  }
  
  /**
   * Load progress from game state
   */
  loadProgressFromGameState() {
    const gameState = this.gameState;
    
    // Load existing progress data from flat structure
    // Note: In the new flat architecture, we don't have nested loops structure
    // Instead, we access data directly from the gameState properties
    
    // Load existing achievements from flat structure
    if (gameState.achievements) {
      this.achievements.unlocked = Object.keys(gameState.achievements);
    }
    
    // Load click-related data
    if (gameState.lifetimeClicks !== undefined) {
      this.progress.active.clicking.totalClicks = gameState.lifetimeClicks;
    }
    
    // Load assistant-related data
    if (gameState.assistants) {
      // Count total assistants purchased
      let totalAssistants = 0;
      if (gameState.assistants instanceof Map) {
        gameState.assistants.forEach(count => totalAssistants += count);
      } else if (typeof gameState.assistants === 'object') {
        Object.values(gameState.assistants).forEach(count => totalAssistants += count);
      }
      this.progress.passive.assistants.totalAssistantsPurchased = totalAssistants;
    }
    
    // Load yeti-related data
    if (gameState.yetisSighted !== undefined) {
      this.progress.hybrid.yetis.totalYetisSpotted = gameState.yetisSighted;
    }
  }
  
  /**
   * Sync with loop state - DEPRECATED
   * This method is no longer needed with the flat state architecture
   * but keeping it for backward compatibility
   */
  syncWithLoopState(loops) {
    // This method is deprecated in the flat state architecture
    // Data is now loaded directly from gameState in loadProgressFromGameState()
    console.warn('[PROGRESS_TRACKER] syncWithLoopState is deprecated - using flat state architecture');
  }
  
  /**
   * Save progress to game state
   */
  saveProgressToGameState() {
    const gameState = this.gameState;
    
    // Save progress data to game state
    if (!gameState.progressTracking) {
      gameState.progressTracking = {};
    }
    
    gameState.progressTracking = {
      progress: this.progress,
      engagement: this.engagement,
      journey: this.journey,
      milestones: this.milestones,
      achievements: this.achievements,
      lastUpdate: Date.now()
    };
    
    // Save to localStorage
    gameState.save();
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Progress saved to game state');
    }
  }
  
  /**
   * Update trends (daily, weekly, monthly)
   */
  updateTrends() {
    const now = new Date();
    const today = now.toDateString();
    
    // Daily trends
    if (!this.tracking.trends.daily[today]) {
      this.tracking.trends.daily[today] = {
        playTime: 0,
        clicks: 0,
        purchases: 0,
        yetiSpottings: 0,
        milestones: 0
      };
    }
    
    const dailyTrend = this.tracking.trends.daily[today];
    dailyTrend.playTime = this.engagement.overall.totalPlayTime;
    dailyTrend.clicks = this.progress.active.clicking.totalClicks;
    dailyTrend.purchases = this.progress.passive.assistants.totalAssistantsPurchased;
    dailyTrend.yetiSpottings = this.progress.hybrid.yetis.totalYetisSpotted;
    dailyTrend.milestones = this.journey.milestoneHistory.length;
    
    // Clean up old trends (keep only last 30 days)
    const dailyKeys = Object.keys(this.tracking.trends.daily);
    if (dailyKeys.length > 30) {
      dailyKeys.slice(0, -30).forEach(key => {
        delete this.tracking.trends.daily[key];
      });
    }
  }
  
  /**
   * Get progress summary
   */
  getProgressSummary() {
    return {
      currentPhase: this.journey.currentPhase,
      engagementScore: this.engagement.overall.engagementScore,
      totalPlayTime: this.engagement.overall.totalPlayTime,
      skillDevelopment: this.journey.skillDevelopment,
      systemPreference: this.engagement.preferences.preferredSystem
    };
  }
  
  /**
   * Get detailed analytics
   */
  getAnalytics() {
    return {
      progress: this.progress,
      engagement: this.engagement,
      journey: this.journey,
      tracking: this.tracking,
      achievements: this.achievements
    };
  }
  
  /**
   * Get recommendations based on progress
   */
  getRecommendations() {
    const recommendations = [];
    const progress = this.progress;
    const engagement = this.engagement;
    
    // Check for underutilized systems
    const systemUsage = engagement.preferences.systemUsageDistribution;
    
    if (systemUsage.active < 0.2) {
      recommendations.push({
        type: 'system_usage',
        system: 'active',
        priority: 'medium',
        message: 'Try clicking more to improve your active system skills!',
        benefit: 'Increased click efficiency and combo potential'
      });
    }
    
    if (systemUsage.passive < 0.3) {
      recommendations.push({
        type: 'system_usage',
        system: 'passive',
        priority: 'high',
        message: 'Consider purchasing more assistants for passive income!',
        benefit: 'Steady snowball generation while away'
      });
    }
    
    if (systemUsage.hybrid < 0.1) {
      recommendations.push({
        type: 'system_usage',
        system: 'hybrid',
        priority: 'low',
        message: 'Explore locations and spot yetis for bonus rewards!',
        benefit: 'Unique bonuses and special interactions'
      });
    }
    
    // Check for efficiency improvements
    if (progress.active.clicking.clickEfficiency < 0.5) {
      recommendations.push({
        type: 'efficiency',
        system: 'active',
        priority: 'medium',
        message: 'Work on your clicking rhythm to improve efficiency!',
        benefit: 'More snowballs per click'
      });
    }
    
    if (progress.passive.automation.automationLevel < 0.6) {
      recommendations.push({
        type: 'automation',
        system: 'passive',
        priority: 'high',
        message: 'Upgrade your assistants to increase automation!',
        benefit: 'Higher passive income generation'
      });
    }
    
    // Phase-specific recommendations
    switch (this.journey.currentPhase) {
      case 'beginner':
        recommendations.push({
          type: 'progression',
          priority: 'high',
          message: 'Focus on clicking and buying your first assistants!',
          benefit: 'Unlock intermediate gameplay features'
        });
        break;
      
      case 'intermediate':
        recommendations.push({
          type: 'progression',
          priority: 'medium',
          message: 'Start exploring hybrid systems like yeti spotting!',
          benefit: 'Access to advanced game mechanics'
        });
        break;
      
      case 'advanced':
        recommendations.push({
          type: 'mastery',
          priority: 'low',
          message: 'Perfect your system balance for maximum efficiency!',
          benefit: 'Achieve expert-level gameplay'
        });
        break;
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  /**
   * Set debug mode
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
    // console.log('[PROGRESS_TRACKER] Debug mode:', enabled ? 'enabled' : 'disabled');
  }
  
  /**
   * Reset all progress (for testing)
   */
  resetProgress() {
    this.progress = {
      active: { clicking: {}, engagement: {} },
      passive: { assistants: {}, automation: {}, boosts: {}, engagement: {} },
      hybrid: { abilities: {}, yetis: {}, locations: {}, balance: {}, engagement: {} }
    };
    
    this.engagement.overall = {
      totalPlayTime: 0,
      sessionCount: 0,
      engagementScore: 0.5
    };
    
    this.journey.currentPhase = 'beginner';
    this.journey.significantEvents = [];
    
    // console.log('[PROGRESS_TRACKER] Progress reset');
  }

  /**
   * Cleanup progress tracker timers
   */
  cleanup() {
    const timerManager = window.timerManager;
    if (!timerManager) return 0;
    
    // console.log('[PROGRESS_TRACKER] Cleaning up timers...');
    let cleanedCount = 0;
    
    Object.entries(this.timerIds).forEach(([name, timerId]) => {
      if (timerId && timerManager.clearTimer(timerId)) {
        cleanedCount++;
        this.timerIds[name] = null;
      }
    });
    
    // console.log(`[PROGRESS_TRACKER] Cleaned up ${cleanedCount} timers`);
    return cleanedCount;
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
    const momentum = this.tracking.momentum;
    const now = Date.now();
    
    // Calculate momentum based on recent actions
    const recentActions = this.getRecentActions(momentum.windowSize);
    let momentumScore = 0;
    
    // Calculate weighted score based on action types
    recentActions.forEach(action => {
      const weight = momentum.actionWeights[action.type] || 1.0;
      const timeFactor = this.getTimeFactor(action.time, now, momentum.windowSize);
      momentumScore += weight * timeFactor;
    });
    
    // Apply decay since last update
    const timeSinceUpdate = (now - momentum.lastUpdate) / 1000; // seconds
    const decayFactor = Math.pow(0.9, timeSinceUpdate * momentum.decayRate);
    momentumScore *= decayFactor;
    
    // Normalize to 0-10 scale
    momentum.current = Math.min(momentum.maxMomentum, Math.max(0, momentumScore));
    
    // Update history
    momentum.history.push({
      time: now,
      score: momentum.current,
      actionCount: recentActions.length
    });
    
    // Keep only last 100 readings
    if (momentum.history.length > 100) {
      momentum.history.shift();
    }
    
    momentum.lastUpdate = now;
    
    // Emit momentum change event for hybrid systems
    this.eventBus.emit('momentumChanged', {
      momentum: momentum.current,
      trend: this.getMomentumTrend(),
      actionCount: recentActions.length
    });
    
    if (this.debugMode) {
      // console.log('[PROGRESS_TRACKER] Momentum updated:', momentum.current.toFixed(1));
    }
    */
  }
  
  /**
   * Get recent actions within time window
   */
  getRecentActions(windowSize) {
    const now = Date.now();
    const cutoff = now - windowSize;
    
    return this.tracking.currentSession.actionsPerformed.filter(
      action => action.time >= cutoff
    );
  }
  
  /**
   * Calculate time factor for momentum (more recent = higher impact)
   */
  getTimeFactor(actionTime, currentTime, windowSize) {
    const age = currentTime - actionTime;
    const normalizedAge = age / windowSize; // 0-1 scale
    return Math.max(0, 1 - normalizedAge); // Linear decay
  }
  
  /**
   * Get momentum trend (increasing/decreasing)
   */
  getMomentumTrend() {
    const history = this.tracking.momentum.history;
    if (history.length < 2) return 'stable';
    
    const recent = history.slice(-5); // Last 5 readings
    const first = recent[0].score;
    const last = recent[recent.length - 1].score;
    
    if (last > first + 0.5) return 'increasing';
    if (last < first - 0.5) return 'decreasing';
    return 'stable';
  }
  
  /**
   * Get current momentum score
   */
  getMomentumScore() {
    return this.tracking.momentum.current;
  }
  
  /**
   * Get momentum statistics
   */
  getMomentumStats() {
    const momentum = this.tracking.momentum;
    const history = momentum.history;
    
    if (history.length === 0) {
      return {
        current: 0,
        average: 0,
        peak: 0,
        trend: 'stable',
        recentActions: 0
      };
    }
    
    const scores = history.map(h => h.score);
    const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const peak = Math.max(...scores);
    const recentActions = this.getRecentActions(momentum.windowSize).length;
    
    return {
      current: momentum.current,
      average: average,
      peak: peak,
      trend: this.getMomentumTrend(),
      recentActions: recentActions,
      history: history.slice(-10) // Last 10 readings
    };
  }
  
  /**
   * Check if momentum is high enough for special events
   */
  isMomentumHigh(threshold = 7) {
    return this.tracking.momentum.current >= threshold;
  }
  
  /**
   * Get momentum-based event frequency multiplier
   */
  getMomentumEventMultiplier() {
    const momentum = this.tracking.momentum.current;
    // Low momentum = slower events, high momentum = faster events
    return Math.max(0.1, Math.min(3.0, momentum / 5.0));
  }
  
  /**
   * Update travel button progress
   */
  updateTravelButtonProgress() {
    const travelButton = this.tracking.momentum.travelButton;
    const now = Date.now();
    
    // Skip if already unlocked
    if (travelButton.unlocked) {
      return;
    }
    
    // Calculate time since last update
    const timeSinceLastUpdate = now - travelButton.lastProgressUpdate;
    const secondsElapsed = timeSinceLastUpdate / 1000;
    
    // Calculate progress increment based on current momentum
    const currentMomentum = this.tracking.momentum.current;
    const progressIncrement = (currentMomentum * secondsElapsed) / travelButton.maxProgress;
    
    // Add progress (but don't exceed 1.0)
    const oldProgress = travelButton.progress;
    travelButton.progress = Math.min(1.0, travelButton.progress + progressIncrement);
    
    // Check if travel button should be unlocked
    if (travelButton.progress >= 1.0 && !travelButton.unlocked) {
      travelButton.unlocked = true;
      
      // Emit event for travel button unlock
      this.eventBus.emit('travelButtonUnlocked', {
        totalTime: now - this.tracking.currentSession.startTime,
        averageMomentum: this.getAverageMomentum()
      });
      
      if (this.debugMode) {
        // console.log('[PROGRESS_TRACKER] Travel button unlocked!');
      }
    }
    
    // Update progress history
    travelButton.progressHistory.push({
      time: now,
      progress: travelButton.progress,
      momentum: currentMomentum,
      progressIncrement: progressIncrement
    });
    
    // Keep only last 100 readings
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
    
    if (this.debugMode && travelButton.progress !== oldProgress) {
      // console.log('[PROGRESS_TRACKER] Travel button progress:', (travelButton.progress * 100).toFixed(1) + '%');
    }
  }
  
  /**
   * Get average momentum over time
   */
  getAverageMomentum() {
    const samples = this.tracking.momentum.travelButton.momentumSamples;
    if (samples.length === 0) return 0;
    
    const sum = samples.reduce((total, sample) => total + sample, 0);
    return sum / samples.length;
  }
  
  /**
   * Get travel button status
   */
  getTravelButtonStatus() {
    const travelButton = this.tracking.momentum.travelButton;
    
    return {
      progress: travelButton.progress,
      progressPercentage: (travelButton.progress * 100).toFixed(1),
      unlocked: travelButton.unlocked,
      currentMomentum: this.tracking.momentum.current,
      averageMomentum: this.getAverageMomentum(),
      estimatedTimeToUnlock: this.getEstimatedTimeToUnlock(),
      progressHistory: travelButton.progressHistory.slice(-10) // Last 10 readings
    };
  }
  
  /**
   * Get estimated time to unlock travel button
   */
  getEstimatedTimeToUnlock() {
    const travelButton = this.tracking.momentum.travelButton;
    
    if (travelButton.unlocked) {
      return 0;
    }
    
    const currentMomentum = this.tracking.momentum.current;
    if (currentMomentum <= 0) {
      return Infinity;
    }
    
    const remainingProgress = 1.0 - travelButton.progress;
    const secondsRemaining = (remainingProgress * travelButton.maxProgress) / currentMomentum;
    
    return Math.ceil(secondsRemaining);
  }
  
  /**
   * Reset travel button progress
   */
  resetTravelButton() {
    // Reset travel button progress
    this.tracking.momentum.travelButton.progress = 0;
    this.tracking.momentum.travelButton.progressHistory = [];
    this.tracking.momentum.travelButton.momentumSamples = [];
    this.tracking.momentum.travelButton.lastProgressUpdate = Date.now(); // Reset the progress update time
    
    // console.log('[PROGRESS_TRACKER] Travel button reset - progress tracking resumed');
  }
} 