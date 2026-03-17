import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
 const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Asset Services
export const assetService = {
  // ✅ Get all assets
  // GET /api/v1/assets/
  getAllAssets: async () => {
    const response = await api.get("/api/v1/assets/");
    return response.data;
  },

  // ✅ Get asset by ID
  // GET /api/v1/assets/{asset_id}
  getAssetById: async (assetId) => {
    const response = await api.get(`/api/v1/assets/${assetId}`);
    return response.data;
  },

  // ✅ Create new asset (onboarding)
  // POST /api/v1/assets/
  createAsset: async (assetData) => {
    const response = await api.post("/api/v1/assets/", assetData);
    return response.data;
  },

  // ✅ Update asset
  // PUT /api/v1/assets/{asset_id}
  updateAsset: async (assetId, assetData) => {
    const response = await api.put(`/api/v1/assets/${assetId}`, assetData);
    return response.data;
  },

  // ✅ Delete asset
  // DELETE /api/v1/assets/{asset_id}
  deleteAsset: async (assetId) => {
    const response = await api.delete(`/api/v1/assets/${assetId}`);
    return response.data;
  },

  // ✅ Update asset location (if your backend supports this endpoint)
  // PUT /api/v1/assets/{asset_id}/location
  updateAssetLocation: async (assetId, locationData) => {
    const response = await api.put(`/api/v1/assets/${assetId}/location`, locationData);
    return response.data;
  },
};

export default assetService;