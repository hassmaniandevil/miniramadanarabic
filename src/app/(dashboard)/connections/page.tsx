'use client';

import { useState, useEffect } from 'react';
import { Header, BottomNav } from '@/components/layout';
import { Card } from '@/components/ui';
import {
  ConnectionActions,
  ConnectedFamilies,
  FamilyConnectionRequest,
  SendEncouragement,
  AddConnectionModal,
} from '@/components/features';
import { useFamilyStore } from '@/store/familyStore';
import { Users, UserPlus, Heart, Inbox } from 'lucide-react';

export default function ConnectionsPage() {
  const {
    family,
    connectedFamilies,
    incomingRequests,
    familyConnections,
    encouragements,
    unreadEncouragementCount,
    sendConnectionRequest,
    respondToConnection,
    toggleShareWithFamily,
    removeConnection,
    sendEncouragement,
    fetchFamilyConnections,
  } = useFamilyStore();

  const [showAddModal, setShowAddModal] = useState(false);
  const [encourageTarget, setEncourageTarget] = useState<{
    connectionId: string;
    familyId: string;
    familyName: string;
  } | null>(null);

  // Inviting family name cache for incoming requests
  const [requestFamilyNames, setRequestFamilyNames] = useState<Record<string, string>>({});

  // Fetch family names for incoming requests
  useEffect(() => {
    const fetchNames = async () => {
      const names: Record<string, string> = {};
      for (const req of (incomingRequests || [])) {
        if (!requestFamilyNames[req.invitingFamilyId]) {
          try {
            const { createClient } = await import('@/lib/supabase/client');
            const { data } = await createClient()
              .from('families')
              .select('family_name')
              .eq('id', req.invitingFamilyId)
              .single();
            if (data) {
              names[req.invitingFamilyId] = data.family_name;
            }
          } catch {
            // Ignore errors fetching family names
          }
        }
      }
      if (Object.keys(names).length > 0) {
        setRequestFamilyNames(prev => ({ ...prev, ...names }));
      }
    };
    if (incomingRequests?.length > 0) {
      fetchNames();
    }
  }, [incomingRequests]);

  // Refresh connections on mount
  useEffect(() => {
    fetchFamilyConnections();
  }, [fetchFamilyConnections]);

  // Received encouragements (for current family)
  const receivedEncouragements = (encouragements || []).filter(
    e => e.receiverFamilyId === family?.id
  );

  // Debug: log family object
  console.log('[ConnectionsPage] Family:', {
    id: family?.id,
    familyName: family?.familyName,
    familyCode: family?.familyCode,
    hasCode: !!family?.familyCode,
  });

  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">جاري التحميل...</p>
      </div>
    );
  }

  const handleRespond = async (connectionId: string, accept: boolean, shareBack: boolean) => {
    await respondToConnection(connectionId, accept, shareBack);
  };

  const handleToggleShare = (connectionId: string, shares: boolean, side: 'inviting' | 'invited') => {
    // Determine which side we are
    const conn = familyConnections?.find(c => c.id === connectionId);
    if (!conn) return;
    const actualSide = conn.invitingFamilyId === family.id ? 'inviting' : 'invited';
    toggleShareWithFamily(connectionId, shares, actualSide);
  };

  const handleEncourage = (message: string, emoji?: string) => {
    if (!encourageTarget) return;
    sendEncouragement(encourageTarget.connectionId, encourageTarget.familyId, message, emoji);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-lg mx-auto px-4 py-6 pb-24">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">اتصالات العائلة</h1>
          <p className="text-slate-400">تواصل وشجّع العائلات الأخرى</p>
        </div>

        {/* Connection actions - Share code, Enter code, Invite */}
        <div className="mb-6">
          {family.familyCode ? (
            <ConnectionActions
              familyCode={family.familyCode}
              familyName={family.familyName}
              onEnterCode={() => setShowAddModal(true)}
            />
          ) : (
            <Card className="text-center py-8">
              <p className="text-slate-400 mb-2">جاري إعداد اتصالات العائلة...</p>
              <p className="text-xs text-slate-500">سيظهر رمز عائلتك هنا قريباً.</p>
              <p className="text-xs text-slate-500 mt-4">إذا استمرت المشكلة، يرجى تسجيل الخروج ثم الدخول مرة أخرى.</p>
            </Card>
          )}
        </div>

        {/* Incoming requests */}
        {incomingRequests?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-amber-400 mb-3 px-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              الطلبات المعلقة ({incomingRequests.length})
            </h2>
            <div className="space-y-3">
              {incomingRequests.map((req) => (
                <FamilyConnectionRequest
                  key={req.id}
                  request={req}
                  invitingFamilyName={requestFamilyNames[req.invitingFamilyId] || 'عائلة'}
                  onRespond={handleRespond}
                />
              ))}
            </div>
          </div>
        )}

        {/* Connected families */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-slate-400 mb-3 px-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            العائلات المتصلة ({connectedFamilies?.length || 0})
          </h2>
          <ConnectedFamilies
            connectedFamilies={connectedFamilies}
            currentFamilyId={family.id}
            onToggleShare={handleToggleShare}
            onRemove={removeConnection}
            onEncourage={(connectionId, familyId, familyName) =>
              setEncourageTarget({ connectionId, familyId, familyName })
            }
          />
        </div>

        {/* Encouragement inbox */}
        {receivedEncouragements.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-slate-400 mb-3 px-1 flex items-center gap-2">
              <Inbox className="w-4 h-4" />
              التشجيعات
              {unreadEncouragementCount > 0 && (
                <span className="px-1.5 py-0.5 bg-pink-500 text-white text-xs rounded-full">
                  {unreadEncouragementCount}
                </span>
              )}
            </h2>
            <div className="space-y-2">
              {receivedEncouragements.slice(0, 10).map((enc) => {
                const senderFamily = connectedFamilies?.find(cf => cf.familyId === enc.senderFamilyId);
                return (
                  <Card key={enc.id} padding="sm" className={!enc.isRead ? 'border-pink-500/30 bg-pink-500/5' : ''}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                        {enc.emoji ? (
                          <span className="text-sm">{enc.emoji}</span>
                        ) : (
                          <Heart className="w-4 h-4 text-pink-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-pink-400 mb-0.5">
                          {senderFamily?.familyName || 'عائلة'}
                        </p>
                        <p className="text-sm text-white">{enc.message}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(enc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {!enc.isRead && (
                        <div className="w-2 h-2 rounded-full bg-pink-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Add connection modal */}
      <AddConnectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        currentFamilyId={family.id}
        onSendRequest={sendConnectionRequest}
      />

      {/* Send encouragement modal */}
      <SendEncouragement
        isOpen={!!encourageTarget}
        onClose={() => setEncourageTarget(null)}
        familyName={encourageTarget?.familyName || ''}
        onSend={handleEncourage}
      />

      <BottomNav />
    </div>
  );
}
