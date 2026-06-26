import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from './ToastContext';
import { flyToIcon } from '../utils/animations';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    const savedWishlist = localStorage.getItem('shopease_wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('shopease_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product, event = null) => {
    if (event) {
      flyToIcon(event, 'nav-wishlist-icon');
    }
    
    // Move addToast outside of state setter to prevent Strict Mode double-firing
    if (wishlist.some(item => item.id === product.id)) return;
    
    addToast(`${product.name || 'Item'} added to Wishlist!`, 'info');
    
    setWishlist(prev => {
      if (prev.find(item => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (product) => {
    setWishlist(prev => prev.filter(item => item.id !== product.id));
    addToast(`${product.name || 'Item'} removed from Wishlist`, 'info');
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const toggleWishlist = (product, event = null) => {
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
      toggleWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
