import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const [activeImage, setActiveImage] = useState(null);
  const navigate = useNavigate();

  // Rating State
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/checkout');
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
        
        const allProdRes = await productService.getProducts();
        setRelatedProducts(allProdRes.data.filter(p => p.category === res.data.category && p.id !== res.data.id).slice(0, 4));
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

  return (
    <div className="product-details-page container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/products">Products</Link> / <span>{product.name}</span>
      </div>

      <div className="details-grid">
        <div className="image-section">
          <div className="main-image-container">
            <img src={activeImage} alt={product.name} className="main-image" />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="thumbnail-gallery">
              {product.images.map((img, i) => (
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
          
          <div className="details-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={18} fill={i < Math.floor(product.rating) ? "#f59e0b" : "none"} color="#f59e0b" />
              ))}
            </div>
            <span className="rating-value">{product.rating}</span>
            <span className="review-count">({product.reviews} reviews)</span>
          </div>

          <p className="details-price">₹{product.price.toFixed(2)}</p>
          <p className="details-desc">{product.description}</p>

          <div className="user-rating-section" style={{ marginTop: '20px', marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '10px' }}>Rate this product:</h4>
            {user ? (
              <div className="interactive-stars" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {[...Array(5)].map((_, i) => {
                  const starValue = i + 1;
                  return (
                    <Star 
                      key={i} 
                      size={24} 
                      onMouseEnter={() => !isSubmittingRating && setHoverRating(starValue)}
                      onMouseLeave={() => !isSubmittingRating && setHoverRating(0)}
                      onClick={() => !isSubmittingRating && handleRateProduct(starValue)}
                      fill={starValue <= (hoverRating || userRating) ? "#f59e0b" : "none"} 
                      color={starValue <= (hoverRating || userRating) ? "#f59e0b" : "#ccc"} 
                      style={{ cursor: isSubmittingRating ? 'default' : 'pointer', transition: 'color 0.2s' }}
                    />
                  );
                })}
                {ratingMessage && <span style={{ marginLeft: '10px', fontSize: '14px', color: ratingMessage.includes('Thanks') ? '#10b981' : '#ef4444' }}>{ratingMessage}</span>}
              </div>
            ) : (
              <p className="login-prompt" style={{ fontSize: '14px', color: '#6b7280' }}>Please <Link to="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>login</Link> to rate this product.</p>
            )}
          </div>

          <div className="details-actions">
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            
            <button className="btn btn-primary add-to-cart" onClick={() => addToCart(product, quantity)}>
              <ShoppingCart size={20} /> Add to Cart
            </button>
            
            <button className="btn btn-secondary buy-now-btn-detail" onClick={handleBuyNow}>
              Buy Now
            </button>
            
            <button 
              className={`btn btn-outline wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
            >
              <Heart size={20} fill={isInWishlist(product.id) ? "currentColor" : "none"} />
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
          <h2>Related Products</h2>
          <div className="grid grid-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetails;
