/**
 * loops/hybrid/abilityBelt.js - Ability Belt Management System
 * 
 * This module handles the ability belt system for enhanced abilities:
 * - Loading and displaying available abilities
 * - Managing the 4-slot ability belt loadout
 * - Validating ability selections (no duplicates)
 * - Persisting ability belt state
 */

import { SLOT_ABILITIES } from './data/abilitiesData.js';
import { eventBus } from '../../core/eventBus.js';

/**
 * Get all available abilities from all classes
 * @returns {Array} Array of all ability objects with class information
 */
export function getAllAvailableAbilities() {
  const allAbilities = [];
  
  // Iterate through each class and collect all abilities
  for (const [className, classData] of Object.entries(SLOT_ABILITIES)) {
    for (const ability of classData.abilities) {
      allAbilities.push({
        ...ability,
        class: className  // Add class information to each ability
      });
    }
  }
  
  return allAbilities;
}

/**
 * Get abilities organized by class
 * @returns {Object} Object with class names as keys and arrays of abilities as values
 */
export function getAbilitiesByClass() {
  const abilitiesByClass = {};
  
  for (const [className, classData] of Object.entries(SLOT_ABILITIES)) {
    abilitiesByClass[className] = classData.abilities.map(ability => ({
      ...ability,
      class: className
    }));
  }
  
  return abilitiesByClass;
}

/**
 * Get ability by ID
 * @param {string} abilityId - The ability ID to search for
 * @returns {Object|null} The ability object with class information, or null if not found
 */
export function getAbilityById(abilityId) {
  for (const [className, classData] of Object.entries(SLOT_ABILITIES)) {
    for (const ability of classData.abilities) {
      if (ability.id === abilityId) {
        return {
          ...ability,
          class: className
        };
      }
    }
  }
  return null;
}

/**
 * Get the current ability belt loadout
 * @param {GameStateFlat} game - The current game state object
 * @returns {Object} Object with slot1-4 keys containing ability IDs or null
 */
export function getAbilityBelt(game) {
  if (!game.loops?.hybrid?.abilities?.abilityBelt) {
    return { slot1: null, slot2: null, slot3: null, slot4: null };
  }
  
  return { ...game.loops.hybrid.abilities.abilityBelt };
}

/**
 * Set an ability in a specific slot
 * @param {GameStateFlat} game - The current game state object
 * @param {number} slotNumber - The slot number (1-4)
 * @param {string|null} abilityId - The ability ID to set, or null to clear
 * @returns {boolean} True if successful, false if validation failed
 */
export function setAbilityInSlot(game, slotNumber, abilityId) {
  if (slotNumber < 1 || slotNumber > 4) {
    console.error('[ABILITY BELT] Invalid slot number:', slotNumber);
    return false;
  }
  
  // Ensure the ability belt structure exists
  if (!game.loops?.hybrid?.abilities?.abilityBelt) {
    if (!game.loops) game.loops = {};
    if (!game.loops.hybrid) game.loops.hybrid = {};
    if (!game.loops.hybrid.abilities) game.loops.hybrid.abilities = {};
    game.loops.hybrid.abilities.abilityBelt = {
      slot1: null, slot2: null, slot3: null, slot4: null
    };
  }
  
  // If setting an ability (not clearing), validate it
  if (abilityId !== null) {
    // Check if ability exists
    const ability = getAbilityById(abilityId);
    if (!ability) {
      console.error('[ABILITY BELT] Ability not found:', abilityId);
      return false;
    }
    
    // Check if ability is already in another slot
    const currentBelt = getAbilityBelt(game);
    const slotKey = `slot${slotNumber}`;
    
    for (const [slot, currentAbilityId] of Object.entries(currentBelt)) {
      if (slot !== slotKey && currentAbilityId === abilityId) {
        console.error('[ABILITY BELT] Ability already equipped in another slot:', abilityId);
        return false;
      }
    }
  }
  
  // Set the ability
  const slotKey = `slot${slotNumber}`;
  game.loops.hybrid.abilities.abilityBelt[slotKey] = abilityId;
  
  // Save the game
  game.save();
  
  // Emit event for UI updates
  eventBus.emit('abilityBeltChanged', {
    slotNumber,
    abilityId,
    newBelt: getAbilityBelt(game)
  });
  
  return true;
}

