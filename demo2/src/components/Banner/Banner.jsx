import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import './Banner.css';

import productService from '../../services/productService';

// Dynamic fallback text is generated directly below instead of relying on hardcoded overrides.

const Banner = () => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await productService.getBanners();
        const bannersData = res.data.results || res.data;
        const activeBanners = bannersData.filter(b => b.is_active !== false);
        
        const formatTitle = (title) => {
          if (!title) return '';
          // If it already has HTML tags, trust it
          if (title.includes('<')) return title;
          
          const words = title.split(' ');
          if (words.length > 1) {
            const lastWord = words.pop();
            return `${words.join(' ')} <br/> <span>${lastWord}</span>`;
          }
          return `<span>${title}</span>`;
        };

        const generatedSlides = activeBanners.map(banner => {
          return {
            subtitle: banner.subtitle,
            title: formatTitle(banner.title),
            desc: '',
            image: banner.banner_image,
            buttonText: banner.button_text,
            buttonLink: banner.button_link
          };
        });
        
        if (generatedSlides.length > 0) {
          setSlides(generatedSlides);
        } else {
          // Fallback if no banners
          setSlides([{
             subtitle: 'Welcome to ShopEase',
             title: 'Discover <br/> <span>Great Deals</span>',
             desc: 'Shop the best products online.',
             image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200',
             buttonText: 'Shop Collection',
             buttonLink: '/products'
          }]);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        setSlides([{
           subtitle: 'Welcome to ShopEase',
           title: 'Discover <br/> <span>Great Deals</span>',
           desc: 'Shop the best products online.',
           image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1200',
           buttonText: 'Shop Collection',
           buttonLink: '/products'
        }]);
      }
    };
    
    fetchBanners();
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
                {slide.subtitle && (
                  <div className="banner-badge">
                    <Sparkles size={16} className="text-primary"/>
                    <span className="banner-subtitle">{slide.subtitle}</span>
                  </div>
                )}
                {slide.title && <h1 dangerouslySetInnerHTML={{ __html: slide.title }}></h1>}
                {slide.desc && <p>{slide.desc}</p>}
                {(slide.buttonText || slide.buttonLink) && (
                  <div className="banner-btns">
                    <Link to={slide.buttonLink || '#'} className="btn-modern">
                      <span>{slide.buttonText || 'Shop Collection'}</span> 
                      <div className="btn-icon">
                        <ArrowRight size={20} />
                      </div>
                    </Link>
                  </div>
                )}
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
