// systems/clicker.js - Active clicking system with streak mechanics
import { updateClickStreak, getEffectiveClickMultiplier } from './clickStreak.js';

export function setupClicker(game) {
  const clickButton = document.getElementById('click-button');
  
  if (clickButton) {
    clickButton.onclick = () => {
      // Update click streak system first
      updateClickStreak(game);
      
      // Calculate effective click power with all multipliers
      const basePower = 1; // Base power is always 1, multipliers are applied separately
      const effectiveMultiplier = getEffectiveClickMultiplier(game);
      const finalClickPower = basePower * effectiveMultiplier;
      
      // Add snowballs based on enhanced click power
      game.addSnowballs(finalClickPower, 'click');
      
      // Record click in enhanced loop state
      if (game.recordClick) {
        game.recordClick(finalClickPower);
      }
      
      // Emit snowball clicked event with streak information
      if (window.eventBus) {
        window.eventBus.emit('snowballClicked', {
          amount: finalClickPower,
          basePower: basePower,
          streakMultiplier: effectiveMultiplier,
          source: 'click',
          totalSnowballs: game.snowballs
        });
      }
      
      // Record click for achievements with effective snowballs generated
      if (window.recordClick) {
        window.recordClick(game, finalClickPower);
      }
    };
  }
}
  