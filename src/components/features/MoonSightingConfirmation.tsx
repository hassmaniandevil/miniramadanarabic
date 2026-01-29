'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPossibleStartDates,
  getRetroactiveStartDates,
  getExpectedRamadanDates,
} from '@/lib/ramadan/dates';

interface MoonSightingConfirmationProps {
  expectedDate: string;
  currentStartDate: string;
  isConfirmed: boolean;
  onConfirmDate: (date: string) => void;
  mode?: 'upcoming' | 'retroactive'; // upcoming = before Ramadan, retroactive = missed setting it
}

export function MoonSightingConfirmation({
  expectedDate,
  currentStartDate,
  isConfirmed,
  onConfirmDate,
  mode = 'upcoming',
}: MoonSightingConfirmationProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState(!isConfirmed);

  const options = mode === 'upcoming'
    ? getPossibleStartDates(expectedDate)
    : getRetroactiveStartDates(expectedDate);

  const handleConfirm = () => {
    if (selectedDate) {
      onConfirmDate(selectedDate);
      setShowOptions(false);
    }
  };

  // Already confirmed
  if (isConfirmed && !showOptions) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-xl">🌙</span>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-800">Ramadan Start Confirmed</p>
              <p className="text-xs text-emerald-600">
                {new Date(currentStartDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOptions(true)}
            className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-200"
          >
            Change
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 shadow-sm"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-3xl"
          >
            🌙
          </motion.div>
          <div>
            <h3 className="font-bold">
              {mode === 'upcoming' ? 'Moon Sighting Time!' : 'When Did Ramadan Start?'}
            </h3>
            <p className="text-sm text-amber-100">
              {mode === 'upcoming'
                ? 'Has the moon been sighted in your area?'
                : 'Select the first day of fasting for your family'}
            </p>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="p-4">
        <p className="mb-3 text-sm text-gray-600">
          {mode === 'upcoming'
            ? 'Different communities may start Ramadan on different days. Select when Ramadan begins for your family:'
            : 'It looks like Ramadan may have started. Please confirm which day was Day 1 for you:'}
        </p>

        <div className="space-y-2">
          {options.map((option) => (
            <motion.button
              key={option.date}
              onClick={() => setSelectedDate(option.date)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex w-full items-center justify-between rounded-xl p-3 text-left transition-colors ${
                selectedDate === option.date
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-amber-50'
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <AnimatePresence>
                {selectedDate === option.date && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-amber-500"
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>

        {/* Confirm button */}
        <motion.button
          onClick={handleConfirm}
          disabled={!selectedDate}
          whileHover={{ scale: selectedDate ? 1.02 : 1 }}
          whileTap={{ scale: selectedDate ? 0.98 : 1 }}
          className={`mt-4 w-full rounded-xl py-3 font-semibold transition-colors ${
            selectedDate
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
              : 'bg-gray-200 text-gray-400'
          }`}
        >
          Confirm Ramadan Start
        </motion.button>

        {/* Info note */}
        <p className="mt-3 text-center text-xs text-gray-500">
          Don&apos;t worry - you can always change this in Settings if needed
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Compact banner version for showing when moon sighting is near
 */
export function MoonSightingBanner({
  daysUntil,
  onOpenConfirmation,
}: {
  daysUntil: number;
  onOpenConfirmation: () => void;
}) {
  if (daysUntil > 2) return null;

  const getMessage = () => {
    if (daysUntil === 0) return 'Ramadan may begin tonight!';
    if (daysUntil === 1) return 'Ramadan may begin tomorrow!';
    return 'Ramadan is almost here!';
  };

  return (
    <motion.button
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpenConfirmation}
      className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white shadow-lg"
    >
      <div className="flex items-center gap-3">
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl"
        >
          🌙
        </motion.span>
        <div className="text-left">
          <p className="font-bold">{getMessage()}</p>
          <p className="text-sm text-amber-100">Tap to confirm when Ramadan starts for you</p>
        </div>
      </div>
      <span className="text-2xl">→</span>
    </motion.button>
  );
}
