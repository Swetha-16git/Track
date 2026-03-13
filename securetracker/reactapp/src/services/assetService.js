import axios from 'axios';

// React (CRA) env var: REACT_APP_API_URL=http://localhost:8000/api
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // must match what your login stores
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const unwrapAsset = (data) => {
  // backend may return {success:true, asset:{...}} or {asset:{...}} or direct asset
  if (!data) return null;
  if (data.asset) return data.asset;
  if (data.data?.asset) return data.data.asset;
  return data;
};

const unwrapAssets = (data) => {
  // Your backend GET /api/assets/ returns: {success:true, assets:[...]}
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.assets)) return data.assets;
  if (Array.isArray(data.data?.assets)) return data.data.assets;
  return [];
};

export const assetService = {
  // ✅ Get all assets for current user's organisation
  getAllAssets: async () => {
    const response = await api.get('/assets/'); // trailing slash matches your router @get("/")
    return unwrapAssets(response.data);
  },

  // ✅ Get asset by numeric DB id (your router uses asset_id:int in path)
  getAssetById: async (id) => {
    const response = await api.get(`/assets/${id}`);
    return unwrapAsset(response.data);
  },

  // ✅ Create asset
  createAsset: async (assetData) => {
    const response = await api.post('/assets/', assetData);
    return unwrapAsset(response.data);
  },

  // ✅ Update asset (id must be numeric DB id)
  updateAsset: async (id, assetData) => {
    const response = await api.put(`/assets/${id}`, assetData);
    return unwrapAsset(response.data);
  },

  // ✅ Delete asset (id must be numeric DB id)
  deleteAsset: async (id) => {
    const response = await api.delete(`/assets/${id}`);
    return response.data;
  },
};

export default assetService;

// import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Add token to requests
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Asset Services
// export const assetService = {
//   // Get all assets for user's organization
//   getAllAssets: async () => {
//     const response = await api.get('/assets');
//     return response.data;
//   },

//   // Get asset by ID
//   getAssetById: async (assetId) => {
//     const response = await api.get(`/assets/${assetId}`);
//     return response.data;
//   },

//   // Create new asset (onboarding)
//   createAsset: async (assetData) => {
//     const response = await api.post('/assets', assetData);
//     return response.data;
//   },

//   // Update asset
//   updateAsset: async (assetId, assetData) => {
//     const response = await api.put(`/assets/${assetId}`, assetData);
//     return response.data;
//   },

//   // Delete asset
//   deleteAsset: async (assetId) => {
//     const response = await api.delete(`/assets/${assetId}`);
//     return response.data;
//   },

//   // Get assets by organization
//   getAssetsByOrganization: async (orgId) => {
//     const response = await api.get(`/organizations/${orgId}/assets`);
//     return response.data;
//   },

//   // Search assets
//   searchAssets: async (query) => {
//     const response = await api.get('/assets/search', { params: { q: query } });
//     return response.data;
//   },

//   // Get asset types
//   getAssetTypes: async () => {
//     const response = await api.get('/assets/types');
//     return response.data;
//   },
// };

// export default assetService;

