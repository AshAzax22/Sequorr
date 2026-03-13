/**
 * Fetch wrapper with AbortController timeout.
 */

const findrConfig = require('../config/findr');

/**
 * @param {string} url
 * @param {object} [options]
 * @param {number} [timeoutMs] — override default timeout
 * @returns {Promise<any>} parsed JSON body
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = findrConfig.fetch.timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      const err = new Error(
        `Upstream API error: ${response.status} ${response.statusText} — ${body.slice(0, 200)}`
      );
      err.statusCode = 502;
      throw err;
    }

    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeout = new Error(`Upstream API timed out after ${timeoutMs}ms`);
      timeout.statusCode = 504;
      throw timeout;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = fetchWithTimeout;
