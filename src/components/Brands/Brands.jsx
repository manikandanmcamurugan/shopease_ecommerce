import React from 'react';
import './Brands.css';
const brands = [
  'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
  'https://i.pinimg.com/736x/49/60/c2/4960c291cf12f160191dcfe3c9ce82ea.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg',
  'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg',
  'https://i.pinimg.com/1200x/f5/b3/a2/f5b3a28c81481481bc0dea0c765f98db.jpg',
  'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg',
  'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
  'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg',
];

const Brands = () => {
  return (
    <section className="brands-section container">
      <div className="section-header">
        <h2 style={{marginTop:"80px"}}>Our Trusted Partners</h2>
        <p>We work with the world's leading brands</p>
      </div>
      <div className="brands-marquee">
        <div className="brands-track">
          {[...brands, ...brands].map((brand, i) => (
            <div key={i} className="brand-logo">
              <img src={brand} alt={`Brand ${i}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Brands;

