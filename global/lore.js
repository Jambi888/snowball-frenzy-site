/**
 * systems/lore.js - Lore tracking and unlocking system
 * 
 * This module handles the lore system, tracking player progress
 * and unlocking lore entries when conditions are met.
 * 
 * Key features:
 * - Tracks various game events that can unlock lore
 * - Checks lore unlock conditions
 * - Awards lore and stores them with timestamps
 * - Provides lore display functionality
 * - Supports new book/chapter structure
 * - Handles assistant_quantity triggers
 */

import { LORE } from './data/loreData.js';

// -------------------------------
// lore.js
// -------------------------------

/**
 * Initialize the lore system for a game state
 * @param {GameStateFlat} game - The current game state object
 */
export function initializeLore(game) {
  // Initialize lore tracking if it doesn't exist
  if (!game.lore) {
    // console.log('[LORE DEBUG] Creating new lore object');
    game.lore = {
      unlocked: [],
      unlockedTimestamps: {}, // Track when each lore was unlocked
      viewed: {},
      lastCheck: game.getGameTime()
    };
  } else {
    // console.log('[LORE DEBUG] Lore object already exists:', game.lore);
    // Ensure unlockedTimestamps exists for backward compatibility
    if (!game.lore.unlockedTimestamps) {
      game.lore.unlockedTimestamps = {};
    }
  }
  
  // Set up event listeners for lore triggers
  if (window.eventBus) {
    // Listen for assistant purchases (for both regular and quantity triggers)
    window.eventBus.on('assistantPurchased', (data) => {
      // Check for regular assistant purchase triggers
      checkLoreForAssistant(game, data.assistantId);
      
      // Check for assistant quantity triggers
      checkLoreForAssistantQuantity(game, data.assistantId);
    }, 'lore');
    
    // Listen for upgrade purchases
    window.eventBus.on('upgradePurchased', (data) => {
      checkLoreForUpgrade(game, data.upgradeId);
    }, 'lore');
    
    // Listen for boost purchases
    window.eventBus.on('boostPurchased', (data) => {
      checkLoreForBoost(game, data.boostId);
    }, 'lore');
    
    // Listen for achievement unlocks
    window.eventBus.on('achievementUnlocked', (data) => {
      checkLoreForAchievement(game, data.achievementId);
    }, 'lore');
    
    // Listen for icicle events
    window.eventBus.on('icicleHarvested', (data) => {
      checkLoreForIcicle(game, 'first_harvest');
    }, 'lore');
    
    window.eventBus.on('assistantLeveledUp', (data) => {
      checkLoreForIcicle(game, 'first_level_up');
    }, 'lore');
  }
  
  // console.log('[LORE] Lore system initialized');
}

/**
 * Get all lore entries from the book/chapter structure
 * @returns {Array} Array of all lore entries
 */
function getAllLoreEntries() {
  const allLore = [];
  
  for (const book of LORE.books) {
    for (const chapter of book.chapters) {
      for (const loreEntry of chapter.lore) {
        allLore.push(loreEntry);
      }
    }
  }
  
  return allLore;
}

/**
 * Check lore unlocks for a specific trigger
 * @param {GameStateFlat} game - The current game state object
 * @param {string} triggerType - Type of trigger ('achievement', 'assistant', 'upgrade', 'assistant_quantity')
 * @param {string} triggerId - ID of the trigger
 */
export function checkLoreUnlock(game, triggerType, triggerId) {
  if (!game.lore) return;
  
  const unlocked = game.lore.unlocked;
  const newlyUnlocked = [];
  
  // Get all lore entries from the book/chapter structure
  const allLoreEntries = getAllLoreEntries();
  
  for (const loreEntry of allLoreEntries) {
    // Skip if already unlocked
    if (unlocked.includes(loreEntry.id)) continue;
    
    const unlockCondition = loreEntry.unlocked_by;
    
    // Check if this lore entry is triggered by the current event
    if (unlockCondition.type === triggerType && unlockCondition.trigger === triggerId) {
      unlocked.push(loreEntry.id);
      game.lore.unlockedTimestamps[loreEntry.id] = Date.now();
      newlyUnlocked.push(loreEntry);
      
      // console.log(`[LORE] 📖 Unlocked: ${loreEntry.title}`);
    }
  }
  
  // Show notification for newly unlocked lore
  if (newlyUnlocked.length > 0) {
    showLoreNotification(newlyUnlocked);
  }
}

/**
 * Check lore unlocks for achievements
 * @param {GameStateFlat} game - The current game state object
 * @param {string} achievementId - ID of the achievement that was unlocked
 */
export function checkLoreForAchievement(game, achievementId) {
  checkLoreUnlock(game, 'achievement', achievementId);
}

/**
 * Check lore unlocks for assistants
 * @param {GameStateFlat} game - The current game state object
 * @param {string} assistantId - ID of the assistant that was purchased
 */
