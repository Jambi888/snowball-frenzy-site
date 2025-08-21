/**
 * numberFormatter.js - Comprehensive number formatting system for Snowball Frenzy
 * 
 * This module provides consistent number formatting across all game elements with
 * the following key principles:
 * 
 * FORMATTING RULES:
 * 1. Large Numbers (≥ 1 million): Use exactly 4 significant figures
 *    - Examples: 1.235 million, 12.35 million, 123.5 million, 100 million
 *    - Trailing zeros are removed for cleaner display
 * 
 * 2. Snowballs: Always whole numbers, 4 significant figures for large values
 *    - Small values: 1,234, 12,345, 123,456
 *    - Large values: 1.235 million, 12.35 million, 100 million
 * 
 * 3. SPS/Acceleration: Allow decimals for small values, 4 significant figures for large
 *    - Small values: 12.5/s, 123.4/s
 *    - Medium values: 1,235/s, 12,346/s
 *    - Large values: 1.235 million/s, 10 million/s
 * 
 * 4. Assistants: Always whole numbers, 4 significant figures for large values
 *    - Same formatting as snowballs
 * 
 * 5. Assistant Costs: Use same formatting as snowballs (4 significant figures)
 * 
 * LARGE NUMBER NAMES:
 * - Based on https://simple.wikipedia.org/wiki/Names_of_large_numbers
 * - Supports up to 10^100 (googol)
 * - Starts using names at 1 million (10^6)
 * 
 * USAGE EXAMPLES:
 * - formatSnowballs(1234567) → "1.235 million"
 * - formatNumber(assistant.cost) → "12.35 million" (for costs)
 * - formatSPS(1234.5) → "1,235/s"
 * - formatAssistants(1000000) → "1 million"
 */

// Large number names lookup table (up to 10^100)
const LARGE_NUMBER_NAMES = {
  3: 'thousand',
  6: 'million',
  9: 'billion',
  12: 'trillion',
  15: 'quadrillion',
  18: 'quintillion',
  21: 'sextillion',
  24: 'septillion',
  27: 'octillion',
  30: 'nonillion',
  33: 'decillion',
  36: 'undecillion',
  39: 'duodecillion',
  42: 'tredecillion',
  45: 'quattuordecillion',
  48: 'quindecillion',
  51: 'sexdecillion',
  54: 'septendecillion',
  57: 'octodecillion',
  60: 'novemdecillion',
  63: 'vigintillion',
  66: 'unvigintillion',
  69: 'duovigintillion',
  72: 'trevigintillion',
  75: 'quattuorvigintillion',
  78: 'quinvigintillion',
  81: 'sexvigintillion',
  84: 'septenvigintillion',
  87: 'octovigintillion',
  90: 'novemvigintillion',
  93: 'trigintillion',
  96: 'untrigintillion',
  99: 'duotrigintillion',
  100: 'googol'
};

/**
 * Main number formatting function with large number names and appropriate precision
 * 
 * This is the core formatting function used throughout the game. It handles:
 * - Negative numbers (preserves sign)
 * - Large number names (≥ 1 million)
 * - Comma separators for readability
 * - 4 significant figures for large numbers
 * - Special formatting for different number types
 * 
 * @param {number} num - The number to format
 * @param {Object} options - Formatting options
 * @param {boolean} options.noDecimals - If true, don't show decimals (legacy option, prefer wholeNumbers)
 * @param {boolean} options.wholeNumbers - If true, only show whole numbers (for snowballs, assistants)
 * @param {boolean} options.allowDecimals - If true, allow decimals for small values (for SPS/acceleration)
 * @returns {string} Formatted number string
 * 
 * @example
 * formatNumber(1234567) → "1.235 million"
 * formatNumber(1234567, { wholeNumbers: true }) → "1.235 million"
 * formatNumber(1234.5, { allowDecimals: true }) → "1,235"
 * formatNumber(12.5, { allowDecimals: true }) → "12.5"
 */
export function formatNumber(num, options = {}) {
  if (num === 0) return '0';
  if (isNaN(num) || !isFinite(num)) return '0';
  
  const { noDecimals = false, wholeNumbers = false, allowDecimals = false } = options;
  
  // Handle negative numbers
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  
  // For whole numbers (assistants), round to nearest integer
  if (wholeNumbers) {
    const roundedNum = Math.round(absNum);
    if (roundedNum < 1000000) {
      return isNegative ? `-${roundedNum.toLocaleString()}` : roundedNum.toLocaleString();
    }
    // Use large number names for assistants ≥ 1 million
    return formatWithLargeNames(roundedNum, isNegative, { wholeNumbers: true });
  }
  
  // For snowballs with no decimals option, handle < 1 case
  if (noDecimals && absNum < 1) {
    return '0';
  }
  
  // For snowballs, always use integers
  if (noDecimals) {
    const floorNum = Math.floor(absNum);
    if (floorNum < 1000000) {
      return isNegative ? `-${floorNum.toLocaleString()}` : floorNum.toLocaleString();
    }
    // Use large number names with 4 significant figures for snowballs ≥ 1 million
    return formatWithLargeNames(floorNum, isNegative, { wholeNumbers: true });
  }
  
  // For SPS/acceleration with decimals allowed
  if (allowDecimals) {
    if (absNum < 100) {
      // Show 1 decimal place for values < 100
      const formatted = absNum.toFixed(1);
      return isNegative ? `-${formatted}` : formatted;
    } else if (absNum < 1000000) {
      // No decimals for values ≥ 100 and < 1 million
      const floorNum = Math.floor(absNum);
      return isNegative ? `-${floorNum.toLocaleString()}` : floorNum.toLocaleString();
    } else {
      // Use large number names for values ≥ 1 million
      return formatWithLargeNames(absNum, isNegative, { allowDecimals: true });
    }
  }
  
  // Default case: standard formatting
  if (absNum < 1000000) {
    return isNegative ? `-${absNum.toLocaleString()}` : absNum.toLocaleString();
  }
  
  return formatWithLargeNames(absNum, isNegative, {});
}

