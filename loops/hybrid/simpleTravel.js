/**
 * Simple Travel System
 * 
 * This replaces the complex travel system with a simple approach:
 * - Check if travel is unlocked via simple activity counter
 * - Select random location when travel button is clicked
 * - Apply location effects
 * - Reset activity counter after travel
 */

import { eventBus } from '../../core/eventBus.js';
import { LOCATION, LOCATION_PASSIVE_EFFECT } from './data/locationData.js';
import { markSPSDirty } from '../passive/unifiedUpgrades.js';

/**
 * Simple travel system state
 */
let travelSystem = {
  initialized: false,
  currentLocationBuff: null
};

/**
 * Initialize the simple travel system
 */
export function initializeSimpleTravel() {
  if (travelSystem.initialized) return;
  
  // console.log('[TRAVEL] Simple Travel System initializing...');
  
  // Set up event listeners
  setupTravelEventListeners();
  
  // Make functions available globally
  window.onTravelButtonClick = onTravelButtonClick;
  window.getCurrentLocationBuff = getCurrentLocationBuff;
  window.getLocationBuffRemainingTime = getLocationBuffRemainingTime;
  window.resetTravelButton = resetTravelButton;
  window.updateTravelSystemStatus = updateTravelSystemStatus;
  window.debugTravelSystemStatus = debugTravelSystemStatus;
  
  // Wait for UI to be ready before checking status
  setTimeout(() => {
    checkAndUpdateTravelSystemStatus();
  }, 100);
  
  travelSystem.initialized = true;
  // console.log('[TRAVEL] Simple Travel System initialized');
}

/**
 * Set up event listeners
 */
function setupTravelEventListeners() {
  // Listen for travel unlock events from activity counter
  if (window.eventBus) {
    window.eventBus.on('travelUnlocked', (data) => {
      // console.log('[TRAVEL] Travel unlocked!', data);
      updateTravelButton();
    }, 'SimpleTravel');
    
    // Listen for travel system unlock events from snowflake upgrades
    window.eventBus.on('travelSystemUnlocked', (data) => {
      // console.log('[TRAVEL] Travel system unlocked via snowflake upgrade!', data);
      showTravelSystemActive();
      updateTravelButton();
    }, 'SimpleTravel');
  }
}

/**
 * Handle travel button click
 */
function onTravelButtonClick() {
  // console.log('[TRAVEL] Travel button clicked!');
  
  // Check if travel system is unlocked via snowflake upgrade
  if (!window.game || !window.game.travelActive) {
    // console.log('[TRAVEL] Travel system is disabled - unlock required in Snowflake Marketplace');
    return;
  }
  
  // Check if travel is unlocked via activity counter
  if (!window.getActivityStatus || !window.getActivityStatus().unlocked) {
    // console.log('[TRAVEL] Travel not unlocked yet');
    return;
  }
  
  // Select random location
  const location = selectRandomLocation();
  if (!location) {
    // console.error('[TRAVEL] Failed to select location');
    return;
  }
  
  // Activate location buff
  const success = activateLocationBuff(location);
  if (success) {
    // console.log(`[TRAVEL] Traveled to ${location.name} (${location.class})`);
    
    // Reset activity counter to lock travel again
    if (window.resetActivityCounter) {
      window.resetActivityCounter();
    }
    
    // Update travel button
    updateTravelButton();
  }
}

/**
 * Select a random location
 */
function selectRandomLocation() {
  const locations = LOCATION.locations;
  if (locations.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * locations.length);
  return locations[randomIndex];
}

/**
 * Activate location buff
 */
function activateLocationBuff(locationData) {
  if (!locationData) return false;
  
  // Create buff object
  const buff = {
    locationId: locationData.id,
    class: locationData.class,
    name: locationData.name,
    description: locationData.description,
    colorTheme: locationData.colorTheme,
    startTime: Date.now(),
    duration: 60000, // 60 seconds
    passiveBonus: LOCATION_PASSIVE_EFFECT[locationData.class]
  };
  
  // Store buff
  travelSystem.currentLocationBuff = buff;
  
  // Apply location effects
  applyLocationEffects(locationData.class);
  
  // Emit events for UI updates
  if (window.eventBus) {
    // Emit travel unlocked event
    window.eventBus.emit('travelUnlocked', {
      locationId: locationData.id,
      locationClass: locationData.class,
      locationName: locationData.name
    });
    
    // Emit travel initiated event for battle system
    window.eventBus.emit('travelInitiated', {
      locationId: locationData.id,
      locationClass: locationData.class,
      locationName: locationData.name,
      momentum: 15, // Simulated momentum gain
      averageMomentum: 15 // Simulated average momentum
    });
    
    // Emit travel complete event for Concord panel
    window.eventBus.emit('travelComplete', {
      location: locationData,
      momentum: 15, // Simulated momentum gain
      duration: '60 seconds'
    });
  }
  
  // Set timer to remove buff
  setTimeout(() => {
    removeLocationBuff();
  }, 60000);
  
  return true;
}

