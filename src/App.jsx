import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import Navbar from './components/Navbar/Navbar';
import BottomNav from './components/BottomNav/BottomNav';
import Footer from './components/Footer/Footer';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ScrollToTop/ScrollToTop';
import BackButton from './components/BackButton/BackButton';
import LoginModal from './components/LoginModal/LoginModal';
import './index.css';

function App() {
  useEffect(() => {
    let scrollTimeout;
    const handleScroll = () => {
      document.body.classList.add('is-scrolling');
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <RecentlyViewedProvider>
          <CartProvider>
            <WishlistProvider>
              <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <ScrollToTop />
                <div className="app">
                  <Navbar />
                  <BackButton />
                  <main className="main-content">
                    <AppRoutes />
                  </main>
                  <LoginModal />
                  <Footer />
                  <BottomNav />
                </div>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </RecentlyViewedProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
