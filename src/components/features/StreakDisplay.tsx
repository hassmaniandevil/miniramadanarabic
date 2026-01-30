'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useFamilyStore } from '@/store/familyStore';
import { Flame, Trophy, Calendar } from 'lucide-react';

interface StreakDisplayProps {
  variant?: 'compact' | 'full' | 'badge';
  showLongest?: boolean;
}

export function StreakDisplay({ variant = 'compact', showLongest = true }: StreakDisplayProps) {
  const { family, familyStreak, fetchFamilyStreak } = useFamilyStore();

  useEffect(() => {
    if (family) {
      fetchFamilyStreak();
    }
  }, [family, fetchFamilyStreak]);

  const currentStreak = familyStreak?.currentStreak || 0;
  const longestStreak = familyStreak?.longestStreak || 0;
  const isOnStreak = currentStreak > 0;

  // Determine flame color based on streak length
  const getFlameColor = () => {
    if (currentStreak >= 20) return 'from-purple-500 to-pink-500';
    if (currentStreak >= 10) return 'from-amber-500 to-red-500';
    if (currentStreak >= 5) return 'from-orange-500 to-amber-500';
    return 'from-yellow-500 to-orange-500';
  };

  if (variant === 'badge') {
    if (!isOnStreak) return null;

    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Flame className="w-4 h-4 text-orange-500" />
        </motion.div>
        <span className="text-sm font-bold text-orange-600">{currentStreak}</span>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl" dir="rtl">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getFlameColor()} flex items-center justify-center`}
        >
          <motion.div
            animate={isOnStreak ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1.5 }}
          >
            <Flame className="w-6 h-6 text-white" />
          </motion.div>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-1">
            <motion.span
              key={currentStreak}
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-slate-800"
            >
              {currentStreak}
            </motion.span>
            <span className="text-sm text-slate-500">يوم سلسلة</span>
          </div>
          {showLongest && longestStreak > 0 && (
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Trophy className="w-3 h-3 text-amber-500" />
              الأفضل: {longestStreak} يوم
            </div>
          )}
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 rounded-2xl p-6 border border-amber-100" dir="rtl">
      {/* Main streak display */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          {/* Glow effect */}
          {isOnStreak && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={`absolute inset-0 bg-gradient-to-br ${getFlameColor()} rounded-full blur-xl`}
            />
          )}

          {/* Flame icon */}
          <motion.div
            animate={isOnStreak ? { y: [0, -5, 0] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${getFlameColor()} flex items-center justify-center shadow-lg`}
          >
            <Flame className="w-10 h-10 text-white" />
          </motion.div>
        </div>
      </div>

      {/* Streak count */}
      <div className="text-center mb-4">
        <motion.div
          key={currentStreak}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-5xl font-bold text-slate-800 mb-1"
        >
          {currentStreak}
        </motion.div>
        <p className="text-slate-600 font-medium">
          يوم سلسلة
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-medium">الأفضل</span>
          </div>
          <p className="text-lg font-bold text-slate-800">{longestStreak} يوم</p>
        </div>
        <div className="bg-white/50 rounded-xl p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-600 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs font-medium">منذ</span>
          </div>
          <p className="text-lg font-bold text-slate-800">
            {familyStreak?.streakStartDate
              ? new Date(familyStreak.streakStartDate).toLocaleDateString('ar-SA', {
                  month: 'short',
                  day: 'numeric',
                })
              : '-'}
          </p>
        </div>
      </div>

      {/* Encouragement message */}
      {currentStreak > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            {currentStreak >= 20
              ? 'تفانٍ مذهل! أنت مصدر إلهام حقيقي!'
              : currentStreak >= 10
              ? 'رائع! استمر على هذا الزخم!'
              : currentStreak >= 5
              ? 'تقدم ممتاز! أنت تبني عادة قوية!'
              : currentStreak >= 3
              ? 'سلسلة جيدة! كل يوم يحسب!'
              : 'بداية رائعة! لنستمر!'}
          </p>
        </div>
      )}

      {/* No streak message */}
      {currentStreak === 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            سجّل نشاطاً اليوم لتبدأ سلسلتك!
          </p>
        </div>
      )}
    </div>
  );
}