/**
 * Apply location effects
 */
function applyLocationEffects(locationClass) {
  const effect = LOCATION_PASSIVE_EFFECT[locationClass];
  if (!effect) return;
  
  // console.log(`[TRAVEL] Applying ${locationClass} location effect`);
  
  // Apply effects based on class
  switch (locationClass) {
    case 'Harvester':
      // Global upgrade discount
      if (window.game) {
        window.game.travelDiscountGlobalUpgrades = 1 - LOCATION_PASSIVE_EFFECT.Harvester.value; // 50% discount
      }
      break;
      
    case 'Defender':
      // Assistant discount
      if (window.game) {
        window.game.travelDiscountAssistants = 1 - LOCATION_PASSIVE_EFFECT.Defender.value; // 50% discount
      }
      break;
      
    case 'Traveler':
      // SPS multiplier
      if (window.game) {
        window.game.travelSPSMultiplier = 1 + LOCATION_PASSIVE_EFFECT.Traveler.value; // 5x multiplier
        markSPSDirty();
      }
      break;
      
    case 'Scholar':
      // Crystal snowball spawn
      if (window.game && window.game.crystalSnowballManager) {
        window.game.crystalSnowballManager.spawnCrystalSnowball();
      }
      break;
  }
}

/**
 * Remove location buff
 */
function removeLocationBuff() {
  if (!travelSystem.currentLocationBuff) return;
  
  const buff = travelSystem.currentLocationBuff;
  // console.log(`[TRAVEL] Location buff expired: ${buff.name}`);
  
  // Remove effects
  if (window.game) {
    window.game.travelDiscountGlobalUpgrades = 1;
    window.game.travelDiscountAssistants = 1;
    window.game.travelSPSMultiplier = 1;
    markSPSDirty();
  }
  
  // Clear buff
  travelSystem.currentLocationBuff = null;
  
  // Emit event
  if (window.eventBus) {
    window.eventBus.emit('locationBuffExpired', {
      locationId: buff.locationId,
      locationClass: buff.class,
      locationName: buff.name
    });
  }
}

/**
 * Get current location buff
 */
function getCurrentLocationBuff() {
  return travelSystem.currentLocationBuff;
}

/**
 * Get location buff remaining time
 */
function getLocationBuffRemainingTime() {
  if (!travelSystem.currentLocationBuff) return 0;
  
  const elapsed = Date.now() - travelSystem.currentLocationBuff.startTime;
  const remaining = Math.max(0, Math.ceil((60000 - elapsed) / 1000));
  
  return remaining;
}

/**
 * Update travel button based on current status
 */
function updateTravelButton() {
  const travelButton = document.getElementById('travel-button');
  if (!travelButton) return;
  
  // Check if our simple system controls this button
  if (travelButton.getAttribute('data-simple-activity-controlled') === 'true') {
    // Our system controls this - don't override
    return;
  }
  
  const status = window.getActivityStatus ? window.getActivityStatus() : { unlocked: false };
  
  if (status.unlocked) {
    travelButton.classList.remove('disabled');
    travelButton.disabled = false;
    travelButton.textContent = 'Travel';
    travelButton.title = 'Click to travel to a new location!';
  } else {
    travelButton.classList.add('disabled');
    travelButton.disabled = true;
    travelButton.textContent = 'Increase activity';
    travelButton.title = `Current progress: ${status.counter || 0}/${status.threshold || 50} - Stay active to unlock travel!`;
  }
}

/**
 * Show travel system locked message
 */
function showTravelSystemLocked() {
  const travelContainer = document.getElementById('travel-container');
  // console.log('[TRAVEL] showTravelSystemLocked called, travelContainer:', travelContainer);
  
  if (!travelContainer) {
    // console.log('[TRAVEL] Travel container not found - cannot show locked message');
    return;
  }
  
  // Show the locked message
  const lockedMessage = `
    <div class="travel-status travel-disabled" data-travel-locked="true">
      <div class="travel-locked-message">
        <h3>Drift Travel</h3>
        <p>This feature is currently locked.</p>
        <p><strong>Unlock in Snowflake Marketplace</strong></p>
      </div>
    </div>
  `;
  
  travelContainer.innerHTML = lockedMessage;
  // console.log('[TRAVEL] Locked message displayed in travel container');
  
  // Set up a periodic check to ensure the locked message stays visible
  if (!travelSystem.lockedMessageCheckInterval) {
    travelSystem.lockedMessageCheckInterval = setInterval(() => {
      ensureLockedMessageVisible();
    }, 1000); // Check every second
  }
}

