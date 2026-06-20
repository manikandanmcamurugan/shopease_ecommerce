import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="product-card">
      <div className="product-image">
        <Link to={`/products/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <div className="product-actions">
          <button 
            className={`action-btn ${isInWishlist(product.id) ? 'active' : ''}`}
            onClick={() => toggleWishlist(product)}
            title="Add to Wishlist"
          >
            <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
          </button>
          <button 
            className="action-btn"
            onClick={() => addToCart(product)}
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
        <div className="product-rating">
          <Star size={14} fill="#f59e0b" color="#f59e0b" />
          <span>{product.rating}</span>
          <span className="reviews-count">({product.reviews})</span>
        </div>
        <div className="product-price">
          <span className="price">₹{Number(product.price || 0).toFixed(2)}</span>
          <div className="card-buttons">
            <button className="add-cart-btn" onClick={() => addToCart(product)}>
              Add to Cart
            </button>
            <button className="buy-now-btn" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
