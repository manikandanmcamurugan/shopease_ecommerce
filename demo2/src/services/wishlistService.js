import api from './api';

const getUserId = () => {
  // Same logic as cart for consistency, if needed
  return 1;
};

const wishlistService = {
  getWishlist: async () => {
    const userId = getUserId();
    if (!userId) return { data: [] };
    // GET /api/v1/wishlist/
    return api.get(`/wishlist/?user_id=${userId}`);
  },
  addToWishlist: async (productId) => {
    const userId = getUserId();
    if (!userId) throw new Error('User not logged in');
    // POST /api/v1/wishlist/
    return api.post('/wishlist/', { user_id: userId, product_id: productId });
  },
  removeFromWishlist: async (id) => {
    const userId = getUserId();
    if (!userId) throw new Error('User not logged in');
    // DELETE /api/v1/wishlist/<id>/
    return api.delete(`/wishlist/${id}/`, { data: { user_id: userId, product_id: id } });
  }
};

export default wishlistService;
