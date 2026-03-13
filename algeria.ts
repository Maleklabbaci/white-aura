import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, ArrowRight, RotateCcw, ShoppingBag } from 'lucide-react';

// ── Quiz data ─────────────────────────────────────────────────
interface QuizOption {
  label: string;
  emoji: string;
  tags: string[];
}

interface QuizStep {
  id: number;
  question: string;
  subtitle: string;
  options: QuizOption[];
}

const STEPS: QuizStep[] = [
  {
    id: 1,
    question: 'Quel est ton type de peau ?',
    subtitle: 'Choisis celui qui te correspond le mieux',
    options: [
      { label: 'Sèche', emoji: '🏜️', tags: ['hydratant', 'soin', 'crème', 'nourrissant'] },
      { label: 'Grasse', emoji: '💧', tags: ['sérum', 'léger', 'matifiant', 'purifiant'] },
      { label: 'Mixte', emoji: '⚖️', tags: ['équilibrant', 'sérum', 'soin'] },
      { label: 'Sensible', emoji: '🌸', tags: ['doux', 'apaisant', 'naturel', 'soin'] },
    ],
  },
  {
    id: 2,
    question: 'Quel est ton principal problème de peau ?',
    subtitle: 'Plusieurs peuvent s\'appliquer, choisis le plus urgent',
    options: [
      { label: 'Taches & teint terne', emoji: '✨', tags: ['éclat', 'teint', 'vitamin', 'sérum'] },
      { label: 'Rides & vieillissement', emoji: '⏳', tags: ['anti-âge', 'fermeté', 'collagène'] },
      { label: 'Acné & imperfections', emoji: '🎯', tags: ['purifiant', 'acné', 'sérum'] },
      { label: 'Déshydratation', emoji: '💦', tags: ['hydratant', 'eau', 'sérum'] },
    ],
  },
  {
    id: 3,
    question: 'Quelle est ta routine actuelle ?',
    subtitle: 'Pour adapter nos recommandations',
    options: [
      { label: 'Aucune routine', emoji: '🌱', tags: ['débutant', 'simple', 'soin'] },
      { label: 'Routine basique', emoji: '🧴', tags: ['soin', 'crème'] },
      { label: 'Routine complète', emoji: '💎', tags: ['sérum', 'avancé', 'traitement'] },
      { label: 'Routine naturelle', emoji: '🌿', tags: ['naturel', 'bio', 'doux'] },
    ],
  },
  {
    id: 4,
    question: 'À quel moment utilises-tu tes soins ?',
    subtitle: 'Le timing influence les produits recommandés',
    options: [
      { label: 'Matin seulement', emoji: '🌅', tags: ['légèr', 'protection', 'jour'] },
      { label: 'Soir seulement', emoji: '🌙', tags: ['nuit', 'réparateur', 'sérum'] },
      { label: 'Matin & soir', emoji: '🔄', tags: ['sérum', 'crème', 'complet'] },
      { label: 'Quand j\'y pense', emoji: '😅', tags: ['simple', 'pratique', 'soin'] },
    ],
  },
  {
    id: 5,
    question: 'Quel résultat veux-tu voir en premier ?',
    subtitle: 'On va personnaliser pour toi',
    options: [
      { label: 'Peau lumineuse', emoji: '🌟', tags: ['éclat', 'teint', 'vitamin'] },
      { label: 'Peau lisse & douce', emoji: '🧈', tags: ['lissant', 'doux', 'hydratant'] },
      { label: 'Peau nette', emoji: '✅', tags: ['purifiant', 'matifiant', 'acné'] },
      { label: 'Peau jeune', emoji: '⚡', tags: ['anti-âge', 'fermeté', 'sérum'] },
    ],
  },
];

// ── Tag matching score ────────────────────────────────────────
function scoreProduct(product: Product, allTags: string[]): number {
  const text = `${product.name} ${product.description} ${product.category}`.toLowerCase();
  return allTags.reduce((score, tag) => score + (text.includes(tag.toLowerCase()) ? 1 : 0), 0);
}

