'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Memory, MEMORY_CATEGORIES } from '@/types';
import { Heart, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface MemoryCardProps {
  memory: Memory;
  profileName?: string;
  onFavorite?: (memoryId: string, isFavorite: boolean) => void;
  onClick?: () => void;
}

export function MemoryCard({ memory, profileName, onFavorite, onClick }: MemoryCardProps) {
  const [isLiked, setIsLiked] = useState(memory.isFavorite);
  const [isLiking, setIsLiking] = useState(false);

  const category = MEMORY_CATEGORIES[memory.category];

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onFavorite) return;

    setIsLiking(true);
    setIsLiked(!isLiked);

    try {
      await onFavorite(memory.id, !isLiked);
    } catch {
      setIsLiked(isLiked); // Revert on error
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      {/* Image container */}
      <div className="relative rounded-xl overflow-hidden bg-slate-800 aspect-square">
        <img
          src={memory.thumbnailUrl || memory.photoUrl}
          alt={memory.caption || 'ذكرى'}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className={cn(
            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r shadow-lg',
            category.color
          )}>
            <span>{category.icon}</span>
          </span>
        </div>

        {/* Favorite button */}
        {onFavorite && (
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={cn(
              'absolute top-2 right-2 p-2 rounded-full transition-all',
              isLiked
                ? 'bg-rose-500 text-white'
                : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white opacity-0 group-hover:opacity-100'
            )}
          >
            <Heart
              className={cn('w-4 h-4 transition-transform', isLiked && 'fill-current')}
            />
          </button>
        )}

        {/* Caption overlay on hover */}
        {memory.caption && (
          <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-sm line-clamp-2">{memory.caption}</p>
          </div>
        )}
      </div>

      {/* Meta info below image */}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>اليوم {memory.ramadanDay || '؟'}</span>
        </div>
        {profileName && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{profileName}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Large memory card for featured/highlighted memories
export function MemoryCardLarge({ memory, profileName, onFavorite, onClick }: MemoryCardProps) {
  const [isLiked, setIsLiked] = useState(memory.isFavorite);
  const category = MEMORY_CATEGORIES[memory.category];

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onFavorite) return;
    setIsLiked(!isLiked);
    onFavorite(memory.id, !isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="relative group cursor-pointer"
    >
      <div className="relative rounded-2xl overflow-hidden bg-slate-800 aspect-video">
        <img
          src={memory.photoUrl}
          alt={memory.caption || 'ذكرى'}
          className="w-full h-full object-cover"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Category badge */}
          <span className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r mb-3',
            category.color
          )}>
            <span>{category.icon}</span>
            {category.label}
          </span>

          {/* Caption */}
          {memory.caption && (
            <p className="text-white text-lg font-medium mb-2">{memory.caption}</p>
          )}

          {/* Meta */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-white/70">
              <span>اليوم {memory.ramadanDay}</span>
              <span>&middot;</span>
              <span>{format(new Date(memory.createdAt), 'MMM d, yyyy')}</span>
              {profileName && (
                <>
                  <span>&middot;</span>
                  <span>{profileName}</span>
                </>
              )}
            </div>

            {onFavorite && (
              <button
                onClick={handleLike}
                className={cn(
                  'p-2 rounded-full transition-all',
                  isLiked
                    ? 'bg-rose-500 text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                )}
              >
                <Heart className={cn('w-5 h-5', isLiked && 'fill-current')} />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
