// systems/assistants.js   Passive generators
import { getAssistantMultiplier, markSPSDirty } from './unifiedUpgrades.js';
import { calculateUnifiedSPS } from './unifiedSPS.js';
import { ASSISTANTS } from './data/assistantData.js';
import { updateUnifiedUpgradesUI } from './unifiedUpgrades.js';
import { spendIcicles } from './icicle.js';

// Simple cost cache for memoization - Phase 2
const costCache = new Map();

export function getCurrentCost(assistant, count) {
  // Performance measurement - Phase 1
  const startTime = performance.now();
  
  // Simple memoization - Phase 2
  const cacheKey = `${assistant.id}_${count}`;
  if (costCache.has(cacheKey)) {
    const endTime = performance.now();
    const calculationTime = endTime - startTime;
    
    // Log cache hit performance (only if it takes more than 0.1ms to avoid spam)
    if (calculationTime > 0.1) {
  
    }
    
    return costCache.get(cacheKey);
  }
  
  // Calculate new value
  const result = assistant.cost * Math.pow(assistant.costRate, count);
  
  // Cache the result
  costCache.set(cacheKey, result);
  
  // Performance measurement - Phase 1
  const endTime = performance.now();
  const calculationTime = endTime - startTime;
  
  // Log performance metrics (only if calculation takes more than 0.1ms to avoid spam)
  if (calculationTime > 0.1) {

  }
  
  return result;
}

// Clear cost cache when assistant count changes
export function clearCostCache() {
  costCache.clear();
  
}

export function setupAssistants(game) {
  // console.log(`[ASSISTANTS DEBUG] Setting up assistants...`);
  // console.log(`[ASSISTANTS DEBUG] Initial assistants state:`, game.assistants);
  
  ASSISTANTS.forEach((assistant) => {
    if (!(assistant.id in game.assistants)) {
      game.assistants[assistant.id] = 0;
      // console.log(`[ASSISTANTS DEBUG] Initialized ${assistant.id} with count 0`);
    }
    if (!(assistant.id in game.lifetimeFromAssistants)) {
      game.lifetimeFromAssistants[assistant.id] = 0;
    }
  });
  
  // Ensure assistantLevels exists
  if (!game.assistantLevels) {
    game.assistantLevels = {};
  }
  
  // console.log(`[ASSISTANTS DEBUG] Final assistants state:`, game.assistants);
}

