/**
 * Travel System - Momentum-based travel button progression
 * 
 * This module handles:
 * - Travel button UI and progress display
 * - Integration with momentum system
 * - Travel button state management
 * - Location system integration
 * - Location buff management
 * 
 * ===== MOMENTUM SYSTEM DOCUMENTATION =====
 * 
 * The momentum system tracks player activity to unlock the travel button.
 * 
 * MOMENTUM CALCULATION:
 * - Momentum is calculated on a 0-10 scale
 * - Uses a 10-second rolling window of recent actions
 * - Different actions have different weights:
 *   * click: 1.0 (snowball clicks)
 *   * assistantPurchased: 2.0 (assistant purchases)
 *   * boostPurchased: 2.5 (boost purchases via unified system)
 *   * globalUpgradePurchased: 3.0 (global upgrades via unified system)
 *   * yetiSpotted: 3.0 (yeti encounters)
 *   * locationUnlocked: 4.0 (location unlocks)
 *   * abilityUsed: 2.0 (ability usage)
 *   * icicleHarvested: 1.5 (icicle harvesting)
 * 
 * TRAVEL BUTTON UNLOCK:
 * - Requires 300 seconds (5 minutes) at maximum momentum (10) to unlock
 * - Progress is calculated as: (currentMomentum * timeElapsed) / unlockTime
 * - Once unlocked, stays unlocked until travel is used
 * 
 * CONFIGURATION:
 * To change the unlock time:
 * 1. In production: window.setTravelUnlockTime(600) // 10 minutes
 * 2. For testing: window.setTravelUnlockTime(60)   // 1 minute
 * 3. Default: 300 seconds (5 minutes)
 * 
 * DEBUG MODE:
 * - Enable: window.enableMomentumDebug()
 * - Disable: window.disableMomentumDebug()
 * - Shows detailed momentum tracking in console
 * 
 * TESTING:
 * - Use test_momentum_meter.html to test all action types
 * - "Test Action Types" button simulates all 8 action types
 * - Check console for momentum updates and event tracking
 */

import { eventBus } from '../../core/eventBus.js';
import { LOCATION, LOCATION_PASSIVE_EFFECT } from './data/locationData.js';
import { markSPSDirty } from '../passive/unifiedUpgrades.js';

/**
 * Travel system state
 */
let travelSystem = {
  initialized: false,
  uiUpdateInterval: null,
  locationBuffCheckInterval: null
};

// -------------------------------
// Location Passive Effects
// -------------------------------

/**
 * Apply discount to global upgrade purchases (Harvester location effect)
 * @param {GameStateFlat} game - The current game state object
 * @param {number} discountValue - Discount percentage (0.10 for 10%)
 */
function applyHarvesterLocationEffect(game, discountValue) {
  // Apply stacking multiplier to discount value
  const stackingMultiplier = game.classX2Buff || 1;
  const finalDiscountValue = discountValue * stackingMultiplier;
  
  // Set the global upgrade discount rate
  game.travelDiscountGlobalUpgrades = 1 - finalDiscountValue;
  // console.log(`[LOCATION EFFECT] Harvester: Global upgrade discount active (${(finalDiscountValue * 100)}% off)`);
  // console.log(`[LOCATION EFFECT] Discount rate: ${game.travelDiscountGlobalUpgrades}`);
  if (stackingMultiplier > 1) {
    // console.log(`[LOCATION EFFECT] Stacking multiplier applied: ${stackingMultiplier}x`);
  }
}

/**
 * Apply discount to assistant purchases (Defender location effect)
 * @param {GameStateFlat} game - The current game state object
 * @param {number} discountValue - Discount percentage (0.10 for 10%)
 */
function applyDefenderLocationEffect(game, discountValue) {
  // Apply stacking multiplier to discount value
  const stackingMultiplier = game.classX2Buff || 1;
  const finalDiscountValue = discountValue * stackingMultiplier;
  
  // Set the assistant discount rate
  game.travelDiscountAssistants = 1 - finalDiscountValue;
  // console.log(`[LOCATION EFFECT] Defender: Assistant discount active (${(finalDiscountValue * 100)}% off)`);
  // console.log(`[LOCATION EFFECT] Discount rate: ${game.travelDiscountAssistants}`);
  if (stackingMultiplier > 1) {
    // console.log(`[LOCATION EFFECT] Stacking multiplier applied: ${stackingMultiplier}x`);
  }
}