export function checkLoreForAssistant(game, assistantId) {
  checkLoreUnlock(game, 'assistant', assistantId);
}

/**
 * Check lore unlocks for upgrades
 * @param {GameStateFlat} game - The current game state object
 * @param {string} upgradeId - ID of the upgrade that was purchased
 */
export function checkLoreForUpgrade(game, upgradeId) {
  checkLoreUnlock(game, 'upgrade', upgradeId);
}

/**
 * Check lore unlocks for assistant quantities
 * @param {GameStateFlat} game - The current game state object
 * @param {string} assistantId - ID of the assistant to check quantity for
 */
export function checkLoreForAssistantQuantity(game, assistantId) {
  if (!game.lore || !game.assistants) return;
  
  const unlocked = game.lore.unlocked;
  const newlyUnlocked = [];
  
  // Get current quantity of this assistant
  const currentQuantity = game.assistants[assistantId] || 0;
  
  // Get all lore entries from the book/chapter structure
  const allLoreEntries = getAllLoreEntries();
  
  for (const loreEntry of allLoreEntries) {
    // Skip if already unlocked
    if (unlocked.includes(loreEntry.id)) continue;
    
    const unlockCondition = loreEntry.unlocked_by;
    
    // Check if this is an assistant_quantity trigger for the current assistant
    if (unlockCondition.type === 'assistant_quantity') {
      const [triggerAssistantId, requiredQuantity] = unlockCondition.trigger.split(':');
      
      if (triggerAssistantId === assistantId && currentQuantity >= parseInt(requiredQuantity)) {
        unlocked.push(loreEntry.id);
        game.lore.unlockedTimestamps[loreEntry.id] = Date.now();
        newlyUnlocked.push(loreEntry);
        
        // console.log(`[LORE] 📖 Unlocked: ${loreEntry.title} (${assistantId}:${currentQuantity} >= ${requiredQuantity})`);
      }
    }
  }
  
  // Show notification for newly unlocked lore
  if (newlyUnlocked.length > 0) {
    showLoreNotification(newlyUnlocked);
  }
}

/**
 * Check all assistant quantities for lore unlocks (useful for initialization)
 * @param {GameStateFlat} game - The current game state object
 */
export function checkAllAssistantQuantities(game) {
  if (!game.lore || !game.assistants) return;
  
  // Check each assistant type for quantity-based lore
  for (const assistantId in game.assistants) {
    checkLoreForAssistantQuantity(game, assistantId);
  }
}

/**
 * Check lore unlocks for boosts
 * @param {GameStateFlat} game - The current game state object
 * @param {string} boostId - ID of the boost that was purchased
 */
export function checkLoreForBoost(game, boostId) {
  checkLoreUnlock(game, 'boost', boostId);
}

/**
 * Check lore unlocks for icicle events
 * @param {GameStateFlat} game - The current game state object
 * @param {string} eventId - ID of the icicle event
 */
export function checkLoreForIcicle(game, eventId) {
  checkLoreUnlock(game, 'icicle', eventId);
}

/**
 * Mark a lore entry as viewed
 * @param {GameStateFlat} game - The current game state object
 * @param {string} loreId - ID of the lore entry to mark as viewed
 */
export function markLoreAsViewed(game, loreId) {
  if (!game.lore) return;
  
  game.lore.viewed[loreId] = true;
  game.save();
}

/**
 * Show lore notification
 * @param {Array} loreEntries - Array of newly unlocked lore entries
 */
function showLoreNotification(loreEntries) {
  // Use central notification panel if available
  if (window.centralNotificationPanel) {
            // console.log('[LORE] Using central notification panel');
    for (const lore of loreEntries) {
      window.centralNotificationPanel.addMessage({
        type: 'lore',
        icon: '📖',
        title: 'New Lore Discovered!',
        description: lore.title,
        color: '#4A90E2'
      });
    }
  } else {
    // Fallback to old notification system
            // console.warn('[LORE] Central notification panel not available, using fallback');
        // console.log('[LORE] Available globals:', Object.keys(window).filter(key => key.includes('notification') || key.includes('panel')));
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 1000;
      max-width: 300px;
      animation: slideIn 0.5s ease-out;
    `;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Build notification content
    let content = '<div style="font-weight: bold; margin-bottom: 5px;">📖 New Lore Discovered!</div>';
    
    for (const lore of loreEntries) {
      content += `
        <div style="margin: 5px 0; padding: 5px; background: rgba(255,255,255,0.1); border-radius: 5px;">
          <img src="${lore.icon}" alt="Lore Icon" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 5px;">
          <strong>${lore.title}</strong><br>
          <small>${lore.content}</small>
        </div>
      `;
    }
    
    notification.innerHTML = content;
    document.body.appendChild(notification);
    
    // Remove notification after 6 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.5s ease-in';
      notification.style.animationFillMode = 'forwards';
      
      // Add slideOut animation
      const slideOutStyle = document.createElement('style');
      slideOutStyle.textContent = `
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(slideOutStyle);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 500);
    }, 6000);
  }
}

