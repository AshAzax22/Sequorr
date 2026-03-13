/**
 * Findr race routes.
 */

const { Router } = require('express');

const {
  listRaces,
  getRace,
  getFilters,
  geocodeAddress,
} = require('../controllers/raceController');

const {
  listRacesSchema,
  raceIdSchema,
  validateQuery,
  validateParams,
} = require('../middleware/validateRaces');

const { asyncHandler } = require('../middleware/errorHandler');

const router = Router();

// Static filter options (must be above /:raceId to avoid catch)
router.get('/filters', getFilters);

// List races with full filtering, sorting, pagination
router.get('/', validateQuery(listRacesSchema), asyncHandler(listRaces));

// Single race by ID
router.get('/:raceId', validateParams(raceIdSchema), asyncHandler(getRace));

// Proxy Geocoding
router.post('/geocode', asyncHandler(geocodeAddress));

module.exports = router;
