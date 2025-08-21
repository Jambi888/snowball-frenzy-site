/**
 * systems/meltdown.js - Meltdown system for asset conversion
 * 
 * DEPRECATED: This module is no longer used in the current jump flow.
 * The meltdown process has been simplified to direct snowball conversion.
 * 
 * This file is preserved for potential future reintroduction of the meltdown mechanic.
 * 
 * Previous functionality:
 * - Convert snowballs to snowflakes with interactive controls
 * - Sell assistants for additional snowflakes
 * - Interactive meltdown process with manual conversion options
 * 
 * Current jump flow:
 * 1. Player initiates jump
 * 2. Peak snapshot taken (for yeti system)
 * 3. Direct snowball → snowflake conversion (automatic)
 * 4. SnowflakeTree marketplace
 * 5. Complete jump & reset game
 * 
 * @deprecated Use the simplified jump flow in jump.js instead
 */

// -------------------------------
// meltdown.js (DEPRECATED)
// -------------------------------

import { ASSISTANTS } from '../loops/passive/data/assistantData.js';
import { SNOWFLAKE_CONFIG } from './snowflakeTree.js';
import { getCurrentCost } from '../loops/passive/assistants.js';
import { trackAnalog } from './analogTracker.js';

/**
 * Initiates the meltdown process by stopping passive generation and capturing metrics
 * @param {GameStateFlat} game - The current game state object
 */
export function initiateMeltdown(game) {
  // console.log(`[MELTDOWN] === MELTDOWN INITIATED ===`);
  // console.log(`[MELTDOWN] Game state:`, {
  //   snowballs: game.snowballs,
  //   snowflakes: game.snowflakes,
  //   currentAnalog: game.currentAnalog,
  //   assistants: game.assistants
  // });
  
  // Emit meltdown initiated event
  if (window.eventBus) {
    window.eventBus.emit('meltdownInitiated', {
      analogNumber: game.analogNumber,
      snowballs: game.snowballs,
      snowflakes: game.snowflakes,
      assistants: { ...game.assistants },
      boosts: { ...game.boosts },
      globalUpgrades: { ...game.globalUpgrades }
    });
  }
  
  // Stop passive snowball generation by setting a flag
  game.meltdownActive = true;
  // console.log(`[MELTDOWN] Set meltdownActive = true`);
  
  // Stop icicle process using TimerManager
  if (window.icicleInterval && window.timerManager) {
    window.timerManager.clearTimer(window.icicleInterval);
    // console.log(`[MELTDOWN] Cleared icicle timer via TimerManager`);
  } else if (window.icicleInterval) {
    // Fallback for legacy timer IDs
    clearInterval(window.icicleInterval);
    // console.log(`[MELTDOWN] Cleared icicle interval (legacy fallback)`);
  }
  
  // Capture final analog metrics
  // console.log(`[MELTDOWN] Tracking analog...`);
  trackAnalog(game);
  
  // Calculate initial snowflake cost (consistent rate across all analogs)
  const cost = SNOWFLAKE_CONFIG.baseCost * SNOWFLAKE_CONFIG.costRate ** ((game.analogNumber || 1) - 1);
  game.snowflakeCost = cost;
  // console.log(`[MELTDOWN] Calculated snowflake cost: ${cost.toExponential(2)}`);
  
  // Initialize meltdown state
  game.meltdownState = {
    snowballsConverted: 0,
    assistantsSold: {},
    totalSnowflakesEarned: 0
  };
  // console.log(`[MELTDOWN] Initialized meltdown state`);
  
  // Show meltdown UI
  // console.log(`[MELTDOWN] Calling showMeltdownUI...`);
  showMeltdownUI(game);
  
  // console.log(`[MELTDOWN] Meltdown initiated with snowflake cost: ${cost.toExponential(2)}`);
}

/**
 * Shows the meltdown UI and forces the meltdown tab
 * @param {GameStateFlat} game - The current game state object
 */
