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

        {/* Desktop & Mobile Search Bar (Center/Expanded) */}
        <div className={`nav-search ${showMobileSearch ? 'mobile-visible' : ''}`} id="desktop-search-right">
          <SearchBar onSearchSubmit={handleSearch} />
        </div>

        {/* Text Links (Right side of Search) */}
        <ul className="nav-links nav-text-links" style={{ marginLeft: 'auto', marginRight: '1.5rem' }}>
          <li className="nav-text-link"><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
          <li className="nav-text-link"><Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link></li>
        </ul>

        <ul className={`nav-links nav-icon-links ${isMenuOpen ? 'active' : ''}`} style={{ gap: '1.25rem' }}>
          {/* Mobile Search Icon */}
          <li className="nav-icon-link mobile-search-btn">
            <button onClick={() => setShowMobileSearch(!showMobileSearch)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              {showMobileSearch ? <X size={22} color="var(--text-main)" /> : <Search size={22} color="var(--text-main)" />}
            </button>
          </li>

          {user && (
            <>
              <li className="nav-icon-link">
                <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} id="nav-wishlist-icon" title="Wishlist">
                  <Heart size={24} />
                  {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
                </Link>
              </li>
              
              <li className="nav-icon-link">
                <Link to="/cart" onClick={() => setIsMenuOpen(false)} id="nav-cart-icon" title="Cart">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && <span className="badge">{cartCount}</span>}
                </Link>
              </li>

              <li className="nav-icon-link user-profile">
                <Link to="/profile" onClick={() => setIsMenuOpen(false)} title="My Account">
                  <div style={{
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--primary)', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {user?.name?.charAt(0) || user?.username?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                </Link>
                <div className="profile-dropdown name-only-dropdown">
                  <span className="nav-greeting">Hi! {user?.name?.split(' ')[0] || user?.username || 'User'}</span>
                </div>
              </li>

            </>
          )}

          {!user && (
            <li className="nav-icon-link nav-auth" style={{ margin: 0 }}>
              <Link to="/login" state={{ mode: 'login', timestamp: Date.now() }} className="btn btn-primary login-btn" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
