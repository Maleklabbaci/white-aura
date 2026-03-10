import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function About() {
  const { language } = useAppContext();
  const t = useTranslation(language);

  return (
    <section id="about" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: language === 'ar' ? 30 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src="https://i.ibb.co/qLd4VwQ3/GLOWLOW.png" 
                alt={t('ourHistory')} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className={`absolute -bottom-8 ${language === 'ar' ? '-left-8' : '-right-8'} w-48 h-48 bg-gold-50 rounded-full -z-10`}></div>
            <div className={`absolute -top-8 ${language === 'ar' ? '-right-8' : '-left-8'} w-32 h-32 bg-gray-50 rounded-full -z-10`}></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: language === 'ar' ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <h2 className="text-sm font-bold text-gold-600 uppercase tracking-widest mb-4">{t('ourHistory')}</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-8 leading-tight">
              {t('aboutTitle1')} <br />
              <span className="text-gray-400 font-light">{t('aboutTitle2')}</span>
            </h3>
            
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>{t('aboutDesc1')}</p>
              <p>{t('aboutDesc2')}</p>
              <p>{t('aboutDesc3')}</p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-8">
              <div>
                <p className="text-4xl font-display font-bold text-gray-900 mb-2">100%</p>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{t('natural')}</p>
              </div>
              <div>
                <p className="text-4xl font-display font-bold text-gray-900 mb-2">58</p>
                <p className="text-sm font-bold uppercase tracking-widest text-gray-500">{t('wilayasDelivered')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