/**
 * Helper function to format numbers with large number names
 * @param {number} num - The number to format
 * @param {boolean} isNegative - Whether the number is negative
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number string
 */
function formatWithLargeNames(num, isNegative, options) {
  const { noDecimals = false, wholeNumbers = false, allowDecimals = false } = options;
  
  // Find the appropriate large number name (start at 1 million)
  const magnitude = Math.floor(Math.log10(num));
  const thousands = Math.floor(magnitude / 3);
  const power = thousands * 3;
  
  // Only use large names for 1 million and above
  if (power < 6) {
    if (noDecimals || wholeNumbers) {
      const floorNum = Math.floor(num);
      return isNegative ? `-${floorNum.toLocaleString()}` : floorNum.toLocaleString();
    }
    return isNegative ? `-${num.toLocaleString()}` : num.toLocaleString();
  }
  
  // Get the large number name
  const numberName = LARGE_NUMBER_NAMES[power];
  if (!numberName) {
    // For extremely large numbers, use the highest available name
    const maxPower = Math.max(...Object.keys(LARGE_NUMBER_NAMES).map(Number));
    const maxName = LARGE_NUMBER_NAMES[maxPower];
    const coefficient = num / Math.pow(10, maxPower);
    const formattedCoefficient = formatCoefficient(coefficient, { noDecimals, wholeNumbers, allowDecimals });
    const result = `${formattedCoefficient} ${maxName}`;
    return isNegative ? `-${result}` : result;
  }
  
  // Calculate the coefficient (number divided by 10^power)
  const coefficient = num / Math.pow(10, power);
  
  // Format coefficient with appropriate precision
  const formattedCoefficient = formatCoefficient(coefficient, { noDecimals, wholeNumbers, allowDecimals });
  
  const result = `${formattedCoefficient} ${numberName}`;
  return isNegative ? `-${result}` : result;
}

/**
 * Helper function to format coefficients with exactly 4 significant figures
 * 
 * This function implements the core 4 significant figures rule:
 * - For coefficients ≥ 1: Uses exactly 4 significant figures
 * - Decimal placement adjusts based on integer portion size
 * - Trailing zeros are removed for cleaner display
 * 
 * Examples:
 * - coefficient = 1.234 (magnitude = 0): 3 decimal places → "1.234"
 * - coefficient = 12.34 (magnitude = 1): 2 decimal places → "12.34"
 * - coefficient = 123.4 (magnitude = 2): 1 decimal place → "123.4"
 * - coefficient = 1000 (magnitude = 3): 0 decimal places → "1000"
 * 
 * @param {number} coefficient - The coefficient to format (typically 1-999.999)
 * @param {Object} options - Formatting options from parent function
 * @returns {string} Formatted coefficient string
 */
function formatCoefficient(coefficient, options) {
  const { noDecimals = false, wholeNumbers = false, allowDecimals = false } = options;
  
  if (noDecimals) {
    return Math.floor(coefficient).toLocaleString();
  }
  
  if (wholeNumbers) {
    // For whole numbers (like snowballs), use 4 significant figures for large numbers
    if (coefficient >= 1) {
      const magnitude = Math.floor(Math.log10(coefficient));
      const decimalPlaces = Math.max(0, 3 - magnitude); // 4 sig figs total
      const formatted = coefficient.toFixed(decimalPlaces);
      // Remove trailing zeros after decimal point
      return formatted.replace(/\.?0+$/, '');
    } else {
      return Math.floor(coefficient).toLocaleString();
    }
  }
  
  // For large numbers (≥ 1 million), use exactly 4 significant figures
  if (allowDecimals) {
    // For SPS/acceleration, use exactly 4 significant figures
    const magnitude = Math.floor(Math.log10(coefficient));
    const decimalPlaces = Math.max(0, 3 - magnitude); // 4 sig figs total
    const formatted = coefficient.toFixed(decimalPlaces);
    // Remove trailing zeros after decimal point
    return formatted.replace(/\.?0+$/, '');
  }
  
  // Default: exactly 4 significant figures for general use
  const magnitude = Math.floor(Math.log10(coefficient));
  const decimalPlaces = Math.max(0, 3 - magnitude); // 4 sig figs total
  const formatted = coefficient.toFixed(decimalPlaces);
  // Remove trailing zeros after decimal point
  return formatted.replace(/\.?0+$/, '');
}

