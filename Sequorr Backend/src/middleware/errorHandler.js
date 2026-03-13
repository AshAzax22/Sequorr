/**
 * Centralized async error handler middleware.
 */

/**
 * Wrap an async route handler to catch thrown errors.
 * @param {Function} fn — async (req, res, next) => ...
 * @returns {Function}
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Express error-handling middleware (4 args).
 * Returns consistent { error, statusCode } JSON.
 */
function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR ${statusCode}]`, err.stack || err);
  } else {
    console.error(`[ERROR ${statusCode}] ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}

module.exports = { asyncHandler, errorHandler };
