'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { BookOpen, Star, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface QuranTrackerProps {
  day?: number;
  onComplete: (pages?: number, surah?: string) => void;
  isCompleted?: boolean;
}

const readingOptions = [
  { id: 'few_ayat', label: 'بضع آيات', description: 'قرأتُ بضع آيات', pages: 0.5 },
  { id: 'one_page', label: 'صفحة واحدة', description: 'قرأتُ صفحة كاملة', pages: 1 },
  { id: 'two_pages', label: 'صفحتين أو أكثر', description: 'قرأتُ صفحتين فأكثر', pages: 2 },
  { id: 'juz', label: 'جزء كامل', description: 'قرأتُ جزءاً كاملاً', pages: 20 },
];

export function QuranTracker({ day, onComplete, isCompleted = false }: QuranTrackerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasAwarded, setHasAwarded] = useState(isCompleted);

  // Reset internal state when day changes or isCompleted prop changes
  useEffect(() => {
    setHasAwarded(isCompleted);
    if (!isCompleted) {
      setSelectedOption(null);
      setIsExpanded(false);
    }
  }, [day, isCompleted]);

  const handleComplete = () => {
    if (hasAwarded || !selectedOption) return;

    const option = readingOptions.find(o => o.id === selectedOption);
    setHasAwarded(true);
    onComplete(option?.pages);
    setIsExpanded(false);
  };

  if (hasAwarded || isCompleted) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">قراءة القرآن</h3>
                <p className="text-sm text-green-400">ما شاء الله! أتممتَ القراءة اليوم</p>
              </div>
            </div>
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-400" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400 flex items-center justify-center flex-shrink-0 shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-300 font-medium">
                يومي
              </span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white">قراءة القرآن</h3>
          </div>
        </div>

        {/* الوصف */}
        <p className="text-slate-300 mb-4">
          هل قرأتَ شيئاً من القرآن اليوم؟ كل آية تُحسب!
        </p>

        {/* Expandable selector */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors mb-4"
        >
          <span className="text-sm text-slate-400">
            {selectedOption
              ? readingOptions.find(o => o.id === selectedOption)?.label
              : 'كم قرأتَ؟'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 mb-4">
                {readingOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={`w-full p-3 rounded-xl border transition-all text-left ${
                      selectedOption === option.id
                        ? 'bg-green-500/20 border-green-500/50 text-white'
                        : 'bg-slate-800/30 border-slate-700/50 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{option.label}</p>
                        <p className="text-sm text-slate-400">{option.description}</p>
                      </div>
                      {selectedOption === option.id && (
                        <Check className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* زر الإتمام */}
        <Button
          onClick={handleComplete}
          disabled={!selectedOption}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-400"
        >
          <Sparkles className="w-4 h-4 ml-2" />
          قرأتُ القرآن اليوم!
        </Button>
      </div>
    </Card>
  );
}
