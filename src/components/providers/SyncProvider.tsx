'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useFamilyStore } from '@/store/familyStore';
import { createClient } from '@/lib/supabase/client';

interface SyncProviderProps {
  children: React.ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const {
    setOnlineStatus,
    syncFromServer,
    processPendingActions,
    pendingActions,
    markAsLoaded,
    isHydrated,
  } = useFamilyStore();

  // Track if we've done initial sync to avoid multiple syncs
  const hasSyncedRef = useRef(false);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setOnlineStatus(true);
      // When coming back online, process any pending actions
      if (pendingActions.length > 0) {
        processPendingActions();
      }
    };

    const handleOffline = () => {
      setOnlineStatus(false);
    };

    // Set initial status
    setOnlineStatus(navigator.onLine);

    // Listen for changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, processPendingActions, pendingActions.length]);

  // Sync on auth state change
  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string) => {
        if (event === 'SIGNED_IN') {
          // User just signed in, ALWAYS sync from server to get latest data
          console.log('User signed in, syncing from server...');
          await syncFromServer();
          hasSyncedRef.current = true;
        } else if (event === 'SIGNED_OUT') {
          // Reset sync flag
          hasSyncedRef.current = false;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [syncFromServer]);

  // Initial sync on mount - wait for hydration, then sync if user is logged in
  useEffect(() => {
    // Don't run until Zustand has hydrated from localStorage
    if (!isHydrated) {
      console.log('[SyncProvider] Waiting for hydration...');
      return;
    }

    const checkAndSync = async () => {
      // Don't sync if we already did in this session
      if (hasSyncedRef.current) {
        console.log('[SyncProvider] Already synced in this session, skipping');
        return;
      }

      try {
        console.log('[SyncProvider] Hydration complete, checking auth state...');
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        console.log('[SyncProvider] Auth check result:', {
          hasUser: !!user,
          userId: user?.id,
          email: user?.email,
          error: error?.message,
        });

        if (user) {
          // User is logged in - ALWAYS sync from server to ensure we have latest data
          console.log('[SyncProvider] User logged in, syncing from server...');
          hasSyncedRef.current = true; // Set before async call to prevent double sync
          await syncFromServer();
          console.log('[SyncProvider] Sync completed');
        } else {
          // No user - mark as loaded so we don't show infinite loading
          console.log('[SyncProvider] No user logged in, marking as loaded');
          markAsLoaded();
        }
      } catch (err) {
        // If anything goes wrong, still mark as loaded to prevent infinite loading
        console.error('[SyncProvider] Error during sync:', err);
        markAsLoaded();
      }
    };

    // Run immediately once hydrated (no arbitrary timeout needed)
    checkAndSync();
  }, [isHydrated, syncFromServer, markAsLoaded]);

  // Sync before page unload if there are pending actions
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingActions.length > 0) {
        // Try to sync (may not complete if user closes immediately)
        processPendingActions();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [pendingActions.length, processPendingActions]);

  return <>{children}</>;
}

// Hook to manually trigger sync
export function useSync() {
  const {
    syncFromServer,
    syncToServer,
    isSyncing,
    lastSyncedAt,
    isOnline,
    pendingActions,
  } = useFamilyStore();

  const sync = useCallback(async () => {
    if (!isOnline) return false;

    await syncToServer();
    await syncFromServer();
    return true;
  }, [isOnline, syncToServer, syncFromServer]);

  return {
    sync,
    isSyncing,
    lastSyncedAt,
    isOnline,
    hasPendingChanges: pendingActions.length > 0,
  };
}
