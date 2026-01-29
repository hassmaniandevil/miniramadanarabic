'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'amber' | 'blue' | 'green' | 'purple';
  showLabel?: boolean;
  className?: string;
}

export function Progress({
  value,
  max = 100,
  size = 'md',
  color = 'amber',
  showLabel = false,
  className,
}: ProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colors = {
    amber: 'from-amber-500 to-yellow-400',
    blue: 'from-blue-500 to-cyan-400',
    green: 'from-green-500 to-emerald-400',
    purple: 'from-purple-500 to-pink-400',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-slate-700/50 rounded-full overflow-hidden',
          sizes[size]
        )}
      >
        <motion.div
          className={cn(
            'h-full bg-gradient-to-r rounded-full',
            colors[color]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="text-sm text-slate-400 mt-1">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showValue?: boolean;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  color = '#F59E0B',
  showValue = true,
  children,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showValue && (
          <span className="text-lg font-bold text-white">
            {Math.round(percentage)}%
          </span>
        ))}
      </div>
    </div>
  );
}

interface RamadanProgressProps {
  currentDay: number;
  totalDays?: number;
}

export function RamadanProgress({ currentDay, totalDays = 30 }: RamadanProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-400">Day {currentDay} of {totalDays}</span>
        <span className="text-amber-400 font-medium">
          {totalDays - currentDay} days remaining
        </span>
      </div>
      <Progress value={currentDay} max={totalDays} color="amber" />
      <div className="flex justify-between text-xs text-slate-500">
        <span>Ramadan begins</span>
        <span>Eid!</span>
      </div>
    </div>
  );
}