/**
 * Get the abilities currently equipped in the belt with full details
 * @param {GameStateFlat} game - The current game state object
 * @returns {Array} Array of ability objects (with nulls for empty slots)
 */
export function getEquippedAbilities(game) {
  const belt = getAbilityBelt(game);
  const equipped = [];
  
  for (let i = 1; i <= 4; i++) {
    const slotKey = `slot${i}`;
    const abilityId = belt[slotKey];
    
    if (abilityId) {
      const ability = getAbilityById(abilityId);
      equipped.push(ability);
    } else {
      equipped.push(null);
    }
  }
  
  return equipped;
}

/**
 * Clear all abilities from the belt
 * @param {GameStateFlat} game - The current game state object
 */
export function clearAbilityBelt(game) {
  if (!game.loops?.hybrid?.abilities?.abilityBelt) {
    return;
  }
  
  game.loops.hybrid.abilities.abilityBelt = {
    slot1: null,
    slot2: null,
    slot3: null,
    slot4: null
  };
  
  game.save();
  
  // Emit event for UI updates
  eventBus.emit('abilityBeltChanged', {
    action: 'cleared',
    newBelt: getAbilityBelt(game)
  });
}

/**
 * Check if an ability is currently equipped
 * @param {GameStateFlat} game - The current game state object
 * @param {string} abilityId - The ability ID to check
 * @returns {number|null} The slot number (1-4) if equipped, null if not equipped
 */
export function isAbilityEquipped(game, abilityId) {
  const belt = getAbilityBelt(game);
  
  for (let i = 1; i <= 4; i++) {
    const slotKey = `slot${i}`;
    if (belt[slotKey] === abilityId) {
      return i;
    }
  }
  
  return null;
}

/**
 * Get usage statistics for abilities
 * @param {GameStateFlat} game - The current game state object
 * @returns {Object} Usage statistics object
 */
export function getAbilityUsageStats(game) {
  if (!game.loops?.hybrid?.abilities?.usage) {
    return {};
  }
  
  return { ...game.loops.hybrid.abilities.usage };
}

/**
 * Record ability usage (for future implementation)
 * @param {GameStateFlat} game - The current game state object
 * @param {string} abilityId - The ability ID that was used
 */
export function recordAbilityUsage(game, abilityId) {
  if (!game.loops?.hybrid?.abilities?.usage) {
    if (!game.loops) game.loops = {};
    if (!game.loops.hybrid) game.loops.hybrid = {};
    if (!game.loops.hybrid.abilities) game.loops.hybrid.abilities = {};
    game.loops.hybrid.abilities.usage = {};
  }
  
  const currentUsage = game.loops.hybrid.abilities.usage[abilityId] || 0;
  game.loops.hybrid.abilities.usage[abilityId] = currentUsage + 1;
  
  // Update statistics
  if (!game.loops.hybrid.abilities.statistics) {
    game.loops.hybrid.abilities.statistics = {
      totalActivations: 0,
      favoriteAbility: null,
      classDistribution: {}
    };
  }
  
  game.loops.hybrid.abilities.statistics.totalActivations++;
  
  // Determine favorite ability
  let maxUsage = 0;
  let favoriteAbility = null;
  
  for (const [id, usage] of Object.entries(game.loops.hybrid.abilities.usage)) {
    if (usage > maxUsage) {
      maxUsage = usage;
      favoriteAbility = id;
    }
  }
  
  game.loops.hybrid.abilities.statistics.favoriteAbility = favoriteAbility;
  
  // Emit abilityUsed event for achievement system
  if (window.eventBus) {
    window.eventBus.emit('abilityUsed', {
      abilityId: abilityId,
      totalUsage: game.loops.hybrid.abilities.statistics.totalActivations
    });
  }
  
  game.save();
}

/**
 * Setup ability belt system and make functions globally available
 * @param {GameStateFlat} game - The current game state object
 */
