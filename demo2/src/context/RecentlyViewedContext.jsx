import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import recentService from '../services/recentService';
import productService from '../services/productService'; // Need this if backend returns IDs only, but assume it returns products

const RecentlyViewedContext = createContext();

export const RecentlyViewedProvider = ({ children }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const { user } = useAuth();

  const LOCAL_STORAGE_KEY = 'shopease_recently_viewed';

  const fetchRecentlyViewed = async () => {
    if (user) {
      try {
        const response = await recentService.getRecentProducts();
        let items = response.data.results || response.data || [];
        // Ensure we extract product if it is nested
        items = items.map(item => item.product ? item.product : item);
        setRecentlyViewed(items.slice(0, 10));
      } catch (error) {
        console.error('Failed to fetch recently viewed from API:', error);
      }
    } else {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        setRecentlyViewed(JSON.parse(stored));
      }
    }
  };

  useEffect(() => {
    if (user) {
      syncGuestHistory();
    } else {
      fetchRecentlyViewed();
    }
  }, [user]);

  const addRecentlyViewed = async (product) => {
    if (!product || !product.id) return;
    
    // Optimistically update local state
    setRecentlyViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      const updated = [product, ...filtered].slice(0, 10);
      
      if (!user) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    if (user) {
      try {
        await recentService.addRecentProduct(product.id);
      } catch (e) {
        console.error('Failed to record recently viewed product', e);
      }
    }
  };

  const syncGuestHistory = async () => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const items = JSON.parse(stored);
      const ids = items.map(p => p.id);
      try {
        await recentService.syncGuestHistory(ids);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        fetchRecentlyViewed(); // Refresh to get unified list
      } catch (e) {
        console.error('Failed to sync guest recently viewed history', e);
      }
    }
  };

  return (
    <RecentlyViewedContext.Provider value={{ recentlyViewed, addRecentlyViewed, syncGuestHistory }}>
      {children}
    </RecentlyViewedContext.Provider>
  );
};

export const useRecentlyViewed = () => useContext(RecentlyViewedContext);