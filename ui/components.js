/**
 * ui/components.js - Reusable UI Components
 * 
 * This module provides a library of reusable UI components with consistent styling
 * and behavior. Components integrate with the UIManager for performance optimization
 * and maintain consistent theming across the application.
 */

/**
 * Base component class
 */
export class UIComponent {
  constructor(type, options = {}) {
    this.type = type;
    this.options = options;
    this.element = null;
    this.children = [];
    this.isRendered = false;
    this.eventListeners = new Map();
  }
  
  /**
   * Create the DOM element
   * @returns {HTMLElement} - The created element
   */
  createElement() {
    if (this.element) return this.element;
    
    this.element = document.createElement(this.type);
    this.applyStyles();
    this.attachEventListeners();
    this.isRendered = true;
    
    return this.element;
  }
  
  /**
   * Apply styles to the element
   */
  applyStyles() {
    if (!this.element) return;
    
    // Apply base styles
    if (this.options.styles) {
      Object.assign(this.element.style, this.options.styles);
    }
    
    // Apply CSS classes
    if (this.options.className) {
      this.element.className = this.options.className;
    }
    
    // Set content
    if (this.options.textContent) {
      this.element.textContent = this.options.textContent;
    }
    
    if (this.options.innerHTML) {
      this.element.innerHTML = this.options.innerHTML;
    }
  }
  
  /**
   * Attach event listeners
   */
  attachEventListeners() {
    if (!this.element) return;
    
    if (this.options.onClick) {
      this.element.addEventListener('click', this.options.onClick);
      this.eventListeners.set('click', this.options.onClick);
    }
    
    if (this.options.onHover) {
      this.element.addEventListener('mouseenter', this.options.onHover);
      this.eventListeners.set('mouseenter', this.options.onHover);
    }
    
    if (this.options.onLeave) {
      this.element.addEventListener('mouseleave', this.options.onLeave);
      this.eventListeners.set('mouseleave', this.options.onLeave);
    }
  }
  
  /**
   * Update the component
   * @param {Object} newOptions - New options to apply
   */
  update(newOptions = {}) {
    this.options = { ...this.options, ...newOptions };
    
    if (this.isRendered) {
      this.applyStyles();
    }
  }
  
  /**
   * Destroy the component
   */
  destroy() {
    if (this.element) {
      // Remove event listeners
      for (const [event, handler] of this.eventListeners) {
        this.element.removeEventListener(event, handler);
      }
      
      // Remove from DOM
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      
      this.element = null;
      this.isRendered = false;
    }
  }
}

/**
 * Card component for displaying content in a styled container
 */
export class CardComponent extends UIComponent {
  constructor(options = {}) {
    super('div', options);
    this.cardStyles = {
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '8px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
      cursor: options.clickable ? 'pointer' : 'default'
    };
  }
  
  applyStyles() {
    super.applyStyles();
    
    if (this.element) {
      Object.assign(this.element.style, this.cardStyles);
      
      // Add hover effects if clickable
      if (this.options.clickable) {
        this.element.addEventListener('mouseenter', () => {
          this.element.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
          this.element.style.transform = 'translateY(-2px)';
        });
        
        this.element.addEventListener('mouseleave', () => {
          this.element.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          this.element.style.transform = 'translateY(0)';
        });
      }
    }
  }
}

/**
 * Button component with multiple variants
 */
export class ButtonComponent extends UIComponent {
  constructor(options = {}) {
    super('button', options);
    this.variant = options.variant || 'primary';
    this.size = options.size || 'medium';
    this.disabled = options.disabled || false;
  }
  
  applyStyles() {
    super.applyStyles();
    
    if (this.element) {
      // Base button styles
      const baseStyles = {
        border: 'none',
        borderRadius: '4px',
        cursor: this.disabled ? 'not-allowed' : 'pointer',
        fontWeight: 'bold',
        fontSize: '14px',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        outline: 'none'
      };
      
      // Size variations
      const sizeStyles = {
        small: { padding: '4px 8px', fontSize: '12px' },
        medium: { padding: '8px 16px', fontSize: '14px' },
        large: { padding: '12px 24px', fontSize: '16px' }
      };
      
      // Variant styles
      const variantStyles = {
        primary: { backgroundColor: '#2196F3', color: 'white' },
        secondary: { backgroundColor: '#FF9800', color: 'white' },
        success: { backgroundColor: '#4CAF50', color: 'white' },
        warning: { backgroundColor: '#FF5722', color: 'white' },
        error: { backgroundColor: '#F44336', color: 'white' },
        outline: { 
          backgroundColor: 'transparent', 
          color: '#2196F3', 
          border: '1px solid #2196F3' 
        }
      };
      
      // Apply styles
      Object.assign(this.element.style, baseStyles, sizeStyles[this.size], variantStyles[this.variant]);
      
      // Disabled state
      if (this.disabled) {
        this.element.style.opacity = '0.6';
        this.element.disabled = true;
      }
      
      // Hover effects
      if (!this.disabled) {
        this.element.addEventListener('mouseenter', () => {
          this.element.style.opacity = '0.9';
          this.element.style.transform = 'translateY(-1px)';
        });
        
        this.element.addEventListener('mouseleave', () => {
          this.element.style.opacity = '1';
          this.element.style.transform = 'translateY(0)';
        });
        
        this.element.addEventListener('mousedown', () => {
          this.element.style.transform = 'translateY(0)';
        });
        
        this.element.addEventListener('mouseup', () => {
          this.element.style.transform = 'translateY(-1px)';
        });
      }
    }
  }
  
