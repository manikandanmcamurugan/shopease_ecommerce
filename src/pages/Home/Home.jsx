import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Banner from '../../components/Banner/Banner';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import productService from '../../services/productService';
import Loader from '../../components/Loader/Loader';
import Brands from '../../components/Brands/Brands';
import './Home.css';

// Removed staticBestSellers

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Categories Carousel refs and states
  const scrollRef = useRef(null);
  
  // Product Carousels refs
  const featuredRef = useRef(null);
  const newArrivalsRef = useRef(null);
  const bestSellersRef = useRef(null);

  const scrollProductCarousel = (ref, direction) => {
    if (ref.current && ref.current.children.length > 0) {
      let scrollAmount = 0;
      
      // Calculate exactly one item width + gap using the first two children
      if (ref.current.children.length > 1) {
        const itemPlusGap = ref.current.children[1].offsetLeft - ref.current.children[0].offsetLeft;
        scrollAmount = itemPlusGap * 2; // Move exactly two products
      } else {
        scrollAmount = ref.current.children[0].offsetWidth * 2;
      }
      
      // Fallback if calculations fail (e.g., offsetLeft is same due to weird styling)
      if (scrollAmount <= 0) scrollAmount = 600;

      const finalScroll = direction === 'left' ? -scrollAmount : scrollAmount;
      ref.current.scrollBy({ left: finalScroll, behavior: 'smooth' });
    }
  };

  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  // Refs for requestAnimationFrame loop
  const isHoveredRef = useRef(false);
  const isDraggingRef = useRef(false);
  const isInteractionPausedRef = useRef(false);
  const pauseTimeoutRef = useRef(null);

  // Keep refs synced with state
  useEffect(() => { isHoveredRef.current = isHovered; }, [isHovered]);
  useEffect(() => { isDraggingRef.current = isDragging; }, [isDragging]);

  // For infinite loop, we will duplicate categories
  const [displayCategories, setDisplayCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, categoryRes, featuredRes, newArrivalsRes] = await Promise.all([
          productService.getProducts(),
          productService.getCategories(),
          productService.getFeaturedProducts(),
          productService.getNewArrivals()
        ]);
        
        setProducts(productRes.data);
        setFeaturedProducts(featuredRes.data);
        setNewArrivals(newArrivalsRes.data);
        
        const fetchedCategories = categoryRes.data.filter(c => (c.name || c) !== 'All');
        setCategories(fetchedCategories);
        // Triplicate for infinite loop: [set1, set2, set3]
        setDisplayCategories([...fetchedCategories, ...fetchedCategories, ...fetchedCategories]);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Set initial scroll position to the middle set to allow left scrolling immediately
  useEffect(() => {
    if (displayCategories.length > 0 && scrollRef.current) {
      const singleSetWidth = scrollRef.current.scrollWidth / 3;
      scrollRef.current.style.scrollBehavior = 'auto'; // Ensure instant jump
      scrollRef.current.scrollLeft = singleSetWidth;
    }
  }, [displayCategories]);

  // Function to pause auto-scroll for a few seconds after user interaction
  const triggerInteractionPause = () => {
    isInteractionPausedRef.current = true;
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => {
      isInteractionPausedRef.current = false;
    }, 2500); // 2.5 seconds pause
  };

  // Smooth continuous auto-scroll functionality
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const smoothScroll = (time) => {
      if (scrollRef.current) {
        const deltaTime = time - lastTime;
        
        // Only scroll if not hovered, not dragging, and not paused by recent interaction
        if (!isHoveredRef.current && !isDraggingRef.current && !isInteractionPausedRef.current) {
          if (deltaTime > 16) { // Approx 60fps
            scrollRef.current.scrollLeft += 1; // Smooth speed
            lastTime = time;
          }
        } else {
          lastTime = time; // Keep time synced even when paused
        }
        
        // Check boundaries every frame to guarantee it never stops at the end
        // Even if user manually native smooth-scrolls, we must catch boundaries!
        const { scrollLeft, scrollWidth } = scrollRef.current;
        const singleSetWidth = scrollWidth / 3;
        
        if (scrollLeft >= singleSetWidth * 2) {
          scrollRef.current.style.scrollBehavior = 'auto'; // Disable smooth for instant teleport
          scrollRef.current.scrollLeft -= singleSetWidth;
        } else if (scrollLeft <= 0 && singleSetWidth > 0) {
          scrollRef.current.style.scrollBehavior = 'auto'; // Disable smooth for instant teleport
          scrollRef.current.scrollLeft += singleSetWidth;
        }
      }
      animationFrameId = requestAnimationFrame(smoothScroll);
    };

    animationFrameId = requestAnimationFrame(smoothScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, []); // Run once on mount

  // Mouse & Touch Handlers
  const handleInteractionStart = (clientX) => {
    setIsDragging(true);
    triggerInteractionPause();
    setStartX(clientX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };
  
  const handleInteractionMove = (clientX) => {
    if (!isDragging) return;
    triggerInteractionPause();
    const x = clientX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag speed multiplier
    scrollRef.current.style.scrollBehavior = 'auto'; // Ensure it follows cursor instantly
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };
  
  const handleInteractionEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      triggerInteractionPause();
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    handleInteractionEnd();
  };

  const scrollCategoryBtn = (direction) => {
    triggerInteractionPause();
    if (!scrollRef.current) return;
    
    // Calculate width of one item + gap (1.5rem = 24px)
    const firstChild = scrollRef.current.querySelector('.category-slide');
    const scrollAmount = firstChild ? firstChild.offsetWidth + 24 : 200;
    
    scrollRef.current.style.scrollBehavior = 'smooth';
    scrollRef.current.scrollBy({ 
      left: direction === 'left' ? -scrollAmount : scrollAmount, 
      behavior: 'smooth' 
    });
  };

  if (loading) return <Loader />;

  return (
    <div className="home-page">
      <Banner />

      {/* Categories Section */}
      <section className="section container">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Explore our wide range of categories</p>
        </div>
        <div 
          className="categories-carousel-container"
        >
          <button className="carousel-nav-btn left" onClick={() => scrollCategoryBtn('left')} aria-label="Scroll left">
            &#8249;
          </button>
          <div 
            className="categories-scroll-wrapper"
            ref={scrollRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseDown={(e) => handleInteractionStart(e.pageX)}
            onMouseMove={(e) => { e.preventDefault(); handleInteractionMove(e.pageX); }}
            onMouseUp={handleInteractionEnd}
            onTouchStart={(e) => handleInteractionStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleInteractionMove(e.touches[0].clientX)}
            onTouchEnd={handleInteractionEnd}
          >
            {displayCategories.map((category, index) => (
              <div key={`${category.name || category}-${index}`} className="category-slide">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
          <button className="carousel-nav-btn right" onClick={() => scrollCategoryBtn('right')} aria-label="Scroll right">
            &#8250;
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-alt">
        <div className="section container">
          <div className="section-header-centered" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '10px', paddingLeft: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ marginBottom: '0.8rem' }}>Featured Products</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Our handpicked selections for you</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }} className="d-none d-md-flex">
              <button onClick={() => scrollProductCarousel(featuredRef, 'left')} className="carousel-nav-btn-small">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollProductCarousel(featuredRef, 'right')} className="carousel-nav-btn-small">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="product-carousel-container">
            <div className="product-carousel-track" ref={featuredRef}>
              {(featuredProducts.length > 0 ? featuredProducts : products.filter(p => p.isFeatured)).slice(0, 8).map(product => (
                <div key={product.id} className="product-carousel-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section container">
        <div className="section-header-centered" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '10px', paddingLeft: '1rem' }}>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ marginBottom: '0.8rem' }}>New Arrivals</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fresh drops just for you</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }} className="d-none d-md-flex">
            <button onClick={() => scrollProductCarousel(newArrivalsRef, 'left')} className="carousel-nav-btn-small">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollProductCarousel(newArrivalsRef, 'right')} className="carousel-nav-btn-small">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div className="product-carousel-container">
          <div className="product-carousel-track" ref={newArrivalsRef}>
            {(newArrivals.length > 0 ? newArrivals : products.filter(p => p.isNewArrival)).slice(0, 8).map(product => (
              <div key={product.id} className="product-carousel-item">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-alt">
        <div className="section container">
          <div className="section-header-centered" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '10px', paddingLeft: '1rem' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ marginBottom: '0.8rem' }}>Best Sellers</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Most loved by our community</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }} className="d-none d-md-flex">
              <button onClick={() => scrollProductCarousel(bestSellersRef, 'left')} className="carousel-nav-btn-small">
                <ChevronLeft size={18} />
              </button>
              <button onClick={() => scrollProductCarousel(bestSellersRef, 'right')} className="carousel-nav-btn-small">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
          <div className="product-carousel-container">
            <div className="product-carousel-track" ref={bestSellersRef}>
              {products.filter(p => p.isBestSeller).slice(0, 8).map(product => (
                <div key={product.id} className="product-carousel-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Brands />

    </div>
  );
};

export default Home;