export function setupAbilityBelt(game) {
  // Check if abilities system is unlocked
  if (!game.abilitiesUnlocked) {
    // console.log('[ABILITY BELT] Abilities system is disabled - unlock required');
    
    // Handle GameReadyUIManager ability belt structure
    const abilitySlots = document.getElementById('ability-slots');
    const abilityBeltFrozen = document.getElementById('ability-belt-frozen');
    const abilitySelection = document.getElementById('ability-selection');
    
    if (abilitySlots && abilityBeltFrozen && abilitySelection) {
      // Hide the normal ability slots and selection
      abilitySlots.style.display = 'none';
      abilitySelection.style.display = 'none';
      
      // Show locked message in the frozen container
      abilityBeltFrozen.innerHTML = `
        <div class="ability-belt-disabled">
          <div class="ability-belt-frozen-icon">🔒</div>
          <strong>Ability Belt</strong><br>
          <em>This feature is currently locked.</em><br>
          <strong>Unlock in Snowflake Marketplace</strong>
        </div>
      `;
      abilityBeltFrozen.style.display = 'block';
      
      // console.log('[ABILITY BELT] Locked message displayed in GameReadyUIManager UI');
    } else {
      // Fallback for other UI structures
      const abilityBeltContainer = document.getElementById('ability-belt-container');
      if (abilityBeltContainer) {
        abilityBeltContainer.innerHTML = `
          <div class="ability-belt-disabled">
            <h3>Ability Belt</h3>
            <p>This feature is currently locked.</p>
            <p><strong>Unlock in Snowflake Marketplace</strong></p>
          </div>
        `;
      }
      
      // Also check for any other ability belt related containers
      const abilityBeltSection = document.querySelector('.ability-belt-section');
      if (abilityBeltSection) {
        // Insert locked message between header and slots
        const header = abilityBeltSection.querySelector('.ability-belt-header');
        const slots = abilityBeltSection.querySelector('.ability-slots');
        
        if (header && slots) {
          // Remove any existing locked message
          const existingMessage = abilityBeltSection.querySelector('.ability-belt-locked-message');
          if (existingMessage) {
            existingMessage.remove();
          }
          
          // Create and insert locked message
          const lockedMessage = document.createElement('div');
          lockedMessage.className = 'ability-belt-locked-message';
          lockedMessage.innerHTML = `
            <div class="ability-belt-status ability-disabled">
              <div class="ability-locked-message">
                <h3>Ability Belt</h3>
                <p>This feature is currently locked.</p>
                <p><strong>Unlock in Snowflake Marketplace</strong></p>
              </div>
            </div>
          `;
          
          // Insert between header and slots
          header.parentNode.insertBefore(lockedMessage, slots);
        }
      }
    }
    
    return;
  }
  
  // Make ability belt functions available globally for battle system
  window.getAbilityBelt = getAbilityBelt;
  window.getAbilityById = getAbilityById;
  window.getEquippedAbilities = getEquippedAbilities;
  window.setAbilityInSlot = setAbilityInSlot;
  window.clearAbilityBelt = clearAbilityBelt;
  window.isAbilityEquipped = isAbilityEquipped;
  
  // Remove any locked messages when ability belt becomes active
  removeAbilityBeltLockedMessage();
  
  // console.log('[ABILITY BELT] Setup complete - functions available globally');
}

/**
 * Remove the ability belt locked message when system becomes active
 */
function removeAbilityBeltLockedMessage() {
  // Handle GameReadyUIManager structure
  const abilitySlots = document.getElementById('ability-slots');
  const abilityBeltFrozen = document.getElementById('ability-belt-frozen');
  const abilitySelection = document.getElementById('ability-selection');
  
  if (abilitySlots && abilityBeltFrozen && abilitySelection) {
    // Restore normal ability belt display
    abilitySlots.style.display = 'block';
    abilitySelection.style.display = 'block';
    abilityBeltFrozen.style.display = 'none';
    // console.log('[ABILITY BELT] Restored GameReadyUIManager ability belt display');
  }
  
  // Remove any other locked messages
  const lockedMessage = document.querySelector('.ability-belt-locked-message');
  if (lockedMessage) {
    lockedMessage.remove();
    // console.log('[ABILITY BELT] Removed locked message - system now active');
  }
} 