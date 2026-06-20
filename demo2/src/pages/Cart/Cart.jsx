import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-empty container">
        <ShoppingBag size={80} color="#e2e8f0" />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1>Shopping Cart</h1>
      
      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="cart-item-info">
                <Link to={`/products/${item.id}`}><h3>{item.name}</h3></Link>
                <p className="item-category">{item.category}</p>
                <p className="item-price">₹{item.price.toFixed(2)}</p>
              </div>
              <div className="cart-item-quantity">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}><Minus size={16} /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}><Plus size={16} /></button>
              </div>
              <div className="cart-item-total">
                <p>₹{(item.price * item.quantity).toFixed(2)}</p>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{cartTotal > 100 ? 'Free' : '₹10.00'}</span>
          </div>
          <div className="summary-row">
            <span>Tax (Estimated)</span>
            <span>₹{(cartTotal * 0.08).toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{(cartTotal + (cartTotal > 100 ? 0 : 10) + (cartTotal * 0.08)).toFixed(2)}</span>
          </div>
          <button className="btn btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout <ArrowRight size={20} />
          </button>
          <Link to="/products" className="continue-shopping">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
