/**
 * CentralNotificationPanel.js - Central notification panel for lore and achievements
 * 
 * Features:
 * - Queue system for multiple notifications
 * - 10-second display duration per message
 * - Slide-in from top animation
 * - Handles both lore and achievement messages
 * 
 * POSITIONING GUIDE:
 * ==================
 * 
 * Current Position: top: 1%, left: 55% (centered on 55% position)
 * 
 * FINE-TUNING LOCATIONS:
 * ----------------------
 * 1. Initial positioning (createPanel method): Lines ~32-34
 * 2. Display positioning (showMessage method): Lines ~129-131
 * 
 * HORIZONTAL POSITION (Left/Right):
 * ---------------------------------
 * - left: '50%' = Center of screen
 * - left: '55%' = 5% right of center (current)
 * - left: '60%' = 10% right of center
 * - left: '70%' = 20% right of center
 * - left: '80%' = 30% right of center
 * - left: '40%' = 10% left of center
 * 
 * VERTICAL POSITION (Top/Bottom):
 * -------------------------------
 * - top: '1%' = 1% from top (current)
 * - top: '5%' = 5% from top
 * - top: '10%' = 10% from top
 * - top: '15%' = 15% from top
 * - top: '20%' = 20% from top
 * 
 * ALTERNATIVE UNITS:
 * ------------------
 * // Pixels (fixed position)
 * this.panel.style.top = '100px';
 * this.panel.style.left = '800px';
 * 
 * // Viewport units (responsive)
 * this.panel.style.top = '15vh';
 * this.panel.style.left = '70vw';
 * 
 * // Calc (complex positioning)
 * this.panel.style.left = 'calc(50% + 200px)';
 * 
 * TIMING ADJUSTMENTS:
 * ===================
 * 
 * Display Duration: Line ~95 - Change 10000 (10 seconds) to desired milliseconds
 * Transition Delay: Line ~96 - Change 500 (0.5 seconds) to desired milliseconds
 * Hide Animation: Line ~142 - Change 500 (0.5 seconds) to desired milliseconds
 * 
 * Examples:
 * - 5 seconds display: setTimeout(() => this.displayNext(), 500), 5000)
 * - 15 seconds display: setTimeout(() => this.displayNext(), 500), 15000)
 * - 1 second transition: setTimeout(() => this.displayNext(), 1000), 10000)
 * 
 * PANEL SIZE:
 * ===========
 * Width: Line ~35 - Change '400px' to desired width
 * Height: Line ~37 - Change '120px' to desired height
 * Max Width: Line ~36 - Change '400px' to desired max width
 */

class CentralNotificationPanel {
  constructor() {
    this.queue = [];
    this.isDisplaying = false;
    this.currentMessage = null;
    this.panel = null;
    this.init();
  }

  init() {
    this.createPanel();
    this.setupEventListeners();
  }

