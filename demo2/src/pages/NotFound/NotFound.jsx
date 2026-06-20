import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="container" style={{ 
      textAlign: 'center', 
      padding: '8rem 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem'
    }}>
      <h1 style={{ fontSize: '8rem', color: 'var(--primary)', lineHeight: 1 }}>404</h1>
      <h2 style={{ fontSize: '2.5rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: '500px' }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home size={20} /> Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
