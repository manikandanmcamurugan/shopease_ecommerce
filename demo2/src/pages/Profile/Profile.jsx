import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, Package, Settings, LogOut, Camera, Save, Edit2, Lock, Bell, Shield, Map } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import authService from '../../services/authService';
import { orderService } from '../../services/cartService';
import Loader from '../../components/Loader/Loader';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('personal');

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', address: '', dob: '', gender: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // Password State
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Address State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({ street: '', city: '', zip: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('shopease_token');
        if (!token || token === "undefined" || token === "null") {
          setLoading(false);
          return;
        }
        const profRes = await authService.getProfile();
        const orderRes = await orderService.getOrders();
        setProfile(profRes.data);
        setOrders(orderRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditToggle = () => {
    if (!isEditing) {
      setEditForm({
        name: profile?.name || profile?.username || user?.name || user?.username || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || profile?.phone_number || user?.phone || user?.phone_number || '',
        address: profile?.address || user?.address || '',
        dob: profile?.dob || user?.dob || '',
        gender: profile?.gender || user?.gender || ''
      });
      setImagePreview(null);
      setSelectedImage(null);
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('username', editForm.name);
      formData.append('email', editForm.email);
      formData.append('phone_number', editForm.phone);
      formData.append('phone', editForm.phone);
      formData.append('address', editForm.address);
      formData.append('dob', editForm.dob);
      formData.append('gender', editForm.gender);
      if (selectedImage) {
        formData.append('image', selectedImage);
        formData.append('profile_picture', selectedImage);
      }
      
      const userId = user?.id || 1;
      await authService.updateProfile(userId, formData);
      
      const profRes = await authService.getProfile();
      setProfile(profRes.data);
      if (updateUser) updateUser(profRes.data);
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile.';
      addToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const submitPasswordChange = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      addToast('Please fill all password fields', 'error');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    setChangingPassword(true);
    try {
      await authService.changePassword(passwordForm.oldPassword, passwordForm.newPassword);
      addToast('Password updated successfully!', 'success');
      setShowPasswordForm(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update password.';
      addToast(errMsg, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleNewAddressChange = (e) => {
    setNewAddressForm({ ...newAddressForm, [e.target.name]: e.target.value });
  };

  const handleSaveNewAddress = async () => {
    if (!newAddressForm.street || !newAddressForm.city || !newAddressForm.zip) {
      addToast('Please fill all address fields', 'error');
      return;
    }
    setSaving(true);
    try {
      const fullAddress = `${newAddressForm.street}, ${newAddressForm.city}, ${newAddressForm.zip}`;
      const formData = new FormData();
      formData.append('name', profile?.name || profile?.username || user?.name || '');
      formData.append('email', profile?.email || user?.email || '');
      formData.append('address', fullAddress);
      formData.append('phone', profile?.phone || profile?.phone_number || user?.phone || '');
      
      const userId = user?.id || 1;
      await authService.updateProfile(userId, formData);
      
      const profRes = await authService.getProfile();
      setProfile(profRes.data);
      if (updateUser) updateUser(profRes.data);
      
      setShowAddressForm(false);
      setNewAddressForm({ street: '', city: '', zip: '' });
      addToast('Address added successfully!', 'success');
    } catch(err) {
      addToast('Failed to save address', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!user) return <div className="container" style={{paddingTop: '6rem'}}><h2>Please login to view profile</h2></div>;

  const displayName = profile?.name || profile?.username || user?.name || user?.username || 'User';
  const displayEmail = profile?.email || user?.email || 'user@example.com';
  const displayPhone = profile?.phone || profile?.phone_number || user?.phone || user?.phone_number || 'N/A';
  const displayAddress = profile?.address || user?.address || 'N/A';
  const displayDob = profile?.dob || user?.dob || 'N/A';
  const displayGender = profile?.gender || user?.gender || 'N/A';
  const displayImage = imagePreview || profile?.image || profile?.avatar || null;

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <section className="profile-section active-section">
            <div className="section-header-inline">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button className="btn btn-outline edit-btn" onClick={handleEditToggle}>
                  <Edit2 size={16} /> Edit
                </button>
              ) : (
                <div className="edit-actions">
                  <button className="btn btn-outline cancel-btn" onClick={handleEditToggle} disabled={saving}>
                    Cancel
                  </button>
                  <button className="btn btn-primary save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : <><Save size={16} /> Save</>}
                  </button>
                </div>
              )}
            </div>
            
            <div className="avatar-section-wrapper mb-4">
              <label className="section-label">Profile Picture</label>
              <div className="avatar-edit-container mt-2">
                <div className={`user-avatar large ${isEditing ? 'editable' : ''}`} onClick={() => isEditing && fileInputRef.current?.click()}>
                  {displayImage ? (
                    <img src={displayImage} alt="Profile" className="avatar-img" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                  {isEditing && (
                    <div className="avatar-overlay">
                      <Camera size={24} />
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="avatar-instructions ms-3">
                    <p className="mb-1">Click the image to upload a new avatar.</p>
                    <p className="text-muted small">Max file size: 5MB. Formats: JPG, PNG.</p>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                {isEditing ? (
                  <input type="text" name="name" className="form-control" value={editForm.name} onChange={handleInputChange} />
                ) : (
                  <div className="info-val">{displayName}</div>
                )}
              </div>
              <div className="info-item">
                <label>Email Address</label>
                {isEditing ? (
                  <input type="email" name="email" className="form-control" value={editForm.email} onChange={handleInputChange} disabled />
                ) : (
                  <div className="info-val">{displayEmail}</div>
                )}
              </div>
              <div className="info-item">
                <label>Mobile Number</label>
                {isEditing ? (
                  <input type="tel" name="phone" className="form-control" value={editForm.phone} onChange={handleInputChange} />
                ) : (
                  <div className="info-val">{displayPhone}</div>
                )}
              </div>
              <div className="info-item">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input type="date" name="dob" className="form-control" value={editForm.dob} onChange={handleInputChange} />
                ) : (
                  <div className="info-val">{displayDob}</div>
                )}
              </div>
              <div className="info-item">
                <label>Gender</label>
                {isEditing ? (
                  <select name="gender" className="form-control" value={editForm.gender} onChange={handleInputChange}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <div className="info-val">{displayGender}</div>
                )}
              </div>
            </div>
          </section>
        );
      
      case 'addresses':
        return (
          <section className="profile-section active-section">
            <div className="section-header-inline">
              <h2>Manage Addresses</h2>
              {!showAddressForm && (
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddressForm(true)}>
                  <Map size={16} /> Add New
                </button>
              )}
            </div>
            
            {showAddressForm && (
              <div className="password-form-container mt-4 mb-4 pt-3 border-top w-100">
                <h4 className="mb-3">Add New Address</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Street Address</label>
                    <input type="text" name="street" value={newAddressForm.street} onChange={handleNewAddressChange} className="form-control" placeholder="123 Main St" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>City</label>
                    <input type="text" name="city" value={newAddressForm.city} onChange={handleNewAddressChange} className="form-control" placeholder="New York" />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Zip Code</label>
                    <input type="text" name="zip" value={newAddressForm.zip} onChange={handleNewAddressChange} className="form-control" placeholder="10001" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveNewAddress} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowAddressForm(false)} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {!showAddressForm && (
              <div className="addresses-list">
                <div className="address-card default">
                  <div className="address-badge">Default</div>
                  <div className="address-header">
                    <h3>{displayName}</h3>
                    <span className="address-type">Home</span>
                  </div>
                  <p className="address-body">{displayAddress}</p>
                  <p className="address-phone"><span className="fw-bold">Phone:</span> {displayPhone}</p>
                  <div className="address-actions">
                    <button className="btn-link" onClick={() => setShowAddressForm(true)}>Edit</button>
                    <button className="btn-link text-danger" onClick={() => addToast('Cannot remove default address', 'error')}>Remove</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        );

      case 'orders':
        return (
          <section className="profile-section active-section">
            <div className="section-header-inline">
              <h2>Order History</h2>
            </div>
            {orders.length === 0 ? (
              <div className="empty-state text-center py-5">
                <div className="empty-icon-wrapper mx-auto mb-3">
                  <Package size={48} className="text-muted" />
                </div>
                <h3>No Orders Yet</h3>
                <p className="text-muted mb-4">Looks like you haven't made any purchases.</p>
                <Link to="/products" className="btn btn-primary">Start Shopping</Link>
              </div>
            ) : (
              <div className="recent-orders">
                {orders.map(order => (
                  <div key={order.id} className="order-summary-card premium">
                    <div className="order-main">
                      <span className="order-id">Order #{order.id}</span>
                      <span className="order-date">{order.date}</span>
                    </div>
                    <div className="order-meta">
                      <span className="order-total">${order.total.toFixed(2)}</span>
                      <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case 'settings':
        return (
          <section className="profile-section active-section">
            <div className="section-header-inline">
              <h2>Account Settings</h2>
            </div>
            <div className="settings-grid">
              <div className="settings-card" style={showPasswordForm ? { gridColumn: '1 / -1', flexDirection: 'column' } : {}}>
                <div style={{ display: 'flex', width: '100%', gap: '1rem' }}>
                  <div className="settings-icon-wrapper bg-blue-100 text-blue-600"><Lock size={24} /></div>
                  <div className="settings-content" style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3>Change Password</h3>
                        <p>Update your password to keep your account secure.</p>
                      </div>
                      {!showPasswordForm && (
                        <button className="btn btn-outline btn-sm mt-3" onClick={() => setShowPasswordForm(true)}>Update Password</button>
                      )}
                    </div>
                  </div>
                </div>
                
                {showPasswordForm && (
                  <div className="password-form-container mt-4 pt-3 w-100" style={{ borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Current Password</label>
                        <input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordChange} className="form-control" />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>New Password</label>
                        <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordChange} className="form-control" />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '0.25rem', display: 'block' }}>Confirm Password</label>
                        <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordChange} className="form-control" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={submitPasswordChange} disabled={changingPassword}>
                        {changingPassword ? 'Saving...' : 'Save Password'}
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => setShowPasswordForm(false)} disabled={changingPassword}>
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {!showPasswordForm && (
                <>
                  <div className="settings-card">
                    <div className="settings-icon-wrapper bg-purple-100 text-purple-600"><Bell size={24} /></div>
                    <div className="settings-content">
                      <h3>Notifications</h3>
                      <p>Manage promotional emails and SMS alerts.</p>
                      <button className="btn btn-outline btn-sm mt-3" onClick={() => addToast('Notification settings coming soon', 'info')}>Manage</button>
                    </div>
                  </div>
                  <div className="settings-card">
                    <div className="settings-icon-wrapper bg-green-100 text-green-600"><Shield size={24} /></div>
                    <div className="settings-content">
                      <h3>Privacy & Data</h3>
                      <p>Control what data is shared with third parties.</p>
                      <button className="btn btn-outline btn-sm mt-3" onClick={() => addToast('Privacy settings coming soon', 'info')}>Review</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="profile-page-wrapper">
      <div className="profile-page container">
        <h1 className="page-title gradient-text-subtle">My Account</h1>
        
        <div className="profile-layout">
          {/* Sidebar Navigation */}
          <aside className="profile-sidebar">
            <div className="sidebar-user-brief">
              <div className="user-avatar small">
                {displayImage ? (
                  <img src={displayImage} alt="Profile" className="avatar-img" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="brief-info">
                <span className="greeting">Hello,</span>
                <span className="brief-name">{displayName}</span>
              </div>
            </div>
            
            <nav className="profile-nav-menu">
              <button className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => setActiveTab('personal')}>
                <User size={20} /> <span>Profile Information</span>
              </button>
              <button className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
                <MapPin size={20} /> <span>Manage Addresses</span>
              </button>
              <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                <Package size={20} /> <span>My Orders</span>
              </button>
              <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                <Settings size={20} /> <span>Account Settings</span>
              </button>
              <button className="nav-item text-danger mt-4 logout-btn" onClick={logout}>
                <LogOut size={20} /> <span>Logout</span>
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="profile-main-content">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
