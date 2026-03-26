import api from './api';

const API_BASE = '/asset-types';

export const assetTypeService = {
  async getAssetTypes() {
    try {
      const response = await api.get(API_BASE);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch asset types:', error);
      throw error;
    }
  },

  async createAssetType(assetTypeData) {
    try {
      const response = await api.post(API_BASE, assetTypeData);
      return response.data;
    } catch (error) {
      console.error('Failed to create asset type:', error);
      throw error;
    }
  },

  async updateAssetType(assetTypeKey, assetTypeData) {
    try {
      const response = await api.put(`${API_BASE}/${assetTypeKey}`, assetTypeData);
      return response.data;
    } catch (error) {
      console.error('Failed to update asset type:', error);
      throw error;
    }
  },

  async deleteAssetType(assetTypeKey) {
    try {
      const response = await api.delete(`${API_BASE}/${assetTypeKey}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete asset type:', error);
      throw error;
    }
  }
};