/**
 * Apply SPS multiplier (Traveler location effect)
 * @param {GameStateFlat} game - The current game state object
 * @param {number} multiplierValue - Multiplier increase (0.10 for 10% increase)
 */
function applyTravelerLocationEffect(game, multiplierValue) {
  // Apply stacking multiplier to multiplier value
  const stackingMultiplier = game.classX2Buff || 1;
  const finalMultiplierValue = multiplierValue * stackingMultiplier;
  
  // Set the SPS multiplier
  game.travelSPSMultiplier = 1 + finalMultiplierValue;
  // console.log(`[LOCATION EFFECT] Traveler: SPS multiplier active (+${(finalMultiplierValue * 100)}%)`);
  // console.log(`[LOCATION EFFECT] SPS multiplier: ${game.travelSPSMultiplier}`);
  if (stackingMultiplier > 1) {
    // console.log(`[LOCATION EFFECT] Stacking multiplier applied: ${stackingMultiplier}x`);
  }
  
  // Mark SPS as dirty since travel location effect was applied - Phase 3
  markSPSDirty();
  
  // Trigger SPS recalculation
  if (window.calculateSPSWithBoosts) {
    window.calculateSPSWithBoosts(game);
  }
}

/**
 * Apply discount to boost purchases (Scholar location effect)
 * @param {GameStateFlat} game - The current game state object
 * @param {number} discountValue - Discount percentage (0.10 for 10%)
 */
function applyScholarLocationEffect(game, value) {
  // Apply stacking multiplier to determine number of crystal snowballs to spawn
  const stackingMultiplier = game.classX2Buff || 1;
  const crystalSnowballsToSpawn = Math.floor(value * stackingMultiplier);
  
  // console.log(`[LOCATION EFFECT] Scholar: Spawning ${crystalSnowballsToSpawn} crystal snowball(s)`);
  if (stackingMultiplier > 1) {
    // console.log(`[LOCATION EFFECT] Stacking multiplier applied: ${stackingMultiplier}x`);
  }
  
  // Spawn crystal snowballs
  for (let i = 0; i < crystalSnowballsToSpawn; i++) {
    // Use a small delay to prevent overlapping spawns
    setTimeout(() => {
      if (game.crystalSnowballManager && game.crystalSnowballManager.spawnCrystalSnowball) {
        game.crystalSnowballManager.spawnCrystalSnowball();
        // console.log(`[LOCATION EFFECT] Crystal snowball ${i + 1}/${crystalSnowballsToSpawn} spawned`);
      } else {
        // console.warn(`[LOCATION EFFECT] Crystal snowball manager not available`);
      }
    }, i * 500); // 500ms delay between spawns
  }
}

/**
 * Apply the location passive effect for a location class
 * @param {GameStateFlat} game - The current game state object
 * @param {string} locationClass - The class of location (Harvester, Defender, Traveler, Scholar)
 */
function applyLocationPassiveEffect(game, locationClass) {
  const passiveEffect = LOCATION_PASSIVE_EFFECT[locationClass];
  if (!passiveEffect) {
    // console.error(`[LOCATION EFFECT] No passive effect found for class: ${locationClass}`);
    return;
  }
  
  // console.log(`[LOCATION EFFECT] Applying ${locationClass} location effect`);
  
  // Apply the appropriate effect based on effectType
  switch (passiveEffect.effectType) {
    case 'discountGlobalUpgrades':
      applyHarvesterLocationEffect(game, passiveEffect.value);
      break;
    case 'discountAssistants':
      applyDefenderLocationEffect(game, passiveEffect.value);
      break;
    case 'snowballRate':
      applyTravelerLocationEffect(game, passiveEffect.value);
      break;
    case 'discountBoosts':
      applyScholarLocationEffect(game, passiveEffect.value);
      break;
    case 'spawnCrystalSnowball':
      applyScholarLocationEffect(game, passiveEffect.value);
      break;
    case 'travelCooldownReduction':
      // Deprecated effect type - ignore for backward compatibility
      // console.warn(`[LOCATION EFFECT] Deprecated effect type 'travelCooldownReduction' ignored`);
      break;
    default:
      // console.error(`[LOCATION EFFECT] Unknown effect type: ${passiveEffect.effectType}`);
  }
}

/**
 * Remove all location passive effects
 * @param {GameStateFlat} game - The current game state object
 */
