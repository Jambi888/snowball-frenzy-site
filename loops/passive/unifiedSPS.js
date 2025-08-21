/**
 * unifiedSPS.js - Unified SPS calculation system
 * 
 * This replaces the old boost-based SPS calculation with a unified system
 * that uses the unified upgrade system for all multipliers and effects.
 * 
 * FEATURES:
 * - Uses unified upgrade system for all multipliers
 * - Maintains compatibility with existing systems (yeti, travel, icicle)
 * - Performance optimized with dirty flags
 * - Clean separation of concerns
 */

import { ASSISTANTS } from './data/assistantData.js';
import { ICICLE_CONFIG } from './icicle.js';
import { getCurrentYetiPassiveBonus } from '../hybrid/yetis.js';
import { getAssistantMultiplier, getGlobalSpsMultiplier, markSPSClean, isSPSDirty } from './unifiedUpgrades.js';

/**
 * Calculate SPS using unified upgrade system
 * @param {Object} game - Game state object
 */
export function calculateUnifiedSPS(game) {
  // Performance measurement
  const startTime = performance.now();
  
  let total = 0;
  game._spsByAssistant = {};

  // Get global SPS multiplier from unified upgrades
  const globalSpsMultiplier = getGlobalSpsMultiplier(game);

  // Get yeti passive bonus multiplier
  const yetiPassiveBonus = getCurrentYetiPassiveBonus(game);
  let yetiMultiplier = 1;
  if (yetiPassiveBonus && yetiPassiveBonus.effectType === 'snowballRate') {
    yetiMultiplier = 1 + yetiPassiveBonus.value;
  }

  // Get travel location SPS multiplier
  const travelSPSMultiplier = game.travelSPSMultiplier || 1;

  // Get crystal snowball multiplier
  const crystalSnowballMultiplier = game.crystalSnowballManager ? game.crystalSnowballManager.getCrystalSnowballMultiplier() : 1;

  // Calculate SPS for each assistant
  for (const assistant of ASSISTANTS) {
    const count = game.assistants[assistant.id] || 0;
    
    // Early exit for zero count assistants
    if (count === 0) {
      game._spsByAssistant[assistant.id] = 0;
      continue;
    }
    
    // Get assistant multiplier from unified upgrades
    const assistantMultiplier = getAssistantMultiplier(assistant.id, game);
    
    // Get assistant level multiplier from icicle
    const level = game.assistantLevels?.[assistant.id] || 0;
    const levelMultiplier = 1 + (ICICLE_CONFIG.levelUpValue * level);

    // Calculate total SPS with all multipliers
    const totalSPS = assistant.sps * assistantMultiplier * globalSpsMultiplier * yetiMultiplier * travelSPSMultiplier * crystalSnowballMultiplier * count * levelMultiplier;

    game._spsByAssistant[assistant.id] = totalSPS;
    total += totalSPS;
  }

  game.sps = total;
  
  // Mark SPS as clean after calculation
  markSPSClean();
  
  // Performance measurement
  const endTime = performance.now();
  const calculationTime = endTime - startTime;
  
  // Log performance metrics (only if calculation takes more than 1ms)
  if (calculationTime > 1) {

  }
  
  // Store performance data
  if (!game._spsPerformanceHistory) {
    game._spsPerformanceHistory = [];
  }
  
  const performanceObject = {
    time: Date.now(),
    duration: calculationTime,
    assistantCount: Object.values(game.assistants || {}).reduce((sum, count) => sum + count, 0),
    upgradeCount: Object.values(game.unifiedUpgrades || {}).filter(owned => owned).length
  };
  
  game._spsPerformanceHistory.push(performanceObject);
  
  // Keep only last 100 measurements
  if (game._spsPerformanceHistory.length > 100) {
    game._spsPerformanceHistory.shift();
  }
}







/**
 * Get assistant multiplier (compatibility function)
 * @param {string} assistantId - Assistant ID
 * @param {Object} game - Game state object
 * @returns {number} Assistant multiplier
 */
export function getAssistantMultiplierForSPS(assistantId, game) {
  return getAssistantMultiplier(assistantId, game);
}

/**
 * Get global SPS multiplier (compatibility function)
 * @param {Object} game - Game state object
 * @returns {number} Global SPS multiplier
 */
export function getGlobalSpsMultiplierForSPS(game) {
  return getGlobalSpsMultiplier(game);
} 