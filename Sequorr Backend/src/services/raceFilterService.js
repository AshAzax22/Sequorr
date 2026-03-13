/**
 * Server-side race filtering, sorting, and pagination logic.
 *
 * Handles filters that RunSignUp doesn't support natively:
 * event_type, distance range, registration status, text search.
 */

const { kmToMiles } = require('../utils/distanceParser');

// ── Filtering ────────────────────────────────────────

/**
 * Apply client-side filters to an array of normalized races.
 *
 * @param {object[]} races — normalized race objects
 * @param {object} filters — validated query params
 * @returns {object[]} filtered races
 */
function filterRaces(races, filters) {
  let result = races;

  // Event type filter — keep races with at least one matching event
  if (filters.event_type && filters.event_type.length > 0) {
    const types = new Set(filters.event_type);
    result = result.filter((race) =>
      race.events.some((e) => types.has(e.event_type))
    );
  }

  // Distance range filter — keep races with at least one event in range
  const minDist = convertToMiles(filters.min_distance, filters.distance_units);
  const maxDist = convertToMiles(filters.max_distance, filters.distance_units);

  if (minDist != null || maxDist != null) {
    result = result.filter((race) =>
      race.events.some((e) => {
        if (e.distance_miles == null) return false;
        if (minDist != null && e.distance_miles < minDist) return false;
        if (maxDist != null && e.distance_miles > maxDist) return false;
        return true;
      })
    );
  }

  // Registration open filter
  if (filters.registration_open === 'true') {
    result = result.filter((race) => race.is_registration_open === true);
  }

  // Virtual option filter (check if any event is "virtual" type)
  if (filters.has_virtual_option === 'true') {
    result = result.filter((race) =>
      race.events.some((e) => e.event_type === 'virtual')
    );
  }

  // Free-text search — case-insensitive match on name + description
  if (filters.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter((race) => {
      const name = (race.name || '').toLowerCase();
      const desc = (race.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }

  return result;
}

// ── Sorting ──────────────────────────────────────────

/**
 * Sort races by the specified field and direction.
 *
 * @param {object[]} races
 * @param {string} sortField — "date" | "name" | "distance" | "relevance"
 * @param {string} sortDir — "ASC" | "DESC"
 * @returns {object[]} sorted races (new array)
 */
function sortRaces(races, sortField = 'date', sortDir = 'ASC') {
  const dir = sortDir === 'DESC' ? -1 : 1;

  return [...races].sort((a, b) => {
    switch (sortField) {
      case 'name':
        return dir * (a.name || '').localeCompare(b.name || '');

      case 'distance': {
        const da = getMinDistance(a);
        const db = getMinDistance(b);
        return dir * (da - db);
      }

      case 'date':
      default: {
        const dateA = a.next_date || '';
        const dateB = b.next_date || '';
        return dir * dateA.localeCompare(dateB);
      }
    }
  });
}

// ── Pagination ───────────────────────────────────────

/**
 * Slice a filtered + sorted array into a page and build pagination metadata.
 *
 * @param {object[]} races — full filtered array
 * @param {number} page — 1-indexed
 * @param {number} resultsPerPage
 * @returns {{ races: object[], pagination: object }}
 */
function paginateRaces(races, page, resultsPerPage) {
  const totalResults = races.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / resultsPerPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * resultsPerPage;
  const end = start + resultsPerPage;

  return {
    races: races.slice(start, end),
    pagination: {
      page: safePage,
      results_per_page: resultsPerPage,
      total_results: totalResults,
      total_pages: totalPages,
    },
  };
}

// ── Helpers ──────────────────────────────────────────

/**
 * Convert a distance value to miles if units are km.
 */
function convertToMiles(value, units) {
  if (value == null) return null;
  return units === 'km' ? kmToMiles(value) : value;
}

/**
 * Get the minimum distance_miles across all events in a race (for sorting).
 */
function getMinDistance(race) {
  if (!race.events || race.events.length === 0) return Infinity;
  const distances = race.events
    .map((e) => e.distance_miles)
    .filter((d) => d != null);
  return distances.length > 0 ? Math.min(...distances) : Infinity;
}

module.exports = { filterRaces, sortRaces, paginateRaces };
