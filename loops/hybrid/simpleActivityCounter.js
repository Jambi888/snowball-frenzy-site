/**
 * Simple Activity Counter System
 * 
 * This replaces the complex momentum system with a simple counter approach:
 * - Count user activities (clicks, purchases, yeti encounters, etc.)
 * - Unlock travel when threshold is reached
 * - Simple progress bar that fills up
 * - No complex calculations or fallback systems
 * - Progress can ONLY increase, never decrease
 */

// Simple state
let activityCounter = 0;
let travelUnlocked = false;
const TRAVEL_THRESHOLD = 50; // Adjust this number to balance difficulty

/**
 * Record any user activity and increment counter
 * @param {string} activityType - Type of activity (for logging, not used in calculation)
 */
export function recordActivity(activityType = 'activity') {
  // Increment counter for any activity
  activityCounter++;
  
  // Update progress
  const progress = Math.min(activityCounter / TRAVEL_THRESHOLD, 1.0);
  
  // Check if travel should be unlocked
  if (activityCounter >= TRAVEL_THRESHOLD && !travelUnlocked) {
    travelUnlocked = true;
    // console.log(`[ACTIVITY] Travel unlocked after ${activityCounter} activities!`);
    
    // Emit event for other systems
    window.eventBus.emit('travelUnlocked', { 
      activityCount: activityCounter, 
      threshold: TRAVEL_THRESHOLD 
    });
  }
  
  // Update UI - this is the ONLY place that should update the momentum meter
  updateActivityMeter(progress);
  
  // Log activity (optional, for debugging)
  // console.log(`[ACTIVITY] ${activityType} recorded. Progress: ${activityCounter}/${TRAVEL_THRESHOLD} (${(progress * 100).toFixed(1)}%)`);
}

/**
 * Update the activity meter UI
 * @param {number} progress - Progress value between 0 and 1
 */
function updateActivityMeter(progress) {
  // Update momentum meter if it exists - this is the ONLY update function
  const progressFill = document.getElementById('momentum-progress-fill');
  const progressText = document.getElementById('momentum-progress-text');
  
  if (progressFill) {
    progressFill.style.width = `${progress * 100}%`;
  }
  
  if (progressText) {
    progressText.textContent = `${(progress * 100).toFixed(1)}%`;
  }
  
  // Update travel button if it exists
  const travelButton = document.getElementById('travel-button');
  if (travelButton) {
    // Check if travel system is unlocked via snowflake upgrade
    const travelSystemUnlocked = window.game && window.game.travelActive;
    
    if (!travelSystemUnlocked) {
      // Travel system is locked - show unlock message
      travelButton.classList.add('disabled');
      travelButton.disabled = true;
      travelButton.textContent = 'Locked';
      travelButton.title = 'Travel system locked - unlock in Snowflake Marketplace';
      
      // Remove click handler when system is locked
      if (travelButton.hasAttribute('data-travel-handler-set')) {
        travelButton.removeAttribute('data-travel-handler-set');
        travelButton.removeEventListener('click', handleTravelButtonClick);
      }
    } else if (travelUnlocked) {
      // Travel system is unlocked AND button is unlocked
      travelButton.classList.remove('disabled');
      travelButton.disabled = false;
      travelButton.textContent = 'Travel';
      travelButton.title = 'Click to travel to a new location!';
      
      // Set up click handler for travel button
      if (!travelButton.hasAttribute('data-travel-handler-set')) {
        travelButton.setAttribute('data-travel-handler-set', 'true');
        travelButton.addEventListener('click', handleTravelButtonClick);
      }
    } else {
      // Travel system is unlocked but button is not yet unlocked
      travelButton.classList.add('disabled');
      travelButton.disabled = true;
      travelButton.textContent = 'Increase activity';
      travelButton.title = `Current progress: ${activityCounter}/${TRAVEL_THRESHOLD} - Stay active to unlock travel!`;
      
      // Remove click handler when locked
      if (travelButton.hasAttribute('data-travel-handler-set')) {
        travelButton.removeAttribute('data-travel-handler-set');
        travelButton.removeEventListener('click', handleTravelButtonClick);
      }
    }
  }
}

/**
 * Handle travel button click
 */
