'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilyStore } from '@/store/familyStore';
import { FamilyDua, DuaCategory, DUA_CATEGORIES } from '@/types';
import { Plus, Check, Trash2, Lock, X, Sparkles } from 'lucide-react';
import { Button, Card } from '@/components/ui';

interface FamilyDuaBoardProps {
  compact?: boolean;
}

export function FamilyDuaBoard({ compact = false }: FamilyDuaBoardProps) {
  const {
    family,
    profiles,
    activeProfileId,
    familyDuas,
    fetchFamilyDuas,
    addFamilyDua,
    toggleDuaCompleted,
    deleteFamilyDua,
  } = useFamilyStore();

  const [isAddingDua, setIsAddingDua] = useState(false);
  const [newDuaText, setNewDuaText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DuaCategory>('prayer');
  const [isPrivate, setIsPrivate] = useState(false);
  const [filterCategory, setFilterCategory] = useState<DuaCategory | 'all'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (family) {
      fetchFamilyDuas();
    }
  }, [family, fetchFamilyDuas]);

  const getProfileById = (profileId: string) => {
    return profiles.find((p) => p.id === profileId);
  };

  const filteredDuas = familyDuas.filter((dua) => {
    if (filterCategory === 'all') return true;
    return dua.category === filterCategory;
  });

  const completedCount = familyDuas.filter((d) => d.isCompleted).length;
  const totalCount = familyDuas.length;

  const handleAddDua = async () => {
    if (!newDuaText.trim()) return;

    setIsSubmitting(true);
    await addFamilyDua(newDuaText.trim(), selectedCategory, isPrivate);
    setNewDuaText('');
    setSelectedCategory('prayer');
    setIsPrivate(false);
    setIsAddingDua(false);
    setIsSubmitting(false);
  };

  const handleToggleComplete = async (dua: FamilyDua) => {
    await toggleDuaCompleted(dua.id, !dua.isCompleted);
  };

  const handleDeleteDua = async (duaId: string) => {
    await deleteFamilyDua(duaId);
  };

  if (compact) {
    return (
      <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤲</span>
            <h3 className="font-semibold text-slate-800">أدعية العائلة</h3>
          </div>
          <span className="text-sm text-emerald-600 font-medium">
            {completedCount}/{totalCount}
          </span>
        </div>
        <div className="space-y-2">
          {familyDuas.slice(0, 3).map((dua) => (
            <div
              key={dua.id}
              className={`flex items-center gap-2 p-2 rounded-lg ${
                dua.isCompleted ? 'bg-emerald-100/50' : 'bg-white/70'
              }`}
            >
              <button
                onClick={() => handleToggleComplete(dua)}
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  dua.isCompleted
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-300 hover:border-emerald-400'
                }`}
              >
                {dua.isCompleted && <Check className="w-3 h-3 text-white" />}
              </button>
              <span
                className={`text-sm flex-1 truncate ${
                  dua.isCompleted ? 'text-slate-500 line-through' : 'text-slate-700'
                }`}
              >
                {dua.duaText}
              </span>
              {dua.isPrivate && <Lock className="w-3 h-3 text-slate-400" />}
            </div>
          ))}
          {familyDuas.length > 3 && (
            <p className="text-xs text-emerald-600 text-center">
              +{familyDuas.length - 3} أدعية أخرى
            </p>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <span className="text-2xl">🤲</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">لوحة أدعية العائلة</h2>
            <p className="text-sm text-slate-500">
              {completedCount} من {totalCount} نية تحققت
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddingDua(true)}
          size="sm"
          className="bg-gradient-to-r from-emerald-500 to-teal-500"
        >
          <Plus className="w-4 h-4 ml-1" />
          أضف دعاء
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            filterCategory === 'all'
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          الكل ({familyDuas.length})
        </button>
        {(Object.entries(DUA_CATEGORIES) as [DuaCategory, typeof DUA_CATEGORIES[DuaCategory]][]).map(
          ([key, { label, icon }]) => {
            const count = familyDuas.filter((d) => d.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1 ${
                  filterCategory === key
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{icon}</span>
                {label} ({count})
              </button>
            );
          }
        )}
      </div>

      {/* Duas List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredDuas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-slate-50 rounded-2xl"
            >
              <Sparkles className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">لا توجد أدعية بعد</p>
              <p className="text-sm text-slate-400">أضف نيتك أو هدفك الأول</p>
            </motion.div>
          ) : (
            filteredDuas.map((dua, index) => {
              const author = getProfileById(dua.authorProfileId);
              const categoryData = DUA_CATEGORIES[dua.category];
              const isOwner = dua.authorProfileId === activeProfileId;

              return (
                <motion.div
                  key={dua.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className={`p-4 transition-all ${
                      dua.isCompleted
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Completion toggle */}
                      <button
                        onClick={() => handleToggleComplete(dua)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                          dua.isCompleted
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-slate-300 hover:border-emerald-400'
                        }`}
                      >
                        {dua.isCompleted && <Check className="w-4 h-4 text-white" />}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${categoryData.color} text-white`}
                          >
                            {categoryData.icon} {categoryData.label}
                          </span>
                          {dua.isPrivate && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <Lock className="w-3 h-3" />
                              خاص
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-slate-800 ${
                            dua.isCompleted ? 'line-through text-slate-500' : ''
                          }`}
                        >
                          {dua.duaText}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs">
                            {author?.avatar || author?.nickname?.[0] || '?'}
                          </div>
                          <span className="text-xs text-slate-500">
                            {author?.nickname || 'غير معروف'}
                          </span>
                          {dua.isCompleted && dua.completedAt && (
                            <span className="text-xs text-emerald-600">
                              تحقق في{' '}
                              {new Date(dua.completedAt).toLocaleDateString('ar-SA')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Delete button (only for owner) */}
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteDua(dua.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Add Dua Modal */}
      <AnimatePresence>
        {isAddingDua && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsAddingDua(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">أضف دعاءً</h3>
                <button
                  onClick={() => setIsAddingDua(false)}
                  className="p-2 rounded-full hover:bg-slate-100"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  التصنيف
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(DUA_CATEGORIES) as [DuaCategory, typeof DUA_CATEGORIES[DuaCategory]][]).map(
                    ([key, { label, icon, color }]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className={`p-3 rounded-xl text-center transition-all ${
                          selectedCategory === key
                            ? `bg-gradient-to-br ${color} text-white shadow-lg`
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span className="text-xl block mb-1">{icon}</span>
                        <span className="text-xs font-medium">{label}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Dua Text */}
              <div className="mb-4">
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  نيتك أو هدفك
                </label>
                <textarea
                  value={newDuaText}
                  onChange={(e) => setNewDuaText(e.target.value)}
                  placeholder="ماذا تريد أن تدعو به أو تسعى لتحقيقه؟"
                  className="w-full p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none text-right"
                  rows={3}
                  dir="rtl"
                />
              </div>

              {/* Private Toggle */}
              <div className="mb-6">
                <button
                  onClick={() => setIsPrivate(!isPrivate)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div
                    className={`w-10 h-6 rounded-full transition-colors flex items-center ${
                      isPrivate ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <motion.div
                      animate={{ x: isPrivate ? 2 : 18 }}
                      className="w-5 h-5 bg-white rounded-full shadow"
                    />
                  </div>
                  <div className="text-right flex-1">
                    <span className="font-medium text-slate-800 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      اجعله خاصاً
                    </span>
                    <span className="text-xs text-slate-500">
                      أنت فقط تستطيع رؤية هذا الدعاء
                    </span>
                  </div>
                </button>
              </div>

              {/* Submit */}
              <Button
                onClick={handleAddDua}
                disabled={!newDuaText.trim() || isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500"
                size="lg"
              >
                {isSubmitting ? 'جاري الإضافة...' : 'أضف الدعاء'}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
