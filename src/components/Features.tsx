import React from 'react';
import { Leaf, Award, Package, Droplets } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../utils/translations';

export default function Features() {
  const { language } = useAppContext();
  const t = useTranslation(language);

  const FeatureItems = () => (
    <div className="flex items-center">
      <div className="flex items-center gap-3 mx-8 md:mx-16">
        <Leaf size={18} />
        <span className="text-xs md:text-sm font-bold uppercase tracking-wider">{t('organic')}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-900/40"></div>
      <div className="flex items-center gap-3 mx-8 md:mx-16">
        <Award size={18} />
        <span className="text-xs md:text-sm font-bold uppercase tracking-wider">{t('certified')}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-900/40"></div>
      <div className="flex items-center gap-3 mx-8 md:mx-16">
        <Package size={18} />
        <span className="text-xs md:text-sm font-bold uppercase tracking-wider">{t('freshPackaging')}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-900/40"></div>
      <div className="flex items-center gap-3 mx-8 md:mx-16">
        <Droplets size={18} />
        <span className="text-xs md:text-sm font-bold uppercase tracking-wider">{t('pureIngredients')}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full bg-gray-900/40"></div>
    </div>
  );

  return (
    <section className="bg-gold-400 py-5 overflow-hidden border-y border-gold-500/30">
      <div className="flex whitespace-nowrap w-full group">
        <div className="flex items-center animate-marquee min-w-max group-hover:[animation-play-state:paused] transition-all text-gray-900">
          <FeatureItems />
          <FeatureItems />
          <FeatureItems />
          <FeatureItems />
        </div>
      </div>
    </section>
  );
}