  /**
   * Enable or disable the button
   * @param {boolean} disabled - Whether to disable the button
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    this.applyStyles();
  }
}

/**
 * Progress bar component
 */
export class ProgressBarComponent extends UIComponent {
  constructor(options = {}) {
    super('div', options);
    this.value = options.value || 0;
    this.max = options.max || 100;
    this.showText = options.showText !== false;
    this.color = options.color || '#4CAF50';
  }
  
  createElement() {
    super.createElement();
    
    if (this.element) {
      this.element.style.cssText = `
        width: 100%;
        height: 20px;
        background-color: #e0e0e0;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
        margin: 4px 0;
      `;
      
      // Create progress fill
      this.fillElement = document.createElement('div');
      this.fillElement.style.cssText = `
        height: 100%;
        background-color: ${this.color};
        transition: width 0.3s ease;
        border-radius: 10px;
      `;
      
      // Create text overlay
      if (this.showText) {
        this.textElement = document.createElement('div');
        this.textElement.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 12px;
          font-weight: bold;
          color: #333;
          text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        `;
        this.element.appendChild(this.textElement);
      }
      
      this.element.appendChild(this.fillElement);
      this.updateProgress();
    }
    
    return this.element;
  }
  
  /**
   * Update the progress bar
   * @param {number} value - Current value
   * @param {number} max - Maximum value
   */
  updateProgress(value = this.value, max = this.max) {
    this.value = value;
    this.max = max;
    
    if (this.fillElement) {
      const percentage = Math.max(0, Math.min(100, (value / max) * 100));
      this.fillElement.style.width = `${percentage}%`;
      
      if (this.textElement) {
        this.textElement.textContent = `${Math.round(percentage)}%`;
      }
    }
  }
}

/**
 * Stat display component
 */
export class StatDisplayComponent extends UIComponent {
  constructor(options = {}) {
    super('div', options);
    this.label = options.label || 'Stat';
    this.value = options.value || 0;
    this.format = options.format || 'number';
    this.color = options.color || '#333';
  }
  
  createElement() {
    super.createElement();
    
    if (this.element) {
      this.element.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        margin: 2px 0;
        background-color: rgba(0,0,0,0.05);
        border-radius: 4px;
        font-size: 14px;
      `;
      
      this.updateDisplay();
    }
    
    return this.element;
  }
  
  /**
   * Update the stat display
   * @param {*} value - New value
   * @param {string} label - New label (optional)
   */
  updateStat(value, label = this.label) {
    this.value = value;
    this.label = label;
    this.updateDisplay();
  }
  
  /**
   * Update the display content
   */
  updateDisplay() {
    if (!this.element) return;
    
    let formattedValue;
    switch (this.format) {
      case 'number':
        formattedValue = typeof this.value === 'number' ? this.value.toFixed(1) : this.value;
        break;
      case 'integer':
        formattedValue = typeof this.value === 'number' ? Math.floor(this.value) : this.value;
        break;
      case 'percentage':
        formattedValue = typeof this.value === 'number' ? `${(this.value * 100).toFixed(1)}%` : this.value;
        break;
      case 'currency':
        formattedValue = typeof this.value === 'number' ? this.value.toExponential(2) : this.value;
        break;
      default:
        formattedValue = this.value;
    }
    
    this.element.innerHTML = `
      <span>${this.label}:</span>
      <span style="font-weight: bold; color: ${this.color};">${formattedValue}</span>
    `;
  }
}

/**
 * System panel component for organizing related UI elements
 */
export class SystemPanelComponent extends UIComponent {
  constructor(options = {}) {
    super('div', options);
    this.title = options.title || 'System';
    this.collapsible = options.collapsible || false;
    this.collapsed = options.collapsed || false;
    this.components = [];
  }
  
