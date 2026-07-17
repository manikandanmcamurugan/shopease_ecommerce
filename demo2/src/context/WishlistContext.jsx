import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { flyToIcon } from '../utils/animations';
import wishlistService from '../services/wishlistService';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        setLoading(true);
        try {
          // Fetch from backend
          const response = await wishlistService.getWishlist();
          let items = response.data.results || response.data || [];
          
          // Optionally populate from local storage as fallback/cache if backend is empty
          if (items.length === 0) {
            const userKey = user.id || user.email || user.username || 'guest';
            const savedWishlist = localStorage.getItem(`shopease_wishlist_${userKey}`);
            if (savedWishlist) {
              items = JSON.parse(savedWishlist);
            }
          }
          setWishlist(items);
        } catch (e) {
          console.error("Failed to fetch wishlist from backend:", e);
          const userKey = user.id || user.email || user.username || 'guest';
          const savedWishlist = localStorage.getItem(`shopease_wishlist_${userKey}`);
          setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
        } finally {
          setLoading(false);
        }
      } else {
        setWishlist([]);
      }
    };
    fetchWishlist();
  }, [user]);

  const saveWishlistLocally = (userObj, items) => {
    if (!userObj) return;
    const userKey = userObj.id || userObj.email || userObj.username || 'guest';
    localStorage.setItem(`shopease_wishlist_${userKey}`, JSON.stringify(items));
  };

  const addToWishlist = (product, event = null) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginRedirect', {
        detail: {
          returnUrl: window.location.pathname,
          action: { type: 'ADD_TO_WISHLIST', payload: { product } }
        }
      }));
      return;
    }
    if (event) {
      flyToIcon(event, 'nav-wishlist-icon');
    }
    
    if (wishlist.some(item => item.id === product.id)) return;
    
    addToast(`${product.name || 'Item'} added to Wishlist!`, 'info');
    
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      const newItems = [...prev, product];
      saveWishlistLocally(user, newItems);
      return newItems;
    });
    
    wishlistService.addToWishlist(product.id).catch(e => console.error("Backend wishlist add failed", e));
  };

  const removeFromWishlist = (productOrId) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginRedirect', {
        detail: {
          returnUrl: window.location.pathname
        }
      }));
      return;
    }
    const id = typeof productOrId === 'object' ? productOrId.id : productOrId;
    const name = typeof productOrId === 'object' ? productOrId.name || 'Item' : 'Item';
    
    setWishlist(prev => {
      const newItems = prev.filter(item => item.id !== id);
      saveWishlistLocally(user, newItems);
      return newItems;
    });
    
    addToast(`${name} removed from Wishlist`, 'info');
    wishlistService.removeFromWishlist(id).catch(e => console.error("Backend wishlist remove failed", e));
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleWishlist = (product, event = null) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginRedirect', {
        detail: {
          returnUrl: window.location.pathname,
          action: { type: 'ADD_TO_WISHLIST', payload: { product } }
        }
      }));
      return;
    }
    if (isInWishlist(product.id)) {
      removeFromWishlist(product);
    } else {
      addToWishlist(product, event);
    }
  };

  return (
    <WishlistContext.Provider value={{ 
      wishlist, 
      addToWishlist, 
      removeFromWishlist, 
      isInWishlist,
      toggleWishlist,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
