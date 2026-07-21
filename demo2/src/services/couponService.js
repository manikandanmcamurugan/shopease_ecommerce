import api from './api';

const couponService = {
  getCoupons: () => api.get('/coupons/'),
  createCoupon: (data) => api.post('/coupons/', data),
  getCouponDetails: (id) => api.get(`/coupons/${id}/`),
  updateCoupon: (id, data) => api.put(`/coupons/${id}/`, data),
  deleteCoupon: (id) => api.delete(`/coupons/${id}/`),
  applyCoupon: (code) => api.post('/coupons/apply/', { code })
};

export default couponService;