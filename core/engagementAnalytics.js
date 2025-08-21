/**
 * Engagement Analytics - Advanced player behavior analysis
 * Provides insights into player engagement patterns and behaviors
 */

export class EngagementAnalytics {
  constructor(progressTracker, gameState, eventBus) {
    this.progressTracker = progressTracker;
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.debugMode = false;
    
    // Timer management for engagement analytics
    this.timerIds = {
      analyticsTimer: null,
      insightsTimer: null,
      saveTimer: null,
      realTimeTimer: null
    };
    
    // Analytics data
    this.analytics = {
      behavioral: {
        playPatterns: {
          sessionLengths: [],
          timeOfDay: {},
          consistencyScore: 0,
          preferredPlayTimes: []
        },
        interactionPatterns: {
          clickRhythms: [],
          purchaseTimings: [],
          systemSwitches: [],
          decisionSpeed: 0.5
        }
      },
      engagement: {
        attention: {
          focusLevels: [],
          averageFocus: 0.5,
          attentionSpans: []
        },
        motivation: {
          motivationLevels: [],
          persistenceScore: 0.5,
          goalPursuit: 0.5
        },
        flow: {
          flowStates: [],
          immersionLevel: 0.5,
          challengeBalance: 0.5
        }
      }
    };
    
    // Real-time metrics
    this.realTime = {
      currentEngagement: 0.5,
      currentAttention: 0.5,
      currentFlow: 0.5,
      currentFrustration: 0.0,
      currentMotivation: 0.5
    };
    
    // Insights and recommendations
    this.insights = {
      behavioral: [],
      engagement: [],
      recommendations: []
    };
    
    this.setupEventListeners();
    this.initializeAnalytics();
    
    // console.log('[ENGAGEMENT_ANALYTICS] Engagement analytics initialized');
  }
  
  setupEventListeners() {
    // Track user interactions
    this.eventBus.on('click', (data) => {
      this.trackInteraction('click', data);
    }, 'EngagementAnalytics');
    
    this.eventBus.on('assistantPurchased', (data) => {
      this.trackInteraction('purchase', data);
    }, 'EngagementAnalytics');
    
    this.eventBus.on('systemSwitched', (data) => {
      this.trackInteraction('systemSwitch', data);
    }, 'EngagementAnalytics');
    
    // NOTE: Milestone event listener removed - replaced by achievement system
  }
  
  initializeAnalytics() {
    this.startRealTimeTracking();
    this.loadAnalyticsFromGameState();
    
    // Access global timerManager
    const timerManager = window.timerManager;
    if (!timerManager) {
      console.warn('[ENGAGEMENT_ANALYTICS] TimerManager not available, falling back to setInterval');
      this.initializeAnalyticsLegacy();
      return;
    }
    
    // Update analytics every 30 seconds
    this.timerIds.analyticsTimer = timerManager.setInterval(() => {
      this.updateAnalytics();
    }, 30000, 'engagement-analytics');
    
    // Generate insights every 2 minutes
    this.timerIds.insightsTimer = timerManager.setInterval(() => {
      this.generateInsights();
    }, 120000, 'engagement-insights');
    
    // Save analytics every 5 minutes
    this.timerIds.saveTimer = timerManager.setInterval(() => {
      this.saveAnalyticsToGameState();
    }, 300000, 'engagement-save');
    
    // console.log('[ENGAGEMENT_ANALYTICS] Initialized analytics with TimerManager');
  }
  
  initializeAnalyticsLegacy() {
    // Update analytics every 30 seconds
    setInterval(() => {
      this.updateAnalytics();
    }, 30000);
    
    // Generate insights every 2 minutes
    setInterval(() => {
      this.generateInsights();
    }, 120000);
    
    // Save analytics every 5 minutes
    setInterval(() => {
      this.saveAnalyticsToGameState();
    }, 300000);
    
    // console.log('[ENGAGEMENT_ANALYTICS] Initialized analytics with legacy setInterval');
  }
  
  startRealTimeTracking() {
    // Access global timerManager
    const timerManager = window.timerManager;
    if (!timerManager) {
      console.warn('[ENGAGEMENT_ANALYTICS] TimerManager not available for real-time tracking');
      setInterval(() => {
        this.updateRealTimeMetrics();
      }, 10000);
      return;
    }
    
    // Update real-time metrics every 10 seconds
    this.timerIds.realTimeTimer = timerManager.setInterval(() => {
      this.updateRealTimeMetrics();
    }, 10000, 'engagement-realtime');
  }
  
