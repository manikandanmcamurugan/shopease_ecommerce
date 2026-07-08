import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../../components/ProductCard/ProductCard';
import productService from '../../services/productService';
import Loader from '../../components/Loader/Loader';
import Pagination from '../../components/Pagination/Pagination';
import { Filter, SlidersHorizontal, ChevronDown, ChevronUp, Menu } from 'lucide-react';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState('All');
  const [showOffersOnly, setShowOffersOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const itemsPerPage = 8;

  // Add state for mobile collapsible filters
  const [expandedFilters, setExpandedFilters] = useState({
    category: window.innerWidth > 968,
    brand: window.innerWidth > 968,
    price: window.innerWidth > 968,
    offers: window.innerWidth > 968,
    sort: window.innerWidth > 968
  });

  const toggleFilter = (filterName) => {
    if (window.innerWidth <= 968) {
      setExpandedFilters(prev => ({
        category: filterName === 'category' ? !prev.category : false,
        brand: filterName === 'brand' ? !prev.brand : false,
        price: filterName === 'price' ? !prev.price : false,
        offers: filterName === 'offers' ? !prev.offers : false,
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
          // Dynamic max price calculation removed as we now use fixed ranges
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

  // Effect 1: Removed dynamic Max Price calculation since we use fixed ranges in select
  useEffect(() => {
    // Kept empty to maintain hook order if needed, but not necessary.
  }, [products, selectedCategory, selectedBrands, searchQuery]);

  // Effect 2: Apply final Price Filter and Sorting
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

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price filter
    if (priceRange !== 'All') {
      const [min, max] = priceRange.split('-').map(Number);
      result = result.filter(p => p.price >= min && p.price <= max);
    }

    // Offers filter
    if (showOffersOnly) {
      result = result.filter(p => p.hasOffer || p.discount > 0);
    }

    // Sorting
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [products, selectedCategory, selectedBrands, sortBy, priceRange, searchQuery, showOffersOnly]);

  const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const visibleCategories = showAllCategories ? categories : categories.slice(0, 5);
  const visibleBrands = showAllBrands ? uniqueBrands : uniqueBrands.slice(0, 5);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (loading) return <Loader />;

  return (
    <div className="products-page container">
      <header className="products-header">
        <div>
          <h1>{searchQuery ? `Search results for "${searchQuery}"` : selectedCategory + ' Products'}</h1>
          <p>Found {filteredProducts.length} items</p>
        </div>
        
        <div className="sort-container desktop-sort">
          <label htmlFor="sort-select">Sort By:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        <button className="mobile-filter-btn d-md-none" onClick={() => setIsMobileFilterOpen(true)}>
          <Menu size={24} />
        </button>
      </header>

      {isMobileFilterOpen && (
        <div className="mobile-filter-overlay" onClick={() => setIsMobileFilterOpen(false)}></div>
      )}

      <div className="products-layout">

        <aside className={`filters-sidebar ${isMobileFilterOpen ? 'open' : ''}`}>
          <div className="mobile-filter-header d-md-none" style={{ display: 'none', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Filter & Sort</h2>
            <button onClick={() => setIsMobileFilterOpen(false)} style={{ background: 'none', border: 'none', fontSize: '2rem', lineHeight: 1 }}>&times;</button>
          </div>
          <div className="filter-group">
            <h3 onClick={() => toggleFilter('category')} className="filter-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} /> Categories
              </span>
              {expandedFilters.category ? <ChevronUp size={18} className="filter-toggle-icon" /> : <ChevronDown size={18} className="filter-toggle-icon" />}
            </h3>
            
            <div className={`filter-content ${expandedFilters.category ? 'expanded' : ''}`}>
              <ul className="category-list">
                {visibleCategories.map(catObj => {
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
              {categories.length > 5 && (
                <button 
                  className="show-more-btn" 
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  style={{ marginTop: '0.8rem', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', padding: '0' }}
                >
                  {showAllCategories ? 'Show Less' : 'Show More...'}
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <h3 onClick={() => toggleFilter('brand')} className="filter-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} /> Brands
              </span>
              {expandedFilters.brand ? <ChevronUp size={18} className="filter-toggle-icon" /> : <ChevronDown size={18} className="filter-toggle-icon" />}
            </h3>
            
            <div className={`filter-content ${expandedFilters.brand ? 'expanded' : ''}`}>
              <ul className="category-list" style={{ padding: 0, listStyle: 'none' }}>
                {visibleBrands.map(brand => (
                  <li key={brand} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                    <input 
                      type="checkbox"
                      id={`brand-${brand}`}
                      checked={selectedBrands.includes(brand)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedBrands(prev => [...prev, brand]);
                        } else {
                          setSelectedBrands(prev => prev.filter(b => b !== brand));
                        }
                      }}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
                    />
                    <label htmlFor={`brand-${brand}`} style={{ cursor: 'pointer', margin: 0, fontSize: '0.95rem', userSelect: 'none' }}>
                      {brand}
                    </label>
                  </li>
                ))}
              </ul>
              {uniqueBrands.length > 5 && (
                <button 
                  className="show-more-btn" 
                  onClick={() => setShowAllBrands(!showAllBrands)}
                  style={{ marginTop: '0.8rem', background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem', padding: '0' }}
                >
                  {showAllBrands ? 'Show Less' : 'Show More...'}
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <h3 onClick={() => toggleFilter('price')} className="filter-header">
              <span>Price Range</span>
              {expandedFilters.price ? <ChevronUp size={18} className="filter-toggle-icon" /> : <ChevronDown size={18} className="filter-toggle-icon" />}
            </h3>
            
            <div className={`filter-content ${expandedFilters.price ? 'expanded' : ''}`}>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid var(--border)', fontFamily: 'inherit', fontSize: '0.95rem' }}
              >
                <option value="All">All Prices</option>
                <option value="0-100">0 - 100</option>
                <option value="100-500">100 - 500</option>
                <option value="500-1000">500 - 1000</option>
                <option value="1000-5000">1000 - 5000</option>
                <option value="5000-10000">5000 - 10000</option>
              </select>
            </div>
          </div>

          <div className="filter-group">
            <h3 onClick={() => toggleFilter('offers')} className="filter-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Filter size={18} /> Offers & Discounts
              </span>
              {expandedFilters.offers ? <ChevronUp size={18} className="filter-toggle-icon" /> : <ChevronDown size={18} className="filter-toggle-icon" />}
            </h3>
            
            <div className={`filter-content ${expandedFilters.offers ? 'expanded' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input 
                  type="checkbox"
                  id="offers-only"
                  checked={showOffersOnly}
                  onChange={(e) => setShowOffersOnly(e.target.checked)}
                  style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
                />
                <label htmlFor="offers-only" style={{ cursor: 'pointer', margin: 0, fontSize: '0.95rem', userSelect: 'none' }}>
                  Show only items with offers
                </label>
              </div>
            </div>
          </div>

          <div className="filter-group mobile-sort-group">
            <h3 onClick={() => toggleFilter('sort')} className="filter-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SlidersHorizontal size={18} /> Sort By
              </span>
              {expandedFilters.sort ? <ChevronUp size={18} className="filter-toggle-icon" /> : <ChevronDown size={18} className="filter-toggle-icon" />}
            </h3>
            
            <div className={`filter-content ${expandedFilters.sort ? 'expanded' : ''}`}>
              <ul className="category-list">
                {[
                  { value: 'default', label: 'Default' },
                  { value: 'price-low', label: 'Price: Low to High' },
                  { value: 'price-high', label: 'Price: High to Low' },
                  { value: 'rating', label: 'Top Rated' }
                ].map(opt => (
                  <li key={opt.value}>
                    <button 
                      className={sortBy === opt.value ? 'active' : ''}
                      onClick={() => {
                        setSortBy(opt.value);
                        if (window.innerWidth <= 968) {
                          setExpandedFilters(prev => ({ ...prev, sort: false }));
                        }
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
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
                setSelectedBrands([]);
                setPriceRange('All');
                setShowOffersOnly(false);
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
