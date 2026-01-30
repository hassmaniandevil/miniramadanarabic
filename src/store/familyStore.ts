import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Family, Profile, DailyProgress, FastingLog, SuhoorLog, IftarMessage, Star, Memory, TimeCapsule, RamadanGoal, PreparationTask, GoalCategory, PrepTaskCategory, FamilyConnection, ConnectedFamilyInfo, FamilyEncouragement, FamilyDua, DuaCategory, FamilyStreak, ActivityFeedEvent } from '@/types';
import { syncService } from '@/lib/supabase/sync';
import { getScaledThresholds, getUnlockedConstellationsScaled } from '@/data/constellations';

interface FamilyState {
  // Core data
  family: Family | null;
  profiles: Profile[];
  activeProfileId: string | null;

  // Daily data
  todaysFastingLogs: FastingLog[];
  todaysSuhoorLogs: SuhoorLog[];
  todaysMessages: IftarMessage[];
  todaysStars: Star[];

  // All stars (for total count)
  allStars: Star[];

  // All fasting logs (for monthly stats)
  allFastingLogs: FastingLog[];

  // Memories and Time Capsules
  memories: Memory[];
  timeCapsules: TimeCapsule[];
  selectedRamadanYear: number;

  // Preparation Mode (Pre-Ramadan)
  ramadanGoals: RamadanGoal[];
  preparationTasks: PreparationTask[];

  // Family connections
  familyConnections: FamilyConnection[];
  connectedFamilies: ConnectedFamilyInfo[];
  incomingRequests: FamilyConnection[];
  encouragements: FamilyEncouragement[];
  unreadEncouragementCount: number;

  // Family Dua Board
  familyDuas: FamilyDua[];

  // Family Streaks
  familyStreak: FamilyStreak | null;

  // Activity Feed
  activityFeed: ActivityFeedEvent[];

  // Constellation Celebrations
  showConstellationCelebration: boolean;
  lastUnlockedConstellation: string | null;

  // Test mode
  testMode: boolean;
  testDay: number | null;
  testPhase: 'auto' | 'before' | 'during' | 'after';

  // Profile locking (kid-safe mode)
  lockedToProfileId: string | null; // When set, user can only access this profile
  profileLockPin: string | null; // 4-digit PIN required to unlock

  // Sync state
  isSyncing: boolean;
  lastSyncedAt: string | null;
  isOnline: boolean;
  pendingActions: PendingAction[];
  hasInitiallyLoaded: boolean; // True after first sync attempt
  isHydrated: boolean; // True after Zustand has hydrated from localStorage

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setFamily: (family: Family | null) => void;
  setProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (profileId: string | null) => void;
  addProfile: (profile: Profile) => void;
  updateProfile: (profileId: string, updates: Partial<Profile>) => void;
  removeProfile: (profileId: string) => void;

  // Daily data actions
  setTodaysFastingLogs: (logs: FastingLog[]) => void;
  addFastingLog: (log: FastingLog) => void;
  setTodaysSuhoorLogs: (logs: SuhoorLog[]) => void;
  addSuhoorLog: (log: SuhoorLog) => void;
  setTodaysMessages: (messages: IftarMessage[]) => void;
  addMessage: (message: IftarMessage) => void;
  setTodaysStars: (stars: Star[]) => void;
  addStar: (star: Star) => void;

  // Memories and Time Capsules actions
  setMemories: (memories: Memory[]) => void;
  addMemory: (memory: Memory) => void;
  updateMemory: (memoryId: string, updates: Partial<Memory>) => void;
  removeMemory: (memoryId: string) => void;
  setTimeCapsules: (capsules: TimeCapsule[]) => void;
  addTimeCapsule: (capsule: TimeCapsule) => void;
  revealTimeCapsule: (capsuleId: string) => void;
  setSelectedRamadanYear: (year: number) => void;
  getAvailableYears: () => number[];

  // Preparation mode actions
  setRamadanGoals: (goals: RamadanGoal[]) => void;
  addRamadanGoal: (profileId: string, goalText: string, category: GoalCategory) => void;
  toggleRamadanGoal: (goalId: string, completed: boolean) => void;
  deleteRamadanGoal: (goalId: string) => void;
  setPreparationTasks: (tasks: PreparationTask[]) => void;
  addPreparationTask: (taskText: string, category: PrepTaskCategory) => void;
  togglePreparationTask: (taskId: string, completed: boolean) => void;
  confirmRamadanStartDate: (date: string) => void;

  // Sync actions
  syncFromServer: () => Promise<void>;
  syncToServer: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  processPendingActions: () => Promise<void>;
  markAsLoaded: () => void;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  togglePremium: () => void;
  setTestMode: (enabled: boolean) => void;
  setTestDay: (day: number | null) => void;
  setTestPhase: (phase: 'auto' | 'before' | 'during' | 'after') => void;

  // Profile locking actions (kid-safe mode)
  lockToProfile: (profileId: string, pin: string) => void;
  unlockProfile: (pin: string) => boolean; // Returns true if PIN is correct
  isProfileLocked: () => boolean;
  verifyLockPin: (pin: string) => boolean;

  // Family connection actions
  fetchFamilyConnections: () => Promise<void>;
  sendConnectionRequest: (invitedFamilyId: string) => Promise<FamilyConnection | null>;
  respondToConnection: (connectionId: string, accept: boolean, shareBack: boolean) => Promise<boolean>;
  toggleShareWithFamily: (connectionId: string, shares: boolean, side: 'inviting' | 'invited') => Promise<boolean>;
  removeConnection: (connectionId: string) => Promise<boolean>;
  sendEncouragement: (connectionId: string, receiverFamilyId: string, message: string, emoji?: string) => Promise<FamilyEncouragement | null>;

  // Family settings actions
  toggleTimezoneTracking: (enabled: boolean) => Promise<void>;

  // Family Dua Board actions
  fetchFamilyDuas: () => Promise<void>;
  addFamilyDua: (duaText: string, category: DuaCategory, isPrivate?: boolean) => Promise<FamilyDua | null>;
  toggleDuaCompleted: (duaId: string, completed: boolean) => Promise<boolean>;
  deleteFamilyDua: (duaId: string) => Promise<boolean>;

  // Family Streak actions
  fetchFamilyStreak: () => Promise<void>;

  // Activity Feed actions
  fetchActivityFeed: () => Promise<void>;
  addActivityFeedEvent: (event: Omit<ActivityFeedEvent, 'id' | 'createdAt'>) => Promise<void>;

  // Constellation Celebration actions
  dismissConstellationCelebration: () => void;
  checkForNewConstellation: (prevTotal: number, newTotal: number) => void;

  // Computed getters
  getActiveProfile: () => Profile | null;
  getDailyProgress: (profileId: string) => DailyProgress;
  getTotalFamilyStars: () => number;
  getProfileStars: (profileId: string) => number;
  hasCompletedActivity: (profileId: string, source: Star['source'], ramadanDay?: number) => boolean;
  getMonthlyStats: (profileId: string) => MonthlyStats;
  getAllFastingLogs: () => FastingLog[];
  isPremium: () => boolean;

  // Scaled constellation thresholds
  getScaledConstellationThresholds: () => number[];

  // Subscription actions
  refreshSubscriptionStatus: () => Promise<void>;
}

// Monthly statistics for end-of-month summary
interface MonthlyStats {
  totalDaysFasted: number;
  fullFastDays: number;
  partialFastDays: number;
  triedFastDays: number;
  quranDays: number;
  missionDays: number;
  storyDays: number;
  checkinDays: number;
  totalStars: number;
  constellationsUnlocked: number;
}

// Pending action for offline queue
interface PendingAction {
  id: string;
  type: 'addStar' | 'addFastingLog' | 'addSuhoorLog' | 'addMessage' | 'updateProfile' | 'updateFamily';
  payload: unknown;
  createdAt: string;
}

const initialState = {
  family: null,
  profiles: [],
  activeProfileId: null,
  todaysFastingLogs: [],
  todaysSuhoorLogs: [],
  todaysMessages: [],
  todaysStars: [],
  allStars: [],
  allFastingLogs: [] as FastingLog[],
  memories: [] as Memory[],
  timeCapsules: [] as TimeCapsule[],
  selectedRamadanYear: 2026,
  ramadanGoals: [] as RamadanGoal[],
  preparationTasks: [] as PreparationTask[],
  familyConnections: [] as FamilyConnection[],
  connectedFamilies: [] as ConnectedFamilyInfo[],
  incomingRequests: [] as FamilyConnection[],
  encouragements: [] as FamilyEncouragement[],
  unreadEncouragementCount: 0,
  familyDuas: [] as FamilyDua[],
  familyStreak: null as FamilyStreak | null,
  activityFeed: [] as ActivityFeedEvent[],
  showConstellationCelebration: false,
  lastUnlockedConstellation: null as string | null,
  testMode: false,
  testDay: null as number | null,
  testPhase: 'auto' as 'auto' | 'before' | 'during' | 'after',
  lockedToProfileId: null as string | null,
  profileLockPin: null as string | null,
  isSyncing: false,
  lastSyncedAt: null as string | null,
  isOnline: true,
  pendingActions: [] as PendingAction[],
  hasInitiallyLoaded: false,
  isHydrated: false,
  isLoading: false,
  error: null,
};

