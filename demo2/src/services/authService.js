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
      // Log the full backend response so we can see exactly which field failed
      console.error("Registration error:", error);
      if (error.response) {
        console.error("Registration error response data:", error.response.data);
        console.error("Registration error status:", error.response.status);
      }
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
      if (!error.response || (error.response.status !== 401 && error.response.status !== 403)) {
        console.error("Fetch profile error:", error);
      }
      throw error;
    }
  },
  updateProfile: async (userId, formData) => {
    try {
      const token = localStorage.getItem('shopease_token');
      console.log("Sending updateProfile request with fetch...");
      
      const response = await fetch('https://z12.7d8.mytemp.website/jrm_ecommerce_api/api/v1/auth/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': token && token !== 'null' && token !== 'undefined' ? `Bearer ${token}` : ''
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw { response: { data, status: response.status } };
      }
      
      return { data };
    } catch (error) {
      console.error("Update profile error:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error;
    }
  },

  forgotPassword: async (identifier) => {
    try {
      const response = await api.post('/auth/forgot-password/', { email: identifier });
      return response;
    } catch (error) {
      console.error("Forgot password error:", error);
      throw error;
    }
  },

  verifyOTP: async (identifier, otp) => {
    try {
      const response = await api.post('/auth/verify-otp/', { email: identifier, otp });
      return response;
    } catch (error) {
      console.error("Verify OTP error:", error);
      throw error;
    }
  },

  resetPassword: async (identifier, otp, newPassword) => {
    try {
      const response = await api.post('/auth/reset-password/', { email: identifier, otp, new_password: newPassword, password: newPassword });
      return response;
    } catch (error) {
      console.error("Reset password error:", error);
      throw error;
    }
  },

  changePassword: async (oldPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password/', { old_password: oldPassword, new_password: newPassword });
      return response;
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }
};

export default authService;