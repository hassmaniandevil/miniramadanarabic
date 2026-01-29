'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, Button, Avatar } from '@/components/ui';
import { Profile, IftarMessage } from '@/types';
import { MessageCircle, Send, Heart, Users, Clock } from 'lucide-react';

interface IftarMessagesProps {
  profiles: Profile[];
  currentProfileId: string;
  messages: IftarMessage[];
  onSendMessage: (recipientId: string | null, message: string) => void;
  isIftarTime: boolean;
}

export function IftarMessages({
  profiles,
  currentProfileId,
  messages,
  onSendMessage,
  isIftarTime,
}: IftarMessagesProps) {
  const [showComposer, setShowComposer] = useState(false);
  const [message, setMessage] = useState('');
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const otherProfiles = profiles.filter((p) => p.id !== currentProfileId);

  const myMessages = messages.filter((m) => m.senderId === currentProfileId);
  const messagesForMe = messages.filter(
    (m) => m.recipientId === currentProfileId || m.recipientId === null
  );

  const handleSend = () => {
    if (!message.trim()) return;
    setIsSending(true);
    onSendMessage(recipientId, message);
    setMessage('');
    setRecipientId(null);
    setShowComposer(false);
    setIsSending(false);
  };

  // Before iftar - show composer
  if (!isIftarTime) {
    return (
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">رسائل الإفطار</h3>
            <p className="text-xs text-slate-400">اترك رسالة لوقت الإفطار</p>
          </div>
        </div>

        {myMessages.length > 0 && (
          <div className="mb-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <Heart className="w-4 h-4" />
              <span>كتبتَ {myMessages.length} رسالة للإفطار!</span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!showComposer ? (
            <motion.div
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                onClick={() => setShowComposer(true)}
                variant="secondary"
                className="w-full"
              >
                <Send className="w-4 h-4 ml-2" />
                اكتب رسالة
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="composer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* اختيار المستلم */}
              <div>
                <p className="text-sm text-slate-400 mb-2">أرسل إلى:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRecipientId(null)}
                    className={cn(
                      'px-3 py-2 rounded-xl border flex items-center gap-2 transition-all',
                      recipientId === null
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <Users className="w-4 h-4" />
                    <span className="text-sm">الجميع</span>
                  </button>
                  {otherProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => setRecipientId(profile.id)}
                      className={cn(
                        'px-3 py-2 rounded-xl border flex items-center gap-2 transition-all',
                        recipientId === profile.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      )}
                    >
                      <Avatar avatarId={profile.avatar} size="sm" />
                      <span className="text-sm">{profile.nickname}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* حقل الرسالة */}
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 150))}
                  placeholder="اكتب شيئاً لطيفاً..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <p className="text-xs text-slate-500 mt-1 text-right">
                  {message.length}/150
                </p>
              </div>

              {/* الأزرار */}
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setShowComposer(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={!message.trim()}
                  isLoading={isSending}
                  className="flex-1"
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    );
  }

  // At iftar time - show received messages
  return (
    <Card variant="glow" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-pink-500/10" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">رسائل العائلة</h3>
            <p className="text-xs text-slate-400">رسائل من عائلتك</p>
          </div>
        </div>

        {messagesForMe.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">لا توجد رسائل اليوم بعد</p>
            <p className="text-sm text-slate-500">
              ستظهر الرسائل هنا وقت الإفطار
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messagesForMe.map((msg) => {
              const sender = profiles.find((p) => p.id === msg.senderId);
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar avatarId={sender?.avatar || 'star'} size="sm" />
                    <span className="text-sm font-medium text-white">
                      {sender?.nickname || 'أحدهم'}
                    </span>
                    {msg.recipientId === null && (
                      <span className="text-xs text-slate-500">للجميع</span>
                    )}
                  </div>
                  <p className="text-slate-300">{msg.message}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}
