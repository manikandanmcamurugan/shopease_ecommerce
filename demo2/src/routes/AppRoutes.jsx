import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Products from '../pages/Products/Products';
import ProductDetails from '../pages/ProductDetails/ProductDetails';
import Cart from '../pages/Cart/Cart';
import Wishlist from '../pages/Wishlist/Wishlist';
import Login from '../pages/Login/Login';

import Profile from '../pages/Profile/Profile';
import Orders from '../pages/Orders/Orders';
import Checkout from '../pages/Checkout/Checkout';
import NotFound from '../pages/NotFound/NotFound';
import About from '../pages/About/About';
import Contact from '../pages/Contact/Contact';
import FAQ from '../pages/FAQ/FAQ';
import ShippingPolicy from '../pages/ShippingPolicy/ShippingPolicy';
import ReturnRefund from '../pages/ReturnRefund/ReturnRefund';
import PrivacyPolicy from '../pages/PrivacyPolicy/PrivacyPolicy';
import TermsConditions from '../pages/TermsConditions/TermsConditions';
import Careers from '../pages/Careers/Careers';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/shipping-policy" element={<ShippingPolicy />} />
      <Route path="/return-refund" element={<ReturnRefund />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/login" element={<Login />} />

      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      <Route path="/orders" element={
        <ProtectedRoute>
          <Orders />
        </ProtectedRoute>
      } />
      
      <Route path="/checkout" element={
        <ProtectedRoute>
          <Checkout />
        </ProtectedRoute>
      } />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