/**
 * Ensure the locked message stays visible
 */
function ensureLockedMessageVisible() {
  const travelSystemUnlocked = window.game && window.game.travelActive;
  
  if (travelSystemUnlocked) {
    // Travel system is unlocked, stop checking and clear interval
    if (travelSystem.lockedMessageCheckInterval) {
      clearInterval(travelSystem.lockedMessageCheckInterval);
      travelSystem.lockedMessageCheckInterval = null;
    }
    return;
  }
  
  const travelContainer = document.getElementById('travel-container');
  if (!travelContainer) return;
  
  // Check if the locked message is still there
  const lockedMessage = travelContainer.querySelector('[data-travel-locked="true"]');
  if (!lockedMessage) {
    // console.log('[TRAVEL] Locked message was removed - restoring it');
    showTravelSystemLocked();
  }
}

/**
 * Show travel system active content
 */
function showTravelSystemActive() {
  const travelContainer = document.getElementById('travel-container');
  if (!travelContainer) return;
  
  // Clear the locked message interval if it exists
  if (travelSystem.lockedMessageCheckInterval) {
    clearInterval(travelSystem.lockedMessageCheckInterval);
    travelSystem.lockedMessageCheckInterval = null;
    // console.log('[TRAVEL] Cleared locked message interval - travel system is now active');
  }
  
  // Clear the container - will be populated by other systems
  travelContainer.innerHTML = '';
}

/**
 * Reset travel button (for testing)
 */
function resetTravelButton() {
  if (window.resetActivityCounter) {
    window.resetActivityCounter();
  }
  
  // Check if we should show locked message
  const travelSystemUnlocked = window.game && window.game.travelActive;
  if (!travelSystemUnlocked) {
    // Travel system is locked, ensure locked message is visible
    showTravelSystemLocked();
  }
  
  updateTravelButton();
}

// showTravelSuccess function removed - now handled by Concord panel

/**
 * Test function to simulate activities
 */
export function testSimpleTravel() {
  // console.log('[TRAVEL] Testing simple travel system...');
  
  // Simulate some activities to unlock travel
  if (window.recordActivity) {
    for (let i = 0; i < 55; i++) {
      setTimeout(() => {
        window.recordActivity('test');
      }, i * 50);
    }
  }
  
  // console.log('[TRAVEL] Test activities queued. Travel should unlock after 50 activities.');
}

/**
 * Check travel system status and update UI accordingly
 */
function checkAndUpdateTravelSystemStatus() {
  const travelSystemUnlocked = window.game && window.game.travelActive;
  // console.log('[TRAVEL] Checking travel system status:', { 
  //   gameExists: !!window.game, 
  //   travelActive: window.game?.travelActive, 
  //   unlocked: travelSystemUnlocked 
  // });
  
  if (travelSystemUnlocked) {
    // console.log('[TRAVEL] Travel system is unlocked - showing active content');
    showTravelSystemActive();
  } else {
    // console.log('[TRAVEL] Travel system is locked - showing locked message');
    showTravelSystemLocked();
  }
}

/**
 * Public function to check and update travel system status
 * Can be called from other systems when game state changes
 */
export function updateTravelSystemStatus() {
  checkAndUpdateTravelSystemStatus();
}

/**
 * Debug function to manually check travel system status
 * Can be called from console for debugging
 */
export function debugTravelSystemStatus() {
  // console.log('[TRAVEL] === DEBUG TRAVEL SYSTEM STATUS ===');
  // console.log('[TRAVEL] Game object exists:', !!window.game);
  // console.log('[TRAVEL] Game travelActive:', window.game?.travelActive);
  // console.log('[TRAVEL] Travel container exists:', !!document.getElementById('travel-container'));
  // console.log('[TRAVEL] Travel button exists:', !!document.getElementById('travel-button'));
  // console.log('[TRAVEL] Simple system initialized:', travelSystem.initialized);
  // console.log('[TRAVEL] ===========================================');
  
  // Try to show the appropriate message
  checkAndUpdateTravelSystemStatus();
}
