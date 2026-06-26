import api from './api';

const cartService = {
  getCart: async (userId = 1) => {
    return api.get(`/cart/?user_id=${userId}`);
  },
  addToCart: async (productId, quantity = 1, userId = 1) => {
    return api.post('/cart/add/', { user_id: userId, product_id: productId, quantity });
  },
  updateCart: async (productId, quantity, userId = 1) => {
    return api.put('/cart/update/', { user_id: userId, product_id: productId, quantity });
  },
  removeFromCart: async (productId, userId = 1) => {
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
