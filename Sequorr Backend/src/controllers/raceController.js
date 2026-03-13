/**
 * Race controller — request handlers for Findr race endpoints.
 */

const runsignupService = require('../services/runsignupService');
const geocodeService = require('../services/geocodeService');
const { filterRaces, sortRaces, paginateRaces } = require('../services/raceFilterService');
const { VALID_EVENT_TYPES } = require('../middleware/validateRaces');
const findrConfig = require('../config/findr');

/**
 * GET /api/races — List races with filtering, sorting, and pagination.
 *
 * Filters pushed to RunSignUp API (better results):
 *   - city, state, zipcode, radius, country, lat, lng (location)
 *   - start_date, end_date (date range)
 *   - event_type (race type)
 *   - min_distance, max_distance, distance_units (distance range)
 *   - search → name (race name search)
 *   - only_races_with_results
 *
 * Filters applied client-side (not supported by RunSignUp):
 *   - registration_open
 *   - has_virtual_option
 */
async function listRaces(req, res) {
  const q = req.query;
  const {
    page,
    results_per_page,
    sort,
    sort_dir,
    // Dates
    start_date,
    end_date,
    // Filters pushed upstream to RunSignUp
    event_type,
    min_distance,
    max_distance,
    distance_units,
    search,
    only_races_with_results,
    include_event_days,
    // Client-side only filters (RunSignUp doesn't support these)
    registration_open,
    has_virtual_option,
    // Remaining upstream filters (city, state, zipcode, radius, country, lat, lng)
    ...locationFilters
  } = q;

  // Only registration_open and has_virtual_option need client-side filtering
  const hasClientFilters = !!(registration_open || has_virtual_option);

  // Determine how many to fetch from upstream
  const overFetch = hasClientFilters
    ? results_per_page * findrConfig.defaults.overFetchMultiplier
    : results_per_page;

  // Build the upstream params object — most filters go directly to RunSignUp
  const upstreamParams = {
    ...locationFilters,
    start_date,
    end_date,
    sort,
    sort_dir,
    // Push these filters upstream for better results
    ...(event_type && { event_type }),
    ...(min_distance != null && { min_distance }),
    ...(max_distance != null && { max_distance }),
    ...(distance_units && { distance_units }),
    ...(search && { name: search }),
    ...(only_races_with_results && { only_races_with_results }),
    ...(include_event_days && { include_event_days }),
  };

  try {
    let allFiltered = [];
    let upstreamPage = 1;
    let retries = 0;
    const maxRetries = findrConfig.defaults.maxRetries;
    let estimatedTotal = null;

    // Fetch + filter loop
    while (retries < maxRetries) {
      const upstream = await runsignupService.fetchRaces({
        ...upstreamParams,
        results_per_page: overFetch,
        page: upstreamPage,
      });

      if (estimatedTotal === null) {
        estimatedTotal = upstream.totalResults;
      }

      const batch = upstream.races;
      if (batch.length === 0) break;

      // Apply client-side filters (only the ones RunSignUp can't handle)
      const filtered = hasClientFilters
        ? filterRaces(batch, { registration_open, has_virtual_option })
        : batch;

      allFiltered = allFiltered.concat(filtered);

      // Check if we have enough for the requested page
      const needed = page * results_per_page;
      if (allFiltered.length >= needed || batch.length < overFetch) break;

      upstreamPage++;
      retries++;
    }

    // Sort the combined filtered results
    const sorted = sortRaces(allFiltered, sort, sort_dir);

    // Paginate
    const { races, pagination } = paginateRaces(sorted, page, results_per_page);

    // Build applied filters summary
    const filters_applied = {};
    if (event_type) filters_applied.event_type = event_type;
    if (min_distance != null) filters_applied.min_distance = min_distance;
    if (max_distance != null) filters_applied.max_distance = max_distance;
    if (distance_units && distance_units !== 'miles') filters_applied.distance_units = distance_units;
    if (locationFilters.city) filters_applied.city = locationFilters.city;
    if (locationFilters.state) filters_applied.state = locationFilters.state;
    if (locationFilters.zipcode) filters_applied.zipcode = locationFilters.zipcode;
    if (locationFilters.country && locationFilters.country !== 'US') filters_applied.country = locationFilters.country;
    if (registration_open) filters_applied.registration_open = registration_open === 'true';
    if (has_virtual_option) filters_applied.has_virtual_option = has_virtual_option === 'true';
    if (search) filters_applied.search = search;
    if (only_races_with_results === 'true') filters_applied.only_races_with_results = true;

    // Geocode only the first result to keep initial response time low.
    // Frontend will lazy-geocode others as needed.
    const topResultOnly = races.slice(0, 1);
    const geocodedTop = await geocodeService.geocodeRaces(topResultOnly);
    const others = races.slice(1).map(r => ({ ...r, coordinates: null }));
    const merged = [...geocodedTop, ...others];

    res.json({ success: true, races: merged, pagination, filters_applied });
  } catch (error) {
    console.error('[RaceController] listRaces Error:', error);
    res.status(500).json({ success: false, message: 'Server error listing races' });
  }
}

/**
 * GET /api/race/:raceId — Get a single race by ID.
 */
async function getRace(req, res) {
  try {
    const race = await runsignupService.fetchRaceById(req.params.raceId);
    res.json({ success: true, data: race });
  } catch (error) {
    console.error('[RaceController] getRace Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching race details' });
  }
}

/**
 * GET /api/races/filters — Get available filter options for frontend dropdowns.
 */
function getFilters(_req, res) {
  res.json({
    success: true,
    event_types: VALID_EVENT_TYPES,
    distance_presets: [
      { label: '5K', miles: 3.1 },
      { label: '10K', miles: 6.2 },
      { label: 'Half Marathon', miles: 13.1 },
      { label: 'Marathon', miles: 26.2 },
      { label: 'Ultra (50K+)', miles: 31.1 },
    ],
    distance_units: ['miles', 'km'],
    sort_options: ['date', 'name', 'distance'],
    max_radius: findrConfig.defaults.maxRadius,
    available_countries: [
      { value: 'US', label: 'United States' },
      { value: 'CA', label: 'Canada' },
      { value: 'GB', label: 'United Kingdom' },
      { value: 'AU', label: 'Australia' },
      { value: 'IE', label: 'Ireland' },
      { value: 'NZ', label: 'New Zealand' },
      { value: 'IN', label: 'India' },
    ]
  });
}

/**
 * POST /api/races/geocode — Geocode an address (proxy to Nominatim).
 */
async function geocodeAddress(req, res) {
  try {
    const address = req.body;
    const coords = await geocodeService.geocode(address);
    res.json({ success: !!coords, data: coords });
  } catch (error) {
    console.error('[RaceController] geocodeAddress Error:', error);
    res.status(500).json({ success: false, message: 'Failed to geocode address' });
  }
}

module.exports = { listRaces, getRace, getFilters, geocodeAddress };

