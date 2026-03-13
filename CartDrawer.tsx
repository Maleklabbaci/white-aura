import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function AuthModal() {
  const { isAuthOpen, setIsAuthOpen, language } = useAppContext();
  const [isLogin, setIsLogin] = useState(true);
  const t = useTranslation(language);

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAuthOpen(false)}
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white w-full max-w-md overflow-hidden shadow-2xl rounded-xl p-8"
          >
            <button 
              onClick={() => setIsAuthOpen(false)}
              className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-10 w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-500 hover:bg-gold-400 hover:text-gray-900 transition-colors`}
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 bg-gold-400 rounded-full flex items-center justify-center text-gray-900 mb-4">
                <User size={24} />
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900 uppercase tracking-widest">
                {isLogin ? t('login') : t('createAccount')}
              </h2>
              <p className="text-sm text-gray-500 mt-2 text-center">
                {isLogin ? t('loginDesc') : t('createAccountDesc')}
              </p>
            </div>

            <form className="flex flex-col gap-4" onSubmit={(e) => {
              e.preventDefault();
              window.dispatchEvent(new CustomEvent('show-toast', { detail: isLogin ? t('loginSuccess') : t('createAccountSuccess') }));
              setIsAuthOpen(false);
            }}>
              {!isLogin && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">{t('fullName')}</label>
                  <input type="text" required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors" placeholder={language === 'ar' ? 'الاسم واللقب' : 'Votre nom'} />
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">{t('email')}</label>
                <input type="email" required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors" placeholder="votre@email.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">{t('password')}</label>
                <input type="password" required className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors" placeholder="••••••••" />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-gray-900 text-white py-4 mt-4 hover:bg-gold-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest"
              >
                {isLogin ? t('signIn') : t('signUp')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-gray-500 hover:text-gold-600 transition-colors"
              >
                {isLogin ? t('noAccount') : t('alreadyHaveAccount')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
