import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ArrowRight, X, ShoppingBag, Tag } from 'lucide-react';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../utils/translations';

export default function ProductGrid() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { products, addToCart, setIsCartOpen, language } = useAppContext();
  const navigate = useNavigate();
  const t = useTranslation(language);

  // Extraire les catégories uniques
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))];
    return ['all', ...cats];
  }, [products]);

  // Filtrer les produits
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  // Labels des catégories
  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return language === 'ar' ? 'الكل' : 'Tout';
    return cat;
  };

  return (
    <section id="shop" className="py-24 bg-[#FAFAFA]">
      <div id="collections" className="max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 gap-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-[1.1] tracking-tight">
            {t('buyOur')} <br />
            <span className="text-gray-400 font-light">{t('best')}</span> {t('products')}
          </h2>
          
          <div className="flex flex-col items-start lg:items-end gap-6">
            <div className="flex gap-4">
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: t('previous') }))}
                className="w-12 h-12 rounded-full bg-gold-400 flex items-center justify-center text-gray-900 hover:bg-gold-500 transition-colors"
              >
                <ArrowLeft size={20} className={language === 'ar' ? 'rotate-180' : ''} />
              </button>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: t('next') }))}
                className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-900 hover:border-gray-900 transition-colors bg-white"
              >
                <ArrowRight size={20} className={language === 'ar' ? 'rotate-180' : ''} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Filtres par catégorie ──────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                selectedCategory === cat
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-900 hover:text-gray-900'
              }`}
            >
              {getCategoryLabel(cat)}
              {cat !== 'all' && (
                <span className={`ml-2 text-[10px] ${
                  selectedCategory === cat ? 'text-gold-400' : 'text-gray-400'
                }`}>
                  ({products.filter((p) => p.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          <AnimatePresence mode="wait">
            {filteredProducts.map((product, index) => (
              <motion.div 
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                layout
                className="group cursor-pointer"
              >
                <div className="relative aspect-square bg-white mb-5 overflow-hidden">
                  {/* Badge Nouveau */}
                  {product.isNew && !product.promoLabel && (
                    <div className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} z-10 bg-gold-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-900`}>
                      {language === 'ar' ? 'جديد' : 'Nouveau'}
                    </div>
                  )}

                  {/* Badge Promo */}
                  {product.promoLabel && (
                    <div className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} z-10 bg-red-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1`}>
                      <Tag size={10} />
                      {product.promoLabel}
                    </div>
                  )}

                  {/* Badge Rupture */}
                  {product.stock <= 0 && (
                    <div className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-10 bg-gray-900 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest`}>
                      {t('outOfStock')}
                    </div>
                  )}

                  <motion.div
                    initial={{ scale: 1.2 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 + 0.1 }}
                    className="w-full h-full"
                  >
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </motion.div>
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <button 
                      disabled={product.stock <= 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (product.stock > 0) {
                          addToCart(product);
                          setIsCartOpen(false);
                          navigate('/checkout');
                        }
                      }}
                      className={`w-32 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 ${
                        product.stock > 0 
                          ? 'bg-white text-gray-900 hover:bg-gold-400' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {product.stock > 0 ? t('buy') : t('outOfStock')}
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product.id}`);
                      }}
                      className="w-32 bg-gray-900 text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gold-400 hover:text-gray-900 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75"
                    >
                      {t('viewDetails')}
                    </button>
                  </div>
                </div>
                
                {/* Product Info */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-sm font-display font-bold text-gray-900 uppercase tracking-wide mb-1 group-hover:text-gold-500 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</p>
                  </div>
                  
                  {/* Prix avec promo */}
                  <div className="text-right shrink-0">
                    {product.originalPrice ? (
                      <>
                        <p className="text-xs text-gray-400 line-through">
                          {product.originalPrice.toLocaleString('fr-DZ')} {t('dzd')}
                        </p>
                        <p className="text-sm font-bold text-red-500">
                          {product.price.toLocaleString('fr-DZ')} {t('dzd')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-medium text-gray-900">
                        {product.price.toLocaleString('fr-DZ')} {t('dzd')}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Message si aucun produit */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm uppercase tracking-widest">
              {language === 'ar' ? 'لا توجد منتجات في هذه الفئة' : 'Aucun produit dans cette catégorie'}
            </p>
          </div>
        )}
        
      </div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          >
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedProduct(null)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row rounded-xl md:rounded-none"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className={`absolute top-4 ${language === 'ar' ? 'left-4' : 'right-4'} z-10 w-10 h-10 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-gray-900 hover:bg-gold-400 transition-colors`}
              >
                <X size={20} />
              </button>

              {/* Image */}
              <div className="w-full md:w-1/2 aspect-square md:aspect-auto md:min-h-[500px] relative bg-gray-50">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                {selectedProduct.isNew && !selectedProduct.promoLabel && (
                  <div className={`absolute top-6 ${language === 'ar' ? 'right-6' : 'left-6'} z-10 bg-gold-400 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-900`}>
                    {language === 'ar' ? 'جديد' : 'Nouveau'}
                  </div>
                )}
                {selectedProduct.promoLabel && (
                  <div className={`absolute top-6 ${language === 'ar' ? 'right-6' : 'left-6'} z-10 bg-red-500 text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1`}>
                    <Tag size={10} />
                    {selectedProduct.promoLabel}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-center">
                <p className="text-xs text-gold-600 uppercase tracking-widest mb-3">{selectedProduct.category}</p>
                <h2 className="text-2xl md:text-4xl font-display font-bold text-gray-900 mb-4 leading-tight">
                  {selectedProduct.name}
                </h2>
                
                {/* Prix modal */}
                <div className="mb-6">
                  {selectedProduct.originalPrice ? (
                    <div className="flex items-center gap-3">
                      <p className="text-lg text-gray-400 line-through">
                        {selectedProduct.originalPrice.toLocaleString('fr-DZ')} {t('dzd')}
                      </p>
                      <p className="text-2xl font-bold text-red-500">
                        {selectedProduct.price.toLocaleString('fr-DZ')} {t('dzd')}
                      </p>
                      <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                        {selectedProduct.promoLabel}
                      </span>
                    </div>
                  ) : (
                    <p className="text-2xl font-medium text-gray-900">
                      {selectedProduct.price.toLocaleString('fr-DZ')} {t('dzd')}
                    </p>
                  )}
                </div>
                
                <div className="w-12 h-0.5 bg-gold-400 mb-6"></div>
                
                <p className="text-gray-600 leading-relaxed mb-8">
                  {selectedProduct.description}
                </p>

                <div className="flex flex-col gap-4 mt-auto">
                  <button 
                    onClick={() => {
                      addToCart(selectedProduct);
                      window.dispatchEvent(new CustomEvent('show-toast', { detail: `${selectedProduct.name} ${language === 'ar' ? 'أضيف إلى السلة' : 'ajouté au panier'}` }));
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-gray-900 text-white py-4 flex items-center justify-center gap-3 hover:bg-gold-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest"
                  >
                    <ShoppingBag size={18} />
                    <span>{t('addToCart')}</span>
                  </button>
                  <button 
                    onClick={() => {
                      navigate(`/product/${selectedProduct.id}`);
                      setSelectedProduct(null);
                    }}
                    className="w-full bg-transparent border border-gray-300 text-gray-900 py-4 flex items-center justify-center hover:border-gray-900 transition-colors font-bold text-sm uppercase tracking-widest"
                  >
                    {t('viewDetails')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
