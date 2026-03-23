import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://noxis-backend-production.up.railway.app';

const api = {
  post: async (path, data) => {
    const res = await axios.post(API_BASE + path, data, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000,
    });
    return res.data;
  },
  get: async (path) => {
    const res = await axios.get(API_BASE + path, { timeout: 30000 });
    return res.data;
  },
};

export const buildLocalLaunchTx = (data) => api.post('/token/build-local', data);

export const buildDevBuyTx = (data) => api.post('/token/build-buy', data);

export const previewVesting = (data) => api.post('/vesting/preview', data);

export default api;
