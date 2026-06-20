import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, User, Phone, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login: updateAuthContext } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        const res = await authService.login(formData.email, formData.password);
        const token = res?.data?.access || res?.data?.token || res?.token;
        const user = res?.data?.user || res?.data || res?.user;
        
        updateAuthContext(user);
        if (token) localStorage.setItem('shopease_token', token);
        navigate('/profile');
      } else {
        const res = await authService.register({ 
          username: formData.username, 
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password 
        });
        const token = res?.data?.access || res?.data?.token || res?.token || 'mock-jwt-token';
        const user = res?.data?.user || res?.data || res?.user;
        
        updateAuthContext(user);
        if (token) localStorage.setItem('shopease_token', token);
        navigate('/profile');
      }
    } catch (err) {
      setError(isLogin ? 'Invalid email or password. Please try again.' : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ username: '', email: '', phone_number: '', password: '' });
  };

  return (
    <div className="login-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
          <p>{isLogin ? 'Login to your ShopEase account' : 'Join ShopEase and start shopping'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">User Name</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  name="username"
                  type="text" 
                  className="form-control" 
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  required={!isLogin} 
                />
              </div>
            </div>
          )}

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

          {!isLogin && (
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
                  required={!isLogin} 
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <div className="label-row">
              <label className="form-label">Password</label>
              {isLogin && <a href="#" className="forgot-password">Forgot?</a>}
            </div>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                name="password"
                type={showPassword ? 'text' : 'password'} 
                className="form-control" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required 
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? (isLogin ? 'Logging in...' : 'Creating Account...') : (isLogin ? 'Login' : 'Register')} 
            {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className="toggle-mode-btn" onClick={toggleMode}>
              {isLogin ? 'Register Now' : 'Login Now'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
