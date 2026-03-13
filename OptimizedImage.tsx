import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function Hero() {
  const { language } = useAppContext();
  const t = useTranslation(language);
  const sectionRef = useRef<HTMLElement>(null);
  const [imgStyle, setImgStyle] = useState<React.CSSProperties>({
    transform: 'translate(0px, 0px) scale(1.03)',
    transition: 'transform 0.6s ease-out',
  });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();

    // -1 à 1 depuis le centre
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;

    // Mouvement TRÈS subtil : max 6px horizontal, 4px vertical
    const x = xRatio * 6;
    const y = yRatio * 4;

    setImgStyle({
      transform: `translate(${x}px, ${y}px) scale(1.03)`,
      transition: 'transform 0.6s ease-out',
      willChange: 'transform',
    });
  };

  const handleMouseLeave = () => {
    setImgStyle({
      transform: 'translate(0px, 0px) scale(1.03)',
      transition: 'transform 0.8s ease-out',
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[100dvh] w-full bg-gray-900 flex flex-col justify-center md:justify-end overflow-hidden pb-8 pt-32"
    >
      {/* Background Image — Mouvement subtil des yeux */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2000&auto=format&fit=crop"
          alt="Cosmetics model with glowing skin"
          className="w-full h-full object-cover object-center opacity-90"
          referrerPolicy="no-referrer"
          draggable={false}
          style={imgStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-12">

        {/* Glassmorphism Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="bg-white/10 backdrop-blur-md border border-white/20 p-6 md:p-10 rounded-3xl max-w-md w-full shadow-2xl"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-6">
            <div className="w-3 h-3 rounded-full bg-white"></div>
          </div>
          <h2 className="text-white text-xl md:text-2xl font-display font-medium mb-4 leading-snug">
            {t('heroSubtitle')}
          </h2>
          <p className="text-white/80 text-sm leading-relaxed mb-8 font-light">
            {t('heroDesc')}
          </p>
          <button
            onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-4 text-white text-xs font-bold uppercase tracking-widest hover:text-gold-400 transition-colors group"
          >
            <span className="w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center group-hover:bg-gold-400 group-hover:text-white transition-colors">
              <ArrowRight size={16} className={language === 'ar' ? 'rotate-180' : ''} />
            </span>
            {t('exploreProducts')}
          </button>
        </motion.div>

        {/* Big Text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className={`text-left md:text-${language === 'ar' ? 'left' : 'right'} mt-4 md:mt-0 mb-4 md:mb-0`}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5.5rem] font-display font-bold text-white leading-[1.1] tracking-tight">
            {t('heroTitle1')} <br />
            <span className="text-gold-400 italic font-light">{t('heroTitle2')}</span> {t('heroTitle3')}
          </h1>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 mt-8 md:mt-12 flex justify-between items-center border-t border-white/20 pt-4 md:pt-6">
        <p className="text-white/80 text-sm font-medium tracking-wide">{t('expertsSecrets')}</p>
        <ArrowRight size={20} className={`text-white/80 ${language === 'ar' ? 'rotate-180' : ''}`} />
      </div>
    </section>
  );
}
