/**
 * RunSignUp upstream API service with in-memory caching.
 */

const NodeCache = require('node-cache');
const findrConfig = require('../config/findr');
const fetchWithTimeout = require('../utils/fetchWithTimeout');
const { normalizeRace } = require('../utils/normalizeRace');

const cache = new NodeCache({
  stdTTL: findrConfig.cache.raceListTTL,
  checkperiod: 60,
});

const { baseUrl, apiKey, apiSecret } = findrConfig.runsignup;

// ── Public API ───────────────────────────────────────

/**
 * Fetch a list of races from RunSignUp.
 * Passes only upstream-supported params. Returns raw + normalized data.
 *
 * @param {object} params — upstream-compatible query params
 * @returns {{ races: object[], totalResults: number|null }}
 */
async function fetchRaces(params) {
  const qs = buildUpstreamParams(params);
  const cacheKey = `races:${qs}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const url = `${baseUrl}/races?${qs}`;
  const data = await fetchWithTimeout(url);

  const rawRaces = Array.isArray(data.races) ? data.races : [];
  const normalized = rawRaces.map(normalizeRace);
  const totalResults = data.total_results != null ? Number(data.total_results) : null;

  const result = { races: normalized, totalResults };
  cache.set(cacheKey, result, findrConfig.cache.raceListTTL);

  return result;
}

/**
 * Fetch a single race by ID from RunSignUp.
 *
 * @param {string|number} raceId
 * @returns {object} normalized race
 */
async function fetchRaceById(raceId) {
  const cacheKey = `race:${raceId}`;

  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const qs = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    format: 'json',
    events: 'T',
  }).toString();

  const url = `${baseUrl}/race/${raceId}?${qs}`;
  const data = await fetchWithTimeout(url);

  const raw = data.race || data;
  const normalized = normalizeRace(raw);

  cache.set(cacheKey, normalized, findrConfig.cache.singleRaceTTL);

  return normalized;
}

// ── Helpers ──────────────────────────────────────────

/**
 * Build the query string for RunSignUp /races endpoint.
 * Only includes upstream-supported params.
 */
function buildUpstreamParams(params) {
  const qs = {
    api_key: apiKey,
    api_secret: apiSecret,
    format: 'json',
    events: 'T',
    include_giveaway_details: 'T',
  };

  // Pagination
  if (params.results_per_page) qs.results_per_page = params.results_per_page;
  if (params.page) qs.page = params.page;

  // Location — upstream supports these natively
  if (params.city) qs.city = params.city;
  if (params.state) qs.state = params.state;
  if (params.zipcode) qs.zipcode = params.zipcode;
  if (params.radius) qs.radius = params.radius;
  if (params.country) qs.country = params.country;
  if (params.lat) qs.lat = params.lat;
  if (params.lng) qs.lng = params.lng;

  // Date
  if (params.start_date) {
    qs.start_date = params.start_date === 'today'
      ? new Date().toISOString().slice(0, 10)
      : params.start_date;
  }
  if (params.end_date) qs.end_date = params.end_date;

  // Name search — RunSignUp supports native name search
  if (params.name) qs.name = params.name;

  // Event type — RunSignUp supports this natively
  if (params.event_type) qs.event_type = params.event_type;

  // Distance — RunSignUp supports min/max distance with units natively
  // RunSignUp uses 'K' for km Kilometers and 'M' for Miles
  if (params.min_distance != null) qs.min_distance = params.min_distance;
  if (params.max_distance != null) qs.max_distance = params.max_distance;
  if (params.distance_units) {
    qs.distance_units = params.distance_units === 'miles' ? 'M' : 'K';
  }

  // Extra filters
  if (params.only_races_with_results === 'true') qs.only_races_with_results = 'T';
  if (params.include_event_days === 'true') qs.include_event_days = 'T';

  // Sort — upstream supports sort
  if (params.sort) qs.sort = params.sort;
  if (params.sort_dir) qs.order = params.sort_dir;

  return new URLSearchParams(qs).toString();
}

/**
 * Clear all caches (useful for testing / admin).
 */
function clearCache() {
  cache.flushAll();
}

module.exports = { fetchRaces, fetchRaceById, clearCache };
