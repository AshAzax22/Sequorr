export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getAuthToken() {
  return localStorage.getItem('sequorr_admin_key');
}

export function authHeaders() {
  const token = getAuthToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Fetch wrapper specifically for API calls that throws meaningful errors
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const headers = authHeaders();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
        if (data.errors && data.errors.length > 0) {
            throw new Error(data.errors.join(', '));
        }
        throw new Error(data.message || `API Error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Network error. Check if the backend is running.');
    }
    throw error;
  }
};

/**
 * Validates the API key with the backend
 */
export const adminLogin = async (apiKey) => {
  const url = `${API_BASE}/admin/login`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ apiKey })
    });
    
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
        throw new Error(data.message || 'Invalid API Key');
    }
    return data;
  } catch (error) {
     if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Could not connect to the API. Please ensure the backend is running.');
    }
    throw error;
  }
};
