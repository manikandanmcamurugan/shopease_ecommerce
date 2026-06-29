import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Loader from '../../components/Loader/Loader';
import './Cart.css';

// Resolve price from whatever field the API returns
const getPrice = (item) =>
  item.price ??
  item.unit_price ??
  item.product?.price ??
  item.product?.unit_price ??
  0;

// Resolve name/image/category similarly
const getName     = (item) => item.name     ?? item.product?.name     ?? 'Product';
const getImage    = (item) => item.image    ?? item.product?.image    ?? '';
const getCategory = (item) => item.category ?? item.product?.category ?? '';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, loading, error } = useCart();
  const navigate = useNavigate();

  const safeTotal = Number(cartTotal ?? 0);
  if (loading) return <div className="cart-page container"><Loader /></div>;
  if (error) return <div className="container">Failed to load cart. Please try again.</div>;


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
          {cartItems.map(item => {
            const price = Number(getPrice(item));
            const qty   = item.quantity ?? 1;

            return (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={getImage(item)} alt={getName(item)} onError={(e) => { e.target.src = '/placeholder.png'; }} />
                </div>
                <div className="cart-item-info">
                  <Link to={`/products/${item.product?.id ?? item.id}`}>
<h3>{getName(item)}</h3></Link>
                  <p className="item-category">{getCategory(item)}</p>
                  <p className="item-price">₹{price.toFixed(2)}</p>
                </div>
                <div className="cart-item-quantity">
                  <button onClick={() => updateQuantity(item.id, qty - 1)} disabled={qty <= 1}><Minus size={16} /></button>
                  <span>{qty}</span>
                  <button onClick={() => updateQuantity(item.id, qty + 1)}><Plus size={16} /></button>
                </div>
                <div className="cart-item-total">
                  <p>₹{(price * qty).toFixed(2)}</p>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                  <Trash2 size={20} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{safeTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{safeTotal > 500 ? 'Free' : '₹10.00'}</span>    
                  </div>
          <div className="summary-row">
            <span>Tax (Estimated)</span>
            <span>₹{(safeTotal * 0.08).toFixed(2)}</span>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>₹{(safeTotal + (safeTotal > 100 ? 0 : 10) + safeTotal * 0.08).toFixed(2)}</span>
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