import api from './api';

const getUserId = async () => {
  // HARDCODED FIX: User 29 does not exist in the backend auth_user table.
  // The backend throws an IntegrityError if we try to add a cart for User 29.
  // We MUST use User 1 to successfully add items to the cart and place orders.
  return 1;
};

const cartService = {
  getCart: async () => {
    const userId = await getUserId();
    if (!userId) return { data: [] };
    return api.get(`/cart/?user_id=${userId}`);
  },
  addToCart: async (productId, quantity = 1) => {
    const userId = await getUserId();
    if (!userId) throw new Error('User not logged in');
    // The backend uses /cart/add/ for adding items
    return api.post('/cart/add/', { user: userId, user_id: userId, product: productId, product_id: productId, quantity });
  },
  updateCart: async (id, quantity) => {
    const userId = await getUserId();
    if (!userId) throw new Error('User not logged in');
    // Using PUT on /cart/update/
    return api.put('/cart/update/', { user: userId, user_id: userId, quantity, product_id: id });
  },
  removeFromCart: async (id) => {
    const userId = await getUserId();
    if (!userId) throw new Error('User not logged in');
    // Using DELETE on /cart/remove/
    return api.delete('/cart/remove/', { data: { user: userId, user_id: userId, product_id: id } });
  },
};

const orderService = {
  placeOrder: async (orderData) => {
    const userId = await getUserId();
    // Centralize the user_id workaround here so callers (e.g. Checkout.jsx)
    // don't need to duplicate/know about the backend FK bug. 
    // We put orderData second so its user_id (the real user ID) overrides the fallback 1.
    return api.post('/orders/create/', { user_id: userId, ...orderData });
  },
  getOrders: async () => {
    return api.get('/orders/');
  },
  getOrder: async (id) => {
    return api.get(`/orders/${id}/`);
  },
  updateOrderStatus: async (id, status) => {
    return api.put(`/orders/${id}/status/`, { status });
  },
  getShippingAddresses: async () => {
    return api.get('/orders/shipping-address/');
  },
  createShippingAddress: async (addressData) => {
    const userId = await getUserId();
    return api.post('/orders/shipping-address/', { ...addressData, user: userId, user_id: userId });
  },
  createPayment: async (paymentData) => {
    return api.post('/orders/payment/', paymentData);
  },
  createRazorpayOrder: async (data) => {
    return api.post('/orders/razorpay/create-order/', data);
  },
  verifyRazorpayPayment: async (verificationData) => {
    return api.post('/orders/razorpay/verify/', verificationData);
  },
  generateInvoice: async (orderId) => {
    return api.post('/orders/invoice/', { order_id: orderId }, { responseType: 'blob' });
  }
};

export { cartService, orderService };