import axios from "axios";

/**
 * ✅ Base API URL
 * Always include /api/v1 here
 */
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api/v1";

/**
 * ✅ Axios instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ✅ Request interceptor
 * Automatically attach JWT token
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ✅ Response interceptor
 * Handle 401 globally (token expired / invalid)
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized – redirecting to login");

      // Clear invalid token
      localStorage.removeItem("access_token");

      // Optional: clear any user info
      localStorage.removeItem("user");

      // Redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/**
 * ✅ Asset Services
 */
export const assetService = {
  // GET /assets/
  getAllAssets: async () => {
    const response = await api.get("/assets/");
    return response.data;
  },

  // GET /assets/{asset_id}
  getAssetById: async (assetId) => {
    const response = await api.get(`/assets/${assetId}`);
    return response.data;
  },

  // POST /assets/
  createAsset: async (assetData) => {
    const response = await api.post("/assets/", assetData);
    return response.data;
  },

  // PUT /assets/{asset_id}
  updateAsset: async (assetId, assetData) => {
    const response = await api.put(`/assets/${assetId}`, assetData);
    return response.data;
  },

  // DELETE /assets/{asset_id}
  deleteAsset: async (assetId) => {
    const response = await api.delete(`/assets/${assetId}`);
    return response.data;
  },

  // PUT /assets/{asset_id}/location
  updateAssetLocation: async (assetId, locationData) => {
    const response = await api.put(
      `/assets/${assetId}/location`,
      locationData
    );
    return response.data;
  },
};

export default api;