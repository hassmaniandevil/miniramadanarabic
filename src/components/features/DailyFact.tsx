'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui';
import { DailyFact as DailyFactType, getCategoryColor, getCategoryLabel } from '@/data/dailyFacts';
import { MessageCircle } from 'lucide-react';

interface DailyFactProps {
  fact: DailyFactType;
  variant?: 'suhoor' | 'iftar';
}

export function DailyFact({ fact, variant = 'suhoor' }: DailyFactProps) {
  const isSuhoor = variant === 'suhoor';
  const categoryColor = getCategoryColor(fact.category);
  const categoryLabel = getCategoryLabel(fact.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="relative overflow-hidden">
        {/* Gradient header */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${categoryColor}`} />

        {/* Background emoji */}
        <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
          <span className="text-7xl">{fact.emoji}</span>
        </div>

        <div className="relative pt-2">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryColor} text-white`}>
              {categoryLabel}
            </span>
            <span className={`text-xs ${isSuhoor ? 'text-indigo-300' : 'text-amber-300'}`}>
              {isSuhoor ? '🌅 رسالة السحور' : '🌙 رسالة الإفطار'}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <span>{fact.emoji}</span>
            {fact.title}
          </h3>

          {/* Main fact */}
          <p className="text-white/90 leading-relaxed mb-4 text-lg">
            {fact.fact}
          </p>

          {/* Follow-up question/activity */}
          {fact.followUp && (
            <div className={`p-3 rounded-xl ${
              isSuhoor
                ? 'bg-indigo-500/20 border border-indigo-500/30'
                : 'bg-amber-500/20 border border-amber-500/30'
            }`}>
              <div className="flex items-start gap-2">
                <MessageCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isSuhoor ? 'text-indigo-300' : 'text-amber-300'
                }`} />
                <p className={`text-sm font-medium ${
                  isSuhoor ? 'text-indigo-200' : 'text-amber-200'
                }`}>
                  {fact.followUp}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
