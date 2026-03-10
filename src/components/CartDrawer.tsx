import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, language } = useAppContext();
  const navigate = useNavigate();
  const t = useTranslation(language);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: language === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: language === 'ar' ? '-100%' : '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className={`fixed top-0 ${language === 'ar' ? 'left-0' : 'right-0'} h-full w-full sm:w-[400px] bg-white z-[101] shadow-2xl flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} />
                <h2 className="text-lg font-display font-bold uppercase tracking-widest">{t('yourCart')}</h2>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                  <ShoppingBag size={48} className="text-gray-300" />
                  <p className="text-sm uppercase tracking-widest">{t('emptyCart')}</p>
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="mt-4 px-6 py-3 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-gold-400 hover:text-gray-900 transition-colors"
                  >
                    {t('startShopping')}
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-50 flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                            <X size={16} />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">{item.category}</p>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border border-gray-200">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{(item.price * item.quantity).toLocaleString('fr-DZ')} {t('dzd')}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-sm font-bold uppercase tracking-widest text-gray-500">{t('total')}</span>
                  <span className="text-xl font-bold text-gray-900">{total.toLocaleString('fr-DZ')} {t('dzd')}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full bg-gray-900 text-white py-4 flex items-center justify-center gap-3 hover:bg-gold-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest"
                >
                  {t('checkout')}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
