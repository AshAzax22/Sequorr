import { API_BASE, getAuthToken } from './config';

export const getTags = async () => {
  const res = await fetch(`${API_BASE}/tags`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch tags');
  return data;
};

export const createTag = async (name) => {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ name })
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create tag');
  return data;
};

// Delete tag removed per requirements.