  createPanel() {
    // Create the panel element
    this.panel = document.createElement('div');
    this.panel.id = 'central-notification-panel';
    this.panel.className = 'notification-panel central';
    this.panel.style.display = 'none';
    this.panel.style.position = 'fixed';
    this.panel.style.top = '0.25%'; // 1% from top of screen
    this.panel.style.left = '55%'; // 55% from left (5% right of center)
    this.panel.style.transform = 'translateX(-50%)'; // Center the panel on the 55% position
    this.panel.style.zIndex = '10000';
    this.panel.style.width = '400px'; // Fixed width for middle column
    this.panel.style.maxWidth = '400px';
    this.panel.style.height = '108px'; /* Reduced from 120px by 10% */
    this.panel.style.background = 'rgba(0, 0, 0, 0.85)';
    this.panel.style.border = '2px solid #4A90E2';
    this.panel.style.borderRadius = '12px';
    this.panel.style.color = 'white';
    
    // Create panel content
    this.panel.innerHTML = `
      <div class="notification-content" style="display: flex; align-items: center; padding: 20px; height: 100%; color: white;">
        <div class="notification-icon" style="font-size: 2.5rem; margin-right: 20px; flex-shrink: 0;"></div>
        <div class="notification-text" style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
          <div class="notification-title" style="font-size: 1.4rem; font-weight: bold; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);"></div>
          <div class="notification-description" style="font-size: 1.1rem; line-height: 1.4; opacity: 0.9;"></div>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(this.panel);
    // console.log('[CENTRAL_PANEL] Panel created and added to DOM:', this.panel);
    // console.log('[CENTRAL_PANEL] Panel position:', this.panel.getBoundingClientRect());
  }

  setupEventListeners() {
    // Listen for achievement and lore events
    if (window.eventBus) {
      window.eventBus.on('achievementUnlocked', (data) => {
        this.addMessage({
          type: 'achievement',
          icon: '🏆',
          title: 'Achievement Unlocked!',
          description: data.achievement?.title || 'Achievement unlocked!',
          color: '#FFD700'
        });
      }, 'centralNotification');

      window.eventBus.on('loreUnlocked', (data) => {
        this.addMessage({
          type: 'lore',
          icon: '📖',
          title: 'New Lore Discovered!',
          description: data.lore?.title || 'New lore discovered!',
          color: '#4A90E2'
        });
      }, 'centralNotification');
    }
  }

  addMessage(message) {
    this.queue.push(message);
    if (!this.isDisplaying) {
      this.displayNext();
    }
  }

  displayNext() {
    if (this.queue.length === 0) {
      this.isDisplaying = false;
      return;
    }

    this.isDisplaying = true;
    this.currentMessage = this.queue.shift();
    this.showMessage(this.currentMessage);

    setTimeout(() => {
      this.hideMessage();
      setTimeout(() => this.displayNext(), 500); // 500ms transition delay
    }, 10000); // 10 seconds display
  }

  showMessage(message) {
    // console.log('[CENTRAL_PANEL] Showing message:', message);
    // console.log('[CENTRAL_PANEL] Panel element:', this.panel);
    // console.log('[CENTRAL_PANEL] Panel display before:', this.panel.style.display);
    
    const iconEl = this.panel.querySelector('.notification-icon');
    const titleEl = this.panel.querySelector('.notification-title');
    const descriptionEl = this.panel.querySelector('.notification-description');

    // Set content
    iconEl.textContent = message.icon;
    titleEl.textContent = message.title;
    descriptionEl.textContent = message.description;

    // Set color theme
    this.panel.style.borderColor = message.color;
    iconEl.style.color = message.color;

    // Show panel with animation
    this.panel.style.display = 'block';
    this.panel.style.position = 'fixed';
    this.panel.style.top = '0.25%'; // 1% from top of screen
    this.panel.style.left = '55%'; // 55% from left (5% right of center)
    this.panel.style.transform = 'translateX(-50%)'; // Center the panel on the 55% position
    this.panel.style.zIndex = '10000';
    this.panel.classList.add('slide-in');
    // console.log('[CENTRAL_PANEL] Panel display after:', this.panel.style.display);
    // console.log('[CENTRAL_PANEL] Panel classes:', this.panel.className);
    // console.log('[CENTRAL_PANEL] Panel position after show:', this.panel.getBoundingClientRect());
    // console.log('[CENTRAL_PANEL] Computed styles:', {
    //   position: getComputedStyle(this.panel).position,
    //   top: getComputedStyle(this.panel).top,
    //   left: getComputedStyle(this.panel).left,
    //   transform: getComputedStyle(this.panel).transform,
    //   zIndex: getComputedStyle(this.panel).zIndex
    // });
  }

  hideMessage() {
    this.panel.classList.add('slide-out');
    setTimeout(() => {
      this.panel.style.display = 'none';
      this.panel.classList.remove('slide-in', 'slide-out');
    }, 500);
  }

  // Public method to manually add messages (for testing)
  showNotification(type, title, description) {
    const message = {
      type: type,
      icon: type === 'achievement' ? '🏆' : '📖',
      title: title,
      description: description,
      color: type === 'achievement' ? '#FFD700' : '#4A90E2'
    };
    this.addMessage(message);
  }
}

// Export for use in other modules
window.CentralNotificationPanel = CentralNotificationPanel; 