function removeLocationPassiveEffects(game) {
  // Reset all location effect multipliers to default
  game.travelDiscountGlobalUpgrades = 1;
  game.travelDiscountAssistants = 1; 
  game.travelSPSMultiplier = 1;
  game.travelDiscountBoosts = 1;
  
  // console.log(`[LOCATION EFFECT] All location effects removed`);
  
  // Mark SPS as dirty since location effects were removed - Phase 3
  markSPSDirty();
  
  // Trigger SPS recalculation to remove SPS multiplier
  if (window.calculateSPSWithBoosts) {
    window.calculateSPSWithBoosts(game);
  }
}

/**
 * Reapply current location effect with updated stacking multiplier
 * @param {GameStateFlat} game - The current game state object
 */
function reapplyCurrentLocationEffect(game) {
  if (!game.currentLocationBuff) {
    return;
  }
  
  const locationClass = game.currentLocationBuff.class;
  // console.log(`[LOCATION STACKING] Reapplying ${locationClass} location effect with stacking multiplier`);
  
  // Reapply the location effect (this will use the current classX2Buff value)
  applyLocationPassiveEffect(game, locationClass);
}

/**
 * Initialize the travel system
 * @param {GameStateFlat} game - The current game state object
 */
export function setupTravelSystem(game) {
  if (travelSystem.initialized) {
    return;
  }
  
  // console.log('[TRAVEL] Setting up travel system');
  
  // Set up event listeners
  setupTravelEventListeners();
  
  // Initialize UI
  updateTravelUI();
  
  // Access global timerManager
  const timerManager = window.timerManager;
  if (!timerManager) {
    // console.warn('[TRAVEL] TimerManager not available, falling back to setInterval');
    setupTravelSystemLegacy(game);
    return;
  }
  
  // Set up periodic UI updates using TimerManager
  travelSystem.uiUpdateInterval = timerManager.setInterval(() => {
    updateTravelUI();
  }, 1000, 'travel-ui-update'); // Update every second
  
  // Set up location buff expiration checking using TimerManager
  travelSystem.locationBuffCheckInterval = timerManager.setInterval(() => {
    checkLocationBuffExpiration(game);
  }, 1000, 'travel-buff-check'); // Check every second
  
  // Make functions available globally
  window.updateTravelUI = updateTravelUI;
  window.getTravelButtonStatus = getTravelButtonStatus;
  window.resetTravelButton = resetTravelButton;
  window.onTravelButtonClick = () => onTravelButtonClick(game);
  window.activateLocationBuff = (locationData) => activateLocationBuff(game, locationData);
  window.checkLocationBuffExpiration = () => checkLocationBuffExpiration(game);
  window.getLocationBuffRemainingTime = () => getLocationBuffRemainingTime();
  window.getLocationBuffClass = () => getLocationBuffClass();
  window.getCurrentLocationBuff = () => getCurrentLocationBuff();
  window.reapplyCurrentLocationEffect = () => reapplyCurrentLocationEffect(game);
  
  travelSystem.initialized = true;
  // console.log('[TRAVEL] Travel system initialized');
}

/**
 * Legacy fallback for travel system setup
 * @param {GameStateFlat} game - The current game state object
 */
function setupTravelSystemLegacy(game) {
  // Set up event listeners
  setupTravelEventListeners();
  
  // Initialize UI
  updateTravelUI();
  
  // Set up periodic UI updates
  travelSystem.uiUpdateInterval = setInterval(() => {
    updateTravelUI();
  }, 1000); // Update every second
  
  // Set up location buff expiration checking
  travelSystem.locationBuffCheckInterval = setInterval(() => {
    checkLocationBuffExpiration(game);
  }, 1000); // Check every second
  
  // Make functions available globally
  window.updateTravelUI = updateTravelUI;
  window.getTravelButtonStatus = getTravelButtonStatus;
  window.resetTravelButton = resetTravelButton;
  window.onTravelButtonClick = () => onTravelButtonClick(game);
  window.activateLocationBuff = (locationData) => activateLocationBuff(game, locationData);
  window.checkLocationBuffExpiration = () => checkLocationBuffExpiration(game);
  window.getLocationBuffRemainingTime = () => getLocationBuffRemainingTime();
  window.getLocationBuffClass = () => getLocationBuffClass();
  window.getCurrentLocationBuff = () => getCurrentLocationBuff();
  window.reapplyCurrentLocationEffect = () => reapplyCurrentLocationEffect(game);
  
  travelSystem.initialized = true;
  // console.log('[TRAVEL] Travel system initialized with legacy setInterval');
}

/**
 * Set up event listeners for travel system
 */
