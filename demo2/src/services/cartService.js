import api from './api';

const cartService = {
  getCart: async () => {
    // In a real app: return api.get('/cart/');
    const localCart = localStorage.getItem('shopease_cart');
    return { data: localCart ? JSON.parse(localCart) : [] };
  },
  addToCart: async (productId, quantity) => {
    // In a real app: return api.post('/cart/add/', { product_id: productId, quantity });
    return { success: true };
  },
  removeFromCart: async (productId) => {
    // In a real app: return api.delete(`/cart/remove/${productId}/`);
    return { success: true };
  },
};

const orderService = {
  placeOrder: async (orderData) => {
    // In a real app: return api.post('/orders/', orderData);
    return { data: { id: 'ORD-' + Math.floor(Math.random() * 10000), ...orderData, status: 'Processing', date: new Date().toLocaleDateString() } };
  },
  getOrders: async () => {
    // In a real app: return api.get('/orders/');
    return {
      data: [
        { id: 'ORD-1234', date: '2023-10-25', total: 129.98, status: 'Delivered' },
        { id: 'ORD-5678', date: '2023-11-02', total: 59.99, status: 'Processing' }
      ]
    };
  }
};

export { cartService, orderService };
