'use client';

import { cn } from '@/lib/utils';
import { getAvatarEmoji } from '@/data/avatars';

interface AvatarProps {
  avatarId: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isActive?: boolean;
  showGlow?: boolean;
  className?: string;
}

export function Avatar({
  avatarId,
  size = 'md',
  isActive = false,
  showGlow = false,
  className,
}: AvatarProps) {
  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-20 h-20 text-4xl',
    xl: 'w-28 h-28 text-5xl',
  };

  const emoji = getAvatarEmoji(avatarId);

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 border-2 transition-all duration-300',
        sizes[size],
        isActive ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-600',
        showGlow && 'shadow-lg shadow-amber-500/20',
        className
      )}
    >
      <span className="select-none">{emoji}</span>
    </div>
  );
}

interface AvatarGroupProps {
  avatarIds: string[];
  max?: number;
  size?: 'sm' | 'md';
}

export function AvatarGroup({ avatarIds, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visibleAvatars = avatarIds.slice(0, max);
  const remaining = avatarIds.length - max;

  return (
    <div className="flex -space-x-3">
      {visibleAvatars.map((avatarId, index) => (
        <Avatar
          key={index}
          avatarId={avatarId}
          size={size}
          className="ring-2 ring-slate-900"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center bg-slate-700 border-2 border-slate-600 ring-2 ring-slate-900 text-slate-300 text-sm font-medium',
            size === 'sm' ? 'w-10 h-10' : 'w-14 h-14'
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
