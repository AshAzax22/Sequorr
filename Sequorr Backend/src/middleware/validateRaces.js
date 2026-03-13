/**
 * Zod validation schemas and middleware for Findr race endpoints.
 */

const { z } = require('zod');

// ── Helpers ──────────────────────────────────────────

const coerceInt = (def) =>
  z.preprocess((v) => (v === undefined ? def : Number(v)), z.number().int());

const coerceFloat = () =>
  z.preprocess((v) => (v === undefined ? undefined : Number(v)), z.number().optional());

const optionalString = () => z.string().optional();

const VALID_EVENT_TYPES = [
  'running', 'trail', 'walking', 'cycling',
  'triathlon', 'obstacle', 'virtual', 'swimming',
];

const VALID_SORT_FIELDS = ['date', 'name', 'distance', 'relevance'];
const VALID_SORT_DIRS = ['ASC', 'DESC'];

// ── Schemas ──────────────────────────────────────────

const listRacesSchema = z.object({
  // Pagination
  page: coerceInt(1).pipe(z.number().int().min(1)),
  results_per_page: coerceInt(12).pipe(z.number().int().min(1).max(50)),

  // Location
  city: optionalString(),
  state: z.string().max(3).optional(),
  zipcode: z.string().max(10).optional(),
  radius: coerceInt(25).pipe(z.number().int().min(1).max(100)).optional(),
  country: z.string().max(3).default('US'),
  lat: coerceFloat(),
  lng: coerceFloat(),

  // Date
  start_date: z.string()
    .refine(
      (v) => v === 'today' || /^\d{4}-\d{2}-\d{2}$/.test(v),
      { message: 'start_date must be "today" or YYYY-MM-DD' }
    )
    .default('today'),
  end_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'end_date must be YYYY-MM-DD')
    .optional(),

  // Race type & distance (sent upstream to RunSignUp)
  event_type: optionalString(),
  min_distance: coerceFloat().pipe(z.number().min(0).optional()),
  max_distance: coerceFloat().pipe(z.number().min(0).optional()),
  distance_units: z.enum(['miles', 'km']).default('miles'),

  // Status (client-side filters — not supported by RunSignUp)
  registration_open: z.enum(['true', 'false']).optional(),
  has_virtual_option: z.enum(['true', 'false']).optional(),

  // Search (sent upstream as RunSignUp "name" param)
  search: optionalString(),

  // Extra RunSignUp filters
  only_races_with_results: z.enum(['true', 'false']).optional(),
  include_event_days: z.enum(['true', 'false']).optional(),

  // Sorting
  sort: z.enum(VALID_SORT_FIELDS).default('date'),
  sort_dir: z.enum(VALID_SORT_DIRS).default('ASC'),
}).strip();

const raceIdSchema = z.object({
  raceId: z.string().regex(/^\d+$/, 'raceId must be a numeric string'),
});

// ── Middleware factories ─────────────────────────────

/**
 * Validate req.query against a Zod schema.
 */
function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const err = new Error(
        result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
      );
      err.statusCode = 400;
      return next(err);
    }
    req.query = result.data;
    next();
  };
}

/**
 * Validate req.params against a Zod schema.
 */
function validateParams(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      const err = new Error(
        result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
      );
      err.statusCode = 400;
      return next(err);
    }
    req.params = result.data;
    next();
  };
}

module.exports = {
  listRacesSchema,
  raceIdSchema,
  validateQuery,
  validateParams,
  VALID_EVENT_TYPES,
  VALID_SORT_FIELDS,
};
