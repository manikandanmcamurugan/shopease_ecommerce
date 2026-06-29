import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import productService from '../../services/productService';
import Loader from '../../components/Loader/Loader';
import Pagination from '../../components/Pagination/Pagination';
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState(1000);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Add state for mobile collapsible filters
  const [expandedFilters, setExpandedFilters] = useState({
    category: window.innerWidth > 968,
    price: window.innerWidth > 968,
    sort: window.innerWidth > 968
  });

  const toggleFilter = (filterName) => {
    if (window.innerWidth <= 968) {
      setExpandedFilters(prev => ({
        category: filterName === 'category' ? !prev.category : false,
        price: filterName === 'price' ? !prev.price : false,
        sort: filterName === 'sort' ? !prev.sort : false
      }));
    } else {
      setExpandedFilters(prev => ({
        ...prev,
        [filterName]: !prev[filterName]
      }));
    }
  };

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const searchQuery = searchParams.get('search');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await productService.getProducts();
        const catRes = await productService.getCategories();
        const fetchedProducts = prodRes?.data || [];
        setProducts(fetchedProducts);
        setCategories(catRes.data);
        
        if (fetchedProducts.length > 0) {
          const highestPrice = Math.max(...fetchedProducts.map(p => p.price));
          const safeMax = Math.ceil(highestPrice / 100) * 100; // Round up to nearest 100
          setMaxPrice(safeMax);
          setPriceRange(safeMax);
        }
        
        if (categoryParam) setSelectedCategory(categoryParam);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryParam]);

  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Price filter
    result = result.filter(p => p.price <= priceRange);

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedCategory, sortBy, priceRange, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading) return <Loader />;

  return (
    <div className="products-page container">
      <header className="products-header">
        <h1>{searchQuery ? `Search results for "${searchQuery}"` : selectedCategory + ' Products'}</h1>
        <p>Found {filteredProducts.length} items</p>
      </header>

      <div className="products-layout">
        <aside className="filters-sidebar">
          <div className="filter-group">
            <h3 onClick={() => toggleFilter('category')} className="filter-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} /> Categories
              </span>
              {expandedFilters.category ? <ChevronUp size={18} className="filter-toggle-icon" /> : <ChevronDown size={18} className="filter-toggle-icon" />}
            </h3>
            
            <div className={`filter-content ${expandedFilters.category ? 'expanded' : ''}`}>
              <ul className="category-list">
                {categories.map(catObj => {
                  const catName = typeof catObj === 'object' ? catObj.name : catObj;
                  return (
                    <li key={catName}>
                      <button 
                        className={selectedCategory === catName ? 'active' : ''}
                        onClick={() => {
                          setSelectedCategory(catName);
                          if (window.innerWidth <= 968) {
                            setExpandedFilters(prev => ({ ...prev, category: false }));
                          }
                        }}
                      >
                        {catName}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="filter-group">
            <h3 onClick={() => toggleFilter('price')} className="filter-header">
              <span>Max Price: ₹{priceRange}</span>
              {expandedFilters.price ? <ChevronUp size={18} className="filter-toggle-icon" /> : <ChevronDown size={18} className="filter-toggle-icon" />}
            </h3>
            
            <div className={`filter-content ${expandedFilters.price ? 'expanded' : ''}`}>
              <input 
                type="range" 
                min="0" 
                max={maxPrice} 
                step="50" 
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="price-slider"
              />
            </div>
          </div>

          <div className="filter-group">
            <h3 onClick={() => toggleFilter('sort')} className="filter-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={18} /> Sort By
              </span>
              {expandedFilters.sort ? <ChevronUp size={18} className="filter-toggle-icon" /> : <ChevronDown size={18} className="filter-toggle-icon" />}
            </h3>
            
            <div className={`filter-content ${expandedFilters.sort ? 'expanded' : ''}`}>
              <ul className="category-list">
                <li>
                  <button 
                    className={sortBy === 'default' ? 'active' : ''}
                    onClick={() => {
                      setSortBy('default');
                      if (window.innerWidth <= 968) setExpandedFilters(prev => ({ ...prev, sort: false }));
                    }}
                  >
                    Default
                  </button>
                </li>
                <li>
                  <button 
                    className={sortBy === 'price-low' ? 'active' : ''}
                    onClick={() => {
                      setSortBy('price-low');
                      if (window.innerWidth <= 968) setExpandedFilters(prev => ({ ...prev, sort: false }));
                    }}
                  >
                    Price: Low to High
                  </button>
                </li>
                <li>
                  <button 
                    className={sortBy === 'price-high' ? 'active' : ''}
                    onClick={() => {
                      setSortBy('price-high');
                      if (window.innerWidth <= 968) setExpandedFilters(prev => ({ ...prev, sort: false }));
                    }}
                  >
                    Price: High to Low
                  </button>
                </li>
                <li>
                  <button 
                    className={sortBy === 'rating' ? 'active' : ''}
                    onClick={() => {
                      setSortBy('rating');
                      if (window.innerWidth <= 968) setExpandedFilters(prev => ({ ...prev, sort: false }));
                    }}
                  >
                    Top Rated
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </aside>

        <main className="products-content">
          {currentItems.length > 0 ? (
            <div className="grid grid-3">
              {currentItems.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <h3>No products found matching your criteria.</h3>
              <button onClick={() => {
                setSelectedCategory('All');
                setPriceRange(1000);
                setSortBy('default');
              }} className="btn btn-primary">Reset Filters</button>
            </div>
          )}

          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </main>
      </div>
    </div>
  );
};

export default Products;
