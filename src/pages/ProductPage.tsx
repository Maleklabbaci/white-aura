import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ArrowLeft, ShoppingBag, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../utils/translations';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, setIsCartOpen, language } = useAppContext();
  const t = useTranslation(language);
  
  const product = products.find(p => p.id === id);
  const [mainImage, setMainImage] = useState(product?.imageUrl || '');

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setMainImage(product.imageUrl);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">{language === 'ar' ? 'المنتج غير موجود' : 'Produit introuvable'}</h1>
        <button onClick={() => navigate('/')} className="text-gold-600 hover:underline">
          {t('home')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors mb-8 md:mb-12"
          >
            <ArrowLeft size={16} className={language === 'ar' ? 'rotate-180' : ''} />
            {t('backToShop')}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
            {/* Image Gallery */}
            <div className="flex flex-col gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative aspect-square md:aspect-auto md:h-[600px] bg-gray-50"
              >
                <img 
                  src={mainImage} 
                  alt={product.name}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  referrerPolicy="no-referrer"
                />
                {product.isNew && (
                  <div className={`absolute top-6 ${language === 'ar' ? 'right-6' : 'left-6'} z-10 bg-gold-400 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-900`}>
                    {language === 'ar' ? 'جديد' : 'Nouveau'}
                  </div>
                )}
                {product.stock <= 0 && (
                  <div className={`absolute top-6 ${language === 'ar' ? 'left-6' : 'right-6'} z-10 bg-red-500 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest`}>
                    {t('outOfStock')}
                  </div>
                )}
              </motion.div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`relative w-24 h-24 flex-shrink-0 bg-gray-50 border-2 transition-colors ${mainImage === img ? 'border-gold-400' : 'border-transparent hover:border-gray-200'}`}
                    >
                      <img 
                        src={img} 
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <motion.div 
              initial={{ opacity: 0, x: language === 'ar' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col justify-center py-8"
            >
              <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 overflow-x-auto whitespace-nowrap pb-2 scrollbar-hide">
                <button onClick={() => navigate('/')} className="hover:text-gold-600 transition-colors">{t('home')}</button>
                <span>/</span>
                <span className="text-gold-600">{product.category}</span>
                <span>/</span>
                <span className="text-gray-900 truncate">{product.name}</span>
              </nav>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
                {product.name}
              </h1>
              <div className="flex items-center gap-4 mb-8">
                <p className="text-3xl font-medium text-gray-900">
                  {product.price.toLocaleString('fr-DZ')} {t('dzd')}
                </p>
                {product.stock > 0 ? (
                  <span className="text-xs font-bold uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    {t('inStock')} ({product.stock})
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    {t('outOfStock')}
                  </span>
                )}
              </div>
              
              <div className="w-16 h-1 bg-gold-400 mb-8"></div>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-12">
                {product.description}
              </p>

              <button 
                disabled={product.stock <= 0}
                onClick={() => {
                  if (product.stock > 0) {
                    addToCart(product);
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }
                }}
                className={`w-full py-5 flex items-center justify-center gap-3 font-bold text-sm uppercase tracking-widest mb-12 transition-colors ${
                  product.stock > 0 
                    ? 'bg-gray-900 text-white hover:bg-gold-400 hover:text-gray-900' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={20} />
                <span>{product.stock > 0 ? t('buy') : t('outOfStock')}</span>
              </button>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-gray-100 pt-12">
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-900">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">{language === 'ar' ? 'جودة مضمونة' : 'Qualité Garantie'}</h4>
                  <p className="text-xs text-gray-500">{language === 'ar' ? 'منتجات أصلية 100%' : 'Produits 100% authentiques'}</p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-900">
                    <Truck size={24} />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">{language === 'ar' ? 'توصيل سريع' : 'Livraison Rapide'}</h4>
                  <p className="text-xs text-gray-500">{language === 'ar' ? 'في جميع أنحاء الجزائر (58 ولاية)' : 'Partout en Algérie (58 wilayas)'}</p>
                </div>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-900">
                    <RotateCcw size={24} />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-widest">{language === 'ar' ? 'دفع آمن' : 'Paiement Sécurisé'}</h4>
                  <p className="text-xs text-gray-500">{t('cashOnDelivery')}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
