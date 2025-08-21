/**
 * data/config.js - Game configuration constants
 * 
 * This file contains all the core configuration values for the game.
 * These constants control game balance, timing, and starting conditions.
 */

/**
 * Starting snowball count for new players
 * Gives players enough currency to purchase their first assistant
 */
export const STARTING_SNOWBALLS = 0;

/**
 * Base jump threshold in snowballs
 * This is the minimum snowballs required to jump from analog 1 to analog 2
 * Each subsequent analog increases this threshold by a factor of 10
 */
export const JUMP_THRESHOLD = 1;  // No longer used.

/**
 * Game tick interval in milliseconds
 * Controls how often the passive income loop runs
 * Lower values = smoother income, higher values = better performance
 */
export const TICK_INTERVAL_MS = 100;

/**
 * Time acceleration rate for testing and future game mechanics
 * Base rate = 1 (normal time)
 * 60 = 1 second real time = 60 seconds game time
 * 3600 = 1 second real time = 1 hour game time
 * 
 * This can be used for:
 * - Testing game progression quickly
 * - Future purchasable time acceleration upgrades
 * - Debugging long-term game mechanics
 */
export const TIME_RATE = 1; // 1 = 1 second real time = 1 second game time



/**
 * Analog test mode flag
 * When true, use test data from analogTestData.js for analog-based abilities
 * When false, use real game data for analog history
 * This is useful for testing abilities that require previous analog data
 */
export const ANALOG_TEST = false;