/**
 * unifiedUpgrades.js - Unified upgrade system
 * 
 * This consolidates all upgrade types (boosts, global upgrades, yeti jr) into a single
 * system with simplified triggers and consistent effects.
 * 
 * FEATURES:
 * - Single trigger evaluation system
 * - Unified effect application
 * - Consistent UI rendering
 * - Easy extensibility for new upgrade types
 * - Performance optimized with dirty flags
 */

import { UNIFIED_UPGRADES, getUpgradesByType, getUpgradeById } from './data/unifiedUpgradeData.js';
import { ASSISTANTS } from './data/assistantData.js';
import { eventBus } from '../../core/eventBus.js';
import { formatNumber, formatSnowballs } from '../../ui/numberFormatter.js';

// SPS dirty flag for event-driven updates
let spsDirty = false;

/**
 * Evaluate a single trigger condition
 * @param {Object} trigger - Trigger object with type and parameters
 * @param {Object} game - Game state object
 * @returns {boolean} True if trigger condition is met
 */
function evaluateTrigger(trigger, game) {
  if (!trigger || !trigger.type) return false;

  switch (trigger.type) {
    case 'assistantCount':
      if (trigger.assistantId) {
        // Specific assistant count
        return (game.assistants?.[trigger.assistantId] || 0) >= trigger.value;
      } else {
        // Total assistant count
        return Object.values(game.assistants || {}).reduce((sum, val) => sum + val, 0) >= trigger.value;
      }
      
    case 'lifetimeSnowballs':
      return (game.lifetimeSnowballs || 0) >= trigger.value;
      
    case 'totalClicks':
      return (game.totalClicks || 0) >= trigger.value;
      
    case 'boostsOwned':
      return Object.values(game.unifiedUpgrades || {}).filter(owned => owned).length >= trigger.value;
      
    case 'locationsUnlocked':
      return (game.unlockedLocations?.size || 0) >= trigger.value;
      
    case 'yetisSighted':
      return (game.yetisSighted || 0) >= trigger.value;
      
    case 'playTimeHours':
      return (game.totalPlayTime || 0) >= trigger.value * 3600;
      
    case 'prestigeCount':
      return (game.prestigeCount || 0) >= trigger.value;
      
    default:
      // console.warn(`[UNIFIED_UPGRADES] Unknown trigger type: ${trigger.type}`);
      break;
  }
}

/**
 * Check if an upgrade is unlocked based on its trigger
 * @param {Object} upgrade - Upgrade object
 * @param {Object} game - Game state object
 * @returns {boolean} True if upgrade is unlocked
 */
function isUpgradeUnlocked(upgrade, game) {
  return evaluateTrigger(upgrade.trigger, game);
}

/**
 * Check if an upgrade is purchased
 * @param {string} upgradeId - Upgrade ID
 * @param {Object} game - Game state object
 * @returns {boolean} True if upgrade is purchased
 */
function isUpgradePurchased(upgradeId, game) {
  return !!(game.unifiedUpgrades?.[upgradeId]);
}

/**
 * Apply upgrade effect to game state
 * @param {Object} effect - Effect object with type and parameters
 * @param {Object} game - Game state object
 */
