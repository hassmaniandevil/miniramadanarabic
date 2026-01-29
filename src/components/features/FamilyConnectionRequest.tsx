'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { FamilyConnection } from '@/types';
import { UserPlus, Check, X, Eye, EyeOff } from 'lucide-react';

interface FamilyConnectionRequestProps {
  request: FamilyConnection;
  invitingFamilyName: string;
  onRespond: (connectionId: string, accept: boolean, shareBack: boolean) => void;
}

export function FamilyConnectionRequest({
  request,
  invitingFamilyName,
  onRespond,
}: FamilyConnectionRequestProps) {
  const [shareBack, setShareBack] = useState(true);
  const [responding, setResponding] = useState(false);

  const handleRespond = async (accept: boolean) => {
    setResponding(true);
    await onRespond(request.id, accept, shareBack);
    setResponding(false);
  };

  return (
    <Card className="border-amber-500/30 bg-amber-500/5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <UserPlus className="w-5 h-5 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-white">
            {invitingFamilyName}
          </p>
          <p className="text-sm text-slate-400 mt-0.5">
            يريد التواصل مع عائلتك
          </p>

          {/* Share back toggle */}
          <button
            onClick={() => setShareBack(!shareBack)}
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-slate-800/50 text-sm transition-colors hover:bg-slate-800"
          >
            {shareBack ? (
              <>
                <Eye className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">شارك تقدمك معهم</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">لا تشارك تقدمك</span>
              </>
            )}
          </button>

          {/* Accept/Decline buttons */}
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={() => handleRespond(true)}
              disabled={responding}
              className="flex-1"
            >
              <Check className="w-4 h-4 ml-1" />
              قبول
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRespond(false)}
              disabled={responding}
              className="flex-1"
            >
              <X className="w-4 h-4 ml-1" />
              رفض
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
