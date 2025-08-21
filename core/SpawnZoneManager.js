/**
 * SpawnZoneManager.js - Spawn Zone Management System
 * 
 * This system manages spawn zones for different game elements to prevent conflicts
 * and ensure proper positioning. It handles:
 * - Crystal snowball spawning zones
 * - Yeti spawning zones  
 * - No-spawn zones (UI elements)
 * - Collision detection between spawn types
 */

/**
 * Spawn Zone Configuration
 */
const SPAWN_ZONE_CONFIG = {
  // No-spawn zones (UI elements that should not be covered)
  noSpawnZones: {
    snowman: {
      name: 'Snowman',
      priority: 100, // Highest priority - never spawn on this
      description: 'Main click target',
      radius: 85 // Extended radius to prevent crystal spawns under yeti
    },
    travelButton: {
      name: 'Travel Button',
      priority: 95,
      description: 'Travel button in left column'
    },
    leftColumnButton: {
      name: 'Left Column Button',
      priority: 90,
      description: 'Future button in left column'
    },
    rightColumn: {
      name: 'Right Column',
      priority: 80,
      description: 'Upgrades and assistants area'
    },
    miniWallet: {
      name: 'Mini Wallet',
      priority: 70,
      description: 'Top of middle column wallet display'
    },
    centralNotificationPanel: {
      name: 'Central Notification Panel',
      priority: 85,
      description: 'Central notification panel for lore/achievements'
    },
    concordActivityPanel: {
      name: 'Concord Activity Panel',
      priority: 75,
      description: 'Bottom activity panel for yetis/travel/battles'
    }
  },

  // Crystal snowball spawn zones
  crystalZones: {
    middleLeft: {
      name: 'Middle Left',
      description: 'Left side of middle column, away from snowman'
    },
    middleRight: {
      name: 'Middle Right', 
      description: 'Right side of middle column, away from snowman'
    },
    leftColumn: {
      name: 'Left Column',
      description: 'Left column area (below travel button)'
    },
    leftColumnTop: {
      name: 'Left Column Top',
      description: 'Top area of left column (above travel button)'
    }
  },

  // Yeti spawn zones
  yetiZones: {
    top: {
      name: 'Top',
      description: 'Above the snowman'
    },
    bottom: {
      name: 'Bottom',
      description: 'Below the snowman'
    }
  }
};

/**
 * Spawn Zone Manager
 */
export class SpawnZoneManager {
  constructor() {
    this.container = null;
    this.zones = new Map();
    this.activeSpawns = new Map(); // id -> spawn data
    
    // console.log('[SPAWN_ZONE] Spawn Zone Manager initialized');
  }

  /**
   * Initialize the spawn zone manager
   */
  initialize(container) {
    this.container = container;
    this.calculateZones();
    // console.log('[SPAWN_ZONE] Zones calculated for container:', container);
  }

