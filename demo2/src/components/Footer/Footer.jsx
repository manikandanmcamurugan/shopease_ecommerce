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
            <h3>Support</h3>
            <ul>
              <li><Link to="/contact">Help Center</Link></li>
              <li><Link to="/shipping-policy">Shipping Policy</Link></li>
              <li><Link to="/return-refund">Return & Refund</Link></li>
              <li><Link to="/faq">FAQs</Link></li>
            </ul>
          </div>

          <div className="footer-links">
            <h3>Company</h3>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Help Center</h3>
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
          <div className="payment-icons" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a href="https://www.visa.com" target="_blank" rel="noopener noreferrer" title="Visa">
              <img src="https://cdn.visa.com/v2/assets/images/logos/visa/blue/logo.png" alt="Visa" style={{ height: '14px', objectFit: 'contain' }} />
            </a>
            <a href="https://www.mastercard.com" target="_blank" rel="noopener noreferrer" title="Mastercard">
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" style={{ height: '16px', objectFit: 'contain' }} />
            </a>
            <a href="https://www.paypal.com" target="_blank" rel="noopener noreferrer" title="PayPal">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '14px', objectFit: 'contain' }} />
            </a>
            <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" title="Stripe">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" style={{ height: '14px', objectFit: 'contain' }} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
