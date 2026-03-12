import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import {
  ArrowLeft, ShoppingBag, ShieldCheck, Truck, RotateCcw,
  Heart, Share2, ChevronLeft, ChevronRight, Star, Facebook, Twitter, Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTranslation } from '../utils/translations';
import { supabase } from '../lib/supabase';

// ── Types ──────────────────────────────────────────────────────
interface Review {
  id: string;
  product_id: string;
  author_name: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
}

// ── Star Rating Component ──────────────────────────────────────
function StarRating({ rating, size = 16, interactive = false, onChange }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          size={size}
          fill={(interactive ? (hovered || rating) : rating) >= star ? '#C9A84C' : 'none'}
          color={(interactive ? (hovered || rating) : rating) >= star ? '#C9A84C' : '#D1D5DB'}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.15s' }}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
    </div>
  );
}

// ── Rating Bar ─────────────────────────────────────────────────
function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-10 text-gray-600 text-right">{stars} Star</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #C9A84C, #e8c96b)' }}
        />
      </div>
      <span className="w-8 text-gray-500 text-xs">{count}</span>
    </div>
  );
}

// ── Review Card ────────────────────────────────────────────────
function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.created_at);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const timeAgo = diffDays === 0 ? "Aujourd'hui" : diffDays < 30
    ? `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`
    : diffDays < 365
      ? `Il y a ${Math.floor(diffDays / 30)} mois`
      : `Il y a ${Math.floor(diffDays / 365)} an${Math.floor(diffDays / 365) > 1 ? 's' : ''}`;

  const initials = review.author_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['#2D6A4F', '#1B4332', '#40916C', '#52B788'];
  const color = avatarColors[review.author_name.length % avatarColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-6 border-b border-gray-100 last:border-0"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: color }}
          >
            {initials}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{review.author_name}</p>
            <p className="text-xs text-green-600 font-medium">(Vérifié)</p>
          </div>
        </div>
        <span className="text-xs text-gray-400">{timeAgo}</span>
      </div>
      <p className="font-bold text-gray-900 text-sm mb-2">{review.title}</p>
      <StarRating rating={review.rating} size={14} />
      <p className="text-gray-600 text-sm leading-relaxed mt-2">{review.body}</p>
    </motion.div>
  );
}

// ── Add Review Form ────────────────────────────────────────────
function AddReviewForm({ productId, onSuccess }: { productId: string; onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !rating || !title || !body) {
      setError('Tous les champs sont obligatoires.');
      return;
    }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.from('reviews').insert({
      product_id: productId,
      author_name: name,
      rating,
      title,
      body,
    });
    setLoading(false);
    if (err) { setError('Erreur lors de l\'envoi.'); return; }
    setSuccess(true);
    onSuccess();
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <p className="text-green-700 font-semibold">✓ Merci pour votre avis !</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-6 space-y-4">
      <h4 className="font-bold text-gray-900">Laisser un avis</h4>
      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Votre note *</label>
        <StarRating rating={rating} size={24} interactive onChange={setRating} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Nom *</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors bg-white"
            placeholder="Votre nom"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Titre *</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors bg-white"
            placeholder="Résumé de votre avis"
          />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">Votre avis *</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#2D6A4F] transition-colors bg-white resize-none"
          placeholder="Partagez votre expérience..."
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wide text-white transition-all disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)' }}
      >
        {loading ? 'Envoi...' : 'Publier'}
      </button>
    </form>
  );
}

