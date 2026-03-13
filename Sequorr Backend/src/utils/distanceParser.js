/**
 * Distance string parser — converts race distance labels into numeric miles.
 *
 * Handles known names ("5K", "Half Marathon", "Marathon", "Ultra"),
 * metric patterns ("10K", "50km"), and imperial patterns ("5 mi", "13.1 miles").
 */

const KM_TO_MILES = 0.621371;
const MILES_TO_KM = 1.60934;

/** Well-known race distance labels → miles */
const KNOWN_DISTANCES = {
  '1k':             0.62,
  '5k':             3.1,
  '8k':             4.97,
  '10k':            6.2,
  '15k':            9.32,
  'half marathon':  13.1,
  'half':           13.1,
  'marathon':       26.2,
  'ultra':          31.1,
  '50k':            31.1,
  '100k':           62.1,
  '50 miler':       50,
  '50 mile':        50,
  '100 miler':      100,
  '100 mile':       100,
};

/**
 * Parse a distance string into numeric miles.
 * @param {string|number|null|undefined} distance
 * @returns {number|null} distance in miles, or null if unparseable
 */
function parseDistance(distance) {
  if (distance == null) return null;
  if (typeof distance === 'number') return distance;

  const raw = String(distance).trim().toLowerCase();
  if (!raw) return null;

  // Exact lookup
  if (KNOWN_DISTANCES[raw] !== undefined) return KNOWN_DISTANCES[raw];

  // Pattern: Xk or X km  (e.g. "15k", "21.1 km", "42.195km")
  const kmMatch = raw.match(/^([\d.]+)\s*(?:k|km|kilo(?:met(?:er|re))?s?)$/);
  if (kmMatch) return round(parseFloat(kmMatch[1]) * KM_TO_MILES);

  // Pattern: X mi or X miles  (e.g. "13.1 mi", "26.2 miles")
  const miMatch = raw.match(/^([\d.]+)\s*(?:mi|mile|miles)$/);
  if (miMatch) return round(parseFloat(miMatch[1]));

  // Pattern: X m or X meters (likely meters, short distances)
  const mMatch = raw.match(/^([\d.]+)\s*(?:m|meters?|metres?)$/);
  if (mMatch) return round(parseFloat(mMatch[1]) / 1609.344);

  // Last resort: try bare number (assume miles)
  const num = parseFloat(raw);
  if (!isNaN(num)) return round(num);

  return null;
}

/**
 * Convert km to miles.
 * @param {number} km
 * @returns {number} miles
 */
function kmToMiles(km) {
  return round(km * KM_TO_MILES);
}

/**
 * Convert miles to km.
 * @param {number} miles
 * @returns {number} km
 */
function milesToKm(miles) {
  return round(miles * MILES_TO_KM);
}

/** Round to 2 decimal places */
function round(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { parseDistance, kmToMiles, milesToKm, KNOWN_DISTANCES };
