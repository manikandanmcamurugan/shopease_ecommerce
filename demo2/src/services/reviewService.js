import api from './api';

const getUserId = () => {
  // Hardcoded workaround for consistency with cart/wishlist
  return 1;
};

const reviewService = {
  getReviews: async (productId) => {
    // GET /api/v1/reviews/?product_id=<id> (if the backend uses query params to filter by product)
    // Or just GET /api/v1/reviews/
    const params = productId ? { product_id: productId } : {};
    return api.get('/reviews/', { params });
  },
  createReview: async (reviewData) => {
    const userId = getUserId();
    if (!userId) throw new Error('User not logged in');
    // POST /api/v1/reviews/
    return api.post('/reviews/', { ...reviewData, user_id: userId });
  }
};

export default reviewService;
