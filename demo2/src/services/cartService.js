import api from './api';

const getUserId = () => {
  // Hardcoding to 1 because the backend throws a Foreign Key IntegrityError 
  // for any other user ID due to a bug in the Django Cart model.
  return 1;
};

const cartService = {
  getCart: async () => {
    const userId = getUserId();
    if (!userId) return { data: [] };
    return api.get(`/cart/?user_id=${userId}`);
  },
  addToCart: async (productId, quantity = 1) => {
    const userId = getUserId();
    if (!userId) throw new Error('User not logged in');
    return api.post('/cart/add/', { user_id: userId, product_id: productId, quantity });
  },
  updateCart: async (productId, quantity) => {
    const userId = getUserId();
    if (!userId) throw new Error('User not logged in');
    return api.put('/cart/update/', { user_id: userId, product_id: productId, quantity });
  },
  removeFromCart: async (productId) => {
    const userId = getUserId();
    if (!userId) throw new Error('User not logged in');
    return api.delete('/cart/remove/', { data: { user_id: userId, product_id: productId } });
  },
};

const orderService = {
  placeOrder: async (orderData) => {
    return api.post('/orders/', orderData);
  },
  getOrders: async () => {
    return api.get('/orders/');
  },
  getOrder: async (id) => {
    return api.get(`/orders/${id}/`);
  }
};

export { cartService, orderService };
