import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';

// ── Algerian cities & names pool ──────────────────────────────
const WILAYAS = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida',
  'Sétif', 'Tlemcen', 'Batna', 'Béjaïa', 'Sidi Bel Abbès',
  'Biskra', 'Mostaganem', 'Chlef', 'Médéa', 'Tizi Ouzou',
  'Skikda', 'Jijel', 'Boumerdès', 'Tipaza', 'Bouira',
];

const FEMALE_NAMES = [
  'Amira', 'Sara', 'Rania', 'Nadia', 'Yasmine',
  'Meriem', 'Lyna', 'Chaima', 'Assia', 'Djamila',
  'Sirine', 'Hana', 'Nawel', 'Imane', 'Katia',
  'Souad', 'Widad', 'Farah', 'Ines', 'Malak',
];

const TIME_AGO = [
  'à l\'instant', 'il y a 1 min', 'il y a 2 min',
  'il y a 3 min', 'il y a 5 min', 'il y a 7 min',
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Notification Item ─────────────────────────────────────────
interface NotifData {
  id: number;
  name: string;
  city: string;
  product: string;
  time: string;
  imageUrl: string;
}

function OrderNotif({ notif, onClose }: { notif: NotifData; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -80, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: -80, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 pr-4 min-w-[260px] max-w-[300px]"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.14)' }}
    >
      {/* Product thumbnail */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50">
          <img
            src={notif.imageUrl}
            alt={notif.product}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        {/* Green dot */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping absolute" />
          <span className="w-1.5 h-1.5 bg-white rounded-full" />
        </span>
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate">
          {notif.name} <span className="font-normal text-gray-400">de {notif.city}</span>
        </p>
        <p className="text-xs text-gray-500 truncate mt-0.5">
          vient de commander <span className="font-semibold text-[#2D6A4F]">{notif.product}</span>
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
          <p className="text-[10px] text-gray-400">{notif.time}</p>
        </div>
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-300 hover:text-gray-500 transition-colors ml-1"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </motion.div>
  );
}

// ── Main component (mount in App.tsx) ─────────────────────────
export default function LiveOrderPopup() {
  const { products } = useAppContext();
  const [notif, setNotif] = useState<NotifData | null>(null);
  const [counter, setCounter] = useState(0);

  const showNotif = useCallback(() => {
    if (products.length === 0) return;
    const product = randomItem(products);
    setNotif({
      id: Date.now(),
      name: randomItem(FEMALE_NAMES),
      city: randomItem(WILAYAS),
      product: product.name,
      time: randomItem(TIME_AGO),
      imageUrl: product.imageUrl,
    });
  }, [products]);

  // First popup after 4s, then every 12s
  useEffect(() => {
    if (products.length === 0) return;
    const first = setTimeout(() => {
      showNotif();
      setCounter(1);
    }, 4000);
    return () => clearTimeout(first);
  }, [products, showNotif]);

  useEffect(() => {
    if (counter === 0) return;
    const interval = setInterval(() => {
      setNotif(null);
      setTimeout(showNotif, 600);
    }, 12000);
    return () => clearInterval(interval);
  }, [counter, showNotif]);

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!notif) return;
    const t = setTimeout(() => setNotif(null), 5000);
    return () => clearTimeout(t);
  }, [notif]);

  return (
    <div className="fixed bottom-6 left-4 z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <AnimatePresence>
          {notif && (
            <OrderNotif
              key={notif.id}
              notif={notif}
              onClose={() => setNotif(null)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
