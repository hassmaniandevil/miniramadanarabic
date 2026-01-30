'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFamilyStore } from '@/store/familyStore';
import { captureElement, shareOrDownload, generateFilename, copyImageToClipboard } from '@/lib/cardGenerator';
import { Share2, Download, Copy, Check, X, Flame, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

interface ShareableRamadanCardProps {
  isOpen: boolean;
  onClose: () => void;
  ramadanDay?: number;
}

export function ShareableRamadanCard({ isOpen, onClose, ramadanDay = 1 }: ShareableRamadanCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareResult, setShareResult] = useState<string | null>(null);

  const {
    family,
    profiles,
    getTotalFamilyStars,
    getScaledConstellationThresholds,
    familyStreak,
  } = useFamilyStore();

  const totalStars = getTotalFamilyStars();
  const thresholds = getScaledConstellationThresholds();
  const constellationsUnlocked = thresholds.filter((t) => totalStars >= t).length;
  const streakDays = familyStreak?.currentStreak || 0;

  const handleShare = async () => {
    if (!cardRef.current || !family) return;

    setIsGenerating(true);
    setShareResult(null);

    try {
      const blob = await captureElement(cardRef.current);
      if (!blob) {
        setShareResult('فشل في إنشاء الصورة');
        setIsGenerating(false);
        return;
      }

      const filename = generateFilename(family.familyName, ramadanDay);
      const result = await shareOrDownload(
        blob,
        `تقدم عائلة ${family.familyName} في رمضان`,
        `حصلنا على ${totalStars} نجمة وفتحنا ${constellationsUnlocked} كوكبة!`,
        filename
      );

      if (result.success) {
        setShareResult(result.method === 'share' ? 'تمت المشاركة بنجاح!' : 'تم التحميل!');
      } else {
        setShareResult(result.method === 'share' ? 'تم إلغاء المشاركة' : 'فشل التحميل');
      }
    } catch (error) {
      console.error('Share error:', error);
      setShareResult('حدث خطأ ما');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);

    try {
      const blob = await captureElement(cardRef.current);
      if (!blob) {
        setShareResult('فشل في إنشاء الصورة');
        setIsGenerating(false);
        return;
      }

      const success = await copyImageToClipboard(blob);
      setCopied(success);
      setShareResult(success ? 'تم النسخ إلى الحافظة!' : 'النسخ غير مدعوم');

      if (success) {
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error('Copy error:', error);
      setShareResult('فشل النسخ');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current || !family) return;

    setIsGenerating(true);
    setShareResult(null);

    try {
      const blob = await captureElement(cardRef.current);
      if (!blob) {
        setShareResult('فشل في إنشاء الصورة');
        setIsGenerating(false);
        return;
      }

      const filename = generateFilename(family.familyName, ramadanDay);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShareResult('تم التحميل!');
    } catch (error) {
      console.error('Download error:', error);
      setShareResult('فشل التحميل');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-3xl w-full max-w-md p-6 my-4"
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">شارك تقدمك</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Preview Card */}
          <div className="mb-6 overflow-hidden rounded-2xl shadow-lg">
            <div
              ref={cardRef}
              className="bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 p-6 relative overflow-hidden"
              dir="rtl"
            >
              {/* Background stars */}
              <div className="absolute inset-0 opacity-30">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.8 + 0.2,
                    }}
                  />
                ))}
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <p className="text-amber-400 text-sm font-medium mb-1">اليوم {ramadanDay} من رمضان</p>
                  <h4 className="text-2xl font-bold text-white">{family?.familyName}</h4>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {/* Stars */}
                  <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{totalStars}</p>
                    <p className="text-xs text-white/70">نجوم</p>
                  </div>

                  {/* Streak */}
                  <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{streakDays}</p>
                    <p className="text-xs text-white/70">يوم سلسلة</p>
                  </div>

                  {/* Constellations */}
                  <div className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <p className="text-2xl font-bold text-white">{constellationsUnlocked}/9</p>
                    <p className="text-xs text-white/70">مفتوحة</p>
                  </div>
                </div>

                {/* Profile Avatars */}
                <div className="flex justify-center mb-4">
                  <div className="flex -space-x-2 space-x-reverse">
                    {profiles.slice(0, 5).map((profile, i) => (
                      <div
                        key={profile.id}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg border-2 border-indigo-900"
                        style={{ zIndex: profiles.length - i }}
                      >
                        {profile.avatar || profile.nickname[0]}
                      </div>
                    ))}
                    {profiles.length > 5 && (
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-sm text-white border-2 border-indigo-900">
                        +{profiles.length - 5}
                      </div>
                    )}
                  </div>
                </div>

                {/* Branding */}
                <div className="text-center">
                  <p className="text-white/50 text-xs">
                    صُنع بـ ميني رمضان
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Result message */}
          {shareResult && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-sm text-slate-600 mb-4"
            >
              {shareResult}
            </motion.p>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleShare}
              disabled={isGenerating}
              className="bg-gradient-to-r from-purple-500 to-pink-500 flex-col h-auto py-3"
            >
              <Share2 className="w-5 h-5 mb-1" />
              <span className="text-xs">مشاركة</span>
            </Button>

            <Button
              onClick={handleCopy}
              disabled={isGenerating}
              variant="secondary"
              className="flex-col h-auto py-3"
            >
              {copied ? (
                <Check className="w-5 h-5 mb-1 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 mb-1" />
              )}
              <span className="text-xs">{copied ? 'تم!' : 'نسخ'}</span>
            </Button>

            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              variant="secondary"
              className="flex-col h-auto py-3"
            >
              <Download className="w-5 h-5 mb-1" />
              <span className="text-xs">تحميل</span>
            </Button>
          </div>

          {isGenerating && (
            <p className="text-center text-sm text-slate-500 mt-4">
              جاري إنشاء الصورة...
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook to easily use the share card
export function useShareCard() {
  const [isOpen, setIsOpen] = useState(false);

  const openShareCard = () => setIsOpen(true);
  const closeShareCard = () => setIsOpen(false);

  return {
    isOpen,
    openShareCard,
    closeShareCard,
  };
}
