'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { Copy, Check, QrCode, Send, ChevronRight } from 'lucide-react';

interface ConnectionActionsProps {
  familyCode: string;
  familyName: string;
  onEnterCode: () => void;
}

export function ConnectionActions({ familyCode, familyName, onEnterCode }: ConnectionActionsProps) {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(familyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = familyCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInvite = async () => {
    const inviteUrl = `https://miniramadan.vercel.app/join?code=${familyCode}`;
    const inviteText = `انضم إلينا في ميني رمضان! 🌙\n\nتواصل مع عائلة ${familyName} وشارك رحلة رمضان معاً.\n\nاستخدم رمز عائلتنا: ${familyCode}\n\nأو اضغط على الرابط: ${inviteUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `انضم لعائلة ${familyName} في ميني رمضان!`,
          text: inviteText,
          url: inviteUrl,
        });
      } catch {
        // User cancelled or share failed - fall back to copy
        await navigator.clipboard.writeText(inviteText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      // No Web Share API - copy invite text
      await navigator.clipboard.writeText(inviteText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Share Your Code */}
      <Card
        padding="sm"
        className="cursor-pointer hover:border-amber-500/50 transition-colors"
        onClick={() => setShowCode(!showCode)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <QrCode className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">شارك رمزك</p>
            <p className="text-xs text-slate-400">دع الآخرين يجدونك ويتصلون بك</p>
          </div>
          <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform ${showCode ? 'rotate-90' : ''}`} />
        </div>

        {/* Expandable code section */}
        {showCode && (
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="text-2xl font-mono font-bold text-amber-400 tracking-[0.3em]">
                {familyCode}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy();
                }}
                className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center">
              شارك هذا الرمز مع الأصدقاء والعائلة
            </p>
          </div>
        )}
      </Card>

      {/* Enter a Code */}
      <Card
        padding="sm"
        className="cursor-pointer hover:border-purple-500/50 transition-colors"
        onClick={onEnterCode}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-mono font-bold text-purple-400">#</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">أدخل رمزاً</p>
            <p className="text-xs text-slate-400">تواصل باستخدام رمز عائلة أخرى</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>
      </Card>

      {/* Invite a Family */}
      <Card
        padding="sm"
        className="cursor-pointer hover:border-pink-500/50 transition-colors"
        onClick={handleInvite}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5 text-pink-400" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-white">ادعُ عائلة</p>
            <p className="text-xs text-slate-400">أرسل دعوة عبر رسالة أو بريد إلكتروني</p>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500" />
        </div>
      </Card>
    </div>
  );
}
