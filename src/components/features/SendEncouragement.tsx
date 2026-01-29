'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { ENCOURAGEMENT_MESSAGES } from '@/types';
import { Heart, Send } from 'lucide-react';

interface SendEncouragementProps {
  isOpen: boolean;
  onClose: () => void;
  familyName: string;
  onSend: (message: string, emoji?: string) => void;
}

export function SendEncouragement({
  isOpen,
  onClose,
  familyName,
  onSend,
}: SendEncouragementProps) {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const message = selectedMessage !== null
      ? ENCOURAGEMENT_MESSAGES[selectedMessage].message
      : customMessage.trim();

    if (!message) return;

    setSending(true);
    const emoji = selectedMessage !== null
      ? ENCOURAGEMENT_MESSAGES[selectedMessage].emoji
      : undefined;

    await onSend(message, emoji);
    setSending(false);
    setSelectedMessage(null);
    setCustomMessage('');
    onClose();
  };

  const handleClose = () => {
    setSelectedMessage(null);
    setCustomMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`شجّع ${familyName}`}>
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          أرسل رسالة تشجيع إلى {familyName}.
        </p>

        {/* رسائل جاهزة */}
        <div className="space-y-2">
          <p className="text-sm text-slate-300 font-medium">رسائل سريعة</p>
          <div className="flex flex-wrap gap-2">
            {ENCOURAGEMENT_MESSAGES.map((msg, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelectedMessage(selectedMessage === index ? null : index);
                  setCustomMessage('');
                }}
                className={`px-3 py-2 rounded-xl text-sm transition-all ${
                  selectedMessage === index
                    ? 'bg-pink-500/20 border border-pink-500/50 text-pink-300'
                    : 'bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <span className="mr-1.5">{msg.emoji}</span>
                {msg.message}
              </button>
            ))}
          </div>
        </div>

        {/* حقل الرسالة المخصصة */}
        <div className="space-y-2">
          <p className="text-sm text-slate-300 font-medium">أو اكتب رسالتك</p>
          <textarea
            value={customMessage}
            onChange={(e) => {
              setCustomMessage(e.target.value);
              if (e.target.value) setSelectedMessage(null);
            }}
            placeholder="اكتب رسالتك..."
            maxLength={200}
            rows={3}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none text-sm"
          />
          <p className="text-xs text-slate-500 text-right">
            {customMessage.length}/200
          </p>
        </div>

        {/* زر الإرسال */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">
            إلغاء
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || (selectedMessage === null && !customMessage.trim())}
            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
          >
            {sending ? (
              'جارِ الإرسال...'
            ) : (
              <>
                <Heart className="w-4 h-4 ml-2" />
                إرسال
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
