import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';
import { flyToIcon } from '../utils/animations';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useToast();
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }
    try {
      const cartRes = await cartService.getCart();
      const backendItems = cartRes.data?.results || cartRes.data || [];

      // Fetch products to enrich the cart items with details
      let items = backendItems;
      try {
        const { default: productService } = await import('../services/productService');
        const prodRes = await productService.getProducts();
        const allProducts = prodRes.data;

        items = items.map((cartItem) => {
          const productId = cartItem.product_id ?? (typeof cartItem.product === 'object' ? cartItem.product?.id : cartItem.product) ?? cartItem.id;
          const productDetails = allProducts.find((p) => p.id === productId);
          
          if (productDetails) {
            return {
              ...cartItem,
              product: {
                ...productDetails,
                ...(typeof cartItem.product === 'object' ? cartItem.product : {})
              }
            };
          }
          return cartItem;
        });
      } catch (prodErr) {
        console.error('Failed to enrich cart with product details:', prodErr);
      }

      setCartItems(items);
    } catch (error) {
      console.error('Failed to fetch cart from backend:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [user]);

  const saveCartLocally = (userObj, items) => {
    if (!userObj) return;
    const userKey = userObj.id || userObj.email || userObj.username || 'guest';
    const cartToSave = items.map(item => ({
      id: item.id,
      product_id: item.product_id ?? item.product?.id ?? item.id,
      quantity: item.quantity || 1
    }));
    localStorage.setItem(`shopease_cart_${userKey}`, JSON.stringify(cartToSave));
  };

  const addToCart = async (product, quantity = 1, event = null) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginRedirect', {
        detail: {
          returnUrl: window.location.pathname,
          action: { type: 'ADD_TO_CART', payload: { product, quantity } }
        }
      }));
      return;
    }
    if (event) {
      flyToIcon(event, 'nav-cart-icon');
    }
    
    try {
      await cartService.addToCart(product.id, quantity);
      await fetchCart();
      addToast(`${product.name || 'Item'} added to Cart!`, 'success');
    } catch (e) {
      console.error("Backend add to cart failed", e);
      addToast('Failed to add item to cart', 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginRedirect', {
        detail: { returnUrl: window.location.pathname }
      }));
      return;
    }
    
    const cartItem = cartItems.find(i => i.id === itemId || i.cart_item_id === itemId || (i.product_id ?? i.product?.id) === itemId);
    // Use the cart item ID (i.id) if the backend returns one, otherwise fallback to item ID logic
    const cartItemId = cartItem?.cart_item_id ?? cartItem?.id ?? itemId;

    try {
      await cartService.removeFromCart(cartItemId);
      await fetchCart();
      addToast('Item removed from Cart', 'info');
    } catch (e) {
      console.error("Backend remove from cart failed", e);
      addToast('Failed to remove item', 'error');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginRedirect', {
        detail: { returnUrl: window.location.pathname }
      }));
      return;
    }
    if (quantity < 1) return;
    
    const cartItem = cartItems.find(i => i.id === itemId || i.cart_item_id === itemId || (i.product_id ?? i.product?.id) === itemId);
    const cartItemId = cartItem?.cart_item_id ?? cartItem?.id ?? itemId;

    try {
      // Optimistically update the UI so it doesn't feel sluggish
      setCartItems(prev => prev.map(i => i.id === cartItem?.id ? { ...i, quantity } : i));
      
      await cartService.updateCart(cartItemId, quantity);
      await fetchCart(); // Ensure it's in sync with backend
      addToast('Cart updated', 'success');
    } catch (e) {
      console.error("Backend update cart failed", e);
      addToast('Failed to update quantity', 'error');
      fetchCart(); // Revert to backend state
    }
  };

  const clearCart = async () => {
    // There usually isn't a "clear cart" API natively in RESTful carts unless specified, 
    // but typically we can just delete each item or let the order completion clear it.
    // For now we clear frontend state.
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.price ?? item.unit_price ?? item.product?.price ?? item.product?.unit_price ?? 0;
    const qty = item.quantity ?? 1;
    return total + price * qty;
  }, 0);

  const cartCount = cartItems.length;

  const isInCart = (productId) => {
    return cartItems.some((item) => {
      const currentId = item.product_id ?? item.product?.id ?? item.id;
      return currentId === productId;
    });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isInCart,
        loading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);