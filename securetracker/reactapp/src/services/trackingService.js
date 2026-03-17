import api from "./api";

const trackingService = {
  // GET /api/v1/tracking/locations
  getAllLatestLocations: async () => {
    const { data } = await api.get("/tracking/locations");
    return data;
  },

  // GET /api/v1/tracking/asset/{asset_id}
  getHistory: async (assetId, params = {}) => {
    const { data } = await api.get(`/tracking/asset/${assetId}`, { params });
    return data;
  },

  // GET /api/v1/tracking/asset/{asset_id}/latest
  getLatest: async (assetId) => {
    const { data } = await api.get(`/tracking/asset/${assetId}/latest`);
    return data;
  },

  // POST /api/v1/tracking/record
  createRecord: async (payload) => {
    const { data } = await api.post("/tracking/record", payload);
    return data;
  },
};

export default trackingService;