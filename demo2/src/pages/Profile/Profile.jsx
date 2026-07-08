import React, { useState, useEffect, useRef } from 'react';
import { User, MapPin, Package, Settings, LogOut, Camera, Save, Edit2, Lock, Bell, Shield, Map, ChevronRight, ArrowLeft } from 'lucide-react';
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
  const [mobileView, setMobileView] = useState('menu');

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
  const [addresses, setAddresses] = useState([]);
  const [editingId, setEditingId] = useState(null);

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
    const savedAddrs = JSON.parse(localStorage.getItem('shopease_addresses')) || [];
    setAddresses(savedAddrs);
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

    if (editingId === 'default') {
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
        setEditingId(null);
        addToast('Default address updated successfully!', 'success');
      } catch(err) {
        addToast('Failed to update default address', 'error');
      } finally {
        setSaving(false);
      }
      return;
    }

    let updated;
    if (editingId) {
      updated = addresses.map(a => a.id === editingId ? { ...a, address: newAddressForm.street, city: newAddressForm.city, zip: newAddressForm.zip } : a);
    } else {
      const newAddr = {
        id: Date.now().toString(),
        address: newAddressForm.street,
        city: newAddressForm.city,
        zip: newAddressForm.zip,
        firstName: profile?.name || profile?.username || user?.name || '',
        lastName: '',
        phone: profile?.phone || profile?.phone_number || user?.phone || '',
        isDefault: false
      };
      updated = [...addresses, newAddr];
    }
    
    setAddresses(updated);
    localStorage.setItem('shopease_addresses', JSON.stringify(updated));
    setShowAddressForm(false);
    setNewAddressForm({ street: '', city: '', zip: '' });
    setEditingId(null);
    addToast(editingId ? 'Address updated successfully!' : 'Address added successfully!', 'success');
  };

  const handleEditAddress = (addr) => {
    setNewAddressForm({
      street: addr.address || '',
      city: addr.city || '',
      zip: addr.zip || ''
    });
    setEditingId(addr.id);
    setShowAddressForm(true);
  };

  const handleEditDefaultAddress = () => {
    const addrStr = profile?.address || user?.address || '';
    const parts = addrStr.split(',').map(s => s.trim());
    setNewAddressForm({
      street: parts[0] || '',
      city: parts[1] || '',
      zip: parts[2] || ''
    });
    setEditingId('default');
    setShowAddressForm(true);
  };

  const handleRemoveAddress = (id) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem('shopease_addresses', JSON.stringify(updated));
    addToast('Address removed', 'success');
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
          <section className="profile-section active-section" style={{ background: 'transparent', padding: 0, boxShadow: 'none', border: 'none' }}>
            <div className="section-header-inline d-md-none" style={{ background: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="mobile-back-btn" onClick={() => setMobileView('menu')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <ArrowLeft size={20} />
                </button>
                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Personal Information</h2>
              </div>
            </div>

            <div className="profile-card avatar-card">
              <div className="avatar-card-left">
                <div className="user-avatar large" style={{ width: '70px', height: '70px', fontSize: '2rem' }}>
                  {displayImage ? (
                    <img src={displayImage} alt="Profile" className="avatar-img" />
                  ) : (
                    displayName.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="avatar-card-info">
                  <h3>Upload a New Photo</h3>
                  <p>{selectedImage ? selectedImage.name : 'Profile-pic.jpg'}</p>
                </div>
              </div>
              <div className="avatar-card-right">
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleFileChange} />
                <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                  Update
                </button>
              </div>
            </div>

            <div className="profile-card form-card">
              <h3 className="form-card-title">Change User Information here</h3>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name*</label>
                  <input type="text" name="name" className="form-control" value={editForm.name || displayName} onChange={handleInputChange} />
                </div>
                <div className="info-item">
                  <label>Email Address*</label>
                  <input type="email" name="email" className="form-control" value={editForm.email || displayEmail} onChange={handleInputChange} disabled />
                </div>
                <div className="info-item" style={{ gridColumn: '1 / -1' }}>
                  <label>Address*</label>
                  <input type="text" name="address" className="form-control" value={editForm.address || displayAddress} onChange={handleInputChange} />
                </div>
                <div className="info-item">
                  <label>City</label>
                  <input type="text" name="city" className="form-control" placeholder="City" />
                </div>
                <div className="info-item">
                  <label>State/Province</label>
                  <input type="text" name="state" className="form-control" placeholder="State" />
                </div>
                <div className="info-item">
                  <label>Zip Code</label>
                  <input type="text" name="zip" className="form-control" placeholder="Zip Code" />
                </div>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <button className="btn btn-primary" style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', fontWeight: '600' }} onClick={handleSave} disabled={saving}>
                  {saving ? 'Updating...' : 'Update Information'}
                </button>
              </div>
            </div>
          </section>
        );
      
      case 'addresses':
        return (
          <section className="profile-section active-section">
            <div className="section-header-inline">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="mobile-back-btn d-md-none" onClick={() => setMobileView('menu')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <ArrowLeft size={20} />
                </button>
                <h2>Manage Addresses</h2>
              </div>
              {!showAddressForm && (
                <button className="btn btn-primary btn-sm" onClick={() => {
                  setNewAddressForm({ street: '', city: '', zip: '' });
                  setEditingId(null);
                  setShowAddressForm(true);
                }}>
                  <Map size={16} /> Add New
                </button>
              )}
            </div>
            
            {showAddressForm && (
              <div className="password-form-container mt-4 mb-4 pt-3 border-top w-100">
                <h4 className="mb-3">{editingId ? 'Edit Address' : 'Add New Address'}</h4>
                <div className="address-form-grid">
                  <div className="address-form-item full-width">
                    <label>Street Address</label>
                    <input type="text" name="street" value={newAddressForm.street} onChange={handleNewAddressChange} className="form-control" placeholder="123 Main St" />
                  </div>
                  <div className="address-form-item">
                    <label>City</label>
                    <input type="text" name="city" value={newAddressForm.city} onChange={handleNewAddressChange} className="form-control" placeholder="New York" />
                  </div>
                  <div className="address-form-item">
                    <label>Zip Code</label>
                    <input type="text" name="zip" value={newAddressForm.zip} onChange={handleNewAddressChange} className="form-control" placeholder="10001" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button className="btn btn-primary btn-sm" onClick={handleSaveNewAddress} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => { setShowAddressForm(false); setEditingId(null); }} disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {!showAddressForm && (
              <div className="addresses-list">
                <div className="address-card default">
                  <div className="address-content-wrap">
                    <div className="address-header">
                      <h3>{displayName}</h3>
                      <span className="address-type">Home</span>
                    </div>
                    <p className="address-body">{displayAddress}</p>
                    <p className="address-phone"><span className="fw-bold">Phone:</span> {displayPhone}</p>
                  </div>
                  <div className="address-right-panel">
                    <div className="address-actions">
                      <button className="btn-link" onClick={handleEditDefaultAddress}>Edit</button>
                      <button className="btn-link text-danger" onClick={() => addToast('Cannot remove default address', 'error')}>Remove</button>
                    </div>
                  </div>
                </div>
                {addresses.map(addr => (
                  <div className="address-card" key={addr.id}>
                    <div className="address-content-wrap">
                      <div className="address-header">
                        <h3>{addr.firstName} {addr.lastName}</h3>
                        <span className="address-type">Other</span>
                      </div>
                      <p className="address-body">{addr.address}, {addr.city}, {addr.zip}</p>
                      <p className="address-phone"><span className="fw-bold">Phone:</span> {addr.phone}</p>
                    </div>
                    <div className="address-right-panel">
                      <div className="address-actions">
                        <button className="btn-link" onClick={() => handleEditAddress(addr)}>Edit</button>
                        <button className="btn-link text-danger" onClick={() => handleRemoveAddress(addr.id)}>Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );

      case 'orders':
        return (
          <section className="profile-section active-section">
            <div className="section-header-inline">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="mobile-back-btn d-md-none" onClick={() => setMobileView('menu')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <ArrowLeft size={20} />
                </button>
                <h2>Order History</h2>
              </div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="mobile-back-btn d-md-none" onClick={() => setMobileView('menu')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
                  <ArrowLeft size={20} />
                </button>
                <h2>Account Settings</h2>
              </div>
            </div>
            <div className="settings-grid">
              <div className="settings-card" style={showPasswordForm ? { gridColumn: '1 / -1' } : {}}>
                <div className="settings-icon-wrapper bg-blue-100 text-blue-600"><Lock size={24} /></div>
                <div className="settings-content">
                  <h3>Change Password</h3>
                  <p>Update your password to keep your account secure.</p>
                  {!showPasswordForm && (
                    <button className="btn btn-outline btn-sm mt-3" onClick={() => setShowPasswordForm(true)}>Update Password</button>
                  )}
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
        <h1 className="page-title gradient-text-subtle d-none d-md-block">My Account</h1>
        
        <div className={`profile-layout mobile-${mobileView}`}>
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
                <span className="brief-email" style={{ fontSize: '0.8rem', color: '#64748b' }}>{displayEmail}</span>
              </div>
            </div>
            
            <nav className="profile-nav-menu">
              <button className={`nav-item ${activeTab === 'personal' ? 'active' : ''}`} onClick={() => { setActiveTab('personal'); setMobileView('content'); }}>
                <div className="nav-item-content"><User size={20} /> <span>Profile Information</span></div>
                <ChevronRight size={18} className="nav-chevron d-md-none" />
              </button>
              <button className={`nav-item ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => { setActiveTab('addresses'); setMobileView('content'); }}>
                <div className="nav-item-content"><MapPin size={20} /> <span>Manage Addresses</span></div>
                <ChevronRight size={18} className="nav-chevron d-md-none" />
              </button>
              <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => { setActiveTab('orders'); setMobileView('content'); }}>
                <div className="nav-item-content"><Package size={20} /> <span>My Orders</span></div>
                <ChevronRight size={18} className="nav-chevron d-md-none" />
              </button>
              <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileView('content'); }}>
                <div className="nav-item-content"><Settings size={20} /> <span>Account Settings</span></div>
                <ChevronRight size={18} className="nav-chevron d-md-none" />
              </button>
              <button className="nav-item text-danger mt-4 logout-btn" onClick={logout}>
                <div className="nav-item-content"><LogOut size={20} /> <span>Logout</span></div>
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
