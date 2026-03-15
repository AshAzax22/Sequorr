import { apiFetch, authHeaders } from './config';

export const getContacts = async (page = 1, limit = 20) => {
  return apiFetch(`/contact/admin?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });
};

export const updateContactStatus = async (id, status) => {
  return apiFetch(`/contact/admin/${id}`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
};

export const deleteContact = async (id) => {
  return apiFetch(`/contact/admin/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
};

export const getContactStats = async () => {
  return apiFetch('/contact/admin/stats', {
    headers: authHeaders(),
  });
};
