/**
 * ConcordActivityPanel.js - Bottom panel for Concord activities (yetis, travel, battles)
 * 
 * Features:
 * - Priority system for different activity types
 * - 15-second display duration
 * - Themed backgrounds based on activity type
 * - Slide-in from bottom animation
 */

class ConcordActivityPanel {
  constructor() {
    this.currentMessage = null;
    this.panel = null;
    this.displayTimeout = null;
    this.priorityQueue = [];
    this.init();
  }

  init() {
    this.createPanel();
    this.setupEventListeners();
  }

  createPanel() {
    // Create the panel element
    this.panel = document.createElement('div');
    this.panel.id = 'concord-activity-panel';
    this.panel.className = 'activity-panel';
    this.panel.style.display = 'none';
    
    // Apply critical inline styles for positioning and sizing
    this.panel.style.position = 'fixed';
    this.panel.style.bottom = '0.5%';
    this.panel.style.left = '55%';
    this.panel.style.transform = 'translateX(-50%)';
    this.panel.style.width = 'calc(100% - 40px)';
    this.panel.style.maxWidth = '400px';
    this.panel.style.height = '162px';
    this.panel.style.zIndex = '9999';
    this.panel.style.background = 'rgba(255, 255, 255, 0.95)';
    this.panel.style.border = '2px solid #1976D2';
    this.panel.style.borderRadius = '12px'; /* All corners rounded like central panel */
    this.panel.style.boxShadow = '0 -4px 20px rgba(0, 0, 0, 0.3)';
    this.panel.style.backdropFilter = 'blur(10px)';
    
    // Create panel content
    this.panel.innerHTML = `
      <div class="activity-content">
        <div class="activity-icon"></div>
        <div class="activity-text">
          <div class="activity-title"></div>
          <div class="activity-description"></div>
        <div class="activity-details"></div>
        </div>
      </div>
    `;
    
    // Add to document
    document.body.appendChild(this.panel);
    // console.log('[CONCORD_PANEL] Panel created and added to DOM:', this.panel);
    // console.log('[CONCORD_PANEL] Panel position:', this.panel.getBoundingClientRect());
  }

  setupEventListeners() {
    // Listen for Concord activity events
    if (window.eventBus) {
      // Yeti sightings
      window.eventBus.on('yetiSpawned', (data) => {
        this.showMessage({
          type: 'yeti',
          // icon: '🧊',
          title: 'Yeti Sighting!',
          description: `${data.yeti?.name || 'A Yeti'} has appeared!`,
          details: `Class: ${data.yeti?.class || 'Unknown'}`,
          background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
          color: '#1976D2',
          priority: 2
        });
      }, 'concordActivity');

      // Yeti buff activation (results when yeti is clicked)
      window.eventBus.on('yetiBuffActivated', (data) => {
        // console.log(`[CONCORD PANEL] Received yetiBuffActivated event:`, data);
        
        // Get the applied amounts from the event data
        let resultDetails = '';
        
        // Use the applied amounts from the event data
        if (data.appliedAmounts) {
          const amounts = data.appliedAmounts;
          // console.log(`[CONCORD PANEL] Processing appliedAmounts:`, amounts);
          const resultParts = [];
          
          if (amounts.snowballs) {
            resultParts.push(`+${amounts.snowballs.toLocaleString()} snowballs`);
          }
          if (amounts.assistants) {
            const assistantList = Object.entries(amounts.assistants)
              .filter(([type, count]) => count > 0)
              .map(([type, count]) => `+${count} ${type}`)
              .join(', ');
            if (assistantList) {
              resultParts.push(assistantList);
            }
          }
          if (amounts.icicles) {
            resultParts.push(`+${amounts.icicles.toLocaleString()} icicles`);
          }
          if (amounts.snowflakes) {
            resultParts.push(`+${amounts.snowflakes.toLocaleString()} snowflakes`);
          }
          
          // console.log(`[CONCORD PANEL] Result parts:`, resultParts);
          if (resultParts.length > 0) {
            resultDetails = resultParts.join(' | ');
          }
        }
        
        // console.log(`[CONCORD PANEL] Final resultDetails:`, resultDetails);
        
        // Fallback to effect description if no amounts
        if (!resultDetails) {
          resultDetails = `Effect: ${data.baseEffect?.description || 'Unknown effect'}`;
        }
        
        this.showMessage({
          type: 'yetiResult',
          // icon: '🎁',
          title: 'Yeti Reward!',
          description: `${data.yetiName || 'A Yeti'} has granted you its power!`,
          details: resultDetails,
          background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
          color: '#F57C00',
          priority: 4
        });
      }, 'concordActivity');

      // Travel events
      window.eventBus.on('travelComplete', (data) => {
        this.showMessage({
          type: 'travel',
          // icon: '🗺️',
          title: 'Travel Complete!',
          description: `You have arrived at ${data.location?.name || 'your destination'}`,
          details: `Momentum: +${data.momentum || 0}% | Duration: ${data.duration || 'Unknown'}`,
          background: 'linear-gradient(135deg, #E8F5E8, #C8E6C9)',
          color: '#388E3C',
          priority: 1
        });
      }, 'concordActivity');

      // Battle results
      window.eventBus.on('battleResult', (data) => {
        const isVictory = data.result === 'victory';
        
        // Build details string based on battle outcome
        let details = `Damage Dealt: ${data.damageDealt || 0} | Damage Taken: ${data.damageTaken || 0}`;
        
        if (isVictory && data.rewards) {
          if (data.rewards.snowballs > 0) {
            details += ` | Rewards: +${data.rewards.snowballs.toLocaleString()} Snowballs`;
          }
          if (data.rewards.abilityLevel) {
            details += ` | Ability Belt: +${data.rewards.abilityLevel}`;
          }
        } else if (!isVictory && data.losses) {
          // Include penalty information for defeats
          details += ` | Losses: ${data.losses.description}`;
        }
        
        this.showMessage({
          type: 'battle',
          // icon: isVictory ? '⚔️' : '💀',
          title: isVictory ? 'Battle Victory!' : 'Battle Defeat!',
          description: isVictory ? `You defeated ${data.enemy?.name || 'the enemy'}` : `You were defeated by ${data.enemy?.name || 'the enemy'}`,
          details: details,
          background: isVictory ? 'linear-gradient(135deg, #FFF3E0, #FFE0B2)' : 'linear-gradient(135deg, #FFEBEE, #FFCDD2)',
          color: isVictory ? '#F57C00' : '#D32F2F',
          priority: 5
        });
      }, 'concordActivity');
    }
  }

