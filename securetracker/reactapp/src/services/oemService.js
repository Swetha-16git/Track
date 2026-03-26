
import api from './api';

export const oemService = {
  getAllOEMs: () => api.get('/api/v1/oems'),
  
  createOEM: (data) => api.post('/api/v1/oems', data),
  
  getOEM: (id) => api.get(`/api/v1/oems/${id}`),
  
  updateOEM: (id, data) => api.put(`/oems/${id}`, data),
  
  deleteOEM: (id) => api.delete(`/oems/${id}`)
};