  trackInteraction(type, data) {
    const timestamp = Date.now();
    
    switch (type) {
      case 'click':
        this.trackClickPattern(data, timestamp);
        break;
      case 'purchase':
        this.trackPurchasePattern(data, timestamp);
        break;
      case 'systemSwitch':
        this.trackSystemSwitch(data, timestamp);
        break;
    }
    
    // Update engagement based on interaction
    this.updateEngagementFromInteraction(type, data);
    
    if (this.debugMode) {
      // console.log('[ENGAGEMENT_ANALYTICS] Interaction tracked:', type);
    }
  }
  
  trackClickPattern(data, timestamp) {
    const clickRhythms = this.analytics.behavioral.interactionPatterns.clickRhythms;
    
    clickRhythms.push({
      timestamp,
      interval: data.interval || 0,
      streak: data.streak || 0,
      value: data.value || 1
    });
    
    // Keep only last 50 clicks
    if (clickRhythms.length > 50) {
      clickRhythms.shift();
    }
    
    // Update click efficiency analysis
    this.analyzeClickPattern();
  }
  
  trackPurchasePattern(data, timestamp) {
    const purchaseTimings = this.analytics.behavioral.interactionPatterns.purchaseTimings;
    
    purchaseTimings.push({
      timestamp,
      type: data.assistantId || data.boostId || 'unknown',
      cost: data.cost || 0,
      deliberationTime: data.deliberationTime || 0
    });
    
    // Keep only last 30 purchases
    if (purchaseTimings.length > 30) {
      purchaseTimings.shift();
    }
    
    // Update decision speed
    this.updateDecisionSpeed();
  }
  
  trackSystemSwitch(data, timestamp) {
    const systemSwitches = this.analytics.behavioral.interactionPatterns.systemSwitches;
    
    systemSwitches.push({
      timestamp,
      from: data.from,
      to: data.to,
      reason: data.reason || 'exploration'
    });
    
    // Keep only last 20 switches
    if (systemSwitches.length > 20) {
      systemSwitches.shift();
    }
  }
  
  // NOTE: trackMilestone function removed - replaced by achievement system
  
  updateRealTimeMetrics() {
    // Natural decay of emotional states
    this.realTime.currentFrustration *= 0.95;
    this.realTime.currentMotivation = Math.max(0.3, this.realTime.currentMotivation * 0.99);
    
    // Update attention based on recent activity
    this.updateAttentionLevel();
    
    // Update overall engagement
    this.updateOverallEngagement();
    
    // Check for concerning patterns
    this.checkEngagementHealth();
  }
  
  updateAttentionLevel() {
    const recentActivity = this.progressTracker.tracking.currentSession.actionsPerformed
      .filter(action => Date.now() - action.time < 60000); // Last minute
    
    const activityScore = Math.min(1.0, recentActivity.length / 8);
    const consistencyScore = this.calculateActivityConsistency(recentActivity);
    
    this.realTime.currentAttention = (activityScore + consistencyScore) / 2;
    
    // Track attention over time
    this.analytics.engagement.attention.focusLevels.push({
      timestamp: Date.now(),
      level: this.realTime.currentAttention
    });
    
    // Keep only last 50 measurements
    if (this.analytics.engagement.attention.focusLevels.length > 50) {
      this.analytics.engagement.attention.focusLevels.shift();
    }
    
    // Update average focus
    this.analytics.engagement.attention.averageFocus = 
      this.analytics.engagement.attention.focusLevels.reduce((sum, f) => sum + f.level, 0) / 
      this.analytics.engagement.attention.focusLevels.length;
  }
  
  updateOverallEngagement() {
    const factors = [
      this.realTime.currentAttention,
      this.realTime.currentMotivation,
      this.realTime.currentFlow,
      1.0 - this.realTime.currentFrustration
    ];
    
    this.realTime.currentEngagement = factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
  }
  
  calculateActivityConsistency(activities) {
    if (activities.length < 2) return 0.5;
    
    const intervals = [];
    for (let i = 1; i < activities.length; i++) {
      intervals.push(activities[i].time - activities[i-1].time);
    }
    
    const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
    const standardDeviation = Math.sqrt(variance);
    
    // Lower deviation = higher consistency
    return Math.max(0, 1 - (standardDeviation / avgInterval));
  }
  
