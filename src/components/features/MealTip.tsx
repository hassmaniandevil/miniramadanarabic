'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui';
import { MealKnowledge } from '@/data/mealKnowledge';
import { Lightbulb, Sparkles } from 'lucide-react';

interface MealTipProps {
  knowledge: MealKnowledge;
  variant?: 'suhoor' | 'iftar';
}

export function MealTip({ knowledge, variant = 'suhoor' }: MealTipProps) {
  const isSuhoor = variant === 'suhoor';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`relative overflow-hidden ${
          isSuhoor
            ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-400/30'
            : 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-400/30'
        }`}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
          <span className="text-8xl">{knowledge.emoji}</span>
        </div>

        <div className="relative">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className={`p-2 rounded-lg ${
                isSuhoor
                  ? 'bg-indigo-500/30 text-indigo-300'
                  : 'bg-amber-500/30 text-amber-300'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <p className={`text-xs font-medium uppercase tracking-wide ${
                isSuhoor ? 'text-indigo-300' : 'text-amber-300'
              }`}>
                {isSuhoor ? 'نصيحة السحور' : 'نصيحة الإفطار'}
              </p>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {knowledge.emoji} {knowledge.title}
              </h3>
            </div>
          </div>

          {/* Main tip */}
          <p className="text-white/90 mb-3 leading-relaxed">
            {knowledge.tip}
          </p>

          {/* Fun fact */}
          {knowledge.funFact && (
            <div className={`p-3 rounded-xl ${
              isSuhoor ? 'bg-indigo-500/20' : 'bg-amber-500/20'
            }`}>
              <div className="flex items-start gap-2">
                <Sparkles className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isSuhoor ? 'text-indigo-300' : 'text-amber-300'
                }`} />
                <p className={`text-sm ${
                  isSuhoor ? 'text-indigo-200' : 'text-amber-200'
                }`}>
                  <span className="font-medium">معلومة ممتعة:</span> {knowledge.funFact}
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
