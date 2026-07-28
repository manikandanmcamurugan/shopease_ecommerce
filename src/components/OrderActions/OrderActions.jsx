import React, { useState } from 'react';
import './OrderActions.css';

const OrderActions = ({ orderId, item }) => {
  const [activeForm, setActiveForm] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const toggleForm = (form) => {
    setActiveForm(activeForm === form ? null : form);
    if (form !== 'review') setRating(0); // reset rating when switching forms
  };

  return (
    <div className="order-actions-wrapper">
      <div className="item-actions">
        <button className="btn btn-outline" onClick={() => toggleForm('track')}>Track package</button>
        <button className="btn btn-outline" onClick={() => toggleForm('return')}>Return items</button>
        <button className="btn btn-outline" onClick={() => toggleForm('review')}>Write a review</button>
      </div>
      
      {activeForm === 'track' && (
        <div className="action-form-panel">
          <div className="form-header">
            <h4>Track Package</h4>
            <button className="close-btn" onClick={() => toggleForm(null)}>×</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert("Tracking functionality coming soon"); toggleForm(null); }}>
             <input type="text" placeholder="Tracking Number (e.g. 1Z999...)" className="form-input" required />
             <button type="submit" className="btn btn-primary mt-2 w-full">Track</button>
          </form>
        </div>
      )}

      {activeForm === 'return' && (
        <div className="action-form-panel">
          <div className="form-header">
            <h4>Initiate a Return</h4>
            <button className="close-btn" onClick={() => toggleForm(null)}>×</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert("Return requested"); toggleForm(null); }}>
             <select className="form-input" required defaultValue="">
               <option value="" disabled>Choose a reason...</option>
               <option value="defective">Item is defective or broken</option>
               <option value="wrong_item">Received wrong item</option>
               <option value="not_needed">No longer needed</option>
             </select>
             <textarea placeholder="Additional Details (Optional)" className="form-input mt-2" rows="2"></textarea>
             <button type="submit" className="btn btn-primary mt-2 w-full">Submit Return</button>
          </form>
        </div>
      )}

      {activeForm === 'review' && (
        <div className="action-form-panel">
           <div className="form-header">
            <h4>Write a Review</h4>
            <button className="close-btn" onClick={() => toggleForm(null)}>×</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert("Review submitted"); toggleForm(null); }}>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star => (
                <span 
                  key={star} 
                  className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  ★
                </span>
              ))}
            </div>
            <input type="text" placeholder="Review Title" className="form-input mt-2" required />
            <textarea placeholder="What did you like or dislike?" className="form-input mt-2" rows="3" required></textarea>
            <button type="submit" className="btn btn-primary mt-2 w-full">Submit Review</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default OrderActions;
