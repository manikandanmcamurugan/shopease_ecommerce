import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, LogOut } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import SearchBar from '../SearchBar/SearchBar';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleSearch = (query) => {
    if (query.trim()) {
      navigate(`/products?search=${query}`);
      setIsMenuOpen(false);
    }
  };

  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          Shop<span>Ease</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop & Mobile Search Bar */}
        <div className={`nav-search ${showMobileSearch ? 'mobile-visible' : ''}`}>
          <SearchBar onSearchSubmit={handleSearch} />
        </div>
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li className="nav-text-link"><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
          <li className="nav-text-link"><Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link></li>


          {/* Mobile Search Icon */}
          <li className="nav-icon-link mobile-search-btn">
            <button onClick={() => setShowMobileSearch(!showMobileSearch)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {showMobileSearch ? <X size={22} color="var(--text-main)" /> : <Search size={22} color="var(--text-main)" />}
            </button>
          </li>

          <li className="nav-icon-link">
            <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} id="nav-wishlist-icon">
              <Heart size={22} />
              <span className="icon-label">Wishlist</span>
              {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
            </Link>
          </li>
          
          <li className="nav-icon-link">
            <Link to="/cart" onClick={() => setIsMenuOpen(false)} id="nav-cart-icon">
              <ShoppingCart size={22} />
              <span className="icon-label">Cart</span>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
          </li>

          <li className="nav-auth">
            {user ? (
              <div className="user-profile-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="user-profile">
                  <Link to="/profile" className="profile-link" onClick={() => setIsMenuOpen(false)}>
                    <div className="nav-avatar">
                      {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
                    </div>
                  </Link>
                  <div className="profile-dropdown name-only-dropdown">
                    <span className="nav-greeting">Hi! {user?.name || user?.username || 'User'}</span>
                  </div>
                </div>
                <div className="nav-divider"></div>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="logout-btn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" state={{ mode: 'login', timestamp: Date.now() }} className="btn btn-primary login-btn" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
