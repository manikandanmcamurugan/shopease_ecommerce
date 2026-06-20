import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-empty container">
        <Heart size={80} color="#e2e8f0" />
        <h2>Your wishlist is empty</h2>
        <p>Save items you like to buy them later.</p>
        <Link to="/products" className="btn btn-primary">Discover Products</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page container">
      <h1>My Wishlist</h1>
      
      <div className="wishlist-grid grid grid-4">
        {wishlist.map(product => (
          <div key={product.id} className="wishlist-item card">
            <div className="wishlist-image">
              <img src={product.image} alt={product.name} />
              <button className="remove-wishlist" onClick={() => removeFromWishlist(product.id)}>
                <Trash2 size={18} />
              </button>
            </div>
            <div className="wishlist-info">
              <Link to={`/products/${product.id}`}><h3>{product.name}</h3></Link>
              <p className="wishlist-price">₹{product.price.toFixed(2)}</p>
              <button className="btn btn-primary move-to-cart" onClick={() => {
                addToCart(product);
                removeFromWishlist(product.id);
              }}>
                <ShoppingCart size={18} /> Move to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
