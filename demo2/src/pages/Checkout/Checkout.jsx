import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, CheckCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    cardName: '', cardNumber: '', expiry: '', cvc: ''
  });
  
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
    }
  };

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setStep(3); // Success step
    setTimeout(() => {
      clearCart();
      navigate('/orders');
    }, 5000);
  };

  if (cartItems.length === 0 && step !== 3) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page container">
      <div className="checkout-steps">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Shipping</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Payment</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Completion</div>
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
                    {selectedAddressId === addr.id && (
                      <div className="card-deliver-btn">
                        <button type="button" className="btn btn-primary" onClick={proceedToPayment}>Deliver to this address</button>
                      </div>
                    )}
                  </div>
                ))}
                
                <button type="button" className="add-address-btn" onClick={() => { setAddressData({ firstName: '', lastName: '', phone: '', email: '', address: '', city: '', zip: '' }); setEditingId(null); setShowAddressForm(true); }}>
                  + Add a new address
                </button>
              </div>
            )}
          </div>
          
          <OrderSummary cartItems={cartItems} cartTotal={cartTotal} />
        </div>
      )}

      {step === 2 && (
        <div className="checkout-layout">
          <div className="checkout-form-container">
            <h2>Payment Method</h2>
            <form onSubmit={handlePlaceOrder} className="order-form">
              <div className="payment-options">
                <div className="payment-option active">
                  <CreditCard size={20} />
                  <span>Credit / Debit Card</span>
                </div>
              </div>
              
              <div className="form-group">
                <label>Name on Card</label>
                <input type="text" name="cardName" className="form-control" placeholder="John Doe" onChange={handleInputChange} required />
              </div>
              <div className="form-group">
                <label>Card Number</label>
                <input type="text" name="cardNumber" className="form-control" placeholder="0000 0000 0000 0000" onChange={handleInputChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Expiry (MM/YY)</label>
                  <input type="text" name="expiry" className="form-control" placeholder="MM/YY" onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>CVC</label>
                  <input type="password" name="cvc" className="form-control" placeholder="•••" onChange={handleInputChange} required />
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                <button type="submit" className="btn btn-primary place-order-btn">Place Order (₹{(cartTotal * 1.1).toFixed(2)})</button>
              </div>
            </form>
          </div>

          <OrderSummary cartItems={cartItems} cartTotal={cartTotal} />
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

const OrderSummary = ({ cartItems, cartTotal }) => (
  <div className="checkout-summary">
    <h3>Order Summary</h3>
    <div className="checkout-items">
      {cartItems.map(item => (
        <div key={item.id} className="summary-item">
          <img src={item.image} alt={item.name} />
          <div className="item-info">
            <span className="item-name">{item.name}</span>
            <span className="item-qty">Qty: {item.quantity}</span>
          </div>
          <span className="item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}
    </div>
    <div className="summary-calc">
      <div className="calc-row"><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
      <div className="calc-row"><span>Shipping</span><span>Free</span></div>
      <div className="calc-row"><span>Tax</span><span>₹{(cartTotal * 0.1).toFixed(2)}</span></div>
      <div className="calc-total"><span>Total</span><span>₹{(cartTotal * 1.1).toFixed(2)}</span></div>
    </div>
    <div className="checkout-trust">
      <div className="trust-item"><ShieldCheck size={16} /> <span>Secure checkout</span></div>
      <div className="trust-item"><Truck size={16} /> <span>Insured shipping</span></div>
    </div>
  </div>
);

export default Checkout;
