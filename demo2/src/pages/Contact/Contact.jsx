import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page container">
      <div className="contact-header text-center">
        <h1 style={{marginTop:"60px"}}>Contact Us</h1>
        <p>We'd love to hear from you. Please fill out this form or shoot us an email.</p>
      </div>

      <div className="contact-grid">
        <div className="contact-info">
          <h3>Get in Touch</h3>
          <div className="info-item">
            <Mail className="info-icon" />
            <div>
              <h4>Email</h4>
              <p>support@shopease.com</p>
            </div>
          </div>
          <div className="info-item">
            <Phone className="info-icon" />
            <div>
              <h4>Phone</h4>
              <p>+91 9876543210</p>
            </div>
          </div>
          <div className="info-item">
            <MapPin className="info-icon" />
            <div>
              <h4>Location</h4>
              <p>123 Commerce St, Hosur</p>
            </div>
          </div>
        </div>

        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input type="text" id="name" placeholder="John Doe" required style={{border:"1px solid black"}} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="john@example.com" required style={{border:"1px solid black"}} />
          </div>
          <div className="form-group">
            <label htmlFor="message">Message</label>
            <textarea id="message" rows="5" placeholder="How can we help?" required style={{border:"1px solid black"}}></textarea>
          </div>
          <button type="submit" className="btn btn-primary submit-btn" >Send Message</button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
