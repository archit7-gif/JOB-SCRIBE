

/**
 * Helper functions for your backend.
 * Add common utilities here.
 */

/**
 * Simple delay/sleep helper
 * @param {number} ms - milliseconds to delay
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Capitalize first letter of string
 * @param {string} str
 * @returns {string}
 */
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

module.exports = { delay, capitalize }
