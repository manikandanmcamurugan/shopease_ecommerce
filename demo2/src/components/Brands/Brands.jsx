import React from 'react';
import './Brands.css';
import heroBanner from '../../images/logo.jpg';
import modern_headphone from '../../images/brand.jpg';
import brand2 from '../../images/Logo Brand Puma Adidas Swoosh Free Download PNG HQ___.jpg';
import brand3 from '../../images/logo adidas.jpg';

const brands = [
  heroBanner,
  modern_headphone,
  brand2,
  brand3,
];

const Brands = () => {
  return (
    <section className="brands-section container">
      <div className="section-header">
        <h2 style={{marginTop:"80px"}}>Our Trusted Partners</h2>
        <p>We work with the world's leading brands</p>
      </div>
      <div className="brands-grid">
        {brands.map((brand, i) => (
          <div key={i} className="brand-logo">
            <img src={brand} alt={`Brand ${i}`} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default Brands;
