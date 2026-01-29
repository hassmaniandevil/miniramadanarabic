'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui';
import { Profile } from '@/types';
import { Plus, Lock } from 'lucide-react';

interface ProfileSelectorProps {
  profiles: Profile[];
  activeProfileId: string | null;
  onSelectProfile: (profileId: string) => void;
  onAddProfile?: () => void;
  maxProfiles?: number;
  showAddButton?: boolean;
}

export function ProfileSelector({
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
  maxProfiles = 6,
  showAddButton = true,
}: ProfileSelectorProps) {
  const canAddMore = profiles.length < maxProfiles;

  const getProfileTypeLabel = (type: Profile['profileType']) => {
    switch (type) {
      case 'little_star':
        return 'نجمة صغيرة';
      case 'child':
        return 'طفل';
      case 'adult':
        return 'والد';
      default:
        return '';
    }
  };

  const getProfileTypeColor = (type: Profile['profileType']) => {
    switch (type) {
      case 'little_star':
        return 'text-pink-400';
      case 'child':
        return 'text-blue-400';
      case 'adult':
        return 'text-emerald-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {profiles.map((profile, index) => {
        const isActive = profile.id === activeProfileId;
        return (
          <motion.button
            key={profile.id}
            onClick={() => onSelectProfile(profile.id)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'p-4 rounded-2xl border-2 transition-all text-center',
              isActive
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <Avatar
                avatarId={profile.avatar}
                size="lg"
                isActive={isActive}
                showGlow={isActive}
              />
              <div>
                <p className="font-semibold text-white">{profile.nickname}</p>
                <p className={cn('text-xs', getProfileTypeColor(profile.profileType))}>
                  {getProfileTypeLabel(profile.profileType)}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}

      {/* Add profile button */}
      {showAddButton && canAddMore && onAddProfile && (
        <motion.button
          onClick={onAddProfile}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: profiles.length * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-slate-500 transition-all flex flex-col items-center justify-center gap-2 min-h-[140px]"
        >
          <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
            <Plus className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-400">إضافة ملف شخصي</p>
        </motion.button>
      )}
    </div>
  );
}

// Compact version for navigation
interface ProfileSelectorCompactProps {
  profiles: Profile[];
  activeProfileId: string | null;
  onSelectProfile: (profileId: string) => void;
  lockedToProfileId?: string | null; // When set, other profiles are locked
}

export function ProfileSelectorCompact({
  profiles,
  activeProfileId,
  onSelectProfile,
  lockedToProfileId,
}: ProfileSelectorCompactProps) {
  const isLocked = !!lockedToProfileId;

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {profiles.map((profile) => {
        const isActive = profile.id === activeProfileId;
        const isLockedOut = isLocked && profile.id !== lockedToProfileId;

        return (
          <button
            key={profile.id}
            onClick={() => !isLockedOut && onSelectProfile(profile.id)}
            disabled={isLockedOut}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all whitespace-nowrap relative',
              isActive
                ? 'border-amber-500 bg-amber-500/10'
                : isLockedOut
                ? 'border-slate-700/50 opacity-50 cursor-not-allowed'
                : 'border-slate-700 hover:border-slate-600'
            )}
          >
            <Avatar avatarId={profile.avatar} size="sm" isActive={isActive} />
            <span className={cn('text-sm', isActive ? 'text-white' : 'text-slate-400')}>
              {profile.nickname}
            </span>
            {isLockedOut && (
              <Lock className="w-3 h-3 text-slate-500 absolute -top-1 -right-1" />
            )}
          </button>
        );
      })}
    </div>
  );
}
