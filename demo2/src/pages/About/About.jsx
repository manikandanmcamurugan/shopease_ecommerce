import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page container">
      <div className="about-content">
        <h1 style={{marginTop:"60px"}} >About Us</h1>
        <p>
          Welcome to <strong>ShopEase</strong>, your number one source for all things fashion, electronics, 
          and jewelry. We're dedicated to giving you the very best of products, with a focus on quality, 
          customer service, and uniqueness.
        </p>
        <p>
          Founded in 2024, ShopEase has come a long way from its beginnings. When we first started out, 
          our passion for providing the best equipment drove us to do intense research, and gave us the 
          impetus to turn hard work and inspiration into a booming online store. We now serve customers 
          all over the world, and are thrilled to be a part of the fair trade wing of the e-commerce industry.
        </p>
        <p>
          We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions 
          or comments, please don't hesitate to contact us.
        </p>
        <div className="about-team">
          <h3>Our Mission</h3>
          <p>
            To bring the best styling and technology directly to your doorstep with incredible ease and reliability.
          </p>
        </div>
      </div>
      <div className="about-image">
        <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800" alt="About Us Team" />
      </div>
    </div>
  );
};

export default About;
