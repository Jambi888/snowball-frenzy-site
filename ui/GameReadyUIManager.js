/**
 * ui/GameReadyUIManager.js - Game-Ready UI Management System
 * 
 * This module provides the final, production-ready UI for Snowball Frenzy.
 * It extends the OptimizedUIManager with a three-column layout and modern design.
 * 
 * Features:
 * - Three-column responsive layout (40% | 30% | 30%)
 * - Tab system for left column
 * - Interactive middle column with background
 * - Purchase system for right column
 * - Modern design system with icy theme
 * - Performance-optimized updates
 */

import { OptimizedUIManager } from './OptimizedUIManager.js';
import { formatNumber, formatSnowballs, formatAssistants, formatPercentage, formatSPS, formatAcceleration, formatROITime } from './numberFormatter.js';

// Debug: Verify imports are working - Force refresh


// Fallback function in case import fails
const fallbackFormatROITime = (cost, sps) => {
  if (sps <= 0) return '∞';
  if (cost <= 0) return '0s';
  
  const seconds = cost / sps;
  
  if (seconds < 60) {
    return Math.round(seconds) + 's';
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    if (remainingSeconds === 0) {
      return minutes + 'm';
    }
    return minutes + 'm ' + remainingSeconds + 's';
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    const remainingMinutes = Math.round((seconds % 3600) / 60);
    if (remainingMinutes === 0) {
      return hours + 'h';
    }
    return hours + 'h ' + remainingMinutes + 'm';
  } else {
    const days = Math.floor(seconds / 86400);
    const remainingHours = Math.round((seconds % 86400) / 3600);
    if (remainingHours === 0) {
      return days + 'd';
    }
    return days + 'd ' + remainingHours + 'h';
  }
};
import { YETI } from '../loops/hybrid/data/yetiData.js';
import { EVIL_YETI } from '../loops/hybrid/data/evilYetiData.js';
import { LOCATION } from '../loops/hybrid/data/locationData.js';

