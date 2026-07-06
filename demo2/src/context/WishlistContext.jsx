import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { flyToIcon } from '../utils/animations';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      try {
        const userKey = user.id || user.email || user.username || 'guest';
        const savedWishlist = localStorage.getItem(`shopease_wishlist_${userKey}`);
        setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
      } catch (e) {
        setWishlist([]);
      }
    } else {
      setWishlist([]);
    }
  }, [user]);

  const saveWishlistLocally = (userObj, items) => {
    if (!userObj) return;
    const userKey = userObj.id || userObj.email || userObj.username || 'guest';
    localStorage.setItem(`shopease_wishlist_${userKey}`, JSON.stringify(items));
  };

  const addToWishlist = (product, event = null) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginPrompt'));
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
  };

  const removeFromWishlist = (productOrId) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginPrompt'));
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
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleWishlist = (product, event = null) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginPrompt'));
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
