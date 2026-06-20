import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              Shop<span>Ease</span>
            </Link>
            <p className="footer-desc">
              Your one-stop destination for modern, premium products. Quality meets style with ShopEase.
            </p>
            <div className="social-links">
              <a href="#"><Facebook size={20} /></a>
              <a href="#"><Twitter size={20} /></a>
              <a href="#"><Instagram size={20} /></a>
              <a href="#"><Youtube size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h3>Customer Service</h3>
            <ul>
              <li><Link to="/contact">Contact Us</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/return-refund">Return & Refund</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Contact Us</h3>
            <div className="contact-item">
              <MapPin size={20} />
              <span>123 Commerce St, Hosur</span>
            </div>
            <div className="contact-item">
              <Phone size={20} />
              <span>+91-9876543210</span>
            </div>
            <div className="contact-item">
              <Mail size={20} />
              <span>abc@gmail.com</span>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} ShopEase. All rights reserved.</p>
          <div className="payment-icons">
            {/* Mock payment icons */}
            <span>Visa</span> | <span>Mastercard</span> | <span>PayPal</span> | <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
