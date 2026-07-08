import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, CheckCircle, ChevronDown, Banknote, Smartphone, Gift, Calendar, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/cartService';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const location = useLocation();
  
  // If the user came from "Buy Now", we use the specific item passed in state
  const buyNowItems = location.state?.buyNowItems;
  const checkoutItems = buyNowItems || cartItems;
  
  // Recalculate total if we are using isolated buyNowItems
  const checkoutTotal = buyNowItems 
    ? buyNowItems.reduce((acc, item) => acc + (Number(item.price ?? item.unit_price ?? item.product_price ?? 0) * (item.quantity ?? 1)), 0)
    : cartTotal;

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cardName: '', cardNumber: '', expiry: '', cvc: ''
  });
  const [selectedPayment, setSelectedPayment] = useState('card');
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addressData, setAddressData] = useState({
    firstName: '', lastName: '', phone: '', email: '', address: '', city: '', zip: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('shopease_addresses')) || [];
    setAddresses(saved);
    if (saved.length > 0) {
      const defaultAddr = saved.find(a => a.isDefault) || saved[0];
      setSelectedAddressId(defaultAddr.id);
    } else {
      setShowAddressForm(true);
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    let updatedAddresses = [];
    if (editingId) {
      updatedAddresses = addresses.map(a => a.id === editingId ? { ...a, ...addressData } : a);
    } else {
      const isFirst = addresses.length === 0;
      updatedAddresses = [...addresses, { ...addressData, id: Date.now().toString(), isDefault: isFirst }];
    }
    
    setAddresses(updatedAddresses);
    localStorage.setItem('shopease_addresses', JSON.stringify(updatedAddresses));
    
    if (!editingId && addresses.length === 0) {
      setSelectedAddressId(updatedAddresses[0].id);
    }
    
    setEditingId(null);
    setShowAddressForm(false);
  };

  const handleEditAddress = (addr) => {
    setAddressData({
      firstName: addr.firstName || '', lastName: addr.lastName || '',
      phone: addr.phone || '', email: addr.email || '',
      address: addr.address || '', city: addr.city || '', zip: addr.zip || ''
    });
    setEditingId(addr.id);
    setShowAddressForm(true);
  };

  const handleMakeDefault = (id) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    localStorage.setItem('shopease_addresses', JSON.stringify(updated));
  };

  const proceedToPayment = () => {
    if (selectedAddressId) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    
    try {
      const orderData = {
        user_id: user?.id || 1,
        email: user?.email || addressData.email || 'guest@example.com',
        shipping_name: addressData.firstName ? `${addressData.firstName} ${addressData.lastName}` : (user?.name || 'Guest'),
        total_amount: checkoutTotal * 1.1,
        status: 'Processing',
        payment_method: selectedPayment,
        shipping_address: addresses.find(a => a.id === selectedAddressId) || addressData,
        items: checkoutItems.map(item => ({
          product_id: item.id || item.product?.id || 1,
          product_name: item.name || item.product?.name || 'Product',
          image: item.image || item.product?.image || '',
          quantity: item.quantity || 1,
          price: item.price || item.unit_price || item.product?.price || 0
        }))
      };
      
      await orderService.placeOrder(orderData);
      
      // Only proceed to success step if the API call succeeds
      setStep(3); // Success step
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        clearCart();
        navigate('/orders');
      }, 5000);
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order: ' + (err.response?.data?.message || err.response?.data?.detail || err.message || 'Unknown error'));
      setLoading(false); // Make sure to stop loading if you have a loading state
    }
  };

  if (checkoutItems.length === 0 && step !== 3) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page container">
      <div className="checkout-steps-modern">
        <div className={`modern-step ${step >= 1 ? 'active' : ''}`}>
          <div className="step-circle-wrap">
            <div className="step-circle">01</div>
          </div>
          <div className="step-content">
            <h4>Shipping</h4>
            <p>Enter your shipping address</p>
          </div>
        </div>
        <div className="step-connector"></div>
        <div className={`modern-step ${step >= 2 ? 'active' : ''}`}>
          <div className="step-circle-wrap">
            <div className="step-circle">02</div>
          </div>
          <div className="step-content">
            <h4>Payment</h4>
            <p>Select payment method</p>
          </div>
        </div>
        <div className="step-connector"></div>
        <div className={`modern-step ${step >= 3 ? 'active' : ''}`}>
          <div className="step-circle-wrap">
            <div className="step-circle">03</div>
          </div>
          <div className="step-content">
            <h4>Completion</h4>
            <p>Order successful</p>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="checkout-layout">
          <div className="checkout-form-container">
            <h2>Shipping Address</h2>
            {showAddressForm ? (
              <form onSubmit={handleSaveAddress} className="order-form fade-in">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="firstName" value={addressData.firstName} className="form-control" onChange={handleAddressChange} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="lastName" value={addressData.lastName} className="form-control" onChange={handleAddressChange} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input type="tel" name="phone" value={addressData.phone} className="form-control" onChange={handleAddressChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={addressData.email} className="form-control" onChange={handleAddressChange} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Full Address</label>
                  <input type="text" name="address" value={addressData.address} className="form-control" onChange={handleAddressChange} required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City</label>
                    <input type="text" name="city" value={addressData.city} className="form-control" onChange={handleAddressChange} required />
                  </div>
                  <div className="form-group">
                    <label>ZIP / Pincode</label>
                    <input type="text" name="zip" value={addressData.zip} className="form-control" onChange={handleAddressChange} required />
                  </div>
                </div>
                <div className="form-actions">
                  {addresses.length > 0 && (
                    <button type="button" className="btn btn-outline" onClick={() => {setShowAddressForm(false); setEditingId(null);}}>Cancel</button>
                  )}
                  <button type="submit" className="btn btn-primary">{editingId ? 'Update Address' : 'Save & Continue'}</button>
                </div>
              </form>
            ) : (
              <div className="address-book fade-in">
                {addresses.map(addr => (
                  <div className={`address-card ${selectedAddressId === addr.id ? 'selected' : ''}`} key={addr.id}>
                    <div className="card-selector">
                      <input 
                        type="radio" 
                        name="addressSelection"
                        checked={selectedAddressId === addr.id} 
                        onChange={() => setSelectedAddressId(addr.id)} 
                      />
                    </div>
                    <div className="card-content">
                      <div className="address-card-header">
                        <strong>{addr.firstName} {addr.lastName}</strong>
                        {addr.isDefault && <span className="default-badge">Default</span>}
                      </div>
                      <p>{addr.address}</p>
                      <p>{addr.city}, {addr.zip}</p>
                      <p>Phone: {addr.phone}</p>
                      
                      <div className="address-actions">
                        <button type="button" className="text-btn" onClick={() => handleEditAddress(addr)}>Change Address</button>
                        {!addr.isDefault && (
                          <button type="button" className="text-btn" onClick={() => handleMakeDefault(addr.id)}>Set as Default</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button type="button" className="add-address-btn" onClick={() => { setAddressData({ firstName: '', lastName: '', phone: '', email: '', address: '', city: '', zip: '' }); setEditingId(null); setShowAddressForm(true); }}>
                  + Add a new address
                </button>
              </div>
            )}
          </div>
          
          <OrderSummary 
            cartItems={checkoutItems} 
            cartTotal={checkoutTotal}
            showProceedButton={step === 1}
            onProceed={proceedToPayment}
            proceedDisabled={!selectedAddressId}
          />
        </div>
      )}

      {step === 2 && (
        <div className="checkout-layout">
          <div className="checkout-form-container flipkart-payment-container">
            
            <div className="flipkart-header">
              <div className="flipkart-header-left">
                <button className="back-arrow" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><ArrowLeft size={20} /></button>
                <div className="header-text">
                  <span className="step-count">Step 3 of 3</span>
                  <h2>Payments</h2>
                </div>
              </div>
              <div className="secure-badge"><Lock size={14}/> 100% Secure</div>
            </div>

            <div className="total-amount-bar">
              <div className="total-amount-text">Total Amount <ChevronDown size={16}/></div>
              <div className="total-amount-val">₹{Math.round(checkoutTotal * 1.1)}</div>
            </div>

            <div className="payment-accordion">
              
              {/* UPI */}
              <div className={`payment-method ${selectedPayment === 'upi' ? 'active' : ''}`}>
                <div className="payment-method-header" onClick={() => setSelectedPayment('upi')}>
                  <div className="pm-icon-wrapper"><Smartphone size={20} /></div>
                  <div className="pm-details">
                    <h3>UPI</h3>
                    <p>Pay by any UPI app</p>
                    <p className="offers-text">Save upto ₹20 • 14 offers available</p>
                  </div>
                  <div className="pm-chevron"><ChevronDown size={20} /></div>
                </div>
                {selectedPayment === 'upi' && (
                  <div className="payment-method-body">
                    <p className="avoid-fee-text">Avoid this fee by paying online now.</p>
                    <button className="btn-flipkart-yellow" onClick={handlePlaceOrder}>Place Order</button>
                  </div>
                )}
              </div>

              {/* Credit / Debit Card */}
              <div className={`payment-method ${selectedPayment === 'card' ? 'active' : ''}`}>
                <div className="payment-method-header" onClick={() => setSelectedPayment('card')}>
                  <div className="pm-icon-wrapper"><CreditCard size={20} /></div>
                  <div className="pm-details">
                    <h3>Credit / Debit / ATM Card</h3>
                    <p>Add and secure cards as per RBI guidelines</p>
                    <p className="offers-text">Get upto 5% cashback • 2 offers available</p>
                  </div>
                  <div className="pm-chevron"><ChevronDown size={20} /></div>
                </div>
                {selectedPayment === 'card' && (
                  <div className="payment-method-body">
                    <form onSubmit={handlePlaceOrder} className="card-form-flipkart">
                      <div className="form-group">
                        <input type="text" name="cardNumber" className="form-control" placeholder="Card Number" onChange={handleInputChange} required />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <input type="text" name="expiry" className="form-control" placeholder="MM/YY" onChange={handleInputChange} required />
                        </div>
                        <div className="form-group">
                          <input type="password" name="cvc" className="form-control" placeholder="CVC" onChange={handleInputChange} required />
                        </div>
                      </div>
                      <p className="avoid-fee-text">Avoid this fee by paying online now.</p>
                      <button type="submit" className="btn-flipkart-yellow">Place Order</button>
                    </form>
                  </div>
                )}
              </div>

              {/* Cash on Delivery */}
              <div className={`payment-method ${selectedPayment === 'cod' ? 'active' : ''}`}>
                <div className="payment-method-header" onClick={() => setSelectedPayment('cod')}>
                  <div className="pm-icon-wrapper"><Banknote size={20} /></div>
                  <div className="pm-details">
                    <h3>Cash on Delivery</h3>
                  </div>
                  <div className="pm-chevron"><ChevronDown size={20} /></div>
                </div>
                {selectedPayment === 'cod' && (
                  <div className="payment-method-body">
                    <button className="btn-flipkart-yellow" onClick={handlePlaceOrder}>Place Order</button>
                  </div>
                )}
              </div>

              {/* Gift Card */}
              <div className="payment-method">
                <div className="payment-method-header no-expand">
                  <div className="pm-icon-wrapper"><Gift size={20} /></div>
                  <div className="pm-details">
                    <h3>Have a ShopEase Gift Card?</h3>
                  </div>
                  <div className="pm-action-link">Add</div>
                </div>
              </div>

              {/* EMI */}
              <div className="payment-method disabled">
                <div className="payment-method-header no-expand">
                  <div className="pm-icon-wrapper"><Calendar size={20} /></div>
                  <div className="pm-details">
                    <h3>EMI</h3>
                  </div>
                  <div className="pm-unavailable">Unavailable</div>
                </div>
              </div>
              
            </div>
            
            <div className="happy-customers-footer">
               <p>35 Crore happy customers<br/>and counting!</p>
               <div className="smiley-face">☺</div>
            </div>

          </div>

          <OrderSummary cartItems={checkoutItems} cartTotal={checkoutTotal} />
        </div>
      )}

      {step === 3 && (
        <div className="success-message fade-in">
          <CheckCircle size={80} color="var(--success)" />
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. We've sent an email confirmation to {formData.email}.</p>
          <p>Your order ID is <strong>ORD-SHP-{Math.floor(Math.random() * 100000)}</strong></p>
          <p className="redirect-note">Redirecting you to your orders in a few seconds...</p>
          <Link to="/orders" className="btn btn-primary">Go to My Orders</Link>
        </div>
      )}
    </div>
  );
};

const OrderSummary = ({ cartItems, cartTotal, showProceedButton, onProceed, proceedDisabled }) => {
  const getPrice = (item) => Number(item.price ?? item.unit_price ?? item.product?.price ?? item.product?.unit_price ?? item.product_price ?? 0);
  const getName = (item) => item.name ?? item.product?.name ?? item.product_name ?? 'Product';
  const getImage = (item) => item.image ?? item.product?.image ?? item.product_image ?? '/placeholder.png';

  const shipping = cartTotal > 500 ? 0 : 10;
  const tax = cartTotal * 0.08;
  const finalTotal = cartTotal + shipping + tax;

  return (
    <div className="checkout-summary">
      <h3>Order Summary</h3>
      <div className="checkout-items">
        {cartItems.map(item => {
          const price = getPrice(item);
          const name = getName(item);
          const image = getImage(item);
          const qty = item.quantity ?? 1;

          return (
            <div key={item.id} className="summary-item">
              <img src={image} alt={name} onError={(e) => { e.target.src = '/placeholder.png'; }} />
              <div className="item-info">
                <span className="item-name">{name}</span>
                <span className="item-qty">Qty: {qty}</span>
              </div>
              <span className="item-price">₹{(price * qty).toFixed(2)}</span>
            </div>
          );
        })}
      </div>
      <div className="summary-calc">
        <div className="calc-row"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
        <div className="calc-row"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span></div>
        <div className="calc-row"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
        <div className="calc-total"><span>Total</span><span>₹{finalTotal.toFixed(2)}</span></div>
      </div>
      <div className="checkout-trust">
        <div className="trust-item"><ShieldCheck size={16} /> <span>Secure checkout</span></div>
        <div className="trust-item"><Truck size={16} /> <span>Insured shipping</span></div>
      </div>
      {showProceedButton && (
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', marginTop: '1rem', padding: '1rem' }}
          onClick={onProceed}
          disabled={proceedDisabled}
        >
          Proceed to Payment
        </button>
      )}
    </div>
  );
};

export default Checkout;
