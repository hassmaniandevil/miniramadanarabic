'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { BedtimeStory as BedtimeStoryType } from '@/data/bedtimeStories';
import { Moon, BookOpen, Star, ChevronUp, Sparkles, Volume2 } from 'lucide-react';

interface BedtimeStoryProps {
  story: BedtimeStoryType;
  isPremium?: boolean;
  onComplete?: () => void;
  isCompleted?: boolean;
}

export function BedtimeStory({ story, isPremium = false, onComplete, isCompleted = false }: BedtimeStoryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAwarded, setHasAwarded] = useState(isCompleted);

  // Reset internal state when story (day) changes
  useEffect(() => {
    setIsExpanded(false);
    setHasAwarded(isCompleted);
  }, [story.day, isCompleted]);

  const handleRead = () => {
    if (!isPremium) return;
    setIsExpanded(true);
  };

  const handleComplete = () => {
    if (onComplete && !isCompleted && !hasAwarded) {
      setHasAwarded(true);
      onComplete();
    }
  };

  const handleTextToSpeech = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(story.story);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Decorative night sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-slate-900/30 pointer-events-none" />

      {/* Stars decoration */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-60">
        <Star className="w-3 h-3 text-amber-300 fill-amber-300 twinkle" style={{ animationDelay: '0s' }} />
        <Star className="w-2 h-2 text-amber-200 fill-amber-200 twinkle" style={{ animationDelay: '0.5s' }} />
        <Star className="w-3 h-3 text-amber-300 fill-amber-300 twinkle" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Moon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 font-medium">
                قصة ما قبل النوم
              </span>
              <span className="text-xs text-slate-400">اليوم {story.day}</span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">{story.title}</h3>
          </div>
        </div>

        {/* Theme badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-200 capitalize">
            {story.theme}
          </span>
          {isCompleted && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              مقروءة
            </span>
          )}
        </div>

        {/* بوابة المميز أو زر التوسيع */}
        {!isPremium ? (
          <div className="p-4 rounded-xl bg-slate-800/50 border border-amber-500/30 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
              <Star className="w-5 h-5 text-amber-400" />
            </div>
            <p className="text-sm text-slate-300 mb-1">ميزة مميزة</p>
            <p className="text-xs text-slate-400">قم بالترقية إلى اشتراك رمضان لفتح قصص ما قبل النوم</p>
          </div>
        ) : (
          <>
            {/* Preview or toggle */}
            {!isExpanded && (
              <Button
                onClick={handleRead}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <BookOpen className="w-4 h-4 ml-2" />
                اقرأ قصة الليلة
              </Button>
            )}

            {/* Expanded story */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* نص القصة */}
                  <div className="mt-4 p-4 rounded-xl bg-slate-800/50 border border-slate-600/30">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-amber-300">القصة</h4>
                      <button
                        onClick={handleTextToSpeech}
                        className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors"
                        title="استمع للقصة"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                      {story.story}
                    </div>
                  </div>

                  {/* الحكمة */}
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-300 mb-1">الدرس المستفاد</p>
                        <p className="text-sm text-amber-100">{story.moral}</p>
                      </div>
                    </div>
                  </div>

                  {/* الأزرار */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(false)}
                      className="flex-1"
                    >
                      <ChevronUp className="w-4 h-4 ml-1" />
                      إغلاق
                    </Button>
                    {!isCompleted && (
                      <Button
                        size="sm"
                        onClick={handleComplete}
                        className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900"
                      >
                        <Star className="w-4 h-4 ml-1" />
                        انتهيت!
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </Card>
  );
}
