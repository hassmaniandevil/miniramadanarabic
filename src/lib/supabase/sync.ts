import { createClient } from './client';
import { Family, Profile, Star, FastingLog, SuhoorLog, IftarMessage, Memory, TimeCapsule, MemoryCategory, TimeCapsuleRevealType, FamilyConnection, FamilyEncouragement, ConnectedFamilyInfo, FamilyDua, DuaCategory, FamilyStreak, ActivityFeedEvent, ActivityEventType } from '@/types';

// Type definitions for database rows
interface DbFamily {
  id: string;
  user_id: string;
  family_name: string;
  ramadan_start_date: string;
  is_ramadan_date_confirmed?: boolean | null; // Optional - may not exist in older databases
  timezone: string;
  suhoor_time: string;
  iftar_time: string;
  use_profile_prayer_times?: boolean | null; // Optional - may not exist in older databases
  enable_timezone_tracking?: boolean | null; // Optional - may not exist in older databases
  subscription_tier: 'free' | 'paid';
  subscription_status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_current_period_end: string | null;
  subscription_cancel_at_period_end: boolean | null;
  family_code: string | null;
  created_at: string;
  updated_at: string;
}

interface DbProfile {
  id: string;
  family_id: string;
  nickname: string;
  avatar: string;
  profile_type: 'little_star' | 'child' | 'adult';
  age_range: '3-6' | '7-9' | '10-12' | 'adult' | null;
  is_active: boolean;
  timezone: string | null;
  location_label: string | null;
  created_at: string;
  updated_at: string;
}

interface DbStar {
  id: string;
  profile_id: string;
  family_id: string;
  date: string;
  ramadan_day: number;
  source: Star['source'];
  count: number;
  created_at: string;
}

interface DbFastingLog {
  id: string;
  profile_id: string;
  family_id: string;
  date: string;
  ramadan_day: number;
  mode: FastingLog['mode'];
  partial_hours: number | null;
  energy_level: FastingLog['energyLevel'] | null;
  notes: string | null;
  stars_earned: number;
  created_at: string;
}

interface DbSuhoorLog {
  id: string;
  profile_id: string;
  family_id: string;
  date: string;
  ramadan_day: number;
  food_groups: string[];
  photo_url: string | null;
  stars_earned: number;
  created_at: string;
}

interface DbMessage {
  id: string;
  family_id: string;
  sender_id: string;
  recipient_id: string | null;
  message: string;
  message_type: 'text' | 'voice' | 'emoji' | 'drawing';
  voice_url: string | null;
  drawing_url: string | null;
  emoji: string | null;
  date: string;
  ramadan_day: number;
  is_delivered: boolean;
  delivered_at: string | null;
  created_at: string;
}

interface DbMemory {
  id: string;
  family_id: string;
  profile_id: string;
  ramadan_year: number;
  ramadan_day: number | null;
  category: MemoryCategory;
  caption: string | null;
  photo_url: string;
  thumbnail_url: string | null;
  is_favorite: boolean;
  created_at: string;
}

interface DbTimeCapsule {
  id: string;
  family_id: string;
  author_id: string;
  recipient_id: string;
  written_year: number;
  message: string;
  voice_url: string | null;
  reveal_type: TimeCapsuleRevealType;
  reveal_date: string | null;
  is_revealed: boolean;
  revealed_at: string | null;
  created_at: string;
}

