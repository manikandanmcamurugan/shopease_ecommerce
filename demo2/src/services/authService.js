import api from './api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login/', { email, password });
      return response;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register/', userData);
      return response;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },
  getProfile: async () => {
    try {
      const response = await api.get('/users/1');
      return {
        data: response.data
      };
    } catch (error) {
      console.error("Fetch profile error:", error);
      throw error;
    }
  }
};

export default authService;
