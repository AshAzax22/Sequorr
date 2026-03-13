/**
 * Backend Geocoding service using OpenStreetMap Nominatim.
 * Provides server-side coordinate caching to avoid rate limits and CORS issues.
 */

const NodeCache = require('node-cache');
const fetchWithTimeout = require('../utils/fetchWithTimeout');

// Cache geocoding results for 30 days (coordinates rarely change)
const geocache = new NodeCache({
  stdTTL: 60 * 60 * 24 * 30,
  checkperiod: 60 * 60, // check every hour
});

/**
 * Geocode an address object to { lat, lng }.
 * @param {object} address - { street, city, state, zipcode, country }
 * @returns {Promise<{lat: number, lng: number}|null>}
 */
async function geocode(address) {
  const { street, city, state, zipcode, country } = address;
  
  // Create a unique key for caching
  const addressKey = `${street || ''}|${city || ''}|${state || ''}|${zipcode || ''}|${country || 'US'}`.toLowerCase();
  
  const cached = geocache.get(addressKey);
  if (cached) return cached;

  // Build query string
  const queryParts = [];
  if (street) queryParts.push(street);
  if (city) queryParts.push(city);
  if (state) queryParts.push(state);
  if (zipcode) queryParts.push(zipcode);
  if (country) queryParts.push(country);
  
  const q = queryParts.join(', ');
  if (!q) return null;

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`;
    
    // Add retry logic for 429 Too Many Requests
    let data = null;
    let attempts = 0;
    while (attempts < 3) {
      try {
        data = await fetchWithTimeout(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'SequorrApp/1.0 (contact@sequorr.com)'
          }
        });
        break; // Sucesss
      } catch (err) {
        if (err.message.includes('429')) {
          attempts++;
          await new Promise(r => setTimeout(r, 2000 * attempts)); // Backoff 2s, 4s...
        } else {
          throw err;
        }
      }
    }

    if (data && data.length > 0) {
      const coords = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
      
      geocache.set(addressKey, coords);
      return coords;
    }

    return null;
  } catch (error) {
    console.error(`[Geocode Error] ${q}:`, error.message);
    return null;
  }
}

/**
 * Geocode a list of races sequentially.
 * @param {Array} races 
 * @returns {Promise<Array>}
 */
async function geocodeRaces(races) {
  const geocodedRaces = [];
  for (const race of races) {
    if (race.address) {
      const coords = await geocode(race.address);
      geocodedRaces.push({
        ...race,
        coordinates: coords
      });
    } else {
      geocodedRaces.push({
        ...race,
        coordinates: null
      });
    }
  }
  return geocodedRaces;
}

module.exports = { geocode, geocodeRaces };
