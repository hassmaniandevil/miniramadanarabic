'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StarProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'gold' | 'silver' | 'bronze';
  filled?: boolean;
  animate?: boolean;
  className?: string;
}

export function Star({
  size = 'md',
  color = 'gold',
  filled = true,
  animate = false,
  className,
}: StarProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const colors = {
    gold: filled
      ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
      : 'text-amber-400/30',
    silver: filled
      ? 'text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]'
      : 'text-slate-400/30',
    bronze: filled
      ? 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]'
      : 'text-orange-400/30',
  };

  const StarSVG = (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 2}
      className={cn(sizes[size], colors[color], className)}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
        }}
      >
        {StarSVG}
      </motion.div>
    );
  }

  return StarSVG;
}

interface StarRatingProps {
  count: number;
  maxCount?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ count, maxCount = 5, size = 'md' }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: maxCount }).map((_, i) => (
        <Star key={i} size={size} filled={i < count} />
      ))}
    </div>
  );
}

interface StarCounterProps {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function StarCounter({ count, size = 'md', showLabel = true }: StarCounterProps) {
  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2">
      <Star size={size} />
      <span className={cn('font-bold text-amber-400', textSizes[size])}>
        {count}
      </span>
      {showLabel && (
        <span className={cn('text-slate-400', size === 'lg' ? 'text-base' : 'text-sm')}>
          {count === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  );
}

// Flying star animation for when stars are earned
interface FlyingStarProps {
  onComplete?: () => void;
}

export function FlyingStar({ onComplete }: FlyingStarProps) {
  return (
    <motion.div
      className="fixed z-50 pointer-events-none"
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: [1, 1, 0],
        scale: [1, 1.5, 0.5],
        y: [0, -100, -200],
        x: [0, 50, 100],
      }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      <Star size="lg" animate />
    </motion.div>
  );
}
