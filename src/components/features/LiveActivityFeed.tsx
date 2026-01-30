'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilyStore } from '@/store/familyStore';
import { ActivityFeedEvent } from '@/types';
import { Star, Sparkles, Check, Flame, Clock } from 'lucide-react';
import { Card } from '@/components/ui';

interface LiveActivityFeedProps {
  limit?: number;
  showEmpty?: boolean;
  compact?: boolean;
}

const SOURCE_LABELS: Record<string, { label: string; icon: string }> = {
  fasting: { label: 'الصيام', icon: '🌙' },
  suhoor: { label: 'السحور', icon: '🌅' },
  mission: { label: 'مهمة الإحسان', icon: '💝' },
  wonder: { label: 'عجائب اليوم', icon: '✨' },
  checkin: { label: 'تسجيل الحضور', icon: '💭' },
  helped: { label: 'المساعدة', icon: '🤝' },
  story: { label: 'قصة ما قبل النوم', icon: '📖' },
  quran: { label: 'القرآن', icon: '📿' },
  preparation: { label: 'التحضير', icon: '🎨' },
  kindness: { label: 'الإحسان', icon: '💕' },
  dua: { label: 'الدعاء', icon: '🤲' },
  fasting_helper: { label: 'مساعد الصيام', icon: '🌟' },
};

function getEventDetails(event: ActivityFeedEvent): { icon: React.ReactNode; text: string; color: string } {
  switch (event.eventType) {
    case 'star_earned': {
      const source = event.eventData.source as string;
      const count = event.eventData.count as number;
      const sourceInfo = SOURCE_LABELS[source] || { label: source, icon: '⭐' };
      return {
        icon: <span className="text-lg">{sourceInfo.icon}</span>,
        text: `حصل على ${count} ${count > 1 ? 'نجوم' : 'نجمة'} من ${sourceInfo.label}`,
        color: 'from-amber-500 to-yellow-500',
      };
    }
    case 'constellation_unlocked': {
      const constellationName = event.eventData.constellation as string;
      return {
        icon: <Sparkles className="w-5 h-5 text-purple-500" />,
        text: `فتح كوكبة ${constellationName}!`,
        color: 'from-purple-500 to-pink-500',
      };
    }
    case 'dua_added': {
      return {
        icon: <span className="text-lg">🤲</span>,
        text: 'أضاف دعاءً جديداً للوحة العائلة',
        color: 'from-emerald-500 to-teal-500',
      };
    }
    case 'dua_completed': {
      return {
        icon: <Check className="w-5 h-5 text-emerald-500" />,
        text: 'حقق دعاءً!',
        color: 'from-emerald-500 to-green-500',
      };
    }
    case 'streak_milestone': {
      const days = event.eventData.streak_days as number;
      return {
        icon: <Flame className="w-5 h-5 text-orange-500" />,
        text: `وصل إلى سلسلة ${days} يوم!`,
        color: 'from-orange-500 to-red-500',
      };
    }
    default:
      return {
        icon: <Star className="w-5 h-5" />,
        text: 'فعل شيئاً رائعاً',
        color: 'from-slate-500 to-gray-500',
      };
  }
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'الآن';
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays < 7) return `منذ ${diffDays} يوم`;
  return date.toLocaleDateString('ar-SA');
}

export function LiveActivityFeed({ limit = 10, showEmpty = true, compact = false }: LiveActivityFeedProps) {
  const { family, profiles, activityFeed, fetchActivityFeed } = useFamilyStore();

  useEffect(() => {
    if (family) {
      fetchActivityFeed();
    }
  }, [family, fetchActivityFeed]);

  const getProfileById = (profileId: string) => {
    return profiles.find((p) => p.id === profileId);
  };

  const displayedEvents = activityFeed.slice(0, limit);

  if (displayedEvents.length === 0 && !showEmpty) {
    return null;
  }

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">📡</span>
          <h3 className="font-semibold text-slate-800">النشاط الأخير</h3>
        </div>
        <div className="space-y-2">
          {displayedEvents.slice(0, 3).map((event) => {
            const profile = getProfileById(event.profileId);
            const { icon, text } = getEventDetails(event);
            return (
              <div key={event.id} className="flex items-center gap-2 p-2 bg-white/70 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs flex-shrink-0">
                  {profile?.avatar || profile?.nickname?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 truncate">
                    <span className="font-medium">{profile?.nickname}</span>{' '}
                    <span className="text-slate-500">{text}</span>
                  </p>
                </div>
                {icon}
              </div>
            );
          })}
          {activityFeed.length > 3 && (
            <p className="text-xs text-blue-600 text-center">
              +{activityFeed.length - 3} نشاط آخر
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
          <span className="text-2xl">📡</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">نشاط العائلة</h2>
          <p className="text-sm text-slate-500">شاهد ما يفعله الجميع</p>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        <AnimatePresence>
          {displayedEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-slate-50 rounded-2xl"
            >
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">لا يوجد نشاط اليوم بعد</p>
              <p className="text-sm text-slate-400">كن أول من يحصل على نجمة!</p>
            </motion.div>
          ) : (
            displayedEvents.map((event, index) => {
              const profile = getProfileById(event.profileId);
              const { icon, text, color } = getEventDetails(event);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      {/* Profile avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg">
                          {profile?.avatar || profile?.nickname?.[0] || '?'}
                        </div>
                        <div
                          className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}
                        >
                          <div className="scale-75">{icon}</div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-800">
                          <span className="font-semibold">{profile?.nickname || 'شخص ما'}</span>{' '}
                          <span className="text-slate-600">{text}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatTimeAgo(event.createdAt)}
                          {event.ramadanDay && ` • اليوم ${event.ramadanDay}`}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