  updateEngagementFromInteraction(type, data) {
    switch (type) {
      case 'click':
        // Clicking shows active engagement
        this.realTime.currentEngagement = Math.min(1.0, this.realTime.currentEngagement + 0.05);
        this.realTime.currentAttention = Math.min(1.0, this.realTime.currentAttention + 0.1);
        break;
      
      case 'purchase':
        // Purchases show strategic thinking
        this.realTime.currentMotivation = Math.min(1.0, this.realTime.currentMotivation + 0.1);
        break;
      
      case 'systemSwitch':
        // System switching shows exploration
        this.realTime.currentEngagement = Math.min(1.0, this.realTime.currentEngagement + 0.05);
        break;
    }
  }
  
  checkEngagementHealth() {
    // Check for low engagement
    if (this.realTime.currentEngagement < 0.3) {
      this.addInsight('engagement', 'low', 'Player engagement is declining', [
        'Introduce new content or challenges',
        'Provide clearer goals or rewards',
        'Adjust game difficulty'
      ]);
    }
    
    // Check for high frustration
    if (this.realTime.currentFrustration > 0.6) {
      this.addInsight('engagement', 'frustration', 'Player showing signs of frustration', [
        'Provide helpful hints or guidance',
        'Offer easier alternatives',
        'Give positive reinforcement'
      ]);
    }
    
    // Check for flow state
    if (this.realTime.currentFlow > 0.8 && this.realTime.currentAttention > 0.7) {
      this.addInsight('engagement', 'flow', 'Player is in optimal flow state', [
        'Maintain current challenge level',
        'Avoid interruptions',
        'Prepare gradual difficulty increase'
      ]);
    }
  }
  
  updateAnalytics() {
    this.analyzePlayPatterns();
    this.analyzeInteractionPatterns();
    this.updateEngagementMetrics();
    
    if (this.debugMode) {
      // console.log('[ENGAGEMENT_ANALYTICS] Analytics updated');
    }
  }
  
  analyzePlayPatterns() {
    const sessionLengths = this.analytics.behavioral.playPatterns.sessionLengths;
    
    if (sessionLengths.length > 0) {
      // Calculate consistency score
      const durations = sessionLengths.map(session => session.duration);
      this.analytics.behavioral.playPatterns.consistencyScore = this.calculateConsistency(durations);
    }
  }
  
  analyzeInteractionPatterns() {
    this.analyzeClickPattern();
    this.updateDecisionSpeed();
  }
  
  analyzeClickPattern() {
    const clickRhythms = this.analytics.behavioral.interactionPatterns.clickRhythms;
    
    if (clickRhythms.length > 10) {
      const intervals = clickRhythms.map(click => click.interval).filter(interval => interval > 0);
      
      if (intervals.length > 0) {
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const consistency = this.calculateConsistency(intervals);
        
        // Determine click style
        let clickStyle = 'normal';
        if (avgInterval < 300) {
          clickStyle = 'rapid';
        } else if (avgInterval > 1500) {
          clickStyle = 'deliberate';
        }
        
        this.analytics.behavioral.interactionPatterns.clickStyle = clickStyle;
        this.analytics.behavioral.interactionPatterns.clickConsistency = consistency;
      }
    }
  }
  
  updateDecisionSpeed() {
    const purchaseTimings = this.analytics.behavioral.interactionPatterns.purchaseTimings;
    
    if (purchaseTimings.length > 3) {
      const avgDeliberationTime = purchaseTimings.reduce((sum, purchase) => sum + purchase.deliberationTime, 0) / purchaseTimings.length;
      this.analytics.behavioral.interactionPatterns.decisionSpeed = Math.max(0.1, 1 - (avgDeliberationTime / 10000));
    }
  }
  
  updateEngagementMetrics() {
    // Update motivation metrics
    this.analytics.engagement.motivation.motivationLevels.push({
      timestamp: Date.now(),
      level: this.realTime.currentMotivation
    });
    
    // Keep only last 30 measurements
    if (this.analytics.engagement.motivation.motivationLevels.length > 30) {
      this.analytics.engagement.motivation.motivationLevels.shift();
    }
    
    // Update flow metrics
    this.analytics.engagement.flow.flowStates.push({
      timestamp: Date.now(),
      level: this.realTime.currentFlow
    });
    
    // Keep only last 30 measurements
    if (this.analytics.engagement.flow.flowStates.length > 30) {
      this.analytics.engagement.flow.flowStates.shift();
    }
  }
  
  calculateConsistency(values) {
    if (values.length < 2) return 0.5;
    
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);
    
