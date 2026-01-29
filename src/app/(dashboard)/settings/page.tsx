'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, BottomNav, ProfileSelector } from '@/components/layout';
import { Card, Button, Avatar, Modal } from '@/components/ui';
import { useFamilyStore } from '@/store/familyStore';
import { createClient } from '@/lib/supabase/client';
import {
  Users,
  Calendar,
  Clock,
  CreditCard,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  Moon,
  Crown,
  FlaskConical,
  RefreshCw,
  Cloud,
  CloudOff,
  Loader2,
  Globe,
  MapPin,
  Image,
  Mail,
  Trash2,
  Tag,
  Check,
  AlertCircle,
  ExternalLink,
  TestTube2,
  Lock,
  Unlock,
  Heart,
} from 'lucide-react';
import { useSync } from '@/components/providers/SyncProvider';
import { subscriptionService } from '@/lib/subscription/subscriptionService';

export default function SettingsPage() {
  const router = useRouter();
  const {
    family,
    profiles,
    activeProfileId,
    setActiveProfile,
    setFamily,
    reset,
    togglePremium,
    testMode,
    testDay,
    testPhase,
    setTestMode,
    setTestDay,
    setTestPhase,
    lockedToProfileId,
    lockToProfile,
    unlockProfile,
    verifyLockPin,
    toggleTimezoneTracking,
    connectedFamilies,
    incomingRequests,
    fetchFamilyConnections,
  } = useFamilyStore();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showTestModeModal, setShowTestModeModal] = useState(false);
  const [showTimezoneModal, setShowTimezoneModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showProfileLockModal, setShowProfileLockModal] = useState(false);
  const [lockPin, setLockPin] = useState('');
  const [unlockPin, setUnlockPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [selectedLockProfile, setSelectedLockProfile] = useState<string | null>(null);
  const [settingsPin, setSettingsPin] = useState('');
  const [settingsUnlocked, setSettingsUnlocked] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Subscription state
  const [discountCode, setDiscountCode] = useState('');
  const [discountValidation, setDiscountValidation] = useState<{
    isValid?: boolean;
    discountDisplay?: string;
    errorMessage?: string;
  } | null>(null);
  const [isValidatingDiscount, setIsValidatingDiscount] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Stripe configuration state
  const [stripeConfig, setStripeConfig] = useState<{
    isConfigured: boolean;
    isTestMode: boolean;
    missingConfig: string[];
  } | null>(null);

  // Fetch Stripe configuration on mount
  useEffect(() => {
    fetch('/api/stripe/config')
      .then((res) => res.json())
      .then((data) => setStripeConfig(data))
      .catch(() => setStripeConfig({ isConfigured: false, isTestMode: true, missingConfig: ['Unknown'] }));
  }, []);

  // Lazily fetch family connections
  useEffect(() => {
    if (family) {
      fetchFamilyConnections();
    }
  }, [family, fetchFamilyConnections]);

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    suhoorReminder: true,
    iftarReminder: true,
    dailyCheckIn: true,
    familyActivity: false,
    weeklyProgress: true,
  });

  const { sync, isSyncing, lastSyncedAt, isOnline, hasPendingChanges } = useSync();

  const [suhoorTime, setSuhoorTime] = useState(family?.suhoorTime || '04:30');
  const [iftarTime, setIftarTime] = useState(family?.iftarTime || '18:30');
  const [useProfileTimes, setUseProfileTimes] = useState(family?.useProfilePrayerTimes || false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const isPaid = family?.subscriptionTier === 'paid';

  // Profile-specific state (must be after activeProfile is defined)
  const [profileSuhoorTime, setProfileSuhoorTime] = useState(activeProfile?.suhoorTime || '');
  const [profileIftarTime, setProfileIftarTime] = useState(activeProfile?.iftarTime || '');
  const [selectedTimezone, setSelectedTimezone] = useState(activeProfile?.timezone || '');
  const [locationLabel, setLocationLabel] = useState(activeProfile?.locationLabel || '');

  // Only show developer tools in development mode
  const isDev = process.env.NODE_ENV === 'development';

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      reset();
      router.push('/');
      router.refresh();
    } catch {
      console.error('Logout failed');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const { updateProfile, syncFromServer } = useFamilyStore();

  // Validate discount code
  const handleValidateDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountValidation(null);
      return;
    }

    setIsValidatingDiscount(true);
    setDiscountValidation(null);

    try {
      const result = await subscriptionService.validateDiscountCode(discountCode.trim());
      setDiscountValidation(result);
    } catch {
      setDiscountValidation({ isValid: false, errorMessage: 'Failed to validate code' });
    } finally {
      setIsValidatingDiscount(false);
    }
  };

  // Handle purchase
  const handlePurchase = async () => {
    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      const result = await subscriptionService.purchase(
        discountValidation?.isValid ? discountCode : undefined
      );

      if (!result.success && result.error) {
        setPurchaseError(result.error);
      }
      // On success, user is redirected to Stripe Checkout
    } catch {
      setPurchaseError('Something went wrong. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Handle billing portal
  const handleOpenBillingPortal = async () => {
    setIsPurchasing(true);
    try {
      await subscriptionService.openBillingPortal();
    } catch {
      setPurchaseError('Failed to open billing portal');
    } finally {
      setIsPurchasing(false);
    }
  };

  // Reset subscription modal state when closing
  const handleCloseSubscriptionModal = () => {
    setShowSubscriptionModal(false);
    setDiscountCode('');
    setDiscountValidation(null);
    setPurchaseError(null);
  };

  const handleSaveSchedule = () => {
    if (!family) return;

    // Save family times and toggle
    setFamily({
      ...family,
      suhoorTime,
      iftarTime,
      useProfilePrayerTimes: useProfileTimes,
      updatedAt: new Date().toISOString(),
    });

    // Save profile-specific times if enabled
    if (useProfileTimes && activeProfile && (profileSuhoorTime || profileIftarTime)) {
      updateProfile(activeProfile.id, {
        suhoorTime: profileSuhoorTime || undefined,
        iftarTime: profileIftarTime || undefined,
      });
    }

    setShowScheduleModal(false);
  };

  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">جارِ التحميل...</p>
      </div>
    );
  }

  // If profile is locked and settings haven't been unlocked with PIN, show PIN entry
  if (lockedToProfileId && !settingsUnlocked) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-6 pb-24">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">الإعدادات مقفلة</h1>
            <p className="text-slate-400">أدخل الرمز للوصول إلى الإعدادات</p>
          </div>

          <Card className="mb-6">
            <div className="space-y-4">
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={settingsPin}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setSettingsPin(val);
                  setPinError('');
                }}
                placeholder="••••"
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {pinError && (
                <p className="text-red-400 text-sm text-center">{pinError}</p>
              )}
              <Button
                onClick={() => {
                  if (settingsPin.length !== 4) {
                    setPinError('يرجى إدخال رمز من 4 أرقام');
                    return;
                  }
                  if (verifyLockPin(settingsPin)) {
                    setSettingsUnlocked(true);
                    setSettingsPin('');
                    setPinError('');
                  } else {
                    setPinError('رمز خاطئ');
                    setSettingsPin('');
                  }
                }}
                disabled={settingsPin.length !== 4}
                className="w-full"
              >
                فتح الإعدادات
              </Button>
            </div>
          </Card>

          <Button
            variant="ghost"
            onClick={() => router.push('/family')}
            className="w-full"
          >
            العودة للوحة التحكم
          </Button>
        </main>
        <BottomNav />
      </div>
    );
  }

  interface SettingsItem {
    icon: React.ReactNode;
    label: string;
    description: string;
    onClick: () => void;
    hidden?: boolean;
    highlight?: boolean;
    danger?: boolean;
  }

  interface SettingsSection {
    title: string;
    items: SettingsItem[];
  }

  const settingsSections: SettingsSection[] = [
    {
      title: 'الملفات الشخصية',
      items: [
        {
          icon: <Users className="w-5 h-5" />,
          label: 'إدارة الملفات',
          description: `${profiles.length} ملفات`,
          onClick: () => setShowProfileModal(true),
        },
      ],
    },
    {
      title: 'الجدول',
      items: [
        {
          icon: <Clock className="w-5 h-5" />,
          label: 'مواقيت الصلاة',
          description: `السحور: ${family.suhoorTime} • الإفطار: ${family.iftarTime}`,
          onClick: () => setShowScheduleModal(true),
        },
        {
          icon: <Calendar className="w-5 h-5" />,
          label: 'بداية رمضان',
          description: family.ramadanStartDate,
          onClick: () => {},
        },
        {
          icon: <Globe className="w-5 h-5" />,
          label: 'منطقتك الزمنية',
          description: activeProfile?.timezone || activeProfile?.locationLabel || 'حدد موقعك لربط العائلة',
          onClick: () => setShowTimezoneModal(true),
        },
      ],
    },
    {
      title: 'ميزات العائلة',
      items: [
        {
          icon: <Heart className="w-5 h-5" />,
          label: 'روابط العائلة',
          description: connectedFamilies?.length > 0
            ? `${connectedFamilies.length} عائلة متصلة`
            : 'شارك رحلة رمضانك',
          onClick: () => router.push('/connections'),
          highlight: (incomingRequests?.length ?? 0) > 0,
        },
        {
          icon: <MapPin className="w-5 h-5" />,
          label: 'العائلة البعيدة',
          description: family.enableTimezoneTracking ? 'مفعّل - انظر أوقات إفطار العائلة' : 'تتبع أفراد العائلة في مناطق زمنية مختلفة',
          onClick: () => toggleTimezoneTracking(!family.enableTimezoneTracking),
          highlight: family.enableTimezoneTracking,
        },
        {
          icon: lockedToProfileId ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />,
          label: lockedToProfileId ? 'الملف مقفل' : 'وضع الأطفال الآمن',
          description: lockedToProfileId
            ? `مقفل على ${profiles.find(p => p.id === lockedToProfileId)?.nickname || 'ملف'}`
            : 'قفل الجهاز على ملف واحد',
          onClick: () => setShowProfileLockModal(true),
          highlight: !!lockedToProfileId,
        },
      ],
    },
    {
      title: 'الذكريات والكبسولات',
      items: [
        {
          icon: <Image className="w-5 h-5" />,
          label: 'ذكريات الصور',
          description: 'التقط لحظات رمضان',
          onClick: () => router.push('/memories'),
        },
        {
          icon: <Mail className="w-5 h-5" />,
          label: 'كبسولات الزمن',
          description: 'رسائل للمستقبل',
          onClick: () => router.push('/capsules'),
        },
      ],
    },
    {
      title: 'الاشتراك',
      items: [
        {
          icon: <Crown className="w-5 h-5" />,
          label: isPaid ? 'اشتراك رمضان' : 'ترقية للاشتراك',
          description: isPaid ? 'اشتراك فعال' : 'احصل على كل الميزات',
          onClick: () => setShowSubscriptionModal(true),
          highlight: !isPaid,
        },
        {
          icon: <CreditCard className="w-5 h-5" />,
          label: 'الفواتير',
          description: 'إدارة الدفع',
          onClick: () => setShowSubscriptionModal(true),
          hidden: !isPaid,
        },
      ],
    },
    {
      title: 'الإشعارات',
      items: [
        {
          icon: <Bell className="w-5 h-5" />,
          label: 'التذكيرات',
          description: 'السحور، الإفطار، المتابعة اليومية',
          onClick: () => setShowNotificationsModal(true),
        },
      ],
    },
    {
      title: 'الأدوات',
      items: [
        {
          icon: <FlaskConical className="w-5 h-5" />,
          label: testMode ? 'وضع الاختبار مفعّل' : 'وضع الاختبار',
          description: testMode
            ? testPhase === 'during'
              ? `خلال رمضان - اليوم ${testDay}`
              : testPhase === 'before'
              ? 'وضع ما قبل رمضان'
              : 'وضع ما بعد رمضان'
            : 'معاينة أي مرحلة أو يوم من رمضان',
          onClick: () => setShowTestModeModal(true),
          highlight: testMode,
        },
        {
          icon: <Trash2 className="w-5 h-5" />,
          label: 'مسح كل البيانات',
          description: 'إعادة التطبيق لحالته الأولى',
          onClick: () => setShowClearDataModal(true),
          danger: true,
        },
      ],
    },
    {
      title: 'الحساب',
      items: [
        {
          icon: <Shield className="w-5 h-5" />,
          label: 'سياسة الخصوصية',
          description: 'عرض سياسة الخصوصية',
          onClick: () => router.push('/privacy'),
        },
        {
          icon: <LogOut className="w-5 h-5" />,
          label: 'تسجيل الخروج',
          description: '',
          onClick: handleLogout,
          danger: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">الإعدادات</h1>
        </div>

        {/* Current profile */}
        {activeProfile && (
          <Card className="mb-6">
            <div className="flex items-center gap-4">
              <Avatar avatarId={activeProfile.avatar} size="lg" />
              <div className="flex-1">
                <p className="font-semibold text-white">{activeProfile.nickname}</p>
                <p className="text-sm text-slate-400 capitalize">
                  {activeProfile.profileType.replace('_', ' ')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProfileModal(true)}
              >
                تبديل
              </Button>
            </div>
          </Card>
        )}

        {/* Settings sections */}
        {settingsSections.map((section) => (
          <div key={section.title} className="mb-6">
            <h2 className="text-sm font-medium text-slate-400 mb-2 px-1">
              {section.title}
            </h2>
            <Card padding="none">
              {section.items
                .filter((item) => !item.hidden)
                .map((item, index) => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    disabled={item.danger && isLoggingOut}
                    className={`w-full p-4 flex items-center gap-4 transition-colors ${
                      index !== 0 ? 'border-t border-slate-700/50' : ''
                    } ${
                      item.danger
                        ? 'text-red-400 hover:bg-red-500/10'
                        : item.highlight
                        ? 'text-amber-400 hover:bg-amber-500/10'
                        : 'text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        item.danger
                          ? 'bg-red-500/10'
                          : item.highlight
                          ? 'bg-amber-500/10'
                          : 'bg-slate-800'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{item.label}</p>
                      {item.description && (
                        <p className="text-sm text-slate-500">{item.description}</p>
                      )}
                    </div>
                    {!item.danger && <ChevronRight className="w-5 h-5 text-slate-600" />}
                  </button>
                ))}
            </Card>
          </div>
        ))}

        {/* Sync status */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Cloud className="w-4 h-4 text-green-400" />
              ) : (
                <CloudOff className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-sm text-slate-300">
                {isOnline ? 'متصل' : 'غير متصل'}
              </span>
            </div>
            <button
              onClick={sync}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSyncing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              {isSyncing ? 'جارِ المزامنة...' : 'مزامنة الآن'}
            </button>
          </div>
          <p className="text-xs text-slate-500">
            {lastSyncedAt
              ? `آخر مزامنة: ${new Date(lastSyncedAt).toLocaleTimeString()}`
              : 'لم تتم المزامنة بعد'}
            {hasPendingChanges && (
              <span className="text-amber-400 mr-2">• تغييرات معلقة</span>
            )}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            تتم مزامنة بياناتك عبر جميع أجهزتك تلقائياً.
          </p>
        </div>

        {/* معلومات التطبيق */}
        <div className="text-center text-sm text-slate-500 mt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <Moon className="w-3 h-3 text-slate-900" />
            </div>
            <span>ميني رمضان</span>
          </div>
          <p>الإصدار 1.0.0</p>
          <p className="mt-2">صُنع بـ ❤️ للعائلات</p>
        </div>
      </main>

      {/* Profile selector modal */}
      <Modal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        title="ملفات العائلة"
      >
        <ProfileSelector
          profiles={profiles}
          activeProfileId={activeProfileId}
          onSelectProfile={(id) => {
            setActiveProfile(id);
            setShowProfileModal(false);
          }}
          onAddProfile={() => {
            setShowProfileModal(false);
            router.push('/onboarding');
          }}
        />
      </Modal>

      {/* Schedule modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="مواقيت الصلاة"
      >
        <div className="space-y-4">
          {/* أوقات العائلة الافتراضية */}
          <div className="p-3 bg-slate-800/50 rounded-xl">
            <p className="text-sm font-medium text-white mb-3">أوقات العائلة الافتراضية</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">نهاية السحور</label>
                <input
                  type="time"
                  value={suhoorTime}
                  onChange={(e) => setSuhoorTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">وقت الإفطار</label>
                <input
                  type="time"
                  value={iftarTime}
                  onChange={(e) => setIftarTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* تبديل للأوقات الفردية */}
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-white text-sm">أوقات مختلفة لكل شخص</p>
              <p className="text-xs text-slate-400">للعائلة في مواقع مختلفة</p>
            </div>
            <button
              onClick={() => setUseProfileTimes(!useProfileTimes)}
              className={`w-12 h-7 rounded-full transition-colors relative ${
                useProfileTimes ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                  useProfileTimes ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* أوقات الملف الشخصي */}
          {useProfileTimes && activeProfile && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-sm font-medium text-amber-300 mb-3">
                مواقيت صلاة {activeProfile.nickname}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">نهاية السحور</label>
                  <input
                    type="time"
                    value={profileSuhoorTime}
                    onChange={(e) => setProfileSuhoorTime(e.target.value)}
                    placeholder={suhoorTime}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">وقت الإفطار</label>
                  <input
                    type="time"
                    value={profileIftarTime}
                    onChange={(e) => setProfileIftarTime(e.target.value)}
                    placeholder={iftarTime}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                اتركه فارغاً لاستخدام أوقات العائلة الافتراضية
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setShowScheduleModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveSchedule} className="flex-1">
              حفظ
            </Button>
          </div>
        </div>
      </Modal>

      {/* نافذة وضع الاختبار */}
      <Modal
        isOpen={showTestModeModal}
        onClose={() => setShowTestModeModal(false)}
        title="وضع الاختبار"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            يتيح لك وضع الاختبار معاينة ميزات ومحتوى رمضان لأي يوم.
          </p>

          {/* التبديل */}
          <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
            <div>
              <p className="font-medium text-white">تفعيل وضع الاختبار</p>
              <p className="text-sm text-slate-400">تجاوز العد التنازلي، عرض محتوى رمضان</p>
            </div>
            <button
              onClick={() => setTestMode(!testMode)}
              className={`w-14 h-8 rounded-full transition-colors relative ${
                testMode ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform ${
                  testMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* اختيار المرحلة */}
          {testMode && (
            <div>
              <label className="block text-sm text-slate-400 mb-3">
                اختر المرحلة للاختبار
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  onClick={() => setTestPhase('before')}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    testPhase === 'before'
                      ? 'bg-purple-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  قبل رمضان
                </button>
                <button
                  onClick={() => setTestPhase('during')}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    testPhase === 'during'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  خلال
                </button>
                <button
                  onClick={() => setTestPhase('after')}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    testPhase === 'after'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  بعد
                </button>
              </div>
            </div>
          )}

          {/* اختيار اليوم - يظهر فقط خلال المرحلة */}
          {testMode && testPhase === 'during' && (
            <div>
              <label className="block text-sm text-slate-400 mb-3">
                اختر يوم رمضان للمعاينة
              </label>
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    onClick={() => setTestDay(day)}
                    className={`p-2 rounded-lg text-sm font-medium transition-all ${
                      testDay === day
                        ? 'bg-amber-500 text-slate-900'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowTestModeModal(false)}
              className="flex-1"
            >
              إغلاق
            </Button>
            {testMode && (
              <Button
                onClick={() => {
                  setShowTestModeModal(false);
                  router.push('/family');
                }}
                className="flex-1"
              >
                الذهاب للوحة التحكم
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* نافذة الإشعارات */}
      <Modal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        title="إعدادات الإشعارات"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            اختر التذكيرات التي تريد تلقيها.
          </p>

          <div className="space-y-3">
            {/* تذكير السحور */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium text-white">تذكير السحور</p>
                <p className="text-sm text-slate-400">قبل 30 دقيقة من نهاية السحور</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, suhoorReminder: !n.suhoorReminder }))}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications.suhoorReminder ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                    notifications.suhoorReminder ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* تذكير الإفطار */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium text-white">تذكير الإفطار</p>
                <p className="text-sm text-slate-400">قبل 15 دقيقة من الإفطار</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, iftarReminder: !n.iftarReminder }))}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications.iftarReminder ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                    notifications.iftarReminder ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* المتابعة اليومية */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium text-white">المتابعة اليومية</p>
                <p className="text-sm text-slate-400">تذكير مسائي لتسجيل يومك</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, dailyCheckIn: !n.dailyCheckIn }))}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications.dailyCheckIn ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                    notifications.dailyCheckIn ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* نشاط العائلة */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium text-white">نشاط العائلة</p>
                <p className="text-sm text-slate-400">عندما يكسب أفراد العائلة نجوماً</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, familyActivity: !n.familyActivity }))}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications.familyActivity ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                    notifications.familyActivity ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* التقدم الأسبوعي */}
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
              <div>
                <p className="font-medium text-white">التقدم الأسبوعي</p>
                <p className="text-sm text-slate-400">ملخص أسبوع عائلتك</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, weeklyProgress: !n.weeklyProgress }))}
                className={`w-12 h-7 rounded-full transition-colors relative ${
                  notifications.weeklyProgress ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                    notifications.weeklyProgress ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowNotificationsModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                // Save notification preferences
                // In production, this would save to the database
                setShowNotificationsModal(false);
              }}
              className="flex-1"
            >
              حفظ
            </Button>
          </div>
        </div>
      </Modal>

      {/* نافذة المنطقة الزمنية */}
      <Modal
        isOpen={showTimezoneModal}
        onClose={() => setShowTimezoneModal(false)}
        title="موقعك ومنطقتك الزمنية"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            حدد منطقتك الزمنية لمساعدة أفراد العائلة في مواقع مختلفة على معرفة وقت إفطارك.
          </p>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              <MapPin className="w-4 h-4 inline ml-1" />
              تسمية الموقع (اختياري)
            </label>
            <input
              type="text"
              value={locationLabel}
              onChange={(e) => setLocationLabel(e.target.value)}
              placeholder="مثال: 'في دبي' أو 'في لندن'"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              يظهر كـ &quot;{activeProfile?.nickname || 'أنت'} {locationLabel || 'في دبي'}&quot;
            </p>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              <Globe className="w-4 h-4 inline ml-1" />
              المنطقة الزمنية
            </label>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">اختر المنطقة الزمنية...</option>
              <option value="Europe/London">London (GMT/BST)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Europe/Istanbul">Istanbul (TRT)</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
              <option value="Asia/Karachi">Pakistan (PKT)</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Asia/Dhaka">Bangladesh (BST)</option>
              <option value="Asia/Jakarta">Indonesia (WIB)</option>
              <option value="Asia/Kuala_Lumpur">Malaysia (MYT)</option>
              <option value="America/New_York">New York (EST/EDT)</option>
              <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
              <option value="America/Toronto">Toronto (EST/EDT)</option>
              <option value="Australia/Sydney">Sydney (AEST)</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowTimezoneModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                // Update profile with timezone and location
                if (activeProfile) {
                  updateProfile(activeProfile.id, {
                    timezone: selectedTimezone || undefined,
                    locationLabel: locationLabel || undefined,
                  });
                }
                setShowTimezoneModal(false);
              }}
              className="flex-1"
            >
              حفظ
            </Button>
          </div>
        </div>
      </Modal>

      {/* نافذة قفل الملف */}
      <Modal
        isOpen={showProfileLockModal}
        onClose={() => {
          setShowProfileLockModal(false);
          setLockPin('');
          setUnlockPin('');
          setPinError('');
          setSelectedLockProfile(null);
        }}
        title="وضع الأطفال الآمن"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            قفل هذا الجهاز على ملف واحد برمز من 4 أرقام. مثالي عندما يستخدم طفل جهازاً مشتركاً.
          </p>

          {lockedToProfileId ? (
            <>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                <Lock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-300 font-semibold">
                  مقفل على {profiles.find(p => p.id === lockedToProfileId)?.nickname}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  أدخل الرمز لفتح القفل
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">أدخل رمز من 4 أرقام</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={unlockPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setUnlockPin(val);
                    setPinError('');
                  }}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {pinError && (
                  <p className="text-red-400 text-sm mt-2">{pinError}</p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowProfileLockModal(false);
                    setUnlockPin('');
                    setPinError('');
                  }}
                  className="flex-1"
                >
                  إغلاق
                </Button>
                <Button
                  onClick={() => {
                    if (unlockPin.length !== 4) {
                      setPinError('يرجى إدخال رمز من 4 أرقام');
                      return;
                    }
                    const success = unlockProfile(unlockPin);
                    if (success) {
                      setShowProfileLockModal(false);
                      setUnlockPin('');
                      setPinError('');
                    } else {
                      setPinError('رمز خاطئ');
                      setUnlockPin('');
                    }
                  }}
                  disabled={unlockPin.length !== 4}
                  className="flex-1"
                >
                  <Unlock className="w-4 h-4 ml-2" />
                  فتح القفل
                </Button>
              </div>
            </>
          ) : selectedLockProfile ? (
            <>
              <div className="p-4 bg-slate-800/50 rounded-xl text-center">
                <Avatar avatarId={profiles.find(p => p.id === selectedLockProfile)?.avatar || 'star'} size="lg" />
                <p className="text-white font-semibold mt-2">
                  قفل على {profiles.find(p => p.id === selectedLockProfile)?.nickname}
                </p>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">حدد رمز من 4 أرقام لفتح القفل لاحقاً</label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={lockPin}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setLockPin(val);
                    setPinError('');
                  }}
                  placeholder="••••"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-[0.5em] placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {pinError && (
                  <p className="text-red-400 text-sm mt-2">{pinError}</p>
                )}
                <p className="text-xs text-slate-500 mt-2">
                  تذكر هذا الرمز - ستحتاجه لفتح قفل الجهاز
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedLockProfile(null);
                    setLockPin('');
                    setPinError('');
                  }}
                  className="flex-1"
                >
                  رجوع
                </Button>
                <Button
                  onClick={() => {
                    if (lockPin.length !== 4) {
                      setPinError('يرجى إدخال رمز من 4 أرقام');
                      return;
                    }
                    lockToProfile(selectedLockProfile, lockPin);
                    setShowProfileLockModal(false);
                    setSelectedLockProfile(null);
                    setLockPin('');
                  }}
                  disabled={lockPin.length !== 4}
                  className="flex-1"
                >
                  <Lock className="w-4 h-4 ml-2" />
                  قفل الجهاز
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm text-white font-medium">اختر ملفاً للقفل عليه:</p>
                <div className="space-y-2">
                  {profiles.filter(p => p.profileType !== 'adult').map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setSelectedLockProfile(profile.id)}
                      className="w-full flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      <Avatar avatarId={profile.avatar} size="sm" />
                      <div className="text-left flex-1">
                        <p className="font-medium text-white">{profile.nickname}</p>
                        <p className="text-xs text-slate-400 capitalize">
                          {profile.profileType.replace('_', ' ')}
                        </p>
                      </div>
                      <Lock className="w-4 h-4 text-slate-500" />
                    </button>
                  ))}
                </div>
                {profiles.filter(p => p.profileType !== 'adult').length === 0 && (
                  <p className="text-center text-slate-500 py-4">
                    لا توجد ملفات أطفال للقفل عليها. أضف ملف طفل أولاً.
                  </p>
                )}
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl">
                <p className="text-xs text-slate-400">
                  <strong className="text-slate-300">ملاحظة:</strong> ستحدد رمز من 4 أرقام يعرفه الوالدان فقط. يمكن للأطفال رؤية تقدمهم لكن لا يمكنهم تبديل الملفات أو الوصول للإعدادات بدون الرمز.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowProfileLockModal(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* نافذة مسح البيانات */}
      <Modal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        title="مسح كل البيانات"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
            <p className="text-red-400 text-sm">
              سيحذف هذا جميع بياناتك المحلية بما في ذلك النجوم وسجلات الصيام والتقدم.
              لا يمكن التراجع عن هذا الإجراء.
            </p>
          </div>

          <p className="text-slate-400 text-sm">
            استخدم هذا إذا كنت تواجه مشاكل مع البيانات القديمة أو تريد البدء من جديد.
          </p>

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setShowClearDataModal(false)}
              className="flex-1"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                // Clear localStorage and reset store
                localStorage.removeItem('miniramadan-family-storage');
                reset();
                setShowClearDataModal(false);
                router.push('/');
                router.refresh();
              }}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              مسح كل البيانات
            </Button>
          </div>
        </div>
      </Modal>

      {/* Subscription modal */}
      <Modal
        isOpen={showSubscriptionModal}
        onClose={handleCloseSubscriptionModal}
        title={isPaid ? 'تذكرة رمضان' : 'ترقية إلى تذكرة رمضان'}
      >
        <div className="space-y-4">
          {/* Test mode banner */}
          {stripeConfig?.isTestMode && stripeConfig?.isConfigured && (
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-purple-400">
                <TestTube2 className="w-4 h-4" />
                <span className="text-sm font-medium">وضع الاختبار مفعّل</span>
              </div>
              <p className="text-xs text-purple-300 mt-1">
                استخدم البطاقة <span className="font-mono bg-purple-500/20 px-1 rounded">4242 4242 4242 4242</span> مع أي تاريخ مستقبلي ورمز CVC
              </p>
            </div>
          )}

          {/* Not configured warning */}
          {stripeConfig && !stripeConfig.isConfigured && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">الدفع غير مُعَدّ</span>
              </div>
              <p className="text-xs text-amber-300 mt-1">
                ناقص: {stripeConfig.missingConfig.join(', ')}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                أضف مفاتيح Stripe إلى .env.local لتفعيل الدفع
              </p>
            </div>
          )}

          {isPaid ? (
            <>
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center">
                <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <p className="text-amber-300 font-semibold">لديك تذكرة رمضان!</p>
                <p className="text-sm text-slate-400 mt-1">جميع الميزات المميزة مفتوحة</p>
                {family?.subscriptionStatus === 'trialing' && (
                  <p className="text-xs text-amber-400 mt-2">الفترة التجريبية المجانية نشطة</p>
                )}
                {family?.subscriptionCancelAtPeriodEnd && (
                  <p className="text-xs text-red-400 mt-2">سينتهي الاشتراك في نهاية الفترة</p>
                )}
              </div>
              <div className="space-y-2 text-sm text-slate-300">
                <p>اشتراكك يشمل:</p>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>ملفات عائلية غير محدودة</li>
                  <li>جميع قصص ما قبل النوم</li>
                  <li>تخزين ذكريات الصور</li>
                  <li>كبسولات الزمن</li>
                  <li>دعم أولوية</li>
                </ul>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleCloseSubscriptionModal}
                  className="flex-1"
                >
                  إغلاق
                </Button>
                <Button
                  onClick={handleOpenBillingPortal}
                  disabled={isPurchasing}
                  className="flex-1"
                >
                  {isPurchasing ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <ExternalLink className="w-4 h-4 mr-2" />
                  )}
                  إدارة الفواتير
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl text-center">
                <Crown className="w-10 h-10 text-amber-400 mx-auto mb-2" />
                <p className="text-white font-semibold text-lg">تذكرة رمضان</p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {discountValidation?.isValid ? (
                    <>
                      <span className="text-lg text-slate-500 line-through">£29.99</span>
                      <span className="text-2xl font-bold text-amber-400">{discountValidation.discountDisplay}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-amber-400">£29.99</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">اشتراك 12 شهراً • دفعة واحدة</p>
              </div>

              {/* Discount code input */}
              <div className="space-y-2">
                <label className="block text-sm text-slate-400">
                  <Tag className="w-4 h-4 inline ml-1" />
                  لديك رمز خصم؟
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value.toUpperCase());
                      setDiscountValidation(null);
                    }}
                    placeholder="أدخل الرمز"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                  />
                  <Button
                    variant="ghost"
                    onClick={handleValidateDiscount}
                    disabled={isValidatingDiscount || !discountCode.trim()}
                    className="px-4"
                  >
                    {isValidatingDiscount ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'تطبيق'
                    )}
                  </Button>
                </div>
                {discountValidation && (
                  <div className={`flex items-center gap-2 text-sm ${discountValidation.isValid ? 'text-emerald-400' : 'text-red-400'}`}>
                    {discountValidation.isValid ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تم تطبيق الخصم: {discountValidation.discountDisplay}</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        <span>{discountValidation.errorMessage}</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-slate-300">افتح جميع الميزات:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400">✓</span> ملفات عائلية غير محدودة
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400">✓</span> جميع قصص ما قبل النوم الـ 30
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400">✓</span> ذكريات الصور والمعرض
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400">✓</span> كبسولات زمن لرمضان القادم
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400">✓</span> تتبع التقدم من سنة لسنة
                  </li>
                </ul>
              </div>

              {purchaseError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <p className="text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {purchaseError}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="ghost"
                  onClick={handleCloseSubscriptionModal}
                  className="flex-1"
                  disabled={isPurchasing}
                >
                  لاحقاً
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing || (stripeConfig !== null && !stripeConfig.isConfigured)}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      جارِ المعالجة...
                    </>
                  ) : stripeConfig && !stripeConfig.isConfigured ? (
                    'الإعداد مطلوب'
                  ) : (
                    'احصل على تذكرة رمضان'
                  )}
                </Button>
              </div>
              <p className="text-xs text-center text-slate-500">
                {stripeConfig?.isTestMode
                  ? 'وضع الاختبار - لن يتم خصم مبالغ حقيقية'
                  : 'دفعة واحدة • اشتراك حتى رمضان القادم'}
              </p>
            </>
          )}
        </div>
      </Modal>

      <BottomNav />
    </div>
  );
}
