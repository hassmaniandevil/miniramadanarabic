'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui';
import { TimeCapsule, Profile } from '@/types';
import { TimeCapsuleReveal } from './TimeCapsuleReveal';
import { Lock, Unlock, Mail, Calendar, Clock, User } from 'lucide-react';
import { format, formatDistanceToNow, isPast } from 'date-fns';

interface TimeCapsuleListProps {
  capsules: TimeCapsule[];
  profiles: Profile[];
  currentProfileId: string;
  onReveal?: (capsuleId: string) => void;
}

export function TimeCapsuleList({
  capsules,
  profiles,
  currentProfileId,
  onReveal,
}: TimeCapsuleListProps) {
  const [selectedCapsule, setSelectedCapsule] = useState<TimeCapsule | null>(null);

  const profileMap = useMemo(() => {
    const map: Record<string, Profile> = {};
    profiles.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [profiles]);

  // Separate capsules by status
  const { sentByMe, forMe, revealed, waiting } = useMemo(() => {
    const sent: TimeCapsule[] = [];
    const received: TimeCapsule[] = [];
    const revealedList: TimeCapsule[] = [];
    const waitingList: TimeCapsule[] = [];

    capsules.forEach((c) => {
      if (c.isRevealed) {
        revealedList.push(c);
      } else if (c.recipientId === currentProfileId) {
        // Check if it can be revealed
        const canReveal = isReadyToReveal(c);
        if (canReveal) {
          received.push(c);
        } else {
          waitingList.push(c);
        }
      } else if (c.authorId === currentProfileId) {
        sent.push(c);
      }
    });

    return {
      sentByMe: sent,
      forMe: received,
      revealed: revealedList,
      waiting: waitingList,
    };
  }, [capsules, currentProfileId]);

  const handleCapsuleClick = (capsule: TimeCapsule) => {
    // Only allow opening if it's for the current user and ready to reveal
    if (capsule.recipientId === currentProfileId || capsule.isRevealed) {
      setSelectedCapsule(capsule);
    }
  };

  const handleRevealed = () => {
    if (selectedCapsule && onReveal) {
      onReveal(selectedCapsule.id);
    }
  };

  const getRevealText = (capsule: TimeCapsule) => {
    if (capsule.revealType === 'next_ramadan') {
      return `تُفتح رمضان ${capsule.writtenYear + 1}`;
    }
    if (capsule.revealType === 'next_eid') {
      return 'تُفتح في العيد';
    }
    if (capsule.revealDate) {
      const date = new Date(capsule.revealDate);
      if (isPast(date)) {
        return 'جاهزة للفتح!';
      }
      return `تُفتح ${formatDistanceToNow(date, { addSuffix: true })}`;
    }
    return 'تُفتح قريباً';
  };

  if (capsules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">💌</div>
        <h3 className="text-lg font-semibold text-white mb-2">لا توجد كبسولات زمنية بعد</h3>
        <p className="text-slate-400">
          اكتب رسالة من القلب لأحد أفراد العائلة لتُكشف في المستقبل
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ready to open */}
      {forMe.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Unlock className="w-5 h-5 text-amber-400" />
            جاهزة للفتح ({forMe.length})
          </h3>
          <div className="space-y-3">
            {forMe.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                author={profileMap[capsule.authorId]}
                recipient={profileMap[capsule.recipientId]}
                isForCurrentUser={true}
                isReady={true}
                onClick={() => handleCapsuleClick(capsule)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Still sealed */}
      {waiting.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-400" />
            في الانتظار ({waiting.length})
          </h3>
          <div className="space-y-3">
            {waiting.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                author={profileMap[capsule.authorId]}
                recipient={profileMap[capsule.recipientId]}
                isForCurrentUser={true}
                isReady={false}
                revealText={getRevealText(capsule)}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sent by me */}
      {sentByMe.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" />
            أرسلتها أنت ({sentByMe.length})
          </h3>
          <div className="space-y-3">
            {sentByMe.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                author={profileMap[capsule.authorId]}
                recipient={profileMap[capsule.recipientId]}
                isForCurrentUser={false}
                isReady={false}
                revealText={getRevealText(capsule)}
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      )}

      {/* Previously revealed */}
      {revealed.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Unlock className="w-5 h-5 text-green-400" />
            مفتوحة ({revealed.length})
          </h3>
          <div className="space-y-3">
            {revealed.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                author={profileMap[capsule.authorId]}
                recipient={profileMap[capsule.recipientId]}
                isForCurrentUser={capsule.recipientId === currentProfileId}
                isReady={true}
                isRevealed={true}
                onClick={() => handleCapsuleClick(capsule)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reveal modal */}
      {selectedCapsule && (
        <TimeCapsuleReveal
          capsule={selectedCapsule}
          author={profileMap[selectedCapsule.authorId]}
          isOpen={true}
          onClose={() => setSelectedCapsule(null)}
          onRevealed={handleRevealed}
        />
      )}
    </div>
  );
}

interface CapsuleCardProps {
  capsule: TimeCapsule;
  author: Profile | null;
  recipient: Profile | null;
  isForCurrentUser: boolean;
  isReady: boolean;
  isRevealed?: boolean;
  revealText?: string;
  onClick: () => void;
}

function CapsuleCard({
  capsule,
  author,
  recipient,
  isForCurrentUser,
  isReady,
  isRevealed,
  revealText,
  onClick,
}: CapsuleCardProps) {
  return (
    <motion.button
      whileHover={isReady ? { scale: 1.02 } : {}}
      whileTap={isReady ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={!isReady && !isRevealed}
      className={cn(
        'w-full text-left rounded-xl border transition-all overflow-hidden',
        isReady && !isRevealed
          ? 'border-amber-500/50 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 cursor-pointer'
          : isRevealed
          ? 'border-green-500/30 bg-green-500/10 cursor-pointer'
          : 'border-slate-700 bg-slate-800/50 cursor-default opacity-75'
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={cn(
              'p-3 rounded-xl',
              isReady && !isRevealed
                ? 'bg-amber-500/20'
                : isRevealed
                ? 'bg-green-500/20'
                : 'bg-slate-700'
            )}
          >
            {isRevealed ? (
              <Unlock
                className={cn(
                  'w-6 h-6',
                  isRevealed ? 'text-green-400' : 'text-amber-400'
                )}
              />
            ) : (
              <Lock
                className={cn(
                  'w-6 h-6',
                  isReady ? 'text-amber-400' : 'text-slate-500'
                )}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {isForCurrentUser ? (
                <span className="text-sm text-slate-400">
                  من <span className="text-white font-medium">{author?.nickname || 'أحدهم'}</span>
                </span>
              ) : (
                <span className="text-sm text-slate-400">
                  إلى <span className="text-white font-medium">{recipient?.nickname || 'أحدهم'}</span>
                </span>
              )}
            </div>

            {isRevealed ? (
              <p className="text-slate-300 text-sm line-clamp-2">{capsule.message}</p>
            ) : (
              <p className="text-slate-400 text-sm italic">الرسالة مختومة...</p>
            )}

            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                رمضان {capsule.writtenYear}
              </span>
              {revealText && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {revealText}
                </span>
              )}
            </div>
          </div>

          {/* Ready indicator */}
          {isReady && !isRevealed && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-500 rounded-full text-xs font-medium text-white">
              افتح
            </div>
          )}
        </div>
      </div>

      {/* Shimmering effect for ready capsules */}
      {isReady && !isRevealed && (
        <motion.div
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent"
        />
      )}
    </motion.button>
  );
}

function isReadyToReveal(capsule: TimeCapsule): boolean {
  if (capsule.isRevealed) return false;

  const now = new Date();

  switch (capsule.revealType) {
    case 'next_ramadan':
      // For simplicity, assume next Ramadan starts the year after written
      // In production, you'd calculate actual Ramadan dates
      const currentYear = now.getFullYear();
      return currentYear > capsule.writtenYear;

    case 'next_eid':
      // Similar simplification - assume Eid is ~30 days after Ramadan start
      return true; // For demo purposes

    case 'specific_date':
      if (!capsule.revealDate) return false;
      return isPast(new Date(capsule.revealDate));

    default:
      return false;
  }
}
