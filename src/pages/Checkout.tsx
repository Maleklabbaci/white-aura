import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { WILAYAS } from '../utils/algeria';
import { ArrowLeft, CheckCircle2, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../utils/translations';

export default function Checkout() {
  const { cart, clearCart, addOrder, language } = useAppContext();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const t = useTranslation(language);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    wilaya: '',
    commune: ''
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 500; // Example flat rate
  const grandTotal = total + deliveryFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cart.length === 0) return;

    const newOrder = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      items: [...cart],
      total: grandTotal,
      customer: formData,
      status: 'En attente' as const,
      date: new Date().toISOString()
    };

    addOrder(newOrder);
    clearCart();
    setIsSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-6 pt-32">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 rounded-2xl shadow-sm text-center max-w-lg w-full"
          >
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-4">{t('orderConfirmed')}</h1>
            <p className="text-gray-600 mb-8">
              {t('orderConfirmedDesc')}
            </p>
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-900 text-white px-8 py-4 font-bold text-sm uppercase tracking-widest hover:bg-gold-400 hover:text-gray-900 transition-colors"
            >
              {t('backToShop')}
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 md:px-12 pt-32 pb-24">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors mb-8"
        >
          <ArrowLeft size={16} className={language === 'ar' ? 'rotate-180' : ''} />
          {t('backToCart')}
        </button>

        <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 uppercase tracking-widest mb-12">
          {t('checkoutTitle')}
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 uppercase tracking-widest mb-6">{t('emptyCart')}</p>
            <button 
              onClick={() => navigate('/')}
              className="bg-gray-900 text-white px-8 py-4 font-bold text-sm uppercase tracking-widest hover:bg-gold-400 hover:text-gray-900 transition-colors"
            >
              {t('startShopping')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">
                  {t('shippingInfo')}
                </h2>
                
                <form id="checkout-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">{t('fullName')}</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors" 
                        placeholder={t('fullNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">{t('phone')}</label>
                      <input 
                        type="tel" 
                        required 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors" 
                        placeholder="05xx xx xx xx" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">{t('address')}</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors" 
                      placeholder={t('addressPlaceholder')}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">{t('wilaya')}</label>
                      <select 
                        required
                        value={formData.wilaya}
                        onChange={e => setFormData({...formData, wilaya: e.target.value})}
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors bg-white"
                      >
                        <option value="">{t('selectWilaya')}</option>
                        {WILAYAS.map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">{t('commune')}</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.commune}
                        onChange={e => setFormData({...formData, commune: e.target.value})}
                        className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400 transition-colors" 
                        placeholder={t('communePlaceholder')}
                      />
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white p-8 rounded-2xl shadow-sm sticky top-32">
                <h2 className="text-xl font-display font-bold text-gray-900 uppercase tracking-widest mb-8 border-b border-gray-100 pb-4">
                  {t('orderSummary')}
                </h2>
                
                <div className="flex flex-col gap-4 mb-8 max-h-[300px] overflow-y-auto pr-2">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover bg-gray-50" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate">{item.name}</h4>
                        <p className="text-xs text-gray-500">{t('qty')}: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {(item.price * item.quantity).toLocaleString('fr-DZ')} {t('dzd')}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-6 flex flex-col gap-4 mb-8">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{t('subtotal')}</span>
                    <span className="font-medium">{total.toLocaleString('fr-DZ')} {t('dzd')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{t('shipping')}</span>
                    <span className="font-medium">{deliveryFee.toLocaleString('fr-DZ')} {t('dzd')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <span className="text-base font-bold uppercase tracking-widest text-gray-900">{t('total')}</span>
                    <span className="text-xl font-bold text-gold-600">{grandTotal.toLocaleString('fr-DZ')} {t('dzd')}</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  form="checkout-form"
                  className="w-full bg-gray-900 text-white py-4 flex items-center justify-center gap-3 hover:bg-gold-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest"
                >
                  {t('confirmOrder')}
                </button>
                <p className="text-xs text-center text-gray-500 mt-4">
                  {t('cashOnDelivery')}
                </p>
              </div>
            </div>

          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
