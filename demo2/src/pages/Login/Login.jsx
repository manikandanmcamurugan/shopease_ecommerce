import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Eye, EyeOff, User, Phone, UserPlus, Key, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import './Login.css';

const Login = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register', 'forgot', 'otp', 'reset'
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone_number: '',
    password: ''
  });
  
  const [resetData, setResetData] = useState({
    identifier: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { login: updateAuthContext } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const handleLoginRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (authMode === 'login') {
        const res = await authService.login(formData.email, formData.password);
        const token = res?.data?.access || res?.data?.token || res?.token;
        if (token) localStorage.setItem('shopease_token', token);
        
        let user = res?.data?.user;
        if (!user && token) {
          try {
            const profileRes = await authService.getProfile();
            user = profileRes.data;
          } catch (profileErr) {
            console.error('Failed to fetch profile:', profileErr);
          }
        }
        
        if (!user || (!user.name && !user.username && !user.email)) {
          user = {
            ...user,
            email: formData.email,
            username: formData.email.split('@')[0],
            name: formData.email.split('@')[0]
          };
        }
        
        updateAuthContext(user);
        navigate('/profile');
      } else {
        const res = await authService.register({ 
          username: formData.username, 
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password 
        });
        const token = res?.data?.access || res?.data?.token || res?.token || 'mock-jwt-token';
        if (token) localStorage.setItem('shopease_token', token);
        
        let user = res?.data?.user;
        if (!user && token && token !== 'mock-jwt-token') {
          try {
            const profileRes = await authService.getProfile();
            user = profileRes.data;
          } catch (profileErr) {
            console.error('Failed to fetch profile:', profileErr);
          }
        }
        
        if (!user || (!user.name && !user.username && !user.email)) {
          user = {
            ...user,
            email: formData.email,
            username: formData.username || formData.email.split('@')[0],
            name: formData.username || formData.email.split('@')[0],
            phone: formData.phone_number
          };
        }
        
        updateAuthContext(user);
        navigate('/profile');
      }
    } catch (err) {
      setError(authMode === 'login' ? 'Invalid email or password. Please try again.' : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authService.forgotPassword(resetData.identifier);
      setSuccessMsg(`OTP sent to ${resetData.identifier}`);
      setAuthMode('otp');
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await authService.verifyOTP(resetData.identifier, resetData.otp);
      setSuccessMsg('OTP verified! Please set a new password.');
      setAuthMode('reset');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.newPassword !== resetData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      await authService.resetPassword(resetData.identifier, resetData.otp, resetData.newPassword);
      setSuccessMsg('Password reset successfully! Please login with your new password.');
      setAuthMode('login');
      setResetData({ identifier: '', otp: '', newPassword: '', confirmPassword: '' });
      setFormData({ ...formData, password: '' }); // Clear password field for fresh login
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = (mode) => {
    setAuthMode(mode);
    setError('');
    setSuccessMsg('');
    if (mode === 'login' || mode === 'register') {
      setFormData({ username: '', email: '', phone_number: '', password: '' });
    }
  };

  const renderHeader = () => {
    switch (authMode) {
      case 'login': return { title: 'Welcome Back', subtitle: 'Login to your ShopEase account' };
      case 'register': return { title: 'Create Account', subtitle: 'Join ShopEase and start shopping' };
      case 'forgot': return { title: 'Forgot Password', subtitle: 'Enter your email or phone to receive an OTP' };
      case 'otp': return { title: 'Verify OTP', subtitle: `Enter the OTP sent to ${resetData.identifier}` };
      case 'reset': return { title: 'Reset Password', subtitle: 'Enter your new password below' };
      default: return { title: 'Welcome', subtitle: 'Please authenticate' };
    }
  };

  const headerText = renderHeader();

  return (
    <div className="login-page">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <h1>{headerText.title}</h1>
          <p>{headerText.subtitle}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {successMsg && <div className="auth-success" style={{ color: '#10b981', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.9rem', border: '1px solid #34d399' }}>{successMsg}</div>}

        {(authMode === 'login' || authMode === 'register') && (
          <form className="auth-form" onSubmit={handleLoginRegister}>
            {authMode === 'register' && (
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
                    required={authMode === 'register'} 
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

            {authMode === 'register' && (
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
                    required={authMode === 'register'} 
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <div className="label-row">
                <label className="form-label">Password</label>
                {authMode === 'login' && (
                  <button type="button" className="forgot-password toggle-mode-btn" onClick={() => toggleMode('forgot')} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.9rem' }}>
                    Forgot?
                  </button>
                )}
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
              {loading ? (authMode === 'login' ? 'Logging in...' : 'Creating Account...') : (authMode === 'login' ? 'Login' : 'Register')} 
              {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
            </button>
          </form>
        )}

        {authMode === 'forgot' && (
          <form className="auth-form" onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label className="form-label">Email or Phone Number</label>
              <div className="input-with-icon">
                <User size={18} />
                <input 
                  name="identifier"
                  type="text" 
                  className="form-control" 
                  placeholder="Enter your email or phone"
                  value={resetData.identifier}
                  onChange={handleResetChange}
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'} <ArrowRight size={20} />
            </button>
          </form>
        )}

        {authMode === 'otp' && (
          <form className="auth-form" onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <div className="input-with-icon">
                <Key size={18} />
                <input 
                  name="otp"
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. 123456"
                  value={resetData.otp}
                  onChange={handleResetChange}
                  required 
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'} <CheckCircle size={20} />
            </button>
          </form>
        )}

        {authMode === 'reset' && (
          <form className="auth-form" onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input 
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="Enter new password"
                  value={resetData.newPassword}
                  onChange={handleResetChange}
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
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={18} />
                <input 
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="Confirm new password"
                  value={resetData.confirmPassword}
                  onChange={handleResetChange}
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'} <Lock size={20} />
            </button>
          </form>
        )}

        <div className="auth-footer">
          {authMode === 'login' || authMode === 'register' ? (
            <p>
              {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button type="button" className="toggle-mode-btn" onClick={() => toggleMode(authMode === 'login' ? 'register' : 'login')}>
                {authMode === 'login' ? 'Register Now' : 'Login Now'}
              </button>
            </p>
          ) : (
            <p>
              Remember your password?{' '}
              <button type="button" className="toggle-mode-btn" onClick={() => toggleMode('login')}>
                Back to Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
