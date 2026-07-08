import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  // We now receive a category object: { name, image }
  const categoryName = typeof category === 'object' ? category.name : category;
  const apiImage = typeof category === 'object' && category.image ? category.image : null;

  // Remove the static fallback mapping since we now completely rely on the API.
  const defaultImage = 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&q=80&w=600';
  const displayImage = apiImage || defaultImage;

  return (
    <Link to={`/products?category=${categoryName}`} className="category-card">
      <div className="category-image">
        <img src={displayImage} alt={categoryName} />
      </div>
      <div className="category-title">
        <h3>{categoryName}</h3>
      </div>
    </Link>
  );
};

export default CategoryCard;
