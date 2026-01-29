'use client';

import { useMemo } from 'react';
import { Header, BottomNav } from '@/components/layout';
import { Card, Avatar, StarCounter, Progress } from '@/components/ui';
import { StarSky } from '@/components/features';
import { useFamilyStore } from '@/store/familyStore';
import { getScaledConstellations, getUnlockedConstellationsScaled, getNextConstellationScaled, getMaxPossibleStarsFromProfiles, MAX_STARS_PER_DAY } from '@/data/constellations';
import { Sparkles, Lock, Star } from 'lucide-react';
import { ProfileType } from '@/types';

export default function SkyPage() {
  const {
    family,
    profiles,
    todaysStars,
    getTotalFamilyStars,
    getProfileStars,
  } = useFamilyStore();

  const totalStars = getTotalFamilyStars();

  // Get profile types for constellation scaling (falls back to adults if no profiles)
  const profileTypes: ProfileType[] = useMemo(
    () => profiles.length > 0 ? profiles.map(p => p.profileType) : ['adult', 'adult'],
    [profiles]
  );

  const scaledConstellations = useMemo(
    () => getScaledConstellations(profileTypes),
    [profileTypes]
  );
  const unlockedConstellations = useMemo(
    () => getUnlockedConstellationsScaled(totalStars, profileTypes),
    [totalStars, profileTypes]
  );
  const nextConstellation = useMemo(
    () => getNextConstellationScaled(totalStars, profileTypes),
    [totalStars, profileTypes]
  );
  const maxPossibleStars = useMemo(
    () => getMaxPossibleStarsFromProfiles(profileTypes),
    [profileTypes]
  );

  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">جاري التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">سماؤنا الليلية</h1>
          <p className="text-slate-400">شاهد نجوم عائلتك تضيء السماء</p>
        </div>

        {/* Star Sky Visualization */}
        <StarSky
          profiles={profiles}
          stars={todaysStars}
          totalFamilyStars={totalStars}
        />

        {/* Profile stars breakdown */}
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">نجوم العائلة</h3>
          <div className="space-y-3">
            {profiles.map((profile) => {
              const stars = getProfileStars(profile.id);
              return (
                <div
                  key={profile.id}
                  className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
                >
                  <Avatar avatarId={profile.avatar} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{profile.nickname}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(Math.min(stars, 5))].map((_, i) => (
                        <Star
                          key={i}
                          className="w-3 h-3 text-amber-400 fill-amber-400"
                        />
                      ))}
                      {stars > 5 && (
                        <span className="text-xs text-amber-400 ml-1">+{stars - 5}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-amber-400">{stars}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
            <span className="text-slate-400">إجمالي نجوم العائلة</span>
            <StarCounter count={totalStars} size="md" />
          </div>

          {/* Family potential breakdown */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 mb-2">إمكانية النجوم اليومية</p>
            <div className="flex flex-wrap gap-2">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-lg text-xs"
                >
                  <span className="text-slate-400">{profile.nickname}:</span>
                  <span className="text-amber-400 font-medium">
                    {MAX_STARS_PER_DAY[profile.profileType]}/يوم
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              أقصى نجوم للعائلة في رمضان: <span className="text-amber-400 font-medium">{maxPossibleStars} نجمة</span>
            </p>
          </div>
        </Card>

        {/* Constellations */}
        <Card className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">الأبراج</h3>
          </div>

          {/* Next constellation progress */}
          {nextConstellation && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl border border-purple-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-purple-300">
                  التالي: {nextConstellation.displayName}
                </span>
                <span className="text-sm text-purple-400">
                  {totalStars}/{nextConstellation.scaledStarsRequired} نجمة
                </span>
              </div>
              <Progress
                value={totalStars}
                max={nextConstellation.scaledStarsRequired}
                color="purple"
              />
              <p className="text-xs text-slate-400 mt-2">
                {nextConstellation.scaledStarsRequired - totalStars} نجمة أخرى للفتح
              </p>
            </div>
          )}

          {/* Constellation grid */}
          <div className="grid grid-cols-2 gap-3">
            {scaledConstellations.map((constellation) => {
              const isUnlocked = constellation.scaledStarsRequired <= totalStars;
              return (
                <div
                  key={constellation.name}
                  className={`p-4 rounded-xl border transition-all ${
                    isUnlocked
                      ? 'bg-slate-800/50 border-slate-700'
                      : 'bg-slate-800/20 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-2xl"
                      style={{ opacity: isUnlocked ? 1 : 0.3 }}
                    >
                      ⭐
                    </span>
                    {!isUnlocked && (
                      <Lock className="w-4 h-4 text-slate-600" />
                    )}
                  </div>
                  <p
                    className={`font-medium ${
                      isUnlocked ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    {constellation.displayName}
                  </p>
                  <p
                    className={`text-sm ${
                      isUnlocked ? 'text-slate-400' : 'text-slate-700'
                    }`}
                    dir="rtl"
                  >
                    {constellation.arabicScript}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {constellation.scaledStarsRequired} نجمة
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Unlocked constellation details */}
        {unlockedConstellations.length > 0 && (
          <Card className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              المفتوحة ({unlockedConstellations.length})
            </h3>
            <div className="space-y-3">
              {unlockedConstellations.map((constellation) => (
                <div
                  key={constellation.name}
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: `${constellation.color}15`,
                    borderColor: `${constellation.color}30`,
                    borderWidth: 1,
                  }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: constellation.color }}
                    >
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {constellation.displayName}
                      </p>
                      <p className="text-sm" style={{ color: constellation.color }}>
                        {constellation.arabicName} ({constellation.arabicScript})
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">{constellation.description}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
