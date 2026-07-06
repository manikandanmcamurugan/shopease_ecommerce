import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import './Contact.css';

const Contact = () => {
  const [focused, setFocused] = useState('');
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      addToast('Message sent successfully! We will get back to you soon.', 'success');
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-page container">
        <div className="contact-header text-center">
          <h1 className="gradient-text" style={{marginTop:"60px"}}>Get in Touch</h1>
          <p className="subtitle">We'd love to hear from you. Please fill out this form or shoot us an email.</p>
        </div>

        <div className="contact-grid">
          <div className="contact-info-card">
            <h3>Contact Information</h3>
            <p className="info-desc">Reach out to us directly through any of these channels.</p>
            
            <div className="info-items-container">
              <div className="info-item">
                <div className="icon-wrapper"><Mail className="info-icon" /></div>
                <div>
                  <h4>Email</h4>
                  <p>support@shopease.com</p>
                </div>
              </div>
              <div className="info-item">
                <div className="icon-wrapper"><Phone className="info-icon" /></div>
                <div>
                  <h4>Phone</h4>
                  <p>+91 9876543210</p>
                </div>
              </div>
              <div className="info-item">
                <div className="icon-wrapper"><MapPin className="info-icon" /></div>
                <div>
                  <h4>Location</h4>
                  <p>123 Commerce St, Hosur</p>
                </div>
              </div>
            </div>
            
            <div className="decorative-circle circle-1"></div>
            <div className="decorative-circle circle-2"></div>
          </div>

          <div className="contact-form-container">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className={`form-group ${focused === 'name' ? 'focused' : ''}`}>
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe" 
                  required 
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                />
              </div>
              <div className={`form-group ${focused === 'email' ? 'focused' : ''}`}>
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com" 
                  required 
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                />
              </div>
              <div className={`form-group ${focused === 'message' ? 'focused' : ''}`}>
                <label htmlFor="message">Message</label>
                <textarea 
                  id="message" 
                  rows="5" 
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help?" 
                  required 
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused('')}
                ></textarea>
              </div>
              <button type="submit" className="submit-btn pulse-on-hover" disabled={isSubmitting}>
                <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
