import api from "./api";

const assetService = {
  // ✅ GET /api/v1/assets/
  getAllAssets: async () => {
    const { data } = await api.get("/assets/");
    return data;
  },

  // ✅ GET /api/v1/assets/{asset_id}
  getAssetById: async (assetId) => {
    const { data } = await api.get(`/assets/${assetId}`);
    return data;
  },

  // ✅ POST /api/v1/assets/
  createAsset: async (assetData) => {
    const { data } = await api.post("/assets/", assetData);
    return data;
  },

  // ✅ PUT /api/v1/assets/{asset_id}
  updateAsset: async (assetId, assetData) => {
    const { data } = await api.put(`/assets/${assetId}`, assetData);
    return data;
  },

  // ✅ DELETE /api/v1/assets/{asset_id}
  deleteAsset: async (assetId) => {
    const { data } = await api.delete(`/assets/${assetId}`);
    return data;
  },

  // ✅ PUT /api/v1/assets/{asset_id}/location
  updateAssetLocation: async (assetId, locationData) => {
    const { data } = await api.put(`/assets/${assetId}/location`, locationData);
    return data;
  },
};

export default assetService;