  createElement() {
    super.createElement();
    
    if (this.element) {
      this.element.style.cssText = `
        border: 1px solid #ddd;
        border-radius: 8px;
        margin: 8px 0;
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      `;
      
      // Create header
      this.headerElement = document.createElement('div');
      this.headerElement.style.cssText = `
        background-color: #f5f5f5;
        padding: 12px 16px;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
        cursor: ${this.collapsible ? 'pointer' : 'default'};
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;
      
      this.headerElement.innerHTML = `
        <span>${this.title}</span>
        ${this.collapsible ? `<span id="collapse-icon">${this.collapsed ? '▶' : '▼'}</span>` : ''}
      `;
      
      // Create content area
      this.contentElement = document.createElement('div');
      this.contentElement.style.cssText = `
        padding: 16px;
        display: ${this.collapsed ? 'none' : 'block'};
      `;
      
      this.element.appendChild(this.headerElement);
      this.element.appendChild(this.contentElement);
      
      // Add collapse functionality
      if (this.collapsible) {
        this.headerElement.addEventListener('click', () => {
          this.toggleCollapse();
        });
      }
    }
    
    return this.element;
  }
  
  /**
   * Toggle collapse state
   */
  toggleCollapse() {
    this.collapsed = !this.collapsed;
    
    if (this.contentElement) {
      this.contentElement.style.display = this.collapsed ? 'none' : 'block';
    }
    
    const icon = this.headerElement.querySelector('#collapse-icon');
    if (icon) {
      icon.textContent = this.collapsed ? '▶' : '▼';
    }
  }
  
  /**
   * Add a component to the panel
   * @param {UIComponent} component - Component to add
   */
  addComponent(component) {
    this.components.push(component);
    
    if (this.contentElement) {
      this.contentElement.appendChild(component.createElement());
    }
  }
  
  /**
   * Clear all components
   */
  clearComponents() {
    this.components.forEach(component => component.destroy());
    this.components = [];
    
    if (this.contentElement) {
      this.contentElement.innerHTML = '';
    }
  }
}

/**
 * Notification component for displaying messages
 */
export class NotificationComponent extends UIComponent {
  constructor(options = {}) {
    super('div', options);
    this.message = options.message || '';
    this.type = options.type || 'info';
    this.duration = options.duration || 3000;
    this.closable = options.closable !== false;
  }
  
  createElement() {
    super.createElement();
    
    if (this.element) {
      const colors = {
        info: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336'
      };
      
      this.element.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 16px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
        word-wrap: break-word;
        background-color: ${colors[this.type] || colors.info};
        transition: all 0.3s ease;
        transform: translateX(100%);
      `;
      
      this.element.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${this.message}</span>
          ${this.closable ? '<button style="background: none; border: none; color: white; cursor: pointer; margin-left: 8px;">×</button>' : ''}
        </div>
      `;
      
      // Add close functionality
      if (this.closable) {
        const closeButton = this.element.querySelector('button');
        closeButton.addEventListener('click', () => {
          this.close();
        });
      }
      
      // Auto-close after duration
      if (this.duration > 0) {
        setTimeout(() => {
          this.close();
        }, this.duration);
      }
      
      // Animate in
      document.body.appendChild(this.element);
      setTimeout(() => {
        this.element.style.transform = 'translateX(0)';
      }, 100);
    }
    
    return this.element;
  }
  
  /**
   * Close the notification
   */
  close() {
    if (this.element) {
      this.element.style.transform = 'translateX(100%)';
      setTimeout(() => {
        this.destroy();
      }, 300);
    }
  }
}

/**
 * Utility functions for creating components
 */
export const ComponentFactory = {
  /**
   * Create a card component
   * @param {Object} options - Component options
   * @returns {CardComponent} - Card component
   */
  createCard(options) {
    return new CardComponent(options);
  },
  
  /**
   * Create a button component
   * @param {Object} options - Component options
   * @returns {ButtonComponent} - Button component
   */
  createButton(options) {
    return new ButtonComponent(options);
  },
  
  /**
   * Create a progress bar component
   * @param {Object} options - Component options
   * @returns {ProgressBarComponent} - Progress bar component
   */
  createProgressBar(options) {
    return new ProgressBarComponent(options);
  },
  
  /**
   * Create a stat display component
   * @param {Object} options - Component options
   * @returns {StatDisplayComponent} - Stat display component
   */
  createStatDisplay(options) {
    return new StatDisplayComponent(options);
  },
  
  /**
   * Create a system panel component
   * @param {Object} options - Component options
   * @returns {SystemPanelComponent} - System panel component
   */
  createSystemPanel(options) {
    return new SystemPanelComponent(options);
  },
  
  /**
   * Show a notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type ('info', 'success', 'warning', 'error')
   * @param {number} duration - Duration in milliseconds (0 for persistent)
   * @returns {NotificationComponent} - Notification component
   */
  showNotification(message, type = 'info', duration = 3000) {
    return new NotificationComponent({ message, type, duration });
  }
};

export default ComponentFactory; 