function setupTravelEventListeners() {
  // Listen for travel button unlock
  eventBus.on('travelButtonUnlocked', (data) => {
    // console.log('[TRAVEL] Travel button unlocked!', data);
    updateTravelUI();
    
    // Optional: Play sound, show notification, etc.
    showTravelUnlockNotification(data);
  }, 'TravelSystem');
  
  // Listen for momentum changes to update UI
  eventBus.on('momentumChanged', (data) => {
    // Update UI less frequently to avoid performance issues
    if (Math.random() < 0.1) { // 10% chance per momentum change
      updateTravelUI();
    }
  }, 'TravelSystem');
  
  // Listen for location buff events
  eventBus.on('locationBuffActivated', (data) => {
    updateTravelUI();
    // console.log('[TRAVEL] Location buff activated:', data);
  }, 'TravelSystem');
  
  eventBus.on('locationBuffExpired', (data) => {
    updateTravelUI();
    // console.log('[TRAVEL] Location buff expired:', data);
  }, 'TravelSystem');
}

/**
 * Update the travel system UI
 */
function updateTravelUI() {
  const travelContainer = document.getElementById('travel-container');
  if (!travelContainer) {
    return;
  }
  
  // Check if travel system is active (controlled by Concord upgrade)
  if (!window.game || !window.game.travelActive) {
    // Travel system is disabled - show unlock message
    travelContainer.innerHTML = `
      <div class="travel-status travel-disabled">
        <div class="travel-locked-message">
          <h3>🌍 Travel System</h3>
          <p>This feature is currently locked.</p>
          <p><strong>Unlock in Snowflake Marketplace</strong></p>
        </div>
      </div>
    `;
    return;
  }
  
  // Check if GameReadyUIManager is handling the travel container
  // If so, skip updating the container content to avoid conflicts
  if (window.gameReadyUIManager && window.gameReadyUIManager.activeTab === 'dashboard') {
    // Only apply visual styling, don't update content
    const locationBuff = getCurrentLocationBuff();
    updateTravelContainerStyle(travelContainer, locationBuff);
    return;
  }
  
  // Get current location buff status
  const locationBuff = getCurrentLocationBuff();
  
  // Apply visual styling based on location buff
  updateTravelContainerStyle(travelContainer, locationBuff);
  
  if (locationBuff) {
    // Check if there's an active battle - battles take priority
    if (window.game && window.game.battles && window.game.battles.currentEvilYeti) {
      // Battle is active, don't show location buff
      return;
    }
    
    // Show active location buff only
    const remainingTime = getLocationBuffRemainingTime();
    
    travelContainer.innerHTML = `
      <div class="travel-status location-active">
        <div class="location-buff-info">
          <h3>${locationBuff.name}</h3>
          <p class="location-description">${locationBuff.description}</p>
          <p><strong>Class:</strong> ${locationBuff.class}</p>
          <p><strong>Time Remaining:</strong> <span id="location-countdown">${remainingTime}s</span></p>
          <p><strong>Bonus:</strong> ${formatLocationBonus(locationBuff.passiveBonus)}</p>
        </div>
      </div>
    `;
  } else {
    // No location buff active - but check if there's a battle active
    if (window.game && window.game.battles && window.game.battles.currentEvilYeti) {
      // Battle is active, don't clear the container
      return;
    }
    // No location buff and no battle - clear the container
    // The dashboard's travel button handles the travel functionality
    travelContainer.innerHTML = '';
  }
}

/**
 * Update travel container visual style based on location buff
 */
function updateTravelContainerStyle(container, locationBuff) {
  // Remove existing location theme classes
  container.classList.remove('location-green', 'location-orange', 'location-yellow', 'location-brown', 'location-inactive');
  
  if (locationBuff) {
    // Apply location theme styling
    container.classList.add(`location-${locationBuff.colorTheme}`);
  } else {
    // Apply inactive (gray) styling
    container.classList.add('location-inactive');
  }
}

/**
 * Select a random location class
 */
function selectLocationClass() {
  const classes = ['Harvester', 'Defender', 'Traveler', 'Scholar'];
  const randomIndex = Math.floor(Math.random() * classes.length);
  return classes[randomIndex];
}

/**
 * Select a random location from a specific class
 */
function selectLocationFromClass(locationClass) {
  const locationsInClass = LOCATION.locations.filter(loc => loc.class === locationClass);
  if (locationsInClass.length === 0) {
    // console.error('[TRAVEL] No locations found for class:', locationClass);
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * locationsInClass.length);
  return locationsInClass[randomIndex];
}

