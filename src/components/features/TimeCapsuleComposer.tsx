'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { Profile, TimeCapsuleRevealType, TIME_CAPSULE_PROMPTS } from '@/types';
import {
  Mail,
  Calendar,
  Mic,
  MicOff,
  Sparkles,
  Lock,
  Send,
  ChevronRight,
  RefreshCw,
  Play,
  Trash2,
} from 'lucide-react';

interface TimeCapsuleComposerProps {
  profiles: Profile[];
  currentProfileId: string;
  currentYear: number;
  onSubmit: (data: {
    recipientId: string;
    message: string;
    voiceUrl?: string;
    revealType: TimeCapsuleRevealType;
    revealDate?: string;
  }) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function TimeCapsuleComposer({
  profiles,
  currentProfileId,
  currentYear,
  onSubmit,
  isOpen,
  onClose,
}: TimeCapsuleComposerProps) {
  const [step, setStep] = useState<'recipient' | 'write' | 'reveal' | 'seal'>('recipient');
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [revealType, setRevealType] = useState<TimeCapsuleRevealType>('next_ramadan');
  const [revealDate, setRevealDate] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceUrl, setVoiceUrl] = useState<string | undefined>();
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (voiceUrl) {
        URL.revokeObjectURL(voiceUrl);
      }
    };
  }, [voiceUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setVoiceBlob(audioBlob);
        setVoiceUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Timer for recording duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('تعذر الوصول إلى الميكروفون. يرجى السماح بالوصول لتسجيل رسالة صوتية.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    if (voiceUrl) {
      URL.revokeObjectURL(voiceUrl);
    }
    setVoiceUrl(undefined);
    setVoiceBlob(null);
    setRecordingDuration(0);
    setIsPlaying(false);
  };

  const playRecording = () => {
    if (voiceUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const otherProfiles = profiles.filter((p) => p.id !== currentProfileId);
  const selectedRecipient = profiles.find((p) => p.id === recipientId);
  const currentProfile = profiles.find((p) => p.id === currentProfileId);

  const revealOptions: {
    type: TimeCapsuleRevealType;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      type: 'next_ramadan',
      label: 'رمضان القادم',
      description: `تُفتح عند بداية رمضان ${currentYear + 1}`,
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      type: 'next_eid',
      label: 'العيد القادم',
      description: 'تُفتح في عيد الفطر',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      type: 'specific_date',
      label: 'اختر تاريخاً',
      description: 'حدد متى تُكشف بالضبط',
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  const handleNextPrompt = () => {
    setPromptIndex((prev) => (prev + 1) % TIME_CAPSULE_PROMPTS.length);
  };

  const handleUsePrompt = () => {
    setMessage(TIME_CAPSULE_PROMPTS[promptIndex] + '\n\n');
  };

  const handleSubmit = async () => {
    if (!recipientId || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        recipientId,
        message: message.trim(),
        voiceUrl,
        revealType,
        revealDate: revealType === 'specific_date' ? revealDate : undefined,
      });
      handleClose();
    } catch (error) {
      console.error('Failed to create time capsule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Stop any ongoing recording
    if (isRecording) {
      stopRecording();
    }
    // Clean up voice URL
    if (voiceUrl) {
      URL.revokeObjectURL(voiceUrl);
    }
    // Reset state
    setStep('recipient');
    setRecipientId(null);
    setMessage('');
    setRevealType('next_ramadan');
    setRevealDate('');
    setVoiceUrl(undefined);
    setVoiceBlob(null);
    setRecordingDuration(0);
    setIsPlaying(false);
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
        {/* Header with progress */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-400" />
              كبسولة الزمن
            </h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              &times;
            </button>
          </div>

          {/* Progress steps */}
          <div className="flex gap-2">
            {['recipient', 'write', 'reveal', 'seal'].map((s, i) => (
              <div
                key={s}
                className={cn(
                  'flex-1 h-1 rounded-full transition-colors',
                  ['recipient', 'write', 'reveal', 'seal'].indexOf(step) >= i
                    ? 'bg-amber-500'
                    : 'bg-slate-700'
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Choose Recipient */}
            {step === 'recipient' && (
              <motion.div
                key="recipient"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <p className="text-slate-300">لمن هذه الرسالة؟</p>

                <div className="space-y-2">
                  {otherProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => {
                        setRecipientId(profile.id);
                        setStep('write');
                      }}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                        recipientId === profile.id
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl">
                        {profile.avatar || profile.nickname[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{profile.nickname}</p>
                        <p className="text-sm text-slate-400">
                          {profile.profileType === 'little_star'
                            ? 'نجمة صغيرة'
                            : profile.profileType === 'child'
                            ? 'طفل'
                            : 'بالغ'}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                  ))}
                </div>

                {otherProfiles.length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-slate-400">
                      أضف المزيد من أفراد العائلة لإرسال رسائل كبسولات الزمن
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Write Message */}
            {step === 'write' && selectedRecipient && (
              <motion.div
                key="write"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xl">
                    {selectedRecipient.avatar || selectedRecipient.nickname[0]}
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">تكتب إلى</p>
                    <p className="font-medium text-white">{selectedRecipient.nickname}</p>
                  </div>
                </div>

                {/* Writing prompt */}
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-amber-200 text-sm italic">
                      &ldquo;{TIME_CAPSULE_PROMPTS[promptIndex]}&rdquo;
                    </p>
                    <div className="flex gap-1">
                      <button
                        onClick={handleNextPrompt}
                        className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/20 transition-colors"
                        title="احصل على فكرة أخرى"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleUsePrompt}
                        className="px-2 py-1 rounded-lg text-xs text-amber-400 hover:bg-amber-500/20 transition-colors"
                      >
                        استخدم
                      </button>
                    </div>
                  </div>
                </div>

                {/* Message textarea */}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك من القلب..."
                  rows={6}
                  className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  maxLength={1000}
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{message.length}/1000 حرف</span>
                </div>

                {/* Voice recording */}
                <div className="p-3 bg-slate-700/50 rounded-xl">
                  {/* Hidden audio element for playback */}
                  {voiceUrl && (
                    <audio
                      ref={audioRef}
                      src={voiceUrl}
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                  )}

                  {!voiceUrl ? (
                    // Recording controls
                    <div className="flex items-center gap-3">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={cn(
                          'p-3 rounded-full transition-colors',
                          isRecording
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        )}
                      >
                        {isRecording ? (
                          <MicOff className="w-5 h-5" />
                        ) : (
                          <Mic className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <span className="text-sm text-slate-400">
                          {isRecording ? (
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              جاري التسجيل {formatDuration(recordingDuration)}
                            </span>
                          ) : (
                            'أضف رسالة صوتية (اختياري)'
                          )}
                        </span>
                      </div>
                      {isRecording && (
                        <button
                          onClick={stopRecording}
                          className="px-3 py-1.5 rounded-lg bg-slate-600 text-white text-sm hover:bg-slate-500 transition-colors"
                        >
                          إيقاف
                        </button>
                      )}
                    </div>
                  ) : (
                    // Playback controls
                    <div className="flex items-center gap-3">
                      <button
                        onClick={playRecording}
                        className={cn(
                          'p-3 rounded-full transition-colors',
                          isPlaying
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        )}
                      >
                        <Play className="w-5 h-5" />
                      </button>
                      <div className="flex-1">
                        <span className="text-sm text-white">
                          تم تسجيل الرسالة الصوتية
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          {formatDuration(recordingDuration)}
                        </span>
                      </div>
                      <button
                        onClick={deleteRecording}
                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors"
                        title="حذف التسجيل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep('recipient')} className="flex-1">
                    رجوع
                  </Button>
                  <Button
                    onClick={() => setStep('reveal')}
                    disabled={!message.trim()}
                    className="flex-1"
                  >
                    متابعة
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Choose Reveal Time */}
            {step === 'reveal' && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <p className="text-slate-300">متى يجب كشف هذه الرسالة؟</p>

                <div className="space-y-2">
                  {revealOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setRevealType(option.type)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                        revealType === option.type
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                      )}
                    >
                      <div
                        className={cn(
                          'p-2.5 rounded-xl',
                          revealType === option.type
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-700 text-slate-400'
                        )}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white">{option.label}</p>
                        <p className="text-sm text-slate-400">{option.description}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Date picker for specific date */}
                {revealType === 'specific_date' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 bg-slate-700/50 rounded-xl"
                  >
                    <label className="block text-sm text-slate-300 mb-2">
                      اختر تاريخ الكشف
                    </label>
                    <input
                      type="date"
                      value={revealDate}
                      onChange={(e) => setRevealDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 rounded-lg bg-slate-800 border border-slate-600 text-white focus:outline-none focus:border-amber-500"
                    />
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep('write')} className="flex-1">
                    رجوع
                  </Button>
                  <Button
                    onClick={() => setStep('seal')}
                    disabled={revealType === 'specific_date' && !revealDate}
                    className="flex-1"
                  >
                    متابعة
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Seal */}
            {step === 'seal' && selectedRecipient && (
              <motion.div
                key="seal"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6 text-center"
              >
                <div className="relative inline-block">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-24 h-24 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center"
                  >
                    <Lock className="w-10 h-10 text-white" />
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center"
                  >
                    <Sparkles className="w-4 h-4 text-slate-900" />
                  </motion.div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    هل أنت مستعد لختم رسالتك؟
                  </h3>
                  <p className="text-slate-400">
                    ستُقفل هذه الرسالة حتى{' '}
                    {revealType === 'next_ramadan' && `رمضان ${currentYear + 1}`}
                    {revealType === 'next_eid' && 'عيد الفطر'}
                    {revealType === 'specific_date' && revealDate}
                  </p>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-xl text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="w-5 h-5 text-amber-400" />
                    <span className="text-white font-medium">معاينة الرسالة</span>
                  </div>
                  <p className="text-slate-300 text-sm line-clamp-3">{message}</p>
                  {voiceUrl && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-amber-400">
                      <Mic className="w-4 h-4" />
                      <span>تم تضمين رسالة صوتية ({formatDuration(recordingDuration)})</span>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-slate-600 flex items-center justify-between text-sm">
                    <span className="text-slate-400">من: {currentProfile?.nickname}</span>
                    <span className="text-slate-400">إلى: {selectedRecipient.nickname}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep('reveal')} className="flex-1">
                    رجوع
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        />
                        جاري الختم...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        اختم وأرسل
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
