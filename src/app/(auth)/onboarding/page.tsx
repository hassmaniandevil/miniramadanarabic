'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Avatar, Input } from '@/components/ui';
import { useFamilyStore } from '@/store/familyStore';
import { getAvatarsForProfileType } from '@/data/avatars';
import { ProfileType, Profile } from '@/types';
import { generateId, getUpcomingRamadanDate } from '@/lib/utils';
import { syncService } from '@/lib/supabase/sync';
import {
  Moon,
  ArrowRight,
  ArrowLeft,
  Plus,
  Check,
  User,
  Baby,
  Users,
  Calendar,
  Clock,
  MapPin,
  Loader2,
} from 'lucide-react';

type OnboardingStep = 'welcome' | 'profiles' | 'schedule' | 'complete';

interface TempProfile {
  id: string;
  nickname: string;
  avatar: string;
  profileType: ProfileType;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { setFamily, setProfiles, setActiveProfile } = useFamilyStore();

  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [tempProfiles, setTempProfiles] = useState<TempProfile[]>([]);
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  // New profile form state
  const [newProfileType, setNewProfileType] = useState<ProfileType | null>(null);
  const [newNickname, setNewNickname] = useState('');
  const [newAvatar, setNewAvatar] = useState('');

  // Schedule state
  const [ramadanStart, setRamadanStart] = useState(getUpcomingRamadanDate());
  const [suhoorTime, setSuhoorTime] = useState('04:30');
  const [iftarTime, setIftarTime] = useState('18:30');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [locationName, setLocationName] = useState<string | null>(null);

  // Count adults
  const adultCount = tempProfiles.filter((p) => p.profileType === 'adult').length;
  const maxAdultsReached = adultCount >= 2;

