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
    // Safely set header depending on Axios version
    // DRF uses 'Token' by default for TokenAuthentication, not 'Bearer'
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Token ${token}`);
    } else {
      config.headers.Authorization = `Token ${token}`;
    }
  }

  return config;
});

export default api;