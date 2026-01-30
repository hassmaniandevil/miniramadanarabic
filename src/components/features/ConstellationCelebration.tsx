'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilyStore } from '@/store/familyStore';
import { getConstellationByName } from '@/data/constellations';
import { X, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';
import confetti from 'canvas-confetti';

interface ConstellationCelebrationProps {
  onShare?: () => void;
}

export function ConstellationCelebration({ onShare }: ConstellationCelebrationProps) {
  const {
    showConstellationCelebration,
    lastUnlockedConstellation,
    dismissConstellationCelebration,
    family,
    addActivityFeedEvent,
    activeProfileId,
  } = useFamilyStore();

  const [stage, setStage] = useState<'buildup' | 'reveal' | 'celebrate'>('buildup');

  const constellation = lastUnlockedConstellation
    ? getConstellationByName(lastUnlockedConstellation as Parameters<typeof getConstellationByName>[0])
    : null;

  useEffect(() => {
    if (showConstellationCelebration && constellation) {
      // Reset to buildup stage using setTimeout to avoid lint warning
      setTimeout(() => setStage('buildup'), 0);

      // Build-up animation
      setTimeout(() => {
        setStage('reveal');
      }, 1500);

      // Celebration with confetti
      setTimeout(() => {
        setStage('celebrate');

        // Fire confetti
        const colors = [constellation.color, '#fbbf24', '#f59e0b', '#ffffff'];

        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors,
        });

        // Second burst
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors,
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors,
          });
        }, 200);

        // Create activity feed event
        if (family && activeProfileId) {
          addActivityFeedEvent({
            familyId: family.id,
            profileId: activeProfileId,
            eventType: 'constellation_unlocked',
            eventData: {
              constellation: constellation.name,
              displayName: constellation.displayName,
              arabicName: constellation.arabicName,
            },
          });
        }
      }, 3500);
    }
  }, [showConstellationCelebration, constellation, family, activeProfileId, addActivityFeedEvent]);

  if (!showConstellationCelebration || !constellation) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md"
        dir="rtl"
      >
        {/* Close button (only in celebrate stage) */}
        {stage === 'celebrate' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={dismissConstellationCelebration}
            className="absolute top-4 left-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
        )}

        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Build-up stage */}
            {stage === 'buildup' && (
              <motion.div
                key="buildup"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                {/* Pulsing stars gathering */}
                <div className="relative w-40 h-40 mx-auto mb-8">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{
                        x: Math.cos((i * Math.PI * 2) / 12) * 100,
                        y: Math.sin((i * Math.PI * 2) / 12) * 100,
                        scale: 0.5,
                        opacity: 0.5,
                      }}
                      animate={{
                        x: 0,
                        y: 0,
                        scale: 1,
                        opacity: 1,
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Sparkles
                        className="w-4 h-4"
                        style={{ color: constellation.color }}
                      />
                    </motion.div>
                  ))}

                  {/* Central glow */}
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full blur-3xl"
                    style={{ backgroundColor: constellation.color }}
                  />
                </div>

                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-xl text-white"
                >
                  شيء سحري يحدث...
                </motion.p>
              </motion.div>
            )}

            {/* Reveal stage */}
            {stage === 'reveal' && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.5 }}
                transition={{ type: 'spring', damping: 15 }}
                className="text-center"
              >
                {/* Constellation SVG */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                  className="relative w-48 h-48 mx-auto mb-8"
                >
                  {/* Glow effect */}
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.6, 0.4],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-full blur-3xl"
                    style={{ backgroundColor: constellation.color }}
                  />

                  {/* Constellation shape */}
                  <svg
                    viewBox="-60 -60 120 120"
                    className="relative w-full h-full"
                  >
                    <motion.path
                      d={constellation.shape.path}
                      fill="none"
                      stroke={constellation.color}
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: 'easeInOut' }}
                    />
                    {/* Star points */}
                    {constellation.starPoints.map((point, i) => (
                      <motion.circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill={constellation.color}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.15 }}
                      />
                    ))}
                  </svg>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="text-3xl font-bold text-white mb-2"
                >
                  {constellation.arabicName}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-2xl mb-4"
                  style={{ color: constellation.color }}
                >
                  {constellation.arabicScript}
                </motion.p>
              </motion.div>
            )}

            {/* Celebrate stage */}
            {stage === 'celebrate' && (
              <motion.div
                key="celebrate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                {/* Constellation display */}
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute inset-0 rounded-full blur-2xl"
                    style={{ backgroundColor: constellation.color }}
                  />

                  <svg
                    viewBox="-60 -60 120 120"
                    className="relative w-full h-full"
                  >
                    <path
                      d={constellation.shape.path}
                      fill="none"
                      stroke={constellation.color}
                      strokeWidth="2"
                    />
                    {constellation.starPoints.map((point, i) => (
                      <motion.circle
                        key={i}
                        cx={point.x}
                        cy={point.y}
                        r="4"
                        fill={constellation.color}
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.8, 1, 0.8],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </svg>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-white mb-1">
                  {constellation.arabicName}
                </h2>
                <p
                  className="text-2xl mb-4"
                  style={{ color: constellation.color }}
                >
                  {constellation.arabicScript} ({constellation.displayName})
                </p>

                {/* Unlock message */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white/10 rounded-2xl p-4 mb-6"
                >
                  <p className="text-white/90">{constellation.unlockMessage}</p>
                </motion.div>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-8">
                  {constellation.description}
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                  {onShare && (
                    <Button
                      onClick={() => {
                        onShare();
                        dismissConstellationCelebration();
                      }}
                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <Share2 className="w-4 h-4 ml-2" />
                      شارك تقدمك
                    </Button>
                  )}
                  <Button
                    onClick={dismissConstellationCelebration}
                    variant="ghost"
                    className="text-white hover:bg-white/10"
                  >
                    متابعة
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
