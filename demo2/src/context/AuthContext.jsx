import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('shopease_user');
        if (storedUser && storedUser !== "undefined") {
          setUser(JSON.parse(storedUser));
        }
        
        const token = localStorage.getItem('shopease_token');
        if (token) {
          const profileRes = await authService.getProfile();
          if (profileRes?.data) {
            setUser(profileRes.data);
            localStorage.setItem('shopease_user', JSON.stringify(profileRes.data));
          }
        }
      } catch (err) {
        console.error("Failed to initialize auth:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('shopease_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('shopease_user');
    localStorage.removeItem('shopease_token');
  };

  const register = (userData) => {
    // For demo purposes, we'll just log them in
    login(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
