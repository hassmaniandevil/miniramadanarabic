'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, Button, Star } from '@/components/ui';
import { FoodGroup } from '@/types';
import { Camera, Check } from 'lucide-react';

interface SuhoorLoggerProps {
  onLog: (foodGroups: FoodGroup[], photoUrl?: string) => void;
  isLogged?: boolean;
  currentLog?: { foodGroups: FoodGroup[] };
}

const foodOptions: { group: FoodGroup; emoji: string; label: string }[] = [
  { group: 'water', emoji: '💧', label: 'ماء' },
  { group: 'protein', emoji: '🥚', label: 'بروتين' },
  { group: 'fibre', emoji: '🥬', label: 'ألياف' },
  { group: 'fruit', emoji: '🍌', label: 'فواكه' },
  { group: 'dairy', emoji: '🥛', label: 'حليب' },
  { group: 'grains', emoji: '🍞', label: 'حبوب' },
];

export function SuhoorLogger({ onLog, isLogged, currentLog }: SuhoorLoggerProps) {
  const [selectedFoods, setSelectedFoods] = useState<FoodGroup[]>(
    currentLog?.foodGroups || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleFood = (group: FoodGroup) => {
    setSelectedFoods((prev) =>
      prev.includes(group)
        ? prev.filter((f) => f !== group)
        : [...prev, group]
    );
  };

  const handleSubmit = () => {
    if (selectedFoods.length === 0) return;
    setIsSubmitting(true);
    onLog(selectedFoods);
  };

  const getStarsEarned = () => {
    if (selectedFoods.length === 0) return 0;
    if (selectedFoods.length >= 4) return 2;
    return 1;
  };

  if (isLogged && currentLog) {
    return (
      <Card variant="glow" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">تم تسجيل السحور</h3>
            <div className="flex items-center gap-1">
              {Array.from({ length: getStarsEarned() }).map((_, i) => (
                <Star key={i} size="sm" animate />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentLog.foodGroups.map((group) => {
              const food = foodOptions.find((f) => f.group === group);
              return (
                <div
                  key={group}
                  className="px-3 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/30 flex items-center gap-2"
                >
                  <span className="text-xl">{food?.emoji}</span>
                  <span className="text-sm text-emerald-300">{food?.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-center text-slate-400 text-sm mt-4">
            اختيارات سحور رائعة!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-2">ماذا أكلتَ في السحور؟</h3>
      <p className="text-sm text-slate-400 mb-4">اضغط على كل ما أكلته</p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {foodOptions.map((food) => {
          const isSelected = selectedFoods.includes(food.group);
          return (
            <motion.button
              key={food.group}
              onClick={() => toggleFood(food.group)}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2',
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
              )}
            >
              <span className="text-3xl">{food.emoji}</span>
              <span className={cn(
                'text-sm',
                isSelected ? 'text-emerald-300' : 'text-slate-400'
              )}>
                {food.label}
              </span>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* خيار الصورة */}
      <div className="border border-dashed border-slate-600 rounded-xl p-4 mb-4 flex items-center justify-center gap-3 text-slate-400 hover:border-slate-500 cursor-pointer transition-colors">
        <Camera className="w-5 h-5" />
        <span className="text-sm">أضف صورة (اختياري)</span>
      </div>

      {/* معاينة النجوم */}
      {selectedFoods.length > 0 && (
        <div className="flex items-center justify-center gap-2 mb-4 text-sm text-slate-400">
          <span>ستحصل على</span>
          <div className="flex gap-0.5">
            {Array.from({ length: getStarsEarned() }).map((_, i) => (
              <Star key={i} size="sm" />
            ))}
          </div>
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={selectedFoods.length === 0 || isSubmitting}
        isLoading={isSubmitting}
        className="w-full"
      >
        تسجيل السحور
      </Button>
    </Card>
  );
}
