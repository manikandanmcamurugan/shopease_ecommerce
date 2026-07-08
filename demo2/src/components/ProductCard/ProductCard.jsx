import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="product-card">
      <div className="product-image">
        <Link to={`/products/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <div className="product-actions">

          <button 
            className={`action-btn ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={(e) => toggleWishlist(product, e)}
            title="Add to Wishlist"
          >
            <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>
          <button 
            className="action-btn"
            onClick={(e) => addToCart(product, 1, e)}
            title="Add to Cart"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
        {product.isNewArrival && <span className="badge-new">New</span>}
        {product.isBestSeller && <span className="badge-best">Best Seller</span>}
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <Link to={`/products/${product.id}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>

        <div className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#eab308' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star key={star} size={14} fill={star <= Math.round(product.rating || 4) ? "currentColor" : "none"} />
          ))}
          <span className="reviews-count" style={{ marginLeft: '4px', fontSize: '0.75rem' }}>
            ({product.reviews || Math.floor(Math.random() * 500 + 10)})
          </span>
        </div>

        <div className="product-price">
          <span className="price">₹{Number(product.price || 0).toFixed(2)}</span>
        </div>
      </div>

    </div>
  );
};

export default ProductCard;