/**
 * Activate a location buff
 */
function activateLocationBuff(game, locationData) {
  if (!locationData) {
    // console.error('[TRAVEL] Invalid location data');
    return false;
  }
  
  // Get the passive effect for this location class
  const passiveEffect = LOCATION_PASSIVE_EFFECT[locationData.class];
  if (!passiveEffect) {
    // console.error(`[TRAVEL] No passive effect found for location class: ${locationData.class}`);
    return false;
  }
  
  // Create the location buff object
  const buff = {
    locationId: locationData.id,
    class: locationData.class,
    name: locationData.name,
    description: locationData.description,
    colorTheme: locationData.colorTheme,
    startTime: game.getGameTime(),
    duration: passiveEffect.duration * 1000, // Convert to milliseconds
    passiveBonus: passiveEffect
  };
  
  // Apply the buff
  game.currentLocationBuff = buff;
  
  // Apply the actual location passive effect
  applyLocationPassiveEffect(game, locationData.class);
  
  // Track location visit
  if (window.progressTracker && window.progressTracker.trackLocationVisit) {
    window.progressTracker.trackLocationVisit({
      locationId: locationData.id,
      locationClass: locationData.class,
      locationName: locationData.name
    });
  }
  
  // Update game state location visit counter
  if (game.locationsVisited !== undefined) {
    game.locationsVisited = (game.locationsVisited || 0) + 1;
  }
  
  // Emit location buff activated event
  eventBus.emit('locationBuffActivated', {
    locationId: locationData.id,
    locationClass: locationData.class,
    locationName: locationData.name,
    passiveBonus: passiveEffect,
    colorTheme: locationData.colorTheme
  });
  
  // console.log(`[TRAVEL] Activated location buff: ${locationData.name} (${locationData.class})`);
  
  // Reset travel button progress
  if (window.progressTracker && window.progressTracker.resetTravelButton) {
    window.progressTracker.resetTravelButton();
  }
  
  // Check buff stacking after activation
  if (game.checkBuffStacking) {
    game.checkBuffStacking();
  }
  
  return true;
}

/**
 * Check if location buff has expired
 */
function checkLocationBuffExpiration(game) {
  if (!game.currentLocationBuff) {
    return false;
  }
  
  const now = game.getGameTime();
  const buffStartTime = game.currentLocationBuff.startTime;
  const buffDuration = game.currentLocationBuff.duration;
  
  if (now - buffStartTime >= buffDuration) {
    // Buff has expired
    const expiredLocation = game.currentLocationBuff;
    game.currentLocationBuff = null;
    
    // Remove the location passive effects
    removeLocationPassiveEffects(game);
    
    // Emit location buff expired event
    eventBus.emit('locationBuffExpired', {
      locationId: expiredLocation.locationId,
      locationClass: expiredLocation.class,
      locationName: expiredLocation.name
    });
    
    // console.log(`[TRAVEL] Location buff expired: ${expiredLocation.name}`);
    
    // Update UI to remove location styling
    updateTravelUI();
    
    // Check buff stacking after expiration
    if (game.checkBuffStacking) {
      game.checkBuffStacking();
    }
    
    return true;
  }
  
  return false;
}

/**
 * Get current location buff
 */
function getCurrentLocationBuff() {
  return window.game ? window.game.currentLocationBuff : null;
}

/**
 * Get location buff remaining time
 */
function getLocationBuffRemainingTime() {
  const locationBuff = getCurrentLocationBuff();
  if (!locationBuff || !window.game) {
    return 0;
  }
  
  const now = window.game.getGameTime();
  const elapsed = now - locationBuff.startTime;
  const remaining = Math.max(0, Math.ceil((locationBuff.duration - elapsed) / 1000));
  
  // Debug logging to identify NaN source
  if (isNaN(remaining)) {
    // console.log('[TRAVEL DEBUG] NaN detected in getLocationBuffRemainingTime:');
    // console.log('  locationBuff:', locationBuff);
    // console.log('  now:', now);
    // console.log('  startTime:', locationBuff.startTime);
    // console.log('  duration:', locationBuff.duration);
    // console.log('  elapsed:', elapsed);
    // console.log('  remaining calculation:', (locationBuff.duration - elapsed) / 1000);
  }
  
  return remaining;
}

/**
 * Get location buff class
 */