export function updateAssistantsUI(game) {
  // console.log(`[ASSISTANTS DEBUG] Updating assistants UI...`);
  // console.log(`[ASSISTANTS DEBUG] Current assistants state:`, game.assistants);
  
  // Disabled old UI system - using new GameReadyUIManager instead
  // console.log('[ASSISTANTS DEBUG] Old UI system disabled - using new GameReadyUIManager');
  return;
  
  const container = document.getElementById('assistants-container');
  if (!container) {
    // console.log('[ASSISTANTS DEBUG] assistants-container not found, skipping UI update');
    return;
  }
  container.innerHTML = '';

  ASSISTANTS.forEach((assistant) => {
    const count = game.assistants[assistant.id] || 0;
    const lifetime = game.lifetimeFromAssistants[assistant.id] || 0;
    const sps = game._spsByAssistant?.[assistant.id] || 0;
    const currentCost = getCurrentCost(assistant, count);
    const level = game.assistantLevels?.[assistant.id] || 0;
    const levelUpCost = level + 1; // Level 1 costs 1 icicle, level 2 costs 2 icicles, etc.
    const icicleCount = game.icicles || 0;

    // console.log(`[ASSISTANTS DEBUG] Rendering ${assistant.id}: count=${count}, cost=${currentCost}`);

    const wrapper = document.createElement('div');
    wrapper.style.border = '1px solid #ccc';
    wrapper.style.margin = '5px';
    wrapper.style.padding = '10px';

    const name = document.createElement('h3');
    name.textContent = assistant.name;

    const desc = document.createElement('p');
    desc.textContent = assistant.description;

    const stats = document.createElement('p');
    stats.innerHTML = `
      Owned: ${count}<br>
      Level: ${level}<br>
      SPS: ${sps.toExponential(2)}<br>
      Lifetime: ${lifetime.toExponential(2)}
    `;

    // Apply location discount if active
    const discountRate = game.travelDiscountAssistants || 1;
    const finalCost = currentCost * discountRate;

    const button = document.createElement('button');
    if (discountRate < 1) {
      const discountPercent = Math.round((1 - discountRate) * 100);
      button.innerHTML = `Buy for <span style="text-decoration: line-through; color: #888;">${currentCost.toExponential(2)}</span> <span style="color: #4CAF50;">${finalCost.toExponential(2)}</span> Snowballs (${discountPercent}% off!)`;
    } else {
      button.textContent = `Buy for ${currentCost.toExponential(2)} Snowballs`;
    }

    const boostMult = getAssistantMultiplier(assistant.id, game);
    stats.innerHTML += `<br>Boost Multiplier: ×${boostMult.toExponential(2)}`;

    button.onclick = () => {
      // console.log(`[ASSISTANTS DEBUG] Purchase attempt for ${assistant.id}: cost=${finalCost}, available=${game.snowballs}`);
      if (game.snowballs >= finalCost) {
        game.snowballs -= finalCost;
        
        // Log discount if applied
        if (discountRate < 1) {
          const discountPercent = Math.round((1 - discountRate) * 100);
          
        }
        
        game.assistants[assistant.id]++;
        
        // Clear cost cache since assistant count changed - Phase 2
        clearCostCache();
        
        // Mark SPS as dirty since assistant count changed - Phase 3
        markSPSDirty();
        
        game.save();
        calculateUnifiedSPS(game);
        updateAssistantsUI(game);
        updateUnifiedUpgradesUI(game);
        
        // Emit assistant purchased event
        if (window.eventBus) {
          window.eventBus.emit('assistantPurchased', {
            assistantId: assistant.id,
            count: game.assistants[assistant.id],
            cost: finalCost
          });
        }
        
        // Emit babyYetiOwnershipChanged event for achievement system if this is a Baby Yeti
        if (assistant.id === 'babyYeti' && window.eventBus) {
          window.eventBus.emit('babyYetiOwnershipChanged', {
            assistantId: assistant.id,
            count: game.assistants[assistant.id]
          });
        }
        
        // Update inventory display
        if (window.updateInventoryDisplay) {
          window.updateInventoryDisplay(game);
        }
        
        // console.log(`[ASSISTANTS DEBUG] Purchase successful for ${assistant.id}`);
      } else {
        // console.log(`[ASSISTANTS DEBUG] Purchase failed for ${assistant.id}: insufficient funds`);
      }
    };

    wrapper.appendChild(name);
    wrapper.appendChild(desc);
    wrapper.appendChild(stats);
    wrapper.appendChild(button);

    // Add level-up button if assistant is owned and icicles are available
    if (count > 0 && icicleCount >= levelUpCost) {
      const levelUpButton = document.createElement('button');
      levelUpButton.textContent = `Level Up (${levelUpCost} icicles)`;
      levelUpButton.style.marginLeft = '10px';
      levelUpButton.style.backgroundColor = '#4CAF50';
      levelUpButton.style.color = 'white';
      levelUpButton.style.border = 'none';
      levelUpButton.style.padding = '5px 10px';
      levelUpButton.style.borderRadius = '3px';
      levelUpButton.style.cursor = 'pointer';
      
      levelUpButton.onclick = () => {
        if (spendIcicles(game, levelUpCost)) {
          // Ensure assistantLevels exists (simple initialization)
          if (!game.assistantLevels) {
            game.assistantLevels = {};
          }
          
          game.assistantLevels[assistant.id] = (game.assistantLevels[assistant.id] || 0) + 1;
          
          // Mark SPS as dirty since assistant level changed - Phase 3
          markSPSDirty();
          
          game.save();
          calculateSPSWithBoosts(game);
          updateAssistantsUI(game);
          
          // Emit assistant leveled up event for other systems
          if (window.eventBus) {
            window.eventBus.emit('assistantLeveledUp', {
              assistantId: assistant.id,
              newLevel: game.assistantLevels[assistant.id]
            });
          }
          
          // Force game display update to refresh wallet
          if (game.updateDisplay) {
            game.updateDisplay();
          }
          
          // Update icicle bonus display
          // Icicle system is now auto-harvesting - no manual UI updates needed
          
          // Update inventory display
          if (window.updateInventoryDisplay) {
            window.updateInventoryDisplay(game);
          }
        }
      };
      
      wrapper.appendChild(levelUpButton);
    }

    container.appendChild(wrapper);
  });
}