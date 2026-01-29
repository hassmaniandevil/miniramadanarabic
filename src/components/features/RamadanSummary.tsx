'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui';
import { useFamilyStore } from '@/store/familyStore';
import {
  Star,
  Moon,
  BookOpen,
  Heart,
  Sparkles,
  Trophy,
  Calendar,
  Check,
} from 'lucide-react';

interface RamadanSummaryProps {
  profileId: string;
  profileName: string;
}

export function RamadanSummary({ profileId, profileName }: RamadanSummaryProps) {
  const { getMonthlyStats, getTotalFamilyStars } = useFamilyStore();
  const stats = getMonthlyStats(profileId);
  const familyStars = getTotalFamilyStars();

  const constellationNames = [
    'الصبر',
    'الكرم',
    'الشجاعة',
    'المغفرة',
    'الشكر',
    'الرحمة',
    'اللطف',
    'الأمل',
  ];

  const achievements = [
    {
      icon: <Moon className="w-6 h-6" />,
      label: 'صيام كامل',
      value: stats.fullFastDays,
      subtext: 'يوم',
      color: 'from-amber-500 to-yellow-500',
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'صيام جزئي',
      value: stats.partialFastDays,
      subtext: 'يوم',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      label: 'أيام القرآن',
      value: stats.quranDays,
      subtext: 'يوم',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <Heart className="w-6 h-6" />,
      label: 'مهام الإحسان',
      value: stats.missionDays,
      subtext: 'مكتملة',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      label: 'قصص قبل النوم',
      value: stats.storyDays,
      subtext: 'استمع',
      color: 'from-purple-500 to-violet-500',
    },
    {
      icon: <Check className="w-6 h-6" />,
      label: 'تسجيل الدخول اليومي',
      value: stats.checkinDays,
      subtext: 'يوم',
      color: 'from-indigo-500 to-blue-500',
    },
  ];

  return (
    <Card className="p-6" variant="glow">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-slate-900" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          ما شاء الله، {profileName}!
        </h2>
        <p className="text-slate-400">
          هذا ما حققته في رمضان
        </p>
      </motion.div>

      {/* Stars earned */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-2xl p-6 mb-6 text-center border border-amber-500/30"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="w-8 h-8 text-amber-400" />
          <span className="text-4xl font-bold text-amber-400">{stats.totalStars}</span>
        </div>
        <p className="text-amber-200">نجوم مكتسبة</p>
      </motion.div>

      {/* Fasting summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/50 rounded-xl p-4 mb-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-amber-400" />
          رحلة الصيام
        </h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
            <p className="text-2xl font-bold text-emerald-400">{stats.fullFastDays}</p>
            <p className="text-xs text-emerald-300">صيام كامل</p>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
            <p className="text-2xl font-bold text-blue-400">{stats.partialFastDays}</p>
            <p className="text-xs text-blue-300">جزئي</p>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
            <p className="text-2xl font-bold text-amber-400">{stats.triedFastDays}</p>
            <p className="text-xs text-amber-300">حاول</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">إجمالي أيام الصيام</span>
            <span className="text-xl font-bold text-white">
              {stats.totalDaysFasted} <span className="text-slate-400 text-sm font-normal">/ 30</span>
            </span>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(stats.totalDaysFasted / 30) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Activities grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        {achievements.slice(2).map((achievement, index) => (
          <motion.div
            key={achievement.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className={`bg-gradient-to-br ${achievement.color} bg-opacity-10 rounded-xl p-4 text-center`}
            style={{ background: `linear-gradient(135deg, ${achievement.color.includes('amber') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(99, 102, 241, 0.1)'}, transparent)` }}
          >
            <div className="text-white/80 mb-2 flex justify-center">
              {achievement.icon}
            </div>
            <p className="text-2xl font-bold text-white">{achievement.value}</p>
            <p className="text-xs text-slate-400">{achievement.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Constellations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-slate-800/50 rounded-xl p-4"
      >
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          الأبراج المفتوحة
        </h3>
        <div className="flex flex-wrap gap-2">
          {constellationNames.map((name, index) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: index < stats.constellationsUnlocked ? 1 : 0.3,
                scale: 1,
              }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                index < stats.constellationsUnlocked
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white'
                  : 'bg-slate-700 text-slate-500'
              }`}
            >
              {name}
            </motion.span>
          ))}
        </div>
        <p className="text-sm text-slate-400 mt-3">
          {stats.constellationsUnlocked} من 8 أبراج مفتوحة بـ {familyStars} نجمة عائلية
        </p>
      </motion.div>

      {/* Motivational message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20 text-center"
      >
        <p className="text-amber-200 italic">
          {stats.totalDaysFasted >= 25
            ? '"ما أجمل هذا الرمضان! تفانيك كان ملهماً حقاً."'
            : stats.totalDaysFasted >= 15
            ? '"جهد رائع هذا الرمضان! كل صيام وعمل صالح يُحتسب."'
            : stats.totalDaysFasted >= 5
            ? '"أحسنت! كل خطوة في هذه الرحلة تقربك من الله."'
            : '"تذكر، أحب الأعمال إلى الله أدومها وإن قلّ."'}
        </p>
      </motion.div>
    </Card>
  );
}