function handleTravelButtonClick() {
  // console.log('[ACTIVITY] Travel button clicked!');
  
  // Check if travel system is unlocked via snowflake upgrade
  const travelSystemUnlocked = window.game && window.game.travelActive;
  if (!travelSystemUnlocked) {
    // console.log('[ACTIVITY] Travel system is locked - unlock required in Snowflake Marketplace');
    return;
  }
  
  if (!travelUnlocked) {
    // console.log('[ACTIVITY] Travel not unlocked yet');
    return;
  }
  
  // Call the simple travel system
  if (window.onTravelButtonClick) {
    window.onTravelButtonClick();
  } else {
    // console.log('[ACTIVITY] Travel system not available');
  }
}

/**
 * Get current activity status
 * @returns {Object} Current status object
 */
export function getActivityStatus() {
  return {
    counter: activityCounter,
    threshold: TRAVEL_THRESHOLD,
    progress: Math.min(activityCounter / TRAVEL_THRESHOLD, 1.0),
    progressPercentage: `${(Math.min(activityCounter / TRAVEL_THRESHOLD, 1.0) * 100).toFixed(1)}%`,
    unlocked: travelUnlocked,
    remaining: Math.max(0, TRAVEL_THRESHOLD - activityCounter)
  };
}

/**
 * Reset activity counter (called after travel is used)
 */
export function resetActivityCounter() {
  activityCounter = 0;
  travelUnlocked = false;
  updateActivityMeter(0);
  // console.log('[ACTIVITY] Counter reset - travel locked again');
}

/**
 * Set travel threshold (for balancing)
 * @param {number} newThreshold - New threshold value
 */
export function setTravelThreshold(newThreshold) {
  TRAVEL_THRESHOLD = newThreshold;
  // console.log(`[ACTIVITY] Travel threshold set to ${newThreshold}`);
  updateActivityMeter(Math.min(activityCounter / TRAVEL_THRESHOLD, 1.0));
}

/**
 * Initialize the simple activity counter system
 */
export function initializeSimpleActivityCounter() {
  // console.log('[ACTIVITY] Simple Activity Counter initializing...');
  
  // CRITICAL: Clear any existing state from old systems
  activityCounter = 0;
  travelUnlocked = false;
  
  // Set up global functions
  window.recordActivity = recordActivity;
  window.getActivityStatus = getActivityStatus;
  window.resetActivityCounter = resetActivityCounter;
  window.setTravelThreshold = setTravelThreshold;
  
  // CRITICAL: Override the old momentum system functions to prevent interference
  window.getTravelButtonStatus = getActivityStatus;
  window.updateTravelUI = () => false; // Disable old system
  window.resetTravelButton = () => {
    // console.log('[ACTIVITY] Old resetTravelButton called - redirecting to simple system');
    resetActivityCounter();
    return false;
  };
  
  // Initial UI update - ensure clean state
  updateActivityMeter(0);
  
  // Set up activity event listeners
  setupActivityEventListeners();
  
  // console.log('[ACTIVITY] Simple Activity Counter initialized and old systems overridden');
}

/**
 * Set up event listeners for common user activities
 */
function setupActivityEventListeners() {
  if (!window.eventBus) return;
  
  // Listen for common user activities
  window.eventBus.on('click', () => recordActivity('click'), 'SimpleActivityCounter');
  window.eventBus.on('assistantPurchased', () => recordActivity('assistant purchase'), 'SimpleActivityCounter');
  window.eventBus.on('boostPurchased', () => recordActivity('boost purchase'), 'SimpleActivityCounter');
  window.eventBus.on('yetiSpotted', () => recordActivity('yeti encounter'), 'SimpleActivityCounter');
  window.eventBus.on('achievementUnlocked', () => recordActivity('achievement'), 'SimpleActivityCounter');
  window.eventBus.on('upgradePurchased', () => recordActivity('upgrade'), 'SimpleActivityCounter');
  
  // console.log('[ACTIVITY] Event listeners set up for common activities');
}

/**
 * Test function to simulate activities
 */
export function testActivityCounter() {
  // console.log('[ACTIVITY] Testing activity counter...');
  
  // Simulate some activities
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      recordActivity('test activity');
    }, i * 100);
  }
  
  // console.log('[ACTIVITY] Test activities queued. Check progress bar and console.');
}