// ── Step indicator ────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            background: i === current ? '#2D6A4F' : i < current ? '#40916C' : '#E5E7EB',
          }}
        />
      ))}
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────
function ProductCard({ product, rank }: { product: Product; rank: number }) {
  const navigate = useNavigate();
  const { addToCart } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: rank * 0.12 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
    >
      {rank === 0 && (
        <div className="bg-gradient-to-r from-[#2D6A4F] to-[#40916C] text-white text-center text-xs font-bold py-2 uppercase tracking-widest">
          ⭐ Recommandation principale
        </div>
      )}
      <div className="flex gap-4 p-4">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[#2D6A4F] font-semibold uppercase tracking-wide mb-1">{product.category}</p>
          <p className="font-bold text-gray-900 text-sm leading-tight mb-2 line-clamp-2">{product.name}</p>
          <p className="text-lg font-bold text-gray-900">{product.price.toLocaleString('fr-DZ')} DZD</p>
        </div>
      </div>
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={() => navigate(`/product/${product.id}`)}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide border-2 border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white transition-all"
        >
          Voir le produit
        </button>
        <button
          onClick={() => { addToCart(product); navigate('/checkout'); }}
          className="flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-white flex items-center justify-center gap-1.5 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #2D6A4F, #40916C)' }}
        >
          <ShoppingBag size={13} />
          Commander
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Quiz Page ─────────────────────────────────────────────
export default function BeautyQuiz() {
  const navigate = useNavigate();
  const { products } = useAppContext();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [direction, setDirection] = useState(1);

  const currentStep = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const handleSelect = (idx: number) => setSelected(idx);

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (step < STEPS.length - 1) {
      setDirection(1);
      setStep(s => s + 1);
      setSelected(null);
    } else {
      // Calculate results
      const allTags = newAnswers.flatMap((answerIdx, stepIdx) =>
        STEPS[stepIdx].options[answerIdx].tags
      );
      const scored = [...products]
        .map(p => ({ product: p, score: scoreProduct(p, allTags) }))
        .sort((a, b) => b.score - a.score || b.product.stock - a.product.stock)
        .filter(({ product }) => product.stock > 0)
        .slice(0, 3)
        .map(({ product }) => product);

      // fallback: if not enough matches, fill with random in-stock products
      const fallback = products.filter(p => p.stock > 0 && !scored.includes(p));
      const final = [...scored, ...fallback].slice(0, 3);
      setRecommendations(final);
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep(s => s - 1);
    setAnswers(a => a.slice(0, -1));
    setSelected(answers[step - 1] ?? null);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([]);
    setSelected(null);
    setShowResults(false);
    setRecommendations([]);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-10"
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl"
                style={{ background: 'linear-gradient(135deg, #EAF3DE, #C9A84C22)' }}>
                💅
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-3">
                Tes soins idéaux !
              </h2>
              <p className="text-gray-500 max-w-sm mx-auto">
                Basé sur tes réponses, voici les produits qui correspondent parfaitement à ta peau.
              </p>
            </motion.div>

            <div className="space-y-4 mb-8">
              {recommendations.map((p, i) => (
                <ProductCard key={p.id} product={p} rank={i} />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 py-3.5 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:border-gray-400 transition-colors"
              >
                <RotateCcw size={15} />
                Refaire le quiz
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm uppercase tracking-wide transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2D6A4F, #40916C)' }}
              >
                Voir tous les produits
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-xl mx-auto px-4">

          {/* Back button */}
          <button
            onClick={() => step === 0 ? navigate('/') : handleBack()}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8 font-medium"
          >
            <ArrowLeft size={16} />
            {step === 0 ? 'Retour' : 'Question précédente'}
          </button>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <StepDots total={STEPS.length} current={step} />
              <span className="text-xs text-gray-400 font-medium">{step + 1} / {STEPS.length}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #2D6A4F, #C9A84C)' }}
                animate={{ width: `${progress + 20}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 40 }}
              transition={{ duration: 0.25 }}
            >
              {/* Quiz header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 bg-[#EAF3DE] text-[#2D6A4F] px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide mb-4">
                  💅 Quiz Beauté
                </div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-gray-900 mb-2 leading-tight">
                  {currentStep.question}
                </h2>
                <p className="text-gray-400 text-sm">{currentStep.subtitle}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {currentStep.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelect(idx)}
                    className="relative flex flex-col items-center text-center gap-3 p-5 rounded-2xl border-2 transition-all"
                    style={{
                      borderColor: selected === idx ? '#2D6A4F' : '#E5E7EB',
                      background: selected === idx
                        ? 'linear-gradient(135deg, #EAF3DE, #F0FAF5)'
                        : 'white',
                    }}
                  >
                    {selected === idx && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#2D6A4F] flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                    <span className="text-3xl">{option.emoji}</span>
                    <span className="font-bold text-sm text-gray-900">{option.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Next button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={selected === null}
                className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all"
                style={{
                  background: selected !== null
                    ? 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)'
                    : '#F3F4F6',
                  color: selected !== null ? 'white' : '#9CA3AF',
                  cursor: selected !== null ? 'pointer' : 'not-allowed',
                }}
              >
                {step === STEPS.length - 1 ? 'Voir mes recommandations ✨' : 'Question suivante'}
                {step < STEPS.length - 1 && <ArrowRight size={16} />}
              </motion.button>
            </motion.div>
          </AnimatePresence>

        </div>
      </main>
      <Footer />
    </div>
  );
}