    return Math.max(0.1, 1 - (standardDeviation / mean));
  }
  
  generateInsights() {
    this.insights = {
      behavioral: this.generateBehavioralInsights(),
      engagement: this.generateEngagementInsights(),
      recommendations: this.generateRecommendations()
    };
    
    if (this.debugMode) {
      // console.log('[ENGAGEMENT_ANALYTICS] Insights generated');
    }
  }
  
  generateBehavioralInsights() {
    const insights = [];
    const interactionPatterns = this.analytics.behavioral.interactionPatterns;
    
    // Click pattern insights
    if (interactionPatterns.clickStyle === 'rapid') {
      insights.push({
        type: 'behavior',
        category: 'clicking',
        message: 'Player prefers rapid clicking style',
        confidence: 0.8,
        suggestions: ['Provide click combo bonuses', 'Add burst-click mechanics']
      });
    } else if (interactionPatterns.clickStyle === 'deliberate') {
      insights.push({
        type: 'behavior',
        category: 'clicking',
        message: 'Player uses deliberate clicking approach',
        confidence: 0.8,
        suggestions: ['Emphasize strategic clicking', 'Provide planning tools']
      });
    }
    
    // Decision speed insights
    if (interactionPatterns.decisionSpeed > 0.8) {
      insights.push({
        type: 'behavior',
        category: 'decision',
        message: 'Player makes quick purchase decisions',
        confidence: 0.7,
        suggestions: ['Offer quick purchase options', 'Highlight time-sensitive deals']
      });
    } else if (interactionPatterns.decisionSpeed < 0.4) {
      insights.push({
        type: 'behavior',
        category: 'decision',
        message: 'Player deliberates carefully before purchases',
        confidence: 0.7,
        suggestions: ['Provide detailed comparisons', 'Show long-term benefits']
      });
    }
    
    return insights;
  }
  
  generateEngagementInsights() {
    const insights = [];
    const attention = this.analytics.engagement.attention;
    const motivation = this.analytics.engagement.motivation;
    
    // Attention insights
    if (attention.averageFocus > 0.8) {
      insights.push({
        type: 'engagement',
        category: 'attention',
        message: 'Player maintains excellent focus',
        confidence: 0.9,
        suggestions: ['Continue current engagement level', 'Gradually increase complexity']
      });
    } else if (attention.averageFocus < 0.4) {
      insights.push({
        type: 'engagement',
        category: 'attention',
        message: 'Player attention needs improvement',
        confidence: 0.8,
        suggestions: ['Add visual variety', 'Introduce micro-goals', 'Provide feedback']
      });
    }
    
    // Motivation insights
    if (motivation.motivationLevels.length > 5) {
      const recentMotivation = motivation.motivationLevels.slice(-5);
      const avgMotivation = recentMotivation.reduce((sum, m) => sum + m.level, 0) / recentMotivation.length;
      
      if (avgMotivation > 0.8) {
        insights.push({
          type: 'engagement',
          category: 'motivation',
          message: 'Player is highly motivated',
          confidence: 0.9,
          suggestions: ['Introduce challenging goals', 'Unlock advanced features']
        });
      } else if (avgMotivation < 0.4) {
        insights.push({
          type: 'engagement',
          category: 'motivation',
          message: 'Player motivation is declining',
          confidence: 0.8,
          suggestions: ['Provide quick wins', 'Clarify progression', 'Add rewards']
        });
      }
    }
    
    return insights;
  }
  
  generateRecommendations() {
    const recommendations = [];
    
    // Combine all insights into actionable recommendations
    const allInsights = [...this.insights.behavioral, ...this.insights.engagement];
    
    allInsights.forEach(insight => {
      if (insight.suggestions && insight.suggestions.length > 0) {
        insight.suggestions.forEach(suggestion => {
          recommendations.push({
            category: insight.category,
            priority: this.calculatePriority(insight),
            message: suggestion,
            confidence: insight.confidence,
            source: insight.type
          });
        });
      }
    });
    
    // Add engagement-based recommendations
    if (this.realTime.currentEngagement < 0.5) {
      recommendations.push({
        category: 'engagement',
        priority: 'high',
        message: 'Focus on re-engaging the player with new content or goals',
        confidence: 0.8,
        source: 'real-time'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }
  
  calculatePriority(insight) {
    if (insight.confidence > 0.8 && insight.category === 'attention') {
      return 'high';
    } else if (insight.confidence > 0.7) {
      return 'medium';
    } else {
      return 'low';
    }
  }
  
  addInsight(type, category, message, suggestions) {
    const insight = {
      type,
      category,
      message,
      suggestions,
      timestamp: Date.now(),
      confidence: 0.8
    };
    
    this.insights[type] = this.insights[type] || [];
    this.insights[type].push(insight);
    
    // Keep only last 10 insights per type
    if (this.insights[type].length > 10) {
      this.insights[type].shift();
    }
  }
  
  getAnalyticsSummary() {
    return {
      realTime: this.realTime,
      keyMetrics: {
        averageAttention: this.analytics.engagement.attention.averageFocus,
        clickConsistency: this.analytics.behavioral.interactionPatterns.clickConsistency,
        decisionSpeed: this.analytics.behavioral.interactionPatterns.decisionSpeed,
        playConsistency: this.analytics.behavioral.playPatterns.consistencyScore
      },
      insights: this.insights,
      recommendations: this.insights.recommendations
    };
  }
  
  getPersonalizedInsights() {
    const progress = this.progressTracker.getProgressSummary();
    const personalizedInsights = [];
    
    // Phase-specific insights
    switch (progress.currentPhase) {
      case 'beginner':
        personalizedInsights.push({
          message: 'New player - focus on core mechanics',
          suggestions: ['Emphasize clicking tutorials', 'Guide first assistant purchase']
        });
        break;
      
      case 'intermediate':
        personalizedInsights.push({
          message: 'Developing player - introduce complexity',
          suggestions: ['Show hybrid systems', 'Unlock advanced features']
        });
        break;
      
      case 'advanced':
        personalizedInsights.push({
          message: 'Experienced player - focus on optimization',
          suggestions: ['Provide efficiency metrics', 'Introduce meta-strategies']
        });
        break;
    }
    
    // System preference insights
    const systemUsage = progress.systemUsage;
    const maxUsage = Math.max(systemUsage.active, systemUsage.passive, systemUsage.hybrid);
    
    if (systemUsage.active === maxUsage) {
      personalizedInsights.push({
        message: 'Active system preference detected',
        suggestions: ['Highlight clicking upgrades', 'Show ability synergies']
      });
    } else if (systemUsage.passive === maxUsage) {
      personalizedInsights.push({
        message: 'Passive system preference detected',
        suggestions: ['Emphasize automation benefits', 'Show idle progress']
      });
    }
    
    return personalizedInsights;
  }
  
  loadAnalyticsFromGameState() {
    const gameState = this.gameState;
    
    if (gameState.engagementAnalytics) {
      const saved = gameState.engagementAnalytics;
      this.analytics = { ...this.analytics, ...saved.analytics };
      this.realTime = { ...this.realTime, ...saved.realTime };
      this.insights = { ...this.insights, ...saved.insights };
      
      // console.log('[ENGAGEMENT_ANALYTICS] Loaded existing analytics data');
    }
  }
  
  saveAnalyticsToGameState() {
    const gameState = this.gameState;
    
    gameState.engagementAnalytics = {
      analytics: this.analytics,
      realTime: this.realTime,
      insights: this.insights,
      lastUpdate: Date.now()
    };
    
    gameState.save();
    
    if (this.debugMode) {
      // console.log('[ENGAGEMENT_ANALYTICS] Analytics saved to game state');
    }
  }
  
  setDebugMode(enabled) {
    this.debugMode = enabled;
    // console.log('[ENGAGEMENT_ANALYTICS] Debug mode:', enabled ? 'enabled' : 'disabled');
  }
  
  resetAnalytics() {
    this.analytics = {
      behavioral: { playPatterns: {}, interactionPatterns: {} },
      engagement: { attention: {}, motivation: {}, flow: {} }
    };
    
    this.realTime = {
      currentEngagement: 0.5,
      currentAttention: 0.5,
      currentFlow: 0.5,
      currentFrustration: 0.0,
      currentMotivation: 0.5
    };
    
    this.insights = {
      behavioral: [],
      engagement: [],
      recommendations: []
    };
    
    // console.log('[ENGAGEMENT_ANALYTICS] Analytics reset');
  }

  /**
   * Cleanup engagement analytics timers
   */
  cleanup() {
    const timerManager = window.timerManager;
    if (!timerManager) return 0;
    
    // console.log('[ENGAGEMENT_ANALYTICS] Cleaning up timers...');
    let cleanedCount = 0;
    
    Object.entries(this.timerIds).forEach(([name, timerId]) => {
      if (timerId && timerManager.clearTimer(timerId)) {
        cleanedCount++;
        this.timerIds[name] = null;
      }
    });
    
    // console.log(`[ENGAGEMENT_ANALYTICS] Cleaned up ${cleanedCount} timers`);
    return cleanedCount;
  }
} 