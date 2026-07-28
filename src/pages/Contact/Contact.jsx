import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle, MessageCircle, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import contactService from '../../services/contactService';
import './Contact.css';

const Contact = () => {
  const [focused, setFocused] = useState('');
  const { addToast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await contactService.submitContact(formData);
      addToast('Message sent successfully! We will get back to you soon.', 'success');
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
      
      let errorMsg = 'Failed to send message. Please try again.';
      if (error.response?.status === 404) {
        errorMsg = "Contact API endpoint not found on the server (404).";
      } else if (error.response?.data) {
        if (typeof error.response.data === 'object' && !Array.isArray(error.response.data)) {
          const firstErrorKey = Object.keys(error.response.data)[0];
          const firstErrorVal = error.response.data[firstErrorKey];
          if (Array.isArray(firstErrorVal)) {
             errorMsg = `${firstErrorKey}: ${firstErrorVal[0]}`;
          } else if (typeof firstErrorVal === 'string') {
             errorMsg = firstErrorVal;
          }
        }
      }
      addToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="help-center-wrapper">
      <div className="help-center-hero">
        <div className="hero-content">
          <h1>How can we help you?</h1>
          <p>Search our knowledge base or get in touch with our support team.</p>
        </div>
      </div>

      <div className="help-center-container container">

        <div className="contact-section">
          <div className="contact-form-side">
            <div className="section-title">
              <h2>Send us a message</h2>
              <p>Fill out the form below and our team will get back to you within 24 hours.</p>
            </div>
            
            <form className="modern-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className={`form-group ${focused === 'name' ? 'focused' : ''}`}>
                  <label htmlFor="name">Full Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. John Doe" 
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
                    placeholder="e.g. john@example.com" 
                    required 
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused('')}
                  />
                </div>
              </div>
              <div className={`form-group ${focused === 'message' ? 'focused' : ''}`}>
                <label htmlFor="message">How can we help?</label>
                <textarea 
                  id="message" 
                  rows="6" 
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Please describe your issue or question in detail..." 
                  required 
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused('')}
                ></textarea>
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Message'}
                {!isSubmitting && <Send size={16} style={{marginLeft: '8px'}} />}
              </button>
            </form>
          </div>

          <div className="contact-info-side">
            <div className="info-box">
              <h3>Support Channels</h3>
              <p className="info-desc">Our dedicated team is ready to assist you through any of these channels.</p>
              
              <div className="info-item">
                <div className="icon-wrap"><Mail size={20} /></div>
                <div className="info-text">
                  <h4>Email Support</h4>
                  <p>support@shopease.com</p>
                  <span>Avg. response time: 2 hours</span>
                </div>
              </div>
              
              <div className="info-item">
                <div className="icon-wrap"><Phone size={20} /></div>
                <div className="info-text">
                  <h4>Phone Support</h4>
                  <p>+91 98765 43210</p>
                  <span>Mon-Fri, 9am - 6pm</span>
                </div>
              </div>
              
              <div className="info-item">
                <div className="icon-wrap"><MapPin size={20} /></div>
                <div className="info-text">
                  <h4>Headquarters</h4>
                  <p>123 Commerce St, Hosur<br/>Tamil Nadu, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
