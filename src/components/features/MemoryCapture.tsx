'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, Button } from '@/components/ui';
import { MemoryCategory, MEMORY_CATEGORIES } from '@/types';
import { Camera, Upload, X, Image as ImageIcon, Check } from 'lucide-react';

interface MemoryCaptureProps {
  onCapture: (photo: File, category: MemoryCategory, caption?: string) => Promise<void>;
  ramadanDay?: number;
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryCapture({ onCapture, ramadanDay, isOpen, onClose }: MemoryCaptureProps) {
  const [step, setStep] = useState<'capture' | 'category' | 'caption'>('capture');
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MemoryCategory | null>(null);
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = Object.entries(MEMORY_CATEGORIES) as [MemoryCategory, typeof MEMORY_CATEGORIES[MemoryCategory]][];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setStep('category');
    }
  };

  const handleCameraCapture = () => {
    // On mobile, input with capture attribute opens camera
    fileInputRef.current?.click();
  };

  const handleCategorySelect = (category: MemoryCategory) => {
    setSelectedCategory(category);
    setStep('caption');
  };

  const handleSubmit = async () => {
    if (!selectedPhoto || !selectedCategory) return;

    setIsSubmitting(true);
    try {
      await onCapture(selectedPhoto, selectedCategory, caption || undefined);
      handleClose();
    } catch (error) {
      console.error('Failed to save memory:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('capture');
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setSelectedCategory(null);
    setCaption('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* العنوان */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-semibold text-white">
            {step === 'capture' && 'التقط ذكرى'}
            {step === 'category' && 'ما نوع هذه الذكرى؟'}
            {step === 'caption' && 'أضف وصفاً'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            {step === 'capture' && (
              <motion.div
                key="capture"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleCameraCapture}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-600 hover:border-amber-500 hover:bg-amber-500/10 transition-all"
                  >
                    <div className="p-4 rounded-full bg-amber-500/20">
                      <Camera className="w-8 h-8 text-amber-400" />
                    </div>
                    <span className="text-sm text-slate-300">التقط صورة</span>
                  </button>

                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => handleFileSelect(e as unknown as React.ChangeEvent<HTMLInputElement>);
                      input.click();
                    }}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-600 hover:border-amber-500 hover:bg-amber-500/10 transition-all"
                  >
                    <div className="p-4 rounded-full bg-blue-500/20">
                      <Upload className="w-8 h-8 text-blue-400" />
                    </div>
                    <span className="text-sm text-slate-300">ارفع صورة</span>
                  </button>
                </div>

                {ramadanDay && (
                  <p className="text-center text-slate-400 text-sm">
                    اليوم {ramadanDay} من رمضان
                  </p>
                )}
              </motion.div>
            )}

            {step === 'category' && photoPreview && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Photo preview */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 gap-2">
                  {categories.map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => handleCategorySelect(key)}
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl border transition-all text-left',
                        selectedCategory === key
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      )}
                    >
                      <span className="text-xl">{category.icon}</span>
                      <span className="text-sm text-white">{category.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'caption' && photoPreview && selectedCategory && (
              <motion.div
                key="caption"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Photo preview with category badge */}
                <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-900">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white bg-gradient-to-r',
                      MEMORY_CATEGORIES[selectedCategory].color
                    )}>
                      <span>{MEMORY_CATEGORIES[selectedCategory].icon}</span>
                      {MEMORY_CATEGORIES[selectedCategory].label}
                    </span>
                  </div>
                </div>

                {/* حقل الوصف */}
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    أضف وصفاً (اختياري)
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="ما الذي يجعل هذه اللحظة مميزة؟"
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                    maxLength={200}
                  />
                  <p className="text-right text-xs text-slate-500 mt-1">
                    {caption.length}/200
                  </p>
                </div>

                {/* زر الحفظ */}
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => setStep('category')}
                    className="flex-1"
                  >
                    رجوع
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        جارِ الحفظ...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        حفظ الذكرى
                      </span>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
