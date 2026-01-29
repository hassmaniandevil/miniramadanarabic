'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, Button, Star } from '@/components/ui';
import { FeelingLevel } from '@/types';
import { getWordsForDay } from '@/data/feelingsWords';

interface FeelingCheckInProps {
  day: number;
  onComplete: (feeling: FeelingLevel, word?: string, note?: string) => void;
  isCompleted?: boolean;
  completedData?: { feelingLevel: FeelingLevel; feelingWord?: string };
}

const feelingOptions: { level: FeelingLevel; emoji: string; label: string }[] = [
  { level: 'really_hard', emoji: '😢', label: 'صعب جداً' },
  { level: 'bit_tough', emoji: '😕', label: 'صعب قليلاً' },
  { level: 'okay', emoji: '😐', label: 'عادي' },
  { level: 'good', emoji: '🙂', label: 'جيد' },
  { level: 'really_good', emoji: '😊', label: 'ممتاز' },
];

export function FeelingCheckIn({
  day,
  onComplete,
  isCompleted,
  completedData,
}: FeelingCheckInProps) {
  const [step, setStep] = useState(1);
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingLevel | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAwarded, setHasAwarded] = useState(isCompleted);

  // Reset internal state when day changes
  useEffect(() => {
    setStep(1);
    setSelectedFeeling(null);
    setSelectedWord(null);
    setNote('');
    setIsSubmitting(false);
    setHasAwarded(isCompleted || false);
  }, [day, isCompleted]);

  const wordsForToday = getWordsForDay(day);

  const handleFeelingSelect = (feeling: FeelingLevel) => {
    setSelectedFeeling(feeling);
    setStep(2);
  };

  const handleWordSelect = (word: string) => {
    setSelectedWord(word);
    setStep(3);
  };

  const handleComplete = () => {
    if (!selectedFeeling || isCompleted || hasAwarded) return;
    setIsSubmitting(true);
    setHasAwarded(true);
    onComplete(selectedFeeling, selectedWord || undefined, note || undefined);
  };

  const handleSkip = () => {
    if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      handleComplete();
    }
  };

  if (isCompleted && completedData) {
    const feeling = feelingOptions.find((f) => f.level === completedData.feelingLevel);
    return (
      <Card variant="glow" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">شعور اليوم</h3>
            <Star size="md" animate />
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl">
            <span className="text-4xl">{feeling?.emoji}</span>
            <div>
              <p className="font-medium text-white">{feeling?.label}</p>
              {completedData.feelingWord && (
                <p className="text-sm text-violet-400">{completedData.feelingWord}</p>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">كيف كان يومك؟</h3>
        <div className="flex gap-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                step >= s ? 'bg-violet-400' : 'bg-slate-700'
              )}
            />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="feelings"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="text-sm text-slate-400 mb-4">اضغط على شعورك</p>
            <div className="grid grid-cols-5 gap-2">
              {feelingOptions.map((option) => (
                <button
                  key={option.level}
                  onClick={() => handleFeelingSelect(option.level)}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-700 hover:border-violet-500 hover:bg-violet-500/10 transition-all"
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-xs text-slate-400 text-center leading-tight">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="words"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="text-sm text-slate-400 mb-4">ما هي كلمة اليوم؟</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {wordsForToday.map((word) => (
                <button
                  key={word.word}
                  onClick={() => handleWordSelect(word.word)}
                  className={cn(
                    'p-3 rounded-xl border transition-all flex items-center gap-2',
                    selectedWord === word.word
                      ? 'border-violet-500 bg-violet-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  )}
                >
                  <span className="text-lg">{word.emoji}</span>
                  <span className="text-sm text-slate-300">{word.word}</span>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={handleSkip} className="w-full">
              تخطي
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="note"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <p className="text-sm text-slate-400 mb-4">
              هل تريد تذكُّر شيء عن اليوم؟
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اختياري - اكتب ملاحظة قصيرة"
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none h-20 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent mb-4"
            />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={handleSkip} className="flex-1">
                تخطي
              </Button>
              <Button
                onClick={handleComplete}
                isLoading={isSubmitting}
                className="flex-1"
              >
                تم
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
