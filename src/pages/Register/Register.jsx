import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { register: updateAuthContext } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number is exactly 10 digits
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // 1. Register the user
      const res = await authService.register({ 
        username: formData.userName, 
        email: formData.email,
        phone_number: formData.phone_number,
        password: formData.password 
      });
      
      // Show success message
      setSuccess('User registered successfully');
      
      // Clear form
      setFormData({
        userName: '',
        email: '',
        phone_number: '',
        password: ''
      });
      
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join ShopEase and start shopping</p>
          <p style={{color: 'red'}}>TEST MARKER 123</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        
        {success ? (
          <div className="auth-success-container" style={{ textAlign: 'center', padding: '20px 0' }}>
            <div className="auth-success" style={{color: 'green', padding: '15px', backgroundColor: '#e6ffe6', borderRadius: '8px', marginBottom: '25px', fontSize: '1.1rem', fontWeight: '500'}}>
              {success}
            </div>
            <p style={{ marginBottom: '20px' }}>Your account has been created and you are ready to explore.</p>
            <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '10px 25px' }}>
              Login Now
            </Link>
          </div>
        ) : (
          <>
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">User Name</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input 
                    name="userName"
                    type="text" 
                    className="form-control" 
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} />
                  <input 
                    name="email"
                    type="email" 
                    className="form-control" 
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input 
                    name="phone_number"
                    type="tel" 
                    className="form-control" 
                    placeholder="1234567890"
                    value={formData.phone_number}
                    onChange={handleChange}
                    maxLength="10"
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock size={18} />
                  <input 
                    name="password"
                    type="password" 
                    className="form-control" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? 'Creating Account...' : 'Register'} <UserPlus size={20} />
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Login Now</Link></p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;