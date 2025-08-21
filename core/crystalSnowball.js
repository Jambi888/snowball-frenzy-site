/**
 * crystalSnowball.js - Crystal Snowball System
 * 
 * This system spawns temporary crystal snowballs that provide SPS boosts when clicked.
 * Features:
 * - Configurable spawn timing with normal distribution
 * - Multiple boost types with different probabilities
 * - Visual representation with blue circles
 * - Integration with existing SPS calculation
 * - Stacking boost system
 * - Spawn zone management for conflict prevention
 */

// Configuration
const CRYSTAL_SNOWBALL_CONFIG = {
  // Spawn timing (in seconds)
  spawnInterval: 240, // Average 20 seconds
  spawnStandardDeviation: 60, // ±1 minute for normal distribution
  
  // Snowball lifetime (in seconds)
  snowballLifetime: 10, // Change to 5 seconds for final
  
  // Boost types with probabilities
  boostTypes: [
    {
      id: 'common',
      name: 'Common Boost',
      multiplier: 2,
      duration: 100, // seconds
      probability: 0.60 // 60%
    },
    {
      id: 'rare',
      name: 'Rare Boost', 
      multiplier: 50,
      duration: 10, // seconds
      probability: 0.10 // 10%
    },
    {
      id: 'uncommon',
      name: 'Uncommon Boost',
      multiplier: 10,
      duration: 25, // seconds
      probability: 0.30 // 30%
    }
  ]
};

/**
 * Crystal Snowball Manager
 */
export class CrystalSnowballManager {
  constructor(game) {
    this.game = game;
    
    // Active crystal snowballs
    this.activeSnowballs = new Map(); // id -> snowball data
    
    // Active boosts
    this.activeBoosts = new Map(); // boostId -> boost data
    
    // Spawn timing
    this.nextSpawnTime = this.calculateNextSpawnTime();
    
    // Visual elements
    this.container = null;
    this.overlay = null;
    
    // Spawn zone management
    this.spawnZoneManager = null;
    
    // Initialize
    this.initialize();
    
    // console.log('[CRYSTAL_SNOWBALL] Crystal Snowball Manager initialized');
  }
  
  /**
   * Initialize the system
   */
  initialize() {
    // Set up container for visual elements
    this.setupVisualContainer();
    
    // Initialize spawn zone manager
    this.initializeSpawnZoneManager();
    
    // Start spawn timer
    this.scheduleNextSpawn();
  }
  
  /**
   * Set up visual container for crystal snowballs
   */
  setupVisualContainer() {
    // Find the spawn area in GameReadyUIManager
    this.container = document.getElementById('spawn-area') ||
                   document.querySelector('.spawn-area') ||
                   document.querySelector('.left-column') || 
                   document.getElementById('clicker-panel') ||
                   document.querySelector('[id*="click"]');
    
    if (!this.container) {
      // console.warn('[CRYSTAL_SNOWBALL] Could not find spawn container');
      return;
    }
    
    // Make container relative for absolute positioning if it's not already
    if (this.container.style.position !== 'absolute') {
      this.container.style.position = 'relative';
    }
    
    // Create overlay for boost effect
    this.overlay = document.createElement('div');
    this.overlay.id = 'crystal-snowball-overlay';
    this.overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(33, 150, 243, 0.1);
      pointer-events: none;
      z-index: 10;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    
    this.container.appendChild(this.overlay);
  }

  /**
   * Initialize spawn zone manager
   */
  initializeSpawnZoneManager() {
    try {
      // Import SpawnZoneManager
      import('./SpawnZoneManager.js').then(({ SpawnZoneManager }) => {
        this.spawnZoneManager = new SpawnZoneManager();
        
        // Find the middle column container for zone calculation
        const middleColumn = document.querySelector('.middle-column') ||
                           document.getElementById('middle-column') ||
                           this.container.parentElement;
        
        if (middleColumn) {
          this.spawnZoneManager.initialize(middleColumn);
          // console.log('[CRYSTAL_SNOWBALL] Spawn zone manager initialized');
        } else {
          // console.warn('[CRYSTAL_SNOWBALL] Could not find middle column for spawn zone manager');
        }
      }).catch(error => {
        // console.warn('[CRYSTAL_SNOWBALL] Could not load spawn zone manager:', error);
      });
    } catch (error) {
      // console.warn('[CRYSTAL_SNOWBALL] Error initializing spawn zone manager:', error);
    }
  }
  
