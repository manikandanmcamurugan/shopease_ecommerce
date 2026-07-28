import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

const AuthActionExecutor = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  const executed = useRef(false);

  // Handle redirects from outside the Router (e.g., Context Providers)
  useEffect(() => {
    const handleLoginRedirect = (e) => {
      const { returnUrl, action } = e.detail;
      sessionStorage.setItem('returnUrl', returnUrl || location.pathname);
      if (action) {
        sessionStorage.setItem('pendingAuthAction', JSON.stringify(action));
      }
      navigate('/login');
    };

    window.addEventListener('triggerLoginRedirect', handleLoginRedirect);
    return () => window.removeEventListener('triggerLoginRedirect', handleLoginRedirect);
  }, [navigate, location.pathname]);

  // Execute pending actions on successful login
  useEffect(() => {
    if (user && !executed.current) {
      const pendingAction = sessionStorage.getItem('pendingAuthAction');
      if (pendingAction) {
        try {
          const action = JSON.parse(pendingAction);
          // Execute action based on type
          if (action.type === 'ADD_TO_CART') {
            addToCart(action.payload.product, action.payload.quantity);
          } else if (action.type === 'ADD_TO_WISHLIST') {
            addToWishlist(action.payload.product);
          } else if (action.type === 'BUY_NOW') {
            // Add to cart and redirect to checkout
            addToCart(action.payload.product, action.payload.quantity);
            navigate('/checkout');
          }
          
          // Clear action after execution
          sessionStorage.removeItem('pendingAuthAction');
          executed.current = true;
        } catch (error) {
          console.error("Failed to parse or execute pending auth action:", error);
          sessionStorage.removeItem('pendingAuthAction');
        }
      }
    }
  }, [user, addToCart, addToWishlist, navigate]);

  return null;
};

export default AuthActionExecutor;
