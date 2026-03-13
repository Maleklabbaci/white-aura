import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  productName?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = 'Avant',
  afterLabel = 'Après',
  productName = '',
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const getPositionFromEvent = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setPosition((x / rect.width) * 100);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasInteracted(true);
    getPositionFromEvent(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setHasInteracted(true);
    getPositionFromEvent(e.touches[0].clientX);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      getPositionFromEvent(e.clientX);
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      getPositionFromEvent(e.touches[0].clientX);
    };
    const handleUp = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isDragging, getPositionFromEvent]);

  // Intro animation: sweep from 50 to 30 then back to 50
  useEffect(() => {
    if (hasInteracted) return;
    let frame: number;
    let start: number | null = null;
    const duration = 1400;
    const animate = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
      setPosition(50 - Math.sin(eased * Math.PI) * 18);
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    const timeout = setTimeout(() => { frame = requestAnimationFrame(animate); }, 800);
    return () => { clearTimeout(timeout); cancelAnimationFrame(frame); };
  }, [hasInteracted]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-gradient-to-b from-[#2D6A4F] to-[#C9A84C] rounded-full" />
        <h3 className="text-base font-bold text-gray-900 uppercase tracking-widest text-sm">
          Résultats visibles
        </h3>
      </div>

      {/* Slider container */}
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-2xl select-none"
        style={{ aspectRatio: '4/3', cursor: isDragging ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* AFTER image (base layer - full width) */}
        <img
          src={afterImage}
          alt={`${productName} après`}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
          referrerPolicy="no-referrer"
        />

        {/* BEFORE image (clipped) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${position}%` }}
        >
          <img
            src={beforeImage}
            alt={`${productName} avant`}
            className="absolute inset-0 h-full object-cover"
            style={{ width: `${100 / (position / 100)}%`, maxWidth: 'none' }}
            draggable={false}
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Divider line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
        />

        {/* Drag handle */}
        <div
          className="absolute top-1/2 z-20 flex items-center justify-center"
          style={{
            left: `${position}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center"
            style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.25)' }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M7 11L3 11M3 11L6 8M3 11L6 14" stroke="#1B4332" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 11L19 11M19 11L16 8M19 11L16 14" stroke="#1B4332" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>
            {beforeLabel}
          </span>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white"
            style={{ background: 'rgba(45,106,79,0.8)', backdropFilter: 'blur(6px)' }}>
            {afterLabel}
          </span>
        </div>

        {/* Hint (disappears after interaction) */}
        {!hasInteracted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
          >
            <span className="px-4 py-2 rounded-full text-xs font-semibold text-white flex items-center gap-2"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }}>
              <span>←</span> Glisse pour voir <span>→</span>
            </span>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-xs text-gray-400 font-medium w-10 text-right">{beforeLabel}</span>
        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-75"
            style={{
              width: `${position}%`,
              background: 'linear-gradient(90deg, #374151, #2D6A4F)',
            }}
          />
        </div>
        <span className="text-xs text-[#2D6A4F] font-medium w-10">{afterLabel}</span>
      </div>
    </div>
  );
}
