import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/cartService';
import { useToast } from './ToastContext';
import { flyToIcon } from '../utils/animations';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { addToast } = useToast();

  const fetchCart = async () => {
    try {
      const res = await cartService.getCart();
      const data = res.data?.cart_items || res.data?.results || res.data || [];
      let items = Array.isArray(data) ? data : [];

      // Fetch products to enrich the cart items with details (name, price, image)
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
                ...(typeof cartItem.product === 'object' ? cartItem.product : {}) // Override with any specific cart details if present
              }
            };
          }
          return {
            ...cartItem,
            product: typeof cartItem.product === 'number' ? { id: cartItem.product } : cartItem.product
          };
        });
      } catch (prodErr) {
        console.error('Failed to enrich cart with product details:', prodErr);
      }

      setCartItems(items);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (product, quantity = 1, event = null) => {
    if (event) {
      flyToIcon(event, 'nav-cart-icon');
    }
    try {
      await cartService.addToCart(product.id, quantity);
      await fetchCart();
      addToast(`${product.name || 'Item'} added to Cart!`, 'success');
    } catch (error) {
      console.error('Failed to add to cart:', error);
      addToast('Failed to add item to Cart', 'error');
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      const cartItem = cartItems.find(
        (i) => i.id === itemId || i.cart_item_id === itemId
      );
      
      // The API endpoint expects product_id, not the cart row ID
      const productId = cartItem?.product_id ?? cartItem?.product?.id ?? itemId;

      await cartService.removeFromCart(productId);
      await fetchCart();
      addToast('Item removed from Cart', 'info');
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      addToast('Failed to remove item', 'error');
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const cartItem = cartItems.find(
        (i) => i.id === itemId || i.cart_item_id === itemId
      );
      
      // The API endpoint expects product_id, not the cart row ID
      const productId = cartItem?.product_id ?? cartItem?.product?.id ?? itemId;

      await cartService.updateCart(productId, quantity);
      await fetchCart();
      addToast('Cart updated', 'success');
    } catch (error) {
      console.error('Failed to update cart:', error);
      addToast('Failed to update quantity', 'error');
    }
  };

  const clearCart = () => {
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);