import React, { useEffect, useState, useRef } from 'react';
import Banner from '../../components/Banner/Banner';
import CategoryCard from '../../components/CategoryCard/CategoryCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import productService from '../../services/productService';
import Loader from '../../components/Loader/Loader';
import Brands from '../../components/Brands/Brands';
import './Home.css';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carousel refs and states
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
      scrollRef.current.style.scrollBehavior = 'auto';
      scrollRef.current.scrollLeft = singleSetWidth;
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.style.scrollBehavior = 'smooth';
      });
    }
  }, [displayCategories]);

  // Infinite loop jump logic
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth } = scrollRef.current;
    const singleSetWidth = scrollWidth / 3;

    // If we scrolled into the 3rd set, jump seamlessly back to the 2nd set
    if (scrollLeft >= singleSetWidth * 2) {
      scrollRef.current.style.scrollBehavior = 'auto';
      scrollRef.current.scrollLeft -= singleSetWidth;
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.style.scrollBehavior = 'smooth';
      });
    } 
    // If we scrolled into the 1st set, jump seamlessly to the 2nd set
    else if (scrollLeft <= 0) {
      scrollRef.current.style.scrollBehavior = 'auto';
      scrollRef.current.scrollLeft += singleSetWidth;
      requestAnimationFrame(() => {
        if (scrollRef.current) scrollRef.current.style.scrollBehavior = 'smooth';
      });
    }
  };

  // Auto-scroll functionality
  useEffect(() => {
    let intervalId;
    if (!isDragging && !isHovered && scrollRef.current) {
      intervalId = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }, 3000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isDragging, isHovered]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setIsHovered(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const scroll = (scrollOffset) => {
    scrollRef.current.scrollBy({ left: scrollOffset, behavior: 'smooth' });
  };

  if (loading) return <Loader />;

  return (
    <div className="home-page">
      {/* <Banner /> */}

      {/* Categories Section */}
      <section className="section container">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Explore our wide range of categories</p>
        </div>
        <div 
          className="categories-carousel-container"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button className="carousel-nav-btn left" onClick={() => scroll(-300)} aria-label="Scroll left">
            &#8249;
          </button>
          <div 
            className="categories-scroll-wrapper"
            ref={scrollRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
          >
            {displayCategories.map((category, index) => (
              <div key={`${category.name || category}-${index}`} className="category-slide">
                <CategoryCard category={category} />
              </div>
            ))}
          </div>
          <button className="carousel-nav-btn right" onClick={() => scroll(300)} aria-label="Scroll right">
            &#8250;
          </button>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-alt">
        <div className="section container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Our handpicked selections for you</p>
          </div>
          <div className="grid grid-4">
            {products.filter(p => p.isFeatured).slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section container">
        <div className="section-header">
          <h2>New Arrivals</h2>
          <p>Fresh drops just for you</p>
        </div>
        <div className="grid grid-4">
          {products.filter(p => p.isNewArrival).slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Best Sellers */}
      <section className="bg-alt">
        <div className="section container">
          <div className="section-header">
            <h2>Best Sellers</h2>
            <p>Most loved by our community</p>
          </div>
          <div className="grid grid-4">
            {products.filter(p => p.isBestSeller).slice(0, 8).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <Brands />

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="container newsletter-box" style={{ padding:'60px' }}>
          <h2>Join Our Newsletter</h2>
          <p>Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
          <form className="newsletter-form">
            <input type="email" placeholder="Your email address" required />
            <button type="submit" className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
