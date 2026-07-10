import React, { useEffect, useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Banner from '../../components/Banner/Banner';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import productService from '../../services/productService';
import Loader from '../../components/Loader/Loader';
import Brands from '../../components/Brands/Brands';
import './Home.css';

const staticBestSellers = [
  {
    id: 'static-bs-1',
    name: 'Wireless Noise-Cancelling Headphones',
    price: 299.99,
    category: 'Electronics',
    brand: 'Sony',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    reviews: 1245,
    discount: 15,
    hasOffer: true,
    isBestSeller: true
  },
  {
    id: 'static-bs-2',
    name: 'Smart Fitness Watch Series 7',
    price: 399.00,
    category: 'Electronics',
    brand: 'Apple',
    image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviews: 3421,
    discount: 0,
    hasOffer: false,
    isBestSeller: true
  },
  {
    id: 'static-bs-3',
    name: 'Premium Leather Running Shoes',
    price: 129.50,
    category: 'Footwear',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    reviews: 892,
    discount: 20,
    hasOffer: true,
    isBestSeller: true
  },
  {
    id: 'static-bs-4',
    name: 'Ultra-Slim 4K Smart TV',
    price: 899.99,
    category: 'Electronics',
    brand: 'Samsung',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400',
    rating: 4.6,
    reviews: 512,
    discount: 10,
    hasOffer: true,
    isBestSeller: true
  },
  {
    id: 'static-bs-5',
    name: 'Professional DSLR Camera',
    price: 1249.00,
    category: 'Electronics',
    brand: 'Canon',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    reviews: 210,
    discount: 0,
    hasOffer: false,
    isBestSeller: true
  },
  {
    id: 'static-bs-6',
    name: 'Ergonomic Office Chair',
    price: 199.99,
    category: 'Furniture',
    brand: 'Herman Miller',
    image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=400',
    rating: 4.5,
    reviews: 1845,
    discount: 5,
    hasOffer: true,
    isBestSeller: true
  },
  {
    id: 'static-bs-7',
    name: 'Stainless Steel Espresso Machine',
    price: 450.00,
    category: 'Appliances',
    brand: 'Breville',
    image: 'https://i.pinimg.com/1200x/29/41/1c/29411cf4c8e3824b620b237d3c1ad4c7.jpg',
    rating: 4.8,
    reviews: 742,
    discount: 25,
    hasOffer: true,
    isBestSeller: true
  },
  {
    id: 'static-bs-8',
    name: 'Designer Sunglasses',
    price: 155.00,
    category: 'Accessories',
    brand: 'Ray-Ban',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    reviews: 1332,
    discount: 0,
    hasOffer: false,
    isBestSeller: true
  }
];

const Home = () => {
  const [products, setProducts] = useState([]);
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
        const productRes = await productService.getProducts();
        const categoryRes = await productService.getCategories();
        setProducts(productRes.data);
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
              {products.filter(p => p.isFeatured).slice(0, 8).map(product => (
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
            {products.filter(p => p.isNewArrival).slice(0, 8).map(product => (
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
              {staticBestSellers.map(product => (
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
