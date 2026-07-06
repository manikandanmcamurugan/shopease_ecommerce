import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { X, LogIn } from 'lucide-react';
import './LoginModal.css';

const LoginModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Do not show on the login or register pages
    if (location.pathname === '/login' || location.pathname === '/register') {
      return;
    }

    // Check if we've already shown the prompt this session
    const hasSeenPrompt = sessionStorage.getItem('hasSeenLoginPrompt');
    
    // If no user and haven't seen prompt, show it after a short delay
    if (!user && !hasSeenPrompt) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500); // 1.5 seconds after entering
      return () => clearTimeout(timer);
    }
  }, [user, location.pathname]);

  useEffect(() => {
    const handleTrigger = () => {
      setIsOpen(true);
    };

    window.addEventListener('triggerLoginPrompt', handleTrigger);
    return () => window.removeEventListener('triggerLoginPrompt', handleTrigger);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenLoginPrompt', 'true');
  };

  const handleLoginClick = () => {
    handleClose();
    navigate('/login');
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={handleClose}>
      <div className="login-modal-content" onClick={e => e.stopPropagation()}>
        <button className="login-modal-close" onClick={handleClose}>
          <X size={24} />
        </button>
        
        <div className="login-modal-header">
          <div className="login-modal-icon">
            <LogIn size={32} />
          </div>
          <h2>Welcome to ShopEase!</h2>
          <p>Please log in or create an account to unlock exclusive offers, faster checkout, and personalized recommendations.</p>
        </div>
        
        <div className="login-modal-actions">
          <button className="btn btn-secondary cancel-btn" onClick={handleClose}>
            Cancel
          </button>
          <button className="btn btn-primary login-btn" onClick={handleLoginClick}>
            Login Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
