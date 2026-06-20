import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Package, Edit2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import { orderService } from '../../services/cartService';
import Loader from '../../components/Loader/Loader';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  if (loading) return <Loader />;
  if (!user) return <div className="container"><h2>Please login to view profile</h2></div>;

  return (
    <div className="profile-page container">
      <h1>Account Details</h1>
      
      <div className="profile-grid">
        <aside className="profile-sidebar">
          <div className="user-info-card">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3>{user?.name || 'User'}</h3>
            <p>{user?.email || 'user@example.com'}</p>
            <button className="btn btn-primary edit-profile">
              <Edit2 size={16} /> Edit Profile
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
            <h2>Personal Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <div className="info-val">{profile?.name || user?.name || 'N/A'}</div>
              </div>
              <div className="info-item">
                <label>Email Address</label>
                <div className="info-val">{profile?.email || user?.email || 'N/A'}</div>
              </div>
              <div className="info-item">
                <label>Phone Number</label>
                <div className="info-val">{profile?.phone || 'N/A'}</div>
              </div>
              <div className="info-item">
                <label>Default Address</label>
                <div className="info-val">{profile?.address || 'N/A'}</div>
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