  /**
   * Calculate next spawn time using normal distribution
   */
  calculateNextSpawnTime() {
    const now = Date.now();
    const mean = CRYSTAL_SNOWBALL_CONFIG.spawnInterval * 1000; // Convert to milliseconds
    const stdDev = CRYSTAL_SNOWBALL_CONFIG.spawnStandardDeviation * 1000;
    
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    const spawnDelay = mean + (z0 * stdDev);
    
    // Ensure minimum 30 seconds between spawns
    return now + Math.max(spawnDelay, 30000);
  }
  
  /**
   * Schedule the next crystal snowball spawn
   */
  scheduleNextSpawn() {
    const now = Date.now();
    const timeUntilSpawn = this.nextSpawnTime - now;
    
    if (timeUntilSpawn <= 0) {
      this.spawnCrystalSnowball();
    } else {
      setTimeout(() => {
        this.spawnCrystalSnowball();
      }, timeUntilSpawn);
    }
  }
  
  /**
   * Spawn a new crystal snowball
   */
  spawnCrystalSnowball() {
    if (!this.container) {
      // console.warn('[CRYSTAL_SNOWBALL] No container available for spawning');
      return;
    }
    
    const snowballId = `crystal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Create visual element
    const snowballElement = document.createElement('div');
    snowballElement.id = snowballId;
    snowballElement.className = 'crystal-snowball';
    snowballElement.style.cssText = `
      position: absolute;
      width: 60px;
      height: 60px;
      background: url('./ui/images/crystalSnowball.png') center center;
      background-size: contain;
      background-repeat: no-repeat;
      cursor: pointer;
      z-index: 25;
      pointer-events: auto;
      box-shadow: 0 0 20px rgba(33, 150, 243, 0.6);
      transition: all 0.2s ease;
      animation: crystalPulse 2s infinite;
    `;
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes crystalPulse {
        0%, 100% { 
          transform: scale(1); 
          box-shadow: 0 0 20px rgba(33, 150, 243, 0.6); 
        }
        50% { 
          transform: scale(1.1); 
          box-shadow: 0 0 30px rgba(33, 150, 243, 0.8); 
        }
      }
      @keyframes crystalWarning {
        0%, 100% { 
          transform: scale(1);
          box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
          filter: brightness(1.2) hue-rotate(0deg);
        }
        50% { 
          transform: scale(1.2);
          box-shadow: 0 0 40px rgba(239, 68, 68, 1);
          filter: brightness(1.5) hue-rotate(30deg);
        }
      }
    `;
    document.head.appendChild(style);
    
    // Use spawn zone manager for positioning
    let x, y;
    let zoneName = 'unknown';
    
    if (this.spawnZoneManager) {
      // Try to get position from crystal zones
      const position = this.spawnZoneManager.getRandomPositionInZoneType('crystal', 60, 60);
      if (position) {
        x = position.x;
        y = position.y;
        zoneName = position.zone;
      } else {
        // Fallback to random positioning
        const containerRect = this.container.getBoundingClientRect();
        x = Math.random() * (containerRect.width - 60);
        y = Math.random() * (containerRect.height - 60);
        // console.warn('[CRYSTAL_SNOWBALL] Using fallback positioning - no valid crystal zones found');
      }
    } else {
      // Fallback to random positioning if spawn zone manager not available
      const containerRect = this.container.getBoundingClientRect();
      x = Math.random() * (containerRect.width - 60);
      y = Math.random() * (containerRect.height - 60);
      // console.warn('[CRYSTAL_SNOWBALL] Using fallback positioning - spawn zone manager not available');
    }
    
    snowballElement.style.left = `${x}px`;
    snowballElement.style.top = `${y}px`;
    
    // Add click handler
    snowballElement.addEventListener('click', () => {
      this.handleCrystalSnowballClick(snowballId);
    });
    
    // Add hover effects
    snowballElement.addEventListener('mouseenter', () => {
      snowballElement.style.transform = 'scale(1.2)';
      snowballElement.style.boxShadow = '0 0 40px rgba(33, 150, 243, 0.9)';
    });
    
    snowballElement.addEventListener('mouseleave', () => {
      snowballElement.style.transform = 'scale(1)';
      snowballElement.style.boxShadow = '0 0 20px rgba(33, 150, 243, 0.6)';
    });
    
    // Add to container
    this.container.appendChild(snowballElement);
    
    // Store snowball data
    this.activeSnowballs.set(snowballId, {
      element: snowballElement,
      spawnTime: Date.now(),
      lifetime: CRYSTAL_SNOWBALL_CONFIG.snowballLifetime * 1000,
      zone: zoneName
    });

    // Register spawn with zone manager for collision detection
    if (this.spawnZoneManager) {
      this.spawnZoneManager.registerSpawn(snowballId, x, y, 60, 60, 'crystal');
    }
    
    // Add warning flash at 1/3 time remaining (about 3.33 seconds before despawn)
    const warningTime = CRYSTAL_SNOWBALL_CONFIG.snowballLifetime * 1000 * 0.67; // 67% of lifetime
    setTimeout(() => {
      if (this.activeSnowballs.has(snowballId)) {
        snowballElement.style.animation = 'crystalWarning 0.5s ease-in-out infinite';
        // console.log(`[CRYSTAL_SNOWBALL] Warning flash activated for ${snowballId}`);
      }
    }, warningTime);
    
    // Schedule removal
    setTimeout(() => {
      this.removeCrystalSnowball(snowballId);
    }, CRYSTAL_SNOWBALL_CONFIG.snowballLifetime * 1000);
    
    // console.log(`[CRYSTAL_SNOWBALL] Spawned crystal snowball: ${snowballId} at ${x}, ${y} in zone: ${zoneName}`);
    
    // Schedule next spawn
    this.nextSpawnTime = this.calculateNextSpawnTime();
    this.scheduleNextSpawn();
  }
  
