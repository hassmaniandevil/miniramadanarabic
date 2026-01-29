'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, Button, Star } from '@/components/ui';
import { FastingMode, EnergyLevel } from '@/types';
import { Sun, Moon, Heart, Coffee, Zap, Battery, BatteryLow } from 'lucide-react';

interface FastingTrackerProps {
  day?: number;
  onLog: (mode: FastingMode, partialHours?: number, energyLevel?: EnergyLevel) => void;
  isLogged?: boolean;
  currentLog?: { mode: FastingMode; partialHours?: number };
}

export function FastingTracker({ day, onLog, isLogged, currentLog }: FastingTrackerProps) {
  const [selectedMode, setSelectedMode] = useState<FastingMode | null>(
    currentLog?.mode || null
  );
  const [partialHours, setPartialHours] = useState<number>(currentLog?.partialHours || 6);
  const [showEnergyCheck, setShowEnergyCheck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset internal state when day changes
  useEffect(() => {
    setSelectedMode(currentLog?.mode || null);
    setPartialHours(currentLog?.partialHours || 6);
    setShowEnergyCheck(false);
    setIsSubmitting(false);
  }, [day, currentLog]);

  const fastingModes: {
    mode: FastingMode;
    label: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    stars: number;
  }[] = [
    {
      mode: 'full',
      label: 'صمتُ اليوم كله!',
      description: 'أتممتُ الصيام من الفجر للمغرب',
      icon: <Sun className="w-6 h-6" />,
      color: 'from-amber-500 to-yellow-400',
      stars: 3,
    },
    {
      mode: 'partial',
      label: 'صمتُ بعض الساعات',
      description: 'حاولتُ صياماً جزئياً',
      icon: <Moon className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-400',
      stars: 2,
    },
    {
      mode: 'tried',
      label: 'حاولتُ لكن لم أستطع',
      description: 'بدأتُ لكن اضطررتُ للإفطار - لا بأس!',
      icon: <Heart className="w-6 h-6" />,
      color: 'from-pink-500 to-rose-400',
      stars: 1,
    },
    {
      mode: 'not_today',
      label: 'لستُ صائماً اليوم',
      description: 'العمر، الصحة، السفر، أو الاختيار',
      icon: <Coffee className="w-6 h-6" />,
      color: 'from-slate-500 to-slate-400',
      stars: 0,
    },
  ];

  const energyLevels: { level: EnergyLevel; label: string; icon: React.ReactNode }[] = [
    { level: 'tired', label: 'متعب', icon: <BatteryLow className="w-5 h-5" /> },
    { level: 'okay', label: 'بخير', icon: <Battery className="w-5 h-5" /> },
    { level: 'strong', label: 'قوي', icon: <Zap className="w-5 h-5" /> },
  ];

  const handleModeSelect = (mode: FastingMode) => {
    setSelectedMode(mode);
    if (mode !== 'partial') {
      setShowEnergyCheck(true);
    }
  };

  const handleSubmit = (energyLevel?: EnergyLevel) => {
    if (!selectedMode) return;
    setIsSubmitting(true);
    onLog(
      selectedMode,
      selectedMode === 'partial' ? partialHours : undefined,
      energyLevel
    );
  };

  if (isLogged && currentLog) {
    const loggedMode = fastingModes.find((m) => m.mode === currentLog.mode);
    return (
      <Card variant="glow" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">صيام اليوم</h3>
            <div className="flex items-center gap-1">
              {Array.from({ length: loggedMode?.stars || 0 }).map((_, i) => (
                <Star key={i} size="sm" animate />
              ))}
            </div>
          </div>
          <div
            className={cn(
              'p-4 rounded-xl bg-gradient-to-r',
              loggedMode?.color
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">{loggedMode?.icon}</div>
              <div>
                <p className="font-semibold text-white">{loggedMode?.label}</p>
                {currentLog.mode === 'partial' && currentLog.partialHours && (
                  <p className="text-sm text-white/80">
                    {currentLog.partialHours} ساعات
                  </p>
                )}
              </div>
            </div>
          </div>
          <p className="text-center text-slate-400 text-sm mt-4">
            تم التسجيل لهذا اليوم
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">كيف كان صيامك اليوم؟</h3>

      <AnimatePresence mode="wait">
        {!showEnergyCheck ? (
          <motion.div
            key="modes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-3"
          >
            {fastingModes.map((item) => (
              <button
                key={item.mode}
                onClick={() => handleModeSelect(item.mode)}
                className={cn(
                  'w-full p-4 rounded-xl border-2 transition-all duration-200 text-left',
                  selectedMode === item.mode
                    ? 'border-amber-500 bg-amber-500/10'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'p-2.5 rounded-xl bg-gradient-to-r text-white',
                      item.color
                    )}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{item.label}</p>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: item.stars }).map((_, i) => (
                      <Star key={i} size="sm" />
                    ))}
                    {Array.from({ length: 3 - item.stars }).map((_, i) => (
                      <Star key={i} size="sm" filled={false} />
                    ))}
                  </div>
                </div>
              </button>
            ))}

            {/* Partial hours slider */}
            {selectedMode === 'partial' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-slate-800/50 rounded-xl border border-slate-700"
              >
                <label className="block text-sm text-slate-300 mb-3">
                  كم ساعة صمتَ؟
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={partialHours}
                    onChange={(e) => setPartialHours(Number(e.target.value))}
                    className="flex-1 accent-amber-500"
                  />
                  <span className="text-2xl font-bold text-amber-400 w-16 text-center">
                    {partialHours}h
                  </span>
                </div>
                <Button
                  onClick={() => setShowEnergyCheck(true)}
                  className="w-full mt-4"
                >
                  التالي
                </Button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="energy"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            <p className="text-slate-300">كيف تشعر؟ (اختياري)</p>
            <div className="grid grid-cols-3 gap-3">
              {energyLevels.map((item) => (
                <button
                  key={item.level}
                  onClick={() => handleSubmit(item.level)}
                  disabled={isSubmitting}
                  className="p-4 rounded-xl border border-slate-700 hover:border-amber-500 hover:bg-amber-500/10 transition-all flex flex-col items-center gap-2"
                >
                  <div className="text-slate-300">{item.icon}</div>
                  <span className="text-sm text-slate-400">{item.label}</span>
                </button>
              ))}
            </div>
            <Button
              variant="ghost"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="w-full"
            >
              تخطي
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
