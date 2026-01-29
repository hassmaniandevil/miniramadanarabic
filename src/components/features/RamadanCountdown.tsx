'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCountdownInfo, getPreparationTip, type CountdownInfo } from '@/lib/ramadan/dates';

interface RamadanCountdownProps {
  ramadanStartDate: string;
  isDateConfirmed?: boolean;
  familyName?: string;
  onMoonSightingClick?: () => void;
}

export function RamadanCountdown({
  ramadanStartDate,
  isDateConfirmed = false,
  familyName,
  onMoonSightingClick,
}: RamadanCountdownProps) {
  const [countdown, setCountdown] = useState<CountdownInfo | null>(null);
  const [tip, setTip] = useState<{ tip: string; category: string } | null>(null);

  useEffect(() => {
    // Initial calculation
    const info = getCountdownInfo(ramadanStartDate, isDateConfirmed);
    setCountdown(info);
    setTip(getPreparationTip(info.daysUntilRamadan));

    // Update every second for live countdown
    const interval = setInterval(() => {
      const newInfo = getCountdownInfo(ramadanStartDate, isDateConfirmed);
      setCountdown(newInfo);

      // Update tip less frequently (when days change)
      if (newInfo.daysUntilRamadan !== info.daysUntilRamadan) {
        setTip(getPreparationTip(newInfo.daysUntilRamadan));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ramadanStartDate, isDateConfirmed]);

  if (!countdown) {
    return null;
  }

  // Don't show countdown during or after Ramadan
  if (countdown.isDuringRamadan || countdown.isAfterRamadan) {
    return null;
  }

  const { daysUntilRamadan, hoursUntilRamadan, minutesUntilRamadan, secondsUntilRamadan } = countdown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-violet-900 p-6 text-white"
    >
      {/* Stars background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.3 + Math.random() * 0.7,
            }}
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Moon */}
      <motion.div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200 to-amber-100 opacity-20"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 text-center">
          <motion.div
            className="mb-2 text-4xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            🌙
          </motion.div>
          <h2 className="text-lg font-medium text-purple-200">
            رحلة رمضان {familyName ? `لعائلة ${familyName}` : 'لكم'} تبدأ خلال
          </h2>
        </div>

        {/* أرقام العد التنازلي */}
        <div className="mb-6 grid grid-cols-4 gap-2">
          <CountdownUnit value={daysUntilRamadan} label="أيام" />
          <CountdownUnit value={hoursUntilRamadan} label="ساعات" />
          <CountdownUnit value={minutesUntilRamadan} label="دقائق" />
          <CountdownUnit value={secondsUntilRamadan} label="ثواني" />
        </div>

        {/* Moon sighting prompt when 0-2 days away and not confirmed */}
        {countdown.needsConfirmation && onMoonSightingClick && (
          <motion.button
            onClick={onMoonSightingClick}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mb-4 w-full rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-4 text-left shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-2xl"
                >
                  🌙
                </motion.span>
                <div>
                  <p className="font-bold text-amber-900">وقت رؤية الهلال!</p>
                  <p className="text-sm text-amber-800">
                    اضغط لتأكيد متى يبدأ رمضان عندكم
                  </p>
                </div>
              </div>
              <span className="text-xl text-amber-900">→</span>
            </div>
          </motion.button>
        )}

        {/* Daily tip */}
        {tip && (
          <motion.div
            key={tip.tip}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="text-sm">💡</span>
              <span className="text-xs font-medium uppercase tracking-wide text-purple-300">
                نصيحة اليوم
              </span>
            </div>
            <p className="text-sm text-white/90">{tip.tip}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-1 rounded-xl bg-white/20 py-3 backdrop-blur-sm"
      >
        <span className="text-2xl font-bold tabular-nums">
          {value.toString().padStart(2, '0')}
        </span>
      </motion.div>
      <span className="text-xs text-purple-200">{label}</span>
    </div>
  );
}