function applyUpgradeEffect(effect, game) {
  if (!effect || !effect.type) return;

  switch (effect.type) {
    case 'spsMultiplier':
      game.globalSpsMultiplier = (game.globalSpsMultiplier || 1) * (1 + effect.value);
      markSPSDirty();
      break;
      
    case 'clickMultiplier':
      // Set the clickMultiplier property for the click system
      game.clickMultiplier = (game.clickMultiplier || 1) * (1 + effect.value);
      // Don't modify spc - it should remain as the base value
      // game.spc = (game.spc || 1) * (1 + effect.value);
      break;
      
    case 'assistantMultiplier':
      if (!game.assistantMultipliers) {
        game.assistantMultipliers = {};
      }
      game.assistantMultipliers[effect.assistantId] = (game.assistantMultipliers[effect.assistantId] || 1) * (1 + effect.value);
      markSPSDirty();
      break;
      
    case 'assistantGroupMultiplier':
      // Apply to all assistants in the group
      if (!game.assistantMultipliers) {
        game.assistantMultipliers = {};
      }
      // TODO: Implement assistant group logic
      markSPSDirty();
      break;
      
    case 'costReduction':
      game.assistantCostReduction = (game.assistantCostReduction || 0) + effect.value;
      break;
      
    case 'boostEffectiveness':
      game.boostEffectiveness = (game.boostEffectiveness || 1) * (1 + effect.value);
      break;
      
    case 'grantSnowballs':
      game.addSnowballs(effect.value, 'upgrade');
      break;
      
    case 'unlockLocation':
      if (!game.unlockedLocations) {
        game.unlockedLocations = new Set();
      }
      if (!game.unlockedLocations.has(effect.locationId)) {
        game.unlockedLocations.add(effect.locationId);
        
        // Emit locationUnlocked event for achievement system
        if (window.eventBus) {
          window.eventBus.emit('locationUnlocked', {
            locationId: effect.locationId
          });
        }
      }
      break;
      
    default:
      // console.warn(`[UNIFIED_UPGRADES] Unknown effect type: ${effect.type}`);
      break;
  }
}

/**
 * Setup unified upgrade system
 * @param {Object} game - Game state object
 */
export function setupUnifiedUpgrades(game) {
  if (!game.unifiedUpgrades) {
    game.unifiedUpgrades = {};
  }
  
  // Initialize all upgrades as unpurchased
  UNIFIED_UPGRADES.forEach(upgrade => {
    if (!(upgrade.id in game.unifiedUpgrades)) {
      game.unifiedUpgrades[upgrade.id] = false;
    }
  });
  
  // Apply effects of already purchased upgrades
  UNIFIED_UPGRADES.forEach(upgrade => {
    if (game.unifiedUpgrades[upgrade.id]) {
      applyUpgradeEffect(upgrade.effect, game);
    }
  });
}

/**
 * Purchase an upgrade
 * @param {string} upgradeId - Upgrade ID to purchase
 * @param {Object} game - Game state object
 * @returns {boolean} True if purchase was successful
 */
export function purchaseUpgrade(upgradeId, game) {
  const upgrade = getUpgradeById(upgradeId);
  if (!upgrade) {
    // console.warn(`[UNIFIED_UPGRADES] Upgrade not found: ${upgradeId}`);
    return false;
  }
  
  // Check if already purchased
  if (isUpgradePurchased(upgradeId, game)) {
    // console.warn(`[UNIFIED_UPGRADES] Upgrade already purchased: ${upgradeId}`);
    return false;
  }
  
  // Check if unlocked
  if (!isUpgradeUnlocked(upgrade, game)) {
    // console.warn(`[UNIFIED_UPGRADES] Upgrade not unlocked: ${upgradeId}`);
    return false;
  }
  
  // Apply travel discount if active
  const discountRate = game.travelDiscountGlobalUpgrades || 1;
  const finalCost = upgrade.cost * discountRate;
  
  // Check if can afford
  if (game.snowballs < finalCost) {
    // console.warn(`[UNIFIED_UPGRADES] Cannot afford upgrade: ${upgradeId}`);
    return false;
  }
  
  // Purchase the upgrade
  game.snowballs -= finalCost;
  
  // Log discount if applied
  if (discountRate < 1) {
    const discountPercent = Math.round((1 - discountRate) * 100);

  }
  game.unifiedUpgrades[upgradeId] = true;
  
  // Apply the effect
  applyUpgradeEffect(upgrade.effect, game);
  
  // Emit purchase event
  if (eventBus) {
    eventBus.emit('upgradePurchased', {
      upgradeId: upgradeId,
      type: upgrade.type,
      cost: upgrade.cost
    });
  }
  
  // Save game state
  if (game.save) {
    game.save();
  }
  
  // console.log(`[UNIFIED_UPGRADES] Purchased upgrade: ${upgrade.name}`);
  return true;
}

