import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.css';

const Pagination = ({ currentPage, totalPages, onPageChange, itemsPerPage, onItemsPerPageChange }) => {
  if (totalPages <= 1 && !onItemsPerPageChange) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const rowsOptions = [5, 10, 20];

  return (
    <div className="pagination-wrapper">
      {totalPages > 1 && (
        <div className="pagination-container">
          <button 
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="page-nav-btn"
          >
            <ChevronLeft size={16} /> <span>Prev</span>
          </button>
          
          <div className="page-numbers-pill">
            {getPageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' ? onPageChange(page) : null}
                className={`page-btn ${currentPage === page ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                disabled={page === '...'}
              >
                {page}
              </button>
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="page-nav-btn"
          >
            <span>Next</span> <ChevronRight size={16} />
          </button>
        </div>
      )}

      {onItemsPerPageChange && (
        <div className="rows-per-page-container">
          <div className="rows-pill">
            {rowsOptions.map(option => (
              <button
                key={option}
                onClick={() => {
                  onItemsPerPageChange(option);
                  onPageChange(1);
                }}
                className={`row-btn ${itemsPerPage === option ? 'active' : ''}`}
              >
                {option} {itemsPerPage === option ? 'rows' : ''}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pagination;
