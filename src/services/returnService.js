import api from './api';

const returnService = {
  getReturns: () => api.get('/returns/'),
  createReturn: (data) => api.post('/returns/', data),
  updateReturnStatus: (id, status) => api.put(`/returns/${id}/status/`, { status }),
  getReturnHistory: () => api.get('/returns/history/')
};

export default returnService;