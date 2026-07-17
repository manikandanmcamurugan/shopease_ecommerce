import React from 'react';
import { X, CheckCircle, MapPin, Truck, Package, Clock, Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import reviewService from '../../services/reviewService';
import './OrderModals.css';

export const TrackingModal = ({ order, onClose, onCancel }) => {
  if (!order) return null;

  // Determine active step based on status
  const status = (order.status ?? order.order_status ?? order.state ?? 'Pending').toLowerCase();
  
  let currentStep = 0;
  if (status === 'pending' || status === 'processing') currentStep = 1; // Order Confirmed
  if (status === 'packed') currentStep = 2;
  if (status === 'shipped') currentStep = 3;
  if (status === 'out for delivery') currentStep = 4;
  if (status === 'delivered') currentStep = 5;
  if (status === 'cancelled') currentStep = -1;

  const steps = [
    { label: 'Order Placed', icon: <Clock size={20} /> },
    { label: 'Order Confirmed', icon: <CheckCircle size={20} /> },
    { label: 'Packed', icon: <Package size={20} /> },
    { label: 'Shipped', icon: <Truck size={20} /> },
    { label: 'Out for Delivery', icon: <MapPin size={20} /> },
    { label: 'Delivered', icon: <CheckCircle size={20} /> }
  ];

  return (
    <div className="order-modal-overlay">
      <div className="order-modal-content">
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        <h3>Track Package</h3>
        <p className="order-id-subtitle">Order #{order.id}</p>
        
        {status === 'cancelled' ? (
          <div className="cancelled-state">
            <X size={48} color="#ef4444" />
            <h4>Order Cancelled</h4>
            <p>This order has been cancelled and will not be delivered.</p>
          </div>
        ) : (
          <>
            <div className="tracking-timeline">
              {steps.map((step, index) => {
                const isActive = index <= currentStep;
                const isLast = index === steps.length - 1;
                return (
                  <div key={index} className={`timeline-step ${isActive ? 'active' : ''}`}>
                    <div className="timeline-icon">{step.icon}</div>
                    <div className="timeline-info">
                      <h4>{step.label}</h4>
                      {isActive && <span className="timeline-date">Completed</span>}
                    </div>
                    {!isLast && <div className={`timeline-line ${index < currentStep ? 'active-line' : ''}`}></div>}
                  </div>
                );
              })}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
              <button 
                className="btn btn-danger"
                disabled={['shipped', 'out for delivery', 'delivered'].includes(status)}
                onClick={onCancel}
              >
                Cancel Order
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const ShippingModal = ({ order, onClose }) => {
  if (!order) return null;

  // Attempt to parse shipping address if available
  const address = order.shipping_address || {};
  const fallbackName = order.user?.name ?? order.shipping_name ?? 'You';

  return (
    <div className="order-modal-overlay">
      <div className="order-modal-content">
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        <h3>Shipping Address</h3>
        <p className="order-id-subtitle">Order #{order.id}</p>
        
        <div className="shipping-details-card">
          <div className="shipping-icon">
            <MapPin size={24} />
          </div>
          <div className="shipping-info-text">
            <h4>{address.full_name || fallbackName}</h4>
            <p>{address.address || 'Address details not provided by backend.'}</p>
            {address.city && <p>{address.city}, {address.state} {address.pincode}</p>}
            {address.country && <p>{address.country}</p>}
            <p className="shipping-phone"><strong>Phone:</strong> {address.phone || order.shipping_phone || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FeedbackModal = ({ order, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    // Simulate API call
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="order-modal-overlay">
      <div className="order-modal-content">
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        <h3>Return & Refund</h3>
        <p className="order-id-subtitle">Order #{order.id}</p>
        
        {submitted ? (
          <div className="success-state text-center py-4">
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto', marginBottom: '1rem' }} />
            <h4>Request Submitted!</h4>
            <p className="text-muted">Our team will review your return request shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-4">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Reason for Return</label>
              <textarea 
                className="form-control" 
                rows="4" 
                placeholder="Please tell us why you are returning this item..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" className="btn btn-primary w-100" style={{ height: '48px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <MessageSquare size={18} /> Submit Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const ReviewModal = ({ product, orderId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!product) return null;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a star rating.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await reviewService.createReview({
        product_id: product.id,
        rating: rating,
        comment: review
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('Failed to submit review. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="order-modal-overlay">
      <div className="order-modal-content">
        <button className="close-btn" onClick={onClose}><X size={20} /></button>
        <h3>Rate & Review</h3>
        <p className="order-id-subtitle" style={{ marginBottom: '1rem' }}>Order #{orderId}</p>
        
        {submitted ? (
          <div className="success-state text-center py-4">
            <CheckCircle size={48} color="#10b981" style={{ margin: '0 auto', marginBottom: '1rem' }} />
            <h4>Review Submitted!</h4>
            <p className="text-muted">Thank you for rating {product.name}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="review-product-info mb-4" style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
              <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
              <div style={{ fontWeight: '500' }}>{product.name}</div>
            </div>
            
            <div className="form-group mb-4 text-center">
              <label style={{ display: 'block', marginBottom: '1rem', fontWeight: '500', fontSize: '1.1rem' }}>Tap to Rate</label>
              <div className="star-rating-interactive" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="star-btn"
                    style={{ background: 'none', border: 'none', padding: '0', cursor: 'pointer', color: (hoverRating || rating) >= star ? '#eab308' : '#e5e7eb' }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star size={36} fill={(hoverRating || rating) >= star ? '#eab308' : 'transparent'} />
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group mb-4">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Write a review (optional)</label>
              <textarea 
                className="form-control" 
                rows="3" 
                placeholder="What did you think about this product?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary w-100" style={{ height: '48px', fontSize: '1rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
