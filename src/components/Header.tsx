import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, Menu, X, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart, setIsCartOpen, setIsAuthOpen, language, setLanguage } = useAppContext();
  const t = useTranslation(language);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const textColor = isScrolled ? 'text-gray-900' : 'text-white';
  const hoverColor = 'hover:text-gold-400';

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <div className="flex-1 md:hidden flex items-center gap-4">
          <button 
            className={`${textColor} ${hoverColor} transition-colors`}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <button 
            onClick={toggleLanguage}
            className={`${textColor} ${hoverColor} transition-colors flex items-center gap-1 text-xs font-bold uppercase tracking-widest`}
          >
            <Globe size={16} />
            <span>{language === 'fr' ? 'AR' : 'FR'}</span>
          </button>
        </div>

        {/* Logo */}
        <div className="flex-shrink-0">
          <a href="/" className={`text-xl sm:text-2xl font-display font-bold tracking-widest uppercase ${textColor} whitespace-nowrap`}>
            WHITE AURA
          </a>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          <a href="/#shop" className={`text-xs font-bold tracking-widest ${textColor} ${hoverColor} transition-colors uppercase`}>{t('shop')}</a>
          <a href="/#about" className={`text-xs font-bold tracking-widest ${textColor} ${hoverColor} transition-colors uppercase`}>{t('history')}</a>
          <a href="/#collections" className={`text-xs font-bold tracking-widest ${textColor} ${hoverColor} transition-colors uppercase`}>{t('collections')}</a>
        </nav>

        {/* Icons */}
        <div className="flex-1 md:flex-none flex items-center justify-end space-x-5 md:space-x-6">
          <button 
            onClick={toggleLanguage}
            className={`${textColor} ${hoverColor} transition-colors hidden md:flex items-center gap-1 text-xs font-bold uppercase tracking-widest`}
          >
            <Globe size={16} />
            <span>{language === 'fr' ? 'AR' : 'FR'}</span>
          </button>
          <button 
            className={`${textColor} ${hoverColor} transition-colors hidden md:block`}
            onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: t('search') }))}
          >
            <Search size={18} />
          </button>
          <button 
            className={`${textColor} ${hoverColor} transition-colors hidden md:block`}
            onClick={() => setIsAuthOpen(true)}
          >
            <User size={18} />
          </button>
          <button 
            className={`${textColor} ${hoverColor} transition-colors relative flex items-center gap-2`}
            onClick={() => setIsCartOpen(true)}
          >
            <span className={`text-xs font-bold tracking-widest uppercase hidden md:block`}>{t('buy')}</span>
            <div className="relative">
              <ShoppingBag size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold-400 text-gray-900 text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: language === 'ar' ? '100%' : '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: language === 'ar' ? '100%' : '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-white z-50 flex flex-col"
          >
            <div className="p-6 flex justify-between items-center border-b border-gray-100">
              <span className="text-xl font-display font-bold tracking-widest uppercase text-gray-900">WHITE AURA</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            <nav className="flex flex-col p-6 space-y-6">
              <a href="/#shop" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium uppercase tracking-wide text-gray-900">{t('shop')}</a>
              <a href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium uppercase tracking-wide text-gray-900">{t('ourHistory')}</a>
              <a href="/#collections" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium uppercase tracking-wide text-gray-900">{t('collections')}</a>
              <div className="pt-6 border-t border-gray-100 flex space-x-6">
                <button 
                  className="flex items-center space-x-2 text-gray-600"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                >
                  <User size={20} />
                  <span>{t('account')}</span>
                </button>
                <button 
                  className="flex items-center space-x-2 text-gray-600"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: t('search') }));
                  }}
                >
                  <Search size={20} />
                  <span>{t('search')}</span>
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