/**
 * Format snowballs with 4 significant figures for large numbers
 * 
 * Used for:
 * - Wallet display
 * - Mini-wallet display
 * - Snowball counts throughout the game
 * 
 * Formatting rules:
 * - Small values (< 1 million): Whole numbers with commas (1,234, 12,345)
 * - Large values (≥ 1 million): 4 significant figures (1.235 million, 12.35 million)
 * - Always whole numbers (no decimals)
 * 
 * @param {number} num - Number of snowballs
 * @returns {string} Formatted snowball count
 * 
 * @example
 * formatSnowballs(1234) → "1,234"
 * formatSnowballs(1234567) → "1.235 million"
 * formatSnowballs(100000000) → "100 million"
 */
export function formatSnowballs(num) {
  return formatNumber(num, { wholeNumbers: true });
}

/**
 * Format assistant count with 4 significant figures for large numbers
 * 
 * Used for:
 * - Assistant quantities in UI
 * - Assistant counts in tooltips
 * - Any assistant-related displays
 * 
 * Formatting rules:
 * - Same as snowballs: whole numbers with 4 significant figures for large values
 * - Always whole numbers (no decimals)
 * 
 * @param {number} num - Number of assistants
 * @returns {string} Formatted assistant count
 * 
 * @example
 * formatAssistants(1234) → "1,234"
 * formatAssistants(1234567) → "1.235 million"
 * formatAssistants(100000000) → "100 million"
 */
export function formatAssistants(num) {
  return formatNumber(num, { wholeNumbers: true });
}

/**
 * Format percentage with 2 decimal places
 * @param {number} value - The value to convert to percentage
 * @param {number} total - The total value
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, total) {
  if (total === 0) return '0.00%';
  const percentage = (value / total) * 100;
  return percentage.toFixed(2) + '%';
}

/**
 * Format SPS (snowballs per second) with appropriate precision
 * 
 * Used for:
 * - SPS displays in UI
 * - Rate calculations
 * - Performance metrics
 * 
 * Formatting rules:
 * - Small values (< 100): 1 decimal place (12.5/s, 99.9/s)
 * - Medium values (100-999,999): Whole numbers (1,235/s, 12,346/s)
 * - Large values (≥ 1 million): 4 significant figures (1.235 million/s, 10 million/s)
 * 
 * @param {number} num - SPS value
 * @returns {string} Formatted SPS with "/s" suffix
 * 
 * @example
 * formatSPS(12.5) → "12.5/s"
 * formatSPS(1234.5) → "1,235/s"
 * formatSPS(1234567.8) → "1.235 million/s"
 */
export function formatSPS(num) {
  return formatNumber(num, { allowDecimals: true }) + '/s';
}

/**
 * Format acceleration (SPS per second squared) with appropriate precision
 * 
 * Used for:
 * - Acceleration displays in UI
 * - Rate of change calculations
 * - Performance metrics
 * 
 * Formatting rules:
 * - Same as SPS: decimals for small values, 4 significant figures for large values
 * - Small values (< 100): 1 decimal place (12.5/s², 99.9/s²)
 * - Medium values (100-999,999): Whole numbers (1,235/s², 12,346/s²)
 * - Large values (≥ 1 million): 4 significant figures (1.235 million/s², 10 million/s²)
 * 
 * @param {number} num - Acceleration value
 * @returns {string} Formatted acceleration with "/s²" suffix
 * 
 * @example
 * formatAcceleration(12.5) → "12.5/s²"
 * formatAcceleration(1234.5) → "1,235/s²"
 * formatAcceleration(1234567.8) → "1.235 million/s²"
 */
export function formatAcceleration(num) {
  return formatNumber(num, { allowDecimals: true }) + '/s²';
}

/**
 * Format ROI (Return on Investment) time with appropriate units
 * 
 * Used for:
 * - Assistant tooltips showing payback time
 * - Upgrade efficiency calculations
 * - Investment decision metrics
 * 
 * Formatting rules:
 * - < 1 minute: Show in seconds (e.g., "45s")
 * - < 1 hour: Show in minutes (e.g., "12m 30s")
 * - < 1 day: Show in hours (e.g., "2h 15m")
 * - ≥ 1 day: Show in days (e.g., "3d 12h")
 * 
 * @param {number} cost - Cost in snowballs
 * @param {number} sps - Snowballs per second generated
 * @returns {string} Formatted ROI time
 * 
 * @example
 * formatROITime(1000, 10) → "1m 40s"
 * formatROITime(1000000, 1000) → "16m 40s"
 * formatROITime(1000000000, 10000) → "27h 46m"
 */
export function formatROITime(cost, sps) {
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
} 