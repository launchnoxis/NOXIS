import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30_000,
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.error || err.message || 'Request failed';
    return Promise.reject(new Error(msg));
  }
);

// ─── Token ────────────────────────────────────────────────────────────────────
export const buildLaunchTx = (data) => api.post('/token/build', data);
export const submitSignedTx = (data) => api.post('/token/submit', data);
export const getTokenStatus = (sig) => api.get(`/token/status/${sig}`);
export const getTokenInfo = (mint) => api.get(`/token/info/${mint}`);

// ─── Wallet ───────────────────────────────────────────────────────────────────
export const getWalletBalance = (address) => api.get(`/wallet/balance/${address}`);
export const getWalletTokens = (address) => api.get(`/wallet/tokens/${address}`);
export const getNetwork = () => api.get('/wallet/network');

// ─── Vesting ──────────────────────────────────────────────────────────────────
export const previewVesting = (data) => api.post('/vesting/preview', data);
export const buildVestingTx = (data) => api.post('/vesting/build', data);

// ─── Boost ────────────────────────────────────────────────────────────────────
export const startVolumeJob = (data) => api.post('/boost/volume/start', data);
export const stopVolumeJob = (id) => api.post(`/boost/volume/stop/${id}`);
export const getVolumeJobStatus = (id) => api.get(`/boost/volume/status/${id}`);
export const listVolumeJobs = (wallet) => api.get(`/boost/volume/list?wallet=${wallet || ''}`);
export const buildBoostBuy = (data) => api.post('/boost/buy', data);

export default api;
