import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function Footer() {
  const { language } = useAppContext();
  const t = useTranslation(language);

  return (
    <footer className="bg-gray-900 text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h2 className="text-2xl font-display font-bold tracking-widest uppercase mb-6 text-white">
              WHITE AURA
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              {t('brandDesc')}
            </p>
            <div className="flex space-x-4">
              {/* Social Icons */}
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center text-gray-400 hover:text-gold-400 hover:border-gold-400 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">{t('shop')}</h3>
            <ul className="space-y-4">
              <li><a href="/#shop" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">{t('faceCare')}</a></li>
              <li><a href="/#shop" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">{t('bodyCare')}</a></li>
              <li><a href="/#shop" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">{t('perfumes')}</a></li>
              <li><a href="/#shop" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">{t('giftSets')}</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">{t('help')}</h3>
            <ul className="space-y-4">
              <li><a href="/#faq" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">{t('faq')}</a></li>
              <li><a href="/#shop" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">{t('shippingReturns')}</a></li>
              <li><a href="/#shop" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">{t('trackOrder')}</a></li>
              <li><a href="/#shop" className="text-gray-400 hover:text-gold-400 transition-colors text-sm">{t('contactUs')}</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-6 text-white">{t('newsletter')}</h3>
            <p className="text-gray-400 text-sm mb-4">{t('newsletterDesc')}</p>
            <form 
              className="flex"
              onSubmit={(e) => {
                e.preventDefault();
                const input = e.currentTarget.querySelector('input');
                if (input && input.value) {
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: t('newsletterSuccess') }));
                  input.value = '';
                }
              }}
            >
              <input 
                type="email" 
                required
                placeholder={t('email')} 
                className="bg-transparent border-b border-gray-700 py-2 px-0 text-white focus:outline-none focus:border-gold-400 w-full text-sm transition-colors"
              />
              <button type="submit" className={`text-gold-400 font-bold uppercase text-sm tracking-wider ${language === 'ar' ? 'mr-4' : 'ml-4'} hover:text-white transition-colors`}>
                OK
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-xs mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} WHITE AURA. {t('rights')}
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-500 hover:text-white text-xs transition-colors">{t('legalMentions')}</a>
            <a href="#" className="text-gray-500 hover:text-white text-xs transition-colors">{t('privacyPolicy')}</a>
            <a href="#" className="text-gray-500 hover:text-white text-xs transition-colors">{t('cgv')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