  showMessage(message) {
    // Check priority - if current message has lower priority, interrupt it
    if (this.currentMessage && this.currentMessage.priority < message.priority) {
      this.hideMessage();
      setTimeout(() => this.displayMessage(message), 500);
    } else if (!this.currentMessage) {
      this.displayMessage(message);
    } else {
      // Add to priority queue if current message has higher or equal priority
      this.priorityQueue.push(message);
    }
  }

  displayMessage(message) {
    const iconEl = this.panel.querySelector('.activity-icon');
    const titleEl = this.panel.querySelector('.activity-title');
    const descriptionEl = this.panel.querySelector('.activity-description');
    const detailsEl = this.panel.querySelector('.activity-details');

    // Set content
    iconEl.textContent = message.icon;
    titleEl.textContent = message.title;
    descriptionEl.textContent = message.description;
    detailsEl.textContent = message.details;

    // Set styling
    this.panel.style.background = message.background;
    this.panel.style.borderColor = message.color;
    iconEl.style.color = message.color;
    titleEl.style.color = message.color;

    // Ensure critical positioning styles are applied
    this.panel.style.position = 'fixed';
    this.panel.style.bottom = '0.5%';
    this.panel.style.left = '55%';
    this.panel.style.transform = 'translateX(-50%)';
    this.panel.style.width = 'calc(100% - 40px)';
    this.panel.style.maxWidth = '400px';
    this.panel.style.height = '162px';
    this.panel.style.zIndex = '9999';

    // Show panel with animation
    this.panel.style.display = 'block';
    this.panel.classList.add('slide-in');

    // Store current message and set timeout
    this.currentMessage = message;
    this.displayTimeout = setTimeout(() => {
      this.hideMessage();
    }, 10000); // 10 seconds
  }

  hideMessage() {
    if (this.displayTimeout) {
      clearTimeout(this.displayTimeout);
      this.displayTimeout = null;
    }

    this.panel.classList.add('slide-out');
    setTimeout(() => {
      this.panel.style.display = 'none';
      this.panel.classList.remove('slide-in', 'slide-out');
      this.currentMessage = null;
      
      // Show next message from priority queue if any
      if (this.priorityQueue.length > 0) {
        const nextMessage = this.priorityQueue.shift();
        setTimeout(() => this.displayMessage(nextMessage), 500);
      }
    }, 500);
  }

  // Public method to manually show messages (for testing)
  showActivity(type, title, description, details) {
    const messageConfigs = {
      yeti: {
        // icon: '🧊',
        background: 'linear-gradient(135deg, #E3F2FD, #BBDEFB)',
        color: '#1976D2',
        priority: 2
      },
      yetiResult: {
        // icon: '🎁',
        background: 'linear-gradient(135deg, #FFF8E1, #FFECB3)',
        color: '#F57C00',
        priority: 4
      },
      travel: {
        // icon: '🗺️',
        background: 'linear-gradient(135deg, #E8F5E8, #C8E6C9)',
        color: '#388E3C',
        priority: 1
      },
      battle: {
        // icon: '⚔️',
        background: 'linear-gradient(135deg, #FFF3E0, #FFE0B2)',
        color: '#F57C00',
        priority: 5
      }
    };

    const config = messageConfigs[type] || messageConfigs.battle;
    
    this.showMessage({
      type: type,
      icon: config.icon,
      title: title,
      description: description,
      details: details,
      background: config.background,
      color: config.color,
      priority: config.priority
    });
  }
}

// Export for use in other modules
window.ConcordActivityPanel = ConcordActivityPanel; 