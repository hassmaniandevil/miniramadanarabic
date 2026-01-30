'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilyStore } from '@/store/familyStore';
import { ActivityFeedEvent } from '@/types';
import { X, Star, Sparkles, Check, Flame } from 'lucide-react';

interface Toast {
  id: string;
  event: ActivityFeedEvent;
  profileName: string;
  profileAvatar: string;
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

function getToastContent(event: ActivityFeedEvent): { icon: React.ReactNode; text: string } {
  switch (event.eventType) {
    case 'star_earned': {
      const source = event.eventData.source as string;
      const count = event.eventData.count as number;
      const sourceInfo = SOURCE_LABELS[source] || { label: source, icon: '⭐' };
      return {
        icon: <span className="text-2xl">{sourceInfo.icon}</span>,
        text: `حصل على ${count} ${count > 1 ? 'نجوم' : 'نجمة'} من ${sourceInfo.label}!`,
      };
    }
    case 'constellation_unlocked': {
      const constellationName = event.eventData.constellation as string;
      return {
        icon: <Sparkles className="w-6 h-6 text-purple-500" />,
        text: `فتح كوكبة ${constellationName}!`,
      };
    }
    case 'dua_added': {
      return {
        icon: <span className="text-2xl">🤲</span>,
        text: 'أضاف دعاءً جديداً!',
      };
    }
    case 'dua_completed': {
      return {
        icon: <Check className="w-6 h-6 text-emerald-500" />,
        text: 'حقق دعاءً!',
      };
    }
    case 'streak_milestone': {
      const days = event.eventData.streak_days as number;
      return {
        icon: <Flame className="w-6 h-6 text-orange-500" />,
        text: `وصل إلى سلسلة ${days} يوم!`,
      };
    }
    default:
      return {
        icon: <Star className="w-6 h-6" />,
        text: 'فعل شيئاً رائعاً!',
      };
  }
}

interface ActivityToastProviderProps {
  children: React.ReactNode;
}

export function ActivityToastProvider({ children }: ActivityToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { profiles, activityFeed, activeProfileId } = useFamilyStore();

  const getProfileById = useCallback(
    (profileId: string) => {
      return profiles.find((p) => p.id === profileId);
    },
    [profiles]
  );

  // Track last processed event ID to avoid duplicates
  const lastProcessedEventIdRef = useRef<string | null>(null);

  // Watch for new activity feed events
  useEffect(() => {
    if (activityFeed.length === 0) return;

    const latestEvent = activityFeed[0];

    // Don't process the same event twice
    if (lastProcessedEventIdRef.current === latestEvent.id) return;

    // Don't show toast for own actions
    if (latestEvent.profileId === activeProfileId) return;

    // Check if event is recent (within last 30 seconds)
    const eventTime = new Date(latestEvent.createdAt).getTime();
    const now = Date.now();
    if (now - eventTime > 30000) return;

    const profile = getProfileById(latestEvent.profileId);
    if (!profile) return;

    // Mark this event as processed
    lastProcessedEventIdRef.current = latestEvent.id;

    const newToast: Toast = {
      id: latestEvent.id,
      event: latestEvent,
      profileName: profile.nickname,
      profileAvatar: profile.avatar || profile.nickname[0],
    };

    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(() => {
      setToasts((prev) => [newToast, ...prev.slice(0, 2)]); // Keep max 3 toasts
    }, 0);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 5000);
  }, [activityFeed, activeProfileId, getProfileById]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <>
      {children}

      {/* Toast container - RTL positioned */}
      <div className="fixed top-4 left-4 z-50 space-y-2 pointer-events-none" dir="rtl">
        <AnimatePresence>
          {toasts.map((toast) => {
            const { icon, text } = getToastContent(toast.event);

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: -100, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, scale: 0.9 }}
                className="pointer-events-auto"
              >
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 max-w-sm flex items-start gap-3">
                  {/* Profile avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg flex-shrink-0">
                    {toast.profileAvatar}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {icon}
                    </div>
                    <p className="text-sm text-slate-800 mt-1">
                      <span className="font-semibold">{toast.profileName}</span>{' '}
                      <span className="text-slate-600">{text}</span>
                    </p>
                  </div>

                  {/* Dismiss button */}
                  <button
                    onClick={() => dismissToast(toast.id)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