  // Fetch prayer times based on location
  const fetchPrayerTimes = async () => {
    setLocationStatus('loading');

    try {
      // Get user's location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;

      // Fetch prayer times from Aladhan API
      const today = new Date();
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}?latitude=${latitude}&longitude=${longitude}&method=2`
      );

      if (!response.ok) throw new Error('Failed to fetch prayer times');

      const data = await response.json();
      const timings = data.data.timings;
      const meta = data.data.meta;

      // Set suhoor (Fajr) and iftar (Maghrib) times
      setSuhoorTime(timings.Fajr);
      setIftarTime(timings.Maghrib);
      setLocationName(`${meta.timezone.split('/').pop()?.replace('_', ' ')}`);
      setLocationStatus('success');
    } catch {
      setLocationStatus('error');
    }
  };

  // Auto-fetch prayer times when reaching schedule step
  useEffect(() => {
    if (step === 'schedule' && locationStatus === 'idle') {
      fetchPrayerTimes();
    }
  }, [step, locationStatus]);

  const profileTypes: { type: ProfileType; label: string; description: string; icon: React.ReactNode; color: string }[] = [
    {
      type: 'adult',
      label: 'والد/والدة',
      description: 'وصول كامل للوحة العائلة',
      icon: <User className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-400',
    },
    {
      type: 'child',
      label: 'طفل (7-12)',
      description: 'رفيق رمضان الكامل',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-400',
    },
    {
      type: 'little_star',
      label: 'نجم صغير (3-6)',
      description: 'زر مساعدة بسيط',
      icon: <Baby className="w-6 h-6" />,
      color: 'from-pink-500 to-purple-400',
    },
  ];

  const handleAddProfile = () => {
    if (!newProfileType || !newNickname || !newAvatar) return;

    const newProfile: TempProfile = {
      id: generateId(),
      nickname: newNickname,
      avatar: newAvatar,
      profileType: newProfileType,
    };

    setTempProfiles([...tempProfiles, newProfile]);
    resetProfileForm();
  };

  const resetProfileForm = () => {
    setNewProfileType(null);
    setNewNickname('');
    setNewAvatar('');
    setIsAddingProfile(false);
  };

  const removeProfile = (id: string) => {
    setTempProfiles(tempProfiles.filter((p) => p.id !== id));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);

    try {
      // Create family in Supabase
      const serverFamily = await syncService.createFamily({
        email: '',
        familyName: 'Our Family',
        ramadanStartDate: ramadanStart,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        suhoorTime,
        iftarTime,
        subscriptionTier: 'free',
        subscriptionStatus: null,
        stripeCustomerId: null,
      });

      if (!serverFamily) {
        // Fallback to local-only if server fails
        const family = {
          id: generateId(),
          email: '',
          familyName: 'Our Family',
          ramadanStartDate: ramadanStart,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          suhoorTime,
          iftarTime,
          subscriptionTier: 'free' as const,
          subscriptionStatus: null,
          stripeCustomerId: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const profiles: Profile[] = tempProfiles.map((tp) => ({
          ...tp,
          familyId: family.id,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));

        setFamily(family);
        setProfiles(profiles);
        if (profiles.length > 0) {
          setActiveProfile(profiles[0].id);
        }

        router.push('/family');
        return;
      }

      // Create profiles in Supabase
      const createdProfiles: Profile[] = [];
      for (const tp of tempProfiles) {
        const serverProfile = await syncService.createProfile({
          familyId: serverFamily.id,
          nickname: tp.nickname,
          avatar: tp.avatar,
          profileType: tp.profileType,
          isActive: true,
        });

        if (serverProfile) {
          createdProfiles.push(serverProfile);
        }
      }

      // Update local store with server data
      setFamily(serverFamily);
      setProfiles(createdProfiles);
      if (createdProfiles.length > 0) {
        setActiveProfile(createdProfiles[0].id);
      }

      router.push('/family');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Still navigate on error - local data will be used
      router.push('/family');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceedFromProfiles = tempProfiles.length >= 1;
  const hasAdult = tempProfiles.some((p) => p.profileType === 'adult');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 mb-6">
                <Moon className="w-10 h-10 text-slate-900" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">أهلاً بك في ميني رمضان!</h1>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                دعنا نُعِدّ حساب عائلتك. سننشئ ملفات لكل فرد
                ونضبط جدول رمضانك.
              </p>
              <Button onClick={() => setStep('profiles')} size="lg">
                لنبدأ
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </motion.div>
          )}

          {/* Profiles Step */}
          {step === 'profiles' && (
            <motion.div
              key="profiles"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">من في عائلتك؟</h2>
                <p className="text-slate-400">
                  أضف ملفات لكل من سيستخدم ميني رمضان
                </p>
              </div>

              {/* Existing profiles */}
              {tempProfiles.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {tempProfiles.map((profile) => (
                    <Card key={profile.id} className="p-4 relative group">
                      <button
                        onClick={() => removeProfile(profile.id)}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <div className="flex flex-col items-center">
                        <Avatar avatarId={profile.avatar} size="lg" />
                        <p className="font-medium text-white mt-2">{profile.nickname}</p>
                        <p className="text-xs text-slate-400 capitalize">
                          {profile.profileType.replace('_', ' ')}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Add profile form */}
              {isAddingProfile ? (
                <Card className="p-6">
                  <AnimatePresence mode="wait">
                    {!newProfileType ? (
                      <motion.div
                        key="type-select"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <p className="text-sm text-slate-400 mb-4">اختر نوع الملف:</p>
                        <div className="space-y-3">
                          {profileTypes.map((pt) => {
                            const isDisabled = pt.type === 'adult' && maxAdultsReached;
                            return (
                              <button
                                key={pt.type}
                                onClick={() => !isDisabled && setNewProfileType(pt.type)}
                                disabled={isDisabled}
                                className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${
                                  isDisabled
                                    ? 'border-slate-800 opacity-50 cursor-not-allowed'
                                    : 'border-slate-700 hover:border-amber-500'
                                }`}
                              >
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${pt.color} text-white`}>
                                  {pt.icon}
                                </div>
                                <div className="text-left flex-1">
                                  <p className="font-medium text-white">{pt.label}</p>
                                  <p className="text-sm text-slate-400">
                                    {isDisabled ? 'الحد الأقصى والدان' : pt.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                        <Button
                          variant="ghost"
                          onClick={resetProfileForm}
                          className="w-full mt-4"
                        >
                          إلغاء
                        </Button>
                      </motion.div>
                    ) : !newAvatar ? (
                      <motion.div
                        key="avatar-select"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <button
                            onClick={() => setNewProfileType(null)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <p className="text-sm text-slate-400">اختر صورة رمزية:</p>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          {getAvatarsForProfileType(newProfileType).map((avatar) => (
                            <button
                              key={avatar.id}
                              onClick={() => setNewAvatar(avatar.id)}
                              className="p-3 rounded-xl border border-slate-700 hover:border-amber-500 transition-all flex items-center justify-center"
                            >
                              <span className="text-3xl">{avatar.emoji}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="name-input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <button
                            onClick={() => setNewAvatar('')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <p className="text-sm text-slate-400">ما اسمه/اسمها؟</p>
                        </div>
                        <div className="flex items-center gap-4 mb-4">
                          <Avatar avatarId={newAvatar} size="lg" />
                          <Input
                            value={newNickname}
                            onChange={(e) => setNewNickname(e.target.value)}
                            placeholder="الاسم أو اللقب"
                            autoFocus
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="ghost"
                            onClick={resetProfileForm}
                            className="flex-1"
                          >
                            إلغاء
                          </Button>
                          <Button
                            onClick={handleAddProfile}
                            disabled={!newNickname}
                            className="flex-1"
                          >
                            إضافة ملف
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              ) : (
                <button
                  onClick={() => setIsAddingProfile(true)}
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2 text-slate-400 hover:text-white"
                >
                  <Plus className="w-5 h-5" />
                  أضف ملفاً
                </button>
              )}

              {/* Warning if no adult */}
              {tempProfiles.length > 0 && !hasAdult && (
                <p className="text-sm text-amber-400 mt-4 text-center">
                  نصيحة: أضف ملف والد واحد على الأقل لإدارة الإعدادات
                </p>
              )}

              {/* Navigation */}
              <div className="flex gap-3 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setStep('welcome')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  رجوع
                </Button>
                <Button
                  onClick={() => setStep('schedule')}
                  disabled={!canProceedFromProfiles}
                  className="flex-1"
                >
                  متابعة
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Schedule Step */}
          {step === 'schedule' && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">اضبط جدولك</h2>
                <p className="text-slate-400">
                  اضبط توقيت رمضانك
                </p>
              </div>

              <Card className="p-6 space-y-6">
                {/* Location status */}
                <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-800/50">
                  {locationStatus === 'loading' && (
                    <>
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="text-sm text-slate-300">جارِ البحث عن مواقيت صلاتك...</span>
                    </>
                  )}
                  {locationStatus === 'success' && locationName && (
                    <>
                      <MapPin className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-slate-300">
                        المواقيت مضبوطة لـ <span className="text-emerald-400">{locationName}</span>
                      </span>
                    </>
                  )}
                  {locationStatus === 'error' && (
                    <>
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-400">باستخدام المواقيت الافتراضية</span>
                      <button
                        onClick={fetchPrayerTimes}
                        className="text-sm text-amber-400 hover:text-amber-300 mr-2"
                      >
                        حاول مرة أخرى
                      </button>
                    </>
                  )}
                  {locationStatus === 'idle' && (
                    <>
                      <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="text-sm text-slate-300">جارِ تحديد الموقع...</span>
                    </>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                    <Calendar className="w-4 h-4" />
                    تاريخ بداية رمضان
                  </label>
                  <input
                    type="date"
                    value={ramadanStart}
                    onChange={(e) => setRamadanStart(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <Clock className="w-4 h-4" />
                      نهاية السحور (الفجر)
                    </label>
                    <input
                      type="time"
                      value={suhoorTime}
                      onChange={(e) => setSuhoorTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm text-slate-300 mb-2">
                      <Clock className="w-4 h-4" />
                      وقت الإفطار (المغرب)
                    </label>
                    <input
                      type="time"
                      value={iftarTime}
                      onChange={(e) => setIftarTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 text-center">
                  تم اكتشاف المواقيت تلقائياً من موقعك. يمكنك تعديلها في أي وقت.
                </p>
              </Card>

              <div className="flex gap-3 mt-8">
                <Button
                  variant="ghost"
                  onClick={() => setStep('profiles')}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  رجوع
                </Button>
                <Button
                  onClick={() => setStep('complete')}
                  className="flex-1"
                >
                  متابعة
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Complete Step */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500 mb-6"
              >
                <Check className="w-10 h-10 text-white" />
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-4">كل شيء جاهز!</h1>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                حساب عائلتك جاهز. لنبدأ رحلة رمضانك معاً!
              </p>

              {/* Profile summary */}
              <div className="flex justify-center -space-x-3 mb-8">
                {tempProfiles.map((profile) => (
                  <Avatar
                    key={profile.id}
                    avatarId={profile.avatar}
                    size="lg"
                    className="ring-4 ring-slate-950"
                  />
                ))}
              </div>

              <Button onClick={handleComplete} size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    جارِ الإعداد...
                  </>
                ) : (
                  <>
                    الذهاب للوحة التحكم
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {['welcome', 'profiles', 'schedule', 'complete'].map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                ['welcome', 'profiles', 'schedule', 'complete'].indexOf(step) >= i
                  ? 'bg-amber-400'
                  : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
