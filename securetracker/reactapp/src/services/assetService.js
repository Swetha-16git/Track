import axios from 'axios';

// ✅ Use ONE env var everywhere (recommended)
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Attach JWT token to every request (support both keys)
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('pending_access_token');

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const unwrapAsset = (data) => {
  if (!data) return null;
  if (data.asset) return data.asset;
  if (data.data?.asset) return data.data.asset;
  return data;
};

const unwrapAssets = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.assets)) return data.assets;
  if (Array.isArray(data.data?.assets)) return data.data.assets;
  return [];
};

export const assetService = {
  // ✅ GET /api/v1/assets/
  getAllAssets: async () => {
    const response = await api.get('/assets/');
    return unwrapAssets(response.data);
  },

  // ✅ GET /api/v1/assets/{id}
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return unwrapAsset(response.data);
  },

  // ✅ POST /api/v1/assets/
  createAsset: async (assetData) => {
    const response = await api.post('/assets/', assetData);
    return unwrapAsset(response.data);
  },

  // ✅ PUT /api/v1/assets/{id}
  updateAsset: async (id, assetData) => {
    const response = await api.put(`/assets/${id}`, assetData);
    return unwrapAsset(response.data);
  },

  // ✅ DELETE /api/v1/assets/{id}
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
};

export default assetService;