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

// Tracking Services
export const trackingService = {
  // Get all tracking data for organization's assets
  getAllTrackingData: async () => {
    const response = await api.get('/tracking');
    return response.data;
  },

  // Get tracking data for specific asset
  getAssetTracking: async (assetId) => {
    const response = await api.get(`/tracking/asset/${assetId}`);
    return response.data;
  },

  // Get real-time location of asset
  getAssetLocation: async (assetId) => {
    const response = await api.get(`/tracking/asset/${assetId}/location`);
    return response.data;
  },

  // Get tracking history for asset
  getTrackingHistory: async (assetId, startDate, endDate) => {
    const response = await api.get(`/tracking/asset/${assetId}/history`, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },

  // Get all asset locations (for live map)
  getAllAssetLocations: async () => {
    const response = await api.get('/tracking/locations');
    return response.data;
  },

  // Update asset location (simulated for demo)
  updateLocation: async (assetId, locationData) => {
    const response = await api.post(`/tracking/asset/${assetId}/update`, locationData);
    return response.data;
  },

  // Get tracking alerts
  getAlerts: async () => {
    const response = await api.get('/tracking/alerts');
    return response.data;
  },

  // Subscribe to real-time tracking updates (WebSocket)
  subscribeToUpdates: (assetId, callback) => {
    // This would typically connect to a WebSocket
    // For demo, we'll use polling
    const interval = setInterval(async () => {
      try {
        const data = await trackingService.getAssetLocation(assetId);
        callback(data);
      } catch (error) {
        console.error('Error fetching tracking update:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  },
};

export default trackingService;

