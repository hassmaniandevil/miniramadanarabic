'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header, BottomNav } from '@/components/layout';
import { Card, Button, Avatar } from '@/components/ui';
import { useFamilyStore } from '@/store/familyStore';
import { getRamadanDay } from '@/lib/utils';
import { IftarMessage } from '@/types';
import { MessageCircle, Send, Heart, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function MessagesPage() {
  const {
    family,
    profiles,
    activeProfileId,
    todaysMessages,
    addMessage,
  } = useFamilyStore();

  const [showComposer, setShowComposer] = useState(false);
  const [message, setMessage] = useState('');
  const [recipientId, setRecipientId] = useState<string | null>(null);

  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const otherProfiles = profiles.filter((p) => p.id !== activeProfileId);


  const handleSendMessage = () => {
    if (!message.trim() || !activeProfile || !family) return;

    const ramadanDay = family.ramadanStartDate ? getRamadanDay(family.ramadanStartDate) : 1;

    const newMessage: IftarMessage = {
      id: `msg-${Date.now()}`,
      familyId: family.id,
      senderId: activeProfile.id,
      recipientId,
      message: message.trim(),
      messageType: 'text',
      date: new Date().toISOString().split('T')[0],
      ramadanDay,
      isDelivered: false,
      createdAt: new Date().toISOString(),
    };

    addMessage(newMessage);
    setMessage('');
    setRecipientId(null);
    setShowComposer(false);
  };

  // Get messages for me
  const messagesForMe = todaysMessages.filter(
    (m) => m.recipientId === activeProfileId || m.recipientId === null
  );

  // Get messages I've sent
  const myMessages = todaysMessages.filter((m) => m.senderId === activeProfileId);

  if (!family || !activeProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">جارِ التحميل...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">رسائل العائلة</h1>
          <p className="text-slate-400">أرسل كلمات طيبة لعائلتك</p>
        </div>

        {/* Message composer */}
        <Card className="mb-6">
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
                  className="w-full"
                >
                  <Send className="w-4 h-4 ml-2" />
                  اكتب رسالة
                </Button>

                {myMessages.length > 0 && (
                  <p className="text-center text-sm text-emerald-400 mt-3">
                    أرسلتَ {myMessages.length} رسالة اليوم
                  </p>
                )}
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
                      className={`px-3 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                        recipientId === null
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span className="text-sm">الجميع</span>
                    </button>
                    {otherProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => setRecipientId(profile.id)}
                        className={`px-3 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                          recipientId === profile.id
                            ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                        }`}
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
                    autoFocus
                  />
                  <p className="text-xs text-slate-500 mt-1 text-right">
                    {message.length}/150
                  </p>
                </div>

                {/* الأزرار */}
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowComposer(false);
                      setMessage('');
                      setRecipientId(null);
                    }}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
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

        {/* الرسائل لك */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-semibold text-white">رسائل لك</h3>
          </div>

          {messagesForMe.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400">لا توجد رسائل بعد</p>
              <p className="text-sm text-slate-500">
                ستظهر رسائل عائلتك هنا
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
                    <p className="text-xs text-slate-500 mt-2">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Card>

        {/* الرسائل المرسلة */}
        {myMessages.length > 0 && (
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">رسائل أرسلتها</h3>
            </div>

            <div className="space-y-3">
              {myMessages.map((msg) => {
                const recipient = msg.recipientId
                  ? profiles.find((p) => p.id === msg.recipientId)
                  : null;
                return (
                  <div
                    key={msg.id}
                    className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20"
                  >
                    <div className="flex items-center gap-2 mb-2 text-sm text-emerald-400">
                      {recipient ? (
                        <>
                          <span>إلى:</span>
                          <Avatar avatarId={recipient.avatar} size="sm" />
                          <span>{recipient.nickname}</span>
                        </>
                      ) : (
                        <>
                          <Users className="w-4 h-4" />
                          <span>للجميع</span>
                        </>
                      )}
                    </div>
                    <p className="text-slate-300">{msg.message}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {format(new Date(msg.createdAt), 'h:mm a')}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* اقتراحات الرسائل */}
        <Card className="mt-6">
          <h3 className="text-sm font-medium text-slate-400 mb-3">تحتاج إلهاماً؟</h3>
          <div className="space-y-2">
            {[
              "أنا فخور بك لمحاولتك اليوم",
              "شكراً لصبرك الجميل",
              "أنت تجعل عائلتنا مميزة",
              "كنتُ أفكر فيك",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setMessage(prompt);
                  setShowComposer(true);
                }}
                className="w-full p-3 text-left text-sm text-slate-300 bg-slate-800/50 rounded-xl hover:bg-slate-800 transition-colors"
              >
                &ldquo;{prompt}&rdquo;
              </button>
            ))}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  );
}
