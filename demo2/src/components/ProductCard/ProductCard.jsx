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
  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Bypass the cart and checkout this specific item directly
    navigate('/checkout', { state: { buyNowItems: [{ ...product, quantity: 1 }] } });
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

        <div className="product-price">
          <span className="price">₹{Number(product.price || 0).toFixed(2)}</span>
          <div className="card-buttons">
            {isInCart(product.id) ? (
              <button className="add-cart-btn in-cart" onClick={() => navigate('/cart')}>
                In Cart
              </button>
            ) : (
              <button className="add-cart-btn" onClick={(e) => addToCart(product, 1, e)}>
                Add to Cart
              </button>
            )}
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
