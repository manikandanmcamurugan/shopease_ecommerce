import api from './api';

const getUserId = () => {
  return 1; // Fallback mock for demo, api.js injects real token
};

const recentService = {
  getRecentProducts: async () => {
    // Temporarily mock this since the backend endpoint doesn't exist yet
    return { data: [] };
  },
  addRecentProduct: async (productId) => {
    // Temporarily mock this since the backend endpoint doesn't exist yet
    return { data: { success: true } };
  },
  syncGuestHistory: async (productIds) => {
    // Temporarily mock this since the backend endpoint doesn't exist yet
    return Promise.resolve();
  }
};

export default recentService;