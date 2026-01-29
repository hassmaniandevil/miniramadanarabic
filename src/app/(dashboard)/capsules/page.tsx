'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Header, BottomNav, ProfileSelectorCompact } from '@/components/layout';
import { Card, Button } from '@/components/ui';
import {
  TimeCapsuleComposer,
  TimeCapsuleList,
} from '@/components/features';
import { useFamilyStore } from '@/store/familyStore';
import { TimeCapsule, TimeCapsuleRevealType } from '@/types';
import { Mail, Plus, Sparkles, Lock } from 'lucide-react';

export default function CapsulesPage() {
  const {
    family,
    profiles,
    activeProfileId,
    setActiveProfile,
  } = useFamilyStore();

  // Local state for time capsules (in production, this would come from the store/server)
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [showComposer, setShowComposer] = useState(false);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const currentYear = 2026;

  // Stats for the current user
  const stats = useMemo(() => {
    const sent = capsules.filter((c) => c.authorId === activeProfileId).length;
    const waiting = capsules.filter(
      (c) => c.recipientId === activeProfileId && !c.isRevealed
    ).length;
    const revealed = capsules.filter(
      (c) => c.recipientId === activeProfileId && c.isRevealed
    ).length;

    return { sent, waiting, revealed };
  }, [capsules, activeProfileId]);

  const handleCreateCapsule = async (data: {
    recipientId: string;
    message: string;
    voiceUrl?: string;
    revealType: TimeCapsuleRevealType;
    revealDate?: string;
  }) => {
    if (!activeProfile || !family) return;

    const newCapsule: TimeCapsule = {
      id: crypto.randomUUID(),
      familyId: family.id,
      authorId: activeProfile.id,
      recipientId: data.recipientId,
      writtenYear: currentYear,
      message: data.message,
      voiceUrl: data.voiceUrl,
      revealType: data.revealType,
      revealDate: data.revealDate,
      isRevealed: false,
      createdAt: new Date().toISOString(),
    };

    setCapsules((prev) => [...prev, newCapsule]);
  };

  const handleReveal = async (capsuleId: string) => {
    setCapsules((prev) =>
      prev.map((c) =>
        c.id === capsuleId
          ? { ...c, isRevealed: true, revealedAt: new Date().toISOString() }
          : c
      )
    );
  };

  if (!family || profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center p-8">
          <Mail className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-white mb-2">كبسولات الزمن</h1>
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
        <div className="mt-6">
          <h1 className="text-2xl font-bold text-white">كبسولات الزمن</h1>
          <p className="text-slate-400 text-sm">
            اكتب آمالك وأهدافك لرمضان القادم
          </p>
        </div>

        {/* لافتة التشجيع */}
        <Card className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/30">
          <p className="text-sm text-purple-200">
            <span className="font-semibold">ماذا ستحقق هذا العام؟</span> اكتب رسالة لنفسك المستقبلية عن أهدافك وآمالك وأحلامك. ستُكشف في رمضان القادم!
          </p>
        </Card>

        {/* Stats cards */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <Card padding="sm" className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Mail className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xl font-bold text-white">{stats.sent}</p>
            <p className="text-xs text-slate-400">مُرسلة</p>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Lock className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-white">{stats.waiting}</p>
            <p className="text-xs text-slate-400">في الانتظار</p>
          </Card>
          <Card padding="sm" className="text-center">
            <div className="w-8 h-8 mx-auto mb-1 rounded-full bg-green-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xl font-bold text-white">{stats.revealed}</p>
            <p className="text-xs text-slate-400">مفتوحة</p>
          </Card>
        </div>

        {/* Create capsule button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <Button
            onClick={() => setShowComposer(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            size="lg"
            disabled={profiles.length < 2}
          >
            <Mail className="w-5 h-5 ml-2" />
            اكتب كبسولة زمن
          </Button>
          {profiles.length < 2 && (
            <p className="text-center text-xs text-slate-500 mt-2">
              أضف المزيد من أفراد العائلة لإرسال رسائل كبسولات الزمن
            </p>
          )}
        </motion.div>

        {/* Capsule list */}
        <div className="mt-6">
          <TimeCapsuleList
            capsules={capsules}
            profiles={profiles}
            currentProfileId={activeProfile.id}
            onReveal={handleReveal}
          />
        </div>

        {/* الحالة الفارغة */}
        {capsules.length === 0 && (
          <Card className="mt-6 p-8 text-center" variant="glow">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center"
            >
              <Mail className="w-10 h-10 text-amber-400" />
            </motion.div>
            <h3 className="text-lg font-semibold text-white mb-2">
              أرسل رسالة للمستقبل
            </h3>
            <p className="text-slate-400 mb-6">
              اكتب رسائل من القلب لأفراد عائلتك ستُكشف
              في رمضان القادم، أو العيد، أو في تاريخ خاص تختاره.
            </p>

            <div className="space-y-3 text-right max-w-xs mx-auto">
              <div className="flex items-center gap-3 text-sm flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span>١</span>
                </div>
                <span className="text-slate-300">اختر لمن ستكتب</span>
              </div>
              <div className="flex items-center gap-3 text-sm flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span>٢</span>
                </div>
                <span className="text-slate-300">اكتب رسالتك من القلب</span>
              </div>
              <div className="flex items-center gap-3 text-sm flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <span>٣</span>
                </div>
                <span className="text-slate-300">اختر متى تُكشف</span>
              </div>
              <div className="flex items-center gap-3 text-sm flex-row-reverse">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-slate-300">اختمها وانتظر السحر!</span>
              </div>
            </div>
          </Card>
        )}

        {/* إلهام الكتابة */}
        {capsules.length === 0 && (
          <Card className="mt-4 p-4">
            <h4 className="text-sm font-medium text-white mb-3">إلهام للكتابة</h4>
            <div className="space-y-2">
              <p className="text-sm text-slate-400 italic">
                &ldquo;ما الذي تفخر به أكثر في هذا الرمضان؟&rdquo;
              </p>
              <p className="text-sm text-slate-400 italic">
                &ldquo;ما الذي تأمل فيه لرمضان القادم؟&rdquo;
              </p>
              <p className="text-sm text-slate-400 italic">
                &ldquo;ما الذي أضحكك اليوم؟&rdquo;
              </p>
            </div>
          </Card>
        )}
      </main>

      {/* Floating action button */}
      {capsules.length > 0 && profiles.length >= 2 && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComposer(true)}
          className="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30 flex items-center justify-center z-40"
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Composer modal */}
      <TimeCapsuleComposer
        profiles={profiles}
        currentProfileId={activeProfile.id}
        currentYear={currentYear}
        onSubmit={handleCreateCapsule}
        isOpen={showComposer}
        onClose={() => setShowComposer(false)}
      />

      <BottomNav />
    </div>
  );
}
