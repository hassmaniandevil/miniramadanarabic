'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { PreparationActivity, categoryInfo } from '@/data/preparationActivities';
import { Star, ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react';

interface PreparationCardProps {
  activity: PreparationActivity;
  daysUntilRamadan?: number;
  onComplete: () => void;
  isCompleted?: boolean;
}

export function PreparationCard({ activity, onComplete, isCompleted = false }: PreparationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasAwarded, setHasAwarded] = useState(isCompleted);

  const category = categoryInfo[activity.category];

  const handleComplete = () => {
    if (isCompleted || hasAwarded) return;
    setHasAwarded(true);
    onComplete();
  };

  if (isCompleted) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-emerald-400 font-medium">مكتمل!</span>
            </div>
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">{activity.title}</h3>
          <p className="text-sm text-slate-400 mt-1">{activity.forKids}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      {/* Category gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${category.color}`} />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center flex-shrink-0 shadow-lg text-2xl`}>
            {category.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-medium">
                {category.label}
              </span>
              <span className="text-xs text-slate-500">
                اليوم {24 - activity.day + 1} من ٢٤
              </span>
            </div>
            <h3 className="text-lg font-bold text-white leading-tight">{activity.title}</h3>
          </div>
        </div>

        {/* Kid-friendly description */}
        <p className="text-slate-300 mb-4">{activity.forKids}</p>

        {/* Expandable details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors mb-4"
        >
          <span className="text-sm text-slate-400">
            {isExpanded ? 'إخفاء التفاصيل' : 'كيف أفعل هذا؟'}
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
              <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 mb-4">
                <p className="text-sm text-slate-300">{activity.description}</p>
                {activity.howTo && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">الطريقة:</p>
                    <p className="text-sm text-slate-300">{activity.howTo}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* زر الإتمام */}
        <Button
          onClick={handleComplete}
          className={`w-full bg-gradient-to-r ${category.color}`}
          disabled={hasAwarded}
        >
          {hasAwarded ? (
            <>
              <Check className="w-4 h-4 ml-2" />
              تم!
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 ml-2" />
              أنجزناها!
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}

// Progress ring for preparation
interface PreparationProgressProps {
  completedCount: number;
  totalDays?: number;
  daysUntilRamadan: number;
}

export function PreparationProgress({ completedCount, daysUntilRamadan }: PreparationProgressProps) {
  const availableDays = Math.min(24, daysUntilRamadan);
  const percentage = availableDays > 0 ? (completedCount / availableDays) * 100 : 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-700"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="url(#prepGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.76} 176`}
          />
          <defs>
            <linearGradient id="prepGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-white">{completedCount}</span>
        </div>
      </div>
      <div>
        <p className="font-medium text-white">تقدم التحضيرات</p>
        <p className="text-sm text-slate-400">
          {completedCount} من {availableDays} نشاط مكتمل
        </p>
      </div>
    </div>
  );
}