function showMeltdownUI(game) {
  // console.log(`[MELTDOWN] Showing meltdown UI...`);
  
  // Force meltdown tab to be visible and active
  const meltdownTab = document.getElementById('meltdown-tab');
  const marketplaceTab = document.getElementById('marketplace-tab');
  
  // console.log(`[MELTDOWN] Found tabs:`, {
  //   meltdownTab: !!meltdownTab,
  //   marketplaceTab: !!marketplaceTab
  // });
  
  if (meltdownTab) {
    meltdownTab.style.display = 'inline-block';
    // console.log(`[MELTDOWN] Made meltdown tab visible`);
  }
  if (marketplaceTab) {
    marketplaceTab.style.display = 'inline-block';
    // console.log(`[MELTDOWN] Made marketplace tab visible`);
  }
  
  // Switch to meltdown tab
  // console.log(`[MELTDOWN] Switching to meltdown tab...`);
  if (window.switchTab) {
    window.switchTab('meltdown');
    // console.log(`[MELTDOWN] Switched to meltdown tab`);
    
    // Debug: Check if the panel is actually active
    const meltdownPanel = document.getElementById('meltdown-panel');
    if (meltdownPanel) {
      const isActive = meltdownPanel.classList.contains('active');
      const display = window.getComputedStyle(meltdownPanel).display;
      // console.log(`[MELTDOWN] Meltdown panel status:`, {
      //   hasActiveClass: isActive,
      //   computedDisplay: display,
      //   classList: meltdownPanel.classList.toString()
      // });
      
      // Force the panel to be visible for debugging
      if (!isActive) {
        // console.log(`[MELTDOWN] Forcing meltdown panel to be visible...`);
        meltdownPanel.classList.add('active');
        meltdownPanel.style.display = 'block';
      }
    }
  } else {
    // console.error(`[MELTDOWN] switchTab function not found!`);
  }
  
  // Disable other tabs and columns
  // console.log(`[MELTDOWN] Disabling game interaction...`);
  disableGameInteraction();
  
  // Render meltdown content
  // console.log(`[MELTDOWN] Rendering meltdown content...`);
  renderMeltdownContent(game);
}

/**
 * Disables game interaction during meltdown
 */
function disableGameInteraction() {
  // Disable left and right columns
  const leftColumn = document.querySelector('.left-column');
  const rightColumn = document.querySelector('.right-column');
  
  if (leftColumn) {
    leftColumn.style.pointerEvents = 'none';
    leftColumn.style.opacity = '0.5';
  }
  if (rightColumn) {
    rightColumn.style.pointerEvents = 'none';
    rightColumn.style.opacity = '0.5';
  }
  
  // Disable other tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    if (!button.id.includes('meltdown') && !button.id.includes('marketplace')) {
      button.disabled = true;
      button.style.opacity = '0.5';
    }
  });
}

/**
 * Re-enables game interaction after meltdown
 */
function enableGameInteraction() {
  // Re-enable left and right columns
  const leftColumn = document.querySelector('.left-column');
  const rightColumn = document.querySelector('.right-column');
  
  if (leftColumn) {
    leftColumn.style.pointerEvents = 'auto';
    leftColumn.style.opacity = '1';
  }
  if (rightColumn) {
    rightColumn.style.pointerEvents = 'auto';
    rightColumn.style.opacity = '1';
  }
  
  // Re-enable other tabs
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => {
    button.disabled = false;
    button.style.opacity = '1';
  });
}

/**
 * Renders the meltdown content with snowflake balance, wallet, and assistant table
 * @param {GameStateFlat} game - The current game state object
 */