// ── Main ProductPage ───────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, setIsCartOpen, language } = useAppContext();
  const t = useTranslation(language);

  const product = products.find(p => p.id === id);
  const [mainImage, setMainImage] = useState(product?.imageUrl || '');
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'info' | 'reviews'>('description');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest'>('newest');

  const allImages = product ? [product.imageUrl, ...(product.images || [])].filter(Boolean) : [];

  useEffect(() => {
    window.scrollTo(0, 0);
    if (product) {
      setMainImage(product.imageUrl);
      setCurrentImageIdx(0);
    }
  }, [id, product]);

  const fetchReviews = async () => {
    if (!id) return;
    setReviewsLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setReviewsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === 'highest') return b.rating - a.rating;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(s => ({
    stars: s,
    count: reviews.filter(r => r.rating === s).length
  }));

  const navigateImage = (dir: 'prev' | 'next') => {
    const newIdx = dir === 'next'
      ? (currentImageIdx + 1) % allImages.length
      : (currentImageIdx - 1 + allImages.length) % allImages.length;
    setCurrentImageIdx(newIdx);
    setMainImage(allImages[newIdx]);
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Produit introuvable</h1>
        <button onClick={() => navigate('/')} className="text-[#2D6A4F] hover:underline">{t('home')}</button>
      </div>
    );
  }

  const tabs = [
    { key: 'description', label: 'Description' },
    { key: 'info', label: 'Informations' },
    { key: 'reviews', label: `Avis (${reviews.length})` },
  ] as const;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1 pt-24 pb-16">

        {/* ── Breadcrumb ── */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-4">
          <div className="bg-gray-50 py-3 px-5 rounded-xl inline-flex items-center gap-2 text-xs text-gray-500">
            <button onClick={() => navigate('/')} className="hover:text-[#2D6A4F] transition-colors font-medium">Accueil</button>
            <span>/</span>
            <button onClick={() => navigate('/')} className="hover:text-[#2D6A4F] transition-colors font-medium">Shop</button>
            <span>/</span>
            <span className="text-gray-900 font-semibold truncate max-w-[160px]">{product.name}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">

          {/* ── Product Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mb-16">

            {/* ── Left: Image Gallery ── */}
            <div className="flex flex-col gap-4">
              {/* Main image */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={mainImage}
                    src={mainImage}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                  {product.isNew && (
                    <span className="bg-[#2D6A4F] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Nouveau</span>
                  )}
                  {product.stock <= 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Épuisé</span>
                  )}
                  {product.originalPrice && (
                    <span className="bg-[#C9A84C] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  )}
                </div>

                {/* Nav arrows */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors z-10"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setCurrentImageIdx(idx); setMainImage(img); }}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                        currentImageIdx === idx
                          ? 'border-[#2D6A4F] shadow-md scale-105'
                          : 'border-transparent hover:border-gray-200'
                      }`}
                    >
                      <img src={img} alt={`thumbnail ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right: Product Details ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-5 py-2"
            >
              {/* Category + Stock badge */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#2D6A4F]">{product.category}</span>
                {product.stock > 0 ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">En Stock</span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-600 px-2.5 py-1 rounded-full font-semibold">Épuisé</span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight">{product.name}</h1>

              {/* Stars */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <StarRating rating={Math.round(avgRating)} size={16} />
                  <span className="text-sm font-semibold text-gray-700">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">({reviews.length} avis)</span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-[#2D6A4F]">
                  {product.price.toLocaleString('fr-DZ')} {t('dzd')}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    {product.originalPrice.toLocaleString('fr-DZ')} {t('dzd')}
                  </span>
                )}
              </div>

              {/* Description short */}
              <p className="text-gray-500 text-sm leading-relaxed border-b border-gray-100 pb-5">{product.description}</p>

              {/* Quantity */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-600 mb-3">Quantité</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-light transition-colors"
                    >−</button>
                    <span className="w-10 text-center font-semibold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                      disabled={product.stock <= 0}
                      className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-lg font-light transition-colors disabled:opacity-30"
                    >+</button>
                  </div>
                  <span className="text-xs text-gray-400">{product.stock} en stock</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  disabled={product.stock <= 0}
                  onClick={() => {
                    if (product.stock > 0) {
                      for (let i = 0; i < quantity; i++) addToCart(product);
                      navigate('/checkout');
                    }
                  }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #40916C 100%)' }}
                >
                  <ShoppingBag size={18} />
                  {product.stock > 0 ? 'Commander' : 'Épuisé'}
                </button>
                <button
                  disabled={product.stock <= 0}
                  onClick={() => {
                    if (product.stock > 0) {
                      for (let i = 0; i < quantity; i++) addToCart(product);
                      setIsCartOpen(true);
                    }
                  }}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wide border-2 border-[#C9A84C] text-[#C9A84C] flex items-center justify-center gap-2 transition-all hover:bg-[#C9A84C] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  Ajouter au panier
                </button>
                <button
                  onClick={() => setWishlist(w => !w)}
                  className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                    wishlist ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
                  }`}
                >
                  <Heart size={18} fill={wishlist ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* SKU & Tags */}
              <div className="text-xs text-gray-400 space-y-1 pt-1">
                <p><span className="font-semibold text-gray-600">SKU :</span> WA-{product.id.toUpperCase().slice(0, 8)}</p>
                <p><span className="font-semibold text-gray-600">Catégorie :</span> {product.category}</p>
              </div>

              {/* Share */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Partager :</span>
                {[
                  { icon: Facebook, color: '#1877F2' },
                  { icon: Twitter, color: '#1DA1F2' },
                  { icon: Instagram, color: '#E1306C' },
                  { icon: Share2, color: '#6B7280' },
                ].map(({ icon: Icon, color }, i) => (
                  <button key={i} className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-200 hover:border-gray-300 transition-all hover:scale-110">
                    <Icon size={14} color={color} />
                  </button>
                ))}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                {[
                  { icon: ShieldCheck, title: 'Qualité 100%', sub: 'Produits authentiques' },
                  { icon: Truck, title: 'Livraison rapide', sub: '58 wilayas' },
                  { icon: RotateCcw, title: 'Paiement sécurisé', sub: 'Cash à la livraison' },
                ].map(({ icon: Icon, title, sub }) => (
                  <div key={title} className="flex flex-col items-center text-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <div className="w-9 h-9 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center">
                      <Icon size={18} className="text-[#2D6A4F]" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-800 leading-tight">{title}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── Tabs Section ── */}
          <div className="border-t border-gray-100">
            {/* Tab Headers */}
            <div className="flex gap-0 border-b border-gray-100">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-6 py-4 text-sm font-semibold transition-colors ${
                    activeTab === tab.key ? 'text-[#2D6A4F]' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2D6A4F]"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="py-10">
              <AnimatePresence mode="wait">
                {activeTab === 'description' && (
                  <motion.div
                    key="desc"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-3xl"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-4">À propos de ce produit</h3>
                    <p className="text-gray-600 leading-relaxed text-base">{product.description}</p>
                  </motion.div>
                )}

                {activeTab === 'info' && (
                  <motion.div
                    key="info"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-xl"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Informations supplémentaires</h3>
                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
                      {[
                        { label: 'Catégorie', value: product.category },
                        { label: 'Prix', value: `${product.price.toLocaleString('fr-DZ')} DZD` },
                        { label: 'Stock', value: `${product.stock} unités` },
                        { label: 'Livraison', value: 'Cash à la livraison — 58 wilayas' },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex py-3.5 px-5 even:bg-gray-50">
                          <span className="w-32 text-sm font-semibold text-gray-500 flex-shrink-0">{label}</span>
                          <span className="text-sm text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10"
                  >
                    {/* Rating Summary */}
                    {reviews.length > 0 && (
                      <div className="flex flex-col md:flex-row gap-8 p-6 bg-gray-50 rounded-2xl">
                        <div className="flex flex-col items-center justify-center gap-2 min-w-[120px]">
                          <span className="text-5xl font-extrabold text-gray-900">{avgRating.toFixed(1)}</span>
                          <StarRating rating={Math.round(avgRating)} size={20} />
                          <span className="text-xs text-gray-400">({reviews.length} avis)</span>
                        </div>
                        <div className="flex-1 space-y-2">
                          {ratingCounts.map(({ stars, count }) => (
                            <RatingBar key={stars} stars={stars} count={count} total={reviews.length} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Review List */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">
                          Liste des avis
                          {reviews.length > 0 && <span className="ml-2 text-sm text-gray-400 font-normal">Affichage de {reviews.length} résultat{reviews.length > 1 ? 's' : ''}</span>}
                        </h3>
                        {reviews.length > 1 && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500">Trier par :</span>
                            <select
                              value={sortBy}
                              onChange={e => setSortBy(e.target.value as any)}
                              className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none focus:border-[#2D6A4F]"
                            >
                              <option value="newest">Plus récent</option>
                              <option value="oldest">Plus ancien</option>
                              <option value="highest">Meilleure note</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {reviewsLoading ? (
                        <div className="text-center py-10 text-gray-400">Chargement...</div>
                      ) : sortedReviews.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                          <p className="text-4xl mb-3">💬</p>
                          <p>Soyez le premier à laisser un avis !</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {sortedReviews.map(review => <ReviewCard key={review.id} review={review} />)}
                        </div>
                      )}
                    </div>

                    {/* Add Review */}
                    <AddReviewForm productId={product.id} onSuccess={fetchReviews} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
