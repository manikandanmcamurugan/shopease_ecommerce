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
      const userKey = user.id || user.email || user.username || 'guest';
      const savedCart = localStorage.getItem(`shopease_cart_${userKey}`);
      let items = savedCart ? JSON.parse(savedCart) : [];

      // Fetch products to enrich the cart items with details
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
      console.error('Failed to fetch cart locally:', error);
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
      window.dispatchEvent(new CustomEvent('triggerLoginPrompt'));
      return;
    }
    if (event) {
      flyToIcon(event, 'nav-cart-icon');
    }
    
    setCartItems(prev => {
      let newItems;
      const existing = prev.find(item => (item.product_id ?? item.product?.id ?? item.id) === product.id);
      if (existing) {
        newItems = prev.map(item => 
          (item.product_id ?? item.product?.id ?? item.id) === product.id 
            ? { ...item, quantity: (item.quantity || 1) + quantity } 
            : item
        );
      } else {
        newItems = [...prev, { id: Date.now(), product_id: product.id, product, quantity }];
      }
      saveCartLocally(user, newItems);
      return newItems;
    });
    
    addToast(`${product.name || 'Item'} added to Cart!`, 'success');
    cartService.addToCart(product.id, quantity).catch(e => console.error("Backend tracking failed", e));
  };

  const removeFromCart = async (itemId) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginPrompt'));
      return;
    }
    
    const cartItem = cartItems.find(i => i.id === itemId || i.cart_item_id === itemId || (i.product_id ?? i.product?.id) === itemId);
    const productId = cartItem?.product_id ?? cartItem?.product?.id ?? itemId;

    setCartItems(prev => {
      const newItems = prev.filter(i => 
        i.id !== itemId && i.cart_item_id !== itemId && (i.product_id ?? i.product?.id) !== itemId
      );
      saveCartLocally(user, newItems);
      return newItems;
    });
    
    addToast('Item removed from Cart', 'info');
    cartService.removeFromCart(productId).catch(e => console.error("Backend tracking failed", e));
  };

  const updateQuantity = async (itemId, quantity) => {
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginPrompt'));
      return;
    }
    if (quantity < 1) return;
    
    const cartItem = cartItems.find(i => i.id === itemId || i.cart_item_id === itemId || (i.product_id ?? i.product?.id) === itemId);
    const productId = cartItem?.product_id ?? cartItem?.product?.id ?? itemId;

    setCartItems(prev => {
      const newItems = prev.map(i => {
        if (i.id === itemId || i.cart_item_id === itemId || (i.product_id ?? i.product?.id) === itemId) {
          return { ...i, quantity };
        }
        return i;
      });
      saveCartLocally(user, newItems);
      return newItems;
    });
    
    addToast('Cart updated', 'success');
    cartService.updateCart(productId, quantity).catch(e => console.error("Backend tracking failed", e));
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) {
      saveCartLocally(user, []);
    }
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