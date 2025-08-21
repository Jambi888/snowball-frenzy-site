/**
 * systems/dashboard.js - Dashboard statistics and tables
 *
 * Renders key performance tables for the Dashboard tab.
 */

import { ASSISTANTS } from '../loops/passive/data/assistantData.js';
import { TIME_RATE } from '../core/config.js';
import { getCurrentYetiPassiveBonus, getYetiBuffRemainingTime } from '../loops/hybrid/yetis.js';
import { formatNumber, formatSPS, formatSnowballs } from '../ui/numberFormatter.js';

/**
 * Utility to get the current cost for the next assistant
 */
function getCurrentCost(assistant, count) {
  return assistant.cost * Math.pow(assistant.costRate, count);
}

/**
 * Render dashboard tables into the dashboard tab
 * @param {GameStateFlat} game
 */
export function renderDashboardTables(game) {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  // Remove old tables if present
  const oldTables = container.querySelectorAll('.dashboard-table');
  oldTables.forEach(el => el.remove());

  // --- Source Contribution Table ---
  // Calculate total SPS
  const totalSPS = Number(game.sps) || 0;

  // Source Contribution Table - Show current SPS breakdown
  let html = `<h3 class="dashboard-table">Current SPS Breakdown</h3><table class="dashboard-table" style="width:100%;margin-bottom:24px"><thead><tr><th>Source</th><th>SPS</th><th>SPS %</th></tr></thead><tbody>`;
  
  // Calculate click contribution (clicks don't contribute to SPS)
  html += `<tr><td>Manual Clicks</td><td>0.0</td><td>0.0%</td></tr>`;
  
  // Add assistant contributions
  for (const assistant of ASSISTANTS) {
    const owned = game.assistants[assistant.id] || 0;
    if (!owned) continue;
    
    const assistantSPS = game._spsByAssistant && game._spsByAssistant[assistant.id] ? game._spsByAssistant[assistant.id] : 0;
    const spsPercent = totalSPS > 0 ? ((assistantSPS / totalSPS) * 100).toFixed(1) : '0.0';
    
    html += `<tr><td>${assistant.name}</td><td>${formatSPS(assistantSPS)}</td><td>${spsPercent}%</td></tr>`;
  }
  
  html += `</tbody></table>`;

  // --- SPS Breakdown Table ---
  html += `<h3 class="dashboard-table">SPS Breakdown</h3><table class="dashboard-table" style="width:100%;margin-bottom:24px"><thead><tr><th>Assistant</th><th>Count</th><th>Base SPS</th><th>Multipliers</th><th>Total SPS</th></tr></thead><tbody>`;
  
  for (const assistant of ASSISTANTS) {
    const owned = game.assistants[assistant.id] || 0;
    if (!owned) continue;
    
    const baseSPS = assistant.sps * owned;
    const boostMultiplier = game.boosts && game.boosts[assistant.id] ? 2 : 1;
    const assistantMultiplier = game.assistantMultipliers && game.assistantMultipliers[assistant.id] ? game.assistantMultipliers[assistant.id] : 1;
    const globalMultiplier = game.globalSpsMultiplier || 1;
    const totalMultiplier = boostMultiplier * assistantMultiplier * globalMultiplier;
    const totalSPS = baseSPS * totalMultiplier;
    
    html += `<tr>
      <td>${assistant.name}</td>
      <td>${owned}</td>
      <td>${formatSPS(baseSPS)}</td>
      <td>${totalMultiplier.toFixed(2)}x</td>
      <td>${formatSPS(totalSPS)}</td>
    </tr>`;
  }
  
  html += `</tbody></table>`;

  // --- Performance Metrics Table ---
  html += `<h3 class="dashboard-table">Performance Metrics</h3><table class="dashboard-table" style="width:100%"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>`;
  
  const totalAssistants = Object.values(game.assistants || {}).reduce((sum, count) => sum + count, 0);
  const totalBoosts = Object.values(game.boosts || {}).filter(owned => owned).length;
  const totalGlobalUpgrades = Object.values(game.globalUpgrades || {}).filter(owned => owned).length;
  const totalPersistentUpgrades = (game.persistentUpgrades || []).length;
  const totalUpgrades = totalBoosts + totalGlobalUpgrades + totalPersistentUpgrades;
  
  html += `<tr><td>Total Assistants</td><td>${totalAssistants}</td></tr>`;
  html += `<tr><td>Total Upgrades</td><td>${totalUpgrades}</td></tr>`;
  html += `<tr><td>Global SPS Multiplier</td><td>${(game.globalSpsMultiplier || 1).toFixed(2)}x</td></tr>`;
  html += `<tr><td>Click Power</td><td>${(game.spc || 1).toFixed(1)}</td></tr>`;
  html += `<tr><td>Current Analog</td><td>${game.analogNumber || 1}</td></tr>`;
  html += `<tr><td>Lifetime Snowballs</td><td>${formatSnowballs(game.lifetimeSnowballs || 0)}</td></tr>`;
  
  // Add yeti buff metrics
  const yetiPassiveBonus = getCurrentYetiPassiveBonus(game);
  if (yetiPassiveBonus) {
    const yetiMultiplier = 1 + yetiPassiveBonus.value;
    const remainingTime = getYetiBuffRemainingTime(game);
    html += `<tr><td>Yeti Buff Multiplier</td><td>${yetiMultiplier.toFixed(2)}x (${remainingTime}s)</td></tr>`;
  } else {
    html += `<tr><td>Yeti Buff Multiplier</td><td>None</td></tr>`;
  }
  
  html += `</tbody></table>`;

  // --- Analog History Table ---
  html += `<h3 class="dashboard-table">Analog History</h3><table class="dashboard-table" style="width:100%;margin-bottom:24px"><thead><tr><th>Analog</th><th>Snowballs</th><th>SPS</th><th>Total Assistants</th></tr></thead><tbody>`;
  
  // Get analog history from game state (using game.analogs instead of game.analogHistory)
  const analogs = game.analogs || [];
  
  // Show current analog first (if it has data)
  const currentAnalog = game.analogNumber || 1;
  const currentAnalogData = {
    analog: currentAnalog,
    snowballs: game.currentAnalogSnowballs || 0,
    sps: game.sps || 0,
    totalAssistants: Object.values(game.assistants || {}).reduce((sum, count) => sum + count, 0)
  };
  
  // Add current analog to the table
  html += `<tr>
    <td><strong>${currentAnalogData.analog} (Current)</strong></td>
    <td>${formatSnowballs(currentAnalogData.snowballs)}</td>
    <td>${formatSPS(currentAnalogData.sps)}</td>
    <td>${currentAnalogData.totalAssistants}</td>
  </tr>`;
  
  // Add historical analogs (from right to left, so most recent first)
  for (let i = analogs.length - 1; i >= 0; i--) {
    const analogRecord = analogs[i];
    
    // Get the analog number from the record
    const analogNumber = analogRecord.number || (i + 1);
    
    const totalAssistants = Object.values(analogRecord.assistants || {}).reduce((sum, count) => sum + (Number(count) || 0), 0);
    
    html += `<tr>
      <td>${analogNumber}</td>
      <td>${formatSnowballs(analogRecord.currentAnalogSnowballs)}</td>
      <td>${formatSPS(analogRecord.finalSPS)}</td>
      <td>${totalAssistants}</td>
    </tr>`;
  }
  
  html += `</tbody></table>`;

  // Insert the tables after the currency display
  const currencyDisplay = container.querySelector('#dashboard-currency-display');
  if (currencyDisplay) {
    currencyDisplay.insertAdjacentHTML('afterend', html);
  } else {
    container.innerHTML += html;
  }
}

