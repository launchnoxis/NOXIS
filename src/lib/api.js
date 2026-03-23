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

// LaunchTab
export const buildLocalLaunchTx = (data) => api.post('/token/build-local', data);
export const buildDevBuyTx = (data) => api.post('/token/build-buy', data);

// AntiRugTab
export const previewVesting = (data) => api.post('/vesting/preview', data);

// BoostTab
export const startVolumeJob = (data) => api.post('/api/boost/start', data);
export const stopVolumeJob = (jobId) => api.post('/api/boost/stop', { jobId });
export const getVolumeJobStatus = (jobId) => api.get('/api/boost/status/' + jobId);

// DashboardTab
export const getWalletBalance = (wallet) => api.get('/api/wallet/balance/' + wallet);
export const getWalletTokens = (wallet) => api.get('/api/wallet/tokens/' + wallet);
export const listVolumeJobs = (wallet) => api.get('/api/boost/jobs/' + (wallet || ''));

export default api;
