'use client';

import { useState } from 'react';
import { Card } from '@/components/ui';
import { Copy, Check, Share2 } from 'lucide-react';

interface FamilyCodeCardProps {
  code: string;
  familyName: string;
  compact?: boolean;
}

export function FamilyCodeCard({ code, familyName, compact = false }: FamilyCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join our family on MiniRamadan!',
          text: `Connect with the ${familyName} family on MiniRamadan! Use code: ${code}`,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
        <div className="flex-1">
          <p className="text-xs text-amber-400 mb-0.5">Family Code</p>
          <p className="text-lg font-mono font-bold text-white tracking-widest">{code}</p>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    );
  }

  return (
    <Card className="text-center">
      <p className="text-sm text-slate-400 mb-2">Share your family code</p>
      <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-800/80 rounded-xl border border-slate-700 mb-3">
        <span className="text-2xl font-mono font-bold text-amber-400 tracking-[0.3em]">{code}</span>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Other families can use this code to connect with you
      </p>
      <div className="flex gap-2 justify-center">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors text-sm"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors text-sm"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </Card>
  );
}