  /**
   * Handle crystal snowball click
   */
  handleCrystalSnowballClick(snowballId) {
    const snowball = this.activeSnowballs.get(snowballId);
    if (!snowball) return;
    
    // Get click position for feedback
    const rect = snowball.element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Remove the snowball immediately
    this.removeCrystalSnowball(snowballId);
    
    // Select boost type based on probabilities
    const boostType = this.selectBoostType();
    
    // Apply the boost
    this.applyBoost(boostType);
    
    // Show visual feedback
    this.showBoostEffect(boostType);
    
    // Show click feedback if UI manager is available
    if (this.game && this.game.uiManager && this.game.uiManager.showClickFeedback) {
      this.game.uiManager.showClickFeedback(x, y, 'BOOST!');
    }
    
    // Emit crystalSnowballCollected event for achievement system
    if (window.eventBus) {
      window.eventBus.emit('crystalSnowballCollected', {
        boostType: boostType.name,
        multiplier: boostType.multiplier
      });
    }
    
    // console.log(`[CRYSTAL_SNOWBALL] Crystal snowball clicked! Applied ${boostType.name} (${boostType.multiplier}x for ${boostType.duration}s)`);
  }
  
  /**
   * Select boost type based on probabilities
   */
  selectBoostType() {
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const boostType of CRYSTAL_SNOWBALL_CONFIG.boostTypes) {
      cumulativeProbability += boostType.probability;
      if (rand <= cumulativeProbability) {
        return boostType;
      }
    }
    
