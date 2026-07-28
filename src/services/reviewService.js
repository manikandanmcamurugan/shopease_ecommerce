import api from './api';

const getUserId = () => {
  // Hardcoded workaround for consistency with cart/wishlist
  return 1;
};

const reviewService = {
  getReviews: async (productId) => {
    // Temporarily mock this since the backend endpoint doesn't exist yet
    return { data: [] };
  },
  createReview: async (reviewData) => {
    // Temporarily mock this since the backend endpoint doesn't exist yet
    return { data: { success: true } };
  }
};

export default reviewService;
