/**
 * Date Formatter Utilities
 */

/**
 * Format date string to readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format date to short format (e.g., "Jan 1, 2024")
 * @param {string} dateString - ISO date string
 * @returns {string} Short formatted date
 */
export function formatDateShort(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format date to relative time (e.g., "2 days ago")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time
 */
export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}



/**
 * Currency Formatter Utilities
 */

/**
 * Format number to Rupiah currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export function formatRupiah(amount) {
  const number = parseFloat(amount);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

/**
 * Format number to compact currency (e.g., "1.5K", "2.3M")
 * @param {number} amount - Amount to format
 * @returns {string} Compact formatted currency
 */
export function formatCompactCurrency(amount) {
  const number = Math.abs(parseFloat(amount));
  
  if (number >= 1000000000) {
    return `Rp ${(number / 1000000000).toFixed(1)}B`;
  }
  if (number >= 1000000) {
    return `Rp ${(number / 1000000).toFixed(1)}M`;
  }
  if (number >= 1000) {
    return `Rp ${(number / 1000).toFixed(1)}K`;
  }
  
  return formatRupiah(number);
}

/**
 * Parse Rupiah string to number
 * @param {string} rupiahString - Rupiah formatted string
 * @returns {number} Parsed number
 */
export function parseRupiah(rupiahString) {
  return parseFloat(rupiahString.replace(/[^0-9,-]/g, "").replace(",", "."));
}



/**
 * String Utilities
 */

/**
 * Capitalize first letter of string
 * @param {string} str - Input string
 * @returns {string} Capitalized string
 */
export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate string with ellipsis
 * @param {string} str - Input string
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + "...";
}



/**
 * Number Utilities
 */

/**
 * Clamp number between min and max
 * @param {number} num - Input number
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped number
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Round number to specified decimal places
 * @param {number} num - Input number
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded number
 */
export function roundTo(num, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}



/**
 * Array Utilities
 */

/**
 * Group array items by a key
 * @param {Array} array - Input array
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
}



/**
 * Object Utilities
 */

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if empty
 */
export function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}



/**
 * Validation Utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate number
 * @param {any} value - Value to validate
 * @returns {boolean} True if valid number
 */
export function isValidNumber(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}