/**
 * Get all available upgrades (unlocked but not purchased)
 * @param {Object} game - Game state object
 * @returns {Array} Array of available upgrade objects
 */
export function getAvailableUpgrades(game) {
  return UNIFIED_UPGRADES.filter(upgrade => 
    isUpgradeUnlocked(upgrade, game) && !isUpgradePurchased(upgrade.id, game)
  );
}

/**
 * Get all purchased upgrades
 * @param {Object} game - Game state object
 * @returns {Array} Array of purchased upgrade objects
 */
export function getPurchasedUpgrades(game) {
  return UNIFIED_UPGRADES.filter(upgrade => 
    isUpgradePurchased(upgrade.id, game)
  );
}

/**
 * Get assistant multiplier from unified upgrades
 * @param {string} assistantId - Assistant ID
 * @param {Object} game - Game state object
 * @returns {number} Total multiplier for the assistant
 */
export function getAssistantMultiplier(assistantId, game) {
  let multiplier = 1;
  
  // Get boost effectiveness multiplier
  const boostEffectiveness = game.boostEffectiveness || 1;
  
  // Calculate total multiplier from all purchased upgrades
  UNIFIED_UPGRADES.forEach(upgrade => {
    if (isUpgradePurchased(upgrade.id, game) && upgrade.effect.type === 'assistantMultiplier') {
      if (upgrade.effect.assistantId === assistantId) {
        multiplier *= (1 + upgrade.effect.value * boostEffectiveness);
      }
    }
  });
  
  return multiplier;
}

/**
 * Get global SPS multiplier from unified upgrades
 * @param {Object} game - Game state object
 * @returns {number} Global SPS multiplier
 */
export function getGlobalSpsMultiplier(game) {
  return game.globalSpsMultiplier || 1;
}

/**
 * Get click multiplier from unified upgrades
 * @param {Object} game - Game state object
 * @returns {number} Click multiplier
 */
export function getClickMultiplier(game) {
  // Return the actual clickMultiplier property, not spc
  return game.clickMultiplier || 1;
}

/**
 * Get cost reduction from unified upgrades
 * @param {Object} game - Game state object
 * @returns {number} Cost reduction percentage
 */
export function getCostReduction(game) {
  return game.assistantCostReduction || 0;
}

/**
 * Mark SPS as dirty for recalculation
 */
export function markSPSDirty() {
  spsDirty = true;
}

/**
 * Check if SPS is dirty
 * @returns {boolean} True if SPS needs recalculation
 */
export function isSPSDirty() {
  return spsDirty;
}

/**
 * Mark SPS as clean after calculation
 */
export function markSPSClean() {
  spsDirty = false;
}

/**
 * Update unified upgrades UI
 * @param {Object} game - Game state object
 */
