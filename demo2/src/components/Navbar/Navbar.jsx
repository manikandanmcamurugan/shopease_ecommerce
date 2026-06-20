import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X } from 'lucide-react';
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

        {/* Desktop Search Bar */}
        <div className="nav-search">
          <SearchBar onSearchSubmit={handleSearch} />
        </div>

        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
          <li><Link to="/products" onClick={() => setIsMenuOpen(false)}>Products</Link></li>
          <li><Link to="/about" onClick={() => setIsMenuOpen(false)}>About Us</Link></li>
          <li><Link to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</Link></li>
          
          <li className="nav-icon-link">
            <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
              <Heart size={22} />
              <span className="icon-label">Wishlist</span>
              {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
            </Link>
          </li>
          
          <li className="nav-icon-link">
            <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
              <ShoppingCart size={22} />
              <span className="icon-label">Cart</span>
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
          </li>

          <li className="nav-auth">
            {user ? (
              <div className="user-profile">
                <Link to="/profile" className="profile-link">
                  <User size={22} />
                  <span>{user.name}</span>
                </Link>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary login-btn" onClick={() => setIsMenuOpen(false)}>
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
