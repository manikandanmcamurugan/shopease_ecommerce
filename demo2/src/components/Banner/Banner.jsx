import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

import productService from '../../services/productService';

const defaultSlideDetails = {
  "electronics": {
    subtitle: 'Smart Tech Devices',
    title: 'Future of <br/> <span>Technology</span>',
    desc: 'Upgrade your digital life with our cutting-edge electronics and smart devices for your home and office.',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=1200',
  },
  "jewelery": {
    subtitle: 'Luxury Accessories',
    title: 'Unmatched <br/> <span>Elegance</span>',
    desc: 'Accessorize with premium jewelry. Classic, modern, and bespoke pieces for every special moment.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=1200',
  },
  "men's clothing": {
    subtitle: 'Modern Essentials',
    title: 'Upgrade Your <br/> <span>Wardrobe</span>',
    desc: 'Discover our exclusive new arrivals for men. Hand-picked premium items designed to make you stand out from the crowd.',
    image: 'https://i.pinimg.com/736x/99/1b/de/991bdee5a59de2a7fd3d169eb4567bc3.jpg',
  },
  "women's clothing": {
    subtitle: 'New Arrival Collection',
    title: 'Elevate Your <br/> <span>Lifestyle</span>',
    desc: 'Discover our exclusive new arrivals for women. Hand-picked premium items designed to make you stand out from the crowd.',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200',
  },
};

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories();
        const apiCategories = res.data.filter(c => {
          const name = typeof c === 'object' ? c.name : c;
          return name !== 'All';
        });
        
        // Ensure exactly 3 banners are shown
        const generatedSlides = apiCategories.slice(0, 3).map(catObj => {
          const cat = typeof catObj === 'object' ? catObj.name : catObj;
          const apiImage = typeof catObj === 'object' ? catObj.image : null;
          
          const lowerCat = (cat || '').toLowerCase();
          const details = defaultSlideDetails[lowerCat] || {
            subtitle: `${cat} Collection`,
            title: `Explore <br/> <span>${cat}</span>`,
            desc: `Check out our amazing collection of ${cat} today.`,
            image: apiImage || 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=1200'
          };
          
          return {
            ...details,
            category: cat
          };
        });
        
        if (generatedSlides.length > 0) {
          setSlides(generatedSlides);
        } else {
          // Fallback if no categories
          setSlides([{
             subtitle: 'Welcome to ShopEase',
             title: 'Discover <br/> <span>Great Deals</span>',
             desc: 'Shop the best products online.',
             image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200',
             category: 'All'
          }]);
        }
      } catch (error) {
        console.error("Error fetching categories for banner:", error);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

  return (
    <div className="hero-banner">
      <div className="banner-slider">
        {slides.map((slide, index) => (
          <div className={`slide ${index === current ? 'active' : ''}`} key={index}>
            <div className="banner-bg-image" style={{ backgroundImage: `url(${slide.image})` }}></div>
            <div className="banner-overlay"></div>
            
            <div className="container banner-content-wrapper">
              <div className="banner-content">
                <div className="banner-badge">
                  <Sparkles size={16} className="text-primary"/>
                  <span className="banner-subtitle">{slide.subtitle}</span>
                </div>
                <h1 dangerouslySetInnerHTML={{ __html: slide.title }}></h1>
                <p>{slide.desc}</p>
                <div className="banner-btns">
                  <Link to={`/products?category=${slide.category}`} className="btn-modern">
                    <span>Shop Collection</span> 
                    <div className="btn-icon">
                      <ArrowRight size={20} />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="banner-navigation container">
          <div className="slider-controls">
            <button className="slider-nav prev" onClick={prevSlide} aria-label="Previous Slide">
              <ChevronLeft size={24} />
            </button>
            <button className="slider-nav next" onClick={nextSlide} aria-label="Next Slide">
              <ChevronRight size={24} />
            </button>
          </div>
          
          <div className="slider-dots-modern">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`dot-modern ${i === current ? 'active' : ''}`}
                onClick={() => setCurrent(i)}
              >
                <div className="dot-progress"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
