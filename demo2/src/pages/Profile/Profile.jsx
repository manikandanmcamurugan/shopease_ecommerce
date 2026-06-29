import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Package, Edit2, LogOut, Camera, Save, X } from 'lucide-react';
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

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

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
      // Start editing
      setEditForm({
        name: profile?.name || profile?.username || user?.name || user?.username || '',
        email: profile?.email || user?.email || '',
        phone: profile?.phone || profile?.phone_number || user?.phone || user?.phone_number || '',
        address: profile?.address || user?.address || ''
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
      formData.append('username', editForm.name); // Often backends use username
      formData.append('email', editForm.email);
      formData.append('phone_number', editForm.phone); // Login used phone_number
      formData.append('phone', editForm.phone); // Just in case
      formData.append('address', editForm.address);
      if (selectedImage) {
        formData.append('image', selectedImage);
        formData.append('profile_picture', selectedImage); // Common alternative
      }
      
      const userId = user?.id || 1;
      await authService.updateProfile(userId, formData);
      
      // Refresh
      const profRes = await authService.getProfile();
      setProfile(profRes.data);
      if (updateUser) updateUser(profRes.data);
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Failed to update profile:', err);
      const errMsg = err.response?.data?.message || err.response?.data?.detail || 'Failed to update profile. Please check the fields and try again.';
      addToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!user) return <div className="container"><h2>Please login to view profile</h2></div>;

  const displayName = profile?.name || profile?.username || user?.name || user?.username || 'User';
  const displayEmail = profile?.email || user?.email || 'user@example.com';
  const displayPhone = profile?.phone || profile?.phone_number || user?.phone || user?.phone_number || 'N/A';
  const displayAddress = profile?.address || user?.address || 'N/A';
  const displayImage = imagePreview || profile?.image || profile?.avatar || null;

  return (
    <div className="profile-page container">
      <h1>Account Details</h1>
      
      <div className="profile-grid">
        <aside className="profile-sidebar">
          <div className="user-info-card">
            
            {/* Avatar Section */}
            <div 
              className={`user-avatar ${isEditing ? 'editable' : ''}`}
              onClick={() => isEditing && fileInputRef.current?.click()}
            >
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
            
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={handleFileChange} 
            />

            <h3>{displayName}</h3>
            <p>{displayEmail}</p>
            
            <button 
              className={`btn ${isEditing ? 'btn-outline' : 'btn-primary'} edit-profile`}
              onClick={handleEditToggle}
              disabled={saving}
            >
              {isEditing ? <><X size={16} /> Cancel</> : <><Edit2 size={16} /> Edit Profile</>}
            </button>
          </div>
          
          <nav className="profile-nav">
            <Link to="/profile" className="active"><User size={20} /> Personal Info</Link>
            <Link to="/orders"><Package size={20} /> My Orders</Link>
            <button onClick={logout} className="logout-link"><LogOut size={20} /> Logout</button>
          </nav>
        </aside>

        <main className="profile-content">
          <section className="profile-section">
            <div className="section-header-inline">
              <h2>Personal Information</h2>
              {isEditing && (
                <button className="btn btn-primary save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                </button>
              )}
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="name" 
                    className="form-control" 
                    value={editForm.name} 
                    onChange={handleInputChange} 
                  />
                ) : (
                  <div className="info-val">{displayName}</div>
                )}
              </div>
              <div className="info-item">
                <label>Email Address</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    name="email" 
                    className="form-control" 
                    value={editForm.email} 
                    onChange={handleInputChange} 
                  />
                ) : (
                  <div className="info-val">{displayEmail}</div>
                )}
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    name="phone" 
                    className="form-control" 
                    value={editForm.phone} 
                    onChange={handleInputChange} 
                  />
                ) : (
                  <div className="info-val">{displayPhone}</div>
                )}
              </div>
              <div className="info-item">
                <label>Default Address</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="address" 
                    className="form-control" 
                    value={editForm.address} 
                    onChange={handleInputChange} 
                  />
                ) : (
                  <div className="info-val">{displayAddress}</div>
                )}
              </div>
            </div>
          </section>

          <section className="profile-section">
            <div className="section-header-inline">
              <h2>Recent Orders</h2>
              <Link to="/orders" className="view-all">View All</Link>
            </div>
            <div className="recent-orders">
              {orders.slice(0, 3).map(order => (
                <div key={order.id} className="order-summary-card">
                  <div className="order-main">
                    <span className="order-id">Order {order.id}</span>
                    <span className="order-date">{order.date}</span>
                  </div>
                  <div className="order-meta">
                    <span className="order-total">${order.total.toFixed(2)}</span>
                    <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Profile;