export const useFamilyStore = create<FamilyState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ==========================================
      // BASIC SETTERS
      // ==========================================
      setFamily: (family) => set({ family }),
      setProfiles: (profiles) => set({ profiles }),
      setActiveProfile: (profileId) => {
        const { lockedToProfileId } = get();
        // If profile is locked, only allow switching to the locked profile
        if (lockedToProfileId && profileId !== lockedToProfileId) {
          console.log('Profile is locked, cannot switch to another profile');
          return;
        }
        set({ activeProfileId: profileId });
      },

      addProfile: async (profile) => {
        // Add locally first
        set((state) => ({ profiles: [...state.profiles, profile] }));

        // Sync to server if online
        if (get().isOnline) {
          const serverProfile = await syncService.createProfile({
            familyId: profile.familyId,
            nickname: profile.nickname,
            avatar: profile.avatar,
            profileType: profile.profileType,
            ageRange: profile.ageRange,
            isActive: profile.isActive,
          });

          // Update with server ID if successful
          if (serverProfile) {
            set((state) => ({
              profiles: state.profiles.map((p) =>
                p.id === profile.id ? serverProfile : p
              ),
            }));
          }
        } else {
          // Queue for later sync
          set((state) => ({
            pendingActions: [
              ...state.pendingActions,
              {
                id: `action-${Date.now()}`,
                type: 'updateProfile',
                payload: profile,
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },

      updateProfile: async (profileId, updates) => {
        // Update locally first
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === profileId ? { ...p, ...updates } : p
          ),
        }));

        // Sync to server if online
        if (get().isOnline) {
          await syncService.updateProfile(profileId, updates);
        } else {
          set((state) => ({
            pendingActions: [
              ...state.pendingActions,
              {
                id: `action-${Date.now()}`,
                type: 'updateProfile',
                payload: { profileId, updates },
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },

      removeProfile: async (profileId) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== profileId),
        }));

        if (get().isOnline) {
          await syncService.deleteProfile(profileId);
        }
      },

      // ==========================================
      // DAILY DATA ACTIONS
      // ==========================================
      setTodaysFastingLogs: (logs) => set({ todaysFastingLogs: logs }),

      addFastingLog: async (log) => {
        // Add locally first - to both today's logs and all logs
        set((state) => ({
          todaysFastingLogs: [...state.todaysFastingLogs, log],
          allFastingLogs: [...state.allFastingLogs, log],
        }));

        // Sync to server if online
        if (get().isOnline) {
          await syncService.addFastingLog({
            profileId: log.profileId,
            date: log.date,
            ramadanDay: log.ramadanDay,
            mode: log.mode,
            partialHours: log.partialHours,
            energyLevel: log.energyLevel,
            notes: log.notes,
            starsEarned: log.starsEarned,
          });
        } else {
          set((state) => ({
            pendingActions: [
              ...state.pendingActions,
              {
                id: `action-${Date.now()}`,
                type: 'addFastingLog',
                payload: log,
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },

      setTodaysSuhoorLogs: (logs) => set({ todaysSuhoorLogs: logs }),

      addSuhoorLog: async (log) => {
        set((state) => ({ todaysSuhoorLogs: [...state.todaysSuhoorLogs, log] }));

        if (get().isOnline) {
          await syncService.addSuhoorLog({
            profileId: log.profileId,
            date: log.date,
            ramadanDay: log.ramadanDay,
            foodGroups: log.foodGroups,
            photoUrl: log.photoUrl,
            starsEarned: log.starsEarned,
          });
        } else {
          set((state) => ({
            pendingActions: [
              ...state.pendingActions,
              {
                id: `action-${Date.now()}`,
                type: 'addSuhoorLog',
                payload: log,
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },

      setTodaysMessages: (messages) => set({ todaysMessages: messages }),

      addMessage: async (message) => {
        set((state) => ({ todaysMessages: [...state.todaysMessages, message] }));

        if (get().isOnline) {
          await syncService.addMessage({
            familyId: message.familyId,
            senderId: message.senderId,
            recipientId: message.recipientId,
            message: message.message,
            messageType: message.messageType,
            voiceUrl: message.voiceUrl,
            drawingUrl: message.drawingUrl,
            emoji: message.emoji,
            date: message.date,
            ramadanDay: message.ramadanDay,
            isDelivered: message.isDelivered,
            deliveredAt: message.deliveredAt,
          });
        } else {
          set((state) => ({
            pendingActions: [
              ...state.pendingActions,
              {
                id: `action-${Date.now()}`,
                type: 'addMessage',
                payload: message,
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },

      setTodaysStars: (stars) => set({ todaysStars: stars }),

      addStar: async (star) => {
        // Get previous total for constellation check
        const prevTotal = get().getTotalFamilyStars();

        // Add to today's stars
        set((state) => ({
          todaysStars: [...state.todaysStars, star],
          allStars: [...state.allStars, star],
        }));

        // Check for new constellation unlock
        const newTotal = get().getTotalFamilyStars();
        get().checkForNewConstellation(prevTotal, newTotal);

        if (get().isOnline) {
          await syncService.addStar({
            profileId: star.profileId,
            familyId: star.familyId,
            date: star.date,
            ramadanDay: star.ramadanDay,
            source: star.source,
            count: star.count,
          });
        } else {
          set((state) => ({
            pendingActions: [
              ...state.pendingActions,
              {
                id: `action-${Date.now()}`,
                type: 'addStar',
                payload: star,
                createdAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },

      // ==========================================
      // MEMORIES AND TIME CAPSULES ACTIONS
      // ==========================================
      setMemories: (memories) => set({ memories }),

      addMemory: async (memory) => {
        set((state) => ({ memories: [memory, ...state.memories] }));

        if (get().isOnline) {
          await syncService.addMemory({
            familyId: memory.familyId,
            profileId: memory.profileId,
            ramadanYear: memory.ramadanYear,
            ramadanDay: memory.ramadanDay,
            category: memory.category,
            caption: memory.caption,
            photoUrl: memory.photoUrl,
            thumbnailUrl: memory.thumbnailUrl,
            isFavorite: memory.isFavorite,
          });
        }
      },

      updateMemory: async (memoryId, updates) => {
        set((state) => ({
          memories: state.memories.map((m) =>
            m.id === memoryId ? { ...m, ...updates } : m
          ),
        }));

        if (get().isOnline) {
          await syncService.updateMemory(memoryId, updates);
        }
      },

      removeMemory: async (memoryId) => {
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== memoryId),
        }));

        if (get().isOnline) {
          await syncService.deleteMemory(memoryId);
        }
      },

      setTimeCapsules: (timeCapsules) => set({ timeCapsules }),

      addTimeCapsule: async (capsule) => {
        set((state) => ({ timeCapsules: [...state.timeCapsules, capsule] }));

        if (get().isOnline) {
          await syncService.addTimeCapsule({
            familyId: capsule.familyId,
            authorId: capsule.authorId,
            recipientId: capsule.recipientId,
            writtenYear: capsule.writtenYear,
            message: capsule.message,
            voiceUrl: capsule.voiceUrl,
            revealType: capsule.revealType,
            revealDate: capsule.revealDate,
          });
        }
      },

      revealTimeCapsule: async (capsuleId) => {
        const now = new Date().toISOString();
        set((state) => ({
          timeCapsules: state.timeCapsules.map((c) =>
            c.id === capsuleId ? { ...c, isRevealed: true, revealedAt: now } : c
          ),
        }));

        if (get().isOnline) {
          await syncService.revealTimeCapsule(capsuleId);
        }
      },

      setSelectedRamadanYear: (year) => set({ selectedRamadanYear: year }),

      getAvailableYears: () => {
        const { memories, allStars } = get();
        const years = new Set<number>();
        years.add(2026); // Always include current year
        memories.forEach((m) => years.add(m.ramadanYear));
        allStars.forEach((s) => {
          if (s.ramadanDay) {
            // Infer year from date or use default
            years.add(2026);
          }
        });
        return Array.from(years).sort((a, b) => b - a);
      },

      // ==========================================
      // PREPARATION MODE ACTIONS
      // ==========================================
      setRamadanGoals: (goals) => set({ ramadanGoals: goals }),

      addRamadanGoal: async (profileId, goalText, category) => {
        const { family, selectedRamadanYear, isOnline } = get();
        if (!family) return;

        const newGoal: RamadanGoal = {
          id: `goal-${Date.now()}`,
          familyId: family.id,
          profileId,
          ramadanYear: selectedRamadanYear,
          goalText,
          category,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ ramadanGoals: [...state.ramadanGoals, newGoal] }));

        if (isOnline) {
          // TODO: Sync to server when API is ready
          // await syncService.addRamadanGoal(newGoal);
        }
      },

      toggleRamadanGoal: async (goalId, completed) => {
        const now = new Date().toISOString();
        set((state) => ({
          ramadanGoals: state.ramadanGoals.map((g) =>
            g.id === goalId
              ? { ...g, isCompleted: completed, completedAt: completed ? now : undefined }
              : g
          ),
        }));

        // TODO: Sync to server
      },

      deleteRamadanGoal: async (goalId) => {
        set((state) => ({
          ramadanGoals: state.ramadanGoals.filter((g) => g.id !== goalId),
        }));

        // TODO: Sync to server
      },

      setPreparationTasks: (tasks) => set({ preparationTasks: tasks }),

      addPreparationTask: async (taskText, category) => {
        const { family, selectedRamadanYear, isOnline } = get();
        if (!family) return;

        const newTask: PreparationTask = {
          id: `prep-${Date.now()}`,
          familyId: family.id,
          ramadanYear: selectedRamadanYear,
          taskText,
          category,
          isCompleted: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ preparationTasks: [...state.preparationTasks, newTask] }));

        if (isOnline) {
          // TODO: Sync to server when API is ready
          // await syncService.addPreparationTask(newTask);
        }
      },

      togglePreparationTask: async (taskId, completed) => {
        const { activeProfileId } = get();
        const now = new Date().toISOString();
        set((state) => ({
          preparationTasks: state.preparationTasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  isCompleted: completed,
                  completedAt: completed ? now : undefined,
                  completedBy: completed ? activeProfileId || undefined : undefined,
                }
              : t
          ),
        }));

        // TODO: Sync to server
      },

      confirmRamadanStartDate: async (date) => {
        const { family, isOnline } = get();
        if (!family) return;

        // Update locally
        set((state) => ({
          family: state.family
            ? {
                ...state.family,
                ramadanStartDate: date,
                isRamadanDateConfirmed: true,
              }
            : null,
        }));

        // Sync to server
        if (isOnline) {
          await syncService.updateFamily(family.id, {
            ramadanStartDate: date,
            isRamadanDateConfirmed: true,
          });
        }
      },

      // ==========================================
      // SYNC ACTIONS
      // ==========================================
      syncFromServer: async () => {
        set({ isSyncing: true, error: null });

        try {
          const data = await syncService.fetchAllData();

          if (data && data.family) {
            const today = new Date().toISOString().split('T')[0];
            const currentActiveProfileId = get().activeProfileId;

            // Check if current active profile exists in new data
            const activeProfileExists = data.profiles.some(
              (p) => p.id === currentActiveProfileId
            );

            // If active profile doesn't exist in new data, set to first profile
            const newActiveProfileId = activeProfileExists
              ? currentActiveProfileId
              : data.profiles.length > 0
              ? data.profiles[0].id
              : null;

            set({
              family: data.family,
              profiles: data.profiles,
              activeProfileId: newActiveProfileId,
              allStars: data.stars,
              allFastingLogs: data.fastingLogs,
              todaysStars: data.stars.filter((s) => s.date === today),
              todaysFastingLogs: data.fastingLogs.filter((l) => l.date === today),
              todaysSuhoorLogs: data.suhoorLogs.filter((l) => l.date === today),
              todaysMessages: data.messages.filter((m) => m.date === today),
              lastSyncedAt: new Date().toISOString(),
            });

            console.log('Synced from server successfully:', {
              familyId: data.family.id,
              profileCount: data.profiles.length,
              starsCount: data.stars.length,
            });

            // Family connections are fetched lazily by pages that need them
            // (e.g., /connections, /family, /settings) to avoid blocking initial sync
          } else {
            // No family data on server - user needs to complete onboarding
            console.log('No family data found on server');
            // Clear any stale local data
            set({
              family: null,
              profiles: [],
              activeProfileId: null,
            });
          }
        } catch (error) {
          console.error('Sync from server failed:', error);
          set({ error: 'Failed to sync data' });
        } finally {
          set({ isSyncing: false, hasInitiallyLoaded: true });
        }
      },

      syncToServer: async () => {
        // Process any pending actions
        await get().processPendingActions();
      },

      setOnlineStatus: (isOnline) => {
        set({ isOnline });

        // When coming back online, sync pending actions
        if (isOnline && get().pendingActions.length > 0) {
          get().processPendingActions();
        }
      },

      markAsLoaded: () => {
        set({ hasInitiallyLoaded: true });
      },

      processPendingActions: async () => {
        const { pendingActions, isOnline } = get();

        if (!isOnline || pendingActions.length === 0) return;

        set({ isSyncing: true });

        const remainingActions: PendingAction[] = [];

        for (const action of pendingActions) {
          try {
            switch (action.type) {
              case 'addStar': {
                const star = action.payload as Star;
                await syncService.addStar({
                  profileId: star.profileId,
                  familyId: star.familyId,
                  date: star.date,
                  ramadanDay: star.ramadanDay,
                  source: star.source,
                  count: star.count,
                });
                break;
              }
              case 'addFastingLog': {
                const log = action.payload as FastingLog;
                await syncService.addFastingLog({
                  profileId: log.profileId,
                  date: log.date,
                  ramadanDay: log.ramadanDay,
                  mode: log.mode,
                  partialHours: log.partialHours,
                  energyLevel: log.energyLevel,
                  notes: log.notes,
                  starsEarned: log.starsEarned,
                });
                break;
              }
              case 'addSuhoorLog': {
                const log = action.payload as SuhoorLog;
                await syncService.addSuhoorLog({
                  profileId: log.profileId,
                  date: log.date,
                  ramadanDay: log.ramadanDay,
                  foodGroups: log.foodGroups,
                  photoUrl: log.photoUrl,
                  starsEarned: log.starsEarned,
                });
                break;
              }
              case 'addMessage': {
                const msg = action.payload as IftarMessage;
                await syncService.addMessage({
                  familyId: msg.familyId,
                  senderId: msg.senderId,
                  recipientId: msg.recipientId,
                  message: msg.message,
                  messageType: msg.messageType,
                  date: msg.date,
                  ramadanDay: msg.ramadanDay,
                  isDelivered: msg.isDelivered,
                });
                break;
              }
              case 'updateProfile': {
                const { profileId, updates } = action.payload as { profileId: string; updates: Partial<Profile> };
                await syncService.updateProfile(profileId, updates);
                break;
              }
              case 'updateFamily': {
                const { familyId, updates } = action.payload as { familyId: string; updates: Partial<Family> };
                await syncService.updateFamily(familyId, updates);
                break;
              }
            }
          } catch (error) {
            console.error('Failed to process action:', action, error);
            remainingActions.push(action);
          }
        }

        set({
          pendingActions: remainingActions,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
        });
      },

      // ==========================================
      // UTILITY
      // ==========================================
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),

      togglePremium: () =>
        set((state) => ({
          family: state.family
            ? {
                ...state.family,
                subscriptionTier: state.family.subscriptionTier === 'paid' ? 'free' : 'paid',
              }
            : null,
        })),

      setTestMode: (enabled) => set({ testMode: enabled, testDay: enabled ? 1 : null, testPhase: enabled ? 'during' : 'auto' }),
      setTestDay: (day) => set({ testDay: day }),
      setTestPhase: (phase) => set({ testPhase: phase }),

      // Profile locking (kid-safe mode)
      lockToProfile: (profileId, pin) => {
        set({
          lockedToProfileId: profileId,
          activeProfileId: profileId,
          profileLockPin: pin,
        });
      },

      unlockProfile: (pin) => {
        const { profileLockPin } = get();
        if (profileLockPin === pin) {
          set({ lockedToProfileId: null, profileLockPin: null });
          return true;
        }
        return false;
      },

      isProfileLocked: () => {
        return get().lockedToProfileId !== null;
      },

      verifyLockPin: (pin) => {
        return get().profileLockPin === pin;
      },

      // Family settings
      toggleTimezoneTracking: async (enabled) => {
        const { family, isOnline } = get();
        if (!family) return;

        // Update locally
        set((state) => ({
          family: state.family
            ? { ...state.family, enableTimezoneTracking: enabled }
            : null,
        }));

        // Sync to server
        if (isOnline) {
          await syncService.updateFamily(family.id, {
            enableTimezoneTracking: enabled,
          });
        }
      },

      // ==========================================
      // FAMILY CONNECTION ACTIONS
      // ==========================================
      fetchFamilyConnections: async () => {
        const { family, isOnline } = get();
        if (!family || !isOnline) return;

        try {
          const [connections, connectedInfos, encouragements] = await Promise.all([
            syncService.fetchConnections(family.id),
            syncService.fetchConnectedFamilyInfo(family.id),
            syncService.fetchEncouragements(family.id),
          ]);

          const incoming = connections.filter(
            c => c.invitedFamilyId === family.id && c.status === 'pending'
          );
          const unread = encouragements.filter(
            e => e.receiverFamilyId === family.id && !e.isRead
          ).length;

          set({
            familyConnections: connections,
            connectedFamilies: connectedInfos,
            incomingRequests: incoming,
            encouragements,
            unreadEncouragementCount: unread,
          });
        } catch (error) {
          console.error('Error fetching family connections:', error);
        }
      },

      sendConnectionRequest: async (invitedFamilyId: string) => {
        const { family, isOnline } = get();
        if (!family || !isOnline) return null;

        const connection = await syncService.sendConnectionRequest(family.id, invitedFamilyId);
        if (connection) {
          set((state) => ({
            familyConnections: [connection, ...state.familyConnections],
          }));
        }
        return connection;
      },

      respondToConnection: async (connectionId: string, accept: boolean, shareBack: boolean) => {
        const { isOnline } = get();
        if (!isOnline) return false;

        const success = await syncService.respondToConnection(connectionId, accept, shareBack);
        if (success) {
          // Refresh connections data
          await get().fetchFamilyConnections();
        }
        return success;
      },

      toggleShareWithFamily: async (connectionId: string, shares: boolean, side: 'inviting' | 'invited') => {
        const { isOnline } = get();
        if (!isOnline) return false;

        const success = await syncService.toggleShareBack(connectionId, shares, side);
        if (success) {
          set((state) => ({
            familyConnections: state.familyConnections.map(c =>
              c.id === connectionId
                ? { ...c, [side === 'inviting' ? 'invitingShares' : 'invitedShares']: shares }
                : c
            ),
          }));
        }
        return success;
      },

      removeConnection: async (connectionId: string) => {
        const { isOnline } = get();
        if (!isOnline) return false;

        const success = await syncService.removeConnection(connectionId);
        if (success) {
          set((state) => ({
            familyConnections: state.familyConnections.filter(c => c.id !== connectionId),
            connectedFamilies: state.connectedFamilies.filter(cf => cf.connectionId !== connectionId),
          }));
        }
        return success;
      },

      sendEncouragement: async (connectionId: string, receiverFamilyId: string, message: string, emoji?: string) => {
        const { family, isOnline } = get();
        if (!family || !isOnline) return null;

        const encouragement = await syncService.sendEncouragement(
          connectionId, family.id, receiverFamilyId, message, emoji
        );
        if (encouragement) {
          set((state) => ({
            encouragements: [encouragement, ...state.encouragements],
          }));
        }
        return encouragement;
      },

      // ==========================================
      // FAMILY DUA BOARD ACTIONS
      // ==========================================
      fetchFamilyDuas: async () => {
        const { family, isOnline, selectedRamadanYear } = get();
        if (!family || !isOnline) return;

        try {
          const duas = await syncService.fetchFamilyDuas(family.id, selectedRamadanYear);
          set({ familyDuas: duas });
        } catch (error) {
          console.error('Error fetching family duas:', error);
        }
      },

      addFamilyDua: async (duaText: string, category: DuaCategory, isPrivate: boolean = false) => {
        const { family, activeProfileId, isOnline, selectedRamadanYear } = get();
        if (!family || !activeProfileId) return null;

        const newDua: FamilyDua = {
          id: `dua-${Date.now()}`,
          familyId: family.id,
          authorProfileId: activeProfileId,
          duaText,
          category,
          isPrivate,
          isCompleted: false,
          ramadanYear: selectedRamadanYear,
          createdAt: new Date().toISOString(),
        };

        // Optimistic update
        set((state) => ({ familyDuas: [newDua, ...state.familyDuas] }));

        if (isOnline) {
          const serverDua = await syncService.addFamilyDua({
            familyId: family.id,
            authorProfileId: activeProfileId,
            duaText,
            category,
            isPrivate,
            ramadanYear: selectedRamadanYear,
          });

          if (serverDua) {
            // Update with server ID
            set((state) => ({
              familyDuas: state.familyDuas.map((d) =>
                d.id === newDua.id ? serverDua : d
              ),
            }));
            return serverDua;
          }
        }

        return newDua;
      },

      toggleDuaCompleted: async (duaId: string, completed: boolean) => {
        const { isOnline } = get();
        const now = new Date().toISOString();

        // Optimistic update
        set((state) => ({
          familyDuas: state.familyDuas.map((d) =>
            d.id === duaId
              ? { ...d, isCompleted: completed, completedAt: completed ? now : undefined }
              : d
          ),
        }));

        if (isOnline) {
          const success = await syncService.updateFamilyDua(duaId, { isCompleted: completed });
          if (!success) {
            // Revert on failure
            set((state) => ({
              familyDuas: state.familyDuas.map((d) =>
                d.id === duaId
                  ? { ...d, isCompleted: !completed, completedAt: undefined }
                  : d
              ),
            }));
            return false;
          }
        }

        return true;
      },

      deleteFamilyDua: async (duaId: string) => {
        const { isOnline, familyDuas } = get();
        const duaToDelete = familyDuas.find((d) => d.id === duaId);

        // Optimistic update
        set((state) => ({
          familyDuas: state.familyDuas.filter((d) => d.id !== duaId),
        }));

        if (isOnline) {
          const success = await syncService.deleteFamilyDua(duaId);
          if (!success && duaToDelete) {
            // Revert on failure
            set((state) => ({
              familyDuas: [...state.familyDuas, duaToDelete],
            }));
            return false;
          }
        }

        return true;
      },

      // ==========================================
      // FAMILY STREAK ACTIONS
      // ==========================================
      fetchFamilyStreak: async () => {
        const { family, isOnline } = get();
        if (!family || !isOnline) return;

        try {
          const streak = await syncService.fetchFamilyStreak(family.id);
          set({ familyStreak: streak });
        } catch (error) {
          console.error('Error fetching family streak:', error);
        }
      },

      // ==========================================
      // ACTIVITY FEED ACTIONS
      // ==========================================
      fetchActivityFeed: async () => {
        const { family, isOnline } = get();
        if (!family || !isOnline) return;

        try {
          const feed = await syncService.fetchActivityFeed(family.id);
          set({ activityFeed: feed });
        } catch (error) {
          console.error('Error fetching activity feed:', error);
        }
      },

      addActivityFeedEvent: async (event: Omit<ActivityFeedEvent, 'id' | 'createdAt'>) => {
        const { isOnline } = get();

        if (isOnline) {
          const serverEvent = await syncService.addActivityFeedEvent(event);
          if (serverEvent) {
            set((state) => ({
              activityFeed: [serverEvent, ...state.activityFeed],
            }));
          }
        }
      },

      // ==========================================
      // CONSTELLATION CELEBRATION ACTIONS
      // ==========================================
      dismissConstellationCelebration: () => {
        set({ showConstellationCelebration: false, lastUnlockedConstellation: null });
      },

      checkForNewConstellation: (prevTotal: number, newTotal: number) => {
        const { profiles } = get();
        const profileTypes = profiles.length > 0
          ? profiles.map(p => p.profileType)
          : ['adult', 'adult'] as const;

        const prevUnlocked = getUnlockedConstellationsScaled(prevTotal, [...profileTypes]);
        const newUnlocked = getUnlockedConstellationsScaled(newTotal, [...profileTypes]);

        if (newUnlocked.length > prevUnlocked.length) {
          const justUnlocked = newUnlocked[newUnlocked.length - 1];
          set({
            showConstellationCelebration: true,
            lastUnlockedConstellation: justUnlocked.name,
          });
        }
      },

      // ==========================================
      // COMPUTED GETTERS
      // ==========================================
      getActiveProfile: () => {
        const { profiles, activeProfileId } = get();
        return profiles.find((p) => p.id === activeProfileId) || null;
      },

      getDailyProgress: (profileId) => {
        const { todaysFastingLogs, todaysSuhoorLogs, todaysMessages, todaysStars } = get();

        const hasFasting = todaysFastingLogs.some((l) => l.profileId === profileId);
        const hasSuhoor = todaysSuhoorLogs.some((l) => l.profileId === profileId);
        const messageCount = todaysMessages.filter((m) => m.senderId === profileId).length;
        const starCount = todaysStars
          .filter((s) => s.profileId === profileId)
          .reduce((acc, s) => acc + s.count, 0);

        return {
          fastingLogged: hasFasting,
          suhoorLogged: hasSuhoor,
          wonderCardViewed: false,
          missionCompleted: false,
          feelingCheckedIn: false,
          messagesSent: messageCount,
          totalStars: starCount,
        };
      },

      getTotalFamilyStars: () => {
        const { allStars, todaysStars } = get();
        // Use allStars if synced from server, otherwise use todaysStars
        const stars = allStars.length > 0 ? allStars : todaysStars;
        return stars.reduce((acc, s) => acc + s.count, 0);
      },

      getProfileStars: (profileId) => {
        const { allStars, todaysStars } = get();
        const stars = allStars.length > 0 ? allStars : todaysStars;
        return stars
          .filter((s) => s.profileId === profileId)
          .reduce((acc, s) => acc + s.count, 0);
      },

      hasCompletedActivity: (profileId: string, source: Star['source'], ramadanDay?: number) => {
        const { todaysStars, allStars, testMode, testDay } = get();

        // If a specific ramadan day is requested, or if in test mode, check by ramadanDay
        const dayToCheck = ramadanDay ?? (testMode ? testDay : null);

        if (dayToCheck !== null && dayToCheck > 0) {
          // Check all stars for this specific ramadan day - must match EXACTLY
          const starsToCheck = allStars.length > 0 ? allStars : todaysStars;
          return starsToCheck.some(
            (s) =>
              s.profileId === profileId &&
              s.source === source &&
              s.ramadanDay !== undefined &&
              s.ramadanDay !== null &&
              s.ramadanDay === dayToCheck
          );
        }

        // Normal mode: check today's stars (also by ramadanDay if available)
        const today = new Date().toISOString().split('T')[0];
        return todaysStars.some((s) =>
          s.profileId === profileId &&
          s.source === source &&
          s.date === today
        );
      },

      getAllFastingLogs: () => {
        const { allFastingLogs, todaysFastingLogs } = get();
        return allFastingLogs.length > 0 ? allFastingLogs : todaysFastingLogs;
      },

      getMonthlyStats: (profileId: string) => {
        const { allFastingLogs, todaysFastingLogs, allStars, todaysStars } = get();

        // Get all fasting logs for this profile
        const logs = allFastingLogs.length > 0 ? allFastingLogs : todaysFastingLogs;
        const profileLogs = logs.filter((l) => l.profileId === profileId);

        // Get all stars for this profile
        const stars = allStars.length > 0 ? allStars : todaysStars;
        const profileStars = stars.filter((s) => s.profileId === profileId);

        // Count fasting modes
        const fullFastDays = profileLogs.filter((l) => l.mode === 'full').length;
        const partialFastDays = profileLogs.filter((l) => l.mode === 'partial').length;
        const triedFastDays = profileLogs.filter((l) => l.mode === 'tried').length;
        const totalDaysFasted = fullFastDays + partialFastDays + triedFastDays;

        // Count activity days
        const quranDays = new Set(profileStars.filter((s) => s.source === 'quran').map((s) => s.ramadanDay)).size;
        const missionDays = new Set(profileStars.filter((s) => s.source === 'mission').map((s) => s.ramadanDay)).size;
        const storyDays = new Set(profileStars.filter((s) => s.source === 'story').map((s) => s.ramadanDay)).size;
        const checkinDays = new Set(profileStars.filter((s) => s.source === 'checkin').map((s) => s.ramadanDay)).size;

        // Total stars
        const totalStars = profileStars.reduce((acc, s) => acc + s.count, 0);

        // Constellations unlocked (based on family total, scaled by profile types)
        const familyTotalStars = stars.reduce((acc, s) => acc + s.count, 0);
        const { profiles: allProfiles } = get();
        const profileTypes = allProfiles.length > 0
          ? allProfiles.map(p => p.profileType)
          : ['adult', 'adult'] as const;
        const constellationThresholds = getScaledThresholds([...profileTypes]);
        const constellationsUnlocked = constellationThresholds.filter((t) => familyTotalStars >= t).length;

        return {
          totalDaysFasted,
          fullFastDays,
          partialFastDays,
          triedFastDays,
          quranDays,
          missionDays,
          storyDays,
          checkinDays,
          totalStars,
          constellationsUnlocked,
        };
      },

      isPremium: () => {
        const { family } = get();
        if (!family) return false;

        // Check if subscription is active or trialing
        const isActive = family.subscriptionTier === 'paid' &&
          (family.subscriptionStatus === 'active' || family.subscriptionStatus === 'trialing');

        // Check if subscription period hasn't expired
        if (family.subscriptionCurrentPeriodEnd) {
          const periodEnd = new Date(family.subscriptionCurrentPeriodEnd);
          if (periodEnd < new Date()) {
            return false;
          }
        }

        return isActive;
      },

      getScaledConstellationThresholds: () => {
        const { profiles } = get();
        const profileTypes = profiles.length > 0
          ? profiles.map(p => p.profileType)
          : ['adult', 'adult'] as const;
        return getScaledThresholds([...profileTypes]);
      },

      refreshSubscriptionStatus: async () => {
        try {
          const response = await fetch('/api/subscription/status');

          if (!response.ok) {
            console.error('Failed to fetch subscription status');
            return;
          }

          const data = await response.json();

          // Update family subscription status
          set((state) => ({
            family: state.family
              ? {
                  ...state.family,
                  subscriptionTier: data.tier,
                  subscriptionStatus: data.status,
                  subscriptionCurrentPeriodEnd: data.currentPeriodEnd,
                  subscriptionCancelAtPeriodEnd: data.cancelAtPeriodEnd,
                }
              : null,
          }));
        } catch (error) {
          console.error('Error refreshing subscription status:', error);
        }
      },
    }),
    {
      name: 'miniramadan-family-storage',
      version: 2,
      migrate: (persistedState: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const state = persistedState as any;
        // Ensure connection fields exist with proper defaults (added in v2)
        if (!Array.isArray(state.familyConnections)) state.familyConnections = [];
        if (!Array.isArray(state.connectedFamilies)) state.connectedFamilies = [];
        if (!Array.isArray(state.incomingRequests)) state.incomingRequests = [];
        if (!Array.isArray(state.encouragements)) state.encouragements = [];
        if (typeof state.unreadEncouragementCount !== 'number') state.unreadEncouragementCount = 0;
        // Ensure stickiness feature fields exist (added in v3)
        if (!Array.isArray(state.familyDuas)) state.familyDuas = [];
        if (state.familyStreak === undefined) state.familyStreak = null;
        if (!Array.isArray(state.activityFeed)) state.activityFeed = [];
        if (typeof state.showConstellationCelebration !== 'boolean') state.showConstellationCelebration = false;
        if (state.lastUnlockedConstellation === undefined) state.lastUnlockedConstellation = null;
        return state;
      },
      partialize: (state) => ({
        // Core data - persisted for offline access
        family: state.family,
        profiles: state.profiles,
        activeProfileId: state.activeProfileId,
        lockedToProfileId: state.lockedToProfileId,
        profileLockPin: state.profileLockPin,
        // Today's data only - allStars/allFastingLogs fetched fresh from server
        // This keeps localStorage small and fast to hydrate
        todaysStars: state.todaysStars,
        todaysFastingLogs: state.todaysFastingLogs,
        todaysSuhoorLogs: state.todaysSuhoorLogs,
        todaysMessages: state.todaysMessages,
        // Memories and preparation
        memories: state.memories,
        timeCapsules: state.timeCapsules,
        selectedRamadanYear: state.selectedRamadanYear,
        ramadanGoals: state.ramadanGoals,
        preparationTasks: state.preparationTasks,
        // Connections (small data)
        familyConnections: state.familyConnections,
        connectedFamilies: state.connectedFamilies,
        incomingRequests: state.incomingRequests,
        encouragements: state.encouragements,
        unreadEncouragementCount: state.unreadEncouragementCount,
        // Family Dua Board
        familyDuas: state.familyDuas,
        // Family Streaks
        familyStreak: state.familyStreak,
        // Activity Feed (keep recent for offline)
        activityFeed: state.activityFeed.slice(0, 20),
        // Test mode
        testMode: state.testMode,
        testDay: state.testDay,
        testPhase: state.testPhase,
        // Sync state
        lastSyncedAt: state.lastSyncedAt,
        pendingActions: state.pendingActions,
      }),
      onRehydrateStorage: () => (state) => {
        // Called when hydration is complete
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);

// Export a function to check hydration status (for SSR safety)
export const getIsHydrated = () => useFamilyStore.getState().isHydrated;
