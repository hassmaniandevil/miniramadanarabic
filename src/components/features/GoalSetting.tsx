'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GOAL_CATEGORIES,
  GOAL_SUGGESTIONS,
  type GoalCategory,
  type RamadanGoal,
  type Profile,
} from '@/types';

interface GoalSettingProps {
  profiles: Profile[];
  goals: RamadanGoal[];
  onAddGoal: (profileId: string, goalText: string, category: GoalCategory) => void;
  onToggleGoal: (goalId: string, completed: boolean) => void;
  onDeleteGoal: (goalId: string) => void;
}

export function GoalSetting({
  profiles,
  goals,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
}: GoalSettingProps) {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(
    profiles[0]?.id || null
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<GoalCategory>('kindness');

  const selectedProfileData = profiles.find((p) => p.id === selectedProfile);
  const profileGoals = goals.filter((g) => g.profileId === selectedProfile);
  const completedCount = profileGoals.filter((g) => g.isCompleted).length;

  // Get suggestions based on profile type
  const getSuggestionsForProfile = (profile: Profile | undefined) => {
    if (!profile) return [];

    const isLittleStar = profile.profileType === 'little_star';
    const isKid = profile.profileType === 'child';
    const isAdult = profile.profileType === 'adult';

    return GOAL_SUGGESTIONS.filter((s) => {
      if (isLittleStar) return s.forLittleStars;
      if (isKid) return s.forKids;
      if (isAdult) return s.forAdults;
      return true;
    }).filter(
      // Exclude goals already added
      (s) => !profileGoals.some((g) => g.goalText === s.text)
    );
  };

  const suggestions = getSuggestionsForProfile(selectedProfileData);

  const handleAddGoal = () => {
    if (newGoalText.trim() && selectedProfile) {
      onAddGoal(selectedProfile, newGoalText.trim(), newGoalCategory);
      setNewGoalText('');
      setShowAddForm(false);
    }
  };

  const handleAddSuggestion = (text: string, category: GoalCategory) => {
    if (selectedProfile) {
      onAddGoal(selectedProfile, text, category);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">أهداف رمضان</h2>
        <p className="text-sm text-gray-500">ماذا تريد أن تحقق هذا الرمضان؟</p>
      </div>

      {/* Profile selector */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {profiles.map((profile) => {
          const pGoals = goals.filter((g) => g.profileId === profile.id);
          const pCompleted = pGoals.filter((g) => g.isCompleted).length;

          return (
            <button
              key={profile.id}
              onClick={() => setSelectedProfile(profile.id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 transition-colors ${
                selectedProfile === profile.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-50'
              }`}
            >
              <span className="text-lg">{profile.avatar}</span>
              <span className="text-sm font-medium">{profile.nickname}</span>
              {pGoals.length > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    selectedProfile === profile.id
                      ? 'bg-white/20'
                      : 'bg-gray-200'
                  }`}
                >
                  {pCompleted}/{pGoals.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected profile's goals */}
      {selectedProfileData && (
        <div>
          {/* Progress indicator */}
          {profileGoals.length > 0 && (
            <div className="mb-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="text-gray-500">التقدم</span>
                <span className="font-medium text-purple-600">
                  {completedCount}/{profileGoals.length} هدف
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(completedCount / profileGoals.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Goals list */}
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {profileGoals.map((goal) => (
                <GoalItem
                  key={goal.id}
                  goal={goal}
                  onToggle={(completed) => onToggleGoal(goal.id, completed)}
                  onDelete={() => onDeleteGoal(goal.id)}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Empty state */}
          {profileGoals.length === 0 && !showAddForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center"
            >
              <div className="mb-3 text-4xl">🎯</div>
              <h3 className="mb-2 font-semibold text-gray-900">
                لا توجد أهداف بعد لـ {selectedProfileData.nickname}
              </h3>
              <p className="mb-4 text-sm text-gray-600">
                وضع الأهداف يجعل رمضان أكثر معنى!
              </p>
            </motion.div>
          )}

          {/* Add goal form */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="rounded-2xl bg-gray-50 p-4">
                  <input
                    type="text"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    placeholder={`ماذا يريد ${selectedProfileData.nickname} أن يحقق؟`}
                    className="mb-3 w-full rounded-xl border-0 bg-white px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleAddGoal()}
                  />
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(Object.keys(GOAL_CATEGORIES) as GoalCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNewGoalCategory(cat)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          newGoalCategory === cat
                            ? 'bg-purple-500 text-white'
                            : 'bg-white text-gray-600 hover:bg-purple-50'
                        }`}
                      >
                        {GOAL_CATEGORIES[cat].icon} {GOAL_CATEGORIES[cat].label}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 rounded-xl bg-gray-200 py-2 text-sm font-medium text-gray-700"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleAddGoal}
                      disabled={!newGoalText.trim()}
                      className="flex-1 rounded-xl bg-purple-500 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                      إضافة هدف
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add goal button */}
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-purple-300 hover:text-purple-600"
            >
              <span>+</span>
              إضافة هدف لـ {selectedProfileData.nickname}
            </button>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="mb-3 text-sm font-medium text-gray-500">
                أهداف مقترحة لـ {selectedProfileData.nickname}
              </h3>
              <div className="flex flex-wrap gap-2">
                {suggestions.slice(0, 6).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleAddSuggestion(suggestion.text, suggestion.category)
                    }
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-purple-100 hover:text-purple-700"
                  >
                    {GOAL_CATEGORIES[suggestion.category].icon} {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GoalItem({
  goal,
  onToggle,
  onDelete,
}: {
  goal: RamadanGoal;
  onToggle: (completed: boolean) => void;
  onDelete: () => void;
}) {
  const category = GOAL_CATEGORIES[goal.category];
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`group flex items-center gap-3 rounded-2xl p-3 transition-colors ${
        goal.isCompleted ? 'bg-emerald-50' : 'bg-gray-50'
      }`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <button
        onClick={() => onToggle(!goal.isCompleted)}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          goal.isCompleted
            ? 'border-emerald-500 bg-emerald-500 text-white'
            : 'border-gray-300 hover:border-purple-400'
        }`}
      >
        {goal.isCompleted && (
          <motion.svg
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </motion.svg>
        )}
      </button>

      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            goal.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
          }`}
        >
          {goal.goalText}
        </p>
      </div>

      <span
        className={`rounded-full px-2 py-0.5 text-xs bg-gradient-to-r ${category.color} text-white`}
      >
        {category.icon}
      </span>

      {/* Delete button */}
      <AnimatePresence>
        {showDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onDelete}
            className="rounded-full p-1 text-gray-400 hover:bg-red-100 hover:text-red-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
