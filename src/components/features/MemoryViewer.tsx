'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Memory, MEMORY_CATEGORIES, Profile } from '@/types';
import { X, Heart, Trash2, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

interface MemoryViewerProps {
  memory: Memory | null;
  memories: Memory[];
  profiles: Profile[];
  onClose: () => void;
  onFavorite?: (memoryId: string, isFavorite: boolean) => void;
  onDelete?: (memoryId: string) => void;
  onNavigate: (memory: Memory) => void;
}

export function MemoryViewer({
  memory,
  memories,
  profiles,
  onClose,
  onFavorite,
  onDelete,
  onNavigate,
}: MemoryViewerProps) {
  const profileMap = useMemo(() => {
    const map: Record<string, Profile> = {};
    profiles.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [profiles]);

  const currentIndex = memory ? memories.findIndex((m) => m.id === memory.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < memories.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      onNavigate(memories[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      onNavigate(memories[currentIndex + 1]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onClose();
  };

  const handleDelete = () => {
    if (!memory || !onDelete) return;
    if (confirm('حذف هذه الذكرى؟ لا يمكن التراجع عن هذا.')) {
      onDelete(memory.id);
      onClose();
    }
  };

  if (!memory) return null;

  const category = MEMORY_CATEGORIES[memory.category];
  const profile = profileMap[memory.profileId];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Navigation arrows */}
        {hasPrev && (
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Image */}
        <motion.div
          key={memory.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full h-full flex flex-col"
        >
          {/* Main image */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-8">
            <img
              src={memory.photoUrl}
              alt={memory.caption || 'ذكرى'}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Bottom info bar */}
          <div className="bg-gradient-to-t from-black via-black/80 to-transparent p-4 md:p-6">
            <div className="max-w-2xl mx-auto">
              {/* Category badge */}
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r mb-3',
                  category.color
                )}
              >
                <span>{category.icon}</span>
                {category.label}
              </span>

              {/* Caption */}
              {memory.caption && (
                <p className="text-white text-lg md:text-xl mb-3">{memory.caption}</p>
              )}

              {/* Meta row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>اليوم {memory.ramadanDay}</span>
                  </div>
                  <span>&middot;</span>
                  <span>{format(new Date(memory.createdAt), 'MMMM d, yyyy')}</span>
                  {profile && (
                    <>
                      <span>&middot;</span>
                      <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{profile.nickname}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {onFavorite && (
                    <button
                      onClick={() => onFavorite(memory.id, !memory.isFavorite)}
                      className={cn(
                        'p-2 rounded-full transition-all',
                        memory.isFavorite
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      )}
                    >
                      <Heart
                        className={cn('w-5 h-5', memory.isFavorite && 'fill-current')}
                      />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={handleDelete}
                      className="p-2 rounded-full bg-white/20 text-white hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress indicator */}
              <div className="flex gap-1 mt-4 justify-center">
                {memories.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => onNavigate(m)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      i === currentIndex
                        ? 'w-6 bg-amber-500'
                        : 'bg-white/30 hover:bg-white/50'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
