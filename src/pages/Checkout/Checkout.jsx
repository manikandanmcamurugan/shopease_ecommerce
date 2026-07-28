import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, CheckCircle, ChevronDown, Banknote, Smartphone, Gift, Calendar, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService, cartService } from '../../services/cartService';
import { loadScript } from '../../utils/loadScript';
import './Checkout.css';

const Checkout = () => {
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart, appliedCoupon, discountAmount } = useCart();
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
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (step === 3) {
      const timer = setTimeout(() => {
        navigate('/orders');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

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
    if (loading) return; // prevent double-submit
    setLoading(true);

    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addressData;

      const requiredAddressFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'zip'];
      const missingFields = requiredAddressFields.filter(f => !selectedAddress[f]);
      if (missingFields.length > 0) {
        alert(`Please complete your shipping address (missing: ${missingFields.join(', ')})`);
        setLoading(false);
        return;
      }

      // Create address on backend to get a valid ID
      let backendAddressId = selectedAddress.id;
      try {
        const addressPayload = {
          full_name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
          phone: selectedAddress.phone,
          address: selectedAddress.address,
          city: selectedAddress.city,
          state: selectedAddress.state || 'N/A', // fallback if missing
          pincode: selectedAddress.zip,
          country: selectedAddress.country || 'India'
        };
        const addressRes = await orderService.createShippingAddress(addressPayload);
        console.log("Address creation response:", addressRes.data);
        backendAddressId = addressRes.data?.id || addressRes.data?.results?.id || addressRes.data;
        if (typeof backendAddressId === 'object') backendAddressId = backendAddressId.id;
        console.log("Extracted backendAddressId before int parse:", backendAddressId);

        if (backendAddressId) {
          backendAddressId = parseInt(backendAddressId, 10);
        }

        if (!backendAddressId || isNaN(backendAddressId)) {
          throw new Error("Could not extract a valid ID from the address response.");
        }

        console.log("Final backendAddressId used for order:", backendAddressId);
      } catch (err) {
        console.error("Failed to create shipping address on backend", err);
        let errorMsg = 'Please check your address details.';
        if (err.response?.data) {
          try {
            errorMsg = Object.entries(err.response.data)
              .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
              .join(' | ');
          } catch {
            errorMsg = JSON.stringify(err.response.data);
          }
        }
        alert(`Failed to save shipping address: ${errorMsg}`);
        setLoading(false);
        return;
      }
      
      let finalUserId = user?.id || user?.user_id || user?.pk;
      
      const payloadUserId = 1;

      const orderData = {
        user_id: payloadUserId,
        email: user?.email || addressData.email || 'guest@example.com',
        shipping_name: `${selectedAddress.firstName} ${selectedAddress.lastName}`,
        total_amount: Number(Math.max(0, (checkoutTotal * 1.1) - discountAmount).toFixed(2)),
        discount_amount: discountAmount || 0,
        coupon_code: appliedCoupon?.code || '',
        status: 'processing',
        payment_method: selectedPayment,

        // Pass the ID in multiple possible field names the backend might expect
        shipping_address_id: backendAddressId,
        address_id: backendAddressId,

        // Also pass the string version in case the backend expects a string but 
        // the error message was just confusing
        address: `${selectedAddress.address}, ${selectedAddress.city}, ${selectedAddress.zip}`,

        shipping_phone: selectedAddress.phone,

        order_items: checkoutItems.map(item => ({
          product: item.id || item.product?.id || 1,
          product_id: item.id || item.product?.id || 1,
          product_name: item.name || item.product?.name || 'Product',
          image: item.image || item.product?.image || '',
          quantity: item.quantity || 1,
          price: Number(item.price ?? item.unit_price ?? item.product?.price ?? 0)
        }))
      };

      console.log('DIAGNOSTIC: sending orderData with various address formats:', orderData);

      // CRITICAL FIX: The backend completely ignores the order_items array in the payload and ONLY pulls items from the backend cart.
      // Therefore, if the user clicked "Buy Now", the backend cart is empty, and the order will have 0 items!
      // We must explicitly add the Buy Now items to the backend cart before placing the order.
      if (buyNowItems && buyNowItems.length > 0) {
        try {
          // Add each Buy Now item to the cart sequentially
          for (const item of buyNowItems) {
            const productId = item.id || item.product?.id || item.product_id || 1;
            await cartService.addToCart(productId, item.quantity || 1);
          }
          console.log("Successfully synced Buy Now items to backend cart!");
        } catch (err) {
          console.error("Failed to sync Buy Now items to backend cart:", err);
        }
      }

      const orderRes = await orderService.placeOrder(orderData);
      const newOrderId = orderRes?.data?.order_id || orderRes?.data?.id;
      
      if (!newOrderId) {
        alert("Failed to get a valid Order ID from the backend.");
        setLoading(false);
        return;
      }

      // If COD, just complete the order directly
      if (selectedPayment === 'cod') {
        completeOrderFrontend(newOrderId, orderData);
        return;
      }

      // -------------------------------------------------------------
      // ONLINE PAYMENT (Razorpay Flow)
      // -------------------------------------------------------------

      // 1. Create a payment record in the backend
      try {
        await orderService.createPayment({
          order: newOrderId,
          order_id: newOrderId,
          amount: orderData.total_amount,
          payment_method: selectedPayment === 'upi' ? 'UPI' : 'CARD',
          status: 'Pending'
        });
      } catch (err) {
        console.error("Failed to create initial payment record:", err);
        alert("Failed to initialize payment record on backend. Check console for details.");
        setLoading(false);
        return;
      }

      // 2. Load Razorpay SDK
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you offline?');
        setLoading(false);
        return;
      }

      // 3. Create Razorpay Order on Backend
      let razorpayOrderId = null;
      let razorpayAmount = null;
      let razorpayKey = 'rzp_test_T3piCvYDAKto87'; // Fallback key, backend should ideally return it

      try {
        const rzpOrderRes = await orderService.createRazorpayOrder({
          order_id: newOrderId,
          amount: Math.round(orderData.total_amount * 100),
          currency: 'INR'
        });
        
        console.log("DIAGNOSTIC: Backend Razorpay Order Response:", rzpOrderRes.data);
        
        razorpayOrderId = rzpOrderRes.data?.id || rzpOrderRes.data?.razorpay_order_id;
        razorpayAmount = rzpOrderRes.data?.amount;
        if (rzpOrderRes.data?.key) razorpayKey = rzpOrderRes.data.key;
        if (rzpOrderRes.data?.razorpay_key) razorpayKey = rzpOrderRes.data.razorpay_key;
      } catch (err) {
        console.error("Failed to create Razorpay Order:", err);
        let rzpErrorMsg = err.message;
        if (err.response?.data) {
          rzpErrorMsg = typeof err.response.data === 'object' ? JSON.stringify(err.response.data) : err.response.data;
        }
        alert(`Payment initialization failed: ${rzpErrorMsg}`);
        setLoading(false);
        return;
      }

      // 4. Initialize Razorpay
      const options = {
        key: razorpayKey, 
        amount: razorpayAmount || Math.round(orderData.total_amount * 100), 
        currency: 'INR',
        name: 'ShopEase',
        description: 'Order Payment',
        image: '/vite.svg', // logo
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // 5. Verify Signature on Backend
            await orderService.verifyRazorpayPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              order_id: newOrderId
            });
            
            // Payment verified successfully
            completeOrderFrontend(newOrderId, orderData);
          } catch (err) {
            console.error("Payment verification failed", err);
            alert("Payment verification failed! If money was deducted, it will be refunded.");
            setLoading(false);
          }
        },
        prefill: {
          name: orderData.shipping_name,
          email: orderData.email,
          contact: orderData.shipping_phone
        },
        theme: {
          color: '#2874f0'
        },
        modal: {
          ondismiss: function() {
            // 6. Handle user closing the popup
            setLoading(false);
            alert("Payment was cancelled.");
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (err) {
      // Log the raw response data on its own line, expanded, so DRF's
      // field-level validation errors (e.g. {"shipping_zip": ["This field is required."]})
      // are actually readable instead of collapsed inside the AxiosError object.
      console.error('Error placing order - status:', err.response?.status);
      console.error('Error placing order - response data:', err.response?.data);
      console.error('Error placing order - full error:', err);

      let errorMsg = err.message;
      if (err.response?.data) {
        try {
          // DRF validation errors are usually { field_name: ["message", ...] }
          errorMsg = Object.entries(err.response.data)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join(' | ');
        } catch {
          errorMsg = JSON.stringify(err.response.data);
        }
      }
      alert('Failed to place order: ' + errorMsg);
      setLoading(false); // Make sure to stop loading if you have a loading state
    }
  };

  const completeOrderFrontend = (newOrderId, orderData) => {
    const savedOrders = JSON.parse(localStorage.getItem('shopease_recent_orders') || '[]');
    const frontendOrder = {
      id: newOrderId,
      created_at: new Date().toISOString(),
      status: 'Processing',
      total_amount: orderData.total_amount,
      items: orderData.order_items, // Exact items from checkout
    };
    savedOrders.push(frontendOrder);
    localStorage.setItem('shopease_recent_orders', JSON.stringify(savedOrders));

    // Only proceed to success step if the API call succeeds
    setStep(3); // Success step
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      clearCart();
      navigate('/orders');
    }, 5000);
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
                    <button type="button" className="btn btn-outline" onClick={() => { setShowAddressForm(false); setEditingId(null); }}>Cancel</button>
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
              <div className="secure-badge"><Lock size={14} /> 100% Secure</div>
            </div>

            <div className="total-amount-bar">
              <div className="total-amount-text">Total Amount <ChevronDown size={16} /></div>
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
                    <button className="btn-flipkart-yellow" onClick={handlePlaceOrder} disabled={loading}>
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
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
                      <button type="submit" className="btn-flipkart-yellow" disabled={loading}>
                        {loading ? 'Placing Order...' : 'Place Order'}
                      </button>
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
                    <button className="btn-flipkart-yellow" onClick={handlePlaceOrder} disabled={loading}>
                      {loading ? 'Placing Order...' : 'Place Order'}
                    </button>
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
              <p>35 Crore happy customers<br />and counting!</p>
              <div className="smiley-face">☺</div>
            </div>

          </div>

              <OrderSummary 
                cartItems={checkoutItems} 
                cartTotal={checkoutTotal} 
                appliedCoupon={appliedCoupon}
                discountAmount={discountAmount}
              />
        </div>
      )}

      {step === 3 && (
        <div className="success-screen-modern fade-in">
          <h1>Order Placed!</h1>
          <p className="subtitle">You have successfully placed your order</p>
          
          <div className="confetti-container">
            {/* Simple confetti rendering */}
            {[...Array(250)].map((_, i) => {
              const colors = ['#fde047', '#3b82f6', '#a855f7', '#0ea5e9', '#ec4899', '#22c55e', '#ef4444'];
              const color = colors[i % colors.length];
              const angle = (i * 360) / 250;
              const distance = 80 + Math.random() * 600;
              const style = {
                backgroundColor: color,
                width: i % 3 === 0 ? '8px' : '6px',
                height: i % 2 === 0 ? '8px' : '12px',
                '--tx': `${Math.cos(angle * (Math.PI / 180)) * distance}px`,
                '--ty': `${Math.sin(angle * (Math.PI / 180)) * distance}px`,
                '--rot': `${Math.random() * 360}deg`,
                animationDelay: `${Math.random() * 0.1}s`,
                animationDuration: `${1.5 + Math.random() * 1.5}s`,
              };
              return <div key={i} className="confetti-piece" style={style} />;
            })}
            
            <div className="check-circle-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
          </div>


          <Link to="/orders" className="done-btn-large">
            Done
          </Link>
        </div>
      )}
    </div>
  );
};

const OrderSummary = ({ cartItems, cartTotal, showProceedButton, onProceed, proceedDisabled, appliedCoupon, discountAmount }) => {
  const getPrice = (item) => Number(item.price ?? item.unit_price ?? item.product?.price ?? item.product?.unit_price ?? item.product_price ?? 0);
  const getName = (item) => item.name ?? item.product?.name ?? item.product_name ?? 'Product';
  const getImage = (item) => item.image ?? item.product?.image ?? item.product_image ?? '/placeholder.png';

  const shipping = cartTotal > 500 ? 0 : 10;
  const tax = cartTotal * 0.08;
  const safeDiscount = discountAmount || 0;
  const finalTotal = Math.max(0, cartTotal + shipping + tax - safeDiscount);

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
        {appliedCoupon && (
          <div className="calc-row" style={{ color: '#10b981', fontWeight: '500' }}>
            <span>Discount ({appliedCoupon.code})</span>
            <span>-₹{safeDiscount.toFixed(2)}</span>
          </div>
        )}
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