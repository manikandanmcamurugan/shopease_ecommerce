import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import productService from '../../services/productService';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader/Loader';
import ProductCard from '../../components/ProductCard/ProductCard';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const recommendedCarouselRef = useRef(null);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRecommendedCarousel = (direction) => {
    if (recommendedCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      recommendedCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Rating State
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name || 'Product',
          text: `Check out ${product?.name} on our store!`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product link copied to clipboard!');
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleBuyNow = () => {
    // Bypass the cart and checkout this specific item directly
    navigate('/checkout', { state: { buyNowItems: [{ ...product, quantity }] } });
  };

  const handleRateProduct = async (rateValue) => {
    if (!user) {
      setRatingMessage("Please login to rate this product.");
      return;
    }
    setUserRating(rateValue);
    setIsSubmittingRating(true);
    setRatingMessage('');
    try {
      await productService.rateProduct(id, rateValue);
      setRatingMessage("Thanks for your rating!");
    } catch (error) {
      setRatingMessage("Failed to submit rating.");
      console.error(error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await productService.getProductById(id);
        setProduct(res.data);
        setActiveImage(res.data.image);
        
        const variants = res.data.variants || [];
        const colors = Array.from(new Set(variants.filter(v => v.color).map(v => v.color)));
        const sizes = Array.from(new Set(variants.filter(v => v.size).map(v => v.size)));
        
        if (colors.length > 0) setSelectedColor(colors[0]);
        if (sizes.length > 0) setSelectedSize(sizes[0]);
        
        const allProdRes = await productService.getProducts();
        const related = allProdRes.data.filter(p => p.category === res.data.category && p.id !== res.data.id).slice(0, 8);
        setRelatedProducts(related);
        
        const recommended = allProdRes.data.filter(p => p.id !== res.data.id && !related.some(r => r.id === p.id)).sort((a,b) => b.rating - a.rating).slice(0, 8);
        setRecommendedProducts(recommended);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <Loader />;
  if (!product) return <div className="container"><h2>Product not found</h2></div>;

  const variants = product.variants || [];
  const availableColors = Array.from(new Set(variants.filter(v => v.color).map(v => v.color)));
  const availableSizes = Array.from(new Set(variants.filter(v => v.size).map(v => v.size)));

  const activeVariant = variants.find(v => 
    (availableColors.length === 0 || v.color === selectedColor) && 
    (availableSizes.length === 0 || v.size === selectedSize)
  );

  const displayPrice = activeVariant ? Number(product.price) + Number(activeVariant.additional_price || 0) : Number(product.price);
  const displayStock = activeVariant ? activeVariant.stock : product.stock;
  const inStock = displayStock > 0;
  
  const imagesList = product.images?.length > 0 ? product.images.filter(Boolean).map(img => img.image || img) : [product.image].filter(Boolean);

  return (
    <div className="product-details-page container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.name}</span>
      </div>

      <div className="details-grid">
        <div className="image-section">
          <div className="main-image-container">
            <img src={activeImage || imagesList[0]} alt={product.name} className="main-image" />
            <div className="image-actions">
              <button 
                className={`image-action-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                onClick={(e) => toggleWishlist(product, e)}
                title="Add to Wishlist"
              >
                <Heart 
                  size={22}
                  stroke={isInWishlist(product.id) ? '#ef4444' : 'currentColor'}
                  fill={isInWishlist(product.id) ? '#ef4444' : 'none'} 
                  strokeWidth={2}
                />
              </button>
              <button 
                className="image-action-btn"
                onClick={handleShare}
                title="Share Product"
              >
                <Send size={22} strokeWidth={2} />
              </button>
            </div>
          </div>
          {imagesList.length > 1 && (
            <div className="thumbnail-gallery">
              {imagesList.map((img, i) => (
                <div 
                  key={i} 
                  className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt={`${product.name} ${i}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="info-section">
          <span className="details-category">{product.category}</span>
          <h1 className="details-name">{product.name}</h1>
          
          <div className="product-rating" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '1rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={20}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleRateProduct(star)}
                style={{
                  cursor: 'pointer',
                  fill: star <= (hoverRating || userRating || Math.round(product.rating)) ? '#eab308' : 'none',
                  color: star <= (hoverRating || userRating || Math.round(product.rating)) ? '#eab308' : '#cbd5e1',
                  transition: 'color 0.2s, fill 0.2s'
                }}
              />
            ))}
            <span className="reviews-count" style={{ marginLeft: '8px', color: '#64748b', fontSize: '0.9rem' }}>
              ({product.reviews} reviews)
            </span>
          </div>
          {ratingMessage && <p className="rating-message" style={{ color: '#10b981', fontSize: '0.9rem', marginTop: '-0.5rem', marginBottom: '1rem' }}>{ratingMessage}</p>}
          
          <p className="details-price">₹{displayPrice.toFixed(2)}</p>
          <p className="details-desc">{product.description}</p>
          
          <div className="details-stock" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <p style={{ color: inStock ? '#16a34a' : '#ef4444', fontWeight: '500', margin: 0 }}>
              {inStock ? `In Stock (${displayStock} available)` : 'Out of Stock'}
            </p>
            {!inStock && (
              <button 
                className="btn btn-outline" 
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', borderRadius: '4px' }}
                onClick={() => alert("You will be notified when this product is back in stock!")}
              >
                Notify Me
              </button>
            )}
          </div>

          {(availableColors.length > 0 || availableSizes.length > 0) && (
            <div className="product-variants-selectors">
              {availableColors.length > 0 && (
                <div className="variant-group">
                  <h4>Color: <span>{selectedColor}</span></h4>
                  <div className="variant-options">
                    {availableColors.map(color => (
                      <button 
                        key={color} 
                        className={`variant-btn color-btn ${selectedColor === color ? 'active' : ''}`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {availableSizes.length > 0 && (
                <div className="variant-group">
                  <h4>Size: <span>{selectedSize}</span></h4>
                  <div className="variant-options">
                    {availableSizes.map(size => (
                      <button 
                        key={size} 
                        className={`variant-btn size-btn ${selectedSize === size ? 'active' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="details-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            
            {isInCart(product.id) ? (
              <button className="btn btn-primary add-to-cart in-cart" onClick={() => navigate('/cart')} disabled={!inStock}>
                <ShoppingCart size={20} /> In Cart
              </button>
            ) : (
              <button className="btn btn-primary add-to-cart" onClick={(e) => addToCart({...product, price: displayPrice, selectedVariant: activeVariant}, quantity, e)} disabled={!inStock}>
                <ShoppingCart size={20} /> Add to Cart
              </button>
            )}
            
            <button className="btn btn-secondary buy-now-btn-detail" onClick={handleBuyNow} disabled={!inStock}>
              Buy Now
            </button>
          </div>

          <div className="features-grid">
            <div className="feature-item">
              <Truck size={24} />
              <div>
                <h4>Free Shipping</h4>
                <p>On orders over ₹100</p>
              </div>
            </div>
            <div className="feature-item">
              <RotateCcw size={24} />
              <div>
                <h4>30 Days Return</h4>
                <p>Easy returns & exchanges</p>
              </div>
            </div>
            <div className="feature-item">
              <ShieldCheck size={24} />
              <div>
                <h4>Secure Payment</h4>
                <p>100% secure payment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="related-section">
          <div className="section-header-inline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: 0 }}>Related Products</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }} className="d-none d-md-flex">
              <button onClick={() => scrollCarousel('left')} className="carousel-nav-btn-small">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollCarousel('right')} className="carousel-nav-btn-small">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="product-carousel-container">
            <div className="product-carousel-track" ref={carouselRef}>
              {relatedProducts.map(p => (
                <div key={p.id} className="product-carousel-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {recommendedProducts.length > 0 && (
        <section className="related-section" style={{ paddingTop: '2rem', borderTop: 'none' }}>
          <div className="section-header-inline" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: 0 }}>You May Also Like</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }} className="d-none d-md-flex">
              <button onClick={() => scrollRecommendedCarousel('left')} className="carousel-nav-btn-small">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollRecommendedCarousel('right')} className="carousel-nav-btn-small">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="product-carousel-container">
            <div className="product-carousel-track" ref={recommendedCarouselRef}>
              {recommendedProducts.map(p => (
                <div key={p.id} className="product-carousel-item">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