  /**
   * Calculate all spawn zones based on container dimensions
   */
  calculateZones() {
    if (!this.container) {
      // console.warn('[SPAWN_ZONE] No container available for zone calculation');
      return;
    }

    const rect = this.container.getBoundingClientRect();
    const containerWidth = rect.width;
    const containerHeight = rect.height;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    // Clear existing zones
    this.zones.clear();

    // Calculate no-spawn zones
    this.zones.set('snowman', {
      x: centerX - 85, // Extended radius (85px instead of 75px) to prevent crystal spawns under yeti
      y: centerY - 85,
      width: 170,
      height: 170,
      type: 'noSpawn',
      priority: 100,
      name: 'Snowman'
    });

    // Central notification panel zone (top of middle column)
    this.zones.set('centralNotificationPanel', {
      x: 0,
      y: 0,
      width: containerWidth,
      height: 120, // Notification panel height
      type: 'noSpawn',
      priority: 85,
      name: 'Central Notification Panel'
    });

    // Mini wallet zone (below notification panel)
    this.zones.set('miniWallet', {
      x: 0,
      y: 120, // Below notification panel
      width: containerWidth,
      height: 80, // Approximate mini wallet height
      type: 'noSpawn',
      priority: 70,
      name: 'Mini Wallet'
    });

    // Travel button zone (left column)
    this.zones.set('travelButton', {
      x: 0,
      y: 0,
      width: 200,
      height: 60, // Travel button height
      type: 'noSpawn',
      priority: 95,
      name: 'Travel Button'
    });

    // Left column button zone (future)
    this.zones.set('leftColumnButton', {
      x: 0,
      y: 60, // Below travel button
      width: 200,
      height: 50,
      type: 'noSpawn',
      priority: 90,
      name: 'Left Column Button'
    });

    // Concord activity panel zone (bottom of middle column)
    this.zones.set('concordActivityPanel', {
      x: 0,
      y: containerHeight - 100, // Bottom 100px
      width: containerWidth,
      height: 100,
      type: 'noSpawn',
      priority: 75,
      name: 'Concord Activity Panel'
    });

    // Right column zone (approximate)
    const rightColumnWidth = containerWidth * 0.3; // Assuming 30% width
    this.zones.set('rightColumn', {
      x: containerWidth - rightColumnWidth,
      y: 0,
      width: rightColumnWidth,
      height: containerHeight,
      type: 'noSpawn',
      priority: 80,
      name: 'Right Column'
    });

    // Crystal snowball zones
    const crystalZoneWidth = 120; // Width of crystal spawn area
    const crystalZoneHeight = 120; // Height of crystal spawn area

    // Middle left zone
    this.zones.set('crystalMiddleLeft', {
      x: 20,
      y: centerY - crystalZoneHeight / 2,
      width: crystalZoneWidth,
      height: crystalZoneHeight,
      type: 'crystal',
      name: 'Middle Left'
    });

    // Middle right zone
    this.zones.set('crystalMiddleRight', {
      x: containerWidth - crystalZoneWidth - 20,
      y: centerY - crystalZoneHeight / 2,
      width: crystalZoneWidth,
      height: crystalZoneHeight,
      type: 'crystal',
      name: 'Middle Right'
    });

    // Left column crystal zones
    this.zones.set('crystalLeftColumn', {
      x: 20,
      y: 120, // Below travel button area
      width: 160, // Left column width minus margins
      height: containerHeight - 140, // Below buttons, above bottom
      type: 'crystal',
      name: 'Left Column'
    });

    // Left column top crystal zone (above travel button)
    this.zones.set('crystalLeftColumnTop', {
      x: 20,
      y: 20, // Above travel button
      width: 160, // Left column width minus margins
      height: 80, // Space above travel button
      type: 'crystal',
      name: 'Left Column Top'
    });

    // Yeti zones
    const yetiZoneWidth = 200;
    const yetiZoneHeight = 100;

    // Top yeti zone
    this.zones.set('yetiTop', {
      x: centerX - yetiZoneWidth / 2,
      y: 100, // Below mini wallet
      width: yetiZoneWidth,
      height: yetiZoneHeight,
      type: 'yeti',
      name: 'Top'
    });

    // Bottom yeti zone
    this.zones.set('yetiBottom', {
      x: centerX - yetiZoneWidth / 2,
      y: centerY + 100, // Below snowman
      width: yetiZoneWidth,
      height: yetiZoneHeight,
      type: 'yeti',
      name: 'Bottom'
    });

    // console.log('[SPAWN_ZONE] Calculated zones:', Array.from(this.zones.keys()));
  }

  /**
   * Get a random position within a specific zone
   * @param {string} zoneName - Name of the zone to spawn in
   * @param {number} spawnWidth - Width of the spawn element
   * @param {number} spawnHeight - Height of the spawn element
   * @returns {Object|null} Position object with x, y coordinates or null if no valid position
   */
  getRandomPositionInZone(zoneName, spawnWidth = 60, spawnHeight = 60) {
    const zone = this.zones.get(zoneName);
    if (!zone) {
      // console.warn(`[SPAWN_ZONE] Zone not found: ${zoneName}`);
      return null;
    }

    // Check if zone is large enough for the spawn
    if (zone.width < spawnWidth || zone.height < spawnHeight) {
      // console.warn(`[SPAWN_ZONE] Zone ${zoneName} too small for spawn size ${spawnWidth}x${spawnHeight}`);
      return null;
    }

    const maxX = zone.width - spawnWidth;
    const maxY = zone.height - spawnHeight;

    if (maxX < 0 || maxY < 0) {
      // console.warn(`[SPAWN_ZONE] Zone ${zoneName} too small for spawn size ${spawnWidth}x${spawnHeight}`);
      return null;
    }

    const x = zone.x + Math.random() * maxX;
    const y = zone.y + Math.random() * maxY;

    return { x, y, zone: zoneName };
  }

  /**
   * Get a random position in any zone of a specific type
   * @param {string} zoneType - Type of zone ('crystal', 'yeti', etc.)
   * @param {number} spawnWidth - Width of the spawn element
   * @param {number} spawnHeight - Height of the spawn element
   * @returns {Object|null} Position object with x, y coordinates or null if no valid position
   */
  getRandomPositionInZoneType(zoneType, spawnWidth = 60, spawnHeight = 60) {
    const zonesOfType = Array.from(this.zones.entries())
      .filter(([name, zone]) => zone.type === zoneType)
      .map(([name, zone]) => name);

    if (zonesOfType.length === 0) {
      // console.warn(`[SPAWN_ZONE] No zones found for type: ${zoneType}`);
      return null;
    }

    // Try each zone until we find a valid position
    for (const zoneName of zonesOfType) {
      const position = this.getRandomPositionInZone(zoneName, spawnWidth, spawnHeight);
      if (position) {
        return position;
      }
    }

    // console.warn(`[SPAWN_ZONE] No valid position found in any ${zoneType} zone`);
    return null;
  }

