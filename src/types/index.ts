// MiniRamadan Type Definitions

export type ProfileType = 'little_star' | 'child' | 'adult';

export type FastingMode = 'full' | 'partial' | 'tried' | 'not_today';

export type EnergyLevel = 'tired' | 'okay' | 'strong';

export type FeelingLevel = 'really_hard' | 'bit_tough' | 'okay' | 'good' | 'really_good';

export type FoodGroup = 'water' | 'protein' | 'fibre' | 'fruit' | 'dairy' | 'grains';

export type MissionCategory = 'home' | 'social' | 'spiritual' | 'charity';

export type ConstellationName =
  | 'patience'
  | 'generosity'
  | 'courage'
  | 'forgiveness'
  | 'gratitude'
  | 'mercy'
  | 'kindness'
  | 'hope'
  | 'unity';

export interface Family {
  id: string;
  email: string;
  familyName: string;
  ramadanStartDate: string; // ISO date string
  isRamadanDateConfirmed?: boolean; // Has user confirmed via moon sighting?
  timezone: string;
  suhoorTime: string; // HH:mm format (default family time)
  iftarTime: string; // HH:mm format (default family time)
  useProfilePrayerTimes?: boolean; // Enable per-profile prayer times
  enableTimezoneTracking?: boolean; // Enable long-distance family timezone tracking
  subscriptionTier: 'free' | 'paid';
  subscriptionStatus: 'active' | 'trialing' | 'past_due' | 'cancelled' | 'expired' | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId?: string | null;
  subscriptionCurrentPeriodEnd?: string | null;
  subscriptionCancelAtPeriodEnd?: boolean;
  familyCode?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// SUBSCRIPTION & DISCOUNT TYPES
// ============================================

export type DiscountType = 'percent' | 'fixed';

export interface DiscountCode {
  id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxUses?: number;
  currentUses: number;
  validFrom?: string;
  validUntil?: string;
  isActive: boolean;
  stripeCouponId?: string;
  createdAt: string;
}

export interface DiscountValidationResult {
  isValid: boolean;
  discountType?: DiscountType;
  discountValue?: number;
  errorMessage?: string;
  stripeCouponId?: string;
}

export interface SubscriptionHistoryEvent {
  id: string;
  familyId: string;
  eventType: 'subscription_created' | 'subscription_updated' | 'subscription_cancelled' |
             'subscription_expired' | 'payment_succeeded' | 'payment_failed' |
             'trial_started' | 'trial_ended' | 'discount_applied';
  stripeEventId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Platform for purchases
export type PurchasePlatform = 'web' | 'ios' | 'android';

export interface PurchaseResult {
  success: boolean;
  platform: PurchasePlatform;
  transactionId?: string;
  error?: string;
}

export interface Profile {
  id: string;
  familyId: string;
  nickname: string;
  avatar: string; // avatar identifier
  profileType: ProfileType;
  ageRange?: '3-6' | '7-9' | '10-12' | 'adult';
  isActive: boolean;
  timezone?: string; // Individual timezone for long-distance family
  locationLabel?: string; // e.g., "Baba in Dubai"
  suhoorTime?: string; // HH:mm format (profile-specific)
  iftarTime?: string; // HH:mm format (profile-specific)
  isLocked?: boolean; // When true, this profile can only access its own account (kid-safe mode)
  createdAt: string;
  updatedAt: string;
}

export interface FastingLog {
  id: string;
  profileId: string;
  date: string; // ISO date string
  ramadanDay: number; // 1-30
  mode: FastingMode;
  partialHours?: number; // only if mode is 'partial'
  energyLevel?: EnergyLevel;
  notes?: string;
  starsEarned: number;
  createdAt: string;
}

export interface SuhoorLog {
  id: string;
  profileId: string;
  date: string;
  ramadanDay: number;
  foodGroups: FoodGroup[];
  photoUrl?: string;
  starsEarned: number;
  createdAt: string;
}

export interface KindnessMission {
  id: string;
  day: number; // 1-30
  category: MissionCategory;
  title: string;
  description: string;
  isQuietStar: boolean; // secret kindness
}

export interface MissionCompletion {
  id: string;
  profileId: string;
  missionId: string;
  date: string;
  ramadanDay: number;
  note?: string; // private note for quiet stars
  starsEarned: number;
  createdAt: string;
}

export interface WonderCard {
  id: string;
  day: number; // 1-30
  fact: string;
  tellSomeonePrompt: string;
  todaysWord: string;
  todaysWordArabic?: string;
  todaysWordMeaning: string;
}

export interface WonderCardView {
  id: string;
  profileId: string;
  wonderCardId: string;
  date: string;
  ramadanDay: number;
  starsEarned: number;
  createdAt: string;
}

export interface IftarMessage {
  id: string;
  familyId: string;
  senderId: string;
  recipientId: string | null; // null means whole family
  message: string;
  messageType: 'text' | 'voice' | 'emoji' | 'drawing';
  voiceUrl?: string;
  drawingUrl?: string;
  emoji?: string;
  date: string;
  ramadanDay: number;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

export interface FeelingCheckIn {
  id: string;
  profileId: string;
  date: string;
  ramadanDay: number;
  feelingLevel: FeelingLevel;
  feelingWord?: string;
  note?: string;
  voiceNoteUrl?: string;
  createdAt: string;
}

export interface Star {
  id: string;
  profileId: string;
  familyId: string;
  date: string;
  ramadanDay: number;
  source: 'fasting' | 'suhoor' | 'mission' | 'wonder' | 'checkin' | 'helped' | 'story' | 'quran' | 'preparation' | 'kindness' | 'dua' | 'fasting_helper';
  count: number;
  createdAt: string;
}

export interface Constellation {
  id: string;
  familyId: string;
  name: ConstellationName;
  progress: number; // 0-100
  isUnlocked: boolean;
  unlockedAt?: string;
  createdAt: string;
}

export interface ParentNote {
  id: string;
  familyId: string;
  authorId: string; // parent profile id
  recipientId: string; // child profile id
  year: number;
  note: string;
  createdAt: string;
}

// UI State Types
export interface DailyProgress {
  fastingLogged: boolean;
  suhoorLogged: boolean;
  wonderCardViewed: boolean;
  missionCompleted: boolean;
  feelingCheckedIn: boolean;
  messagesSent: number;
  totalStars: number;
}

export interface FamilySkyData {
  totalStars: number;
  profileStars: { profileId: string; nickname: string; avatar: string; stars: number }[];
  constellations: Constellation[];
  todaysActivity: { profileId: string; activities: string[] }[];
}

// Form Types
export interface SignupFormData {
  email: string;
  password: string;
  familyName: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ProfileFormData {
  nickname: string;
  avatar: string;
  profileType: ProfileType;
  ageRange?: '3-6' | '7-9' | '10-12' | 'adult';
}

export interface RamadanSettingsFormData {
  ramadanStartDate: string;
  timezone: string;
  suhoorTime: string;
  iftarTime: string;
}

// ============================================
// MEMORIES & TIME CAPSULES
// ============================================

export type MemoryCategory =
  | 'first_iftar'
  | 'decorations'
  | 'family'
  | 'suhoor'
  | 'eid'
  | 'special'
  | 'kindness'
  | 'other';

export interface Memory {
  id: string;
  familyId: string;
  profileId: string;
  ramadanYear: number;
  ramadanDay?: number;
  category: MemoryCategory;
  caption?: string;
  photoUrl: string;
  thumbnailUrl?: string;
  isFavorite: boolean;
  createdAt: string;
}

export type TimeCapsuleRevealType = 'next_ramadan' | 'next_eid' | 'specific_date';

export interface TimeCapsule {
  id: string;
  familyId: string;
  authorId: string;
  recipientId: string;
  writtenYear: number;
  message: string;
  voiceUrl?: string;
  revealType: TimeCapsuleRevealType;
  revealDate?: string;
  isRevealed: boolean;
  revealedAt?: string;
  createdAt: string;
}

// Memory category metadata
export const MEMORY_CATEGORIES: Record<MemoryCategory, { label: string; icon: string; color: string }> = {
  first_iftar: { label: 'أول إفطار', icon: '🌙', color: 'from-amber-500 to-orange-500' },
  decorations: { label: 'الزينة', icon: '✨', color: 'from-purple-500 to-pink-500' },
  family: { label: 'وقت العائلة', icon: '👨‍👩‍👧‍👦', color: 'from-blue-500 to-cyan-500' },
  suhoor: { label: 'السحور', icon: '🌅', color: 'from-indigo-500 to-purple-500' },
  eid: { label: 'العيد', icon: '🎉', color: 'from-green-500 to-emerald-500' },
  special: { label: 'لحظة مميزة', icon: '💫', color: 'from-yellow-500 to-amber-500' },
  kindness: { label: 'أعمال الخير', icon: '💝', color: 'from-rose-500 to-pink-500' },
  other: { label: 'أخرى', icon: '📸', color: 'from-slate-500 to-gray-500' },
};

// Time capsule writing prompts - focused on hopes and goals for next Ramadan
export const TIME_CAPSULE_PROMPTS = [
  "ماذا تأمل أن تحقق بحلول رمضان القادم؟",
  "ما العادة الحسنة التي تريد أن تبدأها من الآن وحتى رمضان القادم؟",
  "ما الهدف الذي ستعمل عليه هذا العام؟",
  "ماذا تريد أن يتذكر نفسك المستقبلية عن اليوم؟",
  "بماذا تفخر أكثر في هذا الرمضان وتريد الاستمرار فيه؟",
  "ما الشيء الذي ستفعله بشكل مختلف في رمضان القادم؟",
  "ما الدعاء الذي تريد أن تدعوه لنفسك للعام القادم؟",
  "ما رسالة التشجيع التي لديك لنفسك العام القادم؟",
  "ما المهارة أو المعرفة الجديدة التي تريد اكتسابها هذا العام؟",
  "ماذا ستفعل هذا العام لتصبح مسلماً أفضل؟",
];

// ============================================
// COUNTDOWN & PREPARATION MODE
// ============================================

export type GoalCategory = 'fasting' | 'prayer' | 'quran' | 'kindness' | 'learning' | 'family' | 'other';
export type PrepTaskCategory = 'decorations' | 'learning' | 'shopping' | 'planning' | 'spiritual' | 'family';

export interface RamadanGoal {
  id: string;
  familyId: string;
  profileId: string;
  ramadanYear: number;
  goalText: string;
  category: GoalCategory;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface PreparationTask {
  id: string;
  familyId: string;
  ramadanYear: number;
  taskText: string;
  category: PrepTaskCategory;
  isCompleted: boolean;
  completedBy?: string;
  createdAt: string;
  completedAt?: string;
}

// Goal category metadata
export const GOAL_CATEGORIES: Record<GoalCategory, { label: string; icon: string; color: string }> = {
  fasting: { label: 'الصيام', icon: '🌙', color: 'from-amber-500 to-orange-500' },
  prayer: { label: 'الصلاة', icon: '🤲', color: 'from-emerald-500 to-teal-500' },
  quran: { label: 'القرآن', icon: '📖', color: 'from-green-500 to-emerald-500' },
  kindness: { label: 'الإحسان', icon: '💝', color: 'from-rose-500 to-pink-500' },
  learning: { label: 'التعلم', icon: '📚', color: 'from-blue-500 to-indigo-500' },
  family: { label: 'العائلة', icon: '👨‍👩‍👧‍👦', color: 'from-purple-500 to-violet-500' },
  other: { label: 'أخرى', icon: '✨', color: 'from-slate-500 to-gray-500' },
};

// Preparation task category metadata
export const PREP_TASK_CATEGORIES: Record<PrepTaskCategory, { label: string; icon: string; color: string }> = {
  decorations: { label: 'الزينة', icon: '🎨', color: 'from-purple-500 to-pink-500' },
  learning: { label: 'التعلم', icon: '📚', color: 'from-blue-500 to-indigo-500' },
  shopping: { label: 'التسوق', icon: '🛒', color: 'from-green-500 to-emerald-500' },
  planning: { label: 'التخطيط', icon: '📋', color: 'from-amber-500 to-orange-500' },
  spiritual: { label: 'الروحانية', icon: '🤲', color: 'from-teal-500 to-cyan-500' },
  family: { label: 'العائلة', icon: '💕', color: 'from-rose-500 to-pink-500' },
};

// Default preparation tasks families can add
export const DEFAULT_PREP_TASKS: { text: string; category: PrepTaskCategory; forKids: boolean }[] = [
  // الزينة
  { text: 'تعليق زينة رمضان', category: 'decorations', forKids: true },
  { text: 'صنع تقويم العد التنازلي لرمضان', category: 'decorations', forKids: true },
  { text: 'صنع أشغال يدوية بأشكال القمر والنجوم', category: 'decorations', forKids: true },
  { text: 'إعداد ركن رمضاني خاص', category: 'decorations', forKids: true },

  // التعلم
  { text: 'تعلم لماذا نصوم', category: 'learning', forKids: true },
  { text: 'تدرب على قول "رمضان مبارك"', category: 'learning', forKids: true },
  { text: 'تعلم دعاء جديد معاً', category: 'learning', forKids: true },
  { text: 'اقرأ قصة عن رمضان', category: 'learning', forKids: true },
  { text: 'تعلم أدعية الإفطار والسحور', category: 'learning', forKids: true },

  // التسوق
  { text: 'شراء تمر للإفطار', category: 'shopping', forKids: false },
  { text: 'شراء حلويات رمضان المميزة', category: 'shopping', forKids: false },
  { text: 'تجهيز هدايا للصدقة', category: 'shopping', forKids: true },

  // التخطيط
  { text: 'إعداد ملفات العائلة في التطبيق', category: 'planning', forKids: false },
  { text: 'التخطيط لوجبات الإفطار المفضلة', category: 'planning', forKids: false },
  { text: 'وضع أهداف رمضان كعائلة', category: 'planning', forKids: true },
  { text: 'صنع جرة الإحسان', category: 'planning', forKids: true },

  // الروحانية
  { text: 'التدرب على الاستيقاظ للسحور', category: 'spiritual', forKids: true },
  { text: 'تجربة صيام تدريبي (حتى لو لساعات قليلة)', category: 'spiritual', forKids: true },
  { text: 'تعلم عن ليلة القدر', category: 'spiritual', forKids: true },

  // العائلة
  { text: 'دعوة العائلة للانضمام لميني رمضان', category: 'family', forKids: false },
  { text: 'التخطيط لاحتفال العيد', category: 'family', forKids: true },
  { text: 'التحدث عما يتطلع إليه الجميع', category: 'family', forKids: true },
];

// Goal suggestions for different age groups
export const GOAL_SUGGESTIONS: { text: string; category: GoalCategory; forLittleStars: boolean; forKids: boolean; forAdults: boolean }[] = [
  // أهداف الصيام
  { text: 'أجرب الصيام حتى الغداء', category: 'fasting', forLittleStars: true, forKids: false, forAdults: false },
  { text: 'أصوم نصف اليوم', category: 'fasting', forLittleStars: false, forKids: true, forAdults: false },
  { text: 'أكمل أول صيام كامل', category: 'fasting', forLittleStars: false, forKids: true, forAdults: false },
  { text: 'أصوم كل يوم من رمضان', category: 'fasting', forLittleStars: false, forKids: false, forAdults: true },

  // أهداف الصلاة
  { text: 'أتعلم دعاء جديد', category: 'prayer', forLittleStars: true, forKids: true, forAdults: false },
  { text: 'أصلي مع العائلة كل يوم', category: 'prayer', forLittleStars: true, forKids: true, forAdults: true },
  { text: 'أحضر صلاة التراويح', category: 'prayer', forLittleStars: false, forKids: true, forAdults: true },

  // أهداف القرآن
  { text: 'أستمع للقرآن كل يوم', category: 'quran', forLittleStars: true, forKids: true, forAdults: false },
  { text: 'أحفظ سورة جديدة', category: 'quran', forLittleStars: false, forKids: true, forAdults: true },
  { text: 'أقرأ القرآن كل يوم', category: 'quran', forLittleStars: false, forKids: true, forAdults: true },

  // أهداف الإحسان
  { text: 'أفعل شيئاً لطيفاً كل يوم', category: 'kindness', forLittleStars: true, forKids: true, forAdults: true },
  { text: 'أساعد في تحضير الإفطار', category: 'kindness', forLittleStars: true, forKids: true, forAdults: false },
  { text: 'أشارك ألعابي مع الآخرين', category: 'kindness', forLittleStars: true, forKids: true, forAdults: false },
  { text: 'أتصدق للمحتاجين', category: 'kindness', forLittleStars: false, forKids: true, forAdults: true },

  // أهداف التعلم
  { text: 'أتعلم عن تقاليد رمضان', category: 'learning', forLittleStars: true, forKids: true, forAdults: false },
  { text: 'أتعلم 5 كلمات عربية جديدة', category: 'learning', forLittleStars: false, forKids: true, forAdults: true },
  { text: 'أقرأ كتاباً عن الإسلام', category: 'learning', forLittleStars: false, forKids: true, forAdults: true },

  // أهداف العائلة
  { text: 'أتناول الإفطار مع العائلة كل يوم', category: 'family', forLittleStars: true, forKids: true, forAdults: true },
  { text: 'أرسل رسالة لطيفة للعائلة كل يوم', category: 'family', forLittleStars: true, forKids: true, forAdults: true },
  { text: 'أساعد إخوتي الصغار في أهدافهم', category: 'family', forLittleStars: false, forKids: true, forAdults: true },
];

// ============================================
// FAMILY CONNECTIONS
// ============================================

export type ConnectionStatus = 'pending' | 'accepted' | 'declined';

export interface FamilyConnection {
  id: string;
  invitingFamilyId: string;
  invitedFamilyId: string;
  status: ConnectionStatus;
  invitingShares: boolean;
  invitedShares: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectedFamilyInfo {
  connectionId: string;
  familyId: string;
  familyName: string;
  profileCount: number;
  totalStars: number;
  constellationsUnlocked: number;
  sharesWithYou: boolean;
  youShareWith: boolean;
}

export interface FamilyEncouragement {
  id: string;
  connectionId: string;
  senderFamilyId: string;
  receiverFamilyId: string;
  message: string;
  emoji?: string;
  isRead: boolean;
  createdAt: string;
}

export const ENCOURAGEMENT_MESSAGES: { message: string; emoji: string }[] = [
  { message: 'استمروا، أنتم رائعون!', emoji: '🌟' },
  { message: 'ما شاء الله، رحلة جميلة!', emoji: '🤲' },
  { message: 'عائلتكم تلهمنا!', emoji: '💫' },
  { message: 'رمضان مبارك من عائلتنا!', emoji: '🌙' },
  { message: 'فخورون بتقدمكم!', emoji: '🏆' },
  { message: 'بارك الله جهودكم!', emoji: '🤍' },
  { message: 'نرسل لكم الحب والدعاء!', emoji: '💕' },
  { message: 'معاً نضيء أكثر!', emoji: '✨' },
];