// Conversion functions
function dbFamilyToFamily(db: DbFamily): Family {
  return {
    id: db.id,
    email: '', // Will be filled from auth
    familyName: db.family_name,
    ramadanStartDate: db.ramadan_start_date,
    isRamadanDateConfirmed: db.is_ramadan_date_confirmed || false,
    timezone: db.timezone,
    suhoorTime: db.suhoor_time,
    iftarTime: db.iftar_time,
    useProfilePrayerTimes: db.use_profile_prayer_times || false,
    enableTimezoneTracking: db.enable_timezone_tracking || false,
    subscriptionTier: db.subscription_tier,
    subscriptionStatus: db.subscription_status,
    stripeCustomerId: db.stripe_customer_id,
    stripeSubscriptionId: db.stripe_subscription_id,
    subscriptionCurrentPeriodEnd: db.subscription_current_period_end,
    subscriptionCancelAtPeriodEnd: db.subscription_cancel_at_period_end || false,
    familyCode: db.family_code || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function dbProfileToProfile(db: DbProfile): Profile {
  return {
    id: db.id,
    familyId: db.family_id,
    nickname: db.nickname,
    avatar: db.avatar,
    profileType: db.profile_type,
    ageRange: db.age_range || undefined,
    isActive: db.is_active,
    timezone: db.timezone || undefined,
    locationLabel: db.location_label || undefined,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function dbStarToStar(db: DbStar): Star {
  return {
    id: db.id,
    profileId: db.profile_id,
    familyId: db.family_id,
    date: db.date,
    ramadanDay: db.ramadan_day,
    source: db.source,
    count: db.count,
    createdAt: db.created_at,
  };
}

function dbFastingLogToFastingLog(db: DbFastingLog): FastingLog {
  return {
    id: db.id,
    profileId: db.profile_id,
    date: db.date,
    ramadanDay: db.ramadan_day,
    mode: db.mode,
    partialHours: db.partial_hours || undefined,
    energyLevel: db.energy_level || undefined,
    notes: db.notes || undefined,
    starsEarned: db.stars_earned,
    createdAt: db.created_at,
  };
}

function dbSuhoorLogToSuhoorLog(db: DbSuhoorLog): SuhoorLog {
  return {
    id: db.id,
    profileId: db.profile_id,
    date: db.date,
    ramadanDay: db.ramadan_day,
    foodGroups: db.food_groups as SuhoorLog['foodGroups'],
    photoUrl: db.photo_url || undefined,
    starsEarned: db.stars_earned,
    createdAt: db.created_at,
  };
}

function dbMessageToMessage(db: DbMessage): IftarMessage {
  return {
    id: db.id,
    familyId: db.family_id,
    senderId: db.sender_id,
    recipientId: db.recipient_id,
    message: db.message,
    messageType: db.message_type,
    voiceUrl: db.voice_url || undefined,
    drawingUrl: db.drawing_url || undefined,
    emoji: db.emoji || undefined,
    date: db.date,
    ramadanDay: db.ramadan_day,
    isDelivered: db.is_delivered,
    deliveredAt: db.delivered_at || undefined,
    createdAt: db.created_at,
  };
}

function dbMemoryToMemory(db: DbMemory): Memory {
  return {
    id: db.id,
    familyId: db.family_id,
    profileId: db.profile_id,
    ramadanYear: db.ramadan_year,
    ramadanDay: db.ramadan_day || undefined,
    category: db.category,
    caption: db.caption || undefined,
    photoUrl: db.photo_url,
    thumbnailUrl: db.thumbnail_url || undefined,
    isFavorite: db.is_favorite,
    createdAt: db.created_at,
  };
}

function dbTimeCapsuleToTimeCapsule(db: DbTimeCapsule): TimeCapsule {
  return {
    id: db.id,
    familyId: db.family_id,
    authorId: db.author_id,
    recipientId: db.recipient_id,
    writtenYear: db.written_year,
    message: db.message,
    voiceUrl: db.voice_url || undefined,
    revealType: db.reveal_type,
    revealDate: db.reveal_date || undefined,
    isRevealed: db.is_revealed,
    revealedAt: db.revealed_at || undefined,
    createdAt: db.created_at,
  };
}

interface DbFamilyConnection {
  id: string;
  inviting_family_id: string;
  invited_family_id: string;
  status: 'pending' | 'accepted' | 'declined';
  inviting_shares: boolean;
  invited_shares: boolean;
  created_at: string;
  updated_at: string;
}

interface DbFamilyEncouragement {
  id: string;
  connection_id: string;
  sender_family_id: string;
  receiver_family_id: string;
  message: string;
  emoji: string | null;
  is_read: boolean;
  created_at: string;
}

function dbConnectionToConnection(db: DbFamilyConnection): FamilyConnection {
  return {
    id: db.id,
    invitingFamilyId: db.inviting_family_id,
    invitedFamilyId: db.invited_family_id,
    status: db.status,
    invitingShares: db.inviting_shares,
    invitedShares: db.invited_shares,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  };
}

function dbEncouragementToEncouragement(db: DbFamilyEncouragement): FamilyEncouragement {
  return {
    id: db.id,
    connectionId: db.connection_id,
    senderFamilyId: db.sender_family_id,
    receiverFamilyId: db.receiver_family_id,
    message: db.message,
    emoji: db.emoji || undefined,
    isRead: db.is_read,
    createdAt: db.created_at,
  };
}

interface DbFamilyDua {
  id: string;
  family_id: string;
  author_profile_id: string;
  dua_text: string;
  category: DuaCategory;
  is_private: boolean;
  is_completed: boolean;
  completed_at: string | null;
  ramadan_year: number;
  created_at: string;
}

function dbDuaToDua(db: DbFamilyDua): FamilyDua {
  return {
    id: db.id,
    familyId: db.family_id,
    authorProfileId: db.author_profile_id,
    duaText: db.dua_text,
    category: db.category,
    isPrivate: db.is_private,
    isCompleted: db.is_completed,
    completedAt: db.completed_at || undefined,
    ramadanYear: db.ramadan_year,
    createdAt: db.created_at,
  };
}

interface DbFamilyStreak {
  id: string;
  family_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_start_date: string | null;
}

function dbStreakToStreak(db: DbFamilyStreak): FamilyStreak {
  return {
    id: db.id,
    familyId: db.family_id,
    currentStreak: db.current_streak,
    longestStreak: db.longest_streak,
    lastActivityDate: db.last_activity_date || undefined,
    streakStartDate: db.streak_start_date || undefined,
  };
}

interface DbActivityFeedEvent {
  id: string;
  family_id: string;
  profile_id: string;
  event_type: ActivityEventType;
  event_data: Record<string, unknown>;
  ramadan_day: number | null;
  created_at: string;
}

function dbActivityEventToEvent(db: DbActivityFeedEvent): ActivityFeedEvent {
  return {
    id: db.id,
    familyId: db.family_id,
    profileId: db.profile_id,
    eventType: db.event_type,
    eventData: db.event_data,
    ramadanDay: db.ramadan_day || undefined,
    createdAt: db.created_at,
  };
}

// Sync service
export class SyncService {
  private supabase = createClient();

  // ============================================
  // FETCH ALL DATA
  // ============================================
  async fetchAllData(): Promise<{
    family: Family | null;
    profiles: Profile[];
    stars: Star[];
    fastingLogs: FastingLog[];
    suhoorLogs: SuhoorLog[];
    messages: IftarMessage[];
  } | null> {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();

    console.log('[Sync] Fetching all data, user:', user?.id, 'error:', userError?.message);

    if (!user) {
      console.log('[Sync] No user found, returning null');
      return null;
    }

    // Fetch family
    const { data: familyData, error: familyError } = await this.supabase
      .from('families')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('[Sync] Family query result:', {
      found: !!familyData,
      familyId: familyData?.id,
      familyCode: familyData?.family_code,
      error: familyError?.message,
      code: familyError?.code,
    });

    if (!familyData) {
      console.log('[Sync] No family found for user:', user.id);
      return null;
    }

    const family = dbFamilyToFamily(familyData);
    family.email = user.email || '';

    // Fetch all related data in parallel
    const [profilesRes, starsRes, fastingRes, suhoorRes, messagesRes] = await Promise.all([
      this.supabase.from('profiles').select('*').eq('family_id', family.id),
      this.supabase.from('stars').select('*').eq('family_id', family.id),
      this.supabase.from('fasting_logs').select('*').eq('family_id', family.id),
      this.supabase.from('suhoor_logs').select('*').eq('family_id', family.id),
      this.supabase.from('messages').select('*').eq('family_id', family.id),
    ]);

    return {
      family,
      profiles: (profilesRes.data || []).map(dbProfileToProfile),
      stars: (starsRes.data || []).map(dbStarToStar),
      fastingLogs: (fastingRes.data || []).map(dbFastingLogToFastingLog),
      suhoorLogs: (suhoorRes.data || []).map(dbSuhoorLogToSuhoorLog),
      messages: (messagesRes.data || []).map(dbMessageToMessage),
    };
  }

  // ============================================
  // FAMILY OPERATIONS
  // ============================================
  async createFamily(family: Omit<Family, 'id' | 'createdAt' | 'updatedAt'>): Promise<Family | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('families')
      .insert({
        user_id: user.id,
        family_name: family.familyName,
        ramadan_start_date: family.ramadanStartDate,
        timezone: family.timezone,
        suhoor_time: family.suhoorTime,
        iftar_time: family.iftarTime,
        subscription_tier: family.subscriptionTier,
        subscription_status: family.subscriptionStatus,
        stripe_customer_id: family.stripeCustomerId,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating family:', error);
      return null;
    }

    const result = dbFamilyToFamily(data);
    result.email = user.email || '';
    return result;
  }

  async updateFamily(familyId: string, updates: Partial<Family>): Promise<boolean> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.familyName !== undefined) dbUpdates.family_name = updates.familyName;
    if (updates.ramadanStartDate !== undefined) dbUpdates.ramadan_start_date = updates.ramadanStartDate;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
    if (updates.suhoorTime !== undefined) dbUpdates.suhoor_time = updates.suhoorTime;
    if (updates.iftarTime !== undefined) dbUpdates.iftar_time = updates.iftarTime;
    if (updates.subscriptionTier !== undefined) dbUpdates.subscription_tier = updates.subscriptionTier;
    if (updates.subscriptionStatus !== undefined) dbUpdates.subscription_status = updates.subscriptionStatus;
    if (updates.stripeCustomerId !== undefined) dbUpdates.stripe_customer_id = updates.stripeCustomerId;
    if (updates.stripeSubscriptionId !== undefined) dbUpdates.stripe_subscription_id = updates.stripeSubscriptionId;
    if (updates.subscriptionCurrentPeriodEnd !== undefined) dbUpdates.subscription_current_period_end = updates.subscriptionCurrentPeriodEnd;
    if (updates.subscriptionCancelAtPeriodEnd !== undefined) dbUpdates.subscription_cancel_at_period_end = updates.subscriptionCancelAtPeriodEnd;
    if (updates.useProfilePrayerTimes !== undefined) dbUpdates.use_profile_prayer_times = updates.useProfilePrayerTimes;
    if (updates.enableTimezoneTracking !== undefined) dbUpdates.enable_timezone_tracking = updates.enableTimezoneTracking;
    if (updates.isRamadanDateConfirmed !== undefined) dbUpdates.is_ramadan_date_confirmed = updates.isRamadanDateConfirmed;

    const { error } = await this.supabase
      .from('families')
      .update(dbUpdates)
      .eq('id', familyId);

    if (error) {
      console.error('Error updating family:', error);
      return false;
    }

    return true;
  }

  // ============================================
  // SUBSCRIPTION OPERATIONS
  // ============================================
  async fetchSubscriptionStatus(): Promise<{
    tier: 'free' | 'paid';
    status: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data } = await this.supabase
      .from('families')
      .select('subscription_tier, subscription_status, subscription_current_period_end, subscription_cancel_at_period_end')
      .eq('user_id', user.id)
      .single();

    if (!data) return null;

    return {
      tier: data.subscription_tier,
      status: data.subscription_status,
      currentPeriodEnd: data.subscription_current_period_end,
      cancelAtPeriodEnd: data.subscription_cancel_at_period_end || false,
    };
  }

  // ============================================
  // PROFILE OPERATIONS
  // ============================================
  async createProfile(profile: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .insert({
        family_id: profile.familyId,
        nickname: profile.nickname,
        avatar: profile.avatar,
        profile_type: profile.profileType,
        age_range: profile.ageRange,
        is_active: profile.isActive,
        timezone: profile.timezone,
        location_label: profile.locationLabel,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error creating profile:', error);
      return null;
    }

    return dbProfileToProfile(data);
  }

  async updateProfile(profileId: string, updates: Partial<Profile>): Promise<boolean> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.nickname !== undefined) dbUpdates.nickname = updates.nickname;
    if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
    if (updates.profileType !== undefined) dbUpdates.profile_type = updates.profileType;
    if (updates.ageRange !== undefined) dbUpdates.age_range = updates.ageRange;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.timezone !== undefined) dbUpdates.timezone = updates.timezone;
    if (updates.locationLabel !== undefined) dbUpdates.location_label = updates.locationLabel;

    const { error } = await this.supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', profileId);

    if (error) {
      console.error('Error updating profile:', error);
      return false;
    }

    return true;
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', profileId);

    if (error) {
      console.error('Error deleting profile:', error);
      return false;
    }

    return true;
  }

  // ============================================
  // STAR OPERATIONS
  // ============================================
  async addStar(star: Omit<Star, 'id' | 'createdAt'>): Promise<Star | null> {
    const { data, error } = await this.supabase
      .from('stars')
      .insert({
        profile_id: star.profileId,
        family_id: star.familyId,
        date: star.date,
        ramadan_day: star.ramadanDay,
        source: star.source,
        count: star.count,
      })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate constraint error - that's okay
      if (error.code === '23505') {
        console.log('Star already exists for this activity');
        return null;
      }
      console.error('Error adding star:', error);
      return null;
    }

    return data ? dbStarToStar(data) : null;
  }

  // ============================================
  // FASTING LOG OPERATIONS
  // ============================================
  async addFastingLog(log: Omit<FastingLog, 'id' | 'createdAt'>): Promise<FastingLog | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    // Get family ID
    const { data: familyData } = await this.supabase
      .from('families')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!familyData) return null;

    const { data, error } = await this.supabase
      .from('fasting_logs')
      .upsert({
        profile_id: log.profileId,
        family_id: familyData.id,
        date: log.date,
        ramadan_day: log.ramadanDay,
        mode: log.mode,
        partial_hours: log.partialHours,
        energy_level: log.energyLevel,
        notes: log.notes,
        stars_earned: log.starsEarned,
      }, {
        onConflict: 'profile_id,date',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding fasting log:', error);
      return null;
    }

    return dbFastingLogToFastingLog(data);
  }

  // ============================================
  // SUHOOR LOG OPERATIONS
  // ============================================
  async addSuhoorLog(log: Omit<SuhoorLog, 'id' | 'createdAt'>): Promise<SuhoorLog | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    // Get family ID
    const { data: familyData } = await this.supabase
      .from('families')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!familyData) return null;

    const { data, error } = await this.supabase
      .from('suhoor_logs')
      .upsert({
        profile_id: log.profileId,
        family_id: familyData.id,
        date: log.date,
        ramadan_day: log.ramadanDay,
        food_groups: log.foodGroups,
        photo_url: log.photoUrl,
        stars_earned: log.starsEarned,
      }, {
        onConflict: 'profile_id,date',
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding suhoor log:', error);
      return null;
    }

    return dbSuhoorLogToSuhoorLog(data);
  }

  // ============================================
  // MESSAGE OPERATIONS
  // ============================================
  async addMessage(message: Omit<IftarMessage, 'id' | 'createdAt'>): Promise<IftarMessage | null> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        family_id: message.familyId,
        sender_id: message.senderId,
        recipient_id: message.recipientId,
        message: message.message,
        message_type: message.messageType,
        voice_url: message.voiceUrl,
        drawing_url: message.drawingUrl,
        emoji: message.emoji,
        date: message.date,
        ramadan_day: message.ramadanDay,
        is_delivered: message.isDelivered,
        delivered_at: message.deliveredAt,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding message:', error);
      return null;
    }

    return dbMessageToMessage(data);
  }

  // ============================================
  // MEMORY OPERATIONS
  // ============================================
  async addMemory(memory: Omit<Memory, 'id' | 'createdAt'>): Promise<Memory | null> {
    const { data, error } = await this.supabase
      .from('memories')
      .insert({
        family_id: memory.familyId,
        profile_id: memory.profileId,
        ramadan_year: memory.ramadanYear,
        ramadan_day: memory.ramadanDay,
        category: memory.category,
        caption: memory.caption,
        photo_url: memory.photoUrl,
        thumbnail_url: memory.thumbnailUrl,
        is_favorite: memory.isFavorite,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding memory:', error);
      return null;
    }

    return dbMemoryToMemory(data);
  }

  async updateMemory(memoryId: string, updates: Partial<Memory>): Promise<boolean> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.caption !== undefined) dbUpdates.caption = updates.caption;
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;
    if (updates.category !== undefined) dbUpdates.category = updates.category;

    const { error } = await this.supabase
      .from('memories')
      .update(dbUpdates)
      .eq('id', memoryId);

    if (error) {
      console.error('Error updating memory:', error);
      return false;
    }

    return true;
  }

  async deleteMemory(memoryId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('memories')
      .delete()
      .eq('id', memoryId);

    if (error) {
      console.error('Error deleting memory:', error);
      return false;
    }

    return true;
  }

  async fetchMemories(familyId: string, year?: number): Promise<Memory[]> {
    let query = this.supabase
      .from('memories')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (year) {
      query = query.eq('ramadan_year', year);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching memories:', error);
      return [];
    }

    return (data || []).map(dbMemoryToMemory);
  }

  // ============================================
  // TIME CAPSULE OPERATIONS
  // ============================================
  async addTimeCapsule(capsule: Omit<TimeCapsule, 'id' | 'createdAt' | 'isRevealed' | 'revealedAt'>): Promise<TimeCapsule | null> {
    const { data, error } = await this.supabase
      .from('time_capsules')
      .insert({
        family_id: capsule.familyId,
        author_id: capsule.authorId,
        recipient_id: capsule.recipientId,
        written_year: capsule.writtenYear,
        message: capsule.message,
        voice_url: capsule.voiceUrl,
        reveal_type: capsule.revealType,
        reveal_date: capsule.revealDate,
        is_revealed: false,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding time capsule:', error);
      return null;
    }

    return dbTimeCapsuleToTimeCapsule(data);
  }

  async revealTimeCapsule(capsuleId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('time_capsules')
      .update({
        is_revealed: true,
        revealed_at: new Date().toISOString(),
      })
      .eq('id', capsuleId);

    if (error) {
      console.error('Error revealing time capsule:', error);
      return false;
    }

    return true;
  }

  async fetchTimeCapsules(familyId: string): Promise<TimeCapsule[]> {
    const { data, error } = await this.supabase
      .from('time_capsules')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching time capsules:', error);
      return [];
    }

    return (data || []).map(dbTimeCapsuleToTimeCapsule);
  }

  // ============================================
  // TODAY'S DATA (filtered by date)
  // ============================================
  async fetchTodaysData(familyId: string): Promise<{
    stars: Star[];
    fastingLogs: FastingLog[];
    suhoorLogs: SuhoorLog[];
    messages: IftarMessage[];
  }> {
    const today = new Date().toISOString().split('T')[0];

    const [starsRes, fastingRes, suhoorRes, messagesRes] = await Promise.all([
      this.supabase.from('stars').select('*').eq('family_id', familyId).eq('date', today),
      this.supabase.from('fasting_logs').select('*').eq('family_id', familyId).eq('date', today),
      this.supabase.from('suhoor_logs').select('*').eq('family_id', familyId).eq('date', today),
      this.supabase.from('messages').select('*').eq('family_id', familyId).eq('date', today),
    ]);

    return {
      stars: (starsRes.data || []).map(dbStarToStar),
      fastingLogs: (fastingRes.data || []).map(dbFastingLogToFastingLog),
      suhoorLogs: (suhoorRes.data || []).map(dbSuhoorLogToSuhoorLog),
      messages: (messagesRes.data || []).map(dbMessageToMessage),
    };
  }

  // ============================================
  // FAMILY CONNECTION OPERATIONS
  // ============================================

  async lookupFamilyByCode(code: string): Promise<{ id: string; familyName: string } | null> {
    const { data, error } = await this.supabase
      .from('families')
      .select('id, family_name')
      .eq('family_code', code.toUpperCase())
      .single();

    if (error || !data) {
      console.error('Error looking up family by code:', error);
      return null;
    }

    return { id: data.id, familyName: data.family_name };
  }

  async sendConnectionRequest(invitingFamilyId: string, invitedFamilyId: string): Promise<FamilyConnection | null> {
    const { data, error } = await this.supabase
      .from('family_connections')
      .insert({
        inviting_family_id: invitingFamilyId,
        invited_family_id: invitedFamilyId,
        status: 'pending',
        inviting_shares: true,
        invited_shares: false,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error sending connection request:', error);
      return null;
    }

    return dbConnectionToConnection(data);
  }

  async respondToConnection(connectionId: string, accept: boolean, shareBack: boolean): Promise<boolean> {
    const { error } = await this.supabase
      .from('family_connections')
      .update({
        status: accept ? 'accepted' : 'declined',
        invited_shares: accept ? shareBack : false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', connectionId);

    if (error) {
      console.error('Error responding to connection:', error);
      return false;
    }

    return true;
  }

  async toggleShareBack(connectionId: string, shares: boolean, side: 'inviting' | 'invited'): Promise<boolean> {
    const update = side === 'inviting'
      ? { inviting_shares: shares }
      : { invited_shares: shares };

    const { error } = await this.supabase
      .from('family_connections')
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq('id', connectionId);

    if (error) {
      console.error('Error toggling share:', error);
      return false;
    }

    return true;
  }

  async removeConnection(connectionId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('family_connections')
      .delete()
      .eq('id', connectionId);

    if (error) {
      console.error('Error removing connection:', error);
      return false;
    }

    return true;
  }

  async fetchConnections(familyId: string): Promise<FamilyConnection[]> {
    const { data, error } = await this.supabase
      .from('family_connections')
      .select('*')
      .or(`inviting_family_id.eq.${familyId},invited_family_id.eq.${familyId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching connections:', error);
      return [];
    }

    return (data || []).map(dbConnectionToConnection);
  }

  async fetchConnectedFamilyInfo(familyId: string): Promise<ConnectedFamilyInfo[]> {
    // Get accepted connections
    const connections = await this.fetchConnections(familyId);
    const accepted = connections.filter(c => c.status === 'accepted');

    if (accepted.length === 0) return [];

    // Get info for each connected family
    const infos: ConnectedFamilyInfo[] = [];

    for (const conn of accepted) {
      const isInviter = conn.invitingFamilyId === familyId;
      const otherFamilyId = isInviter ? conn.invitedFamilyId : conn.invitingFamilyId;
      const sharesWithYou = isInviter ? conn.invitedShares : conn.invitingShares;
      const youShareWith = isInviter ? conn.invitingShares : conn.invitedShares;

      // Fetch the other family's public info
      const { data: familyData } = await this.supabase
        .from('families')
        .select('family_name')
        .eq('id', otherFamilyId)
        .single();

      if (!familyData) continue;

      // Only fetch star/profile counts if they share with us
      let totalStars = 0;
      let profileCount = 0;
      let constellationsUnlocked = 0;

      if (sharesWithYou) {
        const [profilesRes, starsRes] = await Promise.all([
          this.supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('family_id', otherFamilyId),
          this.supabase.from('stars').select('count').eq('family_id', otherFamilyId),
        ]);

        profileCount = profilesRes.count || 0;
        totalStars = (starsRes.data || []).reduce((sum: number, s: { count: number }) => sum + s.count, 0);

        // Calculate constellations unlocked using base thresholds
        const thresholds = [15, 35, 60, 90, 125, 165, 210, 260];
        constellationsUnlocked = thresholds.filter(t => totalStars >= t).length;
      }

      infos.push({
        connectionId: conn.id,
        familyId: otherFamilyId,
        familyName: familyData.family_name,
        profileCount,
        totalStars,
        constellationsUnlocked,
        sharesWithYou,
        youShareWith,
      });
    }

    return infos;
  }

  async sendEncouragement(
    connectionId: string,
    senderFamilyId: string,
    receiverFamilyId: string,
    message: string,
    emoji?: string
  ): Promise<FamilyEncouragement | null> {
    const { data, error } = await this.supabase
      .from('family_encouragements')
      .insert({
        connection_id: connectionId,
        sender_family_id: senderFamilyId,
        receiver_family_id: receiverFamilyId,
        message,
        emoji: emoji || null,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error sending encouragement:', error);
      return null;
    }

    return dbEncouragementToEncouragement(data);
  }

  async fetchEncouragements(familyId: string): Promise<FamilyEncouragement[]> {
    const { data, error } = await this.supabase
      .from('family_encouragements')
      .select('*')
      .or(`sender_family_id.eq.${familyId},receiver_family_id.eq.${familyId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching encouragements:', error);
      return [];
    }

    return (data || []).map(dbEncouragementToEncouragement);
  }

  async markEncouragementRead(encouragementId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('family_encouragements')
      .update({ is_read: true })
      .eq('id', encouragementId);

    if (error) {
      console.error('Error marking encouragement read:', error);
      return false;
    }

    return true;
  }

  // ============================================
  // FAMILY DUA OPERATIONS
  // ============================================
  async fetchFamilyDuas(familyId: string, year?: number): Promise<FamilyDua[]> {
    let query = this.supabase
      .from('family_duas')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (year) {
      query = query.eq('ramadan_year', year);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching family duas:', error);
      return [];
    }

    return (data || []).map(dbDuaToDua);
  }

  async addFamilyDua(dua: Omit<FamilyDua, 'id' | 'createdAt' | 'isCompleted' | 'completedAt'>): Promise<FamilyDua | null> {
    const { data, error } = await this.supabase
      .from('family_duas')
      .insert({
        family_id: dua.familyId,
        author_profile_id: dua.authorProfileId,
        dua_text: dua.duaText,
        category: dua.category,
        is_private: dua.isPrivate,
        ramadan_year: dua.ramadanYear,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding family dua:', error);
      return null;
    }

    return dbDuaToDua(data);
  }

  async updateFamilyDua(duaId: string, updates: Partial<Pick<FamilyDua, 'duaText' | 'category' | 'isPrivate' | 'isCompleted'>>): Promise<boolean> {
    const dbUpdates: Record<string, unknown> = {};

    if (updates.duaText !== undefined) dbUpdates.dua_text = updates.duaText;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate;
    if (updates.isCompleted !== undefined) {
      dbUpdates.is_completed = updates.isCompleted;
      dbUpdates.completed_at = updates.isCompleted ? new Date().toISOString() : null;
    }

    const { error } = await this.supabase
      .from('family_duas')
      .update(dbUpdates)
      .eq('id', duaId);

    if (error) {
      console.error('Error updating family dua:', error);
      return false;
    }

    return true;
  }

  async deleteFamilyDua(duaId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('family_duas')
      .delete()
      .eq('id', duaId);

    if (error) {
      console.error('Error deleting family dua:', error);
      return false;
    }

    return true;
  }

  // ============================================
  // FAMILY STREAK OPERATIONS
  // ============================================
  async fetchFamilyStreak(familyId: string): Promise<FamilyStreak | null> {
    const { data, error } = await this.supabase
      .from('family_streaks')
      .select('*')
      .eq('family_id', familyId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No streak record exists yet
        return null;
      }
      console.error('Error fetching family streak:', error);
      return null;
    }

    return data ? dbStreakToStreak(data) : null;
  }

  // ============================================
  // ACTIVITY FEED OPERATIONS
  // ============================================
  async fetchActivityFeed(familyId: string, limit: number = 50): Promise<ActivityFeedEvent[]> {
    const { data, error } = await this.supabase
      .from('activity_feed_events')
      .select('*')
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }

    return (data || []).map(dbActivityEventToEvent);
  }

  async addActivityFeedEvent(event: Omit<ActivityFeedEvent, 'id' | 'createdAt'>): Promise<ActivityFeedEvent | null> {
    const { data, error } = await this.supabase
      .from('activity_feed_events')
      .insert({
        family_id: event.familyId,
        profile_id: event.profileId,
        event_type: event.eventType,
        event_data: event.eventData,
        ramadan_day: event.ramadanDay,
      })
      .select()
      .single();

    if (error || !data) {
      console.error('Error adding activity feed event:', error);
      return null;
    }

    return dbActivityEventToEvent(data);
  }

  // ============================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================
  subscribeToFamilyChanges(
    familyId: string,
    callbacks: {
      onStarAdded?: (star: Star) => void;
      onMessageAdded?: (message: IftarMessage) => void;
      onFastingLogAdded?: (log: FastingLog) => void;
      onSuhoorLogAdded?: (log: SuhoorLog) => void;
      onActivityFeedEvent?: (event: ActivityFeedEvent) => void;
      onDuaAdded?: (dua: FamilyDua) => void;
      onDuaUpdated?: (dua: FamilyDua) => void;
    }
  ) {
    const channels: ReturnType<typeof this.supabase.channel>[] = [];

    if (callbacks.onStarAdded) {
      const starsChannel = this.supabase
        .channel('stars-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'stars', filter: `family_id=eq.${familyId}` },
          (payload: { new: DbStar }) => callbacks.onStarAdded?.(dbStarToStar(payload.new))
        )
        .subscribe();
      channels.push(starsChannel);
    }

    if (callbacks.onMessageAdded) {
      const messagesChannel = this.supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `family_id=eq.${familyId}` },
          (payload: { new: DbMessage }) => callbacks.onMessageAdded?.(dbMessageToMessage(payload.new))
        )
        .subscribe();
      channels.push(messagesChannel);
    }

    if (callbacks.onActivityFeedEvent) {
      const activityChannel = this.supabase
        .channel('activity-feed-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'activity_feed_events', filter: `family_id=eq.${familyId}` },
          (payload: { new: DbActivityFeedEvent }) => callbacks.onActivityFeedEvent?.(dbActivityEventToEvent(payload.new))
        )
        .subscribe();
      channels.push(activityChannel);
    }

    if (callbacks.onDuaAdded || callbacks.onDuaUpdated) {
      const duasChannel = this.supabase
        .channel('duas-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'family_duas', filter: `family_id=eq.${familyId}` },
          (payload: { new: DbFamilyDua }) => callbacks.onDuaAdded?.(dbDuaToDua(payload.new))
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'family_duas', filter: `family_id=eq.${familyId}` },
          (payload: { new: DbFamilyDua }) => callbacks.onDuaUpdated?.(dbDuaToDua(payload.new))
        )
        .subscribe();
      channels.push(duasChannel);
    }

    // Return unsubscribe function
    return () => {
      channels.forEach((channel) => channel.unsubscribe());
    };
  }
}

// Singleton instance
export const syncService = new SyncService();