function renderMeltdownContent(game) {
  // console.log(`[MELTDOWN] Rendering meltdown content...`);
  const container = document.getElementById('meltdown-content');
  if (!container) {
    // console.error(`[MELTDOWN] Meltdown content container not found!`);
    return;
  }
  
  // console.log(`[MELTDOWN] Container found, game state:`, {
  //   snowballs: game.snowballs,
  //   snowflakes: game.snowflakes,
  //   snowflakeCost: game.snowflakeCost,
  //   meltdownState: game.meltdownState
  // });
  
  const cost = game.snowflakeCost;
  const purchasableSnowflakes = Math.floor(game.snowballs / cost);
  
  const html = `
    <div class="meltdown-header">
      <h3>Current Snowflake Balance: <span id="meltdown-snowflake-balance">${game.snowflakes || 0}</span></h3>
    </div>
    
    <div class="meltdown-wallet-section">
      <div class="wallet-info">
        <strong>Snowball Wallet:</strong> <span id="meltdown-wallet-amount">${game.snowballs.toExponential(2)}</span>
        <br>
        <strong>Snowflake Cost:</strong> ${cost.toExponential(2)} snowballs per snowflake
        <br>
        <strong>Purchasable Snowflakes:</strong> <span id="meltdown-purchasable">${purchasableSnowflakes}</span>
      </div>
      <button onclick="window.buySnowflakes()" ${purchasableSnowflakes > 0 ? '' : 'disabled'}>
        Buy Snowflakes
      </button>
    </div>
    
    <div class="meltdown-assistants-section">
      <h3>Assistant Liquidation</h3>
      <div id="meltdown-assistants-table">
        ${generateAssistantsTable(game)}
      </div>
    </div>
    
    <div class="meltdown-summary">
      <h3>Meltdown Summary</h3>
      <div id="meltdown-summary-content">
        <strong>Total Snowflakes Earned:</strong> <span id="meltdown-total-earned">${game.meltdownState.totalSnowflakesEarned}</span>
        <br>
        <strong>Snowballs Converted:</strong> <span id="meltdown-converted">${game.meltdownState.snowballsConverted.toExponential(2)}</span>
      </div>
    </div>
    
    <div class="meltdown-actions">
      <button onclick="window.completeMeltdown()" class="complete-meltdown-btn">
        Complete Meltdown
      </button>
    </div>
  `;
  
  // console.log(`[MELTDOWN] Setting innerHTML...`);
  container.innerHTML = html;
  // console.log(`[MELTDOWN] Meltdown content rendered successfully`);
}

/**
 * Generates the assistants table for the meltdown screen
 * @param {GameStateFlat} game - The current game state object
 * @returns {string} HTML table string
 */
function generateAssistantsTable(game) {
  let tableHTML = `
    <table class="meltdown-table">
      <thead>
        <tr>
          <th>Assistant</th>
          <th>Owned</th>
          <th>Sell Price</th>
          <th>Actions</th>
          <th>Converted Value</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  for (const assistant of ASSISTANTS) {
    const owned = game.assistants[assistant.id] || 0;
    if (owned > 0) {
      const sellPrice = assistant.sellRate || 0.25;
      const currentCost = getCurrentCost(assistant, owned - 1) || assistant.cost;
      const totalValue = owned * currentCost * sellPrice;
      const sold = game.meltdownState.assistantsSold[assistant.id] || 0;
      const remaining = owned - sold;
      
      tableHTML += `
        <tr>
          <td>${assistant.name}</td>
          <td>${remaining} / ${owned}</td>
          <td>${(sellPrice * currentCost).toExponential(2)}</td>
          <td>
            <button onclick="window.sellAssistant('${assistant.id}', 1)" ${remaining > 0 ? '' : 'disabled'}>Sell 1</button>
            <button onclick="window.sellAssistant('${assistant.id}', 10)" ${remaining >= 10 ? '' : 'disabled'}>Sell 10</button>
            <button onclick="window.sellAssistant('${assistant.id}', ${remaining})" ${remaining > 0 ? '' : 'disabled'}>Sell All</button>
          </td>
          <td>${(sold * currentCost * sellPrice).toExponential(2)} snowballs</td>
        </tr>
      `;
    }
  }
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  return tableHTML;
}

/**
 * Buys snowflakes with current snowballs
 */
window.buySnowflakes = function() {
  if (!window.game) return;
  
  const game = window.game;
  const cost = game.snowflakeCost;
  const purchasable = Math.floor(game.snowballs / cost);
  
  if (purchasable > 0) {
    // Buy all purchasable snowflakes
    const snowflakesToBuy = purchasable;
    const snowballsSpent = snowflakesToBuy * cost;
    
    game.snowballs -= snowballsSpent;
    game.snowflakes = (game.snowflakes || 0) + snowflakesToBuy;
    game.meltdownState.snowballsConverted += snowballsSpent;
    game.meltdownState.totalSnowflakesEarned += snowflakesToBuy;
    
    renderMeltdownContent(game);
    // console.log(`[MELTDOWN] Bought ${snowflakesToBuy} snowflake(s) for ${snowballsSpent.toExponential(2)} snowballs`);
  }
};

/**
 * Sells assistants and converts them to snowballs
 * @param {string} assistantId - The assistant ID to sell
 * @param {number} amount - Number of assistants to sell
 */
window.sellAssistant = function(assistantId, amount) {
  if (!window.game) return;
  
  const game = window.game;
  const assistant = ASSISTANTS.find(a => a.id === assistantId);
  if (!assistant) return;
  
  const owned = game.assistants[assistantId] || 0;
  const sold = game.meltdownState.assistantsSold[assistantId] || 0;
  const remaining = owned - sold;
  
  if (remaining >= amount) {
    const currentCost = getCurrentCost(assistant, owned - 1) || assistant.cost;
    const sellPrice = assistant.sellRate || 0.25;
    const snowballsEarned = amount * currentCost * sellPrice;
    
    // Update meltdown state
    game.meltdownState.assistantsSold[assistantId] = sold + amount;
    game.meltdownState.snowballsConverted += snowballsEarned;
    
    // Add snowballs to wallet
    game.snowballs += snowballsEarned;
    
    renderMeltdownContent(game);
    // console.log(`[MELTDOWN] Sold ${amount} ${assistant.name} for ${snowballsEarned.toExponential(2)} snowballs`);
  }
};

/**
 * Completes the meltdown and proceeds to marketplace
 */
window.completeMeltdown = function() {
  if (!window.game) return;
  
  const game = window.game;
  // console.log(`[MELTDOWN] === MELTDOWN COMPLETED ===`);
  // console.log(`[MELTDOWN] Final state:`, {
  //   snowflakes: game.snowflakes,
  //   snowballsConverted: game.meltdownState.snowballsConverted,
  //   totalSnowflakesEarned: game.meltdownState.totalSnowflakesEarned
  // });
  
  // Switch to marketplace
  switchTab('marketplace');
  renderMarketplaceContent(game).catch(console.error);
};

/**
 * Renders the marketplace content
 * @param {GameStateFlat} game - The current game state object
 */
async function renderMarketplaceContent(game) {
  const container = document.getElementById('marketplace-content');
  if (!container) return;
  
  // Import snowflake upgrades
  const { SNOWFLAKE_TREE } = await import('./snowflakeTree.js');
  
  let upgradesHTML = '';
  const persistentUpgrades = game.persistentUpgrades || [];
  
  SNOWFLAKE_TREE.forEach(upgrade => {
    const isOwned = persistentUpgrades.includes(upgrade.id);
    const canAfford = (game.snowflakes || 0) >= upgrade.cost;
    
    upgradesHTML += `
      <div class="upgrade-card" style="border: 1px solid #444; margin: 10px; padding: 15px; border-radius: 5px;">
        <h4>${upgrade.name}</h4>
        <p>${upgrade.description}</p>
        <p><strong>Cost:</strong> ${upgrade.cost} snowflakes</p>
        <p><strong>Status:</strong> ${isOwned ? '✅ Owned' : '❌ Not Owned'}</p>
        ${!isOwned ? `
          <button 
            onclick="window.purchaseSnowflakeUpgrade('${upgrade.id}')" 
            ${canAfford ? '' : 'disabled'}
            style="background-color: ${canAfford ? '#4CAF50' : '#cccccc'}; color: white; border: none; padding: 8px 16px; border-radius: 3px; cursor: ${canAfford ? 'pointer' : 'not-allowed'};"
          >
            ${canAfford ? 'Purchase' : 'Cannot Afford'}
          </button>
        ` : ''}
      </div>
    `;
  });
  
  container.innerHTML = `
    <div class="marketplace-header">
      <h3>Snowflake Marketplace</h3>
      <p>Current Snowflakes: <strong>${game.snowflakes || 0}</strong></p>
    </div>
    
    <div class="marketplace-content">
      <p>Welcome to the Snowflake Marketplace! Here you can spend your snowflakes on permanent upgrades that persist across jumps.</p>
      
      <div class="upgrades-section">
        <h4>Available Upgrades:</h4>
        ${upgradesHTML}
      </div>
    </div>
    
    <div class="marketplace-actions">
      <button onclick="window.completeJump()" class="complete-jump-btn">
        Complete Jump
      </button>
    </div>
  `;
}

/**
 * Completes the jump process
 */
window.completeJump = function() {
  if (!window.game) return;
  
  const game = window.game;
  // console.log(`[MELTDOWN] === JUMP COMPLETED ===`);
  
  // Emit meltdown completed event
  if (window.eventBus) {
    window.eventBus.emit('meltdownCompleted', {
      analogNumber: game.analogNumber,
      snowflakesEarned: game.meltdownState?.totalSnowflakesEarned || 0,
      snowballsConverted: game.meltdownState?.snowballsConverted || 0,
      assistantsSold: game.meltdownState?.assistantsSold || {}
    });
  }
  
  // Re-enable game interaction
  enableGameInteraction();
  
  // Hide meltdown and marketplace tabs
  const meltdownTab = document.getElementById('meltdown-tab');
  const marketplaceTab = document.getElementById('marketplace-tab');
  
  if (meltdownTab) {
    meltdownTab.style.display = 'none';
  }
  if (marketplaceTab) {
    marketplaceTab.style.display = 'none';
  }
  
  // Clear meltdown state
  game.meltdownActive = false;
  delete game.meltdownState;
  
  // Restart icicle process using TimerManager
  if (window.setupIcicle) {
    window.setupIcicle(game);
    // Restart the icicle interval using TimerManager
    if (window.timerManager) {
      // Use same interval calculation as main.js (1000 / TIME_RATE)
      const TIME_RATE = 1; // Default TIME_RATE value - should match config.js
      window.icicleInterval = window.timerManager.setInterval(() => {
        if (window.updateIcicle) {
          window.updateIcicle(game);
        }
      }, 1000 / TIME_RATE, 'icicle-update-restart');
      // console.log(`[MELTDOWN] Restarted icicle process via TimerManager`);
    } else {
      // Fallback for legacy approach
      window.icicleInterval = setInterval(() => {
        if (window.updateIcicle) {
          window.updateIcicle(game);
        }
      }, 1000);
      // console.log(`[MELTDOWN] Restarted icicle process (legacy fallback)`);
    }
  }
  
  // Switch back to dashboard
  switchTab('dashboard');
  
  // NOTE: Jump has already been completed by the UI manager
  // No need to call confirmJumpFromUI() again
};

/**
 * Purchases a snowflake upgrade and updates the marketplace
 * @param {string} upgradeId - The ID of the upgrade to purchase
 */
window.purchaseSnowflakeUpgrade = async function(upgradeId) {
  if (!window.game) return;
  
  const game = window.game;
  
  // console.log(`[MARKETPLACE DEBUG] === PURCHASING SNOWFLAKE UPGRADE ===`);
  // console.log(`[MARKETPLACE DEBUG] Purchasing upgrade: ${upgradeId}`);
  // console.log(`[MARKETPLACE DEBUG] Before purchase - globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
  // console.log(`[MARKETPLACE DEBUG] Before purchase - persistentUpgrades:`, game.persistentUpgrades || []);
  
  // Import the purchase function and apply function
  const { purchaseSnowflakeUpgrade, applySnowflakeUpgrades } = await import('./snowflakeTree.js');
  
  // Attempt to purchase the upgrade
  const success = purchaseSnowflakeUpgrade(game, upgradeId);
  
  if (success) {
    // console.log(`[MARKETPLACE DEBUG] Purchase successful, applying effects...`);
    // console.log(`[MARKETPLACE DEBUG] After purchase - persistentUpgrades:`, game.persistentUpgrades || []);
    
    // Apply the upgrade effects immediately
    applySnowflakeUpgrades(game);
    
    // console.log(`[MARKETPLACE DEBUG] After applySnowflakeUpgrades - globalSpsMultiplier: ${game.globalSpsMultiplier || 1}`);
    
    // Recalculate SPS with new effects
    if (window.calculateSPSWithBoosts) {
      window.calculateSPSWithBoosts(game);
    }
    
    // Update UI to reflect changes
    if (window.updateAssistantsUI) {
      window.updateAssistantsUI(game);
    }
    
    // Save the game state
    game.save();
    
    // Record snowflake upgrade purchase for achievements
    if (window.recordSnowflakeUpgradePurchase) {
      window.recordSnowflakeUpgradePurchase();
    }
    
    // Re-render the marketplace to show updated state
    renderMarketplaceContent(game).catch(console.error);
    
    // console.log(`[MARKETPLACE DEBUG] === UPGRADE PURCHASE COMPLETED ===`);
    // console.log(`[MARKETPLACE] Successfully purchased upgrade: ${upgradeId}`);
  } else {
    // console.log(`[MARKETPLACE] Failed to purchase upgrade: ${upgradeId}`);
  }
};

// Test DOM elements on module load
// console.log(`[MELTDOWN] Module loaded, checking DOM elements...`);
setTimeout(() => {
  const meltdownTab = document.getElementById('meltdown-tab');
  const meltdownPanel = document.getElementById('meltdown-panel');
  const meltdownContent = document.getElementById('meltdown-content');
  const marketplaceTab = document.getElementById('marketplace-tab');
  const marketplacePanel = document.getElementById('marketplace-panel');
  const marketplaceContent = document.getElementById('marketplace-content');
  
  // console.log(`[MELTDOWN] DOM element check:`, {
  //   meltdownTab: !!meltdownTab,
  //   meltdownPanel: !!meltdownPanel,
  //   meltdownContent: !!meltdownContent,
  //   marketplaceTab: !!marketplaceTab,
  //   marketplacePanel: !!marketplacePanel,
  //   marketplaceContent: !!marketplaceContent
  // });
  
  if (!meltdownTab) {
    // console.error(`[MELTDOWN] meltdown-tab element not found!`);
  }
  if (!meltdownPanel) {
    // console.error(`[MELTDOWN] meltdown-panel element not found!`);
  }
  if (!meltdownContent) {
    // console.error(`[MELTDOWN] meltdown-content element not found!`);
  }
  if (!marketplaceTab) {
    // console.error(`[MELTDOWN] marketplace-tab element not found!`);
  }
  if (!marketplacePanel) {
    // console.error(`[MELTDOWN] marketplace-panel element not found!`);
  }
  if (!marketplaceContent) {
    // console.error(`[MELTDOWN] marketplace-content element not found!`);
  }
}, 1000);
