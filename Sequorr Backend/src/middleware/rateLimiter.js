/**
 * Rate limiter for Findr race endpoints.
 * 100 requests per 15 minutes per IP.
 */

const rateLimit = require('express-rate-limit');

const findrRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
});

module.exports = findrRateLimiter;
