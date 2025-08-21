/**
 * systems/inventory.js - Inventory display system
 * 
 * This module handles the display of player inventory in the middle column.
 * It shows owned assistants, upgrades, achievements, and other collectibles.
 */

import { ASSISTANTS } from '../loops/passive/data/assistantData.js';
import { UNIFIED_UPGRADES, getUpgradeById } from '../loops/passive/data/unifiedUpgradeData.js';
import { 
  getAllAvailableAbilities, 
  getAbilitiesByClass, 
  getAbilityBelt, 
  setAbilityInSlot, 
  clearAbilityBelt, 
  isAbilityEquipped 
} from '../loops/hybrid/abilityBelt.js';
import { isYetiVisible, getCurrentSpawnedYeti } from '../loops/hybrid/yetis.js';

/**
 * Updates the inventory display with current owned items
 * @param {GameStateFlat} game - The current game state object
 */
export function updateInventoryDisplay(game) {
  const container = document.getElementById('inventory-content');
  if (!container) return;

  container.innerHTML = '';

  // Assistants Section
  const assistantsSection = document.createElement('div');
  assistantsSection.innerHTML = '<h3>Assistants</h3>';
  
  let hasAssistants = false;
  for (const assistant of ASSISTANTS) {
    const count = game.assistants[assistant.id] || 0;
    if (count > 0) {
      hasAssistants = true;
      assistantsSection.innerHTML += `
        <div style="border: 1px solid #ddd; margin: 5px; padding: 10px; border-radius: 5px;">
          <strong>${assistant.name}</strong><br>
          Owned: ${count}<br>
          <em>${assistant.description}</em>
        </div>
      `;
    }
  }
  
  if (!hasAssistants) {
    assistantsSection.innerHTML += '<p>No assistants owned yet.</p>';
  }
  
  container.appendChild(assistantsSection);

  // Unified Upgrades Section
  const upgradesSection = document.createElement('div');
  upgradesSection.innerHTML = '<h3>Unified Upgrades</h3>';
  
  const unifiedUpgrades = game.unifiedUpgrades || {};
  const ownedUpgrades = Object.keys(unifiedUpgrades).filter(id => unifiedUpgrades[id]);
  
  if (ownedUpgrades.length > 0) {
    ownedUpgrades.forEach(upgradeId => {
      const upgrade = getUpgradeById(upgradeId);
      if (upgrade) {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.style.border = '1px solid #ddd';
        upgradeDiv.style.margin = '5px';
        upgradeDiv.style.padding = '10px';
        upgradeDiv.style.borderRadius = '5px';
        
        upgradeDiv.innerHTML = `
          <strong>${upgrade.name}</strong> (${upgrade.type})<br>
          <em>${upgrade.description}</em><br>
          <small>Cost: ${upgrade.cost.toExponential(2)} snowballs</small>
        `;
        
        upgradesSection.appendChild(upgradeDiv);
      }
    });
  } else {
    upgradesSection.innerHTML += '<p>No upgrades owned yet.</p>';
  }
  
  container.appendChild(upgradesSection);



  // Persistent Upgrades Section (from snowflakes)
  const persistentSection = document.createElement('div');
  persistentSection.innerHTML = '<h3>Persistent Upgrades</h3>';
  
  const persistentUpgrades = game.persistentUpgrades || [];
  
  if (persistentUpgrades.length > 0) {
    persistentSection.innerHTML += `<p>Owned: ${persistentUpgrades.length} persistent upgrades</p>`;
  } else {
    persistentSection.innerHTML += '<p>No persistent upgrades owned yet.</p>';
  }
  
  container.appendChild(persistentSection);

  // Ability Belt Section
  const abilityBeltSection = document.createElement('div');
  abilityBeltSection.innerHTML = '<h3>Ability Belt</h3>';
  
  // Get current ability belt state
  const currentBelt = getAbilityBelt(game);
  const abilitiesByClass = getAbilitiesByClass();
  
  // Check if yeti is visible OR buff is active (belt should be frozen)
  const yetiVisible = isYetiVisible();
  const spawnedYeti = getCurrentSpawnedYeti();
  const yetiBuffActive = game.currentYetiBuff !== null;
  const shouldFreeze = yetiVisible || yetiBuffActive;
  
  // Create ability belt interface
  const abilityBeltContainer = document.createElement('div');
  abilityBeltContainer.style.border = '1px solid #ddd';
  abilityBeltContainer.style.padding = '10px';
  abilityBeltContainer.style.borderRadius = '5px';
  abilityBeltContainer.style.marginBottom = '10px';
  
  // Create slots display
  const slotsContainer = document.createElement('div');
  slotsContainer.innerHTML = '<h4>Current Loadout:</h4>';
  
  for (let i = 1; i <= 4; i++) {
    const slotDiv = document.createElement('div');
    slotDiv.style.margin = '5px 0';
    slotDiv.style.padding = '5px';
    slotDiv.style.border = '1px solid #ccc';
    slotDiv.style.borderRadius = '3px';
    
    const slotKey = `slot${i}`;
    const abilityId = currentBelt[slotKey];
    
    if (abilityId) {
      // Find the ability details
      let abilityDetails = null;
      for (const [className, abilities] of Object.entries(abilitiesByClass)) {
        for (const ability of abilities) {
          if (ability.id === abilityId) {
            abilityDetails = { ...ability, class: className };
            break;
          }
        }
        if (abilityDetails) break;
      }
      
      if (abilityDetails) {
        slotDiv.innerHTML = `
          <strong>Slot ${i}:</strong> ${abilityDetails.name} (${abilityDetails.class})<br>
          <em>${abilityDetails.description}</em><br>
          <small>Effect: ${abilityDetails.effect.effectType} ${(abilityDetails.effect.value * 100)}% ${abilityDetails.effect.target}</small>
        `;
      } else {
        slotDiv.innerHTML = `<strong>Slot ${i}:</strong> Unknown ability (${abilityId})`;
      }
    } else {
      slotDiv.innerHTML = `<strong>Slot ${i}:</strong> <em>Empty</em>`;
    }
    
    slotsContainer.appendChild(slotDiv);
  }
  
  abilityBeltContainer.appendChild(slotsContainer);
  
  // Check if ability belt is frozen due to yeti visibility OR active buff
  if (shouldFreeze) {
    const frozenMessage = document.createElement('div');
    frozenMessage.style.backgroundColor = '#fff3cd';
    frozenMessage.style.border = '1px solid #ffeaa7';
    frozenMessage.style.padding = '10px';
    frozenMessage.style.margin = '10px 0';
    frozenMessage.style.borderRadius = '5px';
    frozenMessage.style.color = '#856404';
    
    let message = '<strong>⚠️ Ability Belt Frozen</strong><br>';
    
    if (yetiVisible && yetiBuffActive) {
      message += `<em>The ability belt is frozen while ${spawnedYeti ? spawnedYeti.name : 'a yeti'} is visible and a yeti buff is active.<br>The belt will unfreeze when both the yeti despawns and the buff expires.</em>`;
    } else if (yetiVisible) {
      message += `<em>The ability belt is frozen while ${spawnedYeti ? spawnedYeti.name : 'a yeti'} is visible.<br>Click on the yeti or wait for it to disappear.</em>`;
    } else if (yetiBuffActive) {
      const buffClass = game.currentYetiBuff.class;
      message += `<em>The ability belt is frozen while a ${buffClass} yeti buff is active.<br>Wait for the buff to expire to modify your loadout.</em>`;
    }
    
    frozenMessage.innerHTML = message;
    abilityBeltContainer.appendChild(frozenMessage);
    
    // Skip the selection interface when frozen
    abilityBeltSection.appendChild(abilityBeltContainer);
    container.appendChild(abilityBeltSection);
    return;
  }
  
  // Create ability selection interface
  const selectionContainer = document.createElement('div');
  selectionContainer.innerHTML = '<h4>Select Abilities:</h4>';
  
  // Create dropdowns for each slot
  for (let i = 1; i <= 4; i++) {
    const slotSelectionDiv = document.createElement('div');
    slotSelectionDiv.style.margin = '10px 0';
    
    const label = document.createElement('label');
    label.textContent = `Slot ${i}: `;
    label.style.fontWeight = 'bold';
    
    const select = document.createElement('select');
    select.style.margin = '0 10px';
    select.style.padding = '3px';
    
    // Add empty option
    const emptyOption = document.createElement('option');
    emptyOption.value = '';
    emptyOption.textContent = '(Empty)';
    select.appendChild(emptyOption);
    
    // Add abilities grouped by class
    for (const [className, abilities] of Object.entries(abilitiesByClass)) {
      const optgroup = document.createElement('optgroup');
      optgroup.label = className.charAt(0).toUpperCase() + className.slice(1);
      
      for (const ability of abilities) {
        const option = document.createElement('option');
        option.value = ability.id;
        option.textContent = `${ability.name} - ${ability.description}`;
        
        // Disable if already equipped in another slot
        const equippedSlot = isAbilityEquipped(game, ability.id);
        if (equippedSlot && equippedSlot !== i) {
          option.disabled = true;
          option.textContent += ` (equipped in slot ${equippedSlot})`;
        }
        
        optgroup.appendChild(option);
      }
      
      select.appendChild(optgroup);
    }
    
    // Set current selection
    const slotKey = `slot${i}`;
    if (currentBelt[slotKey]) {
      select.value = currentBelt[slotKey];
    }
    
    // Add change handler
    select.addEventListener('change', (e) => {
      const selectedAbilityId = e.target.value || null;
      const success = setAbilityInSlot(game, i, selectedAbilityId);
      
      if (success) {
        // Refresh the inventory display
        updateInventoryDisplay(game);
      } else {
        // Reset the selection if it failed
        select.value = currentBelt[slotKey] || '';
      }
    });
    
    slotSelectionDiv.appendChild(label);
    slotSelectionDiv.appendChild(select);
    
    selectionContainer.appendChild(slotSelectionDiv);
  }
  
  // Add clear all button
  const clearAllButton = document.createElement('button');
  clearAllButton.textContent = 'Clear All Abilities';
  clearAllButton.style.marginTop = '10px';
  clearAllButton.style.padding = '5px 10px';
  clearAllButton.style.backgroundColor = '#ff6b6b';
  clearAllButton.style.color = 'white';
  clearAllButton.style.border = 'none';
  clearAllButton.style.borderRadius = '3px';
  clearAllButton.style.cursor = 'pointer';
  
  clearAllButton.addEventListener('click', () => {
    clearAbilityBelt(game);
    updateInventoryDisplay(game);
  });
  
  selectionContainer.appendChild(clearAllButton);
  abilityBeltContainer.appendChild(selectionContainer);
  
  abilityBeltSection.appendChild(abilityBeltContainer);
  container.appendChild(abilityBeltSection);
} 