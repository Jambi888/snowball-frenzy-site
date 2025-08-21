/**
 * ui/renderer.js - Enhanced Renderer with Component Integration
 * 
 * This module provides rendering functions that integrate with the new
 * unified UI framework while maintaining backward compatibility.
 */

import { ComponentFactory } from './components.js';

/**
 * Render an upgrade card using the new component system
 * @param {Object} upgrade - Upgrade data
 * @param {GameStateFlat} game - Game state
 * @param {boolean} isUnlocked - Whether the upgrade is unlocked
 * @param {boolean} isPurchased - Whether the upgrade is purchased
 * @param {Function} onBuy - Purchase callback
 * @returns {HTMLElement} - Rendered upgrade card
 */
export function renderUpgradeCard(upgrade, game, isUnlocked, isPurchased, onBuy) {
  // Use the new component system for consistent styling
  const card = ComponentFactory.createCard({
    clickable: !isPurchased && isUnlocked,
    className: `upgrade-card type-${upgrade.type || 'default'}`
  });
  
  const cardElement = card.createElement();
  
  // Create card content
  const content = document.createElement('div');
  content.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
  `;
  
  // Title
  const title = document.createElement('h3');
  title.textContent = upgrade.name;
  title.style.cssText = `
    margin: 0;
    color: #2196F3;
    font-size: 16px;
    font-weight: bold;
  `;
  
  // Description
  const desc = document.createElement('p');
  desc.textContent = upgrade.description;
  desc.style.cssText = `
    margin: 0;
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  `;
  
  // Status information
  const status = document.createElement('div');
  status.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    padding: 8px 0;
    border-top: 1px solid #eee;
  `;
  
  const cost = document.createElement('span');
  cost.textContent = `Cost: ${upgrade.cost.toExponential(2)}`;
  cost.style.color = '#FF9800';
  
  const owned = document.createElement('span');
  owned.innerHTML = isPurchased ? '✅ Owned' : '❌ Not Owned';
  owned.style.color = isPurchased ? '#4CAF50' : '#F44336';
  
  status.appendChild(cost);
  status.appendChild(owned);
  
  // Assemble content
  content.appendChild(title);
  content.appendChild(desc);
  content.appendChild(status);
  
  // Add purchase button if applicable
  if (!isPurchased && isUnlocked) {
    const button = ComponentFactory.createButton({
      textContent: 'Purchase',
      variant: 'primary',
      size: 'small',
      onClick: () => {
        if (onBuy) {
          onBuy();
          // Show purchase notification
          ComponentFactory.showNotification(
            `Purchased ${upgrade.name}!`, 
            'success', 
            2000
          );
        }
      }
    });
    
    const buttonElement = button.createElement();
    buttonElement.style.marginTop = '8px';
    content.appendChild(buttonElement);
  }
  
  cardElement.appendChild(content);
  
  return cardElement;
}

/**
 * Render a system status panel
 * @param {string} systemName - Name of the system
 * @param {Object} systemData - System data
 * @param {Object} options - Rendering options
 * @returns {HTMLElement} - Rendered system panel
 */
export function renderSystemStatus(systemName, systemData, options = {}) {
  const panel = ComponentFactory.createSystemPanel({
    title: systemName,
    collapsible: options.collapsible !== false,
    collapsed: options.collapsed || false
  });
  
  const panelElement = panel.createElement();
  
  // Add system statistics
  if (systemData.statistics) {
    const stats = systemData.statistics;
    
    Object.entries(stats).forEach(([key, value]) => {
      if (typeof value === 'number') {
        const statDisplay = ComponentFactory.createStatDisplay({
          label: key.replace(/([A-Z])/g, ' $1').trim(),
          value: value,
          format: key.includes('Time') ? 'number' : 'integer',
          color: '#2196F3'
        });
        
        panel.addComponent(statDisplay);
      }
    });
  }
  
  // Add system efficiency if available
  if (systemData.efficiency !== undefined) {
    const efficiencyDisplay = ComponentFactory.createStatDisplay({
      label: 'Efficiency',
      value: systemData.efficiency,
      format: 'percentage',
      color: '#4CAF50'
    });
    
    panel.addComponent(efficiencyDisplay);
  }
  
  return panelElement;
}

/**
 * Render a progress display for any system
 * @param {string} label - Progress label
 * @param {number} current - Current value
 * @param {number} max - Maximum value
 * @param {Object} options - Rendering options
 * @returns {HTMLElement} - Rendered progress display
 */
export function renderProgress(label, current, max, options = {}) {
  const container = document.createElement('div');
  container.style.cssText = `
    margin: 8px 0;
    padding: 8px;
    background: rgba(0,0,0,0.05);
    border-radius: 4px;
  `;
  
  // Label
  const labelElement = document.createElement('div');
  labelElement.textContent = label;
  labelElement.style.cssText = `
    font-weight: bold;
    margin-bottom: 4px;
    color: #333;
  `;
  
  // Progress bar
  const progressBar = ComponentFactory.createProgressBar({
    value: current,
    max: max,
    color: options.color || '#4CAF50',
    showText: options.showText !== false
  });
  
  container.appendChild(labelElement);
  container.appendChild(progressBar.createElement());
  
  return container;
}

/**
 * Create a notification for system events
 * @param {string} systemType - Type of system (active, passive, hybrid)
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 */
export function notifySystemEvent(systemType, message, type = 'info') {
  const systemColors = {
    active: 'info',
    passive: 'success',  
    hybrid: 'warning'
  };
  
  const fullMessage = `[${systemType.toUpperCase()}] ${message}`;
  ComponentFactory.showNotification(
    fullMessage, 
    systemColors[systemType] || type,
    3000
  );
}

/**
 * Legacy compatibility function
 * Maintains backward compatibility with existing code
 */
export function legacyRenderUpgradeCard(upgrade, game, isUnlocked, isPurchased, onBuy) {
  // console.warn('[RENDERER] Using legacy renderUpgradeCard - consider upgrading to new component system');
  return renderUpgradeCard(upgrade, game, isUnlocked, isPurchased, onBuy);
}