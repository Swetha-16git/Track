import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Asset Services
export const assetService = {
  // Get all assets for user's organization
  getAllAssets: async () => {
    const response = await api.get('/assets');
    return response.data;
  },

  // Get asset by ID
  getAssetById: async (assetId) => {
    const response = await api.get(`/assets/${assetId}`);
    return response.data;
  },

  // Create new asset (onboarding)
  createAsset: async (assetData) => {
    const response = await api.post('/assets', assetData);
    return response.data;
  },

  // Update asset
  updateAsset: async (assetId, assetData) => {
    const response = await api.put(`/assets/${assetId}`, assetData);
    return response.data;
  },

  // Delete asset
  deleteAsset: async (assetId) => {
    const response = await api.delete(`/assets/${assetId}`);
    return response.data;
  },

  // Get assets by organization
  getAssetsByOrganization: async (orgId) => {
    const response = await api.get(`/organizations/${orgId}/assets`);
    return response.data;
  },

  // Search assets
  searchAssets: async (query) => {
    const response = await api.get('/assets/search', { params: { q: query } });
    return response.data;
  },

  // Get asset types
  getAssetTypes: async () => {
    const response = await api.get('/assets/types');
    return response.data;
  },
};

export default assetService;

