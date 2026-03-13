/**
 * Geocoding utility using OpenStreetMap Nominatim API.
 * Includes local storage caching and simple rate limiting.
 */

import { API_BASE } from '../api/config';

const CACHE_KEY = 'findrr_geocache';

// Helper to get cache from localStorage
const getCache = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
};

// Helper to save cache to localStorage
const saveToCache = (addressKey, coords) => {
  try {
    const cache = getCache();
    cache[addressKey] = coords;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save to geocache', e);
  }
};

/**
 * Geocode an address object to { lat, lng }.
 * @param {object} address - { street, city, state, zipcode, country_code }
 * @returns {Promise<{lat: number, lng: number}|null>}
 */
export const geocodeAddress = async (address) => {
  const { street, city, state, zipcode, country_code } = address;
  
  // Create a unique key for caching
  const addressKey = `${street || ''}|${city || ''}|${state || ''}|${zipcode || ''}|${country_code || ''}`.toLowerCase();
  
  // Check cache first
  const cache = getCache();
  if (cache[addressKey]) {
    return cache[addressKey];
  }

  // Build query string
  const queryParts = [];
  if (street) queryParts.push(street);
  if (city) queryParts.push(city);
  if (state) queryParts.push(state);
  if (zipcode) queryParts.push(zipcode);
  if (country_code) queryParts.push(country_code);

  const q = queryParts.join(', ');
  if (!q) return null;

  try {
    const response = await fetch(`${API_BASE}/races/geocode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(address)
    });

    if (!response.ok) throw new Error('Geocoding request failed');

    const result = await response.json();
    if (result.success && result.data) {
      const coords = result.data;
      saveToCache(addressKey, coords);
      return coords;
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};
