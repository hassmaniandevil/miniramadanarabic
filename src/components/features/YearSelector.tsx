'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, Calendar, Star, Clock } from 'lucide-react';

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number;
  currentYear: number;
  onYearChange: (year: number) => void;
  stats?: Record<number, { stars: number; memories: number; capsules: number }>;
}

export function YearSelector({
  availableYears,
  selectedYear,
  currentYear,
  onYearChange,
  stats,
}: YearSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sortedYears = [...availableYears].sort((a, b) => b - a);
  const yearStats = stats?.[selectedYear];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl border transition-all',
          isOpen
            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
            : 'bg-slate-800 border-slate-700 text-white hover:border-slate-600'
        )}
      >
        <Calendar className="w-4 h-4" />
        <span className="font-medium">رمضان {selectedYear}</span>
        {selectedYear === currentYear && (
          <span className="px-1.5 py-0.5 text-xs bg-amber-500 rounded text-white">الآن</span>
        )}
        <ChevronDown
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 z-50 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-2 border-b border-slate-700">
                <p className="text-xs text-slate-400 px-2 py-1">رحلتك الرمضانية</p>
              </div>

              <div className="max-h-60 overflow-y-auto p-2">
                {sortedYears.map((year) => {
                  const yearStat = stats?.[year];
                  const isSelected = year === selectedYear;
                  const isCurrent = year === currentYear;

                  return (
                    <button
                      key={year}
                      onClick={() => {
                        onYearChange(year);
                        setIsOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left',
                        isSelected
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'text-slate-300 hover:bg-slate-700/50'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center font-bold',
                            isSelected
                              ? 'bg-amber-500 text-white'
                              : isCurrent
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-slate-700 text-slate-400'
                          )}
                        >
                          {year.toString().slice(-2)}
                        </div>
                        <div>
                          <p className="font-medium">
                            رمضان {year}
                            {isCurrent && (
                              <span className="mr-2 text-xs text-green-400">(الحالي)</span>
                            )}
                          </p>
                          {yearStat && (
                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {yearStat.stars}
                              </span>
                              <span>{yearStat.memories} ذكرى</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Year comparison card for "This Time Last Year"
interface YearComparisonProps {
  currentYear: number;
  currentStats: { stars: number; daysLogged: number; memories: number };
  lastYearStats?: { stars: number; daysLogged: number; memories: number };
}

export function YearComparison({
  currentYear,
  currentStats,
  lastYearStats,
}: YearComparisonProps) {
  if (!lastYearStats) return null;

  const starsDiff = currentStats.stars - lastYearStats.stars;
  const memoriesDiff = currentStats.memories - lastYearStats.memories;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-medium text-white">في مثل هذا الوقت العام الماضي</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold text-white">{currentStats.stars}</p>
          <p className="text-xs text-slate-400">نجوم هذا العام</p>
          {starsDiff !== 0 && (
            <p
              className={cn(
                'text-xs mt-1',
                starsDiff > 0 ? 'text-green-400' : 'text-rose-400'
              )}
            >
              {starsDiff > 0 ? '+' : ''}
              {starsDiff} vs {currentYear - 1}
            </p>
          )}
        </div>

        <div>
          <p className="text-2xl font-bold text-white">{currentStats.memories}</p>
          <p className="text-xs text-slate-400">ذكريات ملتقطة</p>
          {memoriesDiff !== 0 && (
            <p
              className={cn(
                'text-xs mt-1',
                memoriesDiff > 0 ? 'text-green-400' : 'text-rose-400'
              )}
            >
              {memoriesDiff > 0 ? '+' : ''}
              {memoriesDiff} vs {currentYear - 1}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-indigo-500/30">
        <p className="text-xs text-indigo-300">
          استمر! أنت تبني مجموعة جميلة من ذكريات رمضان.
        </p>
      </div>
    </motion.div>
  );
}

// Mini year navigation for quick access
interface YearNavProps {
  years: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function YearNav({ years, selectedYear, onYearChange }: YearNavProps) {
  const sortedYears = [...years].sort((a, b) => a - b);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {sortedYears.map((year) => (
        <button
          key={year}
          onClick={() => onYearChange(year)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
            year === selectedYear
              ? 'bg-amber-500 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          )}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
