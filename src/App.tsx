import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import ProductPage from './pages/ProductPage';
import TrackOrder from './pages/TrackOrder';
import BeautyQuiz from './pages/BeautyQuiz';
import Toast from './components/Toast';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import LiveOrderPopup from './components/LiveOrderPopup';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/quiz" element={<BeautyQuiz />} />
        </Routes>
        <CartDrawer />
        <AuthModal />
        <Toast />
        <LiveOrderPopup />
      </BrowserRouter>
    </AppProvider>
  );
}
