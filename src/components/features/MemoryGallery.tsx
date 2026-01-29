'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Memory, MemoryCategory, MEMORY_CATEGORIES, Profile } from '@/types';
import { MemoryCard, MemoryCardLarge } from './MemoryCard';
import { MemoryViewer } from './MemoryViewer';
import { Filter, Heart, Grid3X3, LayoutGrid, Calendar } from 'lucide-react';

interface MemoryGalleryProps {
  memories: Memory[];
  profiles: Profile[];
  onFavorite?: (memoryId: string, isFavorite: boolean) => void;
  onDelete?: (memoryId: string) => void;
  selectedYear?: number;
}

type FilterType = 'all' | 'favorites' | MemoryCategory;
type LayoutType = 'masonry' | 'grid' | 'timeline';

export function MemoryGallery({
  memories,
  profiles,
  onFavorite,
  onDelete,
  selectedYear,
}: MemoryGalleryProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [layout, setLayout] = useState<LayoutType>('masonry');
  const [viewerMemory, setViewerMemory] = useState<Memory | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const profileMap = useMemo(() => {
    const map: Record<string, string> = {};
    profiles.forEach((p) => {
      map[p.id] = p.nickname;
    });
    return map;
  }, [profiles]);

  const filteredMemories = useMemo(() => {
    let filtered = memories;

    // Filter by year if specified
    if (selectedYear) {
      filtered = filtered.filter((m) => m.ramadanYear === selectedYear);
    }

    // Filter by category or favorites
    if (filter === 'favorites') {
      filtered = filtered.filter((m) => m.isFavorite);
    } else if (filter !== 'all') {
      filtered = filtered.filter((m) => m.category === filter);
    }

    // Sort by date, newest first
    return filtered.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [memories, filter, selectedYear]);

  // Group by day for timeline view
  const groupedByDay = useMemo(() => {
    const groups: Record<number, Memory[]> = {};
    filteredMemories.forEach((m) => {
      const day = m.ramadanDay || 0;
      if (!groups[day]) groups[day] = [];
      groups[day].push(m);
    });
    return groups;
  }, [filteredMemories]);

  const categories = Object.entries(MEMORY_CATEGORIES) as [
    MemoryCategory,
    typeof MEMORY_CATEGORIES[MemoryCategory]
  ][];

  // Get featured memory (most recent favorite or first memory)
  const featuredMemory = useMemo(() => {
    const favorite = filteredMemories.find((m) => m.isFavorite);
    return favorite || filteredMemories[0];
  }, [filteredMemories]);

  const otherMemories = filteredMemories.filter((m) => m.id !== featuredMemory?.id);

  if (memories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">📷</div>
        <h3 className="text-lg font-semibold text-white mb-2">لا توجد ذكريات بعد</h3>
        <p className="text-slate-400">
          التقط أول ذكرى رمضانية لبدء معرضك
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
            showFilters
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          )}
        >
          <Filter className="w-4 h-4" />
          <span className="text-sm">فلتر</span>
          {filter !== 'all' && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>

        {/* Layout toggle */}
        <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setLayout('masonry')}
            className={cn(
              'p-2 rounded-md transition-colors',
              layout === 'masonry'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('grid')}
            className={cn(
              'p-2 rounded-md transition-colors',
              layout === 'grid'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayout('timeline')}
            className={cn(
              'p-2 rounded-md transition-colors',
              layout === 'timeline'
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700">
              {/* All */}
              <button
                onClick={() => setFilter('all')}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm transition-colors',
                  filter === 'all'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                الكل
              </button>

              {/* Favorites */}
              <button
                onClick={() => setFilter('favorites')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors',
                  filter === 'favorites'
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                )}
              >
                <Heart className="w-3 h-3" />
                المفضلة
              </button>

              {/* Categories */}
              {categories.map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors',
                    filter === key
                      ? `bg-gradient-to-r ${category.color} text-white`
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  )}
                >
                  <span>{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery */}
      {layout === 'masonry' && (
        <div className="space-y-4">
          {/* Featured memory */}
          {featuredMemory && (
            <MemoryCardLarge
              memory={featuredMemory}
              profileName={profileMap[featuredMemory.profileId]}
              onFavorite={onFavorite}
              onClick={() => setViewerMemory(featuredMemory)}
            />
          )}

          {/* Masonry grid */}
          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {otherMemories.map((memory) => (
              <div key={memory.id} className="break-inside-avoid">
                <MemoryCard
                  memory={memory}
                  profileName={profileMap[memory.profileId]}
                  onFavorite={onFavorite}
                  onClick={() => setViewerMemory(memory)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {layout === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.id}
              memory={memory}
              profileName={profileMap[memory.profileId]}
              onFavorite={onFavorite}
              onClick={() => setViewerMemory(memory)}
            />
          ))}
        </div>
      )}

      {layout === 'timeline' && (
        <div className="space-y-6">
          {Object.entries(groupedByDay)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([day, dayMemories]) => (
              <div key={day}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 font-bold">{day}</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">اليوم {day}</h3>
                    <p className="text-sm text-slate-400">
                      {dayMemories.length} {dayMemories.length === 1 ? 'ذكرى' : 'ذكريات'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 ml-5 pl-8 border-l-2 border-slate-700">
                  {dayMemories.map((memory) => (
                    <MemoryCard
                      key={memory.id}
                      memory={memory}
                      profileName={profileMap[memory.profileId]}
                      onFavorite={onFavorite}
                      onClick={() => setViewerMemory(memory)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Empty state for filtered results */}
      {filteredMemories.length === 0 && memories.length > 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">لا توجد ذكريات تطابق هذا الفلتر</p>
          <button
            onClick={() => setFilter('all')}
            className="text-amber-400 hover:text-amber-300 mt-2"
          >
            عرض كل الذكريات
          </button>
        </div>
      )}

      {/* Full-screen viewer */}
      <MemoryViewer
        memory={viewerMemory}
        memories={filteredMemories}
        profiles={profiles}
        onClose={() => setViewerMemory(null)}
        onFavorite={onFavorite}
        onDelete={onDelete}
        onNavigate={setViewerMemory}
      />
    </div>
  );
}
