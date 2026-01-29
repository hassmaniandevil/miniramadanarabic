'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, Star } from '@/components/ui';
import { WonderCard as WonderCardType } from '@/types';
import { Sparkles, MessageCircle, BookOpen, ChevronRight } from 'lucide-react';

interface WonderCardProps {
  card: WonderCardType;
  onView: () => void;
  isViewed?: boolean;
}

export function WonderCard({ card, onView, isViewed }: WonderCardProps) {
  const [isRevealed, setIsRevealed] = useState(isViewed);
  const [showDetails, setShowDetails] = useState(false);
  const [hasAwarded, setHasAwarded] = useState(isViewed);

  // Reset internal state when day changes
  useEffect(() => {
    setIsRevealed(isViewed || false);
    setShowDetails(false);
    setHasAwarded(isViewed || false);
  }, [card.day, isViewed]);

  const handleReveal = () => {
    setIsRevealed(true);
    if (!hasAwarded && !isViewed) {
      setHasAwarded(true);
      onView();
    }
  };

  if (!isRevealed) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleReveal}
        className="cursor-pointer"
      >
        <Card
          variant="glow"
          className="relative overflow-hidden bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-500/30"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />

          {/* Floating sparkles animation */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-amber-400/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [-20, -40],
                  x: [0, (i - 2) * 10],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.4,
                }}
                style={{
                  left: `${20 + i * 15}%`,
                  top: '60%',
                }}
              >
                <Sparkles className="w-4 h-4" />
              </motion.div>
            ))}
          </div>

          <div className="relative text-center py-8">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Sparkles className="w-8 h-8 text-slate-900" />
              </div>
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">
              عجيبة اليوم {card.day}
            </h3>
            <p className="text-slate-400 text-sm">اضغط لكشف اكتشاف اليوم</p>
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card variant="glow" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-white">عجيبة اليوم {card.day}</h3>
              <p className="text-xs text-slate-400">اكتشاف اليوم</p>
            </div>
          </div>
          <Star size="md" animate />
        </div>

        {/* Fact */}
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-4">
          <p className="text-slate-200 leading-relaxed">{card.fact}</p>
        </div>

        {/* Tell Someone prompt */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 hover:bg-amber-500/20 transition-colors"
        >
          <MessageCircle className="w-5 h-5 text-amber-400" />
          <span className="flex-1 text-right text-sm text-amber-300">
            أخبر أحداً على العشاء...
          </span>
          <ChevronRight className={cn(
            'w-4 h-4 text-amber-400 transition-transform',
            showDetails && 'rotate-90'
          )} />
        </button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-3">
                <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <p className="text-sm text-slate-300 italic">
                    &ldquo;{card.tellSomeonePrompt}&rdquo;
                  </p>
                </div>

                {/* كلمة اليوم */}
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-300 uppercase tracking-wider">
                      كلمة اليوم
                    </span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-bold text-white">{card.todaysWord}</span>
                    {card.todaysWordArabic && (
                      <span className="text-xl text-purple-300" dir="rtl">
                        {card.todaysWordArabic}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{card.todaysWordMeaning}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
}
