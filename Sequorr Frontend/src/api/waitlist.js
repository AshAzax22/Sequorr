import { apiFetch, authHeaders } from './config';

export const getWaitlist = async (page = 1, limit = 50) => {
  return apiFetch(`/waitlist/admin?page=${page}&limit=${limit}`, {
    headers: authHeaders(),
  });
};

export const deleteWaitlistEntry = async (id) => {
  return apiFetch(`/waitlist/admin/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
};

export const getWaitlistStats = async () => {
  return apiFetch('/waitlist/admin/stats', {
    headers: authHeaders(),
  });
};
