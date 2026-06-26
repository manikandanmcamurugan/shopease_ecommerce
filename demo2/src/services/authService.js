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
      const response = await api.get('/auth/profile/');
      return {
        data: response.data
      };
    } catch (error) {
      console.error("Fetch profile error:", error);
      throw error;
    }
  },
  updateProfile: async (userId, formData) => {
    try {
      // Allow axios to automatically set the multipart/form-data content type and the boundary
      const response = await api.put(`/auth/profile/`, formData);
      return response;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }
};

export default authService;