function getLocationBuffClass() {
  const locationBuff = getCurrentLocationBuff();
  if (!locationBuff) {
    return '';
  }
  
  return locationBuff.class;
}

/**
 * Format location bonus for display
 */
function formatLocationBonus(passiveBonus) {
  if (!passiveBonus) return 'None';
  
  const value = (passiveBonus.value * 100).toFixed(0);
  
  switch (passiveBonus.effectType) {
    case 'discountGlobalUpgrades':
      return `${value}% Global Upgrade Discount`;
    case 'discountAssistants':
      return `${value}% Assistant Discount`;
    case 'snowballRate':
      return `+${value}% Snowball Rate`;
    case 'discountBoosts':
      return `${value}% Boost Discount`;
    case 'spawnCrystalSnowball':
      return `Spawn Crystal Snowball`;
    default:
      return `${passiveBonus.effectType}: +${value}%`;
  }
}

/**
 * Get travel button status from progress tracker
 */
function getTravelButtonStatus() {
  // console.log('[TRAVEL] Getting travel button status...');
  
  // Use analytics tracker if available (this is the main source)
  if (window.analyticsTracker && window.analyticsTracker.getTravelButtonStatus) {
    const status = window.analyticsTracker.getTravelButtonStatus();
    // console.log('[TRAVEL] Analytics tracker status:', status);
    return status;
  }
  
  // Fallback to progress tracker if analytics tracker not available
  if (window.progressTracker && window.progressTracker.getTravelButtonStatus) {
    const status = window.progressTracker.getTravelButtonStatus();
    // console.log('[TRAVEL] Progress tracker status:', status);
    return status;
  }
  
  // console.log('[TRAVEL] Using fallback status - no trackers available');
  // Fallback if no trackers available
  return {
    progress: 0,
    progressPercentage: '0.0',
    unlocked: false,
    currentMomentum: 0,
    averageMomentum: 0,
    estimatedTimeToUnlock: Infinity,
    progressHistory: []
  };
}

/**
 * Reset travel button (for testing)
 */
function resetTravelButton() {
  // console.log('[TRAVEL] Resetting travel button...');
  
  // Reset analytics tracker (primary source)
  if (window.analyticsTracker && window.analyticsTracker.momentum) {
    window.analyticsTracker.momentum.travelButton.progress = 0;
    window.analyticsTracker.momentum.travelButton.unlocked = false;
    // console.log('[TRAVEL] Analytics tracker reset completed');
  }
  
  // Also reset progress tracker if available
  if (window.progressTracker && window.progressTracker.resetTravelButton) {
    window.progressTracker.resetTravelButton();
    // console.log('[TRAVEL] Progress tracker reset completed');
  }
  
  updateTravelUI();
  
  // Force update the momentum meter in the dashboard
  if (window.gameReadyUIManager && window.gameReadyUIManager.updateMomentumMeter) {
    window.gameReadyUIManager.updateMomentumMeter();
    // console.log('[TRAVEL] Dashboard momentum meter updated');
  }
  
  // Force a full dashboard update to ensure everything is in sync
  if (window.gameReadyUIManager && window.gameReadyUIManager.updateDashboard) {
    window.gameReadyUIManager.updateDashboard();
    // console.log('[TRAVEL] Full dashboard update triggered');
  }
  
  // Additional fallback: directly update the UI elements
  setTimeout(() => {
    const progressFill = document.getElementById('momentum-progress-fill');
    const progressText = document.getElementById('momentum-progress-text');
    const travelButton = document.getElementById('travel-button');
    
    if (progressFill) {
      progressFill.style.width = '0%';
      progressFill.style.background = 'linear-gradient(135deg, var(--color-primary-accent) 0%, var(--color-hover-accent) 100%)';
    }
    
    if (progressText) {
      progressText.textContent = '0%';
    }
    
    if (travelButton) {
      travelButton.classList.add('disabled');
      travelButton.disabled = true;
      travelButton.textContent = 'Increase activity';
      travelButton.title = 'Current momentum: 0.0/10 - Stay active to progress faster!';
    }
    
    // console.log('[TRAVEL] Direct UI reset completed');
  }, 100);
  
  // console.log('[TRAVEL] Travel button reset complete');
}

/**
 * Handle travel button click
 */
