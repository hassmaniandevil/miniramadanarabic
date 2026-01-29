'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Avatar, Star as StarUI } from '@/components/ui';
import { Profile } from '@/types';
import {
  getLittleStarFact,
  getLittleStarDua,
  getLittleStarStory,
  littleStarActivities,
  LittleStarStory,
  LittleStarDua,
  LittleStarFact,
} from '@/data/littleStarContent';
import {
  HandHeart,
  BookOpen,
  Heart,
  Star,
  Moon,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';

interface LittleStarDashboardProps {
  profile: Profile;
  day: number;
  familyId: string;
  onEarnStar: (source: string) => void;
  completedActivities: string[];
  totalStars: number;
}

export function LittleStarDashboard({
  profile,
  day,
  familyId,
  onEarnStar,
  completedActivities,
  totalStars
}: LittleStarDashboardProps) {
  const [showStory, setShowStory] = useState(false);
  const [showDua, setShowDua] = useState(false);
  const [celebratingActivity, setCelebratingActivity] = useState<string | null>(null);

  const fact = getLittleStarFact(day);
  const dua = getLittleStarDua(day);
  const story = getLittleStarStory(day);

  // Reset state when day changes
  useEffect(() => {
    setShowStory(false);
    setShowDua(false);
    setCelebratingActivity(null);
  }, [day]);

  const handleActivityComplete = (activityId: string, source: string) => {
    if (completedActivities.includes(source)) return;

    setCelebratingActivity(activityId);
    onEarnStar(source);

    setTimeout(() => {
      setCelebratingActivity(null);
    }, 2000);
  };

  const activityIcons: Record<string, React.ReactNode> = {
    helped: <HandHeart className="w-6 h-6" />,
    quran: <BookOpen className="w-6 h-6" />,
    kindness: <Heart className="w-6 h-6" />,
    dua: <Sparkles className="w-6 h-6" />,
    story: <Moon className="w-6 h-6" />,
    fasting_helper: <Star className="w-6 h-6" />,
  };

  const activityColors: Record<string, string> = {
    helped: 'from-pink-500 to-rose-400',
    quran: 'from-green-500 to-emerald-400',
    kindness: 'from-red-500 to-pink-400',
    dua: 'from-purple-500 to-violet-400',
    story: 'from-indigo-500 to-blue-400',
    fasting_helper: 'from-amber-500 to-yellow-400',
  };

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <Card variant="glow" className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-purple-500/10 to-amber-500/20" />

        {/* Floating stars */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [-10, -40],
                x: [0, (i % 2 === 0 ? 1 : -1) * 15],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${10 + i * 15}%`,
                top: '60%',
              }}
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </motion.div>
          ))}
        </div>

        <div className="relative text-center py-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block mb-3"
          >
            <Avatar avatarId={profile.avatar} size="xl" showGlow />
          </motion.div>

          <h1 className="text-2xl font-bold text-white mb-1">
            السلام عليكم، {profile.nickname}! 🌟
          </h1>
          <p className="text-purple-300">اليوم {day} من رمضان</p>

          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="px-4 py-2 bg-amber-500/20 rounded-full border border-amber-500/30">
              <span className="text-amber-400 font-bold text-lg">{totalStars}</span>
              <span className="text-amber-300 mr-1">نجمة</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Today's Fun Fact */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
        <div className="flex items-start gap-3">
          <div className="text-4xl">{fact.emoji}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-white mb-1">هل تعلم؟</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{fact.fact}</p>
          </div>
        </div>
      </Card>

      {/* Activity Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          اكسب نجوماً اليوم!
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {littleStarActivities.map((activity) => {
            const isCompleted = completedActivities.includes(activity.source);
            const isCelebrating = celebratingActivity === activity.id;

            return (
              <motion.button
                key={activity.id}
                onClick={() => handleActivityComplete(activity.id, activity.source)}
                disabled={isCompleted}
                whileHover={!isCompleted ? { scale: 1.02 } : {}}
                whileTap={!isCompleted ? { scale: 0.98 } : {}}
                className={`relative p-4 rounded-2xl border-2 transition-all text-left ${
                  isCompleted
                    ? 'bg-green-500/20 border-green-500/50'
                    : 'bg-slate-800/50 border-slate-700 hover:border-amber-500/50'
                }`}
              >
                <AnimatePresence>
                  {isCelebrating && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-amber-500/90 rounded-2xl z-10"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5 }}
                        >
                          <Star className="w-10 h-10 text-white fill-white mx-auto" />
                        </motion.div>
                        <p className="text-white font-bold mt-1">+1 نجمة!</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-col items-center text-center gap-2">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${activityColors[activity.source]} flex items-center justify-center text-white shadow-lg ${isCompleted ? 'opacity-50' : ''}`}>
                    {isCompleted ? <Check className="w-6 h-6" /> : activityIcons[activity.source]}
                  </div>
                  <span className="text-3xl">{activity.emoji}</span>
                  <p className={`font-medium text-sm ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                    {activity.title}
                  </p>
                  {isCompleted && (
                    <span className="text-xs text-green-400">تم!</span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Today's Dua */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-violet-500" />

        <button
          onClick={() => setShowDua(!showDua)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="text-3xl">{dua.emoji}</div>
            <div className="text-left">
              <h3 className="font-semibold text-white">دعاء اليوم المميز</h3>
              <p className="text-purple-300 text-sm">{dua.meaning}</p>
            </div>
          </div>
          {showDua ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        <AnimatePresence>
          {showDua && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <p className="text-2xl text-center text-white mb-2 font-arabic" dir="rtl">
                  {dua.arabic}
                </p>
                <p className="text-center text-purple-300 text-lg mb-2">
                  {dua.english}
                </p>
                <p className="text-center text-slate-400 text-sm">
                  {dua.meaning}
                </p>
                <p className="text-center text-purple-400/70 text-xs mt-3">
                  اطلب من شخص كبير مساعدتك في قوله!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Bedtime Story */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-slate-900/20 pointer-events-none" />

        {/* Twinkling stars */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-60">
          <Star className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
          <Star className="w-2 h-2 text-amber-200 fill-amber-200 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowStory(!showStory)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Moon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white">قصة قبل النوم</h3>
                <p className="text-indigo-300 text-sm">{story.title} {story.emoji}</p>
              </div>
            </div>
            {showStory ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          <AnimatePresence>
            {showStory && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-3">
                  {/* Story text */}
                  <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl">{story.emoji}</span>
                      <span className="text-xs text-indigo-300 bg-indigo-500/20 px-2 py-1 rounded-full">
                        اقرأ مع شخص كبير
                      </span>
                    </div>
                    <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                      {story.story}
                    </div>
                  </div>

                  {/* Moral */}
                  <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-amber-300 mb-1">الدرس</p>
                        <p className="text-sm text-amber-100">{story.moral}</p>
                      </div>
                    </div>
                  </div>

                  {/* Mark as read */}
                  {!completedActivities.includes('story') && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivityComplete('story', 'story');
                      }}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600"
                    >
                      <Star className="w-4 h-4 ml-2" />
                      استمعت للقصة!
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Encouragement */}
      <Card className="text-center py-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border-pink-500/20">
        <p className="text-lg text-pink-300">
          أنت رائع، {profile.nickname}! 🌟
        </p>
        <p className="text-sm text-slate-400 mt-1">
          استمر في جمع النجوم لإضاءة سماء العائلة!
        </p>
      </Card>
    </div>
  );
}
