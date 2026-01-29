'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, BottomNav, ProfileSelectorCompact } from '@/components/layout';
import { Card, Button, Avatar, StarCounter, RamadanProgress } from '@/components/ui';
import {
  FastingTracker,
  SuhoorLogger,
  WonderCard,
  KindnessMission,
  IftarMessages,
  FeelingCheckIn,
  LittleStarHelper,
  LittleStarDashboard,
  MealTip,
  DailyFact,
  BedtimeStory,
  QuranTracker,
  PreparationCard,
  PreparationProgress,
  RamadanSummary,
  FamilyTimezones,
  FamilyTimezonesBadge,
} from '@/components/features';
import { RamadanCountdown } from '@/components/features/RamadanCountdown';
import { MoonSightingConfirmation } from '@/components/features/MoonSightingConfirmation';
import { PreparationChecklist } from '@/components/features/PreparationChecklist';
import { GoalSetting } from '@/components/features/GoalSetting';
import { DEFAULT_PREP_TASKS, type PrepTaskCategory } from '@/types';
import { useFamilyStore } from '@/store/familyStore';
import { getWonderCardForDay, getMissionForDay, getSuhoorKnowledgeForDay, getIftarKnowledgeForDay, getDailyFactForSuhoor, getDailyFactForIftar, getStoryForDay, getAgeGroupFromProfileType, getPreparationActivity, getAvailablePreparationActivities } from '@/data';
import { getRamadanDay, isAfterTime, isBeforeRamadan, isAfterRamadan, getDaysUntilRamadan } from '@/lib/utils';
import { FastingMode, EnergyLevel, FoodGroup } from '@/types';
import { Moon, Star, Calendar, ArrowRight, Clock, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import Link from 'next/link';
import { ConnectedFamilies } from '@/components/features';

// Component to handle search params (needs to be wrapped in Suspense)
function SubscriptionSuccessHandler({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const searchParams = useSearchParams();
  const { refreshSubscriptionStatus } = useFamilyStore();

  useEffect(() => {
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (success === 'true') {
      // Refresh subscription status from server
      refreshSubscriptionStatus();
      onSuccess();

      // Clear URL params
      window.history.replaceState({}, '', '/family');
    }

    if (canceled === 'true') {
      // Just clear URL params
      window.history.replaceState({}, '', '/family');
    }
  }, [searchParams, refreshSubscriptionStatus, onSuccess]);

  return null;
}

export default function FamilyDashboard() {
  const {
    family,
    profiles,
    activeProfileId,
    setActiveProfile,
    getTotalFamilyStars,
    todaysFastingLogs,
    todaysSuhoorLogs,
    todaysMessages,
    addFastingLog,
    addSuhoorLog,
    addMessage,
    addStar,
    hasCompletedActivity,
    testMode,
    testDay,
    setTestMode,
    setTestDay,
    // Preparation mode
    ramadanGoals,
    preparationTasks,
    addRamadanGoal,
    toggleRamadanGoal,
    deleteRamadanGoal,
    addPreparationTask,
    togglePreparationTask,
    confirmRamadanStartDate,
    // Test phase
    testPhase,
    setTestPhase,
    // Sync status
    isSyncing,
    hasInitiallyLoaded,
    // Profile locking
    lockedToProfileId,
    // Connections
    connectedFamilies,
    incomingRequests,
    fetchFamilyConnections,
  } = useFamilyStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewingDay, setViewingDay] = useState<number | null>(null); // For viewing past days
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showMoonSighting, setShowMoonSighting] = useState(false);
  const [prepView, setPrepView] = useState<'countdown' | 'checklist' | 'goals'>('countdown');

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Lazily fetch family connections after initial load
  useEffect(() => {
    if (hasInitiallyLoaded && family) {
      fetchFamilyConnections();
    }
  }, [hasInitiallyLoaded, family, fetchFamilyConnections]);

  // Callback for subscription success
  const handleSubscriptionSuccess = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 5000);
  };

  // Reset viewingDay when testDay changes
  useEffect(() => {
    setViewingDay(null);
  }, [testDay]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  // Determine phase based on testPhase or actual dates
  const actualBeforeRamadan = family ? isBeforeRamadan(family.ramadanStartDate) : false;
  const actualAfterRamadan = family ? isAfterRamadan(family.ramadanStartDate) : false;

  // Use testPhase to override the actual phase when in test mode
  const beforeRamadan = testMode
    ? testPhase === 'before'
    : (testPhase === 'auto' ? actualBeforeRamadan : testPhase === 'before');
  const afterRamadan = testMode
    ? testPhase === 'after'
    : (testPhase === 'auto' ? actualAfterRamadan : testPhase === 'after');
  const daysUntilRamadan = family ? getDaysUntilRamadan(family.ramadanStartDate) : 0;
  const actualRamadanDay = family ? getRamadanDay(family.ramadanStartDate) : 1;
  // In test mode use testDay, otherwise use viewingDay if set, or actual day
  const ramadanDay = testMode && testDay ? testDay : (viewingDay ?? actualRamadanDay);
  const isViewingPastDay = !testMode && viewingDay !== null && viewingDay < actualRamadanDay;
  const wonderCard = getWonderCardForDay(ramadanDay);
  const mission = getMissionForDay(ramadanDay);
  const suhoorTip = getSuhoorKnowledgeForDay(ramadanDay);
  const iftarTip = getIftarKnowledgeForDay(ramadanDay);
  const suhoorFact = getDailyFactForSuhoor(ramadanDay);
  const iftarFact = getDailyFactForIftar(ramadanDay);
  const totalStars = getTotalFamilyStars();
  const isPremium = family?.subscriptionTier === 'paid';

  // Get bedtime story based on profile type
  const storyAgeGroup = activeProfile ? getAgeGroupFromProfileType(activeProfile.profileType) : 'explorer';
  const bedtimeStory = getStoryForDay(ramadanDay, storyAgeGroup);

  // Get preparation activity for countdown
  const todaysPreparation = beforeRamadan && daysUntilRamadan <= 24
    ? getPreparationActivity(daysUntilRamadan)
    : null;
  const availablePreparations = beforeRamadan
    ? getAvailablePreparationActivities(daysUntilRamadan)
    : [];
  const completedPreparations = activeProfile
    ? availablePreparations.filter(() => hasCompletedActivity(activeProfile.id, 'preparation'))
    : [];

  // Check if it's iftar time
  const isIftarTime = family ? isAfterTime(currentTime, family.iftarTime) : false;

  // Check today's logs for active profile
  // In test mode, check by ramadanDay; otherwise check today's logs
  const { allFastingLogs } = useFamilyStore.getState();
  const todaysFastingLog = testMode
    ? (allFastingLogs.length > 0 ? allFastingLogs : todaysFastingLogs).find(
        (log) => log.profileId === activeProfileId && log.ramadanDay === testDay
      )
    : todaysFastingLogs.find((log) => log.profileId === activeProfileId);
  const todaysSuhoorLog = todaysSuhoorLogs.find(
    (log) => log.profileId === activeProfileId
  );

  const handleFastingLog = (
    mode: FastingMode,
    partialHours?: number,
    energyLevel?: EnergyLevel
  ) => {
    if (!activeProfile || !family) return;

    const starsEarned = mode === 'full' ? 3 : mode === 'partial' ? 2 : mode === 'tried' ? 1 : 0;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timestamp = now.toISOString();

    addFastingLog({
      id: crypto.randomUUID(),
      profileId: activeProfile.id,
      date: todayStr,
      ramadanDay,
      mode,
      partialHours,
      energyLevel,
      starsEarned,
      createdAt: timestamp,
    });

    if (starsEarned > 0) {
      addStar({
        id: crypto.randomUUID(),
        profileId: activeProfile.id,
        familyId: family.id,
        date: todayStr,
        ramadanDay,
        source: 'fasting',
        count: starsEarned,
        createdAt: timestamp,
      });
    }
  };

  const handleSuhoorLog = (foodGroups: FoodGroup[]) => {
    if (!activeProfile || !family) return;

    const starsEarned = foodGroups.length >= 4 ? 2 : 1;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timestamp = now.toISOString();

    addSuhoorLog({
      id: crypto.randomUUID(),
      profileId: activeProfile.id,
      date: todayStr,
      ramadanDay,
      foodGroups,
      starsEarned,
      createdAt: timestamp,
    });

    addStar({
      id: crypto.randomUUID(),
      profileId: activeProfile.id,
      familyId: family.id,
      date: todayStr,
      ramadanDay,
      source: 'suhoor',
      count: starsEarned,
      createdAt: timestamp,
    });
  };

  // Debug logging
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = (await import('@/lib/supabase/client')).createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('[FamilyPage] Client-side auth check:', {
        hasUser: !!user,
        userId: user?.id,
        email: user?.email,
        error: error?.message,
      });
    };
    checkAuth();
  }, []);

  console.log('[FamilyPage] State:', {
    hasInitiallyLoaded,
    isSyncing,
    hasFamily: !!family,
    familyId: family?.id,
    profileCount: profiles.length,
    activeProfileId,
  });

  // Show loading while initial sync is happening
  if (!hasInitiallyLoaded || isSyncing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Moon className="w-8 h-8 text-slate-900" />
          </div>
          <p className="text-slate-400">جاري تحميل عائلتك...</p>
        </div>
      </div>
    );
  }

  // If no family/profiles, show setup prompt
  if (!family || profiles.length === 0) {
    console.log('[FamilyPage] No family or profiles, showing setup prompt');
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mx-auto mb-6">
            <Moon className="w-8 h-8 text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">أهلاً بك في ميني رمضان</h1>
          <p className="text-slate-400 mb-6">
            هيا نُعدّ ملفات عائلتك للبدء.
          </p>
          <Link href="/onboarding">
            <Button className="w-full">
              إعداد عائلتك
              <ArrowRight className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // If no active profile, show profile selector
  if (!activeProfile) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">من يستخدم ميني رمضان؟</h1>
            <p className="text-slate-400">اختر ملفك الشخصي</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {profiles.map((profile) => (
              <motion.button
                key={profile.id}
                onClick={() => setActiveProfile(profile.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-amber-500 transition-all flex flex-col items-center gap-3"
              >
                <Avatar avatarId={profile.avatar} size="xl" />
                <span className="font-medium text-white">{profile.nickname}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Little Star profile - fun, interactive view for ages 3-6
  if (activeProfile.profileType === 'little_star') {
    // Get completed activities for this day
    const littleStarSources = ['helped', 'quran', 'kindness', 'dua', 'story', 'fasting_helper'] as const;
    const completedLittleStarActivities = littleStarSources.filter(source =>
      hasCompletedActivity(activeProfile.id, source, ramadanDay)
    );

    const handleLittleStarEarnStar = (source: string) => {
      const now = new Date();
      addStar({
        id: crypto.randomUUID(),
        profileId: activeProfile.id,
        familyId: family.id,
        date: now.toISOString().split('T')[0],
        ramadanDay,
        source: source as 'helped' | 'quran' | 'kindness' | 'dua' | 'story' | 'fasting_helper',
        count: 1,
        createdAt: now.toISOString(),
      });
    };

    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-6 pb-24">
          {/* Test mode banner for Little Stars */}
          {testMode && (
            <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 text-sm font-medium">
                  وضع الاختبار {testPhase === 'during' ? `- اليوم ${testDay} من 30` : ''}
                </span>
                <button
                  onClick={() => setTestMode(false)}
                  className="text-xs text-amber-400/70 hover:text-amber-300"
                >
                  خروج
                </button>
              </div>
              {/* Phase selector */}
              <div className="flex gap-1 mb-2">
                <button
                  onClick={() => setTestPhase('before')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                    testPhase === 'before'
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  قبل رمضان
                </button>
                <button
                  onClick={() => setTestPhase('during')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                    testPhase === 'during'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  خلال رمضان
                </button>
                <button
                  onClick={() => setTestPhase('after')}
                  className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                    testPhase === 'after'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  بعد رمضان
                </button>
              </div>
              {/* Day selector - only show during Ramadan phase */}
              {testPhase === 'during' && (
                <div className="flex gap-1 overflow-x-auto pb-1">
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                    <button
                      key={day}
                      onClick={() => setTestDay(day)}
                      className={`min-w-[28px] h-7 rounded text-xs font-medium transition-all ${
                        testDay === day
                          ? 'bg-amber-500 text-slate-900'
                          : 'bg-amber-500/30 text-amber-300 hover:bg-amber-500/50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile switcher */}
          <ProfileSelectorCompact
            profiles={profiles}
            activeProfileId={activeProfileId}
            onSelectProfile={setActiveProfile}
            lockedToProfileId={lockedToProfileId}
          />

          <div className="mt-6">
            <LittleStarDashboard
              profile={activeProfile}
              day={ramadanDay}
              familyId={family.id}
              onEarnStar={handleLittleStarEarnStar}
              completedActivities={completedLittleStarActivities}
              totalStars={totalStars}
            />
          </div>

          {/* Family sky preview */}
          <Link href="/sky" className="block mt-6">
            <Card className="p-4 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-amber-400" />
                  <span className="text-white">شاهد سماء العائلة</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </div>
            </Card>
          </Link>
        </main>
        <BottomNav />
      </div>
    );
  }

  // Full dashboard for Child and Adult profiles
  return (
    <div className="min-h-screen">
      {/* Handle subscription success from URL params */}
      <Suspense fallback={null}>
        <SubscriptionSuccessHandler onSuccess={handleSubscriptionSuccess} />
      </Suspense>

      <Header />

      {/* Subscription success message */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-3 text-center"
          >
            <p className="font-semibold">أهلاً بك في تذكرة رمضان!</p>
            <p className="text-sm opacity-90">جميع الميزات المميزة مُفعّلة الآن.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        {/* Quick access bar - Prayer times & Memories */}
        {family && !beforeRamadan && !afterRamadan && (
          <div className="flex gap-2 mb-4">
            {/* Prayer times compact */}
            <div className="flex-1 flex gap-2">
              <div className="flex-1 p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-center">
                <p className="text-[10px] text-indigo-400 uppercase">الفجر</p>
                <p className="text-sm font-semibold text-white">
                  {(family.useProfilePrayerTimes && activeProfile?.suhoorTime) || family.suhoorTime}
                </p>
              </div>
              <div className="flex-1 p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-center">
                <p className="text-[10px] text-amber-400 uppercase">المغرب</p>
                <p className="text-sm font-semibold text-white">
                  {(family.useProfilePrayerTimes && activeProfile?.iftarTime) || family.iftarTime}
                </p>
              </div>
            </div>
            {/* Quick links */}
            <Link href="/memories" className="p-2 bg-pink-500/10 border border-pink-500/30 rounded-lg flex items-center justify-center hover:bg-pink-500/20 transition-colors">
              <Camera className="w-5 h-5 text-pink-400" />
            </Link>
            <Link href="/capsules" className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-lg flex items-center justify-center hover:bg-purple-500/20 transition-colors">
              <Moon className="w-5 h-5 text-purple-400" />
            </Link>
          </div>
        )}

        {/* Test mode banner */}
        {testMode && (
          <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 text-sm font-medium">
                وضع الاختبار {testPhase === 'during' ? `- اليوم ${testDay} من 30` : ''}
              </span>
              <button
                onClick={() => setTestMode(false)}
                className="text-xs text-amber-400/70 hover:text-amber-300"
              >
                خروج
              </button>
            </div>
            {/* Phase selector */}
            <div className="flex gap-1 mb-2">
              <button
                onClick={() => setTestPhase('before')}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                  testPhase === 'before'
                    ? 'bg-purple-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                قبل رمضان
              </button>
              <button
                onClick={() => setTestPhase('during')}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                  testPhase === 'during'
                    ? 'bg-amber-500 text-slate-900'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                خلال رمضان
              </button>
              <button
                onClick={() => setTestPhase('after')}
                className={`flex-1 py-1.5 rounded text-xs font-medium transition-all ${
                  testPhase === 'after'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                بعد رمضان
              </button>
            </div>
            {/* Day selector - only show during Ramadan phase */}
            {testPhase === 'during' && (
              <div className="flex gap-1 overflow-x-auto pb-1">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    onClick={() => setTestDay(day)}
                    className={`min-w-[28px] h-7 rounded text-xs font-medium transition-all ${
                      testDay === day
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-amber-500/30 text-amber-300 hover:bg-amber-500/50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile switcher */}
        <ProfileSelectorCompact
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={setActiveProfile}
          lockedToProfileId={lockedToProfileId}
        />

        {/* Family Timezones - Show when enabled and profiles have different timezones */}
        {family.enableTimezoneTracking && !beforeRamadan && !afterRamadan && (
          <div className="mt-4">
            <FamilyTimezonesBadge
              family={family}
              profiles={profiles}
              currentProfileId={activeProfileId || undefined}
            />
          </div>
        )}

        {/* Countdown or Day header */}
        {beforeRamadan ? (
          <div className="mt-6 space-y-4">
            {/* Moon sighting modal */}
            <AnimatePresence>
              {showMoonSighting && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
                  onClick={() => setShowMoonSighting(false)}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md"
                  >
                    <MoonSightingConfirmation
                      expectedDate={family.ramadanStartDate}
                      currentStartDate={family.ramadanStartDate}
                      isConfirmed={family.isRamadanDateConfirmed || false}
                      onConfirmDate={(date) => {
                        confirmRamadanStartDate(date);
                        setShowMoonSighting(false);
                      }}
                      mode={daysUntilRamadan < 0 ? 'retroactive' : 'upcoming'}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Enhanced countdown */}
            <RamadanCountdown
              ramadanStartDate={family.ramadanStartDate}
              isDateConfirmed={family.isRamadanDateConfirmed}
              familyName={family.familyName}
              onMoonSightingClick={() => setShowMoonSighting(true)}
            />

            {/* Navigation tabs for preparation mode */}
            <div className="flex gap-2 rounded-2xl bg-slate-800/50 p-1">
              <button
                onClick={() => setPrepView('countdown')}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                  prepView === 'countdown'
                    ? 'bg-purple-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الأنشطة
              </button>
              <button
                onClick={() => setPrepView('checklist')}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                  prepView === 'checklist'
                    ? 'bg-purple-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                قائمة المهام
              </button>
              <button
                onClick={() => setPrepView('goals')}
                className={`flex-1 rounded-xl py-2 text-sm font-medium transition-all ${
                  prepView === 'goals'
                    ? 'bg-purple-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                الأهداف
              </button>
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {prepView === 'countdown' && (
                <motion.div
                  key="countdown"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  {/* Pre-Ramadan preparation activities */}
                  {daysUntilRamadan <= 24 && todaysPreparation && (
                    <div className="space-y-4">
                      <PreparationProgress
                        completedCount={completedPreparations.length}
                        totalDays={24}
                        daysUntilRamadan={daysUntilRamadan}
                      />
                      <PreparationCard
                        activity={todaysPreparation}
                        daysUntilRamadan={daysUntilRamadan}
                        onComplete={() => {
                          const prepDay = -daysUntilRamadan;
                          if (!hasCompletedActivity(activeProfile.id, 'preparation', prepDay)) {
                            const now = new Date();
                            addStar({
                              id: crypto.randomUUID(),
                              profileId: activeProfile.id,
                              familyId: family.id,
                              date: now.toISOString().split('T')[0],
                              ramadanDay: prepDay,
                              source: 'preparation',
                              count: 1,
                              createdAt: now.toISOString(),
                            });
                          }
                        }}
                        isCompleted={hasCompletedActivity(activeProfile.id, 'preparation', -daysUntilRamadan)}
                      />
                    </div>
                  )}

                  {/* Prompt to set up family if not done */}
                  {daysUntilRamadan > 24 && (
                    <Card className="p-6 text-center">
                      <div className="mb-3 text-4xl">👨‍👩‍👧‍👦</div>
                      <h3 className="mb-2 text-lg font-semibold text-white">
                        جهّز عائلتك
                      </h3>
                      <p className="mb-4 text-sm text-slate-400">
                        أضف جميع أفراد العائلة وأعدّ ملفاتهم للبدء بجمع النجوم!
                      </p>
                      <Link href="/settings">
                        <Button variant="primary" className="w-full">
                          إدارة ملفات العائلة
                        </Button>
                      </Link>
                    </Card>
                  )}
                </motion.div>
              )}

              {prepView === 'checklist' && (
                <motion.div
                  key="checklist"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <PreparationChecklist
                    tasks={preparationTasks}
                    onAddTask={(text, category) => addPreparationTask(text, category)}
                    onToggleTask={(taskId, completed) => togglePreparationTask(taskId, completed)}
                    onAddDefaultTasks={() => {
                      // Add default tasks for the family
                      DEFAULT_PREP_TASKS.slice(0, 10).forEach((task) => {
                        addPreparationTask(task.text, task.category as PrepTaskCategory);
                      });
                    }}
                    hasKids={profiles.some((p) => p.profileType !== 'adult')}
                  />
                </motion.div>
              )}

              {prepView === 'goals' && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <GoalSetting
                    profiles={profiles}
                    goals={ramadanGoals}
                    onAddGoal={(profileId, goalText, category) =>
                      addRamadanGoal(profileId, goalText, category)
                    }
                    onToggleGoal={(goalId, completed) => toggleRamadanGoal(goalId, completed)}
                    onDeleteGoal={(goalId) => deleteRamadanGoal(goalId)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Settings link to adjust date */}
            <div className="mt-4 text-center">
              <Link
                href="/settings"
                className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                عدّل تاريخ بداية رمضان في الإعدادات
              </Link>
            </div>
          </div>
        ) : afterRamadan || (testMode && testDay === 30) ? (
          <div className="mt-6">
            <RamadanSummary
              profileId={activeProfile.id}
              profileName={activeProfile.nickname}
            />
          </div>
        ) : (
          <Card className="mt-6 p-4">
            {/* Day header with navigation */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {/* Back button - only show if not on day 1 */}
                {ramadanDay > 1 && (
                  <button
                    onClick={() => setViewingDay(ramadanDay - 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">اليوم {ramadanDay} من 30</span>
                </div>
                {/* Forward button - only in test mode OR if viewing past day */}
                {(testMode || isViewingPastDay) && ramadanDay < (testMode ? 30 : actualRamadanDay) && (
                  <button
                    onClick={() => setViewingDay(ramadanDay + 1)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                {/* Return to today button */}
                {isViewingPastDay && (
                  <button
                    onClick={() => setViewingDay(null)}
                    className="ml-2 px-2 py-1 rounded-lg text-xs text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                  >
                    اليوم
                  </button>
                )}
              </div>
              <StarCounter count={totalStars} size="md" showLabel={false} />
            </div>

            {/* Greeting */}
            <h1 className="text-xl font-bold text-white mb-3">
              السلام عليكم، {activeProfile.nickname}!
            </h1>

            {/* Prayer times - use profile times if enabled, otherwise family times */}
            {(() => {
              const useProfileTimes = family.useProfilePrayerTimes && activeProfile?.suhoorTime && activeProfile?.iftarTime;
              const suhoorTime = useProfileTimes ? activeProfile.suhoorTime : family.suhoorTime;
              const iftarTime = useProfileTimes ? activeProfile.iftarTime : family.iftarTime;
              const timesLabel = useProfileTimes ? `مواقيت ${activeProfile.nickname}` : null;

              return (
                <div className="mb-4">
                  {timesLabel && (
                    <p className="text-xs text-slate-400 mb-2 text-center">{timesLabel}</p>
                  )}
                  <div className="flex gap-3">
                    <div className="flex-1 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                      <div className="flex items-center gap-2 text-indigo-400 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        <span>الفجر / نهاية السحور</span>
                      </div>
                      <p className="text-white font-semibold">{suhoorTime}</p>
                    </div>
                    <div className="flex-1 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        <span>المغرب / الإفطار</span>
                      </div>
                      <p className="text-white font-semibold">{iftarTime}</p>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Viewing past day notice */}
            {isViewingPastDay && (
              <div className="mb-3 p-2 bg-slate-700/50 rounded-lg text-center">
                <p className="text-sm text-slate-400">عرض اليوم {ramadanDay} (للقراءة فقط)</p>
              </div>
            )}

            <RamadanProgress currentDay={actualRamadanDay} />
          </Card>
        )}

        {/* Daily activities - only show during Ramadan */}
        {!beforeRamadan && !afterRamadan && (
        <div className="mt-6 space-y-6">
          {/* Wonder Card */}
          {wonderCard && (
            <WonderCard
              card={wonderCard}
              onView={() => {
                if (!hasCompletedActivity(activeProfile.id, 'wonder', ramadanDay)) {
                  addStar({
                    id: `star-${Date.now()}`,
                    profileId: activeProfile.id,
                    familyId: family.id,
                    date: new Date().toISOString().split('T')[0],
                    ramadanDay,
                    source: 'wonder',
                    count: 1,
                    createdAt: new Date().toISOString(),
                  });
                }
              }}
              isViewed={hasCompletedActivity(activeProfile.id, 'wonder', ramadanDay)}
            />
          )}

          {/* Quran Tracker */}
          <QuranTracker
            day={ramadanDay}
            onComplete={() => {
              if (!hasCompletedActivity(activeProfile.id, 'quran', ramadanDay)) {
                const now = new Date();
                addStar({
                  id: crypto.randomUUID(),
                  profileId: activeProfile.id,
                  familyId: family.id,
                  date: now.toISOString().split('T')[0],
                  ramadanDay,
                  source: 'quran',
                  count: 1,
                  createdAt: now.toISOString(),
                });
              }
            }}
            isCompleted={hasCompletedActivity(activeProfile.id, 'quran', ramadanDay)}
          />

          {/* Fasting Tracker */}
          <FastingTracker
            day={ramadanDay}
            onLog={handleFastingLog}
            isLogged={!!todaysFastingLog}
            currentLog={todaysFastingLog}
          />

          {/* Suhoor content - only show before iftar */}
          {!isIftarTime && (
            <>
              <DailyFact fact={suhoorFact} variant="suhoor" />
              <MealTip knowledge={suhoorTip} variant="suhoor" />
              <SuhoorLogger
                onLog={handleSuhoorLog}
                isLogged={!!todaysSuhoorLog}
                currentLog={todaysSuhoorLog}
              />
            </>
          )}

          {/* Iftar content - show after iftar */}
          {isIftarTime && (
            <>
              <DailyFact fact={iftarFact} variant="iftar" />
              <MealTip knowledge={iftarTip} variant="iftar" />
            </>
          )}

          {/* Kindness Mission */}
          {mission && (
            <KindnessMission
              mission={mission}
              onComplete={() => {
                if (!hasCompletedActivity(activeProfile.id, 'mission', ramadanDay)) {
                  const now = new Date();
                  addStar({
                    id: crypto.randomUUID(),
                    profileId: activeProfile.id,
                    familyId: family.id,
                    date: now.toISOString().split('T')[0],
                    ramadanDay,
                    source: 'mission',
                    count: 1,
                    createdAt: now.toISOString(),
                  });
                }
              }}
              isCompleted={hasCompletedActivity(activeProfile.id, 'mission', ramadanDay)}
            />
          )}

          {/* Iftar Messages */}
          <IftarMessages
            profiles={profiles}
            currentProfileId={activeProfile.id}
            messages={todaysMessages}
            onSendMessage={(recipientId, message) => {
              const now = new Date();
              addMessage({
                id: crypto.randomUUID(),
                familyId: family.id,
                senderId: activeProfile.id,
                recipientId: recipientId,
                message: message,
                messageType: 'text',
                date: now.toISOString().split('T')[0],
                ramadanDay,
                isDelivered: true,
                deliveredAt: now.toISOString(),
                createdAt: now.toISOString(),
              });
            }}
            isIftarTime={isIftarTime}
          />

          {/* Feeling Check-in - only show after iftar (or anytime in test mode) */}
          {(isIftarTime || testMode) && (
            <FeelingCheckIn
              day={ramadanDay}
              onComplete={() => {
                if (!hasCompletedActivity(activeProfile.id, 'checkin', ramadanDay)) {
                  const now = new Date();
                  addStar({
                    id: crypto.randomUUID(),
                    profileId: activeProfile.id,
                    familyId: family.id,
                    date: now.toISOString().split('T')[0],
                    ramadanDay,
                    source: 'checkin',
                    count: 1,
                    createdAt: now.toISOString(),
                  });
                }
              }}
              isCompleted={hasCompletedActivity(activeProfile.id, 'checkin', ramadanDay)}
            />
          )}

          {/* Bedtime Story - show after iftar (or anytime in test mode) */}
          {(isIftarTime || testMode) && bedtimeStory && (
            <BedtimeStory
              story={bedtimeStory}
              isPremium={isPremium}
              onComplete={() => {
                if (!hasCompletedActivity(activeProfile.id, 'story', ramadanDay)) {
                  addStar({
                    id: `star-${Date.now()}`,
                    profileId: activeProfile.id,
                    familyId: family.id,
                    date: new Date().toISOString().split('T')[0],
                    ramadanDay,
                    source: 'story',
                    count: 1,
                    createdAt: new Date().toISOString(),
                  });
                }
              }}
              isCompleted={hasCompletedActivity(activeProfile.id, 'story', ramadanDay)}
            />
          )}
        </div>
        )}

        {/* Incoming connection requests banner */}
        {incomingRequests?.length > 0 && (
          <Link href="/connections" className="block mt-6">
            <Card className="p-4 border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-400 font-bold text-sm">{incomingRequests.length}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-300">
                      {incomingRequests.length === 1 ? 'طلب اتصال جديد' : `${incomingRequests.length} طلبات اتصال`}
                    </p>
                    <p className="text-xs text-slate-400">اضغط للعرض</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </div>
            </Card>
          </Link>
        )}

        {/* Connected families compact */}
        {connectedFamilies?.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-sm font-medium text-slate-400">العائلات المتصلة</p>
              <Link href="/connections" className="text-xs text-amber-400 hover:text-amber-300">
                عرض الكل
              </Link>
            </div>
            <Card padding="sm">
              <ConnectedFamilies
                connectedFamilies={connectedFamilies}
                currentFamilyId={family.id}
                onToggleShare={() => {}}
                onRemove={() => {}}
                onEncourage={() => {}}
                compact
              />
            </Card>
          </div>
        )}

        {/* Quick links */}
        <div className="mt-8 grid grid-cols-2 gap-3">
          <Link href="/sky">
            <Card className="p-4 hover:border-amber-500/30 transition-colors h-full">
              <Star className="w-5 h-5 text-amber-400 mb-2" />
              <p className="text-sm font-medium text-white">سماء العائلة</p>
              <p className="text-xs text-slate-400">{totalStars} نجمة</p>
            </Card>
          </Link>
          <Link href="/memories">
            <Card className="p-4 hover:border-amber-500/30 transition-colors h-full">
              <Camera className="w-5 h-5 text-pink-400 mb-2" />
              <p className="text-sm font-medium text-white">الذكريات</p>
              <p className="text-xs text-slate-400">معرض الصور</p>
            </Card>
          </Link>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