function onTravelButtonClick(game) {
  // console.log('[TRAVEL] Travel button clicked!');
  
  // Check if travel system is active (controlled by Concord upgrade)
  if (!game.travelActive) {
    // console.log('[TRAVEL] Travel system is disabled - unlock required');
    return;
  }
  
  const status = getTravelButtonStatus();
  // console.log('[TRAVEL] Travel button status:', status);
  
  if (!status.unlocked) {
    // console.log('[TRAVEL] Travel button clicked but not unlocked');
    return;
  }
  
  // console.log('[TRAVEL] Travel button clicked - initiating travel!');
  
  // Step 1: Select location class randomly
  const selectedClass = selectLocationClass();
  
  // Step 2: Select location from that class
  const selectedLocation = selectLocationFromClass(selectedClass);
  
  if (!selectedLocation) {
    // console.error('[TRAVEL] Failed to select location');
    showTravelMessage('Failed to find a travel destination. Please try again.');
    return;
  }
  
  // Step 3: Activate location buff
  const success = activateLocationBuff(game, selectedLocation);
  
  if (success) {
    // console.log(`[TRAVEL] Traveled to ${selectedLocation.name} (${selectedLocation.class})`);
    showTravelSuccessMessage(selectedLocation);
    
    // Immediately disable the travel button to prevent multiple clicks
    const travelButton = document.getElementById('travel-button');
    if (travelButton) {
      travelButton.classList.add('disabled');
      travelButton.disabled = true;
      travelButton.textContent = 'Increase activity';
    }
    
    // Reset travel button immediately to prevent multiple clicks
    resetTravelButton();
  } else {
    showTravelMessage('Travel failed. Please try again.');
  }
  
  // Emit event for future travel system integration
  eventBus.emit('travelInitiated', {
    locationId: selectedLocation.id,
    locationClass: selectedLocation.class,
    locationName: selectedLocation.name,
    momentum: status.currentMomentum,
    averageMomentum: status.averageMomentum
  });
}

/**
 * Show travel unlock notification
 */
function showTravelUnlockNotification(data) {
  // Simple notification - could be enhanced with better UI
  const notification = document.createElement('div');
  notification.className = 'travel-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <h3>🌍 Travel Unlocked!</h3>
      <p>Your momentum has unlocked the ability to travel to new locations.</p>
      <p>Average momentum: ${data.averageMomentum.toFixed(1)}/10</p>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 5000);
}

/**
 * Show travel success message
 */
