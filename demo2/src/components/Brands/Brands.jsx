import React from 'react';
import './Brands.css';
const brands = [
  'https://placehold.co/200x100/f3f4f6/4b5563.png?text=Brand+1',
  'https://placehold.co/200x100/f3f4f6/4b5563.png?text=Brand+2',
  'https://placehold.co/200x100/f3f4f6/4b5563.png?text=Brand+3',
  'https://placehold.co/200x100/f3f4f6/4b5563.png?text=Brand+4',
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

