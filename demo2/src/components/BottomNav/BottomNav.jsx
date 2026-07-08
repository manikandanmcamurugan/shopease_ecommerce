import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Grid, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

const BottomNav = () => {
  const { user } = useAuth();

  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} end>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/products" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <Grid size={24} />
        <span>Categories</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        {user ? (
          <div className="bottom-nav-avatar">
            {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
          </div>
        ) : (
          <User size={24} />
        )}
        <span>Account</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
