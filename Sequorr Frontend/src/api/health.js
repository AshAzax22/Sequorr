import { apiFetch } from './config';

export const checkHealth = async () => {
  return apiFetch('/health');
};