// Design system constants
const DESIGN_SYSTEM = {
  colors: {
    background: '#F8FAFC',
    primaryText: '#1E293B',
    secondaryText: '#475569',
    borders: '#E2E8F0',
    primaryAccent: '#38BDF8',
    hoverAccent: '#0EA5E9',
    secondaryAccent: '#FACC15',
    danger: '#EF4444'
  },
  typography: {
    fontFamily: 'Nunito, Arial, sans-serif',
    sizes: {
      L: '1.25rem',
      M: '1rem',
      S: '0.875rem'
    }
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

// Tab configuration
const TAB_CONFIG = {
  dashboard: { id: 'dashboard', label: 'Dashboard', icon: '', default: true },
  inventory: { id: 'inventory', label: 'Inventory', icon: '' },
  achievements: { id: 'achievements', label: 'Achievements', icon: '' },
  lore: { id: 'lore', label: 'Lore', icon: '' },
  jump: { id: 'jump', label: 'Echoes', icon: '' }
};

export class GameReadyUIManager extends OptimizedUIManager {
  constructor(game) {
    super(game);
    
    // Make this instance globally accessible for modal interactions
    window.gameReadyUI = this;
    // Tab management
    this.activeTab = 'dashboard';
    this.tabContent = new Map();
    // Component references
    this.components = {
      banner: null,
      leftColumn: null,
      middleColumn: null,
      rightColumn: null,
      tabSystem: null,
      miniWallet: null,
      interactiveArea: null,
      purchaseSystem: null
    };
    // Initialize the game-ready UI
    this.initializeGameReadyUI();
            // console.log('[GAME_READY_UI] GameReadyUIManager initialized');
  }

  /**
   * Initialize the game-ready UI system
   */
  initializeGameReadyUI() {
    // Inject design system CSS
    this.injectDesignSystem();
    // Create the new layout
    this.createGameReadyLayout();
    // Set up tab system
    this.setupTabSystem();
    // Initialize components
    this.initializeComponents();
    // Initialize notification panels
    this.initializeNotificationPanels();
    // Set up event listeners
    this.setupEventListeners();
    // Integrate with crystal snowball system
    this.integrateCrystalSnowballSystem();
    // Setup battle container globals
    this.setupBattleContainerGlobals();
    // Start buff status timer for frequent countdown updates
    this.startBuffStatusTimer();
    // Start achievement update timer for periodic refresh
    this.startAchievementUpdateTimer();
    // Trigger initial updates
    this.queueUpdate('all', 10); // Critical priority
    // Initial update of right column
    this.updateRightColumn();
    // Initialize snowfall effect
    this.initializeSnowfall();
  }

  /**
   * Inject design system CSS
   */
  injectDesignSystem() {
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --color-background: ${DESIGN_SYSTEM.colors.background};
        --color-primary-text: ${DESIGN_SYSTEM.colors.primaryText};
        --color-secondary-text: ${DESIGN_SYSTEM.colors.secondaryText};
        --color-borders: ${DESIGN_SYSTEM.colors.borders};
        --color-primary-accent: ${DESIGN_SYSTEM.colors.primaryAccent};
        --color-hover-accent: ${DESIGN_SYSTEM.colors.hoverAccent};
        --color-secondary-accent: ${DESIGN_SYSTEM.colors.secondaryAccent};
        --color-danger: ${DESIGN_SYSTEM.colors.danger};
        --font-family: ${DESIGN_SYSTEM.typography.fontFamily};
        --font-size-L: ${DESIGN_SYSTEM.typography.sizes.L};
        --font-size-M: ${DESIGN_SYSTEM.typography.sizes.M};
        --font-size-S: ${DESIGN_SYSTEM.typography.sizes.S};
        --spacing-xs: ${DESIGN_SYSTEM.spacing.xs};
        --spacing-sm: ${DESIGN_SYSTEM.spacing.sm};
        --spacing-md: ${DESIGN_SYSTEM.spacing.md};
        --spacing-lg: ${DESIGN_SYSTEM.spacing.lg};
        --spacing-xl: ${DESIGN_SYSTEM.spacing.xl};
        --border-radius: ${DESIGN_SYSTEM.borderRadius};
        --box-shadow: ${DESIGN_SYSTEM.boxShadow};
        
        /* Upgrade Grid Styles */
        .upgrades-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          padding: 16px;
          max-height: 300px;
          overflow-y: auto;
        }
        
        .upgrade-item {
          position: relative;
          width: 50px;
          height: 50px;
          border: 2px solid var(--color-borders);
          border-radius: var(--border-radius);
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .upgrade-item img {
          margin: 0;
          padding: 0;
          display: block;
        }

        /* Inventory Grid Layout */
        .inventory-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }
        
        /* Full-width blocks */
        .locations-block,
        .assistants-block,
        .ability-belt-block,
        .upgrades-block {
          grid-column: 1 / -1;
        }
        
        /* Block tracker styling */
        .block-tracker {
          margin-left: auto;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        /* Logo grid styling */
        .logo-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) 0;
        }
        
        .logo-grid.small-logos {
          grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
        }
        
        .inventory-item {
          position: relative;
          width: 40px;
          height: 40px;
          border: 2px solid var(--color-borders);
          border-radius: var(--border-radius);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          transition: all 0.2s ease;
        }
        
        .inventory-item.small-logos {
          width: 30px;
          height: 30px;
          font-size: 1rem;
        }
        
        .inventory-item.found {
          border-color: var(--color-primary-accent);
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }
        
        .inventory-item.not-found {
          border-color: var(--color-borders);
          background: #f8fafc;
          opacity: 0.6;
        }
        
        .inventory-item.unlocked {
          border-color: var(--color-secondary-accent);
          background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
        }
        
        .inventory-tooltip {
          position: absolute;
          bottom: 100%;
          left: 0%;
          transform: translateX(-20%);
          background: var(--color-primary-text);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
          width: 80px;
          height: 40px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 1000;
          margin-bottom: 8px;
        }
        
        /* Separate tooltip styling for upgrades in the Inventory tab */
        .inventory-upgrade-tooltip {
          position: absolute;
          bottom: 100%;
          left: 0%;
          transform: translateY(+15%);
          background: var(--color-primary-text);
          color: white;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--border-radius);
          font-size: 0.75rem;
          white-space: normal;
          word-wrap: break-word;
          overflow-wrap: break-word;
          width: 300px;
          height: 100px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease;
          z-index: 1000;
          margin-bottom: 8px;
        }
        
        .inventory-item:hover .inventory-tooltip {
          opacity: 1;
        }
        
        .inventory-item:hover .inventory-upgrade-tooltip {
          opacity: 1;
        }
        
        .inventory-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: var(--color-primary-text);
        }
        
        .inventory-upgrade-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: var(--color-primary-text);
        }
        
        .inventory-placeholder {
          padding: var(--spacing-md);
          text-align: center;
          color: var(--color-secondary-text);
          font-style: italic;
          background: #f8fafc;
          border-radius: var(--border-radius);
          border: 1px dashed var(--color-borders);
        }
        
        /* Upgrade categories */
        .upgrade-category {
          margin-bottom: var(--spacing-md);
        }
        
        .category-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: linear-gradient(90deg, var(--color-primary-accent) 0%, var(--color-hover-accent) 100%);
          border-radius: var(--border-radius);
          font-weight: 600;
          color: var(--color-primary-text);
        }
        
        .category-icon {
          font-size: 1rem;
        }
        
        .category-title {
          flex: 1;
          color: var(--color-primary-text);
          font-weight: 600;
        }
        
        .category-tracker {
          background: var(--color-primary-accent);
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        
        /* Assistants grid */
        .assistants-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) 0;
        }
        
        .assistant-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: var(--spacing-sm);
          border: 1px solid var(--color-borders);
          border-radius: var(--border-radius);
          background: white;
          transition: all 0.2s ease;
        }
        
        .assistant-item:hover {
          border-color: var(--color-primary-accent);
          transform: translateY(-1px);
        }
        
        .assistant-icon {
          width: 40px;
          height: 40px;
          background-size: cover;
          background-position: center;
          border-radius: var(--border-radius);
          margin-bottom: var(--spacing-xs);
        }
        
        .assistant-name {
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          margin-bottom: var(--spacing-xs);
        }
        
        .assistant-count {
          font-size: 0.7rem;
          color: var(--color-secondary-text);
          font-weight: 600;
        }
        
        .assistant-item.owned {
          border-color: var(--color-primary-accent);
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }
        
        .assistant-item.not-owned {
          border-color: var(--color-borders);
          background: #f8fafc;
          opacity: 0.6;
        }

        /* Ability Belt Styles */
        .ability-belt-container {
          padding: var(--spacing-md);
        }

        .ability-slots {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
        }

        .ability-slot {
          border: 2px solid var(--color-borders);
          border-radius: var(--border-radius);
          padding: var(--spacing-sm);
          background: white;
          min-height: 80px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          text-align: center;
          transition: all 0.2s ease;
        }

        .ability-slot.equipped {
          border-color: var(--color-primary-accent);
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
        }

        .ability-slot.empty {
          border-style: dashed;
          color: var(--color-secondary-text);
        }

        .ability-slot-title {
          font-weight: bold;
          font-size: var(--font-size-S);
          margin-bottom: var(--spacing-xs);
        }

        .ability-slot-name {
          font-size: var(--font-size-S);
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
        }

        .ability-slot-class {
          font-size: 0.75rem;
          color: var(--color-secondary-text);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ability-slot-description {
          font-size: 0.7rem;
          color: var(--color-secondary-text);
          margin-top: var(--spacing-xs);
          line-height: 1.2;
        }

        .ability-belt-frozen {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          border: 1px solid #fbbf24;
          border-radius: var(--border-radius);
          padding: var(--spacing-md);
          margin: var(--spacing-md) 0;
          color: #92400e;
          text-align: center;
        }

        .ability-belt-frozen-icon {
          font-size: 1.5rem;
          margin-bottom: var(--spacing-sm);
        }

        .ability-selection {
          border-top: 1px solid var(--color-borders);
          padding-top: var(--spacing-md);
        }

        .ability-selection h4 {
          margin-bottom: var(--spacing-md);
          color: var(--color-primary-text);
          font-size: var(--font-size-M);
        }

        .slot-selection {
          margin-bottom: var(--spacing-md);
        }

        .slot-selection label {
          display: block;
          font-weight: 600;
          margin-bottom: var(--spacing-xs);
          color: var(--color-primary-text);
        }

        .slot-selection select {
          width: 100%;
          padding: var(--spacing-sm);
          border: 1px solid var(--color-borders);
          border-radius: var(--border-radius);
          background: white;
          font-size: var(--font-size-S);
          transition: border-color 0.2s ease;
        }

        .slot-selection select:focus {
          outline: none;
          border-color: var(--color-primary-accent);
        }

        .slot-selection select option:disabled {
          color: var(--color-secondary-text);
          font-style: italic;
        }

        .clear-abilities-btn {
          background: var(--color-danger);
          color: white;
          border: none;
          border-radius: var(--border-radius);
          padding: var(--spacing-sm) var(--spacing-md);
          font-size: var(--font-size-S);
          cursor: pointer;
          transition: background-color 0.2s ease;
          margin-top: var(--spacing-md);
        }

        .clear-abilities-btn:hover {
          background: #dc2626;
        }
          justify-content: center;
        }
        
        .upgrade-item.affordable {
          border-color: var(--color-primary-accent);
          box-shadow: 0 2px 4px rgba(56, 189, 248, 0.2);
        }
        
        .upgrade-item.unaffordable {
          border-color: var(--color-borders);
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .upgrade-item:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .upgrade-item.affordable:hover {
          border-color: var(--color-hover-accent);
          box-shadow: 0 4px 8px rgba(56, 189, 248, 0.3);
        }
        
        .upgrade-icon {
          width: 40px;
          height: 40px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          border-radius: 4px;
        }
        
        .upgrade-tooltip {
          position: absolute;
          background: var(--color-primary-text);
          color: white;
          padding: var(--spacing-sm);
          border-radius: var(--border-radius);
          font-size: 0.75rem;  /* Smaller font for better fit */
          white-space: normal;
          opacity: 0;
          pointer-events: none;
          z-index: 9999 !important;  /* Force highest z-index to break stacking context */
          width: 300px;  /* Fixed width for 2:1 aspect ratio */
          height: 150px;  /* Fixed height for 2:1 aspect ratio */
          max-width: 300px;  /* Added max-width to ensure it doesn't get too wide */
          max-height: 100px;  /* Added max-height to ensure it doesn't get too tall */
          text-align: left;
          line-height: 1.3;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
          word-wrap: break-word;
          overflow-wrap: break-word;
          overflow-y: auto;  /* Scroll if content is too long */
        }
        
                /* Individual tooltip positions for each upgrade icon - converted to sibling selectors */
        /* Row 1 */
        .upgrade-item:nth-child(1):hover + 
        .upgrade-tooltip { top: 0%; left: 0%;transform: translate(0%,50%); margin-top: 8px; }
        .upgrade-item:nth-child(3):hover + .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-50%,50%); margin-top: 8px; }
        .upgrade-item:nth-child(5):hover + .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-50%,50%); margin-top: 8px; }
        .upgrade-item:nth-child(7):hover + .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-50%,50%); margin-top: 8px; margin-left: 8px; }
        .upgrade-item:nth-child(9):hover + .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-50%,50%); margin-top: 8px; }
        
        /* Row 2 */
        .upgrade-item:nth-child(11):hover + .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-60%, 25%); margin-left: 8px; }
        .upgrade-item:nth-child(13):hover + .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-60%, 25%); }
        .upgrade-item:nth-child(15):hover + .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-60%, 25%); }
        .upgrade-item:nth-child(17):hover + .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-55%, 25%); }
        .upgrade-item:nth-child(19):hover + .upgrade-tooltip { top: 0%; left: 100%; transform: translate(-100%, 25%);  }
        
        /* Additional rows if needed */
        .upgrade-item:nth-child(26) .upgrade-tooltip { top: 0%; left: 0%; transform: translateY(90%); margin-left: 8px; }
        .upgrade-item:nth-child(27) .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-50%, 90%); }
        .upgrade-item:nth-child(28) .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-50%, 90%); }
        .upgrade-item:nth-child(29) .upgrade-tooltip { top: 0%; left: 50%; transform: translate(-50%, 90%); }
        .upgrade-item:nth-child(30) .upgrade-tooltip { top: 0%; left: 100%; transform: translateY(90%); }
        
        /* Remove arrow since tooltip covers the icon */
        .upgrade-tooltip::after {
          display: none;
        }
        
        .upgrade-item {
          position: relative;
        }
        
        /* Show tooltips when hovering over upgrade items (sibling selectors) */
        .upgrade-item:hover + .upgrade-tooltip {
          opacity: 1;
          visibility: visible;
        }
        
        /* Ensure tooltips are visible above other content */
        .upgrades-grid {
          overflow: visible;
          position: relative;
          z-index: 1;
        }
        
        .assistants-container {
          overflow: visible;
          position: relative;
          z-index: 1;
        }
        
        .upgrade-item {
          position: relative;
          z-index: 1;  /* Lower z-index to prevent stacking context conflicts */
        }
        
        .upgrade-error {
          color: var(--color-danger);
          text-align: center;
          padding: 16px;
          font-style: italic;
        }
        
        /* Inventory Styles */
        .inventory-item {
          position: relative;
          width: 40px;
          height: 40px;
          border: 2px solid var(--color-borders);
          border-radius: var(--border-radius);
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .inventory-item.found {
          border-color: var(--color-primary-accent);
          background: linear-gradient(135deg, #38BDF8 0%, #0EA5E9 100%);
          color: white;
        }
        
        .inventory-item.unlocked {
          border-color: var(--color-secondary-accent);
          background: linear-gradient(135deg, #FACC15 0%, #EAB308 100%);
          color: var(--color-primary-text);
        }
        
        .inventory-item.not-found {
          border-color: var(--color-borders);
          background: #f8f9fa;
          color: #6c757d;
          opacity: 0.6;
        }
        
        .inventory-item:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        .inventory-icon {
          width: 32px;
          height: 32px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          border-radius: 4px;
        }
        
        /* Consolidated inventory-tooltip rule above */
        
        .inventory-tooltip::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          border: 6px solid transparent;
          border-top-color: var(--color-primary-text);
        }
        
        .inventory-item:hover .inventory-tooltip {
          opacity: 1;
          visibility: visible;
        }
        
        .inventory-error,
        .inventory-placeholder {
          color: var(--color-secondary-text);
          text-align: center;
          padding: 8px;
          font-style: italic;
          font-size: var(--font-size-S);
        }
      }
      * { box-sizing: border-box; }
      body {
        font-family: var(--font-family);
        background: linear-gradient(180deg, var(--color-background) 0%, #E0F2FE 100%);
        margin: 0;
        color: var(--color-primary-text);
      }
      .primary-button {
        background: var(--color-primary-accent);
        color: white;
        border: none;
        border-radius: var(--border-radius);
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-M);
        font-weight: 600;
        cursor: pointer;
        box-shadow: var(--box-shadow);
        transition: all 0.2s ease;
      }
      .primary-button:hover {
        background: var(--color-hover-accent);
        transform: scale(1.02);
      }
      .secondary-button {
        background: var(--color-secondary-accent);
        color: var(--color-primary-text);
        border: none;
        border-radius: var(--border-radius);
        padding: var(--spacing-sm) var(--spacing-md);
        font-size: var(--font-size-M);
        font-weight: 600;
        cursor: pointer;
        box-shadow: var(--box-shadow);
        transition: all 0.2s ease;
      }
      .secondary-button:hover {
        background: #EAB308;
        transform: scale(1.02);
      }
      .game-ready-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
      }
      .game-ready-banner {
        background: var(--color-primary-accent);
        color: white;
        padding: var(--spacing-sm) var(--spacing-md);
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-height: 50px;
        box-shadow: var(--box-shadow);
        z-index: 100;  /* Layer 2: Overlays & Modals */
      }
      .game-ready-content {
        display: grid;
        grid-template-columns: 40% 30% 30%;
        flex: 1;
        overflow: hidden;
        height: 100%;
      }
      .game-ready-left-column {
        background: white;
        border-right: 1px solid var(--color-borders);
        overflow-y: auto;
        padding: 0;
        position: relative;
      }
      .game-ready-middle-column {
        background: white;
        border-right: 1px solid var(--color-borders);
        overflow: hidden;
        position: relative;
      }
      .game-ready-right-column {
        background: white;
        overflow-y: auto;
        padding: var(--spacing-md);
      }
      .tab-system {
        display: flex;
        border-bottom: 1px solid var(--color-borders);
        background: white;
        position: sticky;
        top: 0;
        z-index: 50;  /* Layer 1: Base content - interactive elements */
        padding: var(--spacing-md) var(--spacing-md) 0 var(--spacing-md);
      }
      .tab-button {
        background: none;
        border: none;
        padding: var(--spacing-sm) var(--spacing-md);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        transition: all 0.2s ease;
        font-size: var(--font-size-M);
        color: var(--color-secondary-text);
      }
      .tab-button.active {
        color: var(--color-primary-accent);
        border-bottom-color: var(--color-primary-accent);
      }
      .tab-button:hover {
        color: var(--color-primary-accent);
      }
      .tab-content {
        display: none;
        padding: var(--spacing-md);
      }
      .tab-content.active {
        display: block;
      }
      @media (max-width: 768px) {
        .game-ready-content {
          grid-template-columns: 1fr;
          grid-template-rows: auto auto auto;
        }
        .game-ready-left-column,
        .game-ready-middle-column,
        .game-ready-right-column {
          border-right: none;
          border-bottom: 1px solid var(--color-borders);
        }
      }
      /* Dashboard Styling - Car Dashboard Theme */
      .dashboard-container {
        padding: var(--spacing-md);
      }
      .dashboard-header {
        text-align: center;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 2px solid var(--color-primary-accent);
      }
      .dashboard-header h2 {
        margin: 0;
        color: var(--color-primary-accent);
        font-size: 1.5rem;
        font-weight: 700;
      }
      .dashboard-subtitle {
        color: var(--color-secondary-text);
        font-size: var(--font-size-S);
        margin-top: var(--spacing-xs);
      }
      .dashboard-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
      }
      .dashboard-block {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border: 2px solid var(--color-borders);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        overflow: hidden;
        transition: all 0.2s ease;
      }
      .dashboard-block:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: translateY(-1px);
      }
      .block-header {
        background: linear-gradient(90deg, var(--color-primary-accent) 0%, var(--color-hover-accent) 100%);
        color: white;
        padding: var(--spacing-sm) var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
      }
      .block-icon {
        font-size: 1.2rem;
      }
      .block-title {
        font-size: var(--font-size-M);
      }
      .block-content {
        padding: var(--spacing-md);
      }
      .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-xs) 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .stat-row:last-child {
        border-bottom: none;
      }
      .stat-label {
        color: var(--color-secondary-text);
        font-weight: 500;
      }
      .stat-value {
        color: var(--color-primary-text);
        font-weight: 700;
        font-family: 'Courier New', monospace;
        font-size: 1.1rem;
      }
      .source-block, .efficiency-block, .travel-system-full-width {
        grid-column: 1 / -1;
      }
      .source-table, .efficiency-table {
        width: 100%;
      }
      .table-header {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: var(--spacing-sm);
        padding: var(--spacing-sm) 0;
        border-bottom: 2px solid var(--color-primary-accent);
        font-weight: 600;
        color: var(--color-primary-accent);
        font-size: var(--font-size-S);
      }
      .table-body {
        max-height: 200px;
        overflow-y: auto;
      }
      .table-row {
        display: grid;
        grid-template-columns: 2fr 1fr 1fr 1fr;
        gap: var(--spacing-sm);
        padding: var(--spacing-xs) 0;
        border-bottom: 1px solid #f1f5f9;
        font-size: var(--font-size-S);
      }
      .table-row:hover {
        background: #f8fafc;
      }
      .placeholder-row {
        text-align: center;
        padding: var(--spacing-lg);
        color: var(--color-secondary-text);
        font-style: italic;
      }
      .col-assistant {
        font-weight: 500;
      }
      .col-quantity, .col-sps, .col-efficiency, .col-payback, .col-percentage {
        text-align: right;
        font-family: 'Courier New', monospace;
        font-weight: 600;
      }
      
      /* Buff Status Styles */
      .buff-status-grid {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-sm);
      }
      .buff-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--spacing-xs) 0;
        border-bottom: 1px solid var(--color-borders);
      }
      .buff-row:last-child {
        border-bottom: none;
      }
      .buff-label {
        font-weight: 600;
        color: var(--color-primary-text);
        min-width: 100px;
      }
      .buff-value {
        flex: 1;
        text-align: center;
        font-weight: 500;
        color: var(--color-secondary-text);
      }
      .buff-timer {
        min-width: 50px;
        text-align: right;
        font-weight: 700;
        color: var(--color-primary-accent);
        font-size: var(--font-size-S);
      }
      .buff-status-block .block-content {
        padding: var(--spacing-md);
      }
      

      
      .location-buff-info {
        background: linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%);
        border: 2px solid var(--color-borders);
        border-radius: var(--border-radius);
        padding: var(--spacing-md);
        margin-top: var(--spacing-sm);
      }
      
      .location-buff-info h3 {
        margin: 0 0 var(--spacing-sm) 0;
        color: var(--color-primary-accent);
        font-size: var(--font-size-M);
      }
      
      .location-buff-info p {
        margin: var(--spacing-xs) 0;
        font-size: var(--font-size-S);
      }
      
      .location-buff-info strong {
        color: var(--color-primary-text);
      }
      /* Inventory Styling */
      .inventory-container {
        padding: var(--spacing-md);
      }
      .inventory-header {
        text-align: center;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 2px solid var(--color-primary-accent);
      }
      .inventory-header h2 {
        margin: 0;
        color: var(--color-primary-accent);
        font-size: 1.5rem;
        font-weight: 700;
      }
      .inventory-subtitle {
        color: var(--color-secondary-text);
        font-size: var(--font-size-S);
        margin-top: var(--spacing-xs);
      }
      .inventory-sections {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
      }
      .inventory-section {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border: 2px solid var(--color-borders);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        overflow: hidden;
        transition: all 0.2s ease;
      }
      .inventory-section:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: translateY(-1px);
      }
      .section-header {
        background: linear-gradient(90deg, var(--color-primary-accent) 0%, var(--color-hover-accent) 100%);
        color: white;
        padding: var(--spacing-sm) var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
      }
      .section-icon {
        font-size: 1.2rem;
      }
      .section-title {
        font-size: var(--font-size-M);
        z-index: 50;  /* Layer 1: Base content - interactive elements */
      }
      .section-tracker {
        margin-left: auto;
        font-size: var(--font-size-S);
        font-weight: 700;
        color: var(--color-primary-accent);
      }
      .section-content {
        padding: var(--spacing-md);
      }
      .logo-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
        gap: var(--spacing-sm);
      }
      .logo-grid.small-logos {
        display: flex;
        flex-wrap: wrap;
        gap: var(--spacing-sm);
        justify-content: flex-start;
      }
      .upgrades-container {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-md);
      }
      .upgrade-category {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border: 2px solid var(--color-borders);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        overflow: hidden;
        transition: all 0.2s ease;
        margin-bottom: var(--spacing-md);
      }
      .upgrade-category:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: translateY(-1px);
      }
      .category-header {
        background: linear-gradient(90deg, var(--color-primary-accent) 0%, var(--color-hover-accent) 100%);
        color: white;
        padding: var(--spacing-sm) var(--spacing-md);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        font-weight: 600;
      }
      .category-icon {
        font-size: 1.2rem;
      }
      .category-title {
        font-size: var(--font-size-M);
        font-weight: 600;
        color: white;
      }
      .category-tracker {
        margin-left: auto;
        font-size: var(--font-size-S);
        font-weight: 700;
        color: var(--color-primary-accent);
      }
      .inventory-item {
        width: 50px;
        height: 50px;
        border: 2px solid var(--color-borders);
        border-radius: var(--border-radius);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        background: #f8fafc;
      }
      .inventory-item.found {
        border-color: var(--color-primary-accent);
        background: linear-gradient(145deg, #ffffff 0%, #e0f2fe 100%);
        box-shadow: 0 2px 4px rgba(56, 189, 248, 0.3);
      }
      .inventory-item.not-found {
        opacity: 0.3;
        filter: grayscale(100%);
      }
      .inventory-item:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      .inventory-item.small {
        width: 30px;
        height: 30px;
        font-size: 1rem;
        flex-shrink: 0;
      }
      /* Consolidated inventory-tooltip rule above */
      .inventory-item:hover .inventory-tooltip {
        opacity: 1;
      }
      .inventory-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: var(--color-primary-text);
      }
      /* Achievements Styling */
      .achievements-container, .lore-container {
        padding: var(--spacing-md);
      }
      .achievements-header, .lore-header {
        text-align: center;
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 2px solid var(--color-primary-accent);
      }
      .achievements-header h2, .lore-header h2 {
        margin: 0;
        color: var(--color-primary-accent);
        font-size: 1.5rem;
        font-weight: 700;
      }
      .lore-subtitle {
        color: var(--color-secondary-text);
        font-size: var(--font-size-S);
        margin-top: var(--spacing-xs);
      }
      .achievements-sections, .lore-sections {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--spacing-md);
        overflow: visible !important;  /* Allow tooltips to escape container */
      }
      .achievement-category, .lore-category {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border: 2px solid var(--color-borders);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        overflow: hidden;
        transition: all 0.2s ease;
      }
      .achievement-category:hover, .lore-category:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        transform: translateY(-1px);
      }
      .category-content {
        padding: var(--spacing-md);
      }
      .achievement-grid, .lore-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
        gap: var(--spacing-sm);
      }
      .achievement-item, .lore-item {
        width: 40px;
        height: 40px;
        border: 2px solid var(--color-borders);
        border-radius: var(--border-radius);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        cursor: pointer;
        transition: all 0.2s ease;
        position: relative;
        background: #f8fafc;
      }
      .achievement-item.unlocked, .lore-item.unlocked {
        border-color: var(--color-secondary-accent);
        background: linear-gradient(145deg, #ffffff 0%, #fef3c7 100%);
        box-shadow: 0 2px 4px rgba(250, 204, 21, 0.3);
      }
      .achievement-item.locked, .lore-item.locked {
        opacity: 0.3;
        filter: grayscale(100%);
      }
      .achievement-item:hover, .lore-item:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      .achievement-tooltip, .lore-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background: var(--color-primary-text);
        color: white;
        padding: var(--spacing-xs) var(--spacing-sm);
        border-radius: var(--border-radius);
        font-size: var(--font-size-S);
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 999999 !important;  /* Force tooltips above everything */
        max-width: 200px;
        text-align: center;
      }
      .achievement-item:hover .achievement-tooltip,
      .lore-item:hover .lore-tooltip {
        opacity: 1;
      }
      .achievement-tooltip::after, .lore-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: var(--color-primary-text);
      }
       /* Middle Column Styling */
       .middle-column-container {
         position: relative;
         width: 100%;
         height: 100%;
         overflow: hidden;
         background: url('./ui/images/background.png') center center;
         background-size: cover;
         background-repeat: no-repeat;
       }
       .mini-wallet {
         position: absolute;
         top: var(--spacing-md);
         left: 50%;
         transform: translateX(-50%);
         text-align: center;
         z-index: 10;
         background: rgba(255, 255, 255, 0.9);
         padding: var(--spacing-sm) var(--spacing-md);
         border-radius: var(--border-radius);
         box-shadow: var(--box-shadow);
         backdrop-filter: blur(5px);
       }
       .mini-wallet-snowballs {
         font-size: 2rem;
         font-weight: 700;
         color: var(--color-primary-accent);
         margin: 0;
         line-height: 1;
       }
       .mini-wallet-sps {
         font-size: 1.25rem;
         font-weight: 600;
         color: var(--color-secondary-text);
         margin: 0;
         line-height: 1;
       }
       .mini-wallet-click-power {
         font-size: 1rem;
         font-weight: 600;
         color: var(--color-secondary-accent);
         margin: 0;
         line-height: 1;
         margin-top: var(--spacing-xs);
       }
       .snowman-click-target {
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         width: 37.5%;
         height: 37.5%;
         min-width: 180px;
         min-height: 180px;
         max-width: 300px;
         max-height: 300px;
         cursor: pointer;
         transition: all 0.2s ease;
         z-index: 10;
         background: url('./ui/images/snowman.png') center center;
         background-size: contain;
         background-repeat: no-repeat;
         border-radius: 50%;
       }
       .snowman-click-target:hover {
         transform: translate(-50%, -50%) scale(1.05);
         filter: brightness(1.1);
       }
       .snowman-click-target:active {
         transform: translate(-50%, -50%) scale(0.95);
       }
       .click-feedback {
         position: absolute;
         pointer-events: none;
         z-index: 100;
         font-weight: 700;
         font-size: 1.2rem;
         color: #007bff;
         text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
         animation: clickFloat 1s ease-out forwards;
         user-select: none;
         white-space: nowrap;
       }
       @keyframes clickFloat {
         0% {
           opacity: 1;
           transform: translateY(0) scale(1);
         }
         50% {
           opacity: 1;
           transform: translateY(-25px) scale(1.1);
         }
         100% {
           opacity: 0;
           transform: translateY(-60px) scale(1.3);
         }
       }
       .spawn-area {
         position: absolute;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
         pointer-events: none;
         z-index: 5;
         isolation: isolate;
       }
       .spawn-item {
         position: absolute;
         pointer-events: auto;
         cursor: pointer;
         transition: all 0.3s ease;
         z-index: 20;
       }
       .spawn-item:hover {
         transform: scale(1.1);
       }
       .crystal-snowball {
         width: 60px;
         height: 60px;
         border-radius: 50%;
         background: radial-gradient(circle, #38BDF8 0%, #0EA5E9 70%, #0284C7 100%);
         box-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
         animation: crystalPulse 2s ease-in-out infinite;
       }
       .crystal-snowball.warning {
         animation: crystalWarning 0.5s ease-in-out infinite;
       }
       @keyframes crystalPulse {
         0%, 100% { box-shadow: 0 0 20px rgba(56, 189, 248, 0.6); }
         50% { box-shadow: 0 0 30px rgba(56, 189, 248, 0.8); }
       }
       @keyframes crystalWarning {
         0%, 100% { 
           box-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
           background: radial-gradient(circle, #F87171 0%, #EF4444 70%, #DC2626 100%);
         }
         50% { 
           box-shadow: 0 0 40px rgba(239, 68, 68, 1);
           background: radial-gradient(circle, #FCA5A5 0%, #F87171 70%, #EF4444 100%);
         }
       }
       .yeti-spawn {
         width: 80px;
         height: 80px;
         border-radius: 50%;
         background: radial-gradient(circle, #8B5CF6 0%, #7C3AED 70%, #6D28D9 100%);
         border: 3px solid #DDD6FE;
         box-shadow: 0 0 25px rgba(139, 92, 246, 0.6);
         font-size: 2rem;
         display: flex;
         align-items: center;
         justify-content: center;
         color: white;
         text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
       }

       /* 
        * SNOWFALL AND SNOWBALL ANIMATION SYSTEM
        * 
        * This system provides two main visual effects:
        * 1. Gentle falling snowflakes (background atmosphere)
        * 2. Click-triggered snowball animations (player interaction feedback)
        * 
        * Both systems are designed for performance and easy customization.
        * See the JavaScript methods below for detailed configuration options.
        */
       
       /* Snowfall Animation Keyframes */
       @keyframes snowfall {
         0% {
           opacity: 0;
           transform: translateY(-100px) translateX(0);
         }
         10% {
           opacity: 1;
         }
         90% {
           opacity: 1;
         }
         100% {
           opacity: 0;
           transform: translateY(100vh) translateX(20px);
         }
       }

       @keyframes snowfall2 {
         0% {
           opacity: 0;
           transform: translateY(-100px) translateX(0);
         }
         15% {
           opacity: 1;
         }
         85% {
           opacity: 1;
         }
         100% {
           opacity: 0;
           transform: translateY(100vh) translateX(-15px);
         }
       }

       @keyframes snowfall3 {
         0% {
           opacity: 0;
           transform: translateY(-100px) translateX(0);
         }
         20% {
           opacity: 1;
         }
         80% {
           opacity: 1;
         }
         100% {
           opacity: 0;
           transform: translateY(100vh) translateX(10px);
         }
       }

       /* Snowfall CSS Classes */
       .snowfall-container {
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
         pointer-events: none;
         z-index: 1;
         overflow: hidden;
       }

       .snowflake {
         position: absolute;
         width: 6px;
         height: 6px;
         background: white;
         border-radius: 50%;
         opacity: 0.8;
         pointer-events: none;
         will-change: transform;
         box-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
       }

       .snowflake.snowfall1 {
         animation: snowfall 8s linear infinite;
       }

       .snowflake.snowfall2 {
         animation: snowfall2 10s linear infinite;
       }

       .snowflake.snowfall3 {
         animation: snowfall3 12s linear infinite;
       }

       /* Snowball Click Animation */
       .click-snowball {
         position: fixed;
         width: 30px;
         height: 30px;
         background: #F8FAFC; /* Off-white color */
         border: 3px solid #E2E8F0;
         border-radius: 50%;
         pointer-events: none;
         z-index: 1000;
         will-change: transform;
         box-shadow: 0 0 15px rgba(248, 250, 252, 0.8);
       }

       @keyframes snowballArc {
         0% {
           opacity: 1;
           transform: translateY(100vh) translateX(0) scale(1);
         }
         50% {
           opacity: 1;
           transform: translateY(50vh) translateX(20px) scale(1.1);
         }
         100% {
           opacity: 0;
           transform: translateY(0) translateX(40px) scale(0.8);
         }
       }

       /* TEST: Simple fallback animation */
       @keyframes simpleMove {
         0% {
           transform: translateY(0);
         }
         100% {
           transform: translateY(-200px);
         }
       }
       .battle-spawn {
         width: 100px;
         height: 100px;
         border-radius: 50%;
         background: radial-gradient(circle, #EF4444 0%, #DC2626 70%, #B91C1C 100%);
         border: 3px solid #FECACA;
         box-shadow: 0 0 30px rgba(239, 68, 68, 0.6);
         font-size: 2.5rem;
         display: flex;
         align-items: center;
         justify-content: center;
         color: white;
         text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
       }
       /* Right Column Styling */
             .right-column-container {
        padding: var(--spacing-md);
        height: 100%;
        overflow-y: auto;
        overflow-x: visible;  /* Allow horizontal overflow for tooltips */
        z-index: 1;  /* Layer 1: Base content - containers */
      }
             .upgrades-section {
        margin-bottom: var(--spacing-xl);
        z-index: 1;  /* Layer 1: Base content - containers */
        overflow: visible !important;  /* Allow tooltips to escape container */
      }
       .section-title {
         font-size: 1.5rem;
         font-weight: 700;
         color: var(--color-primary-accent);
         margin-bottom: var(--spacing-md);
         text-align: center;
         border-bottom: 2px solid var(--color-primary-accent);
         padding-bottom: var(--spacing-sm);
         z-index: 30;  /* Layer 1: Base content - interactive elements */
       }
       .upgrades-grid {
         display: grid;
         grid-template-columns: repeat(5, 1fr);
         gap: var(--spacing-sm);
         margin-bottom: var(--spacing-md);
         z-index: 10;  /* Layer 1: Base content - grid layouts */
         min-height: 138px;  /* 15% larger for better tooltip space */
         overflow: visible;  /* Allow tooltips to escape grid */
       }
       .upgrade-item {
         width: 50px;
         height: 50px;
         border: 2px solid var(--color-borders);
         border-radius: var(--border-radius);
         cursor: pointer;
         transition: all 0.2s ease;
         position: relative;
         background: url('./ui/images/babyYeti.png') center center;
         background-size: contain;
         background-repeat: no-repeat;
         background-color: #f8fafc;
       }
       .upgrade-item.affordable {
         border-color: var(--color-primary-accent);
         background-color: #e0f2fe;
         box-shadow: 0 2px 4px rgba(56, 189, 248, 0.3);
       }
       .upgrade-item.affordable:hover {
         transform: scale(1.1);
         box-shadow: 0 4px 8px rgba(56, 189, 248, 0.5);
       }
       .upgrade-item.unaffordable {
         opacity: 0.5;
         filter: grayscale(50%);
         cursor: not-allowed;
       }
       .upgrade-item.hidden {
         display: none;
       }

             .assistants-section {
        margin-top: var(--spacing-xl);
        z-index: 1;  /* Layer 1: Base content - containers */
        overflow: visible !important;  /* Allow tooltips to escape container */
      }
       .assistant-box {
         border: 2px solid #A25772;
         border-radius: var(--border-radius);
         padding: var(--spacing-md);
         margin-bottom: var(--spacing-md);
         background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
         transition: background 0.2s ease, border-color 0.2s ease, transform 0.1s ease;
         position: relative;
         display: flex;
         align-items: center;
         gap: var(--spacing-md);
         min-height: 90px;
         /* 15% smaller than the previous 0.9 scale */
         transform: scale(0.765);
         transform-origin: left center;
         margin-left: -10px;
         margin-right: -10px;
       }
       
       .assistant-box:hover {
         transform: scale(0.765) translateY(-2px);
         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
       }
       .assistant-box.purchased {
         border-color: var(--color-primary-accent);
         background: linear-gradient(145deg, #ffffff 0%, #e0f2fe 100%);
         box-shadow: 0 2px 4px rgba(56, 189, 248, 0.3);
         cursor: pointer;
       }
       .assistant-box.purchased:hover {
         background: linear-gradient(145deg, #ffffff 0%, #b3e5fc 100%);
         border-color: #0288d1;
         transform: scale(0.765) translateY(-2px);
         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
       }
       .assistant-box.visible {
         border-color: var(--color-secondary-accent);
         background: linear-gradient(145deg, #ffffff 0%, #fef3c7 100%);
         box-shadow: 0 2px 4px rgba(250, 204, 21, 0.3);
         cursor: pointer;
       }
       .assistant-box.visible:hover {
         background: linear-gradient(145deg, #ffffff 0%, #fde68a 100%);
         border-color: #f59e0b;
         transform: scale(0.765) translateY(-2px);
         box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
       }

       .assistant-logo {
         width: 60px;
         height: 60px;
         background: url('./ui/images/additionalArm.png') center center;
         background-size: contain;
         background-repeat: no-repeat;
         flex-shrink: 0;
       }
       .assistant-info {
         flex: 1;
         display: flex;
         flex-direction: column;
         gap: var(--spacing-xs);
       }
       .assistant-name {
         font-size: 1.4rem;
         font-weight: 700;
         color: var(--color-primary-text);
         margin: 0;
       }
       .assistant-description {
         font-size: 1rem;
         color: var(--color-secondary-text);
         margin: 0;
         font-style: italic;
       }
       .assistant-cost-display {
         font-size: 1rem;
         color: var(--color-secondary-text);
         margin: 0;
       }
       .assistant-owned {
         font-size: 1.4rem;
         font-weight: 700;
         color: var(--color-primary-accent);
         margin: 0;
         text-align: right;
         min-width: 40px;
       }
       .assistant-actions {
         display: flex;
         flex-direction: column;
       }
       
       /* Analog Summary Styles */
       .analog-summary-container {
         padding: var(--spacing-md);
       }
       
       .analog-summary-header {
         text-align: center;
         margin-bottom: var(--spacing-lg);
         padding-bottom: var(--spacing-md);
         border-bottom: 2px solid var(--color-primary-accent);
       }
       
       .analog-summary-header h2 {
         margin: 0;
         color: var(--color-primary-accent);
         font-size: 1.5rem;
         font-weight: 700;
       }
       
       .analog-summary-subtitle {
         color: var(--color-secondary-text);
         font-size: var(--font-size-S);
         margin-top: var(--spacing-xs);
       }
       
       .current-analog-status {
         margin-bottom: var(--spacing-lg);
       }
       
       .past-analogs-section {
         margin-top: var(--spacing-lg);
       }
       
       .section-header {
         text-align: center;
         margin-bottom: var(--spacing-md);
         padding-bottom: var(--spacing-sm);
         border-bottom: 1px solid var(--color-borders);
       }
       
       .section-header h3 {
         margin: 0;
         color: var(--color-primary-accent);
         font-size: 1.2rem;
         font-weight: 600;
       }
       
       .section-subtitle {
         color: var(--color-secondary-text);
         font-size: var(--font-size-S);
         margin-top: var(--spacing-xs);
         text-align: center;
       }
       
       .analogs-grid {
         display: grid;
         grid-template-columns: repeat(4, 1fr);
         gap: var(--spacing-sm);
         margin-bottom: var(--spacing-md);
       }
       
       .analog-card {
         background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
         border: 2px solid var(--color-borders);
         border-radius: var(--border-radius);
         box-shadow: var(--box-shadow);
         overflow: hidden;
         transition: all 0.2s ease;
         padding: var(--spacing-sm);
       }
       
       .analog-card:hover {
         box-shadow: 0 4px 8px rgba(0,0,0,0.15);
         transform: translateY(-1px);
         border-color: var(--color-primary-accent);
       }
       
       .analog-header {
         text-align: center;
         margin-bottom: var(--spacing-sm);
         padding-bottom: var(--spacing-xs);
         border-bottom: 1px solid var(--color-borders);
       }
       
       .analog-header h4 {
         margin: 0;
         color: var(--color-primary-accent);
         font-size: var(--font-size-M);
         font-weight: 600;
       }
       
       .analog-stats {
         display: flex;
         flex-direction: column;
         gap: var(--spacing-xs);
       }
       
       .analog-stats .stat-item {
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: var(--spacing-xs) 0;
         border-bottom: 1px solid #f1f5f9;
         font-size: var(--font-size-S);
       }
       
       .analog-stats .stat-item:last-child {
         border-bottom: none;
       }
       
       .analog-stats .stat-label {
         color: var(--color-secondary-text);
         font-weight: 500;
         font-size: 0.7rem;
       }
       
       .analog-stats .stat-value {
         color: var(--color-primary-text);
         font-weight: 600;
         font-family: 'Courier New', monospace;
         font-size: 0.7rem;
         text-align: right;
       }
       
       .no-analogs-message {
         text-align: center;
         padding: var(--spacing-xl);
       }
       
       .empty-state {
         display: flex;
         flex-direction: column;
         align-items: center;
         gap: var(--spacing-md);
       }
       
       .empty-icon {
         font-size: 3rem;
         color: var(--color-secondary-text);
         opacity: 0.5;
       }
       
       .empty-state h4 {
         margin: 0;
         color: var(--color-primary-text);
         font-size: var(--font-size-M);
         font-weight: 600;
       }
       
       .empty-state p {
         margin: 0;
         color: var(--color-secondary-text);
         font-size: var(--font-size-S);
         font-style: italic;
       }
         gap: var(--spacing-xs);
         align-items: center;
       }
       .buy-button {
         border: none;
         border-radius: var(--border-radius);
         padding: var(--spacing-xl) var(--spacing-xl);
         font-size: 3.5rem !important;
         font-weight: 700;
         cursor: pointer;
         min-width: 350px !important;
         min-height: 120px !important;
         position: relative;
         z-index: 10;
         transform: scale(3.0) !important;
         transform-origin: center;
       }
       .buy-button.affordable {
         background: #4CAF50;
         color: white;
       }
       .buy-button.affordable:hover {
         background: #45a049;
       }
       .buy-button.affordable:active {
         background: #3d8b40;
         transform: translateY(1px);
       }
       .buy-button.unaffordable {
         background: #ccc;
         color: #666;
         cursor: not-allowed;
       }
       .level-up-button {
         border: none;
         border-radius: var(--border-radius);
         padding: var(--spacing-xs) var(--spacing-sm);
         font-size: 0.75rem;
         font-weight: 500;
         background: var(--color-secondary-accent);
         color: var(--color-primary-text);
         cursor: pointer;
         min-width: 50px;
         position: absolute;
         bottom: var(--spacing-xs);
         right: var(--spacing-xs);
         z-index: 10;
       }
       .level-up-button:hover {
         background: #EAB308;
       }
       .level-up-button:active {
         background: #D97706;
         transform: translateY(1px);
       }
       .level-up-button.unaffordable {
         background: #ccc;
         color: #666;
         cursor: not-allowed;
       }
       .level-up-button.unaffordable:hover {
         background: #ccc;
       }
       .assistant-tooltip {
         position: absolute;
         background: var(--color-primary-text);
         color: white;
         padding: var(--spacing-sm);
         border-radius: var(--border-radius);
         font-size: 0.75rem;  /* Smaller font for better fit */
         white-space: normal;
         opacity: 0;
         pointer-events: none;
         z-index: 100;  /* Simple z-index */
         width: 270px;  /* Fixed width for 2:1 aspect ratio */
         height: 135px;  /* Fixed height for 2:1 aspect ratio */
         text-align: left;
         line-height: 1.3;
         visibility: hidden;
         transition: opacity 0.2s ease, visibility 0.2s ease;
         word-wrap: break-word;
         overflow-wrap: break-word;
         box-shadow: 0 4px 12px rgba(0,0,0,0.3);
         overflow-y: auto;  /* Scroll if content is too long */
       }
       
       /* Smart positioning for assistant tooltips */
       /* First assistant - tooltip flows right */
       .assistant-box:first-child .assistant-tooltip {
         top: -25%;
         left: 20%;
         transform: translateY(-50%);
         margin-right: 8px;
       }
       
       /* Last assistant - tooltip flows left */
       .assistant-box:last-child .assistant-tooltip {
         top: -25%;
         left: 20%;
         transform: translateY(-50%);
         margin-right: 8px;
       }
       
       /* Middle assistants - default centered positioning */
       .assistant-box:not(:first-child):not(:last-child) .assistant-tooltip {
         top: -25%;
         left: 20%;
         transform: translateY(-50%);
         margin-right: 8px;
       }
       
       /* Simple positioning - tooltips appear over the assistant boxes */
       .assistant-box:hover .assistant-tooltip {
         opacity: 1;
         visibility: visible;
       }
       .assistant-tooltip::after {
         content: '';
         position: absolute;
         top: 100%;
         left: 50%;
         transform: translateX(-50%);
         border: 4px solid transparent;
         border-top-color: var(--color-primary-text);
       }
       .tooltip-title {
         font-weight: 700;
         font-size: 1.1rem;
         margin-bottom: var(--spacing-xs);
         color: var(--color-secondary-accent);
       }
       .tooltip-section {
         margin-bottom: var(--spacing-xs);
       }
       .tooltip-label {
         font-weight: 600;
         color: var(--color-secondary-accent);
       }
       
       /* Snowflake Tree Tooltips */
       .snowflake-tooltip {
         position: absolute;
         background: var(--color-primary-text);
         color: white;
         padding: var(--spacing-sm);
         border-radius: var(--border-radius);
         font-size: 0.75rem;
         white-space: normal;
         opacity: 0;
         pointer-events: none;
         z-index: 1000;
         width: 250px;
         max-height: 120px;
         text-align: left;
         line-height: 1.3;
         visibility: hidden;
         transition: opacity 0.2s ease, visibility 0.2s ease;
         word-wrap: break-word;
         overflow-wrap: break-word;
         box-shadow: 0 4px 12px rgba(0,0,0,0.3);
         overflow-y: auto;
       }
       
       .upgrade-card:hover .snowflake-tooltip {
         opacity: 1;
         visibility: visible;
       }
       
       /* Smart positioning for snowflake tooltips */
       /* Special handling for first row (Concord upgrades - 4 cards) */
       /* First card in first row - tooltip flows right */
       .upgrade-card:nth-child(1) .snowflake-tooltip {
         bottom: 40%;
         left: 0;
         transform: none;
         margin-bottom: 8px;
       }
       
       /* Last card in first row (4th card) - tooltip flows left */
       .upgrade-card:nth-child(4) .snowflake-tooltip {
         bottom: 40%;
         right: 0;
         left: auto;
         transform: none;
         margin-bottom: 8px;
       }
       
       /* Middle cards in first row (2nd and 3rd) - centered above */
       .upgrade-card:nth-child(2) .snowflake-tooltip,
       .upgrade-card:nth-child(3) .snowflake-tooltip {
         bottom: 30%;
         left: 50%;
         transform: translateX(-50%);
         margin-bottom: 8px;
       }
       
       /* Regular rows (5 cards per row) */
       /* First card in each regular row - tooltip flows right */
       .upgrade-card:nth-child(5n+1):not(:nth-child(1)) .snowflake-tooltip {
         bottom: 30%;
         left: 0;
         transform: none;
         margin-bottom: 8px;
       }
       
       /* Last card in each regular row - tooltip flows left */
       .upgrade-card:nth-child(5n):not(:nth-child(4)) .snowflake-tooltip {
         bottom: 30%;
         right: 0;
         left: auto;
         transform: none;
         margin-bottom: 8px;
       }
       
       /* Middle cards in regular rows - centered above */
       .upgrade-card:not(:nth-child(1)):not(:nth-child(2)):not(:nth-child(3)):not(:nth-child(4)):not(:nth-child(5n+1)):not(:nth-child(5n)) .snowflake-tooltip {
         bottom: 100%;
         left: 50%;
         transform: translateX(-50%);
         margin-bottom: 8px;
       }
       
       /* Arrow positioning for different tooltip positions */
       /* First row arrows (Concord upgrades - 4 cards) */
       .upgrade-card:nth-child(1) .snowflake-tooltip::after {
         content: '';
         position: absolute;
         bottom: -8px;
         left: 20px;
         transform: none;
         border: 4px solid transparent;
         border-top-color: var(--color-primary-text);
       }
       
       .upgrade-card:nth-child(4) .snowflake-tooltip::after {
         content: '';
         position: absolute;
         bottom: -8px;
         right: 20px;
         left: auto;
         transform: none;
         border: 4px solid transparent;
         border-top-color: var(--color-primary-text);
       }
       
       .upgrade-card:nth-child(2) .snowflake-tooltip::after,
       .upgrade-card:nth-child(3) .snowflake-tooltip::after {
         content: '';
         position: absolute;
         bottom: -8px;
         left: 50%;
         transform: translateX(-50%);
         border: 4px solid transparent;
         border-top-color: var(--color-primary-text);
       }
       
       /* Regular row arrows (5 cards per row) */
       .upgrade-card:nth-child(5n+1):not(:nth-child(1)) .snowflake-tooltip::after {
         content: '';
         position: absolute;
         bottom: -8px;
         left: 20px;
         transform: none;
         border: 4px solid transparent;
         border-top-color: var(--color-primary-text);
       }
       
       .upgrade-card:nth-child(5n):not(:nth-child(4)) .snowflake-tooltip::after {
         content: '';
         position: absolute;
         bottom: -8px;
         right: 20px;
         left: auto;
         transform: none;
         border: 4px solid transparent;
         border-top-color: var(--color-primary-text);
       }
       
       .upgrade-card:not(:nth-child(1)):not(:nth-child(2)):not(:nth-child(3)):not(:nth-child(4)):not(:nth-child(5n+1)):not(:nth-child(5n)) .snowflake-tooltip::after {
         content: '';
         position: absolute;
         bottom: -8px;
         left: 50%;
         transform: translateX(-50%);
         border: 4px solid transparent;
         border-top-color: var(--color-primary-text);
       }
       
       /* Snowflake Tree Page Styling */
       .fixed-summary-container {
         position: sticky;
         top: 0;
         background: #0f172a !important;
         z-index: 100;
         padding: var(--spacing-md);
         margin-bottom: var(--spacing-md);
         box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
       }
       
       .conversion-summary {
         background: #1e293b !important;
         border-radius: var(--border-radius);
         padding: var(--spacing-md);
         border: 1px solid var(--color-primary-accent);
       }
       
       .conversion-summary h3 {
         color: var(--color-primary-text);
         margin: 0 0 var(--spacing-sm) 0;
         font-size: 1.2rem;
       }
       
       .conversion-summary p {
         color: var(--color-secondary-text);
         margin: var(--spacing-xs) 0;
       }
       
       .conversion-details p {
         color: var(--color-primary-text);
         font-weight: 500;
       }
       
       /* Category header styling */
       .category-header {
         background: linear-gradient(90deg, var(--color-primary-accent) 0%, var(--color-hover-accent) 100%);
         border-radius: var(--border-radius);
         padding: var(--spacing-md);
         margin: var(--spacing-lg) 0 var(--spacing-md) 0;
         border-left: 4px solid;
         display: flex;
         justify-content: space-between;
         align-items: center;
         color: white !important;
       }
       
       .category-name {
         color: var(--color-primary-text);
         font-size: 1.3rem;
         font-weight: 700;
         display: block;
         margin-bottom: var(--spacing-xs);
       }
       
       .category-description {
         color: var(--color-secondary-text);
         font-size: 0.9rem;
         display: block;
       }
       
       .progress-text {
         color: var(--color-primary-text);
         font-size: 0.9rem;
         font-weight: 600;
         margin-bottom: var(--spacing-xs);
         display: block;
       }
       
       /* Summary layout styling */
       .summary-row {
         display: flex;
         justify-content: space-between;
         gap: var(--spacing-lg);
         margin-bottom: var(--spacing-sm);
       }
       
       .summary-item {
         flex: 1;
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: var(--spacing-sm);
         background: rgba(255, 255, 255, 0.05);
         border-radius: var(--border-radius);
         border: 1px solid rgba(255, 255, 255, 0.1);
       }
       
       .summary-label {
         color: var(--color-secondary-text);
         font-size: 0.9rem;
         font-weight: 500;
       }
       
       .summary-value {
         color: var(--color-primary-text);
         font-size: 1rem;
         font-weight: 700;
       }
       
       /* General tooltip improvements */
       .tooltip {
         position: relative;
         display: inline-block;
       }
       
       .tooltip .tooltiptext {
         visibility: hidden;
         width: 200px;
         height: 200px;
         background-color: var(--color-primary-text);
         color: white;
         text-align: center;
         border-radius: var(--border-radius);
         padding: var(--spacing-sm);
         position: absolute;
         z-index: 10001;
         bottom: 125%;
         left: 50%;
         margin-left: -150px;
         opacity: 0;
         transition: opacity 0.3s ease, visibility 0.3s ease;
         border: 1px solid rgba(255, 255, 255, 0.2);
         backdrop-filter: blur(10px);
         font-size: 0.9rem;
         line-height: 1.4;
         word-wrap: break-word;
         overflow-wrap: break-word;
         box-shadow: 0 4px 12px rgba(0,0,0,0.3);
       }
       
       .tooltip .tooltiptext::after {
         content: "";
         position: absolute;
         top: 100%;
         left: 50%;
         margin-left: -5px;
         border-width: 5px;
         border-style: solid;
         border-color: var(--color-primary-text) transparent transparent transparent;
       }
       
       .tooltip:hover .tooltiptext {
         visibility: visible;
         opacity: 1;
       }
       
       /* Specific styling for jump tooltip to ensure visibility */
       #jump-tooltip {
         color: white !important;
         background-color: var(--color-primary-text) !important;
         text-align: left !important;
       }
       
       /* Override the general tooltip text alignment for jump tooltip */
       .tooltip .tooltiptext#jump-tooltip {
         text-align: left !important;
         background-color: var(--color-primary-text) !important;
       }
       
       /* Ensure all text in jump tooltip is white */
       .tooltip .tooltiptext#jump-tooltip strong,
       .tooltip .tooltiptext#jump-tooltip em {
         color: white !important;
       }
       
       /* Ensure ALL elements in jump tooltip inherit the background */
       .tooltip .tooltiptext#jump-tooltip * {
         background-color: var(--color-primary-text) !important;
       }
       
       /* Ensure the jump tooltip container has proper styling */
       .tooltip .tooltiptext#jump-tooltip {
         background-color: var(--color-primary-text) !important;
         border-radius: var(--border-radius) !important;
         border: 1px solid rgba(255, 255, 255, 0.2) !important;
         box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
       }
       


       /* Momentum Meter Styles */
       .momentum-block {
         border: 2px solid var(--color-primary-accent);
         background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
       }

       .momentum-progress-container {
         margin-bottom: 12px;
       }

       .momentum-progress-bar {
         width: 100%;
         height: 20px;
         background-color: #e2e8f0;
         border-radius: 10px;
         overflow: hidden;
         position: relative;
         border: 1px solid #cbd5e1;
         margin-bottom: 8px;
       }

       .momentum-progress-fill {
         height: 100%;
         background: linear-gradient(135deg, var(--color-primary-accent) 0%, var(--color-hover-accent) 100%);
         transition: width 0.3s ease;
         border-radius: 10px;
         position: relative;
       }

       .momentum-progress-fill::after {
         content: '';
         position: absolute;
         top: 0;
         left: 0;
         right: 0;
         bottom: 0;
         background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
         animation: momentum-shine 2s infinite;
       }

       @keyframes momentum-shine {
         0% { transform: translateX(-100%); }
         100% { transform: translateX(100%); }
       }

       .momentum-progress-text {
         text-align: center;
         font-weight: bold;
         font-size: 14px;
         color: var(--color-primary-text);
       }

       .momentum-info {
         margin-bottom: 12px;
       }

       .momentum-actions {
         text-align: center;
       }

       .travel-button {
         background: linear-gradient(135deg, #10B981 0%, #059669 100%);
         color: white;
         border: none;
         border-radius: 8px;
         padding: 12px 24px;
         font-size: 16px;
         font-weight: bold;
         cursor: pointer;
         transition: all 0.3s ease;
         box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
         animation: travel-pulse 2s infinite;
       }

       .travel-button:hover {
         background: linear-gradient(135deg, #059669 0%, #047857 100%);
         transform: translateY(-2px);
         box-shadow: 0 4px 8px rgba(16, 185, 129, 0.4);
       }

       .travel-button.disabled {
         background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
         cursor: not-allowed;
         animation: none;
         box-shadow: 0 2px 4px rgba(156, 163, 175, 0.3);
       }

       .travel-button.disabled:hover {
         background: linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%);
         transform: none;
         box-shadow: 0 2px 4px rgba(156, 163, 175, 0.3);
       }

       @keyframes travel-pulse {
         0% { box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3); }
         50% { box-shadow: 0 4px 8px rgba(16, 185, 129, 0.5); }
         100% { box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3); }
       }

       /* Click Streak Meter Styles */
       .streak-block {
         border: 2px solid var(--color-borders);
         background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
         transition: all 0.3s ease;
       }

       .streak-block.active {
         border: 2px solid #4CAF50;
         background: linear-gradient(135deg, #f0fff0 0%, #dcfce7 100%);
         box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
       }

       .streak-block.bonus-active {
         border: 2px solid #FF9800;
         background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
         box-shadow: 0 4px 12px rgba(255, 152, 0, 0.3);
       }

       .streak-metrics {
         margin-bottom: 12px;
       }

       .streak-row {
         display: flex;
         align-items: center;
         justify-content: space-between;
         margin-bottom: 6px;
         font-size: 14px;
         line-height: 1.4;
       }

       .streak-label {
         color: var(--color-secondary-text);
         font-weight: 500;
         min-width: 60px;
       }

       .streak-value {
         color: var(--color-primary-text);
         font-weight: bold;
         text-align: right;
         flex: 1;
       }

       .streak-unit {
         color: var(--color-secondary-text);
         font-size: 12px;
         margin-left: 4px;
       }

       .streak-time {
         color: var(--color-secondary-text);
         font-size: 12px;
         margin-left: 4px;
       }

       .streak-progress-container {
         margin-top: 8px;
       }

       .streak-progress-bar {
         width: 100%;
         height: 16px;
         background-color: #e2e8f0;
         border-radius: 8px;
         overflow: hidden;
         position: relative;
         border: 1px solid #cbd5e1;
       }

       .streak-progress-fill {
         height: 100%;
         background: linear-gradient(135deg, #9E9E9E 0%, #757575 100%);
         transition: width 0.3s ease, background 0.3s ease;
         border-radius: 8px;
         position: relative;
       }

       .streak-progress-fill::after {
         content: '';
         position: absolute;
         top: 0;
         left: 0;
         right: 0;
         bottom: 0;
         background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
         animation: streak-shine 2s infinite;
       }

       @keyframes streak-shine {
         0% { transform: translateX(-100%); }
         100% { transform: translateX(100%); }
       }

       /* Streak value color coding */
       #streak-bonus.active {
         color: #4CAF50;
         font-weight: bold;
       }

       #streak-bonus.bonus-active {
         color: #FF9800;
         font-weight: bold;
       }

       /* Travel Container Styles */
       .travel-container {
         margin-top: 12px;
         border-radius: 6px;
         overflow: hidden;
         transition: all 0.3s ease;
       }
       
       .travel-container:empty {
         display: none;
       }
       
       .travel-status {
         padding: 12px;
         border-radius: 6px;
         margin: 0;
         font-size: 12px;
       }
       
       .travel-status.location-active {
         background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
         border: 1px solid #0ea5e9;
       }
       .travel-status.unlocked {
         background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
         border: 1px solid #10b981;
       }
       
       .travel-status.progressing {
         background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
         border: 1px solid #f59e0b;
       }
       
       .location-buff-info h3 {
         margin: 0 0 8px 0;
         font-size: 14px;
         font-weight: 600;
         color: #1e293b;
       }
       
       .location-buff-info p {
         margin: 4px 0;
         font-size: 11px;
         color: #475569;
       }
       
       .location-buff-info .location-description {
         font-style: italic;
         margin-bottom: 8px;
       }
       
       .travel-info p {
         margin: 4px 0;
         font-size: 11px;
         color: #475569;
       }
       
       .travel-info .momentum-value {
         font-weight: 600;
         color: #3b82f6;
       }
       
       .travel-info .time-estimate {
         font-weight: 600;
         color: #f59e0b;
       }
       
       /* Jump System Styles */
       .jump-container {
         padding: var(--spacing-md);
         overflow: visible !important;  /* Allow tooltips to escape container */
       }
       
       .jump-header {
         margin-bottom: var(--spacing-lg);
         text-align: center;
       }
       
       .jump-header h2 {
         margin: 0;
         color: var(--color-primary-text);
         font-size: var(--font-size-L);
       }
       
       .jump-subtitle {
         color: var(--color-secondary-text);
         font-size: var(--font-size-S);
         margin-top: var(--spacing-xs);
       }
       
       .jump-status-section {
         margin-bottom: var(--spacing-lg);
       }
       
       .status-block {
         background: white;
         border: 1px solid var(--color-borders);
         border-radius: var(--border-radius);
         padding: var(--spacing-md);
         box-shadow: var(--box-shadow);
       }
       
       .status-header {
         display: flex;
         align-items: center;
         margin-bottom: var(--spacing-sm);
         font-weight: 600;
         color: var(--color-primary-text);
       }
       
       .status-icon {
         margin-right: var(--spacing-sm);
         font-size: 1.2rem;
       }
       
       .jump-trigger-button {
         background: var(--color-primary-accent);
         color: white;
         border: none;
         padding: var(--spacing-md) var(--spacing-lg);
         border-radius: var(--border-radius);
         font-size: var(--font-size-M);
         font-weight: 600;
         cursor: pointer;
         transition: background-color 0.2s ease;
         width: 100%;
       }
       
       .jump-trigger-button:hover {
         background: var(--color-hover-accent);
       }
       
       .jump-info {
         text-align: center;
         color: var(--color-secondary-text);
         padding: var(--spacing-md);
       }
       
       /* Meltdown Styles */
       .meltdown-section {
         margin-top: var(--spacing-lg);
       }
       
       .meltdown-header {
         margin-bottom: var(--spacing-md);
         text-align: center;
       }
       
       .meltdown-header h3 {
         margin: 0;
         color: var(--color-primary-text);
       }
       
       .meltdown-subtitle {
         color: var(--color-secondary-text);
         font-size: var(--font-size-S);
         margin-top: var(--spacing-xs);
       }
       
       .meltdown-block {
         background: white;
         border: 1px solid var(--color-borders);
         border-radius: var(--border-radius);
         padding: var(--spacing-md);
         margin-bottom: var(--spacing-md);
         box-shadow: var(--box-shadow);
       }
       
       .block-header {
         display: flex;
         align-items: center;
         margin-bottom: var(--spacing-sm);
         font-weight: 600;
         color: var(--color-primary-text);
       }
       
       .block-icon {
         margin-right: var(--spacing-sm);
         font-size: 1.2rem;
       }
       
       .conversion-info {
         display: flex;
         justify-content: space-between;
         margin-bottom: var(--spacing-sm);
         font-size: var(--font-size-S);
         color: var(--color-secondary-text);
       }
       
       .conversion-controls {
         display: flex;
         gap: var(--spacing-sm);
         flex-wrap: wrap;
       }
       
       .convert-button {
         background: var(--color-secondary-accent);
         color: var(--color-primary-text);
         border: 1px solid var(--color-borders);
         padding: var(--spacing-sm) var(--spacing-md);
         border-radius: var(--border-radius);
         cursor: pointer;
         font-size: var(--font-size-S);
         transition: background-color 0.2s ease;
       }
       
       .convert-button:hover {
         background: #fbbf24;
       }
       
       .amount-input {
         padding: var(--spacing-sm);
         border: 1px solid var(--color-borders);
         border-radius: var(--border-radius);
         font-size: var(--font-size-S);
         width: 100px;
       }
       
       .assistants-conversion-grid {
         display: flex;
         flex-direction: column;
         gap: var(--spacing-sm);
       }
       
       .assistant-conversion-item {
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: var(--spacing-sm);
         border: 1px solid var(--color-borders);
         border-radius: var(--border-radius);
         background: #f8fafc;
       }
       
       .assistant-info {
         display: flex;
         flex-direction: column;
         gap: var(--spacing-xs);
       }
       
       .assistant-name {
         font-weight: 600;
         color: var(--color-primary-text);
       }
       
       .assistant-owned {
         font-size: var(--font-size-S);
         color: var(--color-secondary-text);
       }
       
       .sell-all-button,
       .sell-half-button {
         background: var(--color-danger);
         color: white;
         border: none;
         padding: var(--spacing-xs) var(--spacing-sm);
         border-radius: var(--border-radius);
         cursor: pointer;
         font-size: var(--font-size-S);
         margin-left: var(--spacing-sm);
         transition: background-color 0.2s ease;
       }
       
       .sell-all-button:hover,
       .sell-half-button:hover {
         background: #dc2626;
       }
       
       .meltdown-summary {
         background: white;
         border: 1px solid var(--color-borders);
         border-radius: var(--border-radius);
         padding: var(--spacing-md);
         margin-top: var(--spacing-md);
         box-shadow: var(--box-shadow);
       }
       
       .summary-row {
         display: flex;
         justify-content: space-between;
         align-items: center;
         margin-bottom: var(--spacing-sm);
         font-weight: 600;
       }
       
       .complete-button {
         background: var(--color-primary-accent);
         color: white;
         border: none;
         padding: var(--spacing-md) var(--spacing-lg);
         border-radius: var(--border-radius);
         font-size: var(--font-size-M);
         font-weight: 600;
         cursor: pointer;
         transition: background-color 0.2s ease;
         width: 100%;
       }
       
       .complete-button:hover {
         background: var(--color-hover-accent);
       }
       
       /* Snowflake Shop Styles */
       .snowflake-shop-section {
         margin-top: var(--spacing-lg);
       }
       
       .shop-header {
         margin-bottom: var(--spacing-md);
         text-align: center;
       }
       
       .shop-header h3 {
         margin: 0;
         color: var(--color-primary-text);
       }
       
       .shop-subtitle {
         color: var(--color-secondary-text);
         font-size: var(--font-size-S);
         margin-top: var(--spacing-xs);
       }
       
       .shop-balance {
         background: white;
         border: 1px solid var(--color-borders);
         border-radius: var(--border-radius);
         padding: var(--spacing-md);
         margin-bottom: var(--spacing-md);
         text-align: center;
         font-weight: 600;
         color: var(--color-primary-text);
         box-shadow: var(--box-shadow);
       }
       
       .snowflake-categories {
         display: flex;
         flex-direction: column;
         gap: var(--spacing-md);
       }
       
       .snowflake-category {
         background: white;
         border: 1px solid var(--color-borders);
         border-radius: var(--border-radius);
         padding: var(--spacing-md);
         box-shadow: var(--box-shadow);
       }
       
       .category-header {
         display: flex;
         justify-content: space-between;
         align-items: center;
         margin-bottom: var(--spacing-sm);
         font-weight: 600;
         color: var(--color-primary-text);
       }
       
       .category-progress {
         background: var(--color-primary-accent);
         color: white;
         padding: var(--spacing-xs) var(--spacing-sm);
         border-radius: 12px;
         font-size: var(--font-size-S);
       }
       
       .category-upgrades {
         display: flex;
         flex-direction: column;
         gap: var(--spacing-sm);
       }
       
       .snowflake-upgrade {
         border: 1px solid var(--color-borders);
         border-radius: var(--border-radius);
         padding: var(--spacing-sm);
         transition: all 0.2s ease;
       }
       
       .snowflake-upgrade.owned {
         background: #dcfce7;
         border-color: #22c55e;
       }
       
       .snowflake-upgrade.affordable {
         background: #fef3c7;
         border-color: #f59e0b;
       }
       
       .snowflake-upgrade.unaffordable {
         background: #fee2e2;
         border-color: #ef4444;
         opacity: 0.7;
       }
       
       .upgrade-info {
         display: flex;
         justify-content: space-between;
         align-items: center;
         margin-bottom: var(--spacing-xs);
       }
       
       .upgrade-name {
         font-weight: 600;
         color: var(--color-primary-text);
       }
       
       .upgrade-cost {
         font-size: var(--font-size-S);
         color: var(--color-secondary-text);
       }
       
       .upgrade-description {
         font-size: var(--font-size-S);
         color: var(--color-secondary-text);
         margin-bottom: var(--spacing-sm);
       }
       
       .purchase-button {
         background: var(--color-primary-accent);
         color: white;
         border: none;
         padding: var(--spacing-sm) var(--spacing-md);
         border-radius: var(--border-radius);
         cursor: pointer;
         font-size: var(--font-size-S);
         transition: background-color 0.2s ease;
         width: 100%;
       }
       
       .purchase-button:hover:not(:disabled) {
         background: var(--color-hover-accent);
       }
       
       .purchase-button:disabled {
         background: var(--color-borders);
         cursor: not-allowed;
       }
       
       /* Jump Confirmation Styles */
       .jump-confirmation {
         background: white;
         border: 2px solid var(--color-primary-accent);
         border-radius: var(--border-radius);
         padding: var(--spacing-lg);
         margin-top: var(--spacing-lg);
         text-align: center;
         box-shadow: var(--box-shadow);
       }
       
       .confirmation-header h4 {
         margin: 0 0 var(--spacing-sm) 0;
         color: var(--color-primary-text);
       }
       
       .confirmation-header p {
         margin: 0 0 var(--spacing-md) 0;
         color: var(--color-secondary-text);
       }
       
       .confirmation-buttons {
         display: flex;
         gap: var(--spacing-md);
         justify-content: center;
       }
       
       .confirm-button {
         background: var(--color-primary-accent);
         color: white;
         border: none;
         padding: var(--spacing-md) var(--spacing-lg);
         border-radius: var(--border-radius);
         font-size: var(--font-size-M);
         font-weight: 600;
         cursor: pointer;
         transition: background-color 0.2s ease;
       }
       
       .confirm-button:hover {
         background: var(--color-hover-accent);
       }
       
       .cancel-button {
         background: var(--color-borders);
         color: var(--color-primary-text);
         border: none;
         padding: var(--spacing-md) var(--spacing-lg);
         border-radius: var(--border-radius);
         font-size: var(--font-size-M);
         font-weight: 600;
         cursor: pointer;
         transition: background-color 0.2s ease;
       }
       
       .cancel-button:hover {
         background: #d1d5db;
       }
       
       /* Jump Overlay Styles */
       .jump-overlay {
         position: fixed;
         top: 0;
         left: 0;
         width: 100vw;
         height: 100vh;
         background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
         z-index: 10000;
         display: flex;
         align-items: center;
         justify-content: center;
         overflow-y: auto;
       }

       .jump-overlay-content {
         width: 100%;
         max-width: 1200px;
         padding: 40px;
         color: white;
       }

       .jump-header {
         text-align: center;
         margin-bottom: 40px;
       }

       .jump-header h1 {
         font-size: 3rem;
         margin: 0;
         background: linear-gradient(45deg, #667eea, #764ba2);
         -webkit-background-clip: text;
         -webkit-text-fill-color: transparent;
         background-clip: text;
       }

       .jump-header p {
         font-size: 1.2rem;
         opacity: 0.8;
         margin: 10px 0 0 0;
       }

       .jump-status-section {
         background: rgba(255, 255, 255, 0.1);
         border-radius: 12px;
         padding: 30px;
         backdrop-filter: blur(10px);
         border: 1px solid rgba(255, 255, 255, 0.2);
       }

       .status-grid {
         display: grid;
         grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
         gap: 20px;
         margin-bottom: 30px;
       }

       .status-item {
         text-align: center;
         padding: 20px;
         background: rgba(255, 255, 255, 0.05);
         border-radius: 8px;
         border: 1px solid rgba(255, 255, 255, 0.1);
       }

       .status-item h3 {
         margin: 0 0 10px 0;
         font-size: 1rem;
         opacity: 0.8;
       }

       .status-value {
         font-size: 1.5rem;
         font-weight: 600;
         margin: 0;
         color: #667eea;
       }

       .progress-bar {
         width: 100%;
         height: 8px;
         background: rgba(255, 255, 255, 0.1);
         border-radius: 4px;
         overflow: hidden;
         margin-bottom: 20px;
       }

       .progress-fill {
         height: 100%;
         background: linear-gradient(90deg, #667eea, #764ba2);
         transition: width 0.3s ease;
       }

       .jump-locked {
         text-align: center;
         opacity: 0.6;
         font-style: italic;
       }

       .meltdown-section {
         background: rgba(255, 255, 255, 0.1);
         border-radius: 12px;
         padding: 30px;
         backdrop-filter: blur(10px);
         border: 1px solid rgba(255, 255, 255, 0.2);
       }

       .meltdown-section h2 {
         text-align: center;
         margin: 0 0 20px 0;
         font-size: 2rem;
       }

       .meltdown-section p {
         text-align: center;
         opacity: 0.8;
         margin-bottom: 30px;
       }

       .meltdown-grid {
         display: grid;
         grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
         gap: 30px;
         margin-bottom: 30px;
       }

       .meltdown-card {
         background: rgba(255, 255, 255, 0.05);
         border-radius: 8px;
         padding: 20px;
         border: 1px solid rgba(255, 255, 255, 0.1);
       }

       .meltdown-card h3 {
         margin: 0 0 15px 0;
         color: #667eea;
       }

       .conversion-info {
         margin-bottom: 15px;
       }

       .conversion-info p {
         margin: 5px 0;
         text-align: left;
       }

       .conversion-controls {
         display: flex;
         flex-direction: column;
         gap: 10px;
       }

       .custom-conversion {
         display: flex;
         gap: 10px;
       }

       .amount-input {
         flex: 1;
         padding: 10px;
         border: 1px solid rgba(255, 255, 255, 0.2);
         border-radius: 6px;
         background: rgba(255, 255, 255, 0.1);
         color: white;
       }

       .amount-input::placeholder {
         color: rgba(255, 255, 255, 0.5);
       }

       .assistants-grid {
         display: grid;
         gap: 10px;
       }

       .assistant-conversion-item {
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: 10px;
         background: rgba(255, 255, 255, 0.05);
         border-radius: 6px;
         border: 1px solid rgba(255, 255, 255, 0.1);
       }

       .assistant-info {
         flex: 1;
       }

       .assistant-name {
         font-weight: 600;
         display: block;
       }

       .assistant-owned {
         opacity: 0.8;
         font-size: 0.9rem;
       }

       .sell-all-button, .sell-half-button {
         background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
         color: white;
         border: none;
         padding: 8px 12px;
         border-radius: 4px;
         cursor: pointer;
         font-size: 0.8rem;
         margin-left: 10px;
       }

       .sell-all-button:hover, .sell-half-button:hover {
         transform: translateY(-1px);
         box-shadow: 0 2px 8px rgba(231, 76, 60, 0.3);
       }

       .meltdown-summary {
         text-align: center;
         padding: 20px;
         background: rgba(255, 255, 255, 0.05);
         border-radius: 8px;
         border: 1px solid rgba(255, 255, 255, 0.1);
       }

       .complete-button {
         background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
         color: white;
         border: none;
         padding: 15px 30px;
         border-radius: 8px;
         font-size: 16px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s ease;
         margin-top: 15px;
       }

       .complete-button:hover {
         transform: translateY(-2px);
         box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
       }

       .snowflake-shop-section {
         background: rgba(255, 255, 255, 0.1);
         border-radius: 12px;
         padding: 30px;
         backdrop-filter: blur(10px);
         border: 1px solid rgba(255, 255, 255, 0.2);
       }

       .snowflake-shop-section h2 {
         text-align: center;
         margin: 0 0 20px 0;
         font-size: 2rem;
       }

       .snowflake-shop-section p {
         text-align: center;
         opacity: 0.8;
         margin-bottom: 30px;
       }

       .shop-header {
         text-align: center;
         margin-bottom: 30px;
         padding: 20px;
         background: rgba(255, 255, 255, 0.05);
         border-radius: 8px;
         border: 1px solid rgba(255, 255, 255, 0.1);
       }

       .shop-header h3 {
         margin: 0;
         color: #667eea;
       }

       .snowflake-categories {
         display: grid;
         gap: 20px;
         margin-bottom: 30px;
       }

       .snowflake-category {
         background: rgba(255, 255, 255, 0.05);
         border-radius: 8px;
         padding: 20px;
         border: 1px solid rgba(255, 255, 255, 0.1);
       }

       .category-header {
         display: flex;
         justify-content: space-between;
         align-items: center;
         margin-bottom: 15px;
       }

       .category-title {
         font-weight: 600;
         color: #667eea;
       }

       .category-progress {
         opacity: 0.8;
         font-size: 0.9rem;
       }

       .category-upgrades {
         display: grid;
         gap: 10px;
       }

       .snowflake-upgrade {
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: 15px;
         border-radius: 6px;
         border: 1px solid rgba(255, 255, 255, 0.1);
         transition: all 0.3s ease;
       }

       .snowflake-upgrade.owned {
         background: rgba(39, 174, 96, 0.2);
         border-color: rgba(39, 174, 96, 0.3);
       }
       .snowflake-upgrade.affordable {
         background: rgba(102, 126, 234, 0.1);
         border-color: rgba(102, 126, 234, 0.2);
       }

       .snowflake-upgrade.unaffordable {
         background: rgba(255, 255, 255, 0.05);
         opacity: 0.6;
       }

       .upgrade-info {
         flex: 1;
       }

       .upgrade-name {
         font-weight: 600;
         display: block;
       }

       .upgrade-cost {
         opacity: 0.8;
         font-size: 0.9rem;
       }

       .upgrade-description {
         flex: 2;
         margin: 0 15px;
         opacity: 0.8;
         font-size: 0.9rem;
       }

       .purchase-button {
         background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
         color: white;
         border: none;
         padding: 8px 16px;
         border-radius: 4px;
         cursor: pointer;
         transition: all 0.3s ease;
       }

       .purchase-button:hover:not(:disabled) {
         transform: translateY(-1px);
         box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
       }

       .purchase-button:disabled {
         opacity: 0.5;
         cursor: not-allowed;
       }

       .jump-confirmation {
         text-align: center;
         padding: 30px;
         background: rgba(255, 255, 255, 0.05);
         border-radius: 8px;
         border: 1px solid rgba(255, 255, 255, 0.1);
       }

       .jump-confirmation h3 {
         margin: 0 0 10px 0;
         color: #667eea;
       }

       .jump-confirmation p {
         margin: 0 0 20px 0;
         opacity: 0.8;
       }

       .confirmation-buttons {
         display: flex;
         gap: 15px;
         justify-content: center;
       }

       .confirm-button {
         background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
         color: white;
         border: none;
         padding: 15px 30px;
         border-radius: 8px;
         font-size: 16px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s ease;
       }

       .confirm-button:hover {
         transform: translateY(-2px);
         box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3);
       }

       .cancel-button {
         background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
         color: white;
         border: none;
         padding: 15px 30px;
         border-radius: 8px;
         font-size: 16px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s ease;
       }

       .cancel-button:hover {
         transform: translateY(-2px);
         box-shadow: 0 4px 15px rgba(231, 76, 60, 0.3);
       }
       
       /* Tooltip styles */
       .tooltip {
         position: relative;
         display: inline-block;
       }
       
               .tooltip .tooltiptext {
          visibility: hidden;
          width: 300px;
          background-color: #1a1a2e;
          color: white;
          text-align: center;
          border-radius: 6px;
          padding: 15px;
          position: absolute;
          z-index: 10001;
          top: 125%;
          left: 50%;
          margin-left: -150px;
          opacity: 0;
          transition: opacity 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          font-size: 0.9rem;
          line-height: 1.4;
        }
       
               .tooltip .tooltiptext::after {
          content: "";
          position: absolute;
          bottom: 100%;
          left: 50%;
          margin-left: -5px;
          border-width: 5px;
          border-style: solid;
          border-color: transparent transparent #1a1a2e transparent;
        }
       
       .tooltip:hover .tooltiptext {
         visibility: visible;
         opacity: 1;
       }
       
       /* Confirmation dialog styles */
       .confirmation-overlay {
         position: fixed;
         top: 0;
         left: 0;
         width: 100vw;
         height: 100vh;
         background: rgba(0, 0, 0, 0.8);
         z-index: 10002;
         display: flex;
         align-items: center;
         justify-content: center;
       }
       
       .confirmation-dialog {
         background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
         border: 1px solid rgba(255, 255, 255, 0.2);
         border-radius: 12px;
         padding: 30px;
         max-width: 500px;
         width: 90%;
         color: white;
         text-align: center;
         backdrop-filter: blur(10px);
       }
       
       .confirmation-dialog h2 {
         margin: 0 0 20px 0;
         color: #667eea;
         font-size: 1.5rem;
       }
       
       .confirmation-dialog p {
         margin: 0 0 25px 0;
         opacity: 0.9;
         line-height: 1.5;
       }
       
       .confirmation-dialog .warning {
         background: rgba(231, 76, 60, 0.2);
         border: 1px solid rgba(231, 76, 60, 0.3);
         border-radius: 8px;
         padding: 15px;
         margin: 20px 0;
         color: #fca5a5;
       }
       
       .confirmation-dialog .jump-info {
         background: rgba(102, 126, 234, 0.1);
         border: 1px solid rgba(102, 126, 234, 0.2);
         border-radius: 8px;
         padding: 15px;
         margin: 20px 0;
         text-align: left;
       }
       
       .confirmation-dialog .jump-info h4 {
         margin: 0 0 10px 0;
         color: #667eea;
       }
       
       .confirmation-dialog .jump-info p {
         margin: 5px 0;
         opacity: 0.8;
       }
       
       .confirmation-buttons {
         display: flex;
         gap: 15px;
         justify-content: center;
         margin-top: 25px;
       }
       
       .confirm-jump-button {
         background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
         color: white;
         border: none;
         padding: 12px 24px;
         border-radius: 6px;
         font-size: 14px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s ease;
       }
       
       .confirm-jump-button:hover {
         transform: translateY(-1px);
         box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
       }
       
       .cancel-jump-button {
         background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
         color: white;
         border: none;
         padding: 12px 24px;
         border-radius: 6px;
         font-size: 14px;
         font-weight: 600;
         cursor: pointer;
         transition: all 0.3s ease;
       }
       
       .cancel-jump-button:hover {
         transform: translateY(-1px);
         box-shadow: 0 4px 12px rgba(107, 114, 128, 0.3);
       }
       
       /* Jump tab content styles */
       .jump-info-section {
         padding: 20px;
         background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
         border-radius: 12px;
         border: 1px solid rgba(255, 255, 255, 0.2);
         margin: 20px;
       }
       
       .jump-info-section h2 {
         color: #667eea;
         margin: 0 0 20px 0;
         text-align: center;
       }
       
       .jump-stats {
         display: grid;
         grid-template-columns: repeat(2, 1fr);
         gap: 20px;
         margin-bottom: 20px;
       }
       
       .stat-item {
         background: rgba(255, 255, 255, 0.1);
         padding: 15px;
         border-radius: 8px;
         text-align: center;
         border: 1px solid rgba(255, 255, 255, 0.2);
       }
       
       .stat-item h3 {
         margin: 0 0 10px 0;
         color: #667eea;
         font-size: 0.9rem;
       }
       
       .stat-item p {
         margin: 0;
         font-size: 1.2rem;
         font-weight: bold;
         color: white;
       }
       
       .progress-bar {
         width: 100%;
         height: 20px;
         background: rgba(255, 255, 255, 0.1);
         border-radius: 10px;
         overflow: hidden;
         margin: 20px 0;
         border: 1px solid rgba(255, 255, 255, 0.2);
       }
       
       .progress-fill {
         height: 100%;
         background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
         transition: width 0.3s ease;
       }
       
       .jump-note {
         background: rgba(102, 126, 234, 0.1);
         border: 1px solid rgba(102, 126, 234, 0.3);
         border-radius: 8px;
         padding: 15px;
         text-align: center;
         color: #fca5a5;
       }
       
       /* Conversion summary styles */
       .conversion-summary {
         background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%);
         border: 1px solid rgba(34, 197, 94, 0.3);
         border-radius: 12px;
         padding: 20px;
         margin-bottom: 20px;
         text-align: center;
       }
       
       .conversion-summary h3 {
         margin: 0 0 10px 0;
         color: #22c55e;
         font-size: 1.2rem;
       }
       
       .conversion-summary p {
         margin: 0 0 15px 0;
         opacity: 0.9;
         color: white;
       }
       
       .conversion-details {
         background: rgba(255, 255, 255, 0.1);
         border-radius: 8px;
         padding: 15px;
         text-align: left;
       }
       
       .conversion-details p {
         margin: 8px 0;
         color: white;
         font-size: 0.9rem;
       }
       
       .conversion-details strong {
         color: #22c55e;
       }
       
       /* Tree container styles */
       .grid-container {
         display: flex;
         justify-content: center;
         align-items: flex-start;
         margin: 20px 0;
         padding: 20px;
         max-height: 70vh;
         overflow-y: auto;
       }
       
       .snowflake-grid-container {
         width: 100%;
         max-width: 1200px;
         background: rgba(255, 255, 255, 0.05);
         border-radius: 12px;
         padding: 20px;
         box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
       }
       
       /* Balance header */
       .snowflake-balance-header {
         text-align: center;
         margin-bottom: 30px;
         padding: 20px;
         background: rgba(255, 255, 255, 0.1);
         border-radius: 8px;
       }
       
       .balance-display {
         font-size: 1.5rem;
         margin-bottom: 10px;
       }
       
       .balance-icon {
         font-size: 2rem;
         margin-right: 10px;
       }
       
       .balance-text {
         color: white;
       }
       
       .balance-text strong {
         color: #22c55e;
         font-size: 1.8rem;
       }
       
       .balance-description {
         color: rgba(255, 255, 255, 0.8);
         font-size: 0.9rem;
       }
       
       /* Category sections */
       .snowflake-category-section {
         margin-bottom: 30px;
         background: rgba(255, 255, 255, 0.05);
         border-radius: 8px;
         overflow: hidden;
       }
       
       .category-header {
         display: flex;
         justify-content: space-between;
         align-items: center;
         padding: 15px 20px;
         background: rgba(255, 255, 255, 0.1);
         border-left: 4px solid;
       }
       
       .category-info {
         display: flex;
         flex-direction: column;
       }
       
       .category-name {
         font-size: 1.2rem;
         font-weight: bold;
         color: white;
         margin-bottom: 5px;
       }
       
       .category-description {
         font-size: 0.9rem;
         color: rgba(255, 255, 255, 0.7);
       }
       
       .category-progress {
         text-align: right;
       }
       
       .progress-text {
         font-size: 0.9rem;
         color: rgba(255, 255, 255, 0.8);
         margin-bottom: 5px;
         display: block;
       }
       
       .progress-bar {
         width: 150px;
         height: 8px;
         background: rgba(255, 255, 255, 0.2);
         border-radius: 4px;
         overflow: hidden;
       }
       
       .progress-fill {
         height: 100%;
         border-radius: 4px;
         transition: width 0.3s ease;
       }
       
       /* Upgrades grid */
       .upgrades-grid {
         display: grid;
         grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
         gap: 15px;
         padding: 20px;
       }
       
       /* Upgrade cards */
       .upgrade-card {
         background: rgba(255, 255, 255, 0.1);
         border: 2px solid transparent;
         border-radius: 8px;
         padding: 15px;
         cursor: pointer;
         transition: all 0.2s ease;
         position: relative;
       }
       
       .upgrade-card:hover {
         background: rgba(255, 255, 255, 0.15);
         transform: translateY(-2px);
       }
       
       .upgrade-card.owned {
         background: rgba(34, 197, 94, 0.2);
         border-color: #22c55e;
       }
       
       .upgrade-card.available {
         background: rgba(59, 130, 246, 0.2);
         border-color: #3b82f6;
       }
       
       .upgrade-card.unaffordable {
         background: rgba(245, 158, 11, 0.2);
         border-color: #f59e0b;
         opacity: 0.7;
       }
       
       .upgrade-card.locked {
         background: rgba(107, 114, 128, 0.2);
         border-color: #6b7280;
         opacity: 0.5;
         cursor: not-allowed;
       }
       
       .upgrade-icon {
         position: relative;
         text-align: center;
         margin-bottom: 10px;
       }
       
       .upgrade-icon img {
         border-radius: 4px;
       }
       
       .owned-badge {
         position: absolute;
         top: -5px;
         right: -5px;
         background: #22c55e;
         color: white;
         border-radius: 50%;
         width: 20px;
         height: 20px;
         display: flex;
         align-items: center;
         justify-content: center;
         font-size: 12px;
         font-weight: bold;
       }
       
       .locked-badge {
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         background: rgba(0, 0, 0, 0.8);
         color: white;
         border-radius: 4px;
         padding: 4px 8px;
         font-size: 12px;
       }
       
       .upgrade-info {
         text-align: center;
       }
       
       .upgrade-name {
         font-size: 0.9rem;
         font-weight: bold;
         color: white;
         margin-bottom: 5px;
         word-wrap: break-word;
       }
       
       .upgrade-cost {
         font-size: 0.8rem;
         color: #22c55e;
         font-weight: bold;
       }
       
       /* Messages */
       .snowflake-message {
         animation: slideIn 0.3s ease;
       }
       
       /* 
        * =====================================================================
        * BATTLE ANIMATION SYSTEM
        * =====================================================================
        * 
        * Provides visual feedback during battle resolution with two main effects:
        * 
        * 1. SCREEN FLASH (500ms):
        *    - Brief color overlay across entire screen
        *    - Green flash for victory, Red flash for defeat
        *    - Uses CSS animation for smooth fade in/out
        *    - Non-intrusive visual feedback
        * 
        * 2. POWER NUMBER FLASH (2 seconds):
        *    - Animated display of player and yeti power values
        *    - Player power (⚔️) on left, Yeti power (🛡️) on right
        *    - Color coding: Green for winner, Red for loser
        *    - Scale and movement effects for visual impact
        * 
        * Configuration:
        * - Screen flash: 30% opacity peak, 500ms duration
        * - Power numbers: 2.5rem font, dark background, rounded corners
        * - Both animations auto-cleanup after completion
        * - Uses high z-index (9999-10000) to appear above all content
        * 
        * Usage: Automatically triggered when showBattleResults() is called
        * Testing: Use window.testBattleAnimations(true/false) in console
        */
       @keyframes powerNumberFlash {
         0% { 
           opacity: 0; 
           transform: scale(0.8) translateY(20px); 
         }
         20% { 
           opacity: 1; 
           transform: scale(1.2) translateY(0px); 
         }
         80% { 
           opacity: 1; 
           transform: scale(1.0) translateY(0px); 
         }
         100% { 
           opacity: 0; 
           transform: scale(0.9) translateY(-10px); 
         }
       }
       
       /* 
        * Screen Flash Animation:
        * - Brief color overlay flash during battle resolution
        * - Green flash for victory, Red flash for defeat
        * - Duration: 500ms with fade in/out effect
        */
       @keyframes screenFlash {
         0% { 
           opacity: 0; 
         }
         50% { 
           opacity: 0.3; 
         }
         100% { 
           opacity: 0; 
         }
       }
       
       .battle-power-flash {
         position: fixed;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         z-index: 10000;
         font-size: 2.5rem;
         font-weight: bold;
         text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
         pointer-events: none;
         animation: powerNumberFlash 2s ease-out forwards;
         background: rgba(0, 0, 0, 0.7);
         padding: 10px 20px;
         border-radius: 8px;
         white-space: nowrap;
       }
       
       .battle-screen-flash {
         position: fixed;
         top: 0;
         left: 0;
         width: 100vw;
         height: 100vh;
         z-index: 9999;
         pointer-events: none;
         animation: screenFlash 500ms ease-out forwards;
       }
       
                @keyframes slideIn {
           from {
             transform: translateX(100%);
             opacity: 0;
           }
           to {
             transform: translateX(0);
             opacity: 1;
           }
         }
         
         /* Jump confirmation styles */
         .jump-confirmation {
           margin-top: 30px;
           padding: 20px;
           background: rgba(255, 255, 255, 0.1);
           border-radius: 8px;
           text-align: center;
         }
         
         .jump-summary {
           margin: 20px 0;
           display: flex;
           justify-content: space-around;
           flex-wrap: wrap;
           gap: 20px;
         }
         
         .summary-item {
           display: flex;
           flex-direction: column;
           align-items: center;
           padding: 15px;
           background: rgba(255, 255, 255, 0.05);
           border-radius: 8px;
           min-width: 150px;
         }
         
         .summary-label {
           font-size: 0.9rem;
           color: rgba(255, 255, 255, 0.8);
           margin-bottom: 5px;
         }
         
         .summary-value {
           font-size: 1.5rem;
           font-weight: bold;
           color: #22c55e;
         }
         
         .confirmation-buttons {
           display: flex;
           justify-content: center;
           gap: 15px;
           margin-top: 20px;
         }
         
         .confirm-button {
           background: #22c55e;
           color: white;
           border: none;
           padding: 12px 24px;
           border-radius: 6px;
           font-size: 1rem;
           font-weight: bold;
           cursor: pointer;
           transition: background 0.2s ease;
         }
         
         .confirm-button:hover {
           background: #16a34a;
         }
         
         .cancel-button {
           background: #6b7280;
           color: white;
           border: none;
           padding: 12px 24px;
           border-radius: 6px;
           font-size: 1rem;
           font-weight: bold;
           cursor: pointer;
           transition: background 0.2s ease;
         }
         
         .cancel-button:hover {
           background: #4b5563;
         }
         
         /* Disabled jump button */
         #jump-button.disabled {
           opacity: 0.6;
           cursor: not-allowed;
           background: #6b7280;
         }
         
         #jump-button.disabled:hover {
           background: #6b7280;
         }
       
       /* Tree legend styles */
       .tree-legend {
         display: flex;
         justify-content: center;
         gap: 30px;
         margin: 20px 0;
         padding: 15px;
         background: rgba(255, 255, 255, 0.1);
         border-radius: 8px;
       }
       
       .legend-item {
         display: flex;
         align-items: center;
         gap: 8px;
         color: white;
         font-size: 14px;
       }
       
       .legend-icon {
         width: 20px;
         height: 20px;
         border-radius: 50%;
         border: 2px solid;
       }
       
       .legend-icon.owned {
         background: #22c55e;
         border-color: #16a34a;
       }
       
       .legend-icon.available {
         background: #667eea;
         border-color: white;
       }
       
       .legend-icon.locked {
         background: #6b7280;
         border-color: #4b5563;
       }
       
       /* Fallback styles */
       .fallback-categories {
         text-align: center;
         padding: 40px;
         color: white;
       }
       
       .fallback-categories h3 {
         margin-bottom: 10px;
         color: #667eea;
       }
       
       /* SVG tree specific styles */
       .snowflake-tree-svg {
         cursor: pointer;
       }
       
       .upgrade-node {
         cursor: pointer;
         transition: transform 0.1s ease; /* Reduced transition time */
       }
       
       .upgrade-node:hover {
         transform: scale(1.05); /* Reduced scale for less dramatic effect */
       }
       
       .center-core {
         cursor: default;
       }
       
       .branch-path {
         pointer-events: none;
       }
       
       /* Lore System Styles */
       .lore-container {
         padding: var(--spacing-md);
       }
       
       .lore-header {
         margin-bottom: var(--spacing-lg);
         text-align: center;
       }
       
       .lore-header h2 {
         margin: 0 0 var(--spacing-sm) 0;
         color: var(--color-primary-text);
         font-size: var(--font-size-L);
       }
       
       .lore-subtitle {
         color: var(--color-secondary-text);
         font-size: var(--font-size-S);
         margin-bottom: var(--spacing-md);
       }
       
       .lore-progress {
         display: flex;
         align-items: center;
         gap: var(--spacing-sm);
         margin-bottom: var(--spacing-md);
       }
       
       .progress-bar {
         flex: 1;
         height: 8px;
         background: var(--color-borders);
         border-radius: 4px;
         overflow: hidden;
       }
       
       .progress-fill {
         height: 100%;
         background: linear-gradient(90deg, var(--color-primary-accent), var(--color-hover-accent));
         transition: width 0.3s ease;
         width: 0%;
       }
       
       .progress-text {
         font-size: var(--font-size-S);
         color: var(--color-secondary-text);
         font-weight: 600;
         min-width: 60px;
         text-align: right;
       }
       
       .lore-books {
         display: flex;
         flex-direction: column;
         gap: var(--spacing-lg);
       }
       
       .lore-book {
         border: 1px solid var(--color-borders);
         border-radius: var(--border-radius);
         background: white;
         overflow: hidden;
       }
       
       .lore-book-header {
         background: linear-gradient(135deg, var(--color-primary-accent), var(--color-hover-accent));
         color: var(--color-primary-text);
         padding: var(--spacing-md);
       }
       
       .lore-book-title {
         margin: 0 0 var(--spacing-sm) 0;
         font-size: var(--font-size-L);
         font-weight: 600;
         color: var(--color-primary-text);
       }
       
       .lore-book-description {
         margin: 0;
         font-size: var(--font-size-S);
         opacity: 0.9;
         color: var(--color-primary-text);
       }
       
       .lore-chapter {
         border-bottom: 1px solid var(--color-borders);
         padding: var(--spacing-md);
       }
       
       .lore-chapter:last-child {
         border-bottom: none;
       }
       
       .lore-chapter-header {
         margin-bottom: var(--spacing-md);
       }
       
       .lore-chapter-title {
         margin: 0 0 var(--spacing-sm) 0;
         color: var(--color-primary-text);
         font-size: var(--font-size-M);
         font-weight: 600;
       }
       
       .lore-chapter-description {
         margin: 0;
         color: var(--color-secondary-text);
         font-size: var(--font-size-S);
       }
       
       .lore-items-grid {
         display: grid;
         grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
         gap: var(--spacing-sm);
       }
       
       .lore-item {
         position: relative;
         width: 60px;
         height: 60px;
         border: 2px solid var(--color-borders);
         border-radius: var(--border-radius);
         background: white;
         display: flex;
         align-items: center;
         justify-content: center;
         transition: all 0.2s ease;
         cursor: default;
       }
       
       .lore-item:hover {
         transform: scale(1.05);
         box-shadow: var(--box-shadow);
       }
       
       .lore-item.locked {
         opacity: 0.5;
         border-color: #6b7280;
         cursor: not-allowed;
         pointer-events: none;
       }
       
       .lore-item.unlocked {
         border-color: #22c55e;
         cursor: pointer;
       }
       
       .lore-item.unlocked:hover {
         border-color: #16a34a;
         background: #f0fdf4;
       }
       
       .lore-item.viewed {
         border-color: #3b82f6;
         cursor: pointer;
       }
       
       .lore-item.viewed:hover {
         border-color: #2563eb;
         background: #eff6ff;
       }
       
       .lore-item-icon {
         width: 100%;
         height: 100%;
         object-fit: cover;
         border-radius: calc(var(--border-radius) - 2px);
       }
       
       .lore-item-tooltip {
         position: absolute;
         bottom: 100%;
         left: 50%;
         transform: translateX(-50%);
         background: var(--color-primary-text);
         color: white;
         padding: var(--spacing-sm);
         border-radius: var(--border-radius);
         font-size: var(--font-size-S);
         white-space: nowrap;
         opacity: 0;
         pointer-events: none;
         transition: opacity 0.2s ease;
         z-index: 1000;
         margin-bottom: 5px;
       }
       
       .lore-item:hover .lore-item-tooltip {
         opacity: 1;
       }
       
       .lore-item-tooltip::after {
         content: '';
         position: absolute;
         top: 100%;
         left: 50%;
         transform: translateX(-50%);
         border: 5px solid transparent;
         border-top-color: var(--color-primary-text);
       }
       
       /* Lore Modal Styles */
       .lore-modal {
         display: none;
         position: fixed;
         top: 0;
         left: 0;
         width: 100%;
         height: 100%;
         background: rgba(0, 0, 0, 0.5);
         z-index: 10000;
         align-items: center;
         justify-content: center;
       }
       
       .lore-modal-content {
         background: white;
         border-radius: var(--border-radius);
         max-width: 500px;
         width: 90%;
         max-height: 80vh;
         overflow: hidden;
         box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
       }
       
       .lore-modal-header {
         background: linear-gradient(135deg, var(--color-primary-accent), var(--color-hover-accent));
         color: white;
         padding: var(--spacing-md);
         display: flex;
         align-items: center;
         gap: var(--spacing-sm);
         position: relative;
       }
       
       .lore-modal-icon {
         width: 48px;
         height: 48px;
         border-radius: var(--border-radius);
         border: 2px solid white;
       }
       
       .lore-modal-header h3 {
         margin: 0;
         flex: 1;
         font-size: var(--font-size-L);
         font-weight: 600;
       }
       
       .lore-modal-close {
         background: none;
         border: none;
         color: white;
         font-size: 24px;
         cursor: pointer;
         padding: 0;
         width: 30px;
         height: 30px;
         display: flex;
         align-items: center;
         justify-content: center;
         border-radius: 50%;
         transition: background 0.2s ease;
       }
       
       .lore-modal-close:hover {
         background: rgba(255, 255, 255, 0.2);
       }
       
       .lore-modal-body {
         padding: var(--spacing-md);
         max-height: 400px;
         overflow-y: auto;
       }
       
       .lore-modal-body p {
         margin: 0;
         line-height: 1.6;
         color: var(--color-primary-text);
         font-size: var(--font-size-M);
       }
       
       .lore-modal-footer {
         padding: var(--spacing-sm) var(--spacing-md);
         background: var(--color-background);
         border-top: 1px solid var(--color-borders);
         text-align: center;
       }
       
       .lore-modal-footer span {
         font-size: var(--font-size-S);
         color: var(--color-secondary-text);
       }
     `;
    document.head.appendChild(style);
  }

     /**
    * Initialize snowfall effect
    * 
    * SNOWFALL CONFIGURATION GUIDE:
    * 
    * DENSITY/AMOUNT CONTROL:
    * - Change snowflake count: Modify the random range in createSnowflakes() 
    *   (currently: Math.floor(Math.random() * 3) + 3 = 3-5 snowflakes per batch)
    * - Change spawn rate: Modify the setInterval timing (currently: 2000ms = every 2 seconds)
    * - For heavier snowfall: Increase count to 5-8, decrease interval to 1000ms
    * - For lighter snowfall: Decrease count to 1-3, increase interval to 3000ms
    * 
    * DYNAMIC SNOWFALL VARIATIONS (Future Features):
    * - Heavy snowstorm: this.setSnowfallIntensity('heavy') - 8-12 snowflakes, 500ms interval
    * - Light flurries: this.setSnowfallIntensity('light') - 1-2 snowflakes, 4000ms interval
    * - Assistant-triggered: this.setSnowfallIntensity('snowstorm') - triggered by Snowstorm assistant
    * - Location-based: this.setSnowfallIntensity('blizzard') - triggered by certain locations
    * 
    * PERFORMANCE NOTES:
    * - Each snowflake uses GPU-accelerated CSS transforms
    * - Automatic cleanup prevents memory leaks
    * - Adjust density based on device performance
    */
   initializeSnowfall() {
     // Create snowfall container
     const snowfallContainer = document.createElement('div');
     snowfallContainer.className = 'snowfall-container';
     snowfallContainer.id = 'snowfall-container';
     document.body.appendChild(snowfallContainer);

     // Create initial snowflakes
     this.createSnowflakes();

     // Start snowfall timer
     setInterval(() => {
       this.createSnowflakes();
     }, 2000); // Create new snowflakes every 2 seconds
   }

  /**
   * Create individual snowflakes
   */
  createSnowflakes() {
    const container = document.getElementById('snowfall-container');
    if (!container) return;

    // Create 3-5 snowflakes per batch
    const snowflakeCount = Math.floor(Math.random() * 3) + 5;
    
    for (let i = 0; i < snowflakeCount; i++) {
      setTimeout(() => {
        this.createSingleSnowflake();
      }, i * 200); // Stagger snowflake creation
    }
  }

  /**
   * Create a single snowflake
   */
  createSingleSnowflake() {
    const container = document.getElementById('snowfall-container');
    if (!container) return;

    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    
    // Randomize animation type
    const animationTypes = ['snowfall1', 'snowfall2', 'snowfall3'];
    const randomType = animationTypes[Math.floor(Math.random() * animationTypes.length)];
    snowflake.classList.add(randomType);
    
    // Randomize starting position
    const startX = Math.random() * window.innerWidth;
    snowflake.style.left = startX + 'px';
    
    // Add to container
    container.appendChild(snowflake);
    
         // Remove snowflake after animation completes
     setTimeout(() => {
       if (snowflake.parentNode) {
         snowflake.remove();
       }
     }, 15000); // Remove after 15 seconds (longer than longest animation)
   }

   /**
    * Create snowball click animation using JavaScript transforms
    * 
    * SNOWBALL CONFIGURATION GUIDE:
    * 
    * VISUAL CUSTOMIZATION:
    * - Size: Modify .click-snowball CSS width/height (currently: 30px)
    * - Color: Change .click-snowball background color (currently: #F8FAFC off-white)
    * - Border: Adjust border color and thickness (currently: 3px solid #E2E8F0)
    * - Glow: Modify box-shadow for different effects (currently: subtle off-white glow)
    * 
    * ANIMATION CUSTOMIZATION:
    * - Speed: Modify duration in animateSnowball() (currently: 2000ms = 2 seconds)
    * - Arc height: Adjust endY calculation (currently: -viewportHeight + 100)
    * - Horizontal drift: Change endX value (currently: 40px rightward drift)
    * - Easing: Modify easeOut function for different movement styles
    * 
    * SPAWN POSITIONING:
    * - Random spread: Adjust randomOffset multiplier (currently: * 400 = ±200px)
    * - For wider spread: Increase to * 600 = ±300px
    * - For tighter spread: Decrease to * 200 = ±100px
    * 
    * FUTURE ENHANCEMENTS:
    * - Multiple snowball types: Different colors/sizes for different upgrades
    * - Power-based variations: Stronger clicks = bigger/faster snowballs
    * - Assistant effects: Snowstorm = multiple snowballs, Hurricane = faster movement
    * - Location bonuses: Certain areas = special snowball effects
    * 
    * @param {number} clickX - X coordinate of the click
    */
   createClickSnowball(clickX) {
     // Create snowball element
     const snowball = document.createElement('div');
     snowball.className = 'click-snowball';
     
     // Ensure snowball is within viewport bounds
     const viewportWidth = window.innerWidth;
     const viewportHeight = window.innerHeight;
     const snowballWidth = 30;
     
     // Add random offset to click location for natural variation
     const randomOffset = (Math.random() - 0.5) * 400; // ±200px random offset
     let leftPosition = (clickX + randomOffset) - (snowballWidth / 2);
     
     // Clamp position to viewport bounds
     if (leftPosition < 0) leftPosition = 10;
     if (leftPosition > viewportWidth - snowballWidth) leftPosition = viewportWidth - snowballWidth - 10;
     
     // Position snowball at bottom of screen, horizontally centered on click
     snowball.style.left = leftPosition + 'px';
     snowball.style.bottom = '20px'; // Slightly above bottom edge
     
     // No text content needed - clean snowball appearance
     
     // Add to body
     document.body.appendChild(snowball);
     
     // JavaScript-based animation (more reliable than CSS keyframes)
     this.animateSnowball(snowball, viewportHeight);
   }

   /**
    * Animate snowball using JavaScript transforms
    * 
    * ANIMATION PARAMETERS (Easy to modify):
    * 
    * TIMING:
    * - duration: Total animation time in milliseconds (currently: 2000ms = 2 seconds)
    * - fadeStart: When opacity starts decreasing (currently: 80% through animation)
    * 
    * MOVEMENT:
    * - startY: Starting Y position (currently: 0 = bottom of screen)
    * - endY: Final Y position (currently: -viewportHeight + 100 = near top)
    * - startX: Starting X offset (currently: 0 = centered)
    * - endX: Final X offset (currently: 40px = slight rightward drift)
    * 
    * EASING:
    * - easeOut: Cubic easing function for natural movement
    * - Change to linear for constant speed, or quadratic for different feel
    * 
    * PERFORMANCE:
    * - Uses requestAnimationFrame for smooth 60fps animation
    * - GPU-accelerated transforms for optimal performance
    * - Automatic cleanup prevents memory leaks
    * 
    * @param {HTMLElement} snowball - The snowball element
    * @param {number} viewportHeight - Height of the viewport
    */
   animateSnowball(snowball, viewportHeight) {
     const startTime = Date.now();
     const duration = 2000; // 2 seconds
     const startY = 0; // Start at bottom
     const endY = -viewportHeight + 100; // End near top
     const startX = 0; // Start at center
     const endX = 40; // End with slight rightward drift
     
     const animate = () => {
       const elapsed = Date.now() - startTime;
       const progress = Math.min(elapsed / duration, 1);
       
       // Easing function for smooth movement
       const easeOut = 1 - Math.pow(1 - progress, 3);
       
       // Calculate current position
       const currentY = startY + (endY - startY) * easeOut;
       const currentX = startX + (endX - startX) * easeOut;
       
       // Apply transform
       snowball.style.transform = `translateY(${currentY}px) translateX(${currentX}px)`;
       
       // Fade out near the end
       if (progress > 0.8) {
         const fadeProgress = (progress - 0.8) / 0.2;
         snowball.style.opacity = 1 - fadeProgress;
       }
       
       // Continue animation or finish
       if (progress < 1) {
         requestAnimationFrame(animate);
       } else {
         // Animation complete, remove snowball
         if (snowball.parentNode) {
           snowball.remove();
         }
       }
     };
     
     // Start the animation
     requestAnimationFrame(animate);
   }
  /**
   * Create the game-ready layout
   */
  createGameReadyLayout() {
    // Remove existing UI if present
    const existingContainer = document.getElementById('game-ready-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    // Create main container
    const container = document.createElement('div');
    container.id = 'game-ready-container';
    container.className = 'game-ready-container';
    // Create banner
    const banner = document.createElement('div');
    banner.id = 'game-ready-banner';
    banner.className = 'game-ready-banner';
    banner.innerHTML = `
      <div class="banner-left">
        <span style="font-weight: bold; font-size: var(--font-size-L);">❄️ Snowball Frenzy</span>
      </div>
      <div class="banner-center">
        <span id="banner-status">Game Ready</span>
      </div>
      <div class="banner-right">
        <button class="primary-button" id="save-button">💾 Save</button>
        <div class="tooltip">
          <button class="secondary-button" id="jump-button">Jump</button>
          <span class="tooltiptext" id="jump-tooltip">Loading jump info...</span>
        </div>
        <button class="secondary-button" id="profile-button">Profile</button>
      </div>
    `;
    // Create content area
    const content = document.createElement('div');
    content.className = 'game-ready-content';
    // Create left column
    const leftColumn = document.createElement('div');
    leftColumn.id = 'game-ready-left-column';
    leftColumn.className = 'game-ready-left-column';
    // Create middle column
    const middleColumn = document.createElement('div');
    middleColumn.id = 'game-ready-middle-column';
    middleColumn.className = 'game-ready-middle-column';
    // Create right column
    const rightColumn = document.createElement('div');
    rightColumn.id = 'game-ready-right-column';
    rightColumn.className = 'game-ready-right-column';
    // Assemble layout
    content.appendChild(leftColumn);
    content.appendChild(middleColumn);
    content.appendChild(rightColumn);
    container.appendChild(banner);
    container.appendChild(content);
    // Replace existing content or append to body
    const existingOptimizedContainer = document.getElementById('optimized-ui-container');
    if (existingOptimizedContainer) {
      existingOptimizedContainer.replaceWith(container);
    } else {
      document.body.appendChild(container);
    }
    // Store references
    this.components.banner = banner;
    this.components.leftColumn = leftColumn;
    this.components.middleColumn = middleColumn;
    this.components.rightColumn = rightColumn;
            // console.log('[GAME_READY_UI] Layout created successfully');
  }

  /**
   * Set up tab system for left column
   */
  setupTabSystem() {
    const leftColumn = this.components.leftColumn;
    // Create tab system
    const tabSystem = document.createElement('div');
    tabSystem.className = 'tab-system';
    // Create tab buttons
    Object.values(TAB_CONFIG).forEach(tab => {
      const tabButton = document.createElement('button');
      tabButton.className = `tab-button${tab.default ? ' active' : ''}`;
      tabButton.innerHTML = `${tab.icon} ${tab.label}`;
      tabButton.onclick = () => this.switchTab(tab.id);
      tabSystem.appendChild(tabButton);
    });
    // Create tab content containers
    Object.values(TAB_CONFIG).forEach(tab => {
      const tabContent = document.createElement('div');
      tabContent.id = `tab-${tab.id}`;
      tabContent.className = `tab-content${tab.default ? ' active' : ''}`;
      // Add placeholder content
      if (tab.id === 'dashboard') {
        tabContent.innerHTML = this.createDashboardContent();
      } else if (tab.id === 'inventory') {
        tabContent.innerHTML = this.createInventoryContent();
      } else if (tab.id === 'achievements') {
        tabContent.innerHTML = this.createAchievementsContent();
      } else if (tab.id === 'lore') {
        tabContent.innerHTML = this.createLoreContent();
      } else if (tab.id === 'jump') {
        tabContent.innerHTML = this.createJumpContent();
      } else {
        tabContent.innerHTML = `<h3>${tab.label}</h3><p>Content for ${tab.label} tab will be implemented in Phase 2.</p>`;
      }
      leftColumn.appendChild(tabContent);
      this.tabContent.set(tab.id, tabContent);
    });
    leftColumn.insertBefore(tabSystem, leftColumn.firstChild);
    this.components.tabSystem = tabSystem;
  }

  /**
   * Switch to a different tab
   */
  switchTab(tabId) {
    // Update active tab
    this.activeTab = tabId;
    // Update tab buttons
    const tabButtons = this.components.tabSystem.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      button.classList.remove('active');
      if (button.textContent.includes(TAB_CONFIG[tabId].label)) {
        button.classList.add('active');
      }
    });
    // Update tab content
    this.tabContent.forEach((content, id) => {
      content.classList.remove('active');
      if (id === tabId) {
        content.classList.add('active');
      }
    });
    // Queue update for the active tab
    this.queueUpdate(`tab-${tabId}`, 5); // Secondary priority
    
    // Force immediate update for inventory tab
    if (tabId === 'inventory') {
      this.updateInventory();
    }
    // Force immediate update for jump tab
    if (tabId === 'jump') {
      this.updateJumpTab();
    }
    // Force immediate update for achievements tab
    if (tabId === 'achievements') {
      this.updateAchievements();
    }
  }

  /**
   * Create dashboard content with car dashboard styling
   */
  createDashboardContent() {
    return `
      <div class="dashboard-container">
        <div class="dashboard-header">
                  <h2>Dashboard</h2>
        </div>
        
        <!-- Battle info now uses travel container -->
        
        <div class="dashboard-grid">
          <!-- Wallet Block -->
          <div class="dashboard-block wallet-block">
            <div class="block-header">
              <span class="block-title">Wallet</span>
            </div>
            <div class="block-content">
              <div class="stat-row">
                <span class="stat-label">Snowballs:</span>
                <span class="stat-value" id="dashboard-snowballs">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Icicles:</span>
                <span class="stat-value" id="dashboard-icicles">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Snowflakes:</span>
                <span class="stat-value" id="dashboard-snowflakes">0</span>
              </div>
            </div>
          </div>

          <!-- SPS & Acceleration Block -->
          <div class="dashboard-block sps-block">
            <div class="block-header">
              <span class="block-title">Performance</span>
            </div>
            <div class="block-content">
              <div class="stat-row">
                <span class="stat-label">SPS:</span>
                <span class="stat-value" id="dashboard-sps">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Click Power:</span>
                <span class="stat-value" id="dashboard-click-power">+1</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Acceleration:</span>
                <span class="stat-value" id="dashboard-acceleration">0</span>
              </div>
            </div>
          </div>

          <!-- Click Streak Meter Block -->
          <div class="dashboard-block streak-block" id="streak-display">
            <div class="block-header">
              <span class="block-title">Click Streak</span>
            </div>
            <div class="block-content">
              <div class="streak-metrics">
                <div class="streak-row">
                  <span class="streak-label">Rate:</span>
                  <span class="streak-value" id="click-rate">0.0</span>
                  <span class="streak-unit">clicks/s</span>
                </div>
                <div class="streak-row">
                  <span class="streak-label">Duration:</span>
                  <span class="streak-value" id="streak-duration">0.0s</span>
                </div>
                <div class="streak-row">
                  <span class="streak-label">Bonus:</span>
                  <span class="streak-value" id="streak-bonus">1.0x</span>
                  <span class="streak-time" id="bonus-time">0s</span>
                </div>
                <div class="streak-row">
                  <span class="streak-label">Next:</span>
                  <span class="streak-value" id="next-tier">2x at 1s</span>
                </div>
              </div>
              <div class="streak-progress-container">
                <div class="streak-progress-bar">
                  <div class="streak-progress-fill" id="progress-bar" style="width: 0%"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Momentum Meter Block (Right of Click Streak) -->
          <div class="dashboard-block momentum-block">
            <div class="block-header">
              <span class="block-title">Momentum Meter</span>
            </div>
            <div class="block-content">
              <div id="momentum-meter-container">
                <div class="momentum-progress-container">
                  <div class="momentum-progress-bar">
                    <div class="momentum-progress-fill" id="momentum-progress-fill" style="width: 0%"></div>
                  </div>
                  <div class="momentum-progress-text" id="momentum-progress-text">0%</div>
                </div>
                <div class="momentum-actions">
                  <button id="travel-button" class="travel-button" onclick="window.onTravelButtonClick && window.onTravelButtonClick()" title="Wander among the Drifts&#10;&#10;Warning: Possibility to alert The Dissonant">
                    Drift Travel
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Buff Status Block (Left of Drift Travel) -->
          <div class="dashboard-block buff-status-block">
            <div class="block-header">
              <span class="block-title">Buff Status</span>
            </div>
            <div class="block-content">
              <div class="buff-status-grid">
                <div class="buff-row">
                  <span class="buff-label">Crystal Buff:</span>
                  <span class="buff-value" id="crystal-buff-status">None</span>
                  <span class="buff-timer" id="crystal-buff-timer"></span>
                </div>
                <div class="buff-row">
                  <span class="buff-label">Yeti Buff:</span>
                  <span class="buff-value" id="yeti-buff-status">None</span>
                  <span class="buff-timer" id="yeti-buff-timer"></span>
                </div>
                <div class="buff-row">
                  <span class="buff-label">Driftmark Buff:</span>
                  <span class="buff-value" id="location-buff-status">None</span>
                  <span class="buff-timer" id="location-buff-timer"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Travel Container Block (Right Half) -->
          <div class="dashboard-block travel-container-block">
            <div class="block-header">
                              <span class="block-title">Drift Travel</span>
            </div>
            <div class="block-content">
              <!-- Travel System Container for location buffs and battle info -->
              <div id="travel-container" class="travel-container">
                <!-- Will be populated by travel system and battle system -->
              </div>
            </div>
          </div>

          <!-- Source Block -->
          <div class="dashboard-block source-block">
            <div class="block-header">
              <span class="block-title">Production Sources</span>
            </div>
            <div class="block-content">
              <div class="source-table" id="dashboard-sources">
                <div class="table-header">
                  <span class="col-assistant">Kindred Assistant</span>
                  <span class="col-quantity">Qty</span>
                  <span class="col-sps">SPS</span>
                  <span class="col-percentage">% Total</span>
                </div>
                <div class="table-body" id="dashboard-sources-body">
                  <!-- Will be populated dynamically -->
                </div>
              </div>
            </div>
          </div>


        </div>
      </div>
    `;
  }

  /**
   * Create inventory content with logo-based display
   */
  createInventoryContent() {
    return `
      <div class="inventory-container">
        <div class="inventory-header">
          <h2>Inventory</h2>
        </div>
        
        <div class="inventory-grid">
          <!-- Top Row: Yetis Found and Yetis Battled (side by side) -->
          <div class="dashboard-block yetis-found-block">
            <div class="block-header">

              <span class="block-title">Yetis Found</span>
              <span class="block-tracker" id="yetis-tracker">0/4</span>
            </div>
            <div class="block-content">
              <div class="logo-grid" id="yetis-grid">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <div class="dashboard-block yetis-battled-block">
            <div class="block-header">
              <span class="block-title">Yetis Battled</span>
              <span class="block-tracker" id="evil-yetis-tracker">0/4</span>
            </div>
            <div class="block-content">
              <div class="logo-grid" id="evil-yetis-grid">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Locations Visited (full width) -->
          <div class="dashboard-block locations-block">
            <div class="block-header">
              <span class="block-title">Locations Visited</span>
              <span class="block-tracker" id="locations-tracker">0/8</span>
            </div>
            <div class="block-content">
              <div class="logo-grid" id="locations-grid">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Assistants (full width) -->
          <div class="dashboard-block assistants-block">
            <div class="block-header">
              <span class="block-title">Kindred Assistants</span>
              <span class="block-tracker" id="assistants-tracker">0/0</span>
            </div>
            <div class="block-content">
              <div class="assistants-grid" id="assistants-grid">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Ability Belt (full width) -->
          <div class="dashboard-block ability-belt-block">
            <div class="block-header">
              <span class="block-title">Ability Belt</span>
              <span class="block-tracker" id="ability-belt-tracker">0/4</span>
            </div>
            <div class="block-content">
              <div class="ability-belt-container">
                <!-- Current Loadout Display -->
                <div class="ability-slots" id="ability-slots">
                  <!-- Will be populated dynamically -->
                </div>
                
                <!-- Frozen Message (shown when belt is locked) -->
                <div class="ability-belt-frozen" id="ability-belt-frozen" style="display: none;">
                  <!-- Will be populated dynamically -->
                </div>
                
                <!-- Ability Selection Interface -->
                <div class="ability-selection" id="ability-selection">
                  <!-- Will be populated dynamically -->
                </div>
              </div>
            </div>
          </div>

          <!-- Upgrades (full width) -->
          <div class="dashboard-block upgrades-block">
            <div class="block-header">
              <span class="block-title">Upgrades</span>
              <span class="block-tracker" id="upgrades-tracker">0/0</span>
            </div>
            <div class="block-content">
              <div class="upgrades-container">
                <!-- Boost Upgrades -->
                <div class="upgrade-category">
                  <div class="category-header">
                    <span class="category-title">Boost</span>
                    <span class="category-tracker" id="boost-tracker">0/0</span>
                  </div>
                  <div class="logo-grid small-logos" id="boost-grid">
                    <!-- Will be populated dynamically -->
                  </div>
                </div>



                <!-- Yeti Jr Upgrades -->
                <div class="upgrade-category">
                  <div class="category-header">
                    <span class="category-title">Yeti Jr</span>
                    <span class="category-tracker" id="yeti-jr-tracker">0/0</span>
                  </div>
                  <div class="logo-grid small-logos" id="yeti-jr-grid">
                    <!-- Will be populated dynamically -->
                  </div>
                </div>

                <!-- Click Multiplier Upgrades -->
                <div class="upgrade-category">
                  <div class="category-header">
                    <span class="category-title">Click Multipliers</span>
                    <span class="category-tracker" id="click-multiplier-tracker">0/0</span>
                  </div>
                  <div class="logo-grid small-logos" id="click-multiplier-grid">
                    <!-- Will be populated dynamically -->
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create achievements content with category-based organization
   */
  createAchievementsContent() {
    return `
      <div class="achievements-container">
        <div class="achievements-header">
          <h2>Achievements</h2>
        </div>
        
        <div class="achievements-sections">
          <!-- Clicks Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Clicks</span>
              <span class="category-tracker" id="clicks-tracker">0/4</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="clicks-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Economy Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Economy</span>
              <span class="category-tracker" id="economy-tracker">0/3</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="economy-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Assistants Category -->
          <div class="achievement-category">
            <div class="category-header">
                              <span class="category-title">Kindred Assistants</span>
              <span class="category-tracker" id="assistants-tracker">0/3</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="assistants-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Upgrades Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Upgrades</span>
              <span class="category-tracker" id="upgrades-tracker">0/3</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="upgrades-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Jumps Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Jumps</span>
              <span class="category-tracker" id="jumps-tracker">0/3</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="jumps-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Time Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Time</span>
              <span class="category-tracker" id="time-tracker">0/3</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="time-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Streaks Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Streaks</span>
              <span class="category-tracker" id="streaks-tracker">0/6</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="streaks-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Abilities Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Abilities</span>
              <span class="category-tracker" id="abilities-tracker">0/6</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="abilities-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Yetis Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Yetis</span>
              <span class="category-tracker" id="yetis-tracker">0/5</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="yetis-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Locations Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Locations</span>
              <span class="category-tracker" id="locations-tracker">0/5</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="locations-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Icicles Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Icicles</span>
              <span class="category-tracker" id="icicles-tracker">0/5</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="icicles-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Battles Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Battles</span>
              <span class="category-tracker" id="battles-tracker">0/5</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="battles-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- SPS Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-icon">⚡</span>
              <span class="category-title">SPS</span>
              <span class="category-tracker" id="sps-tracker">0/5</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="sps-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Crystal Snowballs Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Crystal Snowballs</span>
              <span class="category-tracker" id="crystalSnowballs-tracker">0/5</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="crystalSnowballs-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Snowflakes Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Snowflakes</span>
              <span class="category-tracker" id="snowflakes-tracker">0/5</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="snowflakes-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Snowflake Tree Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Snowflake Tree</span>
              <span class="category-tracker" id="snowflakeTree-tracker">0/5</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="snowflakeTree-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>

          <!-- Baby Yeti Category -->
          <div class="achievement-category">
            <div class="category-header">
              <span class="category-title">Baby Yeti</span>
              <span class="category-tracker" id="babyYeti-tracker">0/5</span>
            </div>
            <div class="category-content">
              <div class="achievement-grid" id="babyYeti-achievements">
                <!-- Will be populated dynamically -->
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  /**
   * Create lore content with category-based organization
   */
  createLoreContent() {
    return `
      <div class="lore-container">
        <div class="lore-header">
          <h2>Lore</h2>
          <div class="lore-progress">
            <div class="progress-bar">
              <div class="progress-fill" id="lore-progress-fill"></div>
            </div>
            <span class="progress-text" id="lore-progress-text">0/0</span>
          </div>
        </div>
        
        <div class="lore-books" id="lore-books">
          <!-- Will be populated dynamically with book/chapter structure -->
        </div>
      </div>
      
      <!-- Lore Modal for viewing full entries -->
      <div id="lore-modal" class="lore-modal">
        <div class="lore-modal-content">
          <div class="lore-modal-header">
            <img id="lore-modal-icon" src="" alt="Lore Icon" class="lore-modal-icon">
            <h3 id="lore-modal-title"></h3>
            <button class="lore-modal-close" onclick="window.gameReadyUI.closeLoreModal()">×</button>
          </div>
          <div class="lore-modal-body">
            <p id="lore-modal-content"></p>
          </div>
          <div class="lore-modal-footer">
            <span id="lore-modal-timestamp"></span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Create analog summary content with past analogs grid
   */
  createJumpContent() {
    return `
      <div class="analog-summary-container">
        <div class="analog-summary-header">
          <h2>Echoes</h2>
          <div class="analog-summary-subtitle">Jump History</div>
        </div>
        
        <!-- Current Analog Status -->
        <div class="current-analog-status" id="current-analog-status">
          <div class="status-block">
            <div class="status-header">
              <span class="status-title">Current Echo</span>
            </div>
            <div class="status-content">
              <div class="stat-row">
                <span class="stat-label">Echo Number:</span>
                <span class="stat-value" id="current-analog-number">1</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Current Snowballs:</span>
                <span class="stat-value" id="current-analog-snowballs">0</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Current SPS:</span>
                <span class="stat-value" id="current-analog-sps">0</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Past Analogs Grid -->
        <div class="past-analogs-section">
          <div class="section-header">
            <h3>Past Echoes</h3>
            <div class="section-subtitle">Echo History</div>
          </div>
          
          <div class="analogs-grid" id="analogs-grid">
            <!-- Will be populated dynamically -->
          </div>
          
          <div class="no-analogs-message" id="no-analogs-message" style="display: none;">
            <div class="empty-state">
              <h4>No Past Echoes</h4>
              <p>Complete your first jump to see your Echo history.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initialize UI components (placeholders for now)
   */
  initializeComponents() {
    // Initialize middle column
    this.initializeMiddleColumn();
    // Initialize right column
    this.initializeRightColumn();
  }

  /**
   * Initialize notification panels
   */
  initializeNotificationPanels() {
    // Load notification panel components
    const centralPanelScript = document.createElement('script');
    centralPanelScript.src = './ui/components/CentralNotificationPanel.js';
    centralPanelScript.onload = () => {
              // console.log('[NOTIFICATION_PANELS] Central panel loaded successfully');
      this.centralNotificationPanel = new window.CentralNotificationPanel();
      window.centralNotificationPanel = this.centralNotificationPanel;
    };
    centralPanelScript.onerror = () => {
      console.error('[NOTIFICATION_PANELS] Failed to load CentralNotificationPanel.js');
    };
    document.head.appendChild(centralPanelScript);

    const concordPanelScript = document.createElement('script');
    concordPanelScript.src = './ui/components/ConcordActivityPanel.js';
    concordPanelScript.onload = () => {
              // console.log('[NOTIFICATION_PANELS] Concord panel loaded successfully');
      this.concordActivityPanel = new window.ConcordActivityPanel();
      window.concordActivityPanel = this.concordActivityPanel;
    };
    concordPanelScript.onerror = () => {
      console.error('[NOTIFICATION_PANELS] Failed to load ConcordActivityPanel.js');
    };
    document.head.appendChild(concordPanelScript);
  }

  /**
   * Initialize the middle column with interactive elements
   */
  initializeMiddleColumn() {
    const middleColumn = this.components.middleColumn;
    if (!middleColumn) return;

    // Create container
    const container = document.createElement('div');
    container.className = 'middle-column-container';

    // Create mini wallet
    const miniWallet = document.createElement('div');
    miniWallet.className = 'mini-wallet';
    miniWallet.innerHTML = `
      <div class="mini-wallet-snowballs" id="mini-wallet-snowballs">
        <div class="mini-wallet-label">snowballs</div>
        <div class="mini-wallet-number" id="mini-wallet-number">0</div>
      </div>
      <div class="mini-wallet-sps" id="mini-wallet-sps">0 per second</div>
      <div class="mini-wallet-click-power" id="mini-wallet-click-power">Click: +1</div>
    `;

    // Create snowman click target
    const snowmanTarget = document.createElement('div');
    snowmanTarget.className = 'snowman-click-target';
    snowmanTarget.onclick = (e) => this.handleSnowmanClick(e);

    // Create spawn area
    const spawnArea = document.createElement('div');
    spawnArea.className = 'spawn-area';
    spawnArea.id = 'spawn-area';

    // Assemble middle column
    container.appendChild(miniWallet);
    container.appendChild(snowmanTarget);
    container.appendChild(spawnArea);
    middleColumn.appendChild(container);

    // Store references
    this.components.miniWallet = miniWallet;
    this.components.snowmanTarget = snowmanTarget;
    this.components.spawnArea = spawnArea;

            // console.log('[MIDDLE_COLUMN] Middle column initialized');
  }

  /**
   * Initialize the right column with upgrades and assistants
   */
  initializeRightColumn() {
    const rightColumn = this.components.rightColumn;
    if (!rightColumn) return;

    // Create container
    const container = document.createElement('div');
    container.className = 'right-column-container';

    // Create upgrades section
    const upgradesSection = document.createElement('div');
    upgradesSection.className = 'upgrades-section';
    upgradesSection.innerHTML = `
      <div class="section-title">Upgrades</div>
      <div class="upgrades-grid" id="upgrades-grid">
        <!-- Will be populated dynamically -->
      </div>
    `;



    // Create assistants section
    const assistantsSection = document.createElement('div');
    assistantsSection.className = 'assistants-section';
    assistantsSection.innerHTML = `
                    <div class="section-title">Kindred Assistants</div>
      <div id="assistants-container">
        <!-- Will be populated dynamically -->
      </div>
    `;

    // Assemble right column
    container.appendChild(upgradesSection);
    container.appendChild(assistantsSection);
    rightColumn.appendChild(container);

    // Store references
    this.components.upgradesGrid = upgradesSection.querySelector('#upgrades-grid');
    this.components.assistantsContainer = assistantsSection.querySelector('#assistants-container');

            // console.log('[RIGHT_COLUMN] Right column initialized');
  }

  /**
   * Handle snowman click for snowball generation
   * Integrates with the full click power system including streaks and multipliers
   */
  async handleSnowmanClick(event) {
    if (!this.game) return;

    // Get click position relative to the middle column for better feedback placement
    const middleColumn = this.components.middleColumn;
    if (!middleColumn) return;
    
    const rect = middleColumn.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    try {
      // Update click streak system first (if available)
      if (this.game.loops?.active?.clicking?.streakSystem) {
        const { updateClickStreak } = await import('../loops/active/clickStreak.js');
        updateClickStreak(this.game);
      }

      // Calculate effective click power with all multipliers
      const basePower = this.game.spc || 1;
      const finalClickPower = this.calculateClickPower();

      // Add snowballs using the game's proper method
      if (this.game.addSnowballs) {
        this.game.addSnowballs(finalClickPower, 'click');
      } else {
        // Fallback to direct addition
        this.game.snowballs += finalClickPower;
      }

      // Record click in game state
      if (this.game.recordClick) {
        this.game.recordClick(finalClickPower);
      }

      // Emit click event for other systems
      if (window.eventBus) {
        window.eventBus.emit('snowballClicked', {
          amount: finalClickPower,
          basePower: basePower,
          streakMultiplier: finalClickPower / basePower,
          source: 'click',
          totalSnowballs: this.game.snowballs
        });
      }

      // Record click for achievements
      if (window.recordClick) {
        window.recordClick(this.game);
      }

      // Show click feedback with actual click power
      this.showClickFeedback(x, y, `+${finalClickPower}`);

      // Create snowball click animation
      this.createClickSnowball(event.clientX);

      // Queue updates for UI refresh
      this.queueUpdate('all', 1); // Critical priority
      this.queueUpdate('dashboard', 1); // Critical priority
      this.queueUpdate('miniWallet', 1); // Critical priority
      this.updateMiniWallet(); // Immediate update to ensure synchronization

        // console.log('[CLICK_INTEGRATION] Click processed:', {
        //   basePower,
        //   finalClickPower,
        //   totalSnowballs: this.game.snowballs
        // });

    } catch (error) {
      console.error('[CLICK_INTEGRATION] Error processing click:', error);
      
      // Fallback to basic click
      const fallbackPower = this.game.spc || 1;
      this.game.snowballs += fallbackPower;
      this.showClickFeedback(x, y, `+${fallbackPower}`);
      
      // Create snowball click animation for fallback clicks too
      this.createClickSnowball(event.clientX);
      
      this.queueUpdate('all', 1);
      this.updateMiniWallet(); // Immediate update to ensure synchronization
    }
  }

  /**
   * Show click feedback animation
   */
  showClickFeedback(x, y, text) {
    const middleColumn = this.components.middleColumn;
    if (!middleColumn) return;

    const feedback = document.createElement('div');
    feedback.className = 'click-feedback';
    feedback.textContent = text;
    
    // Position feedback relative to the middle column
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    feedback.style.zIndex = '9999'; // Ensure it's on top of everything

    middleColumn.appendChild(feedback);

    // Remove after animation
    setTimeout(() => {
      if (feedback.parentNode) {
        feedback.parentNode.removeChild(feedback);
      }
    }, 1000);
  }

  /**
   * Calculate current click power with all multipliers
   * @returns {number} The final click power value
   */
  calculateClickPower() {
    if (!this.game) return 1;

    const basePower = this.game.spc || 1;
    let effectiveMultiplier = 1;

    // Get click multiplier from game state
    if (this.game.clickMultiplier) {
      effectiveMultiplier *= this.game.clickMultiplier;
    }

    // Get streak multiplier if available
    if (this.game.loops?.active?.clicking?.streakSystem?.activeBonus?.multiplier) {
      effectiveMultiplier *= this.game.loops.active.clicking.streakSystem.activeBonus.multiplier;
    }

    // Get player level multiplier (10^playerLevel)
    if (this.game.playerLevel) {
      const playerLevelMultiplier = Math.pow(10, this.game.playerLevel);
      effectiveMultiplier *= playerLevelMultiplier;
    }

    // Get crystal snowball multiplier
    if (this.game.crystalSnowballManager) {
      const crystalMultiplier = this.game.crystalSnowballManager.getCrystalSnowballMultiplier();
      effectiveMultiplier *= crystalMultiplier;
    }

    return Math.floor(basePower * effectiveMultiplier);
  }

  /**
   * Calculate SPS acceleration over the last 5 seconds
   * @returns {number} The acceleration value in SPS per second squared
   */
  calculateAcceleration() {
    if (!this.game || !this.game.spsHistory || this.game.spsHistory.length < 2) {
      return 0;
    }

    const history = this.game.spsHistory;
    const fiveSecondsAgo = this.game.getGameTime ? this.game.getGameTime() - 5000 : Date.now() - 5000;
    const recentPoint = history[history.length - 1];
    const pastPoint = history.find(p => p.time >= fiveSecondsAgo) || history[0];
    
    const spsChange = recentPoint.sps - pastPoint.sps;
    const timeChange = (recentPoint.time - pastPoint.time) / 1000; // in seconds

    return timeChange > 0 ? (spsChange / timeChange) : 0;
  }

  /**
   * Update mini wallet display
   */
  updateMiniWallet() {
    const snowballNumberEl = document.getElementById('mini-wallet-number');
    const spsEl = document.getElementById('mini-wallet-sps');
    const clickPowerEl = document.getElementById('mini-wallet-click-power');

    if (snowballNumberEl && this.game) {
      const snowballs = this.game.snowballs || 0;
      snowballNumberEl.textContent = formatSnowballs(snowballs);
    }

    if (spsEl && this.game) {
      // Get SPS from game state - this is the calculated SPS value
      const sps = this.game.sps || 0;
      spsEl.textContent = `${formatSPS(sps)}`;
    }

    if (clickPowerEl && this.game) {
      const finalClickPower = this.calculateClickPower();
      clickPowerEl.textContent = `Click: +${formatSnowballs(finalClickPower)}`;
    }
  }

  /**
   * Spawn a crystal snowball in the middle column
   */
  // Crystal snowball spawning is now handled by CrystalSnowballManager
  // This method is kept for compatibility but delegates to the manager
  spawnCrystalSnowball() {
    if (this.game && this.game.crystalSnowballManager) {
      this.game.crystalSnowballManager.spawnCrystalSnowball();
    }
  }

  /**
   * Handle crystal snowball click
   */
  handleCrystalSnowballClick(crystal) {
    if (!this.game || !this.game.crystalSnowballManager) return;

    // Get click position for feedback
    const rect = crystal.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Show feedback
    this.showClickFeedback(x, y, 'BOOST!');

    // console.log('[CRYSTAL_SNOWBALL] Boost applied');
  }

  /**
   * Update dashboard with current game data
   */
  async updateDashboard() {
    if (!this.game || this.activeTab !== 'dashboard') return;

    try {
      // Update wallet stats
      this.updateDashboardWallet();
      // Update SPS and acceleration
      this.updateDashboardPerformance();
      // Update sources table
      this.updateDashboardSources();
      // Update momentum meter
      this.updateMomentumMeter();
      // Update travel container
      this.updateTravelContainer();
      // Update buff status
      this.updateBuffStatus();
      // Update streak meter
      await this.updateStreakMeter();
      // Update jump tooltip
      await this.updateJumpTooltip();
    } catch (error) {
      console.error('[DASHBOARD] Update error:', error);
    }
  }

  /**
   * Update wallet block with current currency values
   */
  updateDashboardWallet() {
    const snowballsEl = document.getElementById('dashboard-snowballs');
    const iciclesEl = document.getElementById('dashboard-icicles');
    const snowflakesEl = document.getElementById('dashboard-snowflakes');

    if (snowballsEl && this.game) {
      snowballsEl.textContent = formatSnowballs(this.game.snowballs || 0);
    }
    if (iciclesEl && this.game) {
      iciclesEl.textContent = formatAssistants(this.game.icicles || 0);
    }
    if (snowflakesEl && this.game) {
      snowflakesEl.textContent = formatSnowballs(this.game.snowflakes || 0);
    }
    
    // Ensure mini wallet stays synchronized
    this.updateMiniWallet();
  }

  /**
   * Update performance block with SPS, click power, and acceleration
   */
  updateDashboardPerformance() {
    const spsEl = document.getElementById('dashboard-sps');
    const clickPowerEl = document.getElementById('dashboard-click-power');
    const accelerationEl = document.getElementById('dashboard-acceleration');

    if (spsEl && this.game) {
      // Get SPS from game state - this is the calculated SPS value
      const currentSPS = this.game.sps || 0;
      spsEl.textContent = formatSPS(currentSPS);
    }

    if (clickPowerEl && this.game) {
      const finalClickPower = this.calculateClickPower();
      clickPowerEl.textContent = `+${formatSnowballs(finalClickPower)}`;
    }

    if (accelerationEl && this.game) {
      // Calculate acceleration using the game's SPS history
      const acceleration = this.calculateAcceleration();
      accelerationEl.textContent = formatAcceleration(acceleration);
    }
  }

  /**
   * Update sources table with assistant data
   */
  updateDashboardSources() {
    const sourcesBody = document.getElementById('dashboard-sources-body');
    if (!sourcesBody || !this.game) return;

    // Import assistant definitions
    const ASSISTANTS = [
      { id: 'additionalArm', name: 'Additional Arm', sps: 1 },
      { id: 'neighborKids', name: 'Neighbor Kids', sps: 2 },
      { id: 'ballMachine', name: 'Ball Machine', sps: 5 },
      { id: 'polarBearFamily', name: 'Polar Bear Family', sps: 12 },
      { id: 'snowBlower', name: 'Snow Blower', sps: 60 },
      { id: 'hockeyTeam', name: 'Hockey Team', sps: 300 },
      { id: 'iglooArsenal', name: 'Igloo Arsenal', sps: 1500 },
      { id: 'golfingRange', name: 'Golfing Range', sps: 8000 },
      { id: 'snowstorm', name: 'Snowstorm', sps: 40000 },
      { id: 'snowPrincess', name: 'Snow Princess', sps: 200000 },
      { id: 'winterFortress', name: 'Winter Fortress', sps: 1000000 },
      { id: 'wizardBlizzard', name: 'Wizard Blizzard', sps: 5000000 },
      { id: 'avalanche', name: 'Avalanche', sps: 25000000 },
      { id: 'snowHurricane', name: 'Snow Hurricane', sps: 125000000 },
      { id: 'iceDragon', name: 'Ice Dragon', sps: 625000000 },
      { id: 'frostGiant', name: 'Frost Giant', sps: 3000000000 },
      { id: 'orbitalSnowCannon', name: 'Orbital Snow Cannon', sps: 15000000000 },
      { id: 'templeofWinter', name: 'Temple of Winter', sps: 80000000000 },
      { id: 'cryoCore', name: 'Cryo Core', sps: 400000000000 },
      { id: 'snowSingularity', name: 'Snow Singularity', sps: 2000000000000 }
    ];

    // Get assistant data from game state
    const assistants = this.game.assistants || {};
    const spsByAssistant = this.game._spsByAssistant || {};
    const totalSPS = this.game.sps || 0;

    // Filter assistants that are owned
    const ownedAssistants = ASSISTANTS.filter(assistant => {
      const count = assistants[assistant.id] || 0;
      return count > 0;
    });

    if (ownedAssistants.length === 0) {
      sourcesBody.innerHTML = '<div class="placeholder-row"><span>No kindred assistants purchased</span></div>';
      return;
    }

    let sourcesHTML = '';
    ownedAssistants.forEach(assistant => {
      const count = assistants[assistant.id] || 0;
      const actualSPS = spsByAssistant[assistant.id] || 0;
      const percentage = totalSPS > 0 ? formatPercentage(actualSPS, totalSPS) : '0.00%';
      
      sourcesHTML += `
        <div class="table-row">
          <span class="col-assistant">${assistant.name}</span>
          <span class="col-quantity">${formatAssistants(count)}</span>
          <span class="col-sps">${formatSPS(actualSPS)}</span>
          <span class="col-percentage">${percentage}</span>
        </div>
      `;
    });

    sourcesBody.innerHTML = sourcesHTML;
  }

  /**
   * Update the momentum meter display
   */
  updateMomentumMeter() {
    if (!this.game) return;

    try {
      // Get travel button status from travel system
      const travelStatus = window.getTravelButtonStatus ? window.getTravelButtonStatus() : null;
      
      if (!travelStatus) {
        // Fallback if travel system not available
        this.updateMomentumMeterFallback();
        return;
      }

      const progressFill = document.getElementById('momentum-progress-fill');
      const progressText = document.getElementById('momentum-progress-text');
      const travelButton = document.getElementById('travel-button');

      if (!progressFill || !progressText || !travelButton) {
        return;
      }

      // Update progress bar
      const progressPercentage = travelStatus.progressPercentage ? parseFloat(travelStatus.progressPercentage) : 0;
      progressFill.style.width = `${progressPercentage}%`;
      progressText.textContent = `${progressPercentage}%`;

      // Update travel button state
      // console.log('[MOMENTUM_METER] Travel button unlocked:', travelStatus.unlocked);
      if (travelStatus.unlocked) {
        // Travel button is ready - green and clickable
                  // console.log('[MOMENTUM_METER] Enabling travel button');
        travelButton.classList.remove('disabled');
        travelButton.disabled = false;
        progressFill.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
        
        // Only update button text and title if they've changed
        if (travelButton.textContent !== 'Drift Travel') {
          travelButton.textContent = 'Drift Travel';
        }
        if (travelButton.title !== 'Wander among the Drifts\n\nWarning: Possibility to alert The Dissonant') {
          travelButton.title = 'Wander among the Drifts\n\nWarning: Possibility to alert The Dissonant';
        }
      } else {
        // Travel button is not ready - gray and disabled
        travelButton.classList.add('disabled');
        travelButton.disabled = true;
        progressFill.style.background = 'linear-gradient(135deg, var(--color-primary-accent) 0%, var(--color-hover-accent) 100%)';
        
        // Update button text to show progress
        const estimatedTime = travelStatus.estimatedTimeToUnlock || Infinity;
        let timeText = '';
        if (estimatedTime === Infinity) {
          timeText = 'Increase activity';
        } else if (estimatedTime > 3600) {
          timeText = `~${Math.floor(estimatedTime / 3600)}h ${Math.floor((estimatedTime % 3600) / 60)}m`;
        } else if (estimatedTime > 60) {
          timeText = `~${Math.floor(estimatedTime / 60)}m ${estimatedTime % 60}s`;
        } else {
          timeText = `~${estimatedTime}s`;
        }
        
        // Only update button text and title if they've changed
        if (travelButton.textContent !== timeText) {
          travelButton.textContent = timeText;
        }
        const newTitle = `Current momentum: ${travelStatus.currentMomentum ? travelStatus.currentMomentum.toFixed(1) : '0.0'}/10 - Stay active to progress faster!`;
        if (travelButton.title !== newTitle) {
          travelButton.title = newTitle;
        }
      }

    } catch (error) {
      // console.error('[MOMENTUM_METER] Update error:', error);
      this.updateMomentumMeterFallback();
    }
  }

  /**
   * Fallback momentum meter display when travel system is not available
   */
  updateMomentumMeterFallback() {
    // DISABLED: This function is replaced by the simple activity counter system
    // The simple system directly updates the UI elements and prevents interference
    return;
    
    // OLD CODE BELOW - DISABLED
    /*
    const progressFill = document.getElementById('momentum-progress-fill');
    const progressText = document.getElementById('momentum-progress-text');
    const travelButton = document.getElementById('travel-button');

    if (progressFill) progressFill.style.width = '0%';
    if (progressText) progressText.textContent = '0%';
    if (travelButton) {
      travelButton.classList.add('disabled');
      travelButton.disabled = true;
    }
    */
  }

  /**
   * Update the travel container with location buff information
   */
  updateTravelContainer() {
    if (!this.game) return;

    try {
      // Get current location buff
      const locationBuff = window.getCurrentLocationBuff ? window.getCurrentLocationBuff() : null;
      const travelContainer = document.getElementById('travel-container');
      
      if (!travelContainer) {
        return;
      }

      if (locationBuff) {
        // Check if there's an active battle - battles take priority
        if (this.game && this.game.battles && this.game.battles.currentEvilYeti) {
          // Battle is active, don't show location buff
          return;
        }
        
        // Show active location buff
        const remainingTime = window.getLocationBuffRemainingTime ? window.getLocationBuffRemainingTime() : 0;
        
        travelContainer.innerHTML = `
          <div class="travel-status location-active">
            <div class="location-buff-info">
              <h3>${locationBuff.name}</h3>
              <p class="location-description">${locationBuff.description}</p>
              <p><strong>Class:</strong> ${locationBuff.class}</p>
              <p><strong>Bonus:</strong> ${this.formatLocationBonus(locationBuff.passiveBonus)}</p>
            </div>
          </div>
        `;
      } else {
        // No location buff active - but check if there's a battle active
        if (this.game && this.game.battles && this.game.battles.currentEvilYeti) {
          // Battle is active, don't clear the container
          return;
        }
        // No location buff and no battle - clear the container
        travelContainer.innerHTML = '';
      }

    } catch (error) {
      console.error('[TRAVEL_CONTAINER] Update error:', error);
    }
  }

  /**
   * Format location bonus for display
   */
  formatLocationBonus(passiveBonus) {
    if (!passiveBonus) return 'None';
    
    const value = (passiveBonus.value * 100).toFixed(0);
    
    switch (passiveBonus.effectType) {
      case 'discountGlobalUpgrades':
        return `${value}% Global Upgrade Discount`;
      case 'discountAssistants':
        return `${value}% Assistant Discount`;
      case 'snowballRate':
        return `+${value}% Snowball Rate`;
      case 'discountBoosts':
        return `${value}% Boost Discount`;
      default:
        return `${passiveBonus.effectType}: +${value}%`;
    }
  }
  /**
   * Update buff status display with current active buffs and countdown timers
   */
  updateBuffStatus() {
    if (!this.game) return;

    try {
      // Update Crystal Buff
      this.updateCrystalBuffStatus();
      
      // Update Yeti Buff
      this.updateYetiBuffStatus();
      
      // Update Location Buff
      this.updateLocationBuffStatus();
      
    } catch (error) {
      console.error('[BUFF_STATUS] Update error:', error);
    }
  }

  /**
   * Update crystal buff status and timer
   */
  updateCrystalBuffStatus() {
    const statusEl = document.getElementById('crystal-buff-status');
    const timerEl = document.getElementById('crystal-buff-timer');
    
    if (!statusEl || !timerEl || !this.game.crystalSnowballManager) {
      if (statusEl) statusEl.textContent = 'None';
      if (timerEl) timerEl.textContent = '';
      return;
    }

    const activeBoosts = this.game.crystalSnowballManager.activeBoosts;
    
    if (activeBoosts.size === 0) {
      statusEl.textContent = 'None';
      timerEl.textContent = '';
      return;
    }

    // Get the highest priority boost (highest multiplier)
    let highestBoost = null;
    for (const boost of activeBoosts.values()) {
      if (!highestBoost || boost.multiplier > highestBoost.multiplier) {
        highestBoost = boost;
      }
    }

    if (highestBoost) {
      const multiplier = highestBoost.multiplier;
      const remainingTime = Math.max(0, Math.ceil((highestBoost.endTime - Date.now()) / 1000));
      
      statusEl.textContent = `${multiplier}x`;
      timerEl.textContent = `${remainingTime}s`;
      
      // Color coding for urgency
      if (remainingTime <= 10) {
        timerEl.style.color = '#ef4444'; // Red for urgent
      } else if (remainingTime <= 30) {
        timerEl.style.color = '#f59e0b'; // Orange for warning
      } else {
        timerEl.style.color = 'var(--color-primary-accent)'; // Default blue
      }
    }
  }

  /**
   * Update yeti buff status and timer
   */
  updateYetiBuffStatus() {
    const statusEl = document.getElementById('yeti-buff-status');
    const timerEl = document.getElementById('yeti-buff-timer');
    
    if (!statusEl || !timerEl) return;

    const yetiBuff = this.game.currentYetiBuff;
    
    if (!yetiBuff) {
      statusEl.textContent = 'None';
      timerEl.textContent = '';
      return;
    }

    const yetiClass = yetiBuff.class;
    const remainingTime = Math.max(0, Math.ceil((yetiBuff.duration - (Date.now() - yetiBuff.startTime)) / 1000));
    
    statusEl.textContent = yetiClass;
    timerEl.textContent = `${remainingTime}s`;
    
    // Color coding for urgency
    if (remainingTime <= 10) {
      timerEl.style.color = '#ef4444'; // Red for urgent
    } else if (remainingTime <= 30) {
      timerEl.style.color = '#f59e0b'; // Orange for warning
    } else {
      timerEl.style.color = 'var(--color-primary-accent)'; // Default blue
    }
  }

  /**
   * Update location buff status and timer
   */
  updateLocationBuffStatus() {
    const statusEl = document.getElementById('location-buff-status');
    const timerEl = document.getElementById('location-buff-timer');
    
    if (!statusEl || !timerEl) return;

    const locationBuff = window.getCurrentLocationBuff ? window.getCurrentLocationBuff() : null;
    
    if (!locationBuff) {
      statusEl.textContent = 'None';
      timerEl.textContent = '';
      return;
    }

    const locationClass = locationBuff.class;
    const remainingTime = window.getLocationBuffRemainingTime ? window.getLocationBuffRemainingTime() : 0;
    
    statusEl.textContent = locationClass;
    timerEl.textContent = `${remainingTime}s`;
    
    // Color coding for urgency
    if (remainingTime <= 10) {
      timerEl.style.color = '#ef4444'; // Red for urgent
    } else if (remainingTime <= 30) {
      timerEl.style.color = '#f59e0b'; // Orange for warning
    } else {
      timerEl.style.color = 'var(--color-primary-accent)'; // Default blue
    }
  }

  /**
   * Start timer for frequent buff status updates
   */
  startBuffStatusTimer() {
    // Update buff status every second for accurate countdown timers
    setInterval(() => {
      if (this.activeTab === 'dashboard') {
        this.updateBuffStatus();
      }
    }, 1000); // 1 second interval
    
            // console.log('[BUFF_STATUS] Timer started for frequent countdown updates');
  }

  /**
   * Start timer for periodic achievement updates
   */
  startAchievementUpdateTimer() {
    // Update achievements every 5 seconds to keep them current
    setInterval(() => {
      if (this.activeTab === 'achievements') {
        this.updateAchievements();
      }
    }, 5000); // 5 second interval
    
            // console.log('[ACHIEVEMENTS] Timer started for periodic updates');
  }

  /**
   * Update the click streak meter display
   */
  async updateStreakMeter() {
    if (!this.game) return;

    try {
      // Import streak functions
      const { getStreakStatus } = await import('../loops/active/clickStreak.js');
      const status = getStreakStatus(this.game);
      
      // Update click rate
      const rateElement = document.getElementById('click-rate');
      if (rateElement) {
        rateElement.textContent = status.currentRate.toFixed(1);
      }
      
      // Update streak duration
      const durationElement = document.getElementById('streak-duration');
      if (durationElement) {
        durationElement.textContent = status.duration.toFixed(1) + 's';
      }
      
      // Update active bonus
      const bonusElement = document.getElementById('streak-bonus');
      if (bonusElement) {
        bonusElement.textContent = status.activeBonus.multiplier.toFixed(1) + 'x';
        
        // Color coding for bonus
        if (status.activeBonus.multiplier > 1) {
          bonusElement.classList.add('bonus-active');
          bonusElement.classList.remove('active');
        } else {
          bonusElement.classList.remove('bonus-active', 'active');
        }
      }
      
      // Update bonus time remaining
      const bonusTimeElement = document.getElementById('bonus-time');
      if (bonusTimeElement) {
        bonusTimeElement.textContent = Math.ceil(status.activeBonus.timeRemaining) + 's';
      }
      
      // Update next tier information
      const nextTierElement = document.getElementById('next-tier');
      if (nextTierElement) {
        if (status.nextTier) {
          nextTierElement.textContent = `${status.nextTier.multiplier}x at ${status.nextTier.duration}s`;
        } else if (status.isActive) {
          nextTierElement.textContent = 'Max tier reached!';
        } else {
          nextTierElement.textContent = '2x at 1s';
        }
      }
      
      // Update progress bar
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) {
        let progress = 0;
        
        if (status.nextTier) {
          progress = Math.min(100, status.nextTier.progress * 100);
        } else if (status.isActive) {
          // Max tier reached - show 100%
          progress = 100;
        } else {
          // No streak active - show 0% progress toward first tier
          progress = 0;
        }
        
        progressBar.style.width = progress + '%';
        
        // Color coding for progress
        if (progress >= 100) {
          progressBar.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        } else if (progress > 75) {
          progressBar.style.background = 'linear-gradient(135deg, #8BC34A 0%, #7cb342 100%)';
        } else if (progress > 50) {
          progressBar.style.background = 'linear-gradient(135deg, #FF9800 0%, #f57c00 100%)';
        } else if (progress > 25) {
          progressBar.style.background = 'linear-gradient(135deg, #2196F3 0%, #1976d2 100%)';
        } else {
          progressBar.style.background = 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)';
        }
      }
      
      // Update streak display styling based on activity
      const streakDisplay = document.getElementById('streak-display');
      if (streakDisplay) {
        streakDisplay.classList.remove('active', 'bonus-active');
        
        if (status.isActive || status.activeBonus.multiplier > 1) {
          streakDisplay.classList.add('active');
        } else if (status.currentRate > 3) {
          streakDisplay.classList.add('bonus-active');
        }
      }

    } catch (error) {
      console.error('[STREAK_METER] Update error:', error);
      // Fallback to reset state
      this.resetStreakMeter();
    }
  }

  /**
   * Reset streak meter to default state
   */
  resetStreakMeter() {
    const rateElement = document.getElementById('click-rate');
    const durationElement = document.getElementById('streak-duration');
    const bonusElement = document.getElementById('streak-bonus');
    const bonusTimeElement = document.getElementById('bonus-time');
    const nextTierElement = document.getElementById('next-tier');
    const progressBar = document.getElementById('progress-bar');
    const streakDisplay = document.getElementById('streak-display');

    if (rateElement) rateElement.textContent = '0.0';
    if (durationElement) durationElement.textContent = '0.0s';
    if (bonusElement) {
      bonusElement.textContent = '1.0x';
      bonusElement.classList.remove('active', 'bonus-active');
    }
    if (bonusTimeElement) bonusTimeElement.textContent = '0s';
    if (nextTierElement) nextTierElement.textContent = '2x at 1s';
    if (progressBar) {
      progressBar.style.width = '0%';
      progressBar.style.background = 'linear-gradient(135deg, #9E9E9E 0%, #757575 100%)';
    }
    if (streakDisplay) {
      streakDisplay.classList.remove('active', 'bonus-active');
    }
  }



  /**
   * Set banner status message
   */
  setBannerStatus(message) {
    const statusEl = document.getElementById('banner-status');
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  /**
   * Override the parent update method to include middle column updates
   */
  async update(component) {
    // Note: OptimizedUIManager doesn't have an update method, so we don't call super.update()
    
    // Update dashboard if it's the active tab
    if (component === 'all' || component === 'dashboard' || component.startsWith('tab-dashboard')) {
      await this.updateDashboard();
    }
    
    // Update inventory if it's the active tab
    if (component === 'all' || component === 'inventory' || component.startsWith('tab-inventory')) {
      this.updateInventory();
    }
    
    // Update achievements if it's the active tab
    if (component === 'all' || component === 'achievements' || component.startsWith('tab-achievements')) {
      this.updateAchievements();
    }
    
    // Update lore if it's the active tab
    if (component === 'all' || component === 'lore' || component.startsWith('tab-lore')) {
      this.updateLore();
    }

    // Update middle column
    if (component === 'all' || component === 'middle-column') {
      this.updateMiniWallet();
    }

    // Update right column
    if (component === 'all' || component === 'right-column') {
      this.updateRightColumn();
    }
  }

  /**
   * Update inventory with current game data
   */
  updateInventory() {
    if (!this.game || this.activeTab !== 'inventory') return;

    try {
      this.updateYetisFound();
      this.updateLocationsVisited();
      this.updateYetisBattled();
      this.updateInventoryAssistants();
      this.updateInventoryUpgrades();
      this.updateAbilityBelt();
    } catch (error) {
      console.error('[INVENTORY] Update error:', error);
    }
  }

  /**
   * Update inventory upgrades section
   */
  async updateInventoryUpgrades() {
    try {
      // Update boost upgrades
      await this.updateInventoryBoostUpgrades();
      
      // Update yeti jr upgrades
      this.updateInventoryYetiJrUpgrades();
      
      // Update click multiplier upgrades
      await this.updateInventoryClickMultiplierUpgrades();
      
      // Update overall upgrade tracker
      this.updateOverallUpgradeTracker();
      
    } catch (error) {
      console.error('[INVENTORY_UPGRADES] Update error:', error);
    }
  }

  /**
   * Update boost upgrades in inventory
   */
  async updateInventoryBoostUpgrades() {
    const boostGrid = document.getElementById('boost-grid');
    const boostTracker = document.getElementById('boost-tracker');
    if (!boostGrid || !boostTracker) return;

    try {
      // Get all boost upgrades (including locked ones for counting)
      const { UNIFIED_UPGRADES } = await import('../loops/passive/data/unifiedUpgradeData.js');
      const allBoostUpgrades = UNIFIED_UPGRADES.filter(upgrade => upgrade.type === 'boost');
      
      // Get available (unlocked) boost upgrades for display
      const upgrades = await this.getAvailableUpgrades();
      const availableBoostUpgrades = upgrades.filter(upgrade => upgrade.type === 'boost');
      
      // Count purchased boosts from available ones
      const purchasedBoosts = availableBoostUpgrades.filter(upgrade => upgrade.purchased).length;
      const totalBoosts = allBoostUpgrades.length; // Total available in the game
      
      // Update tracker
      boostTracker.textContent = `${purchasedBoosts}/${totalBoosts}`;

      // Create boost logos (only show unlocked ones)
      let boostHTML = '';
      availableBoostUpgrades.forEach(upgrade => {
        const isPurchased = upgrade.purchased;
        const isUnlocked = upgrade.unlocked;
        const className = isPurchased ? 'inventory-item found' : 
                         isUnlocked ? 'inventory-item unlocked' : 'inventory-item not-found';
        
        // Fix icon path
        const iconPath = upgrade.icon ? upgrade.icon.replace('./images/', './loops/passive/data/images/') : './ui/images/babyYeti.png';
        
        boostHTML += `
          <div class="${className}" title="${upgrade.name}">
            <div class="inventory-icon" style="background-image: url('${iconPath}')"></div>
            <div class="inventory-upgrade-tooltip">
              <strong>${upgrade.name}</strong><br>
              ${upgrade.description}<br>
              <em>Cost: ${this.formatNumber(upgrade.cost)}</em>
            </div>
          </div>
        `;
      });

      boostGrid.innerHTML = boostHTML;
      
    } catch (error) {
      console.error('[INVENTORY_BOOST] Error updating boost upgrades:', error);
      boostGrid.innerHTML = '<div class="inventory-error">Error loading boost upgrades</div>';
    }
  }



  /**
   * Update overall upgrade tracker
   */
  updateOverallUpgradeTracker() {
    const upgradesTracker = document.getElementById('upgrades-tracker');
    if (!upgradesTracker) return;

    // Get counts from individual trackers
    const boostTracker = document.getElementById('boost-tracker');
    const yetiJrTracker = document.getElementById('yeti-jr-tracker');
    const clickMultiplierTracker = document.getElementById('click-multiplier-tracker');
    
    let totalPurchased = 0;
    let totalAvailable = 0;
    
    // Parse boost counts
    if (boostTracker) {
      const boostText = boostTracker.textContent;
      const boostMatch = boostText.match(/(\d+)\/(\d+)/);
      if (boostMatch) {
        totalPurchased += parseInt(boostMatch[1]);
        totalAvailable += parseInt(boostMatch[2]);
      }
    }
    
    // Parse yeti jr counts
    if (yetiJrTracker) {
      const yetiJrText = yetiJrTracker.textContent;
      const yetiJrMatch = yetiJrText.match(/(\d+)\/(\d+)/);
      if (yetiJrMatch) {
        totalPurchased += parseInt(yetiJrMatch[1]);
        totalAvailable += parseInt(yetiJrMatch[2]);
      }
    }
    
    // Parse click multiplier counts
    if (clickMultiplierTracker) {
      const clickMultiplierText = clickMultiplierTracker.textContent;
      const clickMultiplierMatch = clickMultiplierText.match(/(\d+)\/(\d+)/);
      if (clickMultiplierMatch) {
        totalPurchased += parseInt(clickMultiplierMatch[1]);
        totalAvailable += parseInt(clickMultiplierMatch[2]);
      }
    }
    
    // Update overall tracker
    upgradesTracker.textContent = `${totalPurchased}/${totalAvailable}`;
  }

  /**
   * Update Yeti Jr upgrades in inventory
   */
  async updateInventoryYetiJrUpgrades() {
    const yetiJrGrid = document.getElementById('yeti-jr-grid');
    const yetiJrTracker = document.getElementById('yeti-jr-tracker');
    if (!yetiJrGrid || !yetiJrTracker) return;

    try {
      // Get all yetiJr upgrades (including locked ones for counting)
      const { UNIFIED_UPGRADES } = await import('../loops/passive/data/unifiedUpgradeData.js');
      const allYetiJrUpgrades = UNIFIED_UPGRADES.filter(upgrade => upgrade.type === 'yetiJr');
      
      // Get available (unlocked) yetiJr upgrades for display
      const upgrades = await this.getAvailableUpgrades();
      const availableYetiJrUpgrades = upgrades.filter(upgrade => upgrade.type === 'yetiJr');
      
      // Count purchased yetiJr upgrades from available ones
      const purchasedYetiJr = availableYetiJrUpgrades.filter(upgrade => upgrade.purchased).length;
      const totalYetiJr = allYetiJrUpgrades.length; // Total available in the game
      
      // Update tracker
      yetiJrTracker.textContent = `${purchasedYetiJr}/${totalYetiJr}`;

      // Create yetiJr logos (only show unlocked ones)
      let yetiJrHTML = '';
      availableYetiJrUpgrades.forEach(upgrade => {
        const isPurchased = upgrade.purchased;
        const isUnlocked = upgrade.unlocked;
        const className = isPurchased ? 'inventory-item found' : 
                         isUnlocked ? 'inventory-item unlocked' : 'inventory-item not-found';
        
        // Fix icon path
        const iconPath = upgrade.icon ? upgrade.icon.replace('./images/', './loops/passive/data/images/') : './ui/images/babyYeti.png';
        
        yetiJrHTML += `
          <div class="${className}" title="${upgrade.name}">
            <div class="inventory-icon" style="background-image: url('${iconPath}')"></div>
            <div class="inventory-upgrade-tooltip">
              <strong>${upgrade.name}</strong><br>
              ${upgrade.description}<br>
              <em>Cost: ${this.formatNumber(upgrade.cost)}</em>
            </div>
          </div>
        `;
      });

      yetiJrGrid.innerHTML = yetiJrHTML;
      
    } catch (error) {
      console.error('[INVENTORY_YETI_JR] Error updating yetiJr upgrades:', error);
      yetiJrGrid.innerHTML = '<div class="inventory-error">Error loading yetiJr upgrades</div>';
    }
  }

  /**
   * Update Click Multiplier upgrades in inventory
   */
  async updateInventoryClickMultiplierUpgrades() {
    const clickMultiplierGrid = document.getElementById('click-multiplier-grid');
    const clickMultiplierTracker = document.getElementById('click-multiplier-tracker');
    if (!clickMultiplierGrid || !clickMultiplierTracker) return;

    try {
      // Get all clickMultiplier upgrades (including locked ones for counting)
      const { UNIFIED_UPGRADES } = await import('../loops/passive/data/unifiedUpgradeData.js');
      const allClickMultiplierUpgrades = UNIFIED_UPGRADES.filter(upgrade => upgrade.type === 'clickMultiplier');
      
      // Get available (unlocked) clickMultiplier upgrades for display
      const upgrades = await this.getAvailableUpgrades();
      const availableClickMultiplierUpgrades = upgrades.filter(upgrade => upgrade.type === 'clickMultiplier');
      
      // Count purchased clickMultiplier upgrades from available ones
      const purchasedClickMultipliers = availableClickMultiplierUpgrades.filter(upgrade => upgrade.purchased).length;
      const totalClickMultipliers = allClickMultiplierUpgrades.length; // Total available in the game
      
      // Update tracker
      clickMultiplierTracker.textContent = `${purchasedClickMultipliers}/${totalClickMultipliers}`;

      // Create clickMultiplier logos (only show unlocked ones)
      let clickMultiplierHTML = '';
      availableClickMultiplierUpgrades.forEach(upgrade => {
        const isPurchased = upgrade.purchased;
        const isUnlocked = upgrade.unlocked;
        const className = isPurchased ? 'inventory-item found' : 
                         isUnlocked ? 'inventory-item unlocked' : 'inventory-item not-found';
        
        // Fix icon path
        const iconPath = upgrade.icon ? upgrade.icon.replace('./images/', './loops/passive/data/images/') : './ui/images/clickMult.png';
        
        clickMultiplierHTML += `
          <div class="${className}" title="${upgrade.name}">
            <div class="inventory-icon" style="background-image: url('${iconPath}')"></div>
            <div class="inventory-upgrade-tooltip">
              <strong>${upgrade.name}</strong><br>
              ${upgrade.description}<br>
              <em>Cost: ${this.formatNumber(upgrade.cost)}</em>
            </div>
          </div>
        `;
      });

      clickMultiplierGrid.innerHTML = clickMultiplierHTML;
      
    } catch (error) {
      console.error('[INVENTORY_CLICK_MULTIPLIER] Error updating click multiplier upgrades:', error);
      clickMultiplierGrid.innerHTML = '<div class="inventory-error">Error loading click multiplier upgrades</div>';
    }
  }
  /**
   * Update Ability Belt section
   */
  updateAbilityBelt() {
    const abilitySlots = document.getElementById('ability-slots');
    const abilityBeltFrozen = document.getElementById('ability-belt-frozen');
    const abilitySelection = document.getElementById('ability-selection');
    const abilityBeltTracker = document.getElementById('ability-belt-tracker');
    
    if (!abilitySlots || !abilityBeltFrozen || !abilitySelection || !abilityBeltTracker) return;

    try {
      // Check if abilities system is active (controlled by Concord upgrade)
      if (!this.game.abilitiesActive) {
        // Abilities are disabled - show locked message
        abilitySlots.style.display = 'none';
        abilitySelection.style.display = 'none';
        
        abilityBeltFrozen.innerHTML = `
          <div class="ability-belt-disabled">
            <div class="ability-belt-frozen-icon">🔒</div>
            <strong>Ability Belt</strong><br>
            <em>This feature is currently locked.</em><br>
            <strong>Unlock in Snowflake Marketplace</strong>
          </div>
        `;
        abilityBeltFrozen.style.display = 'block';
        abilityBeltTracker.textContent = '0/4';
        return;
      }
      
      // Get current ability belt state
      const currentBelt = window.getAbilityBelt ? window.getAbilityBelt(this.game) : { slot1: null, slot2: null, slot3: null, slot4: null };
      const abilitiesByClass = window.getAbilitiesByClass ? window.getAbilitiesByClass() : {};
      
      // Count equipped abilities
      const equippedCount = Object.values(currentBelt).filter(abilityId => abilityId !== null).length;
      abilityBeltTracker.textContent = `${equippedCount}/4`;
      
      // Check if yeti is visible OR buff is active (belt should be frozen)
      const yetiVisible = window.isYetiVisible ? window.isYetiVisible() : false;
      const spawnedYeti = window.getCurrentSpawnedYeti ? window.getCurrentSpawnedYeti() : null;
      const yetiBuffActive = this.game.currentYetiBuff !== null;
      const shouldFreeze = yetiVisible || yetiBuffActive;
      
      // Update ability slots display
      let slotsHTML = '';
      for (let i = 1; i <= 4; i++) {
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
            slotsHTML += `
              <div class="ability-slot equipped">
                <div class="ability-slot-title">Slot ${i}</div>
                <div class="ability-slot-name">${abilityDetails.name}</div>
                <div class="ability-slot-class">${abilityDetails.class}</div>
                <div class="ability-slot-description">${abilityDetails.description}</div>
              </div>
            `;
          } else {
            slotsHTML += `
              <div class="ability-slot equipped">
                <div class="ability-slot-title">Slot ${i}</div>
                <div class="ability-slot-name">Unknown Ability</div>
                <div class="ability-slot-class">Unknown</div>
              </div>
            `;
          }
        } else {
          slotsHTML += `
            <div class="ability-slot empty">
              <div class="ability-slot-title">Slot ${i}</div>
              <div class="ability-slot-name">Empty</div>
            </div>
          `;
        }
      }
      
      abilitySlots.innerHTML = slotsHTML;
      
      // Handle frozen state
      if (shouldFreeze) {
        let frozenMessage = '<div class="ability-belt-frozen-icon">⚠️</div>';
        frozenMessage += '<strong>Ability Belt Frozen</strong><br>';
        
        if (yetiVisible && yetiBuffActive) {
          frozenMessage += `<em>The ability belt is frozen while ${spawnedYeti ? spawnedYeti.name : 'a yeti'} is visible and a yeti buff is active.<br>The belt will unfreeze when both the yeti despawns and the buff expires.</em>`;
        } else if (yetiVisible) {
          frozenMessage += `<em>The ability belt is frozen while ${spawnedYeti ? spawnedYeti.name : 'a yeti'} is visible.<br>Click on the yeti or wait for it to disappear.</em>`;
        } else if (yetiBuffActive) {
          const buffClass = this.game.currentYetiBuff.class;
          frozenMessage += `<em>The ability belt is frozen while a ${buffClass} yeti buff is active.<br>Wait for the buff to expire to modify your loadout.</em>`;
        }
        
        abilityBeltFrozen.innerHTML = frozenMessage;
        abilityBeltFrozen.style.display = 'block';
        abilitySelection.style.display = 'none';
      } else {
        abilityBeltFrozen.style.display = 'none';
        abilitySelection.style.display = 'block';
        
        // Create ability selection interface
        let selectionHTML = '<h4>Select Abilities:</h4>';
        
        // Create dropdowns for each slot
        for (let i = 1; i <= 4; i++) {
          const slotSelectionDiv = `
            <div class="slot-selection">
              <label for="slot-${i}-select">Slot ${i}:</label>
              <select id="slot-${i}-select">
                <option value="">(Empty)</option>
              </select>
            </div>
          `;
          selectionHTML += slotSelectionDiv;
        }
        
        // Add clear all button
        selectionHTML += `
          <button class="clear-abilities-btn" id="clear-abilities-btn">
            Clear All Abilities
          </button>
        `;
        
        abilitySelection.innerHTML = selectionHTML;
        
        // Populate dropdowns with abilities
        for (let i = 1; i <= 4; i++) {
          const select = document.getElementById(`slot-${i}-select`);
          if (!select) continue;
          
          // Add abilities grouped by class
          for (const [className, abilities] of Object.entries(abilitiesByClass)) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = className.charAt(0).toUpperCase() + className.slice(1);
            
            for (const ability of abilities) {
              const option = document.createElement('option');
              option.value = ability.id;
              option.textContent = `${ability.name} - ${ability.description}`;
              
              // Disable if already equipped in another slot
              const equippedSlot = window.isAbilityEquipped ? window.isAbilityEquipped(this.game, ability.id) : null;
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
            const success = window.setAbilityInSlot ? window.setAbilityInSlot(this.game, i, selectedAbilityId) : false;
            
            if (success) {
              // Refresh the ability belt display
              this.updateAbilityBelt();
            } else {
              // Reset the selection if it failed
              select.value = currentBelt[slotKey] || '';
            }
          });
        }
        
        // Add clear all button handler
        const clearAllButton = document.getElementById('clear-abilities-btn');
        if (clearAllButton) {
          clearAllButton.addEventListener('click', () => {
            if (window.clearAbilityBelt) {
              window.clearAbilityBelt(this.game);
              this.updateAbilityBelt();
            }
          });
        }
      }
      
    } catch (error) {
      console.error('[ABILITY_BELT] Update error:', error);
      abilitySlots.innerHTML = '<div class="inventory-error">Error loading ability belt</div>';
    }
  }

  /**
   * Update Yetis Found section
   */
  updateYetisFound() {
    const yetisGrid = document.getElementById('yetis-grid');
    const yetisTracker = document.getElementById('yetis-tracker');
    if (!yetisGrid || !yetisTracker) return;

    // Get yeti data from the data file
    const allYetis = YETI.yetis;
    
    // Get yeti preferences from progress tracker if available
    let yetiPreferences = {};
    if (window.progressTracker && window.progressTracker.progress && window.progressTracker.progress.hybrid && window.progressTracker.progress.hybrid.yetis) {
      yetiPreferences = window.progressTracker.progress.hybrid.yetis.yetiPreferences || {};
    }
    
    // Count unique yeti classes encountered
    const uniqueYetisFound = Object.keys(yetiPreferences).length;
    
    // Update tracker
    yetisTracker.textContent = `${uniqueYetisFound}/${allYetis.length}`;

    // Create yeti logos
    let yetisHTML = '';
    allYetis.forEach((yeti) => {
      // Check if this specific yeti class has been encountered
      const isFound = yetiPreferences.hasOwnProperty(yeti.class);
      const className = isFound ? 'inventory-item found' : 'inventory-item not-found';
      const icon = yeti.icon ? `<img src="${yeti.icon}" alt="${yeti.name}" style="width: 24px; height: 24px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"><span style="display: none; font-size: 24px;">❄️</span>` : '❄️';
      
      yetisHTML += `
        <div class="${className}" title="${yeti.name}">
          ${icon}
          <div class="inventory-tooltip">${yeti.name}</div>
        </div>
      `;
    });

    yetisGrid.innerHTML = yetisHTML;
  }

  /**
   * Update Locations Visited section
   */
  updateLocationsVisited() {
    const locationsGrid = document.getElementById('locations-grid');
    const locationsTracker = document.getElementById('locations-tracker');
    if (!locationsGrid || !locationsTracker) return;

    // Get location data from the data file
    const allLocations = LOCATION.locations;
    
    // Get visited locations from progress tracker if available, fallback to game state
    let visitedLocations = {};
    if (window.progressTracker && window.progressTracker.progress && window.progressTracker.progress.hybrid && window.progressTracker.progress.hybrid.locations) {
      visitedLocations = window.progressTracker.progress.hybrid.locations.visitedLocations || {};
    }
    
    // Count unique locations visited
    const uniqueVisitedCount = Object.keys(visitedLocations).length;
    
    // Update tracker
    locationsTracker.textContent = `${uniqueVisitedCount}/${allLocations.length}`;

    // Create location logos
    let locationsHTML = '';
    allLocations.forEach((location) => {
      // Check if this specific location has been visited
      const isVisited = visitedLocations.hasOwnProperty(location.id);
      const className = isVisited ? 'inventory-item found' : 'inventory-item not-found';
      const imagePath = location.icon ? location.icon.replace('./images/', './loops/hybrid/data/images/') : './ui/images/snowman.png';
      const icon = `<img src="${imagePath}" alt="${location.name}" style="width: 24px; height: 24px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"><span style="display: none; font-size: 24px;">🗺️</span>`;
      
      locationsHTML += `
        <div class="${className}" title="${location.name}">
          ${icon}
          <div class="inventory-tooltip">${location.name}</div>
        </div>
      `;
    });

    locationsGrid.innerHTML = locationsHTML;
  }

  /**
   * Update Yetis Battled section
   */
  updateYetisBattled() {
    const evilYetisGrid = document.getElementById('evil-yetis-grid');
    const evilYetisTracker = document.getElementById('evil-yetis-tracker');
    if (!evilYetisGrid || !evilYetisTracker) return;

    // Get evil yeti data from the data file
    const allEvilYetis = EVIL_YETI.yetis;
    const evilYetisBattled = this.game.evilYetisBattled || 0;
    
    // For now, consider an evil yeti "battled" if any evil yeti has been battled
    // In a more sophisticated system, you'd track individual evil yeti battles
    const battledYetis = evilYetisBattled > 0 ? Math.min(evilYetisBattled, allEvilYetis.length) : 0;
    
    // Update tracker
    evilYetisTracker.textContent = `${battledYetis}/${allEvilYetis.length}`;

    // Create evil yeti logos
    let evilYetisHTML = '';
    allEvilYetis.forEach((yeti, index) => {
      // Consider an evil yeti battled if we've battled enough evil yetis to have battled this one
      const isBattled = evilYetisBattled > index;
      const className = isBattled ? 'inventory-item found' : 'inventory-item not-found';
      const icon = yeti.icon ? `<img src="${yeti.icon}" alt="${yeti.name}" style="width: 24px; height: 24px;">` : '💀';
      
      evilYetisHTML += `
        <div class="${className}" title="${yeti.name}">
          ${icon}
          <div class="inventory-tooltip">${yeti.name}</div>
        </div>
      `;
    });

    evilYetisGrid.innerHTML = evilYetisHTML;
  }

  /**
   * Update assistants display in inventory
   */
  updateInventoryAssistants() {
    const assistantsGrid = document.getElementById('assistants-grid');
    const assistantsTracker = document.getElementById('assistants-tracker');
    if (!assistantsGrid || !assistantsTracker) return;

    // Get real assistant data from the game
    const assistants = this.getRealAssistants();
    const ownedAssistants = assistants.filter(assistant => (assistant.quantity || 0) > 0);
    
    // Update tracker
    assistantsTracker.textContent = `${ownedAssistants.length}/${assistants.length}`;

    // Create assistant items
    let assistantsHTML = '';
    assistants.forEach(assistant => {
      const owned = assistant.quantity || 0;
      const isOwned = owned > 0;
      const className = isOwned ? 'assistant-item owned' : 'assistant-item not-owned';
      
      // Use the proper assistant icon from assistantData.js
      const imagePath = assistant.icon ? assistant.icon.replace('./images/', './loops/passive/data/images/') : './ui/images/additionalArm.png';
      
      assistantsHTML += `
        <div class="${className}" title="${assistant.name}">
          <div class="assistant-icon" style="background-image: url('${imagePath}')"></div>
          <div class="assistant-name">${assistant.name}</div>
          <div class="assistant-count">${owned}</div>
        </div>
      `;
    });

    assistantsGrid.innerHTML = assistantsHTML;
  }

  /**
   * Update Upgrades section
   */
  async updateUpgrades() {
    const upgradesGrid = this.components.upgradesGrid;
    if (!upgradesGrid) return;

    try {
      // Get current snowballs for affordability check
      const currentSnowballs = this.game.gameState?.snowballs || 0;

      // Get upgrades from the unified system
      const upgrades = await this.getAvailableUpgrades();
      
      let upgradesHTML = '';
      upgrades.forEach(upgrade => {
        // Skip if already purchased
        if (upgrade.purchased) return;
        
        // Skip if not unlocked
        if (!upgrade.unlocked) return;

        const className = upgrade.affordable ? 'upgrade-item affordable' : 'upgrade-item unaffordable';
        const clickHandler = upgrade.affordable ? `onclick="window.gameReadyUIManager.handleUpgradeClick('${upgrade.id}')"` : '';
        
        // Fix icon path to point to the correct location
        const iconPath = upgrade.icon ? upgrade.icon.replace('./images/', './loops/passive/data/images/') : './ui/images/babyYeti.png';
        
        upgradesHTML += `
          <div class="${className}" ${clickHandler} title="${upgrade.name}" data-upgrade-id="${upgrade.id}">
            <div class="upgrade-icon" style="background-image: url('${iconPath}')"></div>
          </div>
          <div class="upgrade-tooltip" data-upgrade-id="${upgrade.id}">
            <strong style="color: var(--color-secondary-accent);">${upgrade.name}</strong><br>
            <span style="color: var(--color-secondary-accent);">Cost:</span> ${(() => {
              const gameState = this.game?.gameState || this.game;
              const discountRate = gameState?.travelDiscountGlobalUpgrades || 1;
              
              if (discountRate < 1) {
                const finalCost = Math.floor(upgrade.cost * discountRate);
                const discountPercent = Math.round((1 - discountRate) * 100);
                return `<span style="text-decoration: line-through; color: #888;">${this.formatNumber(upgrade.cost)}</span> <span style="color: #4CAF50;">${this.formatNumber(finalCost)}</span> (${discountPercent}% off!)`;
              } else {
                return `${this.formatNumber(upgrade.cost)}`;
              }
            })()} snowballs<br>
            <span style="color: white;">${upgrade.description}</span><br>
            <span style="color: var(--color-secondary-accent);">Requires:</span> <em style="color: white;">${this.getTriggerDescription(upgrade.trigger)}</em>
          </div>
        `;
      });

      upgradesGrid.innerHTML = upgradesHTML;
    } catch (error) {
      console.error('[UPGRADES] Error updating upgrades:', error);
      upgradesGrid.innerHTML = '<div class="upgrade-error">Error loading upgrades</div>';
    }
  }

  /**
   * Get human-readable description of upgrade trigger
   */
  getTriggerDescription(trigger) {
    if (!trigger) return 'Unknown requirement';
    
    switch (trigger.type) {
      case 'assistantCount':
        if (trigger.assistantId) {
          return `${trigger.value} ${trigger.assistantId} assistants`;
        } else {
          return `${trigger.value} total assistants`;
        }
        
      case 'lifetimeSnowballs':
        return `${this.formatNumber(trigger.value)} lifetime snowballs`;
        
      case 'totalClicks':
        return `${this.formatNumber(trigger.value)} total clicks`;
        
      case 'boostsOwned':
        return `${trigger.value} boosts owned`;
        
      case 'locationsUnlocked':
        return `${trigger.value} locations unlocked`;
        
      case 'yetisSighted':
        return `${trigger.value} yetis sighted`;
        
      case 'playTimeHours':
        return `${trigger.value} hours played`;
        
      case 'prestigeCount':
        return `${trigger.value} prestiges`;
        
      default:
        return 'Unknown requirement';
    }
  }

  /**
   * Get available upgrades from unified upgrade system
   */
  async getAvailableUpgrades() {
    try {
      // Import unified upgrade data
      const { UNIFIED_UPGRADES, getUpgradesByType } = await import('../loops/passive/data/unifiedUpgradeData.js');
      
      // Get current game state
      const gameState = this.game.gameState || this.game;
      const currentSnowballs = gameState.snowballs || 0;
      
      // Get all boost, yetiJr, and clickMultiplier upgrades
      const allUpgrades = UNIFIED_UPGRADES.filter(upgrade => upgrade.type === 'boost' || upgrade.type === 'yetiJr' || upgrade.type === 'clickMultiplier');
      
      // Process each upgrade to check availability
      return allUpgrades.map(upgrade => {
        // Check if the upgrade is unlocked based on trigger conditions
        const isUnlocked = this.checkUpgradeTrigger(upgrade);
        
        // Check if the upgrade is already purchased
        const isPurchased = this.isUpgradePurchased(upgrade.id);
        
        // Check if affordable (simple threshold)
        const isAffordable = currentSnowballs >= upgrade.cost;
        
        return {
          ...upgrade,
          unlocked: isUnlocked,
          purchased: isPurchased,
          affordable: isAffordable
        };
      }).filter(upgrade => upgrade.unlocked); // Only show unlocked upgrades
      
    } catch (error) {
      console.error('[UPGRADES] Error loading unified upgrades:', error);
      return [];
    }
  }

  /**
   * Check if an upgrade trigger condition is met
   */
  checkUpgradeTrigger(upgrade) {
    if (!this.game) return false;
    
    const gameState = this.game.gameState || this.game;
    
    switch (upgrade.trigger.type) {
      case 'assistantCount':
        if (upgrade.trigger.assistantId) {
          // Check specific assistant count
          const assistantCount = gameState.assistants?.[upgrade.trigger.assistantId] || 0;
          return assistantCount >= upgrade.trigger.value;
        } else {
          // Check total assistant count
          const totalAssistants = Object.values(gameState.assistants || {}).reduce((sum, count) => sum + count, 0);
          return totalAssistants >= upgrade.trigger.value;
        }
        
      case 'lifetimeSnowballs':
        const lifetimeSnowballs = gameState.lifetimeSnowballs || 0;
        return lifetimeSnowballs >= upgrade.trigger.value;
        
      case 'totalClicks':
        const totalClicks = gameState.totalClicks || 0;
        return totalClicks >= upgrade.trigger.value;
        
      case 'boostsOwned':
        const boostsOwned = gameState.boostsOwned || 0;
        return boostsOwned >= upgrade.trigger.value;
        
      case 'locationsUnlocked':
        const locationsUnlocked = gameState.locationsUnlocked || 0;
        return locationsUnlocked >= upgrade.trigger.value;
        
      case 'yetisSighted':
        const yetisSighted = gameState.yetisSighted || 0;
        return yetisSighted >= upgrade.trigger.value;
        
      case 'playTimeHours':
        const playTimeHours = gameState.playTimeHours || 0;
        return playTimeHours >= upgrade.trigger.value;
        
      case 'prestigeCount':
        const prestigeCount = gameState.prestigeCount || 0;
        return prestigeCount >= upgrade.trigger.value;
        
      default:
        return false;
    }
  }

  /**
   * Check if an upgrade is already purchased
   */
  isUpgradePurchased(upgradeId) {
    if (!this.game) return false;
    
    const gameState = this.game.gameState || this.game;
    const unifiedUpgrades = gameState.unifiedUpgrades || {};
    
    return unifiedUpgrades[upgradeId] === true;
  }

  /**
   * Handle upgrade click using the unified upgrade system
   * 
   * This method imports and uses the unified upgrade system's purchase function
   * directly, ensuring reliable integration regardless of initialization timing.
   * 
   * @param {string} upgradeId - The ID of the upgrade to purchase
   */
  async handleUpgradeClick(upgradeId) {
    if (!this.game) return;

    try {
      const gameState = this.game.gameState || this.game;
      
      // Import and use the unified upgrade system's purchase function
      const { purchaseUpgrade } = await import('../loops/passive/unifiedUpgrades.js');
      const success = purchaseUpgrade(upgradeId, gameState);
      
      if (success) {
        // Force immediate updates
        this.forceSPSUpdate();
        this.forceUpdateRightColumn();
        this.queueUpdate('all', 1); // Critical priority
      }
      
    } catch (error) {
      console.error(`[UPGRADE] Error purchasing upgrade ${upgradeId}:`, error);
    }
  }



  /**
   * Update assistants section
   */
  updateAssistants() {
    const assistantsContainer = this.components.assistantsContainer;
    if (!assistantsContainer) {
      return;
    }

    // Get current snowballs for affordability check
    const gameState = this.game.gameState || this.game;
    const currentSnowballs = gameState.snowballs || 0;

    // Get real assistant data from the game
    const assistants = this.getRealAssistants();
    
    // Check if we need to do a full render (first time or structure changed)
    const existingBoxes = assistantsContainer.querySelectorAll('.assistant-box');
    const needsFullRender = existingBoxes.length === 0 || existingBoxes.length !== assistants.length;
    
    if (needsFullRender) {
      // Full render - create all assistant boxes
      let assistantsHTML = '';
      assistants.forEach(assistant => {
        const owned = assistant.quantity || 0;
        const isPurchased = owned > 0;
        const canAfford = currentSnowballs >= assistant.calculatedCost;
        
        // Check if level up is affordable (costs icicles)
        const currentLevel = gameState.assistantLevels?.[assistant.id] || 0;
        const icicleCount = gameState.icicles || 0;
        const levelUpCost = currentLevel + 1;
        const canAffordLevelUp = icicleCount >= levelUpCost;
        
        // Only show assistants that are affordable or already purchased
        if (!isPurchased && !canAfford) {
          return; // Skip unaffordable assistants entirely
        }

        let stateClass = 'visible';
        if (isPurchased) {
          stateClass = 'purchased';
        }

        const buttonClass = canAfford ? 'buy-button affordable' : 'buy-button unaffordable';
        const levelUpButtonClass = canAffordLevelUp ? 'level-up-button affordable' : 'level-up-button unaffordable';
        
        // Use the proper assistant icon from assistantData.js (fix path)
        const imagePath = assistant.icon ? assistant.icon.replace('./images/', './loops/passive/data/images/') : './ui/images/additionalArm.png';
        
        assistantsHTML += `
          <div class="assistant-box ${stateClass}" data-assistant-id="${assistant.id}">
            <div class="assistant-logo" style="background-image: url('${imagePath}')"></div>
            <div class="assistant-info">
              <div class="assistant-name">${assistant.name}</div>
              <div class="assistant-description"><em>${assistant.description}</em></div>
              <div class="assistant-cost-display">${(() => {
                const gameState = this.game?.gameState || this.game;
                const discountRate = gameState?.travelDiscountAssistants || 1;
                
                if (discountRate < 1) {
                  // Calculate original cost without discount
                  const baseCost = assistant.cost || 10;
                  const costRate = assistant.costRate || 1.07;
                  const ownedCount = assistant.quantity || 0;
                  const originalCost = Math.floor(baseCost * Math.pow(costRate, ownedCount));
                  const discountPercent = Math.round((1 - discountRate) * 100);
                  
                  return `Cost: <span style="text-decoration: line-through; color: #888;">${this.formatNumber(originalCost)}</span> <span style="color: #4CAF50;">${this.formatNumber(assistant.calculatedCost)}</span> (${discountPercent}% off!)`;
                } else {
                  return `Cost: ${this.formatNumber(assistant.calculatedCost)}`;
                }
              })()}</div>
            </div>
            <div class="assistant-owned">${owned}</div>
            <div class="assistant-actions">
              <button class="${buttonClass}" data-assistant-id="${assistant.id}">
                Buy
              </button>
              ${isPurchased ? `
                <button class="${levelUpButtonClass}" data-assistant-id="${assistant.id}">
                  ⬆️
                </button>
              ` : ''}
            </div>
            <div class="assistant-tooltip">
              <div class="tooltip-title">${assistant.name}</div>
              <div class="tooltip-section">
                <span class="tooltip-label">Level:</span> ${this.formatLevelWithIcicles(assistant.level || 0)}
              </div>
              <div class="tooltip-section">
                <span class="tooltip-label">SPS per Assistant:</span> ${(() => {
                  const gameState = this.game?.gameState || this.game;
                  const spsByAssistant = gameState._spsByAssistant || {};
                  const actualSPS = spsByAssistant[assistant.id] || 0;
                  const count = assistant.quantity || 0;
                  return count > 0 ? formatSPS(actualSPS / count) : formatSPS(assistant.sps * (assistant.multiplier || 1));
                })()}
              </div>
              <div class="tooltip-section">
                <span class="tooltip-label">Efficiency:</span> ${(() => {
                  const gameState = this.game?.gameState || this.game;
                  const spsByAssistant = gameState._spsByAssistant || {};
                  const actualSPS = spsByAssistant[assistant.id] || 0;
                  const count = assistant.quantity || 0;
                  const spsPerAssistant = count > 0 ? actualSPS / count : assistant.sps * (assistant.multiplier || 1);
                  return this.formatNumber(assistant.calculatedCost / spsPerAssistant);
                })()} snowballs per SPS
              </div>
              <div class="tooltip-section">
                <span class="tooltip-label">ROI Time:</span> ${(() => {
                  const gameState = this.game?.gameState || this.game;
                  const spsByAssistant = gameState._spsByAssistant || {};
                  const actualSPS = spsByAssistant[assistant.id] || 0;
                  const count = assistant.quantity || 0;
                  const spsPerAssistant = count > 0 ? actualSPS / count : assistant.sps * (assistant.multiplier || 1);
                  return (formatROITime || fallbackFormatROITime)(assistant.calculatedCost, spsPerAssistant);
                })()}
              </div>
              <div class="tooltip-section">
                <span class="tooltip-label">Snowballs:</span> ${this.formatNumber(assistant.lifetime || 0)}
              </div>
            </div>
          </div>
        `;
      });

      assistantsContainer.innerHTML = assistantsHTML;
      
      // Set up event listeners for the buttons
      this.setupAssistantEventListeners();
    } else {
      // Efficient update - only update values that change
      assistants.forEach(assistant => {
        const box = assistantsContainer.querySelector(`[data-assistant-id="${assistant.id}"]`);
        if (!box) return;
        
        const owned = assistant.quantity || 0;
        const isPurchased = owned > 0;
        const canAfford = currentSnowballs >= assistant.calculatedCost;
        
        // Update owned count
        const ownedElement = box.querySelector('.assistant-owned');
        if (ownedElement) {
          ownedElement.textContent = owned;
        }
        
        // Update cost display with discount indication
        const costElement = box.querySelector('.assistant-cost-display');
        if (costElement) {
          const gameState = this.game?.gameState || this.game;
          const discountRate = gameState?.travelDiscountAssistants || 1;
          
          if (discountRate < 1) {
            // Calculate original cost without discount
            const baseCost = assistant.cost || 10;
            const costRate = assistant.costRate || 1.07;
            const ownedCount = assistant.quantity || 0;
            const originalCost = Math.floor(baseCost * Math.pow(costRate, ownedCount));
            const discountPercent = Math.round((1 - discountRate) * 100);
            
            costElement.innerHTML = `Cost: <span style="text-decoration: line-through; color: #888;">${this.formatNumber(originalCost)}</span> <span style="color: #4CAF50;">${this.formatNumber(assistant.calculatedCost)}</span> (${discountPercent}% off!)`;
          } else {
            costElement.textContent = `Cost: ${this.formatNumber(assistant.calculatedCost)}`;
          }
        }
        
        // Update button state
        const buyButton = box.querySelector('.buy-button');
        if (buyButton) {
          const newButtonClass = canAfford ? 'buy-button affordable' : 'buy-button unaffordable';
          buyButton.className = newButtonClass;
        }
        
        // Update level up button visibility and affordability
        const levelUpButton = box.querySelector('.level-up-button');
        if (isPurchased && !levelUpButton) {
          // Add level up button if purchased and doesn't exist
          const actionsDiv = box.querySelector('.assistant-actions');
          if (actionsDiv) {
            const newLevelUpButton = document.createElement('button');
            newLevelUpButton.className = 'level-up-button';
            newLevelUpButton.setAttribute('data-assistant-id', assistant.id);
                         newLevelUpButton.textContent = '⬆️';
            newLevelUpButton.addEventListener('click', (event) => {
              event.stopPropagation();
              this.handleLevelUp(assistant.id);
            });
            actionsDiv.appendChild(newLevelUpButton);
          }
        } else if (!isPurchased && levelUpButton) {
          // Remove level up button if not purchased
          levelUpButton.remove();
        } else if (isPurchased && levelUpButton) {
          // Update level up button affordability
          const currentLevel = gameState.assistantLevels?.[assistant.id] || 0;
          const icicleCount = gameState.icicles || 0;
          const levelUpCost = currentLevel + 1;
          const canAffordLevelUp = icicleCount >= levelUpCost;
          const newLevelUpButtonClass = canAffordLevelUp ? 'level-up-button affordable' : 'level-up-button unaffordable';
          levelUpButton.className = newLevelUpButtonClass;
        }
        
        // Update tooltip content
        const tooltip = box.querySelector('.assistant-tooltip');
        if (tooltip) {
          const tooltipSections = tooltip.querySelectorAll('.tooltip-section');
          if (tooltipSections.length >= 5) {
            // Update Level
            tooltipSections[0].innerHTML = `<span class="tooltip-label">Level:</span> ${this.formatLevelWithIcicles(assistant.level || 0)}`;
            // Update SPS per Assistant
            const gameState = this.game?.gameState || this.game;
            const spsByAssistant = gameState._spsByAssistant || {};
            const actualSPS = spsByAssistant[assistant.id] || 0;
            const count = assistant.quantity || 0;
            const spsPerAssistant = count > 0 ? actualSPS / count : assistant.sps * (assistant.multiplier || 1);
            tooltipSections[1].innerHTML = `<span class="tooltip-label">SPS per Assistant:</span> ${formatSPS(spsPerAssistant)}`;
            // Update Efficiency
            tooltipSections[2].innerHTML = `<span class="tooltip-label">Efficiency:</span> ${this.formatNumber(assistant.calculatedCost / spsPerAssistant)} snowballs per SPS`;
            // Update ROI Time
            tooltipSections[3].innerHTML = `<span class="tooltip-label">ROI Time:</span> ${(formatROITime || fallbackFormatROITime)(assistant.calculatedCost, spsPerAssistant)}`;
            // Update Snowballs
            tooltipSections[4].innerHTML = `<span class="tooltip-label">Snowballs:</span> ${this.formatNumber(assistant.lifetime || 0)}`;
            // Update Cost
            tooltipSections[5].innerHTML = `<span class="tooltip-label">Cost:</span> ${this.formatNumber(assistant.calculatedCost)} snowballs`;
          }
        }
      });
    }
  }

  /**
   * Set up event listeners for assistant buttons
   */
  setupAssistantEventListeners() {
    const assistantsContainer = this.components.assistantsContainer;
    if (!assistantsContainer) return;

    // Add event listeners for buy buttons
    assistantsContainer.querySelectorAll('.buy-button').forEach(button => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const assistantId = button.getAttribute('data-assistant-id');
        this.handleAssistantClick(assistantId);
      });
    });

    // Add event listeners for level up buttons
    assistantsContainer.querySelectorAll('.level-up-button').forEach(button => {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const assistantId = button.getAttribute('data-assistant-id');
        this.handleLevelUp(assistantId);
      });
    });
  }
  /**
   * Calculate icicles needed for next level
   * @param {number} currentLevel - Current assistant level
   * @returns {number} Icicles needed for next level
   */
  getIciclesForNextLevel(currentLevel) {
    return currentLevel + 1;
  }

  /**
   * Format level display with icicle requirement
   * @param {number} currentLevel - Current assistant level
   * @returns {string} Formatted level string with icicle requirement
   */
  formatLevelWithIcicles(currentLevel) {
    try {
      const level = parseInt(currentLevel) || 0;
      const iciclesNeeded = this.getIciclesForNextLevel(level);
      const nextLevel = level + 1;
      return `${level} (${iciclesNeeded} icicle${iciclesNeeded !== 1 ? 's' : ''} needed for Level ${nextLevel})`;
    } catch (error) {
      console.warn('[ASSISTANT_UI] Error formatting level with icicles:', error);
      return `${currentLevel || 0}`;
    }
  }

  /**
   * Get real assistant data from the game state
   */
  getRealAssistants() {
    if (!this.game) {
      return [];
    }

    // Use the ASSISTANTS data that should be available globally
    const ASSISTANTS = window.ASSISTANTS || [];
    if (!ASSISTANTS.length) {
      // Fallback to placeholder data if ASSISTANTS not available
      return this.getAvailableAssistants();
    }
    
    return ASSISTANTS.map(assistant => {
      // Handle both flat and nested game state structures
      const gameState = this.game.gameState || this.game;
      
      const owned = gameState.assistants?.[assistant.id] || 0;
      const level = gameState.assistantLevels?.[assistant.id] || 0;
      const multiplier = gameState.assistantMultipliers?.[assistant.id] || 1;
      const lifetime = gameState.lifetimeFromAssistants?.[assistant.id] || 0;
      
      // Calculate current cost based on owned count
      const cost = this.calculateAssistantCost(assistant, owned);
      
      // Ensure all required properties exist
      const safeAssistant = {
        id: assistant.id || 'unknown',
        name: assistant.name || 'Unknown Assistant',
        description: assistant.description || 'No description available',
        icon: assistant.icon || './ui/images/additionalArm.png',
        cost: assistant.cost || 10,
        costRate: assistant.costRate || 1.07,
        sps: assistant.sps || 1,
        quantity: owned,
        level: level,
        multiplier: multiplier,
        lifetime: lifetime,
        calculatedCost: cost
      };
      
      return safeAssistant;
    });
  }

  /**
   * Get available assistants (fallback implementation)
   */
  getAvailableAssistants() {
    // Fallback data if real assistant data is not available
    return [
      {
        id: 'additionalArm',
        name: 'Additional Arm',
        description: 'An extra limb just for throwing snowballs!',
        cost: 5,
        costRate: 1.07,
        sps: 1,
        quantity: 0,
        level: 0,
        multiplier: 1,
        lifetime: 0
      },
      {
        id: 'neighborKids',
        name: 'Neighbor Kids',
        description: 'The local kids lend a hand, and an arm!',
        cost: 20,
        costRate: 1.08,
        sps: 2,
        quantity: 0,
        level: 0,
        multiplier: 1,
        lifetime: 0
      }
    ];
  }

  /**
   * Calculate assistant cost based on owned count
   */
  calculateAssistantCost(assistant, owned) {
    try {
      const baseCost = assistant.cost || 10;
      const costRate = assistant.costRate || 1.07;
      const ownedCount = owned || 0;
      
      // Calculate base cost with scaling
      const scaledCost = Math.floor(baseCost * Math.pow(costRate, ownedCount));
      
      // Apply travel discount if active
      const gameState = this.game?.gameState || this.game;
      const discountRate = gameState?.travelDiscountAssistants || 1;
      const finalCost = Math.floor(scaledCost * discountRate);
      
      return finalCost;
    } catch (error) {
      console.error('[ASSISTANT] Error calculating cost for assistant:', assistant.id, error);
      return assistant.cost || 10; // Fallback to base cost
    }
  }

  /**
   * Handle assistant click
   */
  handleAssistantClick(assistantId) {
    if (!this.game) return;
    
    // Get real assistant data
    const assistants = this.getRealAssistants();
    const assistant = assistants.find(a => a.id === assistantId);
    
    // Handle both flat and nested game state structures
    const gameState = this.game.gameState || this.game;
    
    if (assistant && gameState.snowballs >= assistant.calculatedCost) {
      // Deduct cost
      gameState.snowballs -= assistant.calculatedCost;
      
      // Increment assistant count
      if (!gameState.assistants) {
        gameState.assistants = {};
      }
      gameState.assistants[assistantId] = (gameState.assistants[assistantId] || 0) + 1;
      
      // Save game if save manager exists
      if (this.game.saveManager && typeof this.game.saveManager.saveGame === 'function') {
        this.game.saveManager.saveGame();
      }
      
      // Emit assistant purchased event for momentum tracking
      if (window.eventBus) {
        window.eventBus.emit('assistantPurchased', {
          assistantId: assistantId,
          count: gameState.assistants[assistantId],
          cost: assistant.calculatedCost
        });
      }
      
      // Force immediate SPS update
      this.forceSPSUpdate();
      
      // Force immediate update of right column
      this.forceUpdateRightColumn();
      
      // Queue updates
      this.queueUpdate('all', 1); // Critical priority
    }
  }

  /**
   * Handle assistant level up
   */
  handleLevelUp(assistantId) {
    if (!this.game) return;
    
    // Handle both flat and nested game state structures
    const gameState = this.game.gameState || this.game;
    
    // Get current level and icicle count
    const currentLevel = gameState.assistantLevels?.[assistantId] || 0;
    const icicleCount = gameState.icicles || 0;
    const levelUpCost = currentLevel + 1; // Level 1 costs 1 icicle, level 2 costs 2 icicles, etc.
    
    if (icicleCount >= levelUpCost) {
      // Deduct icicles
      gameState.icicles -= levelUpCost;
      
      // Increment level
      if (!gameState.assistantLevels) {
        gameState.assistantLevels = {};
      }
      gameState.assistantLevels[assistantId] = currentLevel + 1;
      
      // Save game if save manager exists
      if (this.game.saveManager && typeof this.game.saveManager.saveGame === 'function') {
        this.game.saveManager.saveGame();
      }
      
      // Force immediate SPS recalculation
      this.forceSPSUpdate();
      
      // Force immediate update of right column
      this.forceUpdateRightColumn();
      
      // Queue updates
      this.queueUpdate('all', 1); // Critical priority
    }
  }

  /**
   * Set up event listeners (placeholders for now)
   */
  setupEventListeners() {
    // Save button
    const saveBtn = document.getElementById('save-button');
    if (saveBtn) {
      saveBtn.onclick = () => {
        if (this.game && this.game.saveManager && typeof this.game.saveManager.saveGame === 'function') {
          this.game.saveManager.saveGame();
          this.setBannerStatus('Game Saved!');
          setTimeout(() => this.setBannerStatus('Game Ready'), 1500);
        } else {
          this.setBannerStatus('Save unavailable');
        }
      };
    }
    // Profile button
    const profileBtn = document.getElementById('profile-button');
    if (profileBtn) {
      profileBtn.onclick = () => {
        // console.log('[UI] Profile button clicked');
        this.setBannerStatus('Profile button clicked');
        setTimeout(() => this.setBannerStatus('Game Ready'), 1000);
      };
    }
    
    // Setup jump event listeners
    this.setupJumpEventListeners();
    
    // Initial tooltip update
    setTimeout(() => {
      this.updateJumpTooltip();
    }, 100);
    
    // Force tooltip update after a longer delay to ensure DOM is ready
    setTimeout(() => {
              // console.log('[JUMP] Forcing tooltip update...');
      this.updateJumpTooltip();
    }, 1000);
  }

  /**
   * Update achievements with current game data
   */
  updateAchievements() {
    if (!this.game) return;

    try {
      this.updateAchievementCategory('clicks', 'clicks-achievements', 'clicks-tracker');
      this.updateAchievementCategory('economy', 'economy-achievements', 'economy-tracker');
      this.updateAchievementCategory('assistants', 'assistants-achievements', 'assistants-tracker');
      this.updateAchievementCategory('upgrades', 'upgrades-achievements', 'upgrades-tracker');
      this.updateAchievementCategory('jumps', 'jumps-achievements', 'jumps-tracker');
      this.updateAchievementCategory('time', 'time-achievements', 'time-tracker');
      this.updateAchievementCategory('streaks', 'streaks-achievements', 'streaks-tracker');
      this.updateAchievementCategory('abilities', 'abilities-achievements', 'abilities-tracker');
      this.updateAchievementCategory('yetis', 'yetis-achievements', 'yetis-tracker');
      this.updateAchievementCategory('locations', 'locations-achievements', 'locations-tracker');
      this.updateAchievementCategory('icicles', 'icicles-achievements', 'icicles-tracker');
      this.updateAchievementCategory('battles', 'battles-achievements', 'battles-tracker');
      this.updateAchievementCategory('sps', 'sps-achievements', 'sps-tracker');
      this.updateAchievementCategory('crystalSnowballs', 'crystalSnowballs-achievements', 'crystalSnowballs-tracker');
      this.updateAchievementCategory('snowflakes', 'snowflakes-achievements', 'snowflakes-tracker');
      this.updateAchievementCategory('snowflakeTree', 'snowflakeTree-achievements', 'snowflakeTree-tracker');
      this.updateAchievementCategory('babyYeti', 'babyYeti-achievements', 'babyYeti-tracker');
    } catch (error) {
      console.error('[ACHIEVEMENTS] Update error:', error);
    }
  }

  /**
   * Update a specific achievement category
   */
  updateAchievementCategory(category, gridId, trackerId) {
    const grid = document.getElementById(gridId);
    const tracker = document.getElementById(trackerId);
    if (!grid || !tracker) return;

    // Get achievements from the game (placeholder for now)
    const achievements = this.getAchievementsByCategory(category);
    const unlockedCount = achievements.filter(achievement => achievement.unlocked_at !== null).length;
    
    // Update tracker
    tracker.textContent = `${unlockedCount}/${achievements.length}`;

    // Create achievement items
    let achievementsHTML = '';
    achievements.forEach(achievement => {
      const isUnlocked = achievement.unlocked_at !== null;
      const className = isUnlocked ? 'achievement-item unlocked' : 'achievement-item locked';
      achievementsHTML += `
        <div class="${className}" title="${achievement.name}">
          ${achievement.icon}
          <div class="achievement-tooltip">
            <strong>${achievement.name}</strong><br>
            ${achievement.description}
          </div>
        </div>
      `;
    });

    grid.innerHTML = achievementsHTML;
  }

  /**
   * Get achievements by category (real implementation)
   */
  getAchievementsByCategory(category) {
    if (!this.game || !this.game.achievements) {
      return [];
    }

    // Use the real achievement system to get data
    if (window.getAchievementsByCategory) {
      const allCategories = window.getAchievementsByCategory(this.game);
      return allCategories[category] || [];
    }

    // Fallback to placeholder data if real system not available
    const achievementData = {
      clicks: [
            { id: 'clicks_100', name: 'First Flakes', description: 'Generate 100 snowballs from clicks.', icon: '❄️', unlocked_at: null },
    { id: 'clicks_1k', name: 'Click Master', description: 'Generate 1,000 snowballs from clicks.', icon: '❄️❄️', unlocked_at: null },
    { id: 'clicks_10k', name: 'Click Legend', description: 'Generate 10,000 snowballs from clicks.', icon: '❄️❄️❄️', unlocked_at: null },
    { id: 'clicks_100k', name: 'Click God', description: 'Generate 100,000 snowballs from clicks.', icon: '👑', unlocked_at: null },
    { id: 'clicks_1m', name: 'Click Deity', description: 'Generate 1,000,000 snowballs from clicks.', icon: '⚡👑', unlocked_at: null }
      ],
      economy: [
        { id: 'snowballs_10k', name: 'Snowball Collector', description: 'Accumulate 10,000 snowballs.', icon: '💰', unlocked_at: null },
        { id: 'snowballs_1m', name: 'Snowball Tycoon', description: 'Accumulate 1 million snowballs.', icon: '💎', unlocked_at: null },
        { id: 'snowballs_100m', name: 'Snowball Empire', description: 'Accumulate 100 million snowballs.', icon: '🏰', unlocked_at: null },
        { id: 'snowballs_1b', name: 'Snowball Billionaire', description: 'Accumulate 1 billion snowballs.', icon: '💎👑', unlocked_at: null },
        { id: 'snowballs_1t', name: 'Snowball Trillionaire', description: 'Accumulate 1 trillion snowballs.', icon: '🏛️', unlocked_at: null }
      ],
      assistants: [
        { id: 'assistants_10', name: 'Team Builder', description: 'Own 10 assistants.', icon: '👥', unlocked_at: null },
        { id: 'assistants_50', name: 'Frosty Workforce', description: 'Own 50 assistants.', icon: '🏭', unlocked_at: null },
        { id: 'assistants_100', name: 'Snowball Army', description: 'Own 100 assistants.', icon: '⚔️', unlocked_at: null },
        { id: 'assistants_500', name: 'Frost Legion', description: 'Own 500 assistants.', icon: '🛡️', unlocked_at: null },
        { id: 'assistants_1k', name: 'Snowball Dynasty', description: 'Own 1,000 assistants.', icon: '👑⚔️', unlocked_at: null }
      ],
      upgrades: [
        { id: 'upgrades_10', name: 'Upgrade Enthusiast', description: 'Buy 10 upgrades.', icon: '🔧', unlocked_at: null },
        { id: 'upgrades_50', name: 'Upgrade Master', description: 'Buy 50 upgrades.', icon: '⚙️', unlocked_at: null },
        { id: 'upgrades_100', name: 'Upgrade Legend', description: 'Buy 100 upgrades.', icon: '🔮', unlocked_at: null },
        { id: 'upgrades_250', name: 'Upgrade Sage', description: 'Buy 250 upgrades.', icon: '🧙‍♂️', unlocked_at: null },
        { id: 'upgrades_500', name: 'Upgrade Deity', description: 'Buy 500 upgrades.', icon: '⚡🔮', unlocked_at: null }
      ],
      jumps: [
        { id: 'jumps_1', name: 'First Jump', description: 'Complete your first jump.', icon: '🚀', unlocked_at: null },
        { id: 'jumps_5', name: 'Dimensional Traveler', description: 'Complete 5 jumps.', icon: '🌌', unlocked_at: null },
        { id: 'jumps_10', name: 'Reality Hopper', description: 'Complete 10 jumps.', icon: '🌍', unlocked_at: null },
        { id: 'jumps_25', name: 'Dimension Master', description: 'Complete 25 jumps.', icon: '🌌🌍', unlocked_at: null },
        { id: 'jumps_50', name: 'Reality Architect', description: 'Complete 50 jumps.', icon: '🏗️🌌', unlocked_at: null }
      ],
      time: [
        { id: 'time_1hr', name: 'Dedicated Player', description: 'Play for 1 hour.', icon: '⏰', unlocked_at: null },
        { id: 'time_5hr', name: 'Snowball Veteran', description: 'Play for 5 hours.', icon: '⏱️', unlocked_at: null },
        { id: 'time_24hr', name: 'Snowball Master', description: 'Play for 24 hours.', icon: '🕐', unlocked_at: null },
        { id: 'time_100hr', name: 'Snowball Sage', description: 'Play for 100 hours.', icon: '🧙‍♂️⏰', unlocked_at: null },
        { id: 'time_1000hr', name: 'Snowball Immortal', description: 'Play for 1,000 hours.', icon: '👑⏰', unlocked_at: null }
      ],
      streaks: [
        { id: 'click_streak_tier_1', name: 'Quick Fingers', description: 'Maintain 5+ clicks/sec for 1 second.', icon: '⚡', unlocked_at: null },
        { id: 'click_streak_tier_2', name: 'Rapid Fire', description: 'Maintain 5+ clicks/sec for 5 seconds.', icon: '🔥', unlocked_at: null },
        { id: 'click_streak_tier_3', name: 'Lightning Clicks', description: 'Maintain 5+ clicks/sec for 10 seconds.', icon: '⚡⚡', unlocked_at: null },
        { id: 'click_streak_tier_4', name: 'Thunder Hands', description: 'Maintain 5+ clicks/sec for 20 seconds.', icon: '⛈️', unlocked_at: null },
        { id: 'click_streak_tier_5', name: 'Storm Master', description: 'Maintain 5+ clicks/sec for 50 seconds.', icon: '🌪️', unlocked_at: null },
        { id: 'click_streak_tier_6', name: 'Click God', description: 'Maintain 5+ clicks/sec for 100 seconds.', icon: '👑⚡', unlocked_at: null }
      ],
      abilities: [
        { id: 'abilities_1', name: 'Ability User', description: 'Use your first ability.', icon: '✨', unlocked_at: null },
        { id: 'abilities_10', name: 'Ability Novice', description: 'Use 10 abilities.', icon: '🌟', unlocked_at: null },
        { id: 'abilities_100', name: 'Ability Master', description: 'Use 100 abilities.', icon: '⭐', unlocked_at: null },
        { id: 'abilities_1000', name: 'Ability Sage', description: 'Use 1,000 abilities.', icon: '💫', unlocked_at: null },
        { id: 'combo_1', name: 'Combo Creator', description: 'Create your first ability combo.', icon: '🎯', unlocked_at: null },
        { id: 'combo_10', name: 'Combo Expert', description: 'Create 10 ability combos.', icon: '🎯🎯', unlocked_at: null }
      ],
      yetis: [
        { id: 'yetis_1', name: 'Yeti Spotter', description: 'Spot your first yeti.', icon: '🧊', unlocked_at: null },
        { id: 'yetis_10', name: 'Yeti Tracker', description: 'Spot 10 yetis.', icon: '🧊🧊', unlocked_at: null },
        { id: 'yetis_50', name: 'Yeti Hunter', description: 'Spot 50 yetis.', icon: '🏹', unlocked_at: null },
        { id: 'yetis_100', name: 'Yeti Master', description: 'Spot 100 yetis.', icon: '👑🧊', unlocked_at: null },
        { id: 'yeti_rare_1', name: 'Rare Yeti Finder', description: 'Find a rare yeti variant.', icon: '💎🧊', unlocked_at: null }
      ],
      locations: [
        { id: 'locations_1', name: 'Explorer', description: 'Unlock your first location.', icon: '🗺️', unlocked_at: null },
        { id: 'locations_5', name: 'World Explorer', description: 'Unlock 5 locations.', icon: '🌍', unlocked_at: null },
        { id: 'locations_10', name: 'Globe Trotter', description: 'Unlock 10 locations.', icon: '🌎', unlocked_at: null },
        { id: 'locations_all', name: 'World Master', description: 'Unlock all available locations.', icon: '👑🌍', unlocked_at: null },
        { id: 'travel_100', name: 'Frequent Traveler', description: 'Travel 100 times.', icon: '✈️', unlocked_at: null }
      ],
      icicles: [
        { id: 'icicles_1', name: 'Icicle Harvester', description: 'Harvest your first icicle.', icon: '🧊', unlocked_at: null },
        { id: 'icicles_10', name: 'Icicle Collector', description: 'Harvest 10 icicles.', icon: '🧊🧊', unlocked_at: null },
        { id: 'icicles_100', name: 'Icicle Master', description: 'Harvest 100 icicles.', icon: '❄️', unlocked_at: null },
        { id: 'icicles_1000', name: 'Icicle Sage', description: 'Harvest 1,000 icicles.', icon: '❄️❄️', unlocked_at: null },
        { id: 'icicle_level_1', name: 'Level Up', description: 'Use an icicle to level up an assistant.', icon: '⬆️', unlocked_at: null }
      ],
      battles: [
        { id: 'battles_1', name: 'First Battle', description: 'Win your first battle.', icon: '⚔️', unlocked_at: null },
        { id: 'battles_10', name: 'Battle Veteran', description: 'Win 10 battles.', icon: '🛡️', unlocked_at: null },
        { id: 'battles_50', name: 'Battle Master', description: 'Win 50 battles.', icon: '⚔️🛡️', unlocked_at: null },
        { id: 'battles_100', name: 'Battle Legend', description: 'Win 100 battles.', icon: '👑⚔️', unlocked_at: null },
        { id: 'battle_streak_5', name: 'Victory Streak', description: 'Win 5 battles in a row.', icon: '🔥⚔️', unlocked_at: null }
      ],
             sps: [
         { id: 'snowball_mist', name: 'Snowball Mist', description: 'Generate 10+ snowballs per second.', icon: './images/sps.png', unlocked_at: null },
         { id: 'snowball_flurry', name: 'Snowball Flurry', description: 'Generate 100+ snowballs per second.', icon: './images/sps.png', unlocked_at: null },
         { id: 'snowball_rain', name: 'Snowball Rain', description: 'Generate 1,000+ snowballs per second.', icon: './images/sps.png', unlocked_at: null },
         { id: 'snowball_storm', name: 'Snowball Storm', description: 'Generate 10,000+ snowballs per second.', icon: './images/sps.png', unlocked_at: null },
         { id: 'snowball_hurricane', name: 'Snowball Hurricane', description: 'Generate 100,000+ snowballs per second.', icon: './images/sps.png', unlocked_at: null }
       ],
       crystalSnowballs: [
         { id: 'crystal_snowballs_1', name: 'Crystal Collector', description: 'Collect your first crystal snowball.', icon: '💎', unlocked_at: null },
         { id: 'crystal_snowballs_10', name: 'Crystal Enthusiast', description: 'Collect 10 crystal snowballs.', icon: '💎💎', unlocked_at: null },
         { id: 'crystal_snowballs_100', name: 'Crystal Master', description: 'Collect 100 crystal snowballs.', icon: '💎💎💎', unlocked_at: null },
         { id: 'crystal_snowballs_1000', name: 'Crystal Sage', description: 'Collect 1,000 crystal snowballs.', icon: '💎💎💎💎', unlocked_at: null },
         { id: 'crystal_snowballs_10000', name: 'Crystal Deity', description: 'Collect 10,000 crystal snowballs.', icon: '👑💎', unlocked_at: null }
       ],
       snowflakes: [
         { id: 'snowflakes_1', name: 'Snowflake Finder', description: 'Find your first snowflake.', icon: '❄️', unlocked_at: null },
         { id: 'snowflakes_10', name: 'Snowflake Collector', description: 'Find 10 snowflakes.', icon: '❄️❄️', unlocked_at: null },
         { id: 'snowflakes_100', name: 'Snowflake Master', description: 'Find 100 snowflakes.', icon: '❄️❄️❄️', unlocked_at: null },
         { id: 'snowflakes_1000', name: 'Snowflake Sage', description: 'Find 1,000 snowflakes.', icon: '❄️❄️❄️❄️', unlocked_at: null },
         { id: 'snowflakes_10000', name: 'Snowflake Deity', description: 'Find 10,000 snowflakes.', icon: '👑❄️', unlocked_at: null }
       ],
       snowflakeTree: [
         { id: 'snowflake_tree_1', name: 'Tree Planter', description: 'Purchase your first snowflake tree upgrade.', icon: '🌳', unlocked_at: null },
         { id: 'snowflake_tree_5', name: 'Tree Gardener', description: 'Purchase 5 snowflake tree upgrades.', icon: '🌳🌳', unlocked_at: null },
         { id: 'snowflake_tree_10', name: 'Tree Master', description: 'Purchase 10 snowflake tree upgrades.', icon: '🌳🌳🌳', unlocked_at: null },
         { id: 'snowflake_tree_25', name: 'Tree Sage', description: 'Purchase 25 snowflake tree upgrades.', icon: '🌳🌳🌳🌳', unlocked_at: null },
         { id: 'snowflake_tree_50', name: 'Tree Deity', description: 'Purchase 50 snowflake tree upgrades.', icon: '👑🌳', unlocked_at: null }
       ],
       babyYeti: [
         { id: 'baby_yeti_1', name: 'Baby Yeti Parent', description: 'Own your first Baby Yeti.', icon: '👶', unlocked_at: null },
         { id: 'baby_yeti_5', name: 'Baby Yeti Family', description: 'Own 5 Baby Yetis.', icon: '👶👶', unlocked_at: null },
         { id: 'baby_yeti_10', name: 'Baby Yeti Herd', description: 'Own 10 Baby Yetis.', icon: '👶👶👶', unlocked_at: null },
         { id: 'baby_yeti_25', name: 'Baby Yeti Colony', description: 'Own 25 Baby Yetis.', icon: '👶👶👶👶', unlocked_at: null },
         { id: 'baby_yeti_50', name: 'Baby Yeti Empire', description: 'Own 50 Baby Yetis.', icon: '👑👶', unlocked_at: null }
       ]
    };

    return achievementData[category] || [];
  }

  /**
   * Update lore with current game data
   */
  updateLore() {
    if (!this.game || this.activeTab !== 'lore') return;

    try {
      // Import and use the real lore system
      import('../global/lore.js').then(({ renderLoreUI, getLoreProgress }) => {
        // Update progress bar
        this.updateLoreProgress();
        
        // Render the full lore UI with book/chapter structure
        renderLoreUI(this.game);
        
        // Set up click handlers for lore items
        this.setupLoreClickHandlers();
        
      }).catch(error => {
        console.error('[LORE] Failed to load lore system:', error);
      });
    } catch (error) {
      console.error('[LORE] Update error:', error);
    }
  }

  /**
   * Update lore progress bar
   */
  updateLoreProgress() {
    const progressFill = document.getElementById('lore-progress-fill');
    const progressText = document.getElementById('lore-progress-text');
    
    if (!progressFill || !progressText || !this.game.lore) return;
    
    const { unlocked, total } = this.getLoreProgress();
    const percentage = total > 0 ? (unlocked / total) * 100 : 0;
    
    progressFill.style.width = `${percentage}%`;
    progressText.textContent = `${unlocked}/${total}`;
  }

  /**
   * Get lore progress from the game state
   */
  getLoreProgress() {
    if (!this.game.lore) return { unlocked: 0, total: 0 };
    
    const unlocked = this.game.lore.unlocked.length;
    
    // Use the known total from loreData for immediate response
    // The actual count is 183 based on the loreData structure
    const total = 183;
    
    return { unlocked, total };
  }

  /**
   * Set up click handlers for lore items
   */
  setupLoreClickHandlers() {
    // Find all lore items and add click handlers only to unlocked items
    const loreItems = document.querySelectorAll('.lore-item');
    loreItems.forEach(item => {
      // Only add click handler if the item is unlocked (not locked)
      if (!item.classList.contains('locked')) {
        item.addEventListener('click', (e) => {
          const loreId = item.dataset.loreId;
          if (loreId) {
            this.showLoreModal(loreId);
          }
        });
      }
    });
  }

  /**
   * Show lore modal with full content
   */
  showLoreModal(loreId) {
    const modal = document.getElementById('lore-modal');
    const modalIcon = document.getElementById('lore-modal-icon');
    const modalTitle = document.getElementById('lore-modal-title');
    const modalContent = document.getElementById('lore-modal-content');
    const modalTimestamp = document.getElementById('lore-modal-timestamp');
    
    if (!modal || !this.game.lore) return;
    
    // Check if the lore item is unlocked before showing modal
    if (!this.game.lore.unlocked.includes(loreId)) {
      return; // Don't show modal for locked lore items
    }
    
    // Find the lore entry
    import('../global/data/loreData.js').then(({ LORE }) => {
      let loreEntry = null;
      
      for (const book of LORE.books) {
        for (const chapter of book.chapters) {
          const found = chapter.lore.find(lore => lore.id === loreId);
          if (found) {
            loreEntry = found;
            break;
          }
        }
        if (loreEntry) break;
      }
      
      if (loreEntry) {
        // Update modal content
        modalIcon.src = loreEntry.icon;
        modalTitle.textContent = loreEntry.title;
        modalContent.textContent = loreEntry.content;
        
        // Show timestamp if available
        const timestamp = this.game.lore.unlockedTimestamps[loreId];
        if (timestamp) {
          const date = new Date(timestamp);
          modalTimestamp.textContent = `Unlocked: ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
        } else {
          modalTimestamp.textContent = '';
        }
        
        // Mark as viewed
        if (this.game.lore.unlocked.includes(loreId)) {
          this.game.lore.viewed[loreId] = true;
          this.game.save();
          
          // Update the UI to reflect viewed state
          this.updateLore();
        }
        
        // Show modal
        modal.style.display = 'flex';
      }
    }).catch(error => {
      console.error('[LORE] Failed to load lore data for modal:', error);
    });
  }

  /**
   * Close lore modal
   */
  closeLoreModal() {
    const modal = document.getElementById('lore-modal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  /**
   * Update analog summary tab with current game data and past analogs
   */
  async updateJumpTab() {
    if (!this.game || this.activeTab !== 'jump') return;

    try {
      // Update current analog status
      this.updateCurrentAnalogStatus();
      
      // Update past analogs grid
      this.updatePastAnalogsGrid();
      
    } catch (error) {
      console.error('[ANALOG_SUMMARY] Update error:', error);
    }
  }

  /**
   * Update current analog status section
   */
  updateCurrentAnalogStatus() {
    const elements = {
      'current-analog-number': this.game.analogNumber || 1,
      'current-analog-snowballs': formatNumber(this.game.snowballs || 0),
      'current-analog-sps': formatSPS(this.game.sps || 0)
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  /**
   * Update past analogs grid with 4-column layout
   */
  updatePastAnalogsGrid() {
    const analogsGrid = document.getElementById('analogs-grid');
    const noAnalogsMessage = document.getElementById('no-analogs-message');
    
    if (!analogsGrid || !noAnalogsMessage) return;
    
    const analogs = this.game.analogs || [];
    
    if (analogs.length === 0) {
      analogsGrid.style.display = 'none';
      noAnalogsMessage.style.display = 'block';
      return;
    }
    
    analogsGrid.style.display = 'grid';
    noAnalogsMessage.style.display = 'none';
    
    // Create 4-column grid layout
    let gridHTML = '';
    
    // Process analogs in order (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, etc.)
    // Layout: Row 1: 1,2,3,4 | Row 2: 5,6,7,8 | Row 3: 9,10,11,12 | etc.
    for (let i = 0; i < analogs.length; i++) {
      const analog = analogs[i];
      const analogNumber = analog.number || (i + 1);
      
      // Calculate total assistants
      const totalAssistants = Object.values(analog.assistants || {}).reduce((sum, count) => sum + (Number(count) || 0), 0);
      
      gridHTML += `
        <div class="analog-card" data-analog="${analogNumber}">
          <div class="analog-header">
            <h4>Echo ${analogNumber}</h4>
          </div>
          <div class="analog-stats">
            <div class="stat-item">
              <span class="stat-label">Snowballs:</span>
              <span class="stat-value">${formatNumber(analog.lifetimeSnowballs || 0)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Ending SPS:</span>
              <span class="stat-value">${formatSPS(analog.finalSPS || 0)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Icicles:</span>
              <span class="stat-value">${formatNumber(analog.iciclesHarvested || 0)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Snowflakes:</span>
              <span class="stat-value">${formatNumber(analog.preMeltdownSnowflakes || 0)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Assistants:</span>
              <span class="stat-value">${totalAssistants}</span>
            </div>
          </div>
        </div>
      `;
    }
    
    analogsGrid.innerHTML = gridHTML;
  }

  /**
   * Update jump status information
   */
  async updateJumpStatus() {
    const analogNumber = this.game.analogNumber || 1;
    const currentSnowballs = this.game.snowballs || 0;
    const currentAnalogSnowballs = this.game.currentAnalogSnowballs || 0;
    
    // Update display (no threshold required)
    const elements = {
      'jump-analog-number': analogNumber,
      'jump-current-snowballs': formatNumber(currentAnalogSnowballs),
      'jump-status': 'Always Available',
      'jump-progress': '100%'
    };
    
    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  /**
   * Update jump button visibility and state
   */
  async updateJumpButton() {
    const triggerButton = document.getElementById('jump-trigger-button');
    const jumpInfo = document.getElementById('jump-info');
    
    if (!triggerButton || !jumpInfo) return;
    
    // Jump button is always available - show trigger button, hide info
    triggerButton.style.display = 'block';
    jumpInfo.style.display = 'none';
  }

  /**
   * Setup event listeners for jump system
   */
  setupJumpEventListeners() {
            // console.log('[JUMP] Setting up jump event listeners...');
    
    // Jump button in header
    const jumpButton = document.getElementById('jump-button');
            // console.log('[JUMP] Jump button found:', jumpButton);
    if (jumpButton && !jumpButton.hasEventListener) {
      jumpButton.addEventListener('click', () => {
                  // console.log('[JUMP] Jump button clicked!');
        this.handleHeaderJumpClick();
      });
      jumpButton.hasEventListener = true;
              // console.log('[JUMP] Jump button listener added');
    } else if (jumpButton) {
              // console.log('[JUMP] Jump button already has listener');
    } else {
              // console.log('[JUMP] Jump button not found in DOM');
    }
  }

  /**
   * Handle jump button click in header
   */
  async handleHeaderJumpClick() {
    if (!this.game) return;
    
    try {
      // Jump button is always active - show confirmation dialog directly
      this.showJumpConfirmationDialog();
    } catch (error) {
      console.error('[JUMP] Header jump click error:', error);
    }
  }
  /**
   * Show jump confirmation dialog
   */
  showJumpConfirmationDialog() {
    if (!this.game) return;
    
    // Calculate estimated snowflakes
    const estimatedSnowflakes = this.calculateEstimatedSnowflakes();
    
    // Create confirmation overlay
    const overlay = document.createElement('div');
    overlay.className = 'confirmation-overlay';
    overlay.innerHTML = `
      <div class="confirmation-dialog">
        <h2>Confirm Jump</h2>
        <p>You are about to jump. This will reset your current progress.</p>
        
        <div class="warning">
          <strong>⚠️ Warning:</strong> You will lose all progress in this echo, including:
          <ul style="text-align: left; margin: 10px 0;">
            <li>All snowballs</li>
            <li>All assistants</li>
            <li>All upgrades</li>
            <li>All boosts</li>
          </ul>
        </div>
        
        <div class="jump-info">
          <h4>Jump Information</h4>
          <p><strong>Current Echo:</strong> ${this.game.analogNumber || 1}</p>
          <p><strong>Next Echo:</strong> ${(this.game.analogNumber || 1) + 1}</p>
          <p><strong>Estimated Snowflakes:</strong> ${formatSnowballs(estimatedSnowflakes)}</p>
        <p><strong>Lifetime Snowballs:</strong> ${formatSnowballs(this.game.lifetimeSnowballs || 0)}</p>
        </div>
        
        <div class="confirmation-buttons">
          <button class="confirm-jump-button" id="confirm-jump-dialog">Confirm Jump</button>
          <button class="cancel-jump-button" id="cancel-jump-dialog">Cancel</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listeners
    const confirmButton = document.getElementById('confirm-jump-dialog');
    const cancelButton = document.getElementById('cancel-jump-dialog');
    
    if (confirmButton) {
      confirmButton.addEventListener('click', () => {
        overlay.remove();
        this.startJumpProcess();
      });
    }
    
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        overlay.remove();
      });
    }
    
    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.remove();
      }
    });
  }



  /**
   * Calculate estimated snowflakes from current assets
   */
  calculateEstimatedSnowflakes() {
    if (!this.game) return 0;
    
    let totalSnowflakes = 0;
    
    // Snowball conversion
    const snowballSnowflakes = Math.floor((this.game.lifetimeSnowballs || 0) / (this.game.snowflakeCost || 1000000));
    totalSnowflakes += snowballSnowflakes;
    
    // Assistant conversion (estimate)
    const assistants = this.getRealAssistants();
    assistants.forEach(assistant => {
      const owned = assistant.quantity || 0;
      if (owned > 0) {
        const sellValueSnowballs = Math.floor(owned * assistant.cost * (assistant.sellRate || 0.25));
        const sellValueSnowflakes = Math.floor(sellValueSnowballs / (this.game.snowflakeCost || 1000000));
        totalSnowflakes += sellValueSnowflakes;
      }
    });
    
    return totalSnowflakes;
  }

  /**
   * Start the jump process
   */
  async startJumpProcess() {
    if (!this.game) return;
    
    try {
      // Import and call the triggerJump function
      const { triggerJump } = await import('../meta/jump.js');
      await triggerJump(this.game);
      
      // Show jump overlay and go directly to snowflake shop (skip meltdown)
      this.showJumpOverlay();
      this.showSnowflakeShopInOverlay();
    } catch (error) {
      console.error('[JUMP] Start jump process error:', error);
    }
  }

  /**
   * Update jump tooltip with current information
   */
  async updateJumpTooltip() {
    if (!this.game) {
              // console.log('[JUMP] No game state available for tooltip update');
      return;
    }
    
    const tooltip = document.getElementById('jump-tooltip');
    if (!tooltip) {
              // console.log('[JUMP] Tooltip element not found');
      return;
    }
    
          // console.log('[JUMP] Updating tooltip...');
    
    try {
      const currentAnalogSnowballs = this.game.currentAnalogSnowballs || 0;
      const estimatedSnowflakes = this.calculateEstimatedSnowflakes();
      
      let tooltipContent = `
        <span style="color: var(--color-secondary-accent);">Echo Jump</span><br><br>
        <span style="color: var(--color-secondary-accent);"><strong>Current Echo:</strong></span> <span style="color: white;">${this.game.analogNumber || 1}</span><br>
        <span style="color: var(--color-secondary-accent);"><strong>Current Snowballs:</strong></span> <span style="color: white;">${formatSnowballs(currentAnalogSnowballs)}</span><br><br>
        <span style="color: var(--color-secondary-accent);"><strong>Estimated Snowflakes:</strong></span> <span style="color: white;">${formatSnowballs(estimatedSnowflakes)}</span><br>
        <span style="color: var(--color-secondary-accent);"><strong>Exchange for powerful upgrades</strong></span><br><br>
        <span style="color: white;"><em>Click to start jump process</em></span>
      `;
      
      tooltip.innerHTML = tooltipContent;
      
              // console.log('[JUMP] Tooltip updated successfully');
        // console.log('[JUMP] Tooltip content:', tooltipContent);
        // console.log('[JUMP] Tooltip element:', tooltip);
      
    } catch (error) {
      console.error('[JUMP] Tooltip update error:', error);
      tooltip.innerHTML = 'Error loading jump info';
    }
  }



  /**
   * Show meltdown view
   */
  showMeltdownView() {
    const jumpStatusSection = document.getElementById('jump-status-section');
    const jumpButtonSection = document.getElementById('jump-button-section');
    const meltdownSection = document.getElementById('meltdown-section');
    
    if (jumpStatusSection) jumpStatusSection.style.display = 'none';
    if (jumpButtonSection) jumpButtonSection.style.display = 'none';
    if (meltdownSection) meltdownSection.style.display = 'block';
    
    // Initialize meltdown UI
    this.initializeMeltdownUI();
  }

  /**
   * Initialize meltdown UI
   */
  initializeMeltdownUI() {
    this.updateMeltdownSnowballs();
    this.updateMeltdownAssistants();
    this.setupMeltdownEventListeners();
  }

  /**
   * Update meltdown snowballs section
   */
  updateMeltdownSnowballs() {
    const availableElement = document.getElementById('meltdown-snowballs-available');
    const rateElement = document.getElementById('meltdown-conversion-rate');
    
    if (availableElement) {
      availableElement.textContent = formatNumber(this.game.snowballs || 0);
    }
    
    if (rateElement) {
      const cost = this.game.snowflakeCost || 1000000; // Default to 1M if not set
      rateElement.textContent = `${formatNumber(cost)} snowballs = 1 snowflake`;
    }
  }

  /**
   * Update meltdown assistants section
   */
  updateMeltdownAssistants() {
    const grid = document.getElementById('meltdown-assistants-grid');
    if (!grid) return;
    
    const assistants = this.getRealAssistants();
    let html = '';
    
    assistants.forEach(assistant => {
      const owned = this.game.assistants[assistant.id] || 0;
      if (owned > 0) {
        const sellValue = Math.floor(owned * assistant.cost * assistant.sellRate);
        html += `
          <div class="assistant-conversion-item">
            <div class="assistant-info">
              <span class="assistant-name">${assistant.name}</span>
              <span class="assistant-owned">Owned: ${owned}</span>
            </div>
            <div class="conversion-controls">
              <button class="sell-all-button" data-assistant="${assistant.id}">Sell All (${formatNumber(sellValue)} snowflakes)</button>
              <button class="sell-half-button" data-assistant="${assistant.id}">Sell Half</button>
            </div>
          </div>
        `;
      }
    });
    
    grid.innerHTML = html;
  }

  /**
   * Setup meltdown event listeners
   */
  setupMeltdownEventListeners() {
    // Snowball conversion buttons
    const convertAllButton = document.getElementById('meltdown-convert-all-snowballs');
    const convertHalfButton = document.getElementById('meltdown-convert-half-snowballs');
    const convertCustomButton = document.getElementById('meltdown-convert-custom-snowballs');
    const completeButton = document.getElementById('meltdown-complete-button');
    
    if (convertAllButton && !convertAllButton.hasEventListener) {
      convertAllButton.addEventListener('click', () => this.convertAllSnowballs());
      convertAllButton.hasEventListener = true;
    }
    
    if (convertHalfButton && !convertHalfButton.hasEventListener) {
      convertHalfButton.addEventListener('click', () => this.convertHalfSnowballs());
      convertHalfButton.hasEventListener = true;
    }
    
    if (convertCustomButton && !convertCustomButton.hasEventListener) {
      convertCustomButton.addEventListener('click', () => this.convertCustomSnowballs());
      convertCustomButton.hasEventListener = true;
    }
    
    if (completeButton && !completeButton.hasEventListener) {
      completeButton.addEventListener('click', () => this.completeMeltdown());
      completeButton.hasEventListener = true;
    }
    
    // Assistant sell buttons (delegated)
    const grid = document.getElementById('meltdown-assistants-grid');
    if (grid && !grid.hasEventListener) {
      grid.addEventListener('click', (e) => this.handleAssistantSell(e));
      grid.hasEventListener = true;
    }
  }

  /**
   * Convert all snowballs to snowflakes
   */
  convertAllSnowballs() {
    const amount = this.game.snowballs || 0;
    this.convertSnowballs(amount);
  }

  /**
   * Convert half of snowballs to snowflakes
   */
  convertHalfSnowballs() {
    const amount = Math.floor((this.game.snowballs || 0) / 2);
    this.convertSnowballs(amount);
  }

  /**
   * Convert custom amount of snowballs
   */
  convertCustomSnowballs() {
    const input = document.getElementById('meltdown-snowballs-amount');
    const amount = parseInt(input.value) || 0;
    this.convertSnowballs(amount);
  }

  /**
   * Convert snowballs to snowflakes
   */
  convertSnowballs(amount) {
    if (amount <= 0 || amount > (this.game.snowballs || 0)) return;
    
    this.game.snowballs -= amount;
    this.game.snowflakes = (this.game.snowflakes || 0) + amount;
    
    // Update meltdown state
    if (!this.game.meltdownState) {
      this.game.meltdownState = { snowballsConverted: 0, assistantsSold: {}, totalSnowflakesEarned: 0 };
    }
    this.game.meltdownState.snowballsConverted += amount;
    this.game.meltdownState.totalSnowflakesEarned += amount;
    
    // Update UI
    this.updateMeltdownSnowballs();
    this.updateMeltdownSummary();
  }

  /**
   * Handle assistant sell button clicks
   */
  handleAssistantSell(e) {
    if (e.target.classList.contains('sell-all-button')) {
      const assistantId = e.target.dataset.assistant;
      this.sellAllAssistants(assistantId);
    } else if (e.target.classList.contains('sell-half-button')) {
      const assistantId = e.target.dataset.assistant;
      this.sellHalfAssistants(assistantId);
    }
  }

  /**
   * Sell all of a specific assistant
   */
  sellAllAssistants(assistantId) {
    const assistants = this.getRealAssistants();
    const assistant = assistants.find(a => a.id === assistantId);
    if (!assistant) return;
    
    const owned = this.game.assistants[assistantId] || 0;
    const sellValue = Math.floor(owned * assistant.cost * assistant.sellRate);
    
    this.game.assistants[assistantId] = 0;
    this.game.snowflakes = (this.game.snowflakes || 0) + sellValue;
    
    // Update meltdown state
    if (!this.game.meltdownState) {
      this.game.meltdownState = { snowballsConverted: 0, assistantsSold: {}, totalSnowflakesEarned: 0 };
    }
    this.game.meltdownState.assistantsSold[assistantId] = owned;
    this.game.meltdownState.totalSnowflakesEarned += sellValue;
    
    // Update UI
    this.updateMeltdownAssistants();
    this.updateMeltdownSummary();
  }

  /**
   * Sell half of a specific assistant
   */
  sellHalfAssistants(assistantId) {
    const assistants = this.getRealAssistants();
    const assistant = assistants.find(a => a.id === assistantId);
    if (!assistant) return;
    
    const owned = this.game.assistants[assistantId] || 0;
    const sellAmount = Math.floor(owned / 2);
    const sellValue = Math.floor(sellAmount * assistant.cost * assistant.sellRate);
    
    this.game.assistants[assistantId] = owned - sellAmount;
    this.game.snowflakes = (this.game.snowflakes || 0) + sellValue;
    
    // Update meltdown state
    if (!this.game.meltdownState) {
      this.game.meltdownState = { snowballsConverted: 0, assistantsSold: {}, totalSnowflakesEarned: 0 };
    }
    this.game.meltdownState.assistantsSold[assistantId] = (this.game.meltdownState.assistantsSold[assistantId] || 0) + sellAmount;
    this.game.meltdownState.totalSnowflakesEarned += sellValue;
    
    // Update UI
    this.updateMeltdownAssistants();
    this.updateMeltdownSummary();
  }

  /**
   * Update meltdown summary
   */
  updateMeltdownSummary() {
    const totalElement = document.getElementById('meltdown-total-snowflakes');
    if (totalElement && this.game.meltdownState) {
      totalElement.textContent = formatNumber(this.game.meltdownState.totalSnowflakesEarned);
    }
  }

  /**
   * Complete meltdown and show snowflake shop
   */
  async completeMeltdown() {
    // Show snowflake shop in overlay
    this.showSnowflakeShopInOverlay();
  }

  /**
   * Initialize snowflake shop
   */
  async initializeSnowflakeShop() {
    this.updateSnowflakeShopBalance();
    await this.updateSnowflakeCategories();
    this.setupSnowflakeShopEventListeners();
  }

  /**
   * Update snowflake shop balance
   */
  updateSnowflakeShopBalance() {
    const balanceElement = document.getElementById('shop-snowflakes-balance');
    if (balanceElement) {
      balanceElement.textContent = formatNumber(this.game.snowflakes || 0);
    }
  }

  /**
   * Update snowflake categories
   */
  async updateSnowflakeCategories() {
    const categoriesContainer = document.getElementById('snowflake-categories');
    if (!categoriesContainer) return;
    
    // Import snowflake tree functions
    const { getAvailableCategories, getUpgradesByCategory } = await import('../meta/snowflakeTree.js');
    const categories = getAvailableCategories();
    
    let html = '';
    categories.forEach(category => {
      const upgrades = getUpgradesByCategory(category);
      const ownedCount = upgrades.filter(upgrade => 
        this.game.persistentUpgrades && this.game.persistentUpgrades.includes(upgrade.id)
      ).length;
      
      html += `
        <div class="snowflake-category">
          <div class="category-header">
            <span class="category-title">${this.getCategoryDisplayName(category)}</span>
            <span class="category-progress">${ownedCount}/${upgrades.length}</span>
          </div>
          <div class="category-upgrades">
            ${this.renderSnowflakeUpgrades(upgrades)}
          </div>
        </div>
      `;
    });
    
    categoriesContainer.innerHTML = html;
  }

  /**
   * Get display name for category
   */
  getCategoryDisplayName(category) {
    const names = {
      'idleMultiplier': 'Idle Efficiency',
      'startingSnowballs': 'Starting Snowballs',
      'startingAssistants': 'Starting Assistants',
      'startingBabyYeti': 'Starting Yeti Crew'
    };
    return names[category] || category;
  }

  /**
   * Render snowflake upgrades for a category
   */
  renderSnowflakeUpgrades(upgrades) {
    return upgrades.map(upgrade => {
      const isOwned = this.game.persistentUpgrades && this.game.persistentUpgrades.includes(upgrade.id);
      const canAfford = (this.game.snowflakes || 0) >= upgrade.cost;
      
      return `
        <div class="snowflake-upgrade ${isOwned ? 'owned' : canAfford ? 'affordable' : 'unaffordable'}">
          <div class="upgrade-info">
            <span class="upgrade-name">${upgrade.name}</span>
            <span class="upgrade-cost">${upgrade.cost} snowflakes</span>
          </div>
          <div class="upgrade-description">${upgrade.description}</div>
          ${!isOwned ? `<button class="purchase-button" data-upgrade="${upgrade.id}" ${!canAfford ? 'disabled' : ''}>Purchase</button>` : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Setup snowflake shop event listeners
   */
  setupSnowflakeShopEventListeners() {
    const categoriesContainer = document.getElementById('snowflake-categories');
    if (categoriesContainer && !categoriesContainer.hasEventListener) {
      categoriesContainer.addEventListener('click', (e) => this.handleSnowflakePurchase(e));
      categoriesContainer.hasEventListener = true;
    }
    
    // Update jump summary when grid marketplace is ready
    this.updateJumpSummary();
    
    // Setup jump confirmation buttons with event delegation (only once)
    if (!this._jumpConfirmationListenerAdded) {
      document.addEventListener('click', (e) => {
        if (e.target.id === 'jump-confirm-button') {
          e.preventDefault();
          e.stopPropagation(); // Prevent event bubbling
          this.confirmJump();
        } else if (e.target.id === 'jump-cancel-button') {
          e.preventDefault();
          e.stopPropagation(); // Prevent event bubbling
          this.cancelJump();
        }
      });
      this._jumpConfirmationListenerAdded = true;
              // console.log('[JUMP] Jump confirmation event listener added');
    } else {
              // console.log('[JUMP] Jump confirmation event listener already exists');
    }
  }

  /**
   * Handle snowflake upgrade purchase
   */
  async handleSnowflakePurchase(e) {
    if (!e.target.classList.contains('purchase-button')) return;
    
    const upgradeId = e.target.dataset.upgrade;
    if (!upgradeId) return;
    
    try {
      const { purchaseSnowflakeUpgrade } = await import('../meta/snowflakeTree.js');
      const success = purchaseSnowflakeUpgrade(this.game, upgradeId);
      
      if (success) {
        // Update UI
        this.updateSnowflakeShopBalance();
        this.updateSnowflakeCategories();
        
        // Show jump confirmation if any upgrades were purchased
        this.showJumpConfirmation();
      }
    } catch (error) {
      console.error('[SNOWFLAKE_SHOP] Purchase error:', error);
    }
  }

  /**
   * Show jump confirmation
   */
  showJumpConfirmation() {
    const confirmation = document.getElementById('jump-confirmation');
    if (confirmation) {
      confirmation.style.display = 'block';
    }
  }

  /**
   * Update jump summary with purchased upgrades
   */
  updateJumpSummary() {
    const upgradesCountElement = document.getElementById('jump-upgrades-count');
    const snowflakesSpentElement = document.getElementById('jump-snowflakes-spent');
    
    if (!upgradesCountElement || !snowflakesSpentElement) return;
    
    // Count purchased upgrades
    const purchasedUpgrades = this.game.persistentUpgrades || [];
    const upgradesCount = purchasedUpgrades.length;
    
    // Get snowflakes spent from grid marketplace if available
    let snowflakesSpent = 0;
    if (this.gridMarketplace && this.gridMarketplace.snowflakesSpent) {
      snowflakesSpent = this.gridMarketplace.snowflakesSpent;
    } else {
      // Fallback estimate
      snowflakesSpent = upgradesCount * 100;
    }
    
    upgradesCountElement.textContent = upgradesCount;
    snowflakesSpentElement.textContent = snowflakesSpent.toLocaleString();
  }

  /**
   * Confirm jump and execute
   */
  async confirmJump() {
            // console.log('[JUMP] Confirm jump called');
    
    // Prevent multiple simultaneous jump calls
    if (this._jumpInProgress) {
              // console.log('[JUMP] Jump already in progress, ignoring duplicate call');
      return;
    }
    
    if (!this.game) {
      console.error('[JUMP] No game state available');
      return;
    }
    
    try {
      this._jumpInProgress = true;
              // console.log('[JUMP] Starting jump confirmation...');
        // console.log('[JUMP] Current analog number:', this.game.analogNumber);
        // console.log('[JUMP] Persistent upgrades before jump:', this.game.persistentUpgrades?.length || 0);
      
      // Confirm the jump (this will end the current analog and increment analog number)
      const { confirmJump } = await import('../meta/jump.js');
              // console.log('[JUMP] Confirming jump...');
      confirmJump(this.game);
      
      // Hide overlay and return to normal gameplay
              // console.log('[JUMP] Hiding jump overlay...');
      this.hideJumpOverlay();
      
      // Update all displays
              // console.log('[JUMP] Updating displays...');
      this.updateDashboard();
      this.updateInventory();
      this.updateJumpTab();
      
              // console.log('[JUMP] Jump completed successfully, returned to normal gameplay');
        // console.log('[JUMP] New analog number:', this.game.analogNumber);
        // console.log('[JUMP] Persistent upgrades applied:', this.game.persistentUpgrades?.length || 0);
    } catch (error) {
      console.error('[JUMP] Confirm error:', error);
      console.error('[JUMP] Error stack:', error.stack);
    } finally {
      // Reset the jump in progress flag
      this._jumpInProgress = false;
    }
  }

  /**
   * Cancel jump and return to initial state
   */
  cancelJump() {
    this.hideJumpOverlay();
  }

  /**
   * Reset jump UI to initial state
   */
  resetJumpUI() {
    const jumpStatusSection = document.getElementById('jump-status-section');
    const jumpButtonSection = document.getElementById('jump-button-section');
    const meltdownSection = document.getElementById('meltdown-section');
    const snowflakeShopSection = document.getElementById('snowflake-shop-section');
    const confirmation = document.getElementById('jump-confirmation');
    
    if (jumpStatusSection) jumpStatusSection.style.display = 'block';
    if (jumpButtonSection) jumpButtonSection.style.display = 'block';
    if (meltdownSection) meltdownSection.style.display = 'none';
    if (snowflakeShopSection) snowflakeShopSection.style.display = 'none';
    if (confirmation) confirmation.style.display = 'none';
  }

  /**
   * Show full-screen jump overlay
   */
  showJumpOverlay() {
    if (!this.game) return;
    
    // Set meltdown active flag
    this.game.meltdownActive = true;
    
    // Create full-screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'jump-overlay';
    overlay.className = 'jump-overlay';
    overlay.innerHTML = `
      <div class="jump-overlay-content">
        <div class="jump-header">
          <h1>🚀 Analog Jump</h1>
          <p>Prepare for dimensional transcendence</p>
        </div>
        <div id="jump-overlay-body">
          <!-- Content will be dynamically loaded -->
        </div>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(overlay);
    
    // Show initial jump status
    this.showJumpStatusInOverlay();
    
            // console.log('[JUMP] Full-screen overlay shown');
  }

  /**
   * Hide jump overlay and return to normal gameplay
   */
  hideJumpOverlay() {
    if (!this.game) return;
    
    // Clear meltdown active flag
    this.game.meltdownActive = false;
    
    // Remove overlay
    const overlay = document.getElementById('jump-overlay');
    if (overlay) {
      overlay.remove();
    }
    
            // console.log('[JUMP] Full-screen overlay hidden');
  }
  /**
   * Show jump status in overlay
   */
  showJumpStatusInOverlay() {
    const body = document.getElementById('jump-overlay-body');
    if (!body) return;
    
    const currentAnalogSnowballs = this.game.currentAnalogSnowballs || 0;
    
    body.innerHTML = `
      <div class="jump-status-section">
        <div class="status-grid">
          <div class="status-item">
            <h3>Current Analog</h3>
            <p class="status-value">${this.game.analogNumber || 1}</p>
          </div>
          <div class="status-item">
            <h3>Current Analog Snowballs</h3>
            <p class="status-value">${formatNumber(currentAnalogSnowballs)}</p>
          </div>
          <div class="status-item">
            <h3>Jump Status</h3>
            <p class="status-value">✅ Always Available</p>
          </div>
          <div class="status-item">
            <h3>Progress</h3>
            <p class="status-value">100%</p>
          </div>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: 100%"></div>
        </div>
        <p class="jump-note">Jump process initiated - proceeding to snowflake shop</p>
      </div>
    `;
  }

  /**
   * Show meltdown in overlay
   */
  showMeltdownInOverlay() {
    const body = document.getElementById('jump-overlay-body');
    if (!body) return;
    
    body.innerHTML = `
      <div class="meltdown-section">
        <h2>🔥 Meltdown Phase</h2>
        <p>Convert your assets into snowflakes for the next analog</p>
        
        <div class="meltdown-grid">
          <div class="meltdown-card">
            <h3>Snowball Conversion</h3>
            <div class="conversion-info">
              <p>Available: <span id="meltdown-snowballs-available">${formatNumber(this.game.snowballs || 0)}</span></p>
              <p>Rate: <span id="meltdown-conversion-rate">${formatNumber(this.game.snowflakeCost || 1000000)} snowballs = 1 snowflake</span></p>
            </div>
            <div class="conversion-controls">
              <button id="meltdown-convert-all-snowballs" class="convert-button">Convert All</button>
              <button id="meltdown-convert-half-snowballs" class="convert-button">Convert Half</button>
              <div class="custom-conversion">
                <input type="number" id="meltdown-snowballs-amount" placeholder="Amount" min="0" class="amount-input">
                <button id="meltdown-convert-custom-snowballs" class="convert-button">Convert</button>
              </div>
            </div>
          </div>
          
          <div class="meltdown-card">
            <h3>Assistant Conversion</h3>
            <div id="meltdown-assistants-grid" class="assistants-grid">
              <!-- Assistants will be loaded here -->
            </div>
          </div>
        </div>
        
        <div class="meltdown-summary">
          <h3>Total Snowflakes Earned: <span id="meltdown-total-snowflakes">0</span></h3>
          <button id="meltdown-complete-button" class="complete-button">Complete Meltdown</button>
        </div>
      </div>
    `;
    
    // Initialize meltdown UI
    this.updateMeltdownSnowballs();
    this.updateMeltdownAssistants();
    this.setupMeltdownEventListeners();
  }

  /**
   * Show snowflake shop in overlay
   */
  showSnowflakeShopInOverlay() {
    const body = document.getElementById('jump-overlay-body');
    if (!body) return;
    
    body.innerHTML = `
      <div class="snowflake-shop-section">
        <h2>Snowflake Tree Marketplace</h2>
        <p>Purchase persistent upgrades for your next analog</p>
        
        <div class="fixed-summary-container">
          <div class="conversion-summary">
            <h3>Conversion Summary</h3>
            <p>Your snowballs have been automatically converted to snowflakes</p>
            <div class="conversion-details">
              <p><strong>Conversion Rate:</strong> ${formatSnowballs(this.game.snowflakeCost || 1000000)} snowballs = 1 snowflake</p>
              <p><strong>Snowflakes Available:</strong> <span id="snowflakes-available">${formatSnowballs(this.game.snowflakes || 0)}</span> ❄️</p>
            </div>
          </div>
        </div>
        
        <div class="grid-container">
          <div id="snowflake-grid-marketplace" class="snowflake-grid-container"></div>
        </div>
        
        <div class="jump-confirmation">
          <h3>Ready to Jump?</h3>
          <p>Your purchased upgrades will be applied to the new analog</p>
          <div class="jump-summary">
            <div class="summary-row">
              <div class="summary-item">
                <span class="summary-label">Purchased Upgrades:</span>
                <span class="summary-value" id="jump-upgrades-count">0</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Lifetime Total Purchased Upgrades:</span>
                <span class="summary-value" id="lifetime-upgrades">0</span>
              </div>
            </div>
            <div class="summary-row">
              <div class="summary-item">
                <span class="summary-label">Snowflakes Spent:</span>
                <span class="summary-value" id="jump-snowflakes-spent">0</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Lifetime Total Snowflakes Spent:</span>
                <span class="summary-value" id="lifetime-spending">0</span>
              </div>
            </div>
          </div>
          <div class="confirmation-buttons">
            <button id="jump-confirm-button" class="confirm-button">Confirm Jump</button>
            <button id="jump-cancel-button" class="cancel-button">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    // Initialize the grid marketplace
    this.initializeGridMarketplace();
    
    // Setup event listeners
    this.setupSnowflakeShopEventListeners();
  }

  /**
   * Initialize the grid marketplace
   */
  async initializeGridMarketplace() {
    try {
      const { SnowflakeGridMarketplace } = await import('./components/snowflakeGrid.js');
      
      // Create grid marketplace instance
      this.gridMarketplace = new SnowflakeGridMarketplace(this.game, 'snowflake-grid-marketplace');
      this.gridMarketplace.init();
      
              // console.log('[SNOWFLAKE_GRID] Grid marketplace initialized');
    } catch (error) {
      console.error('[SNOWFLAKE_GRID] Failed to initialize grid marketplace:', error);
      
      // Fallback to text-based categories
      this.showFallbackCategories();
    }
  }

  /**
   * Show fallback text-based categories if tree fails to load
   */
  async showFallbackCategories() {
    const treeContainer = document.getElementById('snowflake-tree-marketplace');
    if (!treeContainer) return;
    
    treeContainer.innerHTML = `
      <div class="fallback-categories">
        <h3>Loading tree view...</h3>
        <p>If the tree doesn't load, please refresh the page.</p>
      </div>
    `;
  }

  /**
   * Integrate with the existing crystal snowball system
   */
  integrateCrystalSnowballSystem() {
    if (this.game && this.game.crystalSnowballManager) {
      // Ensure the crystal snowball manager uses our spawn area
      const originalSetupVisualContainer = this.game.crystalSnowballManager.setupVisualContainer;
      this.game.crystalSnowballManager.setupVisualContainer = () => {
        // Force the manager to find our spawn area
        this.game.crystalSnowballManager.container = this.components.spawnArea;
        if (this.game.crystalSnowballManager.container) {
          // console.log('[CRYSTAL_SNOWBALL] Connected to GameReadyUIManager spawn area');
        } else {
          // console.warn('[CRYSTAL_SNOWBALL] Spawn area not found, trying alternatives...');
          // Try alternative containers
          const alternatives = [
            document.getElementById('spawn-area'),
            document.querySelector('.spawn-area'),
            document.querySelector('.middle-column-container'),
            document.getElementById('game-ready-middle-column')
          ];
          const found = alternatives.find(el => el);
          if (found) {
            this.game.crystalSnowballManager.container = found;
            // console.log(`[CRYSTAL_SNOWBALL] Connected to alternative container: ${found.id || found.className}`);
          } else {
            console.error('[CRYSTAL_SNOWBALL] No suitable spawn container found');
          }
        }
        // Call original setup if it exists
        if (originalSetupVisualContainer) {
          originalSetupVisualContainer.call(this.game.crystalSnowballManager);
        }
      };
      
      // Re-initialize the visual container
      this.game.crystalSnowballManager.setupVisualContainer();
      
      // console.log('[CRYSTAL_SNOWBALL] System integrated with UI');
    }
  }



  /**
   * Update right column with current game data
   */
  async updateRightColumn() {
    if (!this.game) return;

    try {
      await this.updateUpgrades();
      this.updateAssistants();
    } catch (error) {
      console.error('[RIGHT_COLUMN] Update error:', error);
    }
  }

  /**
   * Force update right column immediately (for user actions)
   */
  forceUpdateRightColumn() {
    if (!this.game) return;

    try {
      this.updateUpgrades();
      this.updateAssistants();
    } catch (error) {
      console.error('[RIGHT_COLUMN] Force update error:', error);
    }
  }

  /**
   * Force SPS recalculation and update displays
   */
  forceSPSUpdate() {
    if (!this.game) return;

    try {
      // Force SPS recalculation if the function exists
      if (window.calculateUnifiedSPS) {
        window.calculateUnifiedSPS(this.game);
      }
      
      // Update SPS displays immediately
      this.updateDashboardPerformance();
      this.updateMiniWallet();
      
    } catch (error) {
      console.error('[SPS_UPDATE] Force update error:', error);
    }
  }

  // ===============================
  // BATTLE CONTAINER MANAGEMENT
  // ===============================

  /**
   * Show battle spawn state
   */
  showBattleSpawn(yeti) {
            // console.log('[BATTLE_UI] Showing battle spawn for yeti:', yeti);
    
    const travelContainer = document.getElementById('travel-container');
    if (!travelContainer) {
      console.error('[BATTLE_UI] Travel container not found');
      return;
    }

    // Validate yeti object
    if (!yeti || !yeti.name || !yeti.class || !yeti.snowballPower) {
      console.error('[BATTLE_UI] Invalid yeti object:', yeti);
      return;
    }

    // Use the full duration for the countdown (10 seconds)
    const fullDuration = Math.ceil(yeti.duration / 1000);

    // Show battle info in travel container (much simpler!)
    travelContainer.innerHTML = `
      <div class="travel-status battle-active">
        <div class="location-buff-info">
          <h3>Dissonant Yeti Appeared!</h3>
          <p class="location-description">A fearsome ${yeti.class} has emerged from the shadows...</p>
          <div style="display: flex; align-items: center; margin: 10px 0;">
            <img src="${yeti.icon}" alt="${yeti.name}" style="width: 40px; height: 40px; margin-right: 10px; border-radius: 5px;" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
            <span style="display: none; font-size: 2rem;"></span>
            <div>
              <p><strong>Name:</strong> ${yeti.name}</p>
              <p><strong>Class:</strong> ${yeti.class}</p>
              <p><strong>Estimated Power:</strong> ${formatSnowballs(yeti.lowPower)} - ${formatSnowballs(yeti.highPower)}</p>
              <p><strong>Time to engage:</strong> <span id="battle-countdown">${fullDuration}</span>s</p>
            </div>
          </div>
          <button id="battle-engage-button" class="travel-button" onclick="window.engageEvilYeti && window.engageEvilYeti('${yeti.id}'); window.updateBattleButtonState && window.updateBattleButtonState();" style="margin-top: 10px;">
            Engage Battle
          </button>
        </div>
      </div>
    `;

    // Start countdown with the full duration
    this.startBattleCountdown(fullDuration);
  }

  /**
   * Show battle results
   */
  showBattleResults(result) {
    // console.log('[BATTLE_UI] Showing battle results:', result);
    
    // Trigger battle animations
    this.triggerBattleAnimations(result);
    
    // Use Concord activity panel if available
    if (window.concordActivityPanel) {
      const isVictory = result.playerWon;
      const title = isVictory ? 'Battle Victory!' : 'Battle Defeat!';
      const description = isVictory 
        ? `You defeated the ${result.yetiName || 'Yeti'}`
        : `You were defeated by the ${result.yetiName || 'Yeti'}`;
      
      const details = `Damage Dealt: ${formatSnowballs(result.playerPower || 0)} | Damage Taken: ${formatSnowballs(result.yetiPower || 0)}${result.snowballReward ? ` | Rewards: +${formatSnowballs(result.snowballReward)} Snowballs` : ''}`;
      
      window.concordActivityPanel.showActivity('battle', title, description, details);
    } else {
      console.warn('[BATTLE_UI] Concord activity panel not available');
    }
  }
  
  /**
   * Trigger battle animations
   * 
   * This function creates two visual effects when a battle resolves:
   * 1. Screen Flash: Brief color overlay (green for victory, red for defeat)
   * 2. Power Number Flash: Animated display of player and yeti power values
   * 
   * @param {Object} result - Battle result object containing:
   *   - playerWon: boolean - Whether the player won the battle
   *   - playerPower: number - Player's snowball power
   *   - yetiPower: number - Yeti's snowball power
   *   - yetiName: string - Name of the defeated/defeating yeti
   * 
   * Animation Details:
   * - Screen flash: 500ms duration, 30% opacity peak
   * - Power numbers: 2 second duration with scale/movement effects
   * - Both animations auto-cleanup after completion
   * - Uses victory/defeat color coding for visual feedback
   */
  triggerBattleAnimations(result) {
    // Screen flash animation
    this.createScreenFlash(result.playerWon);
    
    // Power number flash animation
    this.createPowerNumberFlash(result);
  }
  
  /**
   * Create screen flash animation
   * 
   * Creates a brief color overlay flash across the entire screen to indicate
   * battle outcome. Green flash for victory, red flash for defeat.
   * 
   * @param {boolean} isVictory - Whether the player won the battle
   * 
   * Technical Details:
   * - Creates a full-viewport div with battle-screen-flash class
   * - Uses CSS animation for smooth fade in/out effect
   * - Auto-removes after 500ms (animation duration)
   * - Includes error handling for robustness
   * - Colors: Green (rgba(34, 197, 94, 0.3)) for victory, Red (rgba(239, 68, 68, 0.3)) for defeat
   */
  createScreenFlash(isVictory) {
    try {
      const flash = document.createElement('div');
      flash.className = 'battle-screen-flash';
      flash.style.background = isVictory ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'; // Green for win, red for loss
      
      document.body.appendChild(flash);
      
      // Remove element after animation completes
      setTimeout(() => {
        if (flash.parentNode) {
          flash.parentNode.removeChild(flash);
        }
      }, 500);
    } catch (error) {
      console.warn('[BATTLE_ANIMATION] Screen flash animation failed:', error);
    }
  }
  
  /**
   * Create power number flash animation
   * 
   * Creates animated displays showing both player and yeti power numbers
   * during battle resolution. Uses color coding and positioning to clearly
   * indicate battle outcome and power comparison.
   * 
   * @param {Object} result - Battle result object with playerWon, playerPower, yetiPower
   * 
   * Animation Features:
   * - Player power (⚔️) displayed on left side (40% from left)
   * - Yeti power (🛡️) displayed on right side (60% from left)
   * - Color coding: Green for winner, Red for loser
   * - 2-second animation with scale and movement effects
   * - Auto-cleanup after completion
   * 
   * Technical Details:
   * - Uses battle-power-flash CSS class for styling
   * - Power numbers formatted using formatSnowballs() for readability
   * - Elements positioned using fixed positioning for consistent placement
   * - Includes error handling and graceful fallback
   */
  createPowerNumberFlash(result) {
    const isVictory = result.playerWon;
    const playerPower = result.playerPower || 0;
    const yetiPower = result.yetiPower || 0;
    
    // Create player power display
    const playerPowerElement = document.createElement('div');
    playerPowerElement.className = 'battle-power-flash';
    playerPowerElement.style.color = isVictory ? '#22c55e' : '#ef4444'; // Green for win, red for loss
    playerPowerElement.style.left = '40%';
    playerPowerElement.textContent = `⚔️ ${formatSnowballs(playerPower)}`;
    
    // Create yeti power display
    const yetiPowerElement = document.createElement('div');
    yetiPowerElement.className = 'battle-power-flash';
    yetiPowerElement.style.color = isVictory ? '#ef4444' : '#22c55e'; // Red for loss, green for win
    yetiPowerElement.style.left = '60%';
    yetiPowerElement.textContent = `🛡️ ${formatSnowballs(yetiPower)}`;
    
    // Add to page
    document.body.appendChild(playerPowerElement);
    document.body.appendChild(yetiPowerElement);
    
    // Remove elements after animation completes
    setTimeout(() => {
      if (playerPowerElement.parentNode) {
        playerPowerElement.parentNode.removeChild(playerPowerElement);
      }
      if (yetiPowerElement.parentNode) {
        yetiPowerElement.parentNode.removeChild(yetiPowerElement);
      }
    }, 2000);
  }

  /**
   * Hide battle container
   */
  hideBattleContainer() {
    const travelContainer = document.getElementById('travel-container');
    if (travelContainer) {
      travelContainer.innerHTML = '';
    }
  }

  /**
   * Start battle countdown
   */
  startBattleCountdown(seconds) {
    const countdownElement = document.getElementById('battle-countdown');
    if (!countdownElement) return;

    let remaining = seconds;
    
    const updateCountdown = () => {
      if (remaining > 0) {
        countdownElement.textContent = remaining;
        remaining--;
        setTimeout(updateCountdown, 1000);
      } else {
        // Countdown finished - don't hide container, let battles.js handle despawn
        // The yeti will be cleared by the battles.js timer
      }
    };

    updateCountdown();
  }

  /**
   * Update battle button state after engagement
   */
  updateBattleButtonState() {
    const button = document.getElementById('battle-engage-button');
    if (button) {
      button.textContent = 'Battle Engaged';
      button.style.backgroundColor = '#dc3545'; // Red color
      button.style.color = 'white';
      button.disabled = true; // Prevent multiple clicks
      button.onclick = null; // Remove onclick handler
    }
  }

  /**
   * Make battle container functions available globally
   */
  setupBattleContainerGlobals() {
    window.showBattleSpawn = (yeti) => this.showBattleSpawn(yeti);
    window.showBattleResults = (result) => this.showBattleResults(result);
    window.hideBattleContainer = () => this.hideBattleContainer();
    window.updateBattleButtonState = () => this.updateBattleButtonState();
    
    // Make battle animation functions available globally
    window.triggerBattleAnimations = (result) => this.triggerBattleAnimations(result);
    window.createScreenFlash = (isVictory) => this.createScreenFlash(isVictory);
    window.createPowerNumberFlash = (result) => this.createPowerNumberFlash(result);
    
    // Test function for battle animations
    window.testBattleAnimations = (isVictory = true) => {
      const testResult = {
        playerWon: isVictory,
        playerPower: 1500000,
        yetiPower: 1200000,
        yetiName: 'Test Yeti'
      };
      this.triggerBattleAnimations(testResult);
    };
    
    // Test function for assistant level formatting
    window.testLevelFormatting = () => {
      console.log('Testing level formatting:');
      console.log('Level 0:', this.formatLevelWithIcicles(0));
      console.log('Level 1:', this.formatLevelWithIcicles(1));
      console.log('Level 2:', this.formatLevelWithIcicles(2));
      console.log('Level 5:', this.formatLevelWithIcicles(5));
    };
    
    // Test function for effective click tracking
    window.testEffectiveClicks = () => {
      if (this.game && this.game.achievements && this.game.achievements.progress) {
        const progress = this.game.achievements.progress;
        console.log('Effective Click Tracking Test:');
        console.log('Raw clicks (total_clicks):', progress.total_clicks || 0);
        console.log('Effective snowballs (effective_clicks):', progress.effective_clicks || 0);
        console.log('Click multiplier:', this.game.clickMultiplier || 1);
        console.log('Player level:', this.game.playerLevel || 0);
        if (this.game.loops?.active?.clicking?.streakSystem?.activeBonus) {
          console.log('Streak multiplier:', this.game.loops.active.clicking.streakSystem.activeBonus.multiplier);
        }
        if (this.game.crystalSnowballManager && typeof this.game.crystalSnowballManager.getCrystalSnowballMultiplier === 'function') {
          console.log('Crystal snowball multiplier:', this.game.crystalSnowballManager.getCrystalSnowballMultiplier());
        }
      } else {
        console.log('Game or achievements not available');
      }
    };
    
    // Test function for click multiplier system
    window.testClickMultipliers = () => {
      if (this.game) {
        console.log('Click Multiplier System Test:');
        console.log('Base clickMultiplier:', this.game.clickMultiplier || 1);
        console.log('SPC (snowballs per click):', this.game.spc || 1);
        
        // Test the effective multiplier calculation
        if (this.game.loops?.active?.clicking && typeof this.game.loops.active.clicking.getEffectiveClickMultiplier === 'function') {
          const effectiveMultiplier = this.game.loops.active.clicking.getEffectiveClickMultiplier(this.game);
          console.log('Effective click multiplier (calculated):', effectiveMultiplier);
        }
        
        // Test crystal snowball multiplier
        if (this.game.crystalSnowballManager && typeof this.game.crystalSnowballManager.getCrystalSnowballMultiplier === 'function') {
          const crystalMultiplier = this.game.crystalSnowballManager.getCrystalSnowballMultiplier();
          console.log('Crystal snowball multiplier:', crystalMultiplier);
        }
        
        // Test click power calculation
        console.log('Expected click power calculation:');
        console.log('Base power: 1');
        console.log('Total multiplier:', this.game.clickMultiplier || 1);
        console.log('Expected snowballs per click: 1 *', this.game.clickMultiplier || 1, '=', (this.game.clickMultiplier || 1));
      } else {
        console.log('Game not available');
      }
    };
  }
}

// Export design system for external use
export { DESIGN_SYSTEM, TAB_CONFIG }; 