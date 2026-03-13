/**
 * Normalize a raw RunSignUp race object into the Findr shape.
 */

const { parseDistance } = require('./distanceParser');

/**
 * Map RunSignUp event_type values to our simplified types.
 * RunSignUp uses values like 'running_race', 'trail_running', etc.
 */
const EVENT_TYPE_MAP = {
  'running_race': 'running',
  'running': 'running',
  'trail_running': 'trail',
  'trail_race': 'trail',
  'trail': 'trail',
  'walking': 'walking',
  'walk': 'walking',
  'cycling': 'cycling',
  'bike': 'cycling',
  'triathlon': 'triathlon',
  'obstacle_race': 'obstacle',
  'obstacle': 'obstacle',
  'virtual_race': 'virtual',
  'virtual': 'virtual',
  'swimming': 'swimming',
  'swim': 'swimming',
};

/**
 * Normalize a single race from RunSignUp API response.
 * @param {object} raw — raw race object (may be nested under .race)
 * @returns {object} normalized race
 */
function normalizeRace(raw) {
  // RunSignUp wraps each item in { race: { ... } }
  const r = raw.race || raw;

  const address = {
    street: r.address?.street || null,
    city: r.address?.city || null,
    state: r.address?.state || null,
    zipcode: r.address?.zipcode || null,
    country_code: r.address?.country_code || null,
  };

  const events = Array.isArray(r.events)
    ? r.events.map(normalizeEvent)
    : [];

  return {
    race_id: r.race_id,
    name: r.name || '',
    description: r.description || '',
    url: r.url || '',
    external_race_url: r.external_race_url || '',
    next_date: normalizeDate(r.next_date),
    timezone: r.timezone || null,
    address,
    logo_url: r.logo_url || null,
    is_registration_open: toBool(r.is_registration_open),
    events,
  };
}

/**
 * Normalize a single event within a race.
 * @param {object} raw — may be nested under .event
 * @returns {object}
 */
function normalizeEvent(raw) {
  const e = raw.event || raw;

  const distanceStr = e.distance || '';
  const distanceMiles = parseDistance(distanceStr);

  return {
    event_id: e.event_id,
    name: e.name || '',
    event_type: mapEventType(e.event_type),
    distance: distanceStr,
    distance_miles: distanceMiles,
    start_time: e.start_time || null,
    end_time: e.end_time || null,
    giveaway: e.giveaway || null,
    registration_periods: Array.isArray(e.registration_periods)
      ? e.registration_periods
      : [],
  };
}

/**
 * Convert RunSignUp's "T"/"F" strings to boolean.
 * @param {*} val
 * @returns {boolean}
 */
function toBool(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toUpperCase() === 'T';
  return Boolean(val);
}

/**
 * Normalize date from MM/DD/YYYY to YYYY-MM-DD.
 * @param {string|null} date
 * @returns {string|null}
 */
function normalizeDate(date) {
  if (!date) return null;

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.slice(0, 10);

  // MM/DD/YYYY format from RunSignUp
  const match = date.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (match) {
    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return date;
}

/**
 * Map upstream event_type to our simplified type.
 * @param {string} type
 * @returns {string}
 */
function mapEventType(type) {
  if (!type) return '';
  const key = type.toLowerCase().trim();
  return EVENT_TYPE_MAP[key] || key;
}

module.exports = { normalizeRace, normalizeEvent, toBool };
