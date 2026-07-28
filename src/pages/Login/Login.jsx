import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value, mode = authMode) => {
    let error = '';
    if (name === 'username' && mode === 'register') {
      if (!value.trim()) error = 'Username is required';
    }
    if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
    }
    if (name === 'phone_number' && mode === 'register') {
      if (!value) error = 'Phone number is required';
      else if (!/^\d{10}$/.test(value)) error = 'Phone number must be exactly 10 digits';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (mode === 'register') {
        const strongRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!strongRegex.test(value)) {
          error = 'Weak Password';
        }
      }
    }
    return error;
  };

  const getInputClass = (name) => {
    if (!touched[name]) return 'form-control';
    return `form-control ${formErrors[name] ? 'invalid-input' : 'valid-input'}`;
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login: updateAuthContext } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.mode) {
      setAuthMode(location.state.mode);
      setError('');
      setSuccessMsg('');
    } else if (!location.state) {
      setAuthMode('login');
      setError('');
      setSuccessMsg('');
      setFormErrors({});
      setTouched({});
    }
  }, [location.state, location.pathname]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    
    if (name === 'phone_number') {
      newValue = value.replace(/\D/g, '');
      if (newValue.length > 10) return;
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    const error = validateField(name, newValue);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleResetChange = (e) => {
    setResetData({ ...resetData, [e.target.name]: e.target.value });
  };

  const handleLoginRegister = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    const fieldsToValidate = authMode === 'register' 
      ? ['username', 'email', 'phone_number', 'password']
      : ['email', 'password'];
      
    let hasErrors = false;
    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });
    
    setFormErrors(newErrors);
    const newTouched = fieldsToValidate.reduce((acc, field) => ({...acc, [field]: true}), {});
    setTouched(newTouched);
    
    if (hasErrors) return;

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
        const returnUrl = sessionStorage.getItem('returnUrl');
        if (returnUrl) sessionStorage.removeItem('returnUrl');
        const from = returnUrl || location.state?.from?.pathname || '/';
        navigate(from, { state: location.state?.from?.state, replace: true });
      } else {
        await authService.register({
          username: formData.username,
          email: formData.email,
          phone_number: formData.phone_number,
          password: formData.password
        });
        
        setSuccessMsg('User registered successfully! Please login.');
        setAuthMode('login');
        setFormData({ ...formData, password: '' }); // keep the email but clear password
      }
    } catch (err) {
      if (err.response?.data) {
        // Surface the backend's actual field-level validation errors instead of
        // collapsing them into a generic message. This is what a 400 response
        // from DRF-style APIs (e.g. { "phone_number": ["..."] }) looks like.
        const data = err.response.data;
        console.error('Full backend error payload:', data);

        let errorMsg;
        if (data.message) {
          errorMsg = data.message;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.detail) {
          errorMsg = data.detail;
        } else if (typeof data === 'object') {
          errorMsg = Object.entries(data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(' ') : msgs}`)
            .join(' | ');
        } else {
          errorMsg = 'Registration failed.';
        }
        setError(errorMsg);
      } else {
        setError(authMode === 'login' ? 'Invalid email or password. Please try again.' : 'Registration failed. Please try again.');
      }
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
    setFormErrors({});
    setTouched({});
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
          <form className="auth-form" onSubmit={handleLoginRegister} noValidate>
            {authMode === 'register' && (
              <div className="form-group">
                <label className="form-label">User Name</label>
                <div className="input-with-icon">
                  <User size={18} />
                  <input
                    name="username"
                    type="text"
                    className={getInputClass('username')}
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={authMode === 'register'}
                  />
                </div>
                {formErrors.username && touched.username && <span className="field-error">{formErrors.username}</span>}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail size={18} />
                <input
                  name="email"
                  type="email"
                  className={getInputClass('email')}
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
              </div>
              {formErrors.email && touched.email && <span className="field-error">{formErrors.email}</span>}
            </div>

            {authMode === 'register' && (
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={18} />
                  <input
                    name="phone_number"
                    type="tel"
                    className={getInputClass('phone_number')}
                    placeholder="1234567890"
                    value={formData.phone_number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required={authMode === 'register'}
                  />
                </div>
                {formErrors.phone_number && touched.phone_number && <span className="field-error">{formErrors.phone_number}</span>}
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
                  className={getInputClass('password')}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formErrors.password && touched.password && authMode !== 'register' && <span className="field-error">{formErrors.password}</span>}
              {authMode === 'register' && (
                <div style={{ marginTop: '0.5rem' }}>
                  {formData.password && (
                    <span className={`password-strength ${formErrors.password ? 'weak' : 'strong'}`} style={{ display: 'block', marginBottom: '0.25rem' }}>
                      {formErrors.password
                        ? '❌ Weak Password – Missing uppercase letter, number, or special character.' 
                        : '✅ Strong Password '}
                    </span>
                  )}
                  
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? (authMode === 'login' ? 'Logging in...' : 'Creating Account...') : (authMode === 'login' ? 'Login' : 'Register')}
              {authMode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
            </button>
          </form>
        )}

        {authMode === 'forgot' && (
          <form className="auth-form" onSubmit={handleForgotPassword} noValidate>
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
          <form className="auth-form" onSubmit={handleVerifyOTP} noValidate>
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
          <form className="auth-form" onSubmit={handleResetPassword} noValidate>
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
                  style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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