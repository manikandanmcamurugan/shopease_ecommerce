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
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [activeImage, setActiveImage] = useState(product?.images?.[0] || product?.image);

  const variants = product?.variants || [];
  const availableColors = Array.from(new Set(variants.filter(v => v.color).map(v => v.color)));
  const availableSizes = Array.from(new Set(variants.filter(v => v.size).map(v => v.size)));

  React.useEffect(() => {
    if (availableColors.length > 0 && !selectedColor) setSelectedColor(availableColors[0]);
    if (availableSizes.length > 0 && !selectedSize) setSelectedSize(availableSizes[0]);
  }, [availableColors, availableSizes, selectedColor, selectedSize]);

  React.useEffect(() => {
    if (product) {
      setActiveImage(product.images?.[0] || product.image);
    }
  }, [product]);

  if (!product) return null;

  const activeVariant = variants.find(v => 
    (availableColors.length === 0 || v.color === selectedColor) && 
    (availableSizes.length === 0 || v.size === selectedSize)
  );
  
  const displayPrice = activeVariant ? Number(product.price) + Number(activeVariant.additional_price || 0) : Number(product.price);
  const mainImageStyle = activeVariant?.filter ? { filter: activeVariant.filter } : {};

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
                src={activeImage} 
                alt={product.name} 
                style={mainImageStyle}
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="quickview-variants">
                <div className="variant-thumbnails" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {product.images.map((img, i) => (
                    <button 
                      key={i} 
                      className={`variant-thumb ${activeImage === img ? 'active' : ''}`}
                      onClick={() => setActiveImage(img)}
                      style={{ border: activeImage === img ? '2px solid #3b82f6' : '1px solid #e5e7eb', borderRadius: '4px', padding: '2px', cursor: 'pointer', background: 'transparent' }}
                    >
                      <img src={img} alt={`Angle ${i + 1}`} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="quickview-details">
            <span className="product-category">{product.category}</span>
            <h2 className="product-name">{product.name}</h2>
            
            
            
            <div className="product-price">₹{Number(displayPrice || 0).toFixed(2)}</div>
            
            <p className="product-desc">{product.description || "Premium quality product tailored to your needs. Experience the best in class features and design."}</p>
            
            {(availableColors.length > 0 || availableSizes.length > 0) && (
              <div className="quickview-variants-selectors" style={{ marginBottom: '1.5rem' }}>
                {availableColors.length > 0 && (
                  <div className="variant-group" style={{ marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Color: <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>{selectedColor}</span></h4>
                    <div className="variant-options" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {availableColors.map(color => (
                        <button 
                          key={color} 
                          className={`variant-btn color-btn ${selectedColor === color ? 'active' : ''}`}
                          onClick={() => setSelectedColor(color)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            border: `1px solid ${selectedColor === color ? 'var(--primary-color)' : 'var(--border)'}`,
                            background: selectedColor === color ? 'var(--primary-light)' : 'transparent',
                            color: selectedColor === color ? 'var(--primary-color)' : 'var(--text-main)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {availableSizes.length > 0 && (
                  <div className="variant-group">
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Size: <span style={{ fontWeight: 'normal', color: 'var(--text-muted)' }}>{selectedSize}</span></h4>
                    <div className="variant-options" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {availableSizes.map(size => (
                        <button 
                          key={size} 
                          className={`variant-btn size-btn ${selectedSize === size ? 'active' : ''}`}
                          onClick={() => setSelectedSize(size)}
                          style={{
                            padding: '0.25rem 0.75rem',
                            border: `1px solid ${selectedSize === size ? 'var(--primary-color)' : 'var(--border)'}`,
                            background: selectedSize === size ? 'var(--primary-light)' : 'transparent',
                            color: selectedSize === size ? 'var(--primary-color)' : 'var(--text-main)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
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
                  <button className="btn btn-primary add-cart-btn" onClick={(e) => addToCart({...product, price: displayPrice, selectedVariant: activeVariant}, quantity, e)}>
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