  /**
   * Check if a position conflicts with any no-spawn zones
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width of the element
   * @param {number} height - Height of the element
   * @returns {boolean} True if there's a conflict
   */
  checkNoSpawnConflict(x, y, width, height) {
    for (const [zoneName, zone] of this.zones.entries()) {
      if (zone.type === 'noSpawn') {
        const conflict = (
          x < zone.x + zone.width &&
          x + width > zone.x &&
          y < zone.y + zone.height &&
          y + height > zone.y
        );
        
        if (conflict) {
          // console.log(`[SPAWN_ZONE] Conflict detected with ${zone.name} zone`);
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if a position conflicts with existing spawns
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width of the element
   * @param {number} height - Height of the element
   * @param {string} excludeId - ID of spawn to exclude from check
   * @returns {boolean} True if there's a conflict
   */
  checkSpawnConflict(x, y, width, height, excludeId = null) {
    for (const [spawnId, spawn] of this.activeSpawns.entries()) {
      if (excludeId && spawnId === excludeId) continue;
      
      const conflict = (
        x < spawn.x + spawn.width &&
        x + width > spawn.x &&
        y < spawn.y + spawn.height &&
        y + height > spawn.y
      );
      
      if (conflict) {
        // console.log(`[SPAWN_ZONE] Conflict detected with existing spawn: ${spawnId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Register a spawn to track for collision detection
   * @param {string} spawnId - Unique ID for the spawn
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width of the spawn
   * @param {number} height - Height of the spawn
   * @param {string} type - Type of spawn ('crystal', 'yeti', etc.)
   */
  registerSpawn(spawnId, x, y, width, height, type) {
    this.activeSpawns.set(spawnId, {
      x, y, width, height, type,
      registeredAt: Date.now()
    });
    // console.log(`[SPAWN_ZONE] Registered spawn: ${spawnId} (${type}) at (${x}, ${y})`);
  }

  /**
   * Unregister a spawn
   * @param {string} spawnId - ID of the spawn to unregister
   */
  unregisterSpawn(spawnId) {
    if (this.activeSpawns.has(spawnId)) {
      this.activeSpawns.delete(spawnId);
      // console.log(`[SPAWN_ZONE] Unregistered spawn: ${spawnId}`);
    }
  }

  /**
   * Get all zones of a specific type
   * @param {string} zoneType - Type of zones to return
   * @returns {Array} Array of zone objects
   */
  getZonesByType(zoneType) {
    return Array.from(this.zones.values())
      .filter(zone => zone.type === zoneType);
  }

  /**
   * Get zone information
   * @param {string} zoneName - Name of the zone
   * @returns {Object|null} Zone object or null if not found
   */
  getZone(zoneName) {
    return this.zones.get(zoneName) || null;
  }

  /**
   * Get all zones
   * @returns {Map} Map of all zones
   */
  getAllZones() {
    return new Map(this.zones);
  }

  /**
   * Get active spawns
   * @returns {Map} Map of all active spawns
   */
  getActiveSpawns() {
    return new Map(this.activeSpawns);
  }

  /**
   * Clean up expired spawns (older than maxAge)
   * @param {number} maxAge - Maximum age in milliseconds
   */
  cleanupExpiredSpawns(maxAge = 30000) { // 30 seconds default
    const now = Date.now();
    for (const [spawnId, spawn] of this.activeSpawns.entries()) {
      if (now - spawn.registeredAt > maxAge) {
        this.unregisterSpawn(spawnId);
      }
    }
  }

  /**
   * Get debug information
   * @returns {Object} Debug information about zones and spawns
   */
  getDebugInfo() {
    return {
      zones: Array.from(this.zones.entries()).map(([name, zone]) => ({
        name,
        type: zone.type,
        x: zone.x,
        y: zone.y,
        width: zone.width,
        height: zone.height
      })),
      activeSpawns: Array.from(this.activeSpawns.entries()).map(([id, spawn]) => ({
        id,
        type: spawn.type,
        x: spawn.x,
        y: spawn.y,
        width: spawn.width,
        height: spawn.height,
        age: Date.now() - spawn.registeredAt
      })),
      container: this.container ? {
        width: this.container.offsetWidth,
        height: this.container.offsetHeight
      } : null
    };
  }
}

// Export configuration for external use
export { SPAWN_ZONE_CONFIG }; 