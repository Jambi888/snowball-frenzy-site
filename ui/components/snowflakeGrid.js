/**
 * components/snowflakeGrid.js - Simple Grid-based Snowflake Marketplace
 * 
 * This component renders a clean, functional grid layout for the snowflake marketplace,
 * organized by categories with clear progression and easy purchasing.
 */

import { SNOWFLAKE_TREE, getAvailableCategories, getUpgradesByCategory } from '../../meta/snowflakeTree.js';

export class SnowflakeGridMarketplace {
  constructor(game, containerId) {
    this.game = game;
    this.containerId = containerId;
    this.container = null;
    
    // Track snowflakes spent during this session
    this.snowflakesSpent = 0;
    
    // Track lifetime spending (persisted in game state)
    this.lifetimeSnowflakesSpent = game.lifetimeSnowflakesSpent || 0;
    
    // Grid configuration
    this.config = {
      columnsPerCategory: 5,
      maxUpgradesPerRow: 10,
      iconSize: 32,
      animationDuration: 0 // No animations
    };
    
    // Category definitions
    this.categoryDefinitions = {
      concordUpgrades: {
        name: 'Concord Upgrades',
        color: '#667eea',
        description: 'Unlock advanced game mechanics'
      },
      idleMultiplier: {
        name: 'Idle Multiplier',
        color: '#22c55e',
        description: 'Increase idle progression rate in new echo'
      },
      startingSnowballs: {
        name: 'Starting Snowballs',
        color: '#3b82f6',
        description: 'Start with snowballs in new echo'
      },
      startingAssistants: {
        name: 'Starting Assistants',
        color: '#f59e0b',
        description: 'Start with assistants in new echo'
      },
      startingBabyYeti: {
        name: 'Baby Yeti',
        color: '#8b5cf6',
        description: 'Start with yeti crew upgrades in new echo'
      }
    };
  }

  /**
   * Initialize the grid marketplace
   */
  init() {
    try {
      this.container = document.getElementById(this.containerId);
      if (!this.container) {
        // console.error(`[SNOWFLAKE_GRID] Container ${this.containerId} not found`);
        return;
      }

      // Verify imports are working
      if (typeof getAvailableCategories !== 'function') {
        // console.error('[SNOWFLAKE_GRID] getAvailableCategories not imported correctly');
        return;
      }
      
      if (typeof getUpgradesByCategory !== 'function') {
        // console.error('[SNOWFLAKE_GRID] getUpgradesByCategory not imported correctly');
        return;
      }

      this.renderGrid();
      this.setupEventListeners();
      
      // console.log('[SNOWFLAKE_GRID] Grid marketplace initialized successfully');
    } catch (error) {
      // console.error('[SNOWFLAKE_GRID] Initialization error:', error);
    }
  }

  /**
   * Render the complete grid
   */
  renderGrid() {
    try {
      // console.log('[SNOWFLAKE_GRID] Starting grid render...');
      
      // Clear container
      this.container.innerHTML = '';
      
      // Create main grid container
      const gridContainer = document.createElement('div');
      gridContainer.className = 'snowflake-grid-container';
      
      // Balance header is now in the conversion summary container
      
      // Render each category
      const categories = getAvailableCategories();
      
      // Sort categories to ensure Concord upgrades appear first
      const sortedCategories = categories.sort((a, b) => {
        if (a === 'concordUpgrades') return -1;
        if (b === 'concordUpgrades') return 1;
        return 0;
      });
      
      sortedCategories.forEach(category => {
        const categorySection = this.renderCategory(category);
        gridContainer.appendChild(categorySection);
      });
      
      this.container.appendChild(gridContainer);
      
      // console.log('[SNOWFLAKE_GRID] Grid rendered successfully');
    } catch (error) {
      // console.error('[SNOWFLAKE_GRID] Grid render error:', error);
      throw error;
    }
  }

  /**
   * Create balance header
   */
  createBalanceHeader() {
    const header = document.createElement('div');
    header.className = 'snowflake-balance-header';
    
    const balance = this.game.snowflakes || 0;
    
    header.innerHTML = `
      <div class="balance-display">
        <span class="balance-icon">❄️</span>
        <span class="balance-text">Snowflakes Available: <strong>${balance.toLocaleString()}</strong></span>
      </div>
      <div class="balance-description">
        Purchase persistent upgrades that carry over to new analogs
      </div>
    `;
    
    return header;
  }

  /**
   * Render a category section
   */
  renderCategory(category) {
    const categoryDef = this.categoryDefinitions[category];
    if (!categoryDef) {
      // console.warn(`[SNOWFLAKE_GRID] No definition for category: ${category}`);
      return document.createElement('div');
    }

    const upgrades = getUpgradesByCategory(category);
    // console.log(`[SNOWFLAKE_GRID] Rendering category ${category} with ${upgrades.length} upgrades`);

    const section = document.createElement('div');
    section.className = 'snowflake-category-section';
    
    // Category header
    const header = document.createElement('div');
    header.className = 'category-header';
    header.style.borderLeftColor = categoryDef.color;
    
    const ownedCount = this.getOwnedCount(category);
    const totalCount = upgrades.length;
    
    header.innerHTML = `
      <div class="category-info">
        <span class="category-name">${categoryDef.name}</span>
        <span class="category-description">${categoryDef.description}</span>
      </div>
      <div class="category-progress">
        <span class="progress-text">${ownedCount}/${totalCount} owned</span>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${(ownedCount / totalCount) * 100}%; background-color: ${categoryDef.color}"></div>
        </div>
      </div>
    `;
    
    section.appendChild(header);
    
    // Upgrades grid
    const upgradesGrid = document.createElement('div');
    upgradesGrid.className = 'upgrades-grid';
    
    // Special handling for Concord upgrades - display in a single row
    if (category === 'concordUpgrades') {
      upgradesGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-top: 15px;
      `;
    }
    
    upgrades.forEach((upgrade, index) => {
      const upgradeCard = this.renderUpgradeCard(category, upgrade, index, categoryDef);
      upgradesGrid.appendChild(upgradeCard);
    });
    
    section.appendChild(upgradesGrid);
    
    return section;
  }

  /**
   * Render an individual upgrade card
   */
  renderUpgradeCard(category, upgrade, index, categoryDef) {
    const card = document.createElement('div');
    card.className = 'upgrade-card';
    
    // Check upgrade state
    const isOwned = this.game.persistentUpgrades && this.game.persistentUpgrades.includes(upgrade.id);
    const canAfford = (this.game.snowflakes || 0) >= upgrade.cost;
    const isAvailable = this.isUpgradeAvailable(category, upgrade, index);
    
    // Set card state classes
    if (isOwned) {
      card.classList.add('owned');
    } else if (isAvailable && canAfford) {
      card.classList.add('available');
    } else if (isAvailable) {
      card.classList.add('unaffordable');
    } else {
      card.classList.add('locked');
    }
    
    // Card content
    card.innerHTML = `
      <div class="upgrade-icon">
        <img src="${upgrade.icon}" alt="${upgrade.name}" width="${this.config.iconSize}" height="${this.config.iconSize}">
        ${isOwned ? '<span class="owned-badge">✓</span>' : ''}
      </div>
      <div class="upgrade-info">
        <div class="upgrade-name">${upgrade.name}</div>
        <div class="upgrade-cost">${upgrade.cost} ❄️</div>
      </div>
      <div class="snowflake-tooltip">
        <div class="tooltip-title">${upgrade.name}</div>
        <div class="tooltip-section">
          <span class="tooltip-label">Cost:</span> ${upgrade.cost} ❄️
        </div>
        <div class="tooltip-section">
          <span class="tooltip-label">Description:</span> ${upgrade.description}
        </div>
        ${isOwned ? '<div class="tooltip-section"><span class="tooltip-label">Status:</span> ✓ Owned</div>' : ''}
        ${isAvailable && !isOwned && !canAfford ? '<div class="tooltip-section"><span class="tooltip-label">Status:</span> 💰 Can\'t Afford</div>' : ''}
      </div>
    `;
    
    // Add data attributes for event handling
    card.dataset.upgradeId = upgrade.id;
    card.dataset.category = category;
    card.dataset.isOwned = isOwned;
    card.dataset.isAvailable = isAvailable;
    card.dataset.canAfford = canAfford;
    card.dataset.cost = upgrade.cost;
    
    return card;
  }

  /**
   * Get count of owned upgrades in a category
   */
  getOwnedCount(category) {
    const upgrades = getUpgradesByCategory(category);
    return upgrades.filter(upgrade => 
      this.game.persistentUpgrades && this.game.persistentUpgrades.includes(upgrade.id)
    ).length;
  }

  /**
   * Check if an upgrade is available (prerequisites met)
   */
  isUpgradeAvailable(category, upgrade, index) {
    if (index === 0) return true; // First upgrade is always available
    
    // Special handling for Concord upgrades - they must be purchased in order
    if (category === 'concordUpgrades') {
      const upgrades = getUpgradesByCategory(category);
      const previousUpgrade = upgrades[index - 1];
      
      // Check if the previous upgrade is owned
      const isPreviousOwned = this.game.persistentUpgrades && this.game.persistentUpgrades.includes(previousUpgrade.id);
      
      // console.log(`[SNOWFLAKE_GRID] Concord upgrade ${upgrade.id} (index ${index}): previous=${previousUpgrade.id}, owned=${isPreviousOwned}`);
      
      return isPreviousOwned;
    }
    
    // For other categories, check if the previous upgrade is owned
    const upgrades = getUpgradesByCategory(category);
    const previousUpgrade = upgrades[index - 1];
    
    // Check if the previous upgrade is owned
    const isPreviousOwned = this.game.persistentUpgrades && this.game.persistentUpgrades.includes(previousUpgrade.id);
    
    // console.log(`[SNOWFLAKE_GRID] Upgrade ${upgrade.id} (index ${index}): previous=${previousUpgrade.id}, owned=${isPreviousOwned}`);
    
    return isPreviousOwned;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    this.container.addEventListener('click', (e) => this.handleCardClick(e));
  }

  /**
   * Handle card click
   */
  handleCardClick(e) {
    const card = e.target.closest('.upgrade-card');
    if (!card) return;
    
    const upgradeId = card.dataset.upgradeId;
    const isOwned = card.dataset.isOwned === 'true';
    const isAvailable = card.dataset.isAvailable === 'true';
    const canAfford = card.dataset.canAfford === 'true';
    
    if (isOwned) {
      this.showMessage('Already owned!', 'info');
      return;
    }
    
    if (!isAvailable) {
      this.showMessage('Prerequisites not met', 'warning');
      return;
    }
    
    if (!canAfford) {
      this.showMessage('Not enough snowflakes', 'error');
      return;
    }
    
    // Purchase upgrade
    this.purchaseUpgrade(upgradeId, card);
  }

  /**
   * Show message to user
   */
  showMessage(text, type = 'info') {
    // Create temporary message element
    const message = document.createElement('div');
    message.className = `snowflake-message snowflake-message-${type}`;
    message.textContent = text;
    
    // Position message
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#22c55e'};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(message);
    
    // Remove after 3 seconds
    setTimeout(() => {
      if (message.parentNode) {
        message.parentNode.removeChild(message);
      }
    }, 3000);
  }

  /**
   * Purchase upgrade
   */
  async purchaseUpgrade(upgradeId, card) {
    try {
      const { purchaseSnowflakeUpgrade } = await import('../../meta/snowflakeTree.js');
      const success = purchaseSnowflakeUpgrade(this.game, upgradeId);
      
             if (success) {
         // Track snowflakes spent
         const cost = parseInt(card.dataset.cost) || 0;
         this.snowflakesSpent += cost;
         this.lifetimeSnowflakesSpent += cost;
         
         // Update game state for persistence
         this.game.lifetimeSnowflakesSpent = this.lifetimeSnowflakesSpent;
         
         // Update card appearance
         this.updateCardAfterPurchase(card);
         
         // Update balance display
         this.updateBalanceDisplay();
         
         // Update category progress
         this.updateCategoryProgress(card.dataset.category);
         
         // Update jump summary if it exists
         this.updateJumpSummary();
         
         // Emit purchase event
         if (window.eventBus) {
           window.eventBus.emit('snowflakeUpgradePurchased', {
             upgradeId: upgradeId,
             cost: cost
           });
         }
         
         this.showMessage('Upgrade purchased!', 'success');
       } else {
         this.showMessage('Purchase failed', 'error');
       }
    } catch (error) {
      // console.error('[SNOWFLAKE_GRID] Purchase error:', error);
      throw error;
    }
  }

  /**
   * Update card after purchase
   */
  updateCardAfterPurchase(card) {
    // Update card data
    card.dataset.isOwned = 'true';
    card.dataset.canAfford = 'false';
    
    // Update visual appearance
    card.className = 'upgrade-card owned';
    
    // Update owned badge
    const iconDiv = card.querySelector('.upgrade-icon');
    if (iconDiv) {
      const existingBadge = iconDiv.querySelector('.owned-badge');
      if (!existingBadge) {
        const badge = document.createElement('span');
        badge.className = 'owned-badge';
        badge.textContent = '✓';
        iconDiv.appendChild(badge);
      }
    }
    
    // Remove locked badge if present
    const lockedBadge = card.querySelector('.locked-badge');
    if (lockedBadge) {
      lockedBadge.remove();
    }
    
    // Update subsequent cards that should now be available
    this.updateSubsequentCards(card.dataset.category, card.dataset.upgradeId);
  }

  /**
   * Update subsequent cards that should now be available
   */
  updateSubsequentCards(category, purchasedUpgradeId) {
    const upgrades = getUpgradesByCategory(category);
    const purchasedIndex = upgrades.findIndex(upgrade => upgrade.id === purchasedUpgradeId);
    
    if (purchasedIndex === -1) return;
    
    // Check if the next upgrade should now be available
    const nextUpgrade = upgrades[purchasedIndex + 1];
    if (nextUpgrade) {
      const nextCard = this.container.querySelector(`[data-upgrade-id="${nextUpgrade.id}"]`);
      if (nextCard) {
        const canAfford = (this.game.snowflakes || 0) >= nextUpgrade.cost;
        
        // Update card state
        nextCard.dataset.isAvailable = 'true';
        nextCard.dataset.canAfford = canAfford;
        
        // Update visual appearance
        nextCard.className = 'upgrade-card';
        if (canAfford) {
          nextCard.classList.add('available');
        } else {
          nextCard.classList.add('unaffordable');
        }
        
        // Remove locked badge if present
        const lockedBadge = nextCard.querySelector('.locked-badge');
        if (lockedBadge) {
          lockedBadge.remove();
        }
        
        // console.log(`[SNOWFLAKE_GRID] Unlocked upgrade: ${nextUpgrade.id}`);
      }
    }
  }

  /**
   * Update balance display
   */
  updateBalanceDisplay() {
    // Update balance in grid marketplace
    const balanceText = this.container.querySelector('.balance-text strong');
    if (balanceText) {
      balanceText.textContent = (this.game.snowflakes || 0).toLocaleString();
    }
    
    // Also update the top balance display if it exists
    const topBalanceText = document.querySelector('.snowflake-balance-header .balance-text strong');
    if (topBalanceText) {
      topBalanceText.textContent = (this.game.snowflakes || 0).toLocaleString();
    }
  }

  /**
   * Update category progress
   */
  updateCategoryProgress(category) {
    const categorySection = this.container.querySelector(`[data-category="${category}"]`).closest('.snowflake-category-section');
    if (!categorySection) return;
    
    const upgrades = getUpgradesByCategory(category);
    const ownedCount = this.getOwnedCount(category);
    const totalCount = upgrades.length;
    
    const progressText = categorySection.querySelector('.progress-text');
    const progressFill = categorySection.querySelector('.progress-fill');
    
    if (progressText) {
      progressText.textContent = `${ownedCount}/${totalCount} owned`;
    }
    
    if (progressFill) {
      progressFill.style.width = `${(ownedCount / totalCount) * 100}%`;
    }
  }

  /**
   * Update jump summary with current purchase stats
   */
  updateJumpSummary() {
    const upgradesCountElement = document.getElementById('jump-upgrades-count');
    const snowflakesSpentElement = document.getElementById('jump-snowflakes-spent');
    
    if (!upgradesCountElement || !snowflakesSpentElement) return;
    
    // Count purchased upgrades
    const purchasedUpgrades = this.game.persistentUpgrades || [];
    const upgradesCount = purchasedUpgrades.length;
    
    // Use tracked snowflakes spent
    const snowflakesSpent = this.snowflakesSpent;
    
    upgradesCountElement.textContent = upgradesCount;
    snowflakesSpentElement.textContent = snowflakesSpent.toLocaleString();
    
    // Update spending summary if it exists
    this.updateSpendingSummary();
  }

  /**
   * Update spending summary with lifetime stats
   */
  updateSpendingSummary() {
    const lifetimeUpgradesElement = document.getElementById('lifetime-upgrades');
    const lifetimeSpendingElement = document.getElementById('lifetime-spending');
    const snowflakesAvailableElement = document.getElementById('snowflakes-available');
    
    if (lifetimeUpgradesElement) {
      const purchasedUpgrades = this.game.persistentUpgrades || [];
      lifetimeUpgradesElement.textContent = purchasedUpgrades.length.toLocaleString();
    }
    
    if (lifetimeSpendingElement) {
      lifetimeSpendingElement.textContent = this.lifetimeSnowflakesSpent.toLocaleString();
    }
    
    if (snowflakesAvailableElement) {
      snowflakesAvailableElement.textContent = (this.game.snowflakes || 0).toLocaleString();
    }
  }

  /**
   * Refresh the entire grid
   */
  refresh() {
    this.renderGrid();
  }

  /**
   * Destroy the grid
   */
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
} 