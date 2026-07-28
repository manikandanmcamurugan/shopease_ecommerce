import React from 'react';
import '../ShippingPolicy/Policy.css';

const Careers = () => {
  return (
    <div className="policy-page container section">
      <div className="page-header text-center">
        <h1>Careers & Blog</h1>
        <p style={{marginTop:"10px"}}>Join our team and catch up on the latest news.</p>
      </div>
      <div className="policy-content" style={{marginTop:"40px"}}>
        <section>
          <h2>Join Our Team</h2>
          <p>We are always looking for talented and passionate individuals to join our growing team. If you love building great products and delivering amazing customer experiences, we would love to hear from you!</p>
          <div style={{ marginTop: '1.5rem', background: 'var(--background)', padding: '1.5rem', borderRadius: 'var(--radius)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Open Positions</h3>
            <ul>
              <li><strong>Senior Frontend Developer (Remote)</strong></li>
              <li><strong>Product Designer (Remote)</strong></li>
              <li><strong>Customer Success Specialist</strong></li>
            </ul>
            <p style={{ marginTop: '1rem' }}>Please send your resume to <strong>careers@shopease.com</strong></p>
          </div>
        </section>

        <section>
          <h2>Latest from the Blog</h2>
          <p>Coming soon! Check back later for our latest company news and product updates.</p>
        </section>
      </div>
    </div>
  );
};

export default Careers;