function showTravelSuccessMessage(location) {
  // Use Concord activity panel if available
  if (window.concordActivityPanel) {
    window.concordActivityPanel.showActivity('travel', 'Travel Complete!', `You have arrived at ${location.name}`, `Class: ${location.class} | Duration: 60 seconds`);
  } else {
    // Fallback to old notification system
    // console.warn('[TRAVEL] Concord activity panel not available, using fallback');
    
    const notification = document.createElement('div');
    notification.className = 'travel-notification travel-success';
    notification.innerHTML = `
      <div class="notification-content">
        <h3>🌍 Traveled Successfully!</h3>
        <p><strong>${location.name}</strong></p>
        <p>${location.description}</p>
        <p>Class: ${location.class}</p>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.remove();
      }
    }, 5000);
  }
  
  // Emit travelComplete event for Concord panel
  if (window.eventBus) {
    window.eventBus.emit('travelComplete', {
      location: {
        name: location.name,
        class: location.class
      },
      momentum: 15, // Example momentum value
      duration: '60 seconds'
    });
  }
}

/**
 * Show travel message (generic)
 */
function showTravelMessage(message) {
  alert(message);
}

// -------------------------------
// Test Functions for Location Effects
// -------------------------------

/**
 * Test a specific location effect by class name
 * @param {GameStateFlat} game - The current game state object
 * @param {string} className - The class name (Harvester, Defender, Traveler, Scholar)
 */
function testLocationEffect(game, className) {
  // console.log(`[LOCATION TEST] Testing ${className} location effect`);
  
  // Remove existing location effects first
  removeLocationPassiveEffects(game);
  
  // Find a location of the specified class
  const locationData = selectLocationFromClass(className);
  if (!locationData) {
    // console.error(`[LOCATION TEST] No location found for class: ${className}`);
    return false;
  }
  
  // Apply the location effect
  const success = activateLocationBuff(game, locationData);
  
  if (success) {
    // console.log(`[LOCATION TEST] ${className} location effect applied successfully`);
    // console.log(`[LOCATION TEST] Location: ${locationData.name} (${locationData.id})`);
    // console.log(`[LOCATION TEST] Effect will last for 60 seconds`);
    
    // Show current multiplier values
    // console.log(`[LOCATION TEST] Current multipliers:`);
    // console.log(`  Global upgrades: ${game.travelDiscountGlobalUpgrades || 1}`);
    // console.log(`  Assistants: ${game.travelDiscountAssistants || 1}`);
    // console.log(`  SPS: ${game.travelSPSMultiplier || 1}`);
    // console.log(`  Boosts: ${game.travelDiscountBoosts || 1}`);
    
    return true;
  } else {
    // console.error(`[LOCATION TEST] Failed to apply ${className} location effect`);
    return false;
  }
}

/**
 * Test all location effects in sequence
 * @param {GameStateFlat} game - The current game state object
 */
function testAllLocationEffects(game) {
  // console.log('[LOCATION TEST] Testing all location effects');
  
  const classes = ['Harvester', 'Defender', 'Traveler', 'Scholar'];
  let successCount = 0;
  
  for (const className of classes) {
    if (testLocationEffect(game, className)) {
      successCount++;
    }
    
    // Wait between tests (let each effect last for a bit)
    setTimeout(() => {
      // console.log(`[LOCATION TEST] ${className} test completed`);
    }, 5000);
  }
  
  // console.log(`[LOCATION TEST] All location effects tested. Success: ${successCount}/${classes.length}`);
  return successCount === classes.length;
}

/**
 * Test location effect duration and removal
 * @param {GameStateFlat} game - The current game state object
 * @param {string} className - The class name to test
 */
function testLocationEffectDuration(game, className) {
  // console.log(`[LOCATION TEST] Testing ${className} location effect duration`);
  
  // Apply the effect
  if (!testLocationEffect(game, className)) {
    return false;
  }
  
  // Check every 10 seconds
  let checkCount = 0;
  const maxChecks = 7; // Check for 70 seconds (effect lasts 60s)
  
  const checkInterval = setInterval(() => {
    checkCount++;
    const remaining = getLocationBuffRemainingTime();
    const currentBuff = getCurrentLocationBuff();
    
    // console.log(`[LOCATION TEST] Check ${checkCount}: ${remaining}s remaining, buff active: ${!!currentBuff}`);
    
    if (checkCount >= maxChecks) {
      clearInterval(checkInterval);
      // console.log(`[LOCATION TEST] Duration test completed for ${className}`);
      
      // Verify effects are removed
      const finalBuff = getCurrentLocationBuff();
      if (!finalBuff && game.travelDiscountGlobalUpgrades === 1 && game.travelDiscountAssistants === 1 && 
          game.travelSPSMultiplier === 1 && game.travelDiscountBoosts === 1) {
        // console.log(`[LOCATION TEST] ✓ Effects properly removed after expiration`);
      } else {
        // console.log(`[LOCATION TEST] ✗ Effects not properly removed after expiration`);
      }
    }
  }, 10000);
  
  return true;
}

/**
 * Cleanup travel system using TimerManager
 */
export function cleanupTravelSystem() {
  const timerManager = window.timerManager;
  let cleanedCount = 0;
  
  if (timerManager) {
    // Use TimerManager to clear timers
    if (travelSystem.uiUpdateInterval && timerManager.clearTimer(travelSystem.uiUpdateInterval)) {
      cleanedCount++;
      travelSystem.uiUpdateInterval = null;
    }
    
    if (travelSystem.locationBuffCheckInterval && timerManager.clearTimer(travelSystem.locationBuffCheckInterval)) {
      cleanedCount++;
      travelSystem.locationBuffCheckInterval = null;
    }
    
    // console.log(`[TRAVEL] Cleaned up ${cleanedCount} timers using TimerManager`);
  } else {
    // Fallback to legacy cleanup
    if (travelSystem.uiUpdateInterval) {
      clearInterval(travelSystem.uiUpdateInterval);
      travelSystem.uiUpdateInterval = null;
      cleanedCount++;
    }
    
    if (travelSystem.locationBuffCheckInterval) {
      clearInterval(travelSystem.locationBuffCheckInterval);
      travelSystem.locationBuffCheckInterval = null;
      cleanedCount++;
    }
    
    // console.log(`[TRAVEL] Cleaned up ${cleanedCount} timers using legacy clearInterval`);
  }
  
  travelSystem.initialized = false;
}

// Make functions available globally
window.setupTravelSystem = setupTravelSystem;
window.cleanupTravelSystem = cleanupTravelSystem;
window.testLocationEffect = testLocationEffect;
window.testAllLocationEffects = testAllLocationEffects;
window.testLocationEffectDuration = testLocationEffectDuration; 