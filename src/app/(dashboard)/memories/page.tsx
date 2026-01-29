'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header, BottomNav, ProfileSelectorCompact } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import {
  MemoryCapture,
  MemoryGallery,
} from '@/components/features';
import { YearSelector } from '@/components/features/YearSelector';
import { useFamilyStore } from '@/store/familyStore';
import { MemoryCategory, Memory } from '@/types';
import { Camera, Plus, Image as ImageIcon } from 'lucide-react';
import { getRamadanDay } from '@/lib/utils';

export default function MemoriesPage() {
  const {
    family,
    profiles,
    activeProfileId,
    setActiveProfile,
    testMode,
    testDay,
    memories,
    addMemory,
    updateMemory,
    removeMemory,
  } = useFamilyStore();

  const [showCapture, setShowCapture] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2026);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const ramadanDay = testMode && testDay ? testDay : (family ? getRamadanDay(family.ramadanStartDate) : 1);

  // Get available years from memories
  const availableYears = useMemo(() => {
    const years = new Set(memories.map((m) => m.ramadanYear));
    years.add(2026); // Always include current year
    return Array.from(years).sort((a, b) => b - a);
  }, [memories]);

  // Calculate stats per year
  const yearStats = useMemo(() => {
    const stats: Record<number, { stars: number; memories: number; capsules: number }> = {};
    memories.forEach((m) => {
      if (!stats[m.ramadanYear]) {
        stats[m.ramadanYear] = { stars: 0, memories: 0, capsules: 0 };
      }
      stats[m.ramadanYear].memories++;
    });
    return stats;
  }, [memories]);

  const handleCapture = async (photo: File, category: MemoryCategory, caption?: string) => {
    if (!activeProfile || !family) return;

    // Create a local URL for the photo (in production, upload to Supabase Storage)
    const photoUrl = URL.createObjectURL(photo);

    const newMemory: Memory = {
      id: crypto.randomUUID(),
      familyId: family.id,
      profileId: activeProfile.id,
      ramadanYear: 2026,
      ramadanDay,
      category,
      caption,
      photoUrl,
      isFavorite: false,
      createdAt: new Date().toISOString(),
    };

    addMemory(newMemory);
  };

  const handleFavorite = async (memoryId: string, isFavorite: boolean) => {
    updateMemory(memoryId, { isFavorite });
  };

  const handleDelete = async (memoryId: string) => {
    removeMemory(memoryId);
  };

  if (!family || profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <ImageIcon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">الذكريات</h1>
          <p className="text-slate-400">يرجى إعداد عائلتك أولاً.</p>
        </Card>
      </div>
    );
  }

  if (!activeProfile) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-6 pb-24">
          <Card className="p-8 text-center">
            <p className="text-slate-400">يرجى اختيار ملف أولاً.</p>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Profile switcher */}
        <ProfileSelectorCompact
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={setActiveProfile}
        />

        {/* عنوان الصفحة */}
        <div className="mt-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">الذكريات</h1>
            <p className="text-slate-400 text-sm">معرض صور رمضانك</p>
          </div>

          {/* Year selector */}
          {availableYears.length > 1 && (
            <YearSelector
              availableYears={availableYears}
              selectedYear={selectedYear}
              currentYear={2026}
              onYearChange={setSelectedYear}
              stats={yearStats}
            />
          )}
        </div>

        {/* إحصائيات سريعة */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-white">
              {memories.filter((m) => m.ramadanYear === selectedYear).length}
            </p>
            <p className="text-xs text-slate-400">صور</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-white">
              {memories.filter((m) => m.ramadanYear === selectedYear && m.isFavorite).length}
            </p>
            <p className="text-xs text-slate-400">مفضلة</p>
          </Card>
          <Card padding="sm" className="text-center">
            <p className="text-2xl font-bold text-white">
              {new Set(memories.filter((m) => m.ramadanYear === selectedYear).map((m) => m.ramadanDay)).size}
            </p>
            <p className="text-xs text-slate-400">أيام</p>
          </Card>
        </div>

        {/* زر إضافة ذكرى */}
        {selectedYear === 2026 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Button
              onClick={() => setShowCapture(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              size="lg"
            >
              <Camera className="w-5 h-5 ml-2" />
              التقط ذكرى
            </Button>
          </motion.div>
        )}

        {/* Gallery */}
        <div className="mt-6">
          <MemoryGallery
            memories={memories}
            profiles={profiles}
            onFavorite={handleFavorite}
            onDelete={handleDelete}
            selectedYear={selectedYear}
          />
        </div>

        {/* الحالة الفارغة مع اقتراحات */}
        {memories.filter((m) => m.ramadanYear === selectedYear).length === 0 && (
          <Card className="mt-6 p-8 text-center" variant="glow">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center"
            >
              <Camera className="w-10 h-10 text-amber-400" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-2">
              ابدأ مجموعة ذكرياتك
            </h3>
            <p className="text-slate-400 mb-4">
              التقط لحظات خاصة من رحلة رمضانك - أول إفطار، تجمعات العائلة،
              الزينة، وأعمال اللطف.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300">
                🌙 أول إفطار
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300">
                ✨ الزينة
              </span>
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300">
                👨‍👩‍👧‍👦 وقت العائلة
              </span>
            </div>
          </Card>
        )}
      </main>

      {/* Floating action button */}
      {selectedYear === 2026 && memories.length > 0 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCapture(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Capture modal */}
      <MemoryCapture
        onCapture={handleCapture}
        ramadanDay={ramadanDay}
        isOpen={showCapture}
        onClose={() => setShowCapture(false)}
      />

      <BottomNav />
    </div>
  );
}
