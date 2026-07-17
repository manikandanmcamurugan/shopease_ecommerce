import React, { useState, useEffect, useRef } from 'react';
import { Search, X, History, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/productService';
import './SearchBar.css';

const SearchBar = ({ onSearchSubmit, placeholder = "Search products..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Highlight text
  const highlightText = (text, highlight) => {
    const safeText = typeof text === 'string' ? text : String(text || '');
    if (!highlight.trim() || !safeText) {
      return <span>{safeText}</span>;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = safeText.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? <span key={i} className="highlight">{part}</span> : <span key={i}>{part}</span>
        )}
      </span>
    );
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setIsLoading(true);
        setSearched(true);
        try {
          const res = await productService.searchProducts(query);
          setResults(res.data);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setSearched(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    setSearched(false);
  };

  const saveHistory = (searchTerm) => {
    const term = searchTerm.trim();
    if (!term) return;
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      saveHistory(query);
      setShowDropdown(false);
      if (onSearchSubmit) {
        onSearchSubmit(query);
      }
    }
  };

  const handleSuggestionClick = (product) => {
    saveHistory(query);
    setShowDropdown(false);
    navigate(`/products/${product.id}`);
  };

  const handleHistoryClick = (term) => {
    setQuery(term);
    setShowDropdown(false);
    if (onSearchSubmit) {
      onSearchSubmit(term);
    }
  };

  return (
    <div className="search-bar-container" ref={dropdownRef}>
      <form className="search-bar" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
        />
        {query && (
          <button type="button" className="clear-btn" onClick={handleClear}>
            <X size={16} />
          </button>
        )}
        <button type="submit" className="search-btn">
          <Search size={20} />
        </button>
      </form>

      {showDropdown && (
        <div className="search-dropdown">
          {isLoading && (
            <div className="search-loading">
              <Loader className="spinner" size={24} />
              <span>Searching...</span>
            </div>
          )}

          {!isLoading && query.trim() && searched && results.length === 0 && (
            <div className="no-results">
              No products found
            </div>
          )}

          {!isLoading && query.trim() && results.length > 0 && (
            <div className="search-results">
              <div className="dropdown-title">Suggestions</div>
              <ul>
                {results.map(product => (
                  <li key={product.id} onClick={() => handleSuggestionClick(product)}>
                    <img src={product.image || (product.images && product.images.length > 0 ? product.images[0].image : 'https://via.placeholder.com/600x600')} alt={product.name || 'Product'} />
                    <div className="suggestion-details">
                      <div className="suggestion-name">{highlightText(product.name, query)}</div>
                      <div className="suggestion-category">{highlightText(product.category, query)}</div>
                    </div>
                    <div className="suggestion-price">₹{Number(product.price || 0).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!query.trim() && history.length > 0 && (
            <div className="search-history">
              <div className="dropdown-title">
                Recent Searches
                <button type="button" className="clear-history" onClick={clearHistory}>Clear</button>
              </div>
              <ul>
                {history.map((term, index) => (
                  <li key={index} onClick={() => handleHistoryClick(term)}>
                    <History size={16} />
                    <span>{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