export function updateUnifiedUpgradesUI(game) {
  const container = document.getElementById('unified-upgrades-container');
  if (!container) {
    // console.warn('[UNIFIED_UPGRADES] Container not found: unified-upgrades-container');
    return;
  }
  
  container.innerHTML = '';
  
  // Get available upgrades
  const availableUpgrades = getAvailableUpgrades(game);
  
  if (availableUpgrades.length === 0) {
    container.innerHTML = '<p>No upgrades available.</p>';
    return;
  }
  
  // Sort upgrades by order
  availableUpgrades.sort((a, b) => a.order - b.order);
  
  // Group upgrades by type
  const upgradesByType = {};
  availableUpgrades.forEach(upgrade => {
    if (!upgradesByType[upgrade.type]) {
      upgradesByType[upgrade.type] = [];
    }
    upgradesByType[upgrade.type].push(upgrade);
  });
  
  // Render each type
  Object.entries(upgradesByType).forEach(([type, upgrades]) => {
    const typeSection = document.createElement('div');
    typeSection.style.marginBottom = '20px';
    
    const typeTitle = document.createElement('h3');
    typeTitle.textContent = getTypeDisplayName(type);
    typeSection.appendChild(typeTitle);
    
    upgrades.forEach(upgrade => {
      const upgradeDiv = document.createElement('div');
      upgradeDiv.style.border = '1px solid #ddd';
      upgradeDiv.style.margin = '5px 0';
      upgradeDiv.style.padding = '10px';
      upgradeDiv.style.borderRadius = '5px';
      
      const title = document.createElement('strong');
      title.textContent = upgrade.name;
      upgradeDiv.appendChild(title);
      
      const desc = document.createElement('p');
      desc.textContent = upgrade.description;
      desc.style.margin = '5px 0';
      upgradeDiv.appendChild(desc);
      
      const effect = document.createElement('p');
      effect.textContent = `Effect: ${getEffectDisplayText(upgrade.effect)}`;
      effect.style.fontSize = '12px';
      effect.style.color = '#666';
      upgradeDiv.appendChild(effect);
      
      // Apply travel discount if active
      const discountRate = game.travelDiscountGlobalUpgrades || 1;
      const finalCost = upgrade.cost * discountRate;
      
      const cost = document.createElement('p');
      if (discountRate < 1) {
        const discountPercent = Math.round((1 - discountRate) * 100);
        cost.innerHTML = `Cost: <span style="text-decoration: line-through; color: #888;">${formatSnowballs(upgrade.cost)}</span> <span style="color: #4CAF50;">${formatSnowballs(finalCost)}</span> snowballs (${discountPercent}% off!)`;
      } else {
        cost.textContent = `Cost: ${formatSnowballs(upgrade.cost)} snowballs`;
      }
      cost.style.fontSize = '12px';
      cost.style.color = '#666';
      upgradeDiv.appendChild(cost);
      
      const button = document.createElement('button');
      button.textContent = 'Purchase';
      button.onclick = () => {
        if (purchaseUpgrade(upgrade.id, game)) {
          // Refresh UI after purchase
          updateUnifiedUpgradesUI(game);
          // Update other UI components
          // Disabled old assistant UI - using new GameReadyUIManager instead
          // if (window.updateAssistantsUI) {
          //   window.updateAssistantsUI(game);
          // }
          if (window.updateInventoryDisplay) {
            window.updateInventoryDisplay(game);
          }
        }
      };
      upgradeDiv.appendChild(button);
      
      typeSection.appendChild(upgradeDiv);
    });
    
    container.appendChild(typeSection);
  });
}

/**
 * Get display name for upgrade type
 * @param {string} type - Upgrade type
 * @returns {string} Display name
 */
function getTypeDisplayName(type) {
  switch (type) {
    case 'boost': return 'Boosts';
    case 'global': return 'Global Upgrades';
    case 'yetiJr': return 'Yeti Jr';
    case 'clickMultiplier': return 'Click Multipliers';
    default: return type;
  }
}

/**
 * Get display text for effect
 * @param {Object} effect - Effect object
 * @returns {string} Display text
 */
function getEffectDisplayText(effect) {
  switch (effect.type) {
    case 'spsMultiplier':
      return `+${(effect.value * 100).toFixed(1)}% SPS`;
    case 'clickMultiplier':
      return `+${(effect.value * 100).toFixed(1)}% Click Power`;
    case 'assistantMultiplier':
      const assistantName = ASSISTANTS.find(a => a.id === effect.assistantId)?.name || effect.assistantId;
      return `+${(effect.value * 100).toFixed(1)}% ${assistantName} SPS`;
    case 'costReduction':
      return `-${(effect.value * 100).toFixed(1)}% Assistant Cost`;
    case 'boostEffectiveness':
      return `+${(effect.value * 100).toFixed(1)}% Boost Effectiveness`;
    case 'grantSnowballs':
      return `+${formatSnowballs(effect.value)} Snowballs`;
    case 'unlockLocation':
      return `Unlock ${effect.locationId}`;
    default:
      return `${effect.type}: ${effect.value}`;
  }
} 