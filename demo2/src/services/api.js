import axios from 'axios';

const api = axios.create({
  baseURL: 'https://z12.7d8.mytemp.website/jrm_ecommerce_api/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// attach token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shopease_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;