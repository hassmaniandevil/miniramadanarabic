'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, Button, Star } from '@/components/ui';
import { KindnessMission as KindnessMissionType } from '@/types';
import { Heart, Home, Users, Sparkles, HandHeart, Lock, Check } from 'lucide-react';

interface KindnessMissionProps {
  mission: KindnessMissionType;
  onComplete: (note?: string) => void;
  isCompleted?: boolean;
}

const categoryIcons = {
  home: Home,
  social: Users,
  spiritual: Sparkles,
  charity: HandHeart,
};


const categoryBgColors = {
  home: 'bg-blue-500/10 border-blue-500/20',
  social: 'bg-green-500/10 border-green-500/20',
  spiritual: 'bg-purple-500/10 border-purple-500/20',
  charity: 'bg-amber-500/10 border-amber-500/20',
};

export function KindnessMission({ mission, onComplete, isCompleted }: KindnessMissionProps) {
  const [showNote, setShowNote] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAwarded, setHasAwarded] = useState(isCompleted);

  // Reset internal state when mission (day) changes
  useEffect(() => {
    setShowNote(false);
    setNote('');
    setIsSubmitting(false);
    setHasAwarded(isCompleted || false);
  }, [mission.id, isCompleted]);

  const Icon = categoryIcons[mission.category];

  const handleComplete = () => {
    if (isCompleted || hasAwarded) return;
    if (mission.isQuietStar) {
      setShowNote(true);
    } else {
      setIsSubmitting(true);
      setHasAwarded(true);
      onComplete();
    }
  };

  const handleSubmitWithNote = () => {
    if (isCompleted || hasAwarded) return;
    setIsSubmitting(true);
    setHasAwarded(true);
    onComplete(note);
  };

  if (isCompleted) {
    return (
      <Card variant="glow" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-emerald-400 font-medium">
                المهمة مكتملة!
              </span>
            </div>
            <Star size="md" animate />
          </div>

          <h3 className="text-lg font-semibold text-white mb-2">{mission.title}</h3>
          <p className="text-sm text-slate-400">{mission.description}</p>

          {mission.isQuietStar && (
            <div className="mt-3 flex items-center gap-2 text-purple-400 text-sm">
              <Lock className="w-4 h-4" />
              <span>لُطف سري - بينك وبين الله فقط</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!showNote ? (
          <motion.div
            key="mission"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Category badge */}
            <div className="flex items-center justify-between mb-4">
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border',
                  categoryBgColors[mission.category]
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium capitalize">{mission.category}</span>
              </div>

              {mission.isQuietStar && (
                <div className="flex items-center gap-1.5 text-purple-400">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs">نجمة هادئة</span>
                </div>
              )}
            </div>

            {/* Mission content */}
            <h3 className="text-xl font-semibold text-white mb-2">{mission.title}</h3>
            <p className="text-slate-300 mb-6 leading-relaxed">{mission.description}</p>

            {/* شرح النجمة الهادئة */}
            {mission.isQuietStar && (
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20 mb-4">
                <p className="text-sm text-purple-300">
                  هذا لُطف سري. لا أحد يحتاج أن يعرف ما فعلتَ - بينك وبين الله فقط.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleComplete} className="flex-1" isLoading={isSubmitting}>
                <Heart className="w-4 h-4 ml-2" />
                فعلتُها!
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">نجمتك الهادئة</h3>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              يمكنك كتابة ملاحظة خاصة عن لُطفك السري. أنت وحدك سترى هذا.
            </p>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ماذا فعلتَ؟ (اختياري)"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
            />

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowNote(false)}
                className="flex-1"
              >
                رجوع
              </Button>
              <Button
                onClick={handleSubmitWithNote}
                className="flex-1"
                isLoading={isSubmitting}
              >
                إتمام
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
