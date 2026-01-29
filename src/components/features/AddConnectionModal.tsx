'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { syncService } from '@/lib/supabase/sync';
import { UserPlus, Search, Check, AlertCircle } from 'lucide-react';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFamilyId: string;
  onSendRequest: (invitedFamilyId: string) => Promise<unknown>;
}

export function AddConnectionModal({
  isOpen,
  onClose,
  currentFamilyId,
  onSendRequest,
}: AddConnectionModalProps) {
  const [code, setCode] = useState('');
  const [lookupResult, setLookupResult] = useState<{ id: string; familyName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLooking, setIsLooking] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

  const handleCodeChange = (value: string) => {
    // Filter to valid chars and uppercase
    const filtered = value
      .toUpperCase()
      .split('')
      .filter(c => CHARSET.includes(c))
      .join('')
      .slice(0, 6);
    setCode(filtered);
    setLookupResult(null);
    setError(null);
    setSent(false);
  };

  const handleLookup = async () => {
    if (code.length !== 6) {
      setError('الرمز يجب أن يكون 6 أحرف');
      return;
    }

    setIsLooking(true);
    setError(null);
    setLookupResult(null);

    try {
      const result = await syncService.lookupFamilyByCode(code);
      if (!result) {
        setError('لم نجد عائلة بهذا الرمز');
      } else if (result.id === currentFamilyId) {
        setError('هذا رمز عائلتك أنت!');
      } else {
        setLookupResult(result);
      }
    } catch {
      setError('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLooking(false);
    }
  };

  const handleSend = async () => {
    if (!lookupResult) return;

    setIsSending(true);
    setError(null);

    try {
      const connection = await onSendRequest(lookupResult.id);
      if (connection) {
        setSent(true);
      } else {
        setError('لم نتمكن من إرسال الطلب. قد تكونون متصلين بالفعل.');
      }
    } catch {
      setError('حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setLookupResult(null);
    setError(null);
    setSent(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="إضافة عائلة">
      <div className="space-y-4">
        <p className="text-sm text-slate-400">
          أدخل رمز العائلة المكون من 6 أحرف لإرسال طلب اتصال.
        </p>

        {/* حقل الرمز */}
        <div>
          <label className="block text-sm text-slate-300 mb-2">رمز العائلة</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white text-center text-xl font-mono tracking-[0.3em] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
            />
            <Button
              onClick={handleLookup}
              disabled={code.length !== 6 || isLooking}
              className="px-4"
            >
              {isLooking ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {code.length}/٦ أحرف
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* نتيجة البحث */}
        {lookupResult && !sent && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="font-medium text-white">{lookupResult.familyName}</p>
                <p className="text-xs text-slate-400">تم العثور على العائلة!</p>
              </div>
            </div>
            <Button
              onClick={handleSend}
              disabled={isSending}
              className="w-full"
            >
              {isSending ? 'جارِ الإرسال...' : 'إرسال طلب الاتصال'}
            </Button>
          </div>
        )}

        {/* تأكيد الإرسال */}
        {sent && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
            <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-medium text-emerald-300">تم إرسال الطلب!</p>
            <p className="text-sm text-slate-400 mt-1">
              ستشاهد {lookupResult?.familyName} طلبك
            </p>
          </div>
        )}

        {/* زر الإغلاق */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={handleClose} className="flex-1">
            {sent ? 'تم' : 'إلغاء'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
