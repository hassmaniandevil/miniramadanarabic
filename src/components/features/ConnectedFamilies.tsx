'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { ConnectedFamilyInfo } from '@/types';
import { Users, Star, Heart, Eye, EyeOff, Trash2 } from 'lucide-react';

// Mini constellation visual - shows 9 dots for the 9 constellations
function MiniConstellations({ unlocked }: { unlocked: number }) {
  const total = 9;
  const colors = [
    '#60A5FA', // patience - blue
    '#F59E0B', // generosity - amber
    '#EF4444', // courage - red
    '#A78BFA', // forgiveness - violet
    '#10B981', // gratitude - emerald
    '#EC4899', // mercy - pink
    '#14B8A6', // kindness - teal
    '#FBBF24', // hope - yellow
    '#F472B6', // unity - rose
  ];

  return (
    <div className="flex items-center gap-0.5" title={`${unlocked} of ${total} constellations`}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            i < unlocked
              ? 'scale-100'
              : 'scale-75 opacity-30'
          }`}
          style={{
            backgroundColor: i < unlocked ? colors[i] : '#475569'
          }}
        />
      ))}
    </div>
  );
}

interface ConnectedFamiliesProps {
  connectedFamilies: ConnectedFamilyInfo[];
  currentFamilyId: string;
  onToggleShare: (connectionId: string, shares: boolean, side: 'inviting' | 'invited') => void;
  onRemove: (connectionId: string) => void;
  onEncourage: (connectionId: string, familyId: string, familyName: string) => void;
  compact?: boolean;
}

export function ConnectedFamilies({
  connectedFamilies,
  currentFamilyId,
  onToggleShare,
  onRemove,
  onEncourage,
  compact = false,
}: ConnectedFamiliesProps) {
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  if (connectedFamilies.length === 0) {
    return (
      <Card className="text-center py-8">
        <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-slate-400">لا توجد عائلات متصلة بعد</p>
        <p className="text-sm text-slate-500 mt-1">شارك رمز عائلتك للتواصل</p>
      </Card>
    );
  }

  if (compact) {
    const display = connectedFamilies.slice(0, 3);
    return (
      <div className="space-y-2">
        {display.map((family) => (
          <div
            key={family.connectionId}
            className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl"
          >
            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{family.familyName}</p>
              {family.sharesWithYou && (
                <p className="text-xs text-amber-400">{family.totalStars} نجمة</p>
              )}
            </div>
            {family.sharesWithYou && (
              <MiniConstellations unlocked={family.constellationsUnlocked} />
            )}
          </div>
        ))}
        {connectedFamilies.length > 3 && (
          <p className="text-xs text-slate-500 text-center">
            +{connectedFamilies.length - 3} أخرى
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {connectedFamilies.map((family) => (
        <Card key={family.connectionId} padding="sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{family.familyName}</p>

              {family.sharesWithYou ? (
                <div className="mt-2 space-y-2">
                  {/* Stars count */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span className="font-medium">{family.totalStars}</span>
                    </div>
                    {family.profileCount > 0 && (
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="w-3 h-3" />
                        <span>{family.profileCount} أفراد</span>
                      </div>
                    )}
                  </div>
                  {/* Mini constellation visual */}
                  <MiniConstellations unlocked={family.constellationsUnlocked} />
                </div>
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  التقدم غير مشارك معك
                </p>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => onEncourage(family.connectionId, family.familyId, family.familyName)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 text-xs transition-colors"
                >
                  <Heart className="w-3 h-3" />
                  شجّع
                </button>
                <button
                  onClick={() => {
                    // Determine which side this family is on
                    // This is simplified - the parent component knows the side
                    onToggleShare(family.connectionId, !family.youShareWith, 'inviting');
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 text-xs transition-colors"
                >
                  {family.youShareWith ? (
                    <>
                      <Eye className="w-3 h-3" />
                      مشارك
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      غير مشارك
                    </>
                  )}
                </button>
                {confirmRemove === family.connectionId ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        onRemove(family.connectionId);
                        setConfirmRemove(null);
                      }}
                      className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs transition-colors"
                    >
                      تأكيد
                    </button>
                    <button
                      onClick={() => setConfirmRemove(null)}
                      className="px-2 py-1 rounded-lg text-slate-400 hover:text-white text-xs transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRemove(family.connectionId)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