    // Fallback to common boost
    return CRYSTAL_SNOWBALL_CONFIG.boostTypes[0];
  }
  
  /**
   * Apply boost to the game
   */
  applyBoost(boostType) {
    const boostId = `crystal-${boostType.id}-${Date.now()}`;
    const startTime = Date.now();
    const endTime = startTime + (boostType.duration * 1000);
    
    // Store boost data
    this.activeBoosts.set(boostId, {
      type: boostType,
      startTime: startTime,
      endTime: endTime,
      multiplier: boostType.multiplier
    });
    
    // Update overlay to show active boost
    this.updateOverlay();
    
    // Schedule boost removal
    setTimeout(() => {
      this.removeBoost(boostId);
    }, boostType.duration * 1000);
    
    // Mark SPS as dirty to trigger recalculation
    if (window.markSPSDirty) {
      window.markSPSDirty();
    }
  }
  
  /**
   * Remove boost
   */
  removeBoost(boostId) {
    this.activeBoosts.delete(boostId);
    
    // Update overlay based on remaining boosts
    this.updateOverlay();
    
    // Mark SPS as dirty to trigger recalculation
    if (window.markSPSDirty) {
      window.markSPSDirty();
    }
    
    // console.log(`[CRYSTAL_SNOWBALL] Boost expired: ${boostId}`);
  }
  
  /**
   * Get current crystal snowball multiplier
   */
  getCrystalSnowballMultiplier() {
    if (this.activeBoosts.size === 0) {
      return 1;
    }
    
    // Multiply all active boosts together
    let totalMultiplier = 1;
    for (const boost of this.activeBoosts.values()) {
      totalMultiplier *= boost.multiplier;
    }
    
    return totalMultiplier;
  }
  
  /**
   * Show visual boost effect
   */
  showBoostEffect(boostType) {
    if (!this.overlay) return;
    
    // Show overlay with different colors based on boost type
    let overlayColor = 'rgba(33, 150, 243, 0.1)'; // Default blue
    
           switch (boostType.id) {
         case 'rare':
           overlayColor = 'rgba(156, 39, 176, 0.15)'; // Purple for rare
           break;
         case 'uncommon':
           overlayColor = 'rgba(76, 175, 80, 0.12)'; // Green for uncommon
           break;
         default:
           overlayColor = 'rgba(255, 193, 7, 0.2)'; // Sunflower/orange for common
       }
    
    this.overlay.style.background = overlayColor;
    this.overlay.style.opacity = '1';
    
    // Hide overlay after 2 seconds
    setTimeout(() => {
      this.overlay.style.opacity = '0';
    }, 2000);
  }

  /**
   * Update overlay based on active boosts
   */
  updateOverlay() {
    if (!this.overlay) return;
    
    if (this.activeBoosts.size === 0) {
      // No active boosts, hide overlay
      this.overlay.style.opacity = '0';
      return;
    }
    
    // Find the highest priority boost for overlay color
    let highestPriorityBoost = null;
    for (const boost of this.activeBoosts.values()) {
      if (!highestPriorityBoost || boost.type.multiplier > highestPriorityBoost.type.multiplier) {
        highestPriorityBoost = boost;
      }
    }
    
    if (highestPriorityBoost) {
      let overlayColor = 'rgba(33, 150, 243, 0.1)'; // Default blue
      
             switch (highestPriorityBoost.type.id) {
         case 'rare':
           overlayColor = 'rgba(156, 39, 176, 0.15)'; // Purple for rare
           break;
         case 'uncommon':
           overlayColor = 'rgba(76, 175, 80, 0.12)'; // Green for uncommon
           break;
         default:
           overlayColor = 'rgba(255, 193, 7, 0.2)'; // Sunflower/orange for common
       }
      
      this.overlay.style.background = overlayColor;
      this.overlay.style.opacity = '1';
    }
  }
  
  /**
   * Remove crystal snowball
   */
  removeCrystalSnowball(snowballId) {
    const snowball = this.activeSnowballs.get(snowballId);
    if (!snowball) return;
    
    // Remove visual element
    if (snowball.element && snowball.element.parentNode) {
      snowball.element.parentNode.removeChild(snowball.element);
    }
    
    // Unregister from zone manager
    if (this.spawnZoneManager) {
      this.spawnZoneManager.unregisterSpawn(snowballId);
    }
    
    // Remove from active snowballs
    this.activeSnowballs.delete(snowballId);
    
    // console.log(`[CRYSTAL_SNOWBALL] Removed crystal snowball: ${snowballId}`);
  }
  
  /**
   * Update the system (called from game loop)
   */
  update() {
    // Clean up expired snowballs
    const now = Date.now();
    for (const [snowballId, snowball] of this.activeSnowballs.entries()) {
      if (now - snowball.spawnTime > snowball.lifetime) {
        this.removeCrystalSnowball(snowballId);
      }
    }
    
    // Clean up expired boosts
    for (const [boostId, boost] of this.activeBoosts.entries()) {
      if (now > boost.endTime) {
        this.removeBoost(boostId);
      }
    }
    
    // Clean up expired spawns in zone manager
    if (this.spawnZoneManager) {
      this.spawnZoneManager.cleanupExpiredSpawns();
    }
    
    // Update overlay to ensure consistency
    this.updateOverlay();
  }
  
  /**
   * Get system statistics
   */
  getStats() {
    return {
      activeSnowballs: this.activeSnowballs.size,
      activeBoosts: this.activeBoosts.size,
      nextSpawnTime: this.nextSpawnTime,
      totalMultiplier: this.getCrystalSnowballMultiplier()
    };
  }
}

// Export configuration for external use
export { CRYSTAL_SNOWBALL_CONFIG }; 