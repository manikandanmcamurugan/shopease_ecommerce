import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import productService from '../../services/productService';
import reviewService from '../../services/reviewService';
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
  const [reviewsList, setReviewsList] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const navigate = useNavigate();
  const carouselRef = useRef(null);
  const recommendedCarouselRef = useRef(null);

  const calculateScrollAmount = (ref) => {
    if (!ref.current || ref.current.children.length === 0) return 600;
    if (ref.current.children.length > 1) {
      return (ref.current.children[1].offsetLeft - ref.current.children[0].offsetLeft) * 2;
    }
    return ref.current.children[0].offsetWidth * 2;
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const amount = calculateScrollAmount(carouselRef);
      const scrollAmount = direction === 'left' ? -amount : amount;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRecommendedCarousel = (direction) => {
    if (recommendedCarouselRef.current) {
      const amount = calculateScrollAmount(recommendedCarouselRef);
      const scrollAmount = direction === 'left' ? -amount : amount;
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
    const productPayload = { ...product, price: displayPrice, selectedVariant: activeVariant };
    if (!user) {
      window.dispatchEvent(new CustomEvent('triggerLoginRedirect', {
        detail: {
          returnUrl: window.location.pathname,
          action: { type: 'BUY_NOW', payload: { product: productPayload, quantity } }
        }
      }));
      return;
    }
    // Bypass the cart and checkout this specific item directly
    navigate('/checkout', { state: { buyNowItems: [{ ...productPayload, quantity }] } });
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
      await reviewService.createReview({ product_id: id, rating: rateValue });
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
        
        const [relatedRes, recommendedRes] = await Promise.all([
          productService.getCustomersAlsoBought(id).catch(() => ({ data: [] })),
          productService.getRecommendations(id).catch(() => ({ data: [] }))
        ]);
        
        let related = relatedRes.data || [];
        let recommended = recommendedRes.data || [];
        
        // Fallbacks if backend doesn't return anything or threw a 500
        if (related.length === 0 || recommended.length === 0) {
          const allProdRes = await productService.getProducts().catch(() => ({ data: [] }));
          const allProds = allProdRes.data || [];
          if (related.length === 0) {
            related = allProds.filter(p => p.category === res.data.category && p.id !== res.data.id);
          }
          if (recommended.length === 0) {
            recommended = allProds.filter(p => p.id !== res.data.id && !related.some(r => r.id === p.id)).sort((a,b) => (b.rating || 0) - (a.rating || 0));
          }
        }
        
        setRelatedProducts(related.slice(0, 8));
        setRecommendedProducts(recommended.slice(0, 8));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
      
      // Fetch reviews
      setLoadingReviews(true);
      try {
        const reviewsRes = await reviewService.getReviews(id);
        setReviewsList(reviewsRes.data.results || reviewsRes.data || []);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // Backend doesn't have a reviews endpoint yet, so ignore silently
          console.log("Reviews endpoint not available on backend.");
        } else {
          console.error("Failed to fetch reviews:", error);
        }
      } finally {
        setLoadingReviews(false);
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

  // Dynamic reviews calculation
  const sortedReviews = [...reviewsList].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  const reviewsCount = sortedReviews.length;
  const averageRating = reviewsCount > 0 
    ? sortedReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviewsCount 
    : (product.rating || 0);

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
                  fill: star <= (hoverRating || userRating || Math.round(averageRating)) ? '#eab308' : 'none',
                  color: star <= (hoverRating || userRating || Math.round(averageRating)) ? '#eab308' : '#cbd5e1',
                  transition: 'color 0.2s, fill 0.2s'
                }}
              />
            ))}
            <span className="reviews-count" style={{ marginLeft: '8px', color: '#64748b', fontSize: '0.9rem' }}>
              ({reviewsCount} reviews)
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

      {/* Reviews Section */}
      <section className="reviews-section" style={{ marginTop: '3rem', padding: '2rem 0', borderTop: '1px solid #e2e8f0' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Customer Reviews</h2>
        {loadingReviews ? (
          <p>Loading reviews...</p>
        ) : sortedReviews.length > 0 ? (
          <div className="reviews-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {sortedReviews.map((review, idx) => (
              <div key={idx} className="review-card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={16}
                        fill={star <= (review.rating || 0) ? '#eab308' : 'none'}
                        color={star <= (review.rating || 0) ? '#eab308' : '#cbd5e1'}
                      />
                    ))}
                  </div>
                  <strong style={{ fontSize: '0.95rem' }}>{review.user_name || review.user || 'Anonymous User'}</strong>
                </div>
                {review.comment && (
                  <p style={{ margin: '0.5rem 0 0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {review.comment}
                  </p>
                )}
                {review.created_at && (
                  <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#64748b' }}>No reviews yet. Be the first to rate this product!</p>
        )}
      </section>

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
