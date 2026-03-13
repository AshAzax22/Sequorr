/**
 * Findr configuration — RunSignUp API credentials & defaults.
 * Fails fast on startup if required env vars are missing.
 */

const requiredVars = ['RUNSIGNUP_API_KEY', 'RUNSIGNUP_API_SECRET'];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const findrConfig = Object.freeze({
  runsignup: {
    baseUrl: 'https://api.runsignup.com/rest',
    apiKey: process.env.RUNSIGNUP_API_KEY,
    apiSecret: process.env.RUNSIGNUP_API_SECRET,
  },
  cache: {
    raceListTTL: 180,   // 3 minutes in seconds
    singleRaceTTL: 300, // 5 minutes in seconds
  },
  fetch: {
    timeoutMs: 12000,
  },
  defaults: {
    resultsPerPage: 12,
    maxResultsPerPage: 50,
    country: 'US',
    radius: 25,
    maxRadius: 100,
    overFetchMultiplier: 3,
    maxRetries: 3,
  },
});

module.exports = findrConfig;