// --- Dashboard Calculation Functions ---

/**
 * Calculates SpS acceleration over the last 5 seconds.
 * @param {GameStateFlat} game - The game state object
 */
export function getAcceleration(game) {
    const history = game.spsHistory;
    if (history.length < 2) return 0;

    const fiveSecondsAgo = game.getGameTime() - (5000 * TIME_RATE);
    const recentPoint = history[history.length - 1];
    const pastPoint = history.find(p => p.time >= fiveSecondsAgo) || history[0];
    
    const spsChange = recentPoint.sps - pastPoint.sps;
    const timeChange = (recentPoint.time - pastPoint.time) / 1000; // in seconds

    return timeChange > 0 ? (spsChange / timeChange) : 0;
}

/**
 * Gets the data for the snowball and SpS source breakdown tables.
 */
export function getSourceBreakdownData() {
    const playerState = getPlayerState();
    const sources = [];

    // --- Calculate Total Production ---
    const totalSnowballsEarned = playerState.totalSnowballsEarned;
    const totalSps = playerState.snowballsPerSecond;



    // --- Add Assistants ---
    assistantUpgrades.forEach(u => {
        if (u.snowballsGenerated > 0 || u.quantity > 0) {
            const spsFromThis = getEffectValue(u) * u.quantity;
            sources.push({
                name: u.name,
                snowballPercent: totalSnowballsEarned > 0 ? (u.snowballsGenerated / totalSnowballsEarned) * 100 : 0,
                spsPercent: totalSps > 0 ? (spsFromThis / totalSps) * 100 : 0,
            });
        }
    });

    return sources;
}

/**
 * Prepares the data for the upgrade ownership table.
 */
export function getUpgradeTableData() {
    // Calculate SpS breakdown
    const spsBreakdown = assistantUpgrades
        .filter(u => u.quantity > 0)
        .map(u => {
            const spsFromThis = getEffectValue(u) * u.quantity;
            return {
                name: u.name,
                sps: spsFromThis,
                quantity: u.quantity
            };
        })
        .sort((a, b) => b.sps - a.sps);

    // Calculate efficiency table
    const efficiencyTable = assistantUpgrades
        .filter(u => u.quantity > 0)
        .map(u => {
            const totalSps = getEffectValue(u) * u.quantity;
            const efficiency = totalSps / u.totalCostPaid;
            return {
                name: u.name,
                efficiency: efficiency,
                sps: totalSps,
                cost: u.totalCostPaid
            };
        })
        .sort((a, b) => b.efficiency - a.efficiency);

    return { spsBreakdown, efficiencyTable };
}
