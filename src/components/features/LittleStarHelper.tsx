'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Star, Avatar } from '@/components/ui';
import { Profile } from '@/types';
import { HandHeart } from 'lucide-react';

interface LittleStarHelperProps {
  profile: Profile;
  day?: number;
  onHelped: () => void;
  hasHelpedToday: boolean;
}

export function LittleStarHelper({ profile, day, onHelped, hasHelpedToday }: LittleStarHelperProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasAwarded, setHasAwarded] = useState(hasHelpedToday);

  // Reset internal state when day changes
  useEffect(() => {
    setShowCelebration(false);
    setHasAwarded(hasHelpedToday);
  }, [day, hasHelpedToday]);

  const handleHelp = () => {
    if (hasHelpedToday || hasAwarded) return;
    setShowCelebration(true);
    setHasAwarded(true);
    onHelped();
    setTimeout(() => setShowCelebration(false), 3000);
  };

  if (hasHelpedToday) {
    return (
      <Card variant="glow" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20" />

        {/* Floating stars animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-20, -60],
                x: [0, (i % 2 === 0 ? 1 : -1) * 20],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
              style={{
                left: `${15 + i * 10}%`,
                top: '70%',
              }}
            >
              <Star size="sm" />
            </motion.div>
          ))}
        </div>

        <div className="relative text-center py-6">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-4"
          >
            <Avatar avatarId={profile.avatar} size="xl" showGlow />
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">
            أنت نجم! ⭐
          </h2>
          <p className="text-pink-300 text-lg">
            شكراً لمساعدتك اليوم، {profile.nickname}!
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <Star size="md" animate />
            <span className="text-amber-400 font-semibold">+1 نجمة مكتسبة!</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10" />

      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/80"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <span className="text-8xl">⭐</span>
              </motion.div>
              <p className="text-2xl font-bold text-white mt-4">رائع!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative text-center py-6">
        <div className="mb-4">
          <Avatar avatarId={profile.avatar} size="xl" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          مرحباً {profile.nickname}! 👋
        </h2>
        <p className="text-slate-300 mb-6">
          هل ساعدتَ أحداً اليوم؟
        </p>

        <motion.button
          onClick={handleHelp}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full max-w-xs mx-auto p-6 rounded-3xl bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/30 flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <HandHeart className="w-12 h-12" />
          </motion.div>
          <span className="text-xl font-bold">ساعدتُ اليوم!</span>
        </motion.button>

        <p className="text-sm text-slate-400 mt-4">
          اضغط الزر عندما تساعد أحداً
        </p>
      </div>
    </Card>
  );
}

// Emoji picker for Little Star messages
interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const emojis = ['❤️', '⭐', '🌙', '🤗', '😊', '💕', '🌟', '✨', '🎉', '👏', '💪', '🙏'];

  return (
    <div className="grid grid-cols-4 gap-3">
      {emojis.map((emoji) => (
        <motion.button
          key={emoji}
          onClick={() => onSelect(emoji)}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          className="p-4 text-4xl bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
