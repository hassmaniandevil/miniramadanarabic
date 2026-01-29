'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimeCapsule, Profile } from '@/types';
import { Mail, Sparkles, Heart, X } from 'lucide-react';
import { Button } from '@/components/ui';
import confetti from 'canvas-confetti';

interface TimeCapsuleRevealProps {
  capsule: TimeCapsule;
  author: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onRevealed?: () => void;
}

export function TimeCapsuleReveal({
  capsule,
  author,
  isOpen,
  onClose,
  onRevealed,
}: TimeCapsuleRevealProps) {
  const [stage, setStage] = useState<'sealed' | 'opening' | 'revealed'>('sealed');

  useEffect(() => {
    if (isOpen && capsule.isRevealed) {
      setStage('revealed');
    } else if (isOpen) {
      setStage('sealed');
    }
  }, [isOpen, capsule.isRevealed]);

  const handleOpen = () => {
    setStage('opening');

    // Trigger opening animation
    setTimeout(() => {
      setStage('revealed');

      // Fire confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
      });

      onRevealed?.();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      >
        {/* Close button */}
        {stage === 'revealed' && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Sealed state */}
            {stage === 'sealed' && (
              <motion.div
                key="sealed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                {/* Sealed envelope */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotateZ: [0, -2, 2, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className="relative inline-block mb-8"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-amber-400/30 blur-3xl rounded-full" />

                  {/* Envelope */}
                  <div className="relative w-40 h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-2xl shadow-amber-500/50">
                    {/* Flap */}
                    <div className="absolute top-0 left-0 right-0 h-16">
                      <svg viewBox="0 0 160 64" className="w-full h-full">
                        <path
                          d="M0 0 L80 48 L160 0 L160 64 L0 64 Z"
                          fill="url(#envelope-gradient)"
                        />
                        <defs>
                          <linearGradient id="envelope-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Seal */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-red-500 rounded-full shadow-lg flex items-center justify-center">
                      <Heart className="w-8 h-8 text-white fill-white" />
                    </div>
                  </div>

                  {/* Sparkles */}
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-4 -left-4"
                  >
                    <Sparkles className="w-8 h-8 text-amber-300" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -bottom-2 -right-4"
                  >
                    <Sparkles className="w-6 h-6 text-amber-200" />
                  </motion.div>
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  رسالة من الماضي
                </h2>
                <p className="text-slate-300 mb-2">
                  {author?.nickname || 'شخص مميز'} كتب هذا لك خلال رمضان{' '}
                  {capsule.writtenYear}
                </p>
                <p className="text-amber-400 text-sm mb-8">
                  حان وقت كشف ما بالداخل...
                </p>

                <Button
                  onClick={handleOpen}
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30"
                >
                  <Mail className="w-5 h-5 ml-2" />
                  افتح كبسولة الزمن
                </Button>
              </motion.div>
            )}

            {/* Opening animation */}
            {stage === 'opening' && (
              <motion.div
                key="opening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1.5],
                    opacity: [1, 1, 0],
                  }}
                  transition={{ duration: 2 }}
                  className="relative inline-block mb-8"
                >
                  {/* Burst effect */}
                  <motion.div
                    animate={{
                      scale: [1, 3],
                      opacity: [0.8, 0],
                    }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 bg-amber-400/50 rounded-full blur-xl"
                  />

                  <div className="w-40 h-40 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, ease: 'linear' }}
                    >
                      <Sparkles className="w-16 h-16 text-white" />
                    </motion.div>
                  </div>
                </motion.div>

                <p className="text-white text-xl animate-pulse">جاري الفتح...</p>
              </motion.div>
            )}

            {/* Revealed state */}
            {stage === 'revealed' && (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', damping: 20 }}
                className="text-center"
              >
                {/* Message card */}
                <motion.div
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 md:p-8 shadow-2xl"
                >
                  {/* Header */}
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="text-sm font-medium text-amber-600 uppercase tracking-wide">
                      كبسولة زمن من رمضان {capsule.writtenYear}
                    </span>
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>

                  {/* Author info */}
                  {author && (
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl">
                        {author.avatar || author.nickname[0]}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">رسالة من</p>
                        <p className="font-semibold text-slate-800">{author.nickname}</p>
                      </div>
                    </div>
                  )}

                  {/* Message */}
                  <div className="relative">
                    <div className="absolute -left-2 top-0 text-6xl text-amber-200 font-serif">
                      &ldquo;
                    </div>
                    <p className="text-slate-700 text-lg leading-relaxed px-6 py-4 italic">
                      {capsule.message}
                    </p>
                    <div className="absolute -right-2 bottom-0 text-6xl text-amber-200 font-serif">
                      &rdquo;
                    </div>
                  </div>

                  {/* Voice message indicator */}
                  {capsule.voiceUrl && (
                    <div className="mt-6 p-3 bg-amber-100 rounded-xl flex items-center justify-center gap-2">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                        <span className="text-white">▶</span>
                      </div>
                      <span className="text-amber-700 text-sm">تم تضمين رسالة صوتية</span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-6 pt-6 border-t border-amber-200">
                    <p className="text-sm text-slate-500">
                      كُتبت بحب خلال رمضان {capsule.writtenYear}
                    </p>
                  </div>
                </motion.div>

                <Button onClick={onClose} variant="ghost" className="mt-6 text-white">
                  إغلاق
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
