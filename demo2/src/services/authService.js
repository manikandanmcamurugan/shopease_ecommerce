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
      if (!error.response || (error.response.status !== 401 && error.response.status !== 403)) {
        console.error("Fetch profile error:", error);
      }
      throw error;
    }
  },
  updateProfile: async (userId, formData) => {
    try {
      // Allow axios and the browser to automatically set the multipart/form-data content type and the boundary
      // by explicitly removing the default Content-Type header
      const response = await api.put(`/auth/profile/`, formData, {
        headers: {
          'Content-Type': undefined
        }
      });
      return response;
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },
  
  // Mocked Endpoints for Password Recovery
  forgotPassword: async (identifier) => {
    // Simulate API call to send OTP
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { message: "OTP sent successfully" } });
      }, 1000);
    });
  },
  
  verifyOTP: async (identifier, otp) => {
    // Simulate API call to verify OTP
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456') { // Mock valid OTP
          resolve({ data: { message: "OTP verified successfully" } });
        } else {
          reject(new Error("Invalid OTP"));
        }
      }, 1000);
    });
  },
  
  resetPassword: async (identifier, otp, newPassword) => {
    // Simulate API call to reset password
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (otp === '123456' && newPassword) {
          resolve({ data: { message: "Password reset successfully" } });
        } else {
          reject(new Error("Failed to reset password"));
        }
      }, 1000);
    });
  }
};

export default authService;
