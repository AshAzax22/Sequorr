import { API_BASE } from './config';

/**
 * Fetch races from the public Findrr API.
 * @param {object} params - { page, limit, search, event_type, min_distance, max_distance, etc. }
 * @returns {Promise<object>}
 */
export const getRaces = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/races?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch races');
  return data;
};

/**
 * Get available filter options.
 * @returns {Promise<object>}
 */
export const getRaceFilters = async () => {
  const res = await fetch(`${API_BASE}/races/filters`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch filters');
  return data;
};

/**
 * Get a single race by ID.
 * @param {string} id 
 * @returns {Promise<object>}
 */
export const getRaceById = async (id) => {
  const res = await fetch(`${API_BASE}/races/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch race details');
  return data;
};
