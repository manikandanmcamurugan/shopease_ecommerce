import React, { useState } from 'react';
import { ShoppingCart, Heart, X, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import './QuickViewModal.css';

const QuickViewModal = ({ product, onClose }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.variants?.[0]?.name || '');

  if (!product) return null;

  const activeVariantIndex = product?.variants?.findIndex(v => v.name === selectedColor) || 0;
  const mainImageStyle = product?.variants?.[activeVariantIndex]?.filter ? { filter: product.variants[activeVariantIndex].filter } : {};

  const handleBuyNow = () => {
    onClose();
    navigate('/checkout', { state: { buyNowItems: [{ ...product, quantity }] } });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="quickview-backdrop" onClick={handleBackdropClick}>
      <div className="quickview-modal">
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="quickview-content">
          <div className="quickview-image-section">
            <div className="quickview-main-image">
              <img 
                src={product.image} 
                alt={product.name} 
                style={mainImageStyle}
              />
            </div>
            
            {product.variants && product.variants.length > 0 && (
              <div className="quickview-variants">
                <h4 className="variant-label">Selected Color: <span>{selectedColor}</span></h4>
                <div className="variant-thumbnails">
                  {product.variants.map((variant, i) => (
                    <button 
                      key={i} 
                      className={`variant-thumb ${selectedColor === variant.name ? 'active' : ''} ${!variant.inStock ? 'out-of-stock' : ''}`}
                      onClick={() => variant.inStock && setSelectedColor(variant.name)}
                      disabled={!variant.inStock}
                    >
                      <img src={product.image} alt={variant.name} style={{ filter: variant.filter }} />
                      {!variant.inStock && <div className="out-of-stock-overlay">Out of stock</div>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="quickview-details">
            <span className="product-category">{product.category}</span>
            <h2 className="product-name">{product.name}</h2>
            
            
            
            <div className="product-price">₹{Number(product.price || 0).toFixed(2)}</div>
            
            <p className="product-desc">{product.description || "Premium quality product tailored to your needs. Experience the best in class features and design."}</p>
            
            <div className="quickview-actions">
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
              
              <div className="action-buttons-group">
                {isInCart(product.id) ? (
                  <button className="btn btn-primary add-cart-btn in-cart" onClick={() => { onClose(); navigate('/cart'); }}>
                    <ShoppingCart size={20} /> In Cart
                  </button>
                ) : (
                  <button className="btn btn-primary add-cart-btn" onClick={(e) => addToCart(product, quantity, e)}>
                    <ShoppingCart size={20} /> Add to Cart
                  </button>
                )}
                <button className="btn btn-secondary buy-now-btn" onClick={handleBuyNow}>
                  Buy Now
                </button>
                <button 
                  className={`btn btn-outline wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                  onClick={(e) => toggleWishlist(product, e)}
                  title="Add to Wishlist"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', padding: 0 }}
                >
                  <Heart 
                    style={{ 
                      width: '24px', 
                      height: '24px', 
                      stroke: isInWishlist(product.id) ? '#ef4444' : '#64748b',
                      fill: isInWishlist(product.id) ? '#ef4444' : 'none',
                      strokeWidth: 2
                    }}
                  />
                </button>
              </div>
            </div>
            
            <button className="view-full-details" onClick={() => { onClose(); navigate(`/products/${product.id}`); }}>
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