/**
 * Get lore progress for display
 * @param {GameStateFlat} game - The current game state object
 * @returns {Object} Lore progress data
 */
export function getLoreProgress(game) {
  if (!game.lore) return { unlocked: 0, total: 0 };
  
  const unlocked = game.lore.unlocked.length;
  const total = getAllLoreEntries().length; // Use getAllLoreEntries for total
  
  return { unlocked, total };
}

/**
 * Get lore by category
 * @param {GameStateFlat} game - The current game state object
 * @returns {Object} Lore grouped by category
 */
export function getLoreByCategory(game) {
  if (!game.lore) return {};
  
  const unlocked = game.lore.unlocked;
  const unlockedTimestamps = game.lore.unlockedTimestamps || {};
  const viewed = game.lore.viewed || {};
  const categories = {};
  
  // Get all lore entries from the book/chapter structure
  const allLoreEntries = getAllLoreEntries();
  
  for (const lore of allLoreEntries) {
    const category = lore.category;
    if (!categories[category]) {
      categories[category] = [];
    }
    
    const isUnlocked = unlocked.includes(lore.id);
    const isViewed = viewed[lore.id] || false;
    const unlockedAt = unlockedTimestamps[lore.id] || null;
    
    categories[category].push({
      ...lore,
      unlocked: isUnlocked,
      viewed: isViewed,
      unlocked_at: unlockedAt
    });
  }
  
  return categories;
}

/**
 * Render lore UI with book/chapter structure
 * @param {GameStateFlat} game - The current game state object
 */
export function renderLoreUI(game) {
  const container = document.getElementById('lore-books');
  if (!container) return;
  
  let html = '';
  
  // Render books and chapters
  for (const book of LORE.books) {
    const bookUnlocked = book.chapters.reduce((sum, chapter) => 
      sum + chapter.lore.filter(l => game.lore.unlocked.includes(l.id)).length, 0);
    const bookTotal = book.chapters.reduce((sum, chapter) => 
      sum + chapter.lore.length, 0);
    
    html += `
      <div class="lore-book">
        <div class="lore-book-header">
          <h3 class="lore-book-title">${book.title} (${bookUnlocked}/${bookTotal})</h3>
          <p class="lore-book-description">${book.description}</p>
        </div>
    `;
    
    for (const chapter of book.chapters) {
      const chapterUnlocked = chapter.lore.filter(l => game.lore.unlocked.includes(l.id)).length;
      const chapterTotal = chapter.lore.length;
      
      html += `
        <div class="lore-chapter">
          <div class="lore-chapter-header">
            <h4 class="lore-chapter-title">${chapter.title} (${chapterUnlocked}/${chapterTotal})</h4>
            <p class="lore-chapter-description">${chapter.description}</p>
          </div>
          <div class="lore-items-grid">
      `;
      
      for (const lore of chapter.lore) {
        const isUnlocked = game.lore.unlocked.includes(lore.id);
        const isViewed = game.lore.viewed && game.lore.viewed[lore.id];
        
        let stateClass = 'locked';
        let cursor = 'default';
        let onClick = '';
        
        if (isUnlocked) {
          stateClass = isViewed ? 'viewed' : 'unlocked';
          cursor = 'pointer';
          onClick = `onclick="window.gameReadyUI.showLoreModal('${lore.id}')"`;
        }
        
        html += `
          <div class="lore-item ${stateClass}" data-lore-id="${lore.id}" ${onClick} style="cursor: ${cursor};">
            <img src="${lore.icon}" alt="${lore.title}" class="lore-item-icon">
            <div class="lore-item-tooltip">
              <strong>${lore.title}</strong><br>
              ${isUnlocked ? lore.abstract : 'Locked'}
            </div>
          </div>
        `;
      }
      
      html += `
          </div>
        </div>
      `;
    }
    
    html += `</div>`;
  }
  
  container.innerHTML = html;
}

/**
 * Force check all lore conditions (for testing/debugging)
 * @param {GameStateFlat} game - The current game state object
 */
export function forceCheckLore(game) {
  if (!game.lore) return;
  
  // Check all assistant quantities
  checkAllAssistantQuantities(game);
  
  // Check all achievements
  if (game.achievements) {
    for (const achievementId in game.achievements) {
      if (game.achievements[achievementId] && game.achievements[achievementId].unlocked_at) {
        checkLoreForAchievement(game, achievementId);
      }
    }
  }
  
  // Check all upgrades
  if (game.unifiedUpgrades) {
    for (const upgradeId in game.unifiedUpgrades) {
      if (game.unifiedUpgrades[upgradeId] && game.unifiedUpgrades[upgradeId].purchased) {
        checkLoreForUpgrade(game, upgradeId);
      }
    }
  }
}

