// خيارات الصورة الرمزية للملفات الشخصية
// استخدام رموز تعبيرية بسيطة ومناسبة ثقافياً

export interface Avatar {
  id: string;
  emoji: string;
  name: string;
  forProfileType: ('little_star' | 'child' | 'adult')[];
  isPremium?: boolean;
}

export const avatars: Avatar[] = [
  // ============================================
  // الصور الرمزية المجانية
  // ============================================

  // عامة (جميع أنواع الملفات الشخصية)
  { id: 'moon', emoji: '🌙', name: 'الهلال', forProfileType: ['little_star', 'child', 'adult'] },
  { id: 'star', emoji: '⭐', name: 'النجمة', forProfileType: ['little_star', 'child', 'adult'] },
  { id: 'sparkles', emoji: '✨', name: 'البريق', forProfileType: ['little_star', 'child', 'adult'] },
  { id: 'sun', emoji: '☀️', name: 'الشمس', forProfileType: ['little_star', 'child', 'adult'] },
  { id: 'cloud', emoji: '☁️', name: 'الغيمة', forProfileType: ['little_star', 'child', 'adult'] },
  { id: 'rainbow', emoji: '🌈', name: 'قوس قزح', forProfileType: ['little_star', 'child', 'adult'] },

  // للنجوم الصغيرة
  { id: 'butterfly', emoji: '🦋', name: 'الفراشة', forProfileType: ['little_star', 'child'] },
  { id: 'flower', emoji: '🌸', name: 'الزهرة', forProfileType: ['little_star', 'child'] },
  { id: 'heart', emoji: '💜', name: 'القلب البنفسجي', forProfileType: ['little_star', 'child'] },
  { id: 'bee', emoji: '🐝', name: 'النحلة', forProfileType: ['little_star', 'child'] },
  { id: 'bunny', emoji: '🐰', name: 'الأرنب', forProfileType: ['little_star', 'child'] },
  { id: 'kitten', emoji: '🐱', name: 'القطة', forProfileType: ['little_star', 'child'] },

  // للأطفال
  { id: 'rocket', emoji: '🚀', name: 'الصاروخ', forProfileType: ['child'] },
  { id: 'planet', emoji: '🪐', name: 'الكوكب', forProfileType: ['child'] },
  { id: 'comet', emoji: '☄️', name: 'المذنب', forProfileType: ['child'] },
  { id: 'lantern', emoji: '🏮', name: 'الفانوس', forProfileType: ['child', 'adult'] },
  { id: 'tent', emoji: '⛺', name: 'الخيمة', forProfileType: ['child'] },
  { id: 'compass', emoji: '🧭', name: 'البوصلة', forProfileType: ['child', 'adult'] },
  { id: 'book', emoji: '📖', name: 'الكتاب', forProfileType: ['child', 'adult'] },
  { id: 'leaf', emoji: '🌿', name: 'الورقة', forProfileType: ['child', 'adult'] },

  // للكبار
  { id: 'tree', emoji: '🌳', name: 'الشجرة', forProfileType: ['adult'] },
  { id: 'mountain', emoji: '⛰️', name: 'الجبل', forProfileType: ['adult'] },
  { id: 'ocean', emoji: '🌊', name: 'المحيط', forProfileType: ['adult'] },
  { id: 'dove', emoji: '🕊️', name: 'الحمامة', forProfileType: ['adult'] },
  { id: 'gem', emoji: '💎', name: 'الجوهرة', forProfileType: ['adult'] },

  // ============================================
  // الصور الرمزية المميزة - تُفتح بالاشتراك
  // ============================================

  // مميزة عامة - بثيمة رمضان
  { id: 'mosque', emoji: '🕌', name: 'المسجد', forProfileType: ['little_star', 'child', 'adult'], isPremium: true },
  { id: 'prayer', emoji: '🤲', name: 'يدا الدعاء', forProfileType: ['little_star', 'child', 'adult'], isPremium: true },
  { id: 'dates', emoji: '🌴', name: 'نخلة التمر', forProfileType: ['little_star', 'child', 'adult'], isPremium: true },
  { id: 'kaaba', emoji: '🕋', name: 'الكعبة', forProfileType: ['child', 'adult'], isPremium: true },
  { id: 'crescent_star', emoji: '☪️', name: 'الهلال والنجمة', forProfileType: ['little_star', 'child', 'adult'], isPremium: true },
  { id: 'night_stars', emoji: '🌃', name: 'ليلة نجومية', forProfileType: ['little_star', 'child', 'adult'], isPremium: true },

  // مميزة للنجوم الصغيرة - حيوانات لطيفة
  { id: 'unicorn', emoji: '🦄', name: 'اليونيكورن', forProfileType: ['little_star', 'child'], isPremium: true },
  { id: 'panda', emoji: '🐼', name: 'الباندا', forProfileType: ['little_star', 'child'], isPremium: true },
  { id: 'fox', emoji: '🦊', name: 'الثعلب', forProfileType: ['little_star', 'child'], isPremium: true },
  { id: 'owl', emoji: '🦉', name: 'البومة', forProfileType: ['little_star', 'child'], isPremium: true },
  { id: 'penguin', emoji: '🐧', name: 'البطريق', forProfileType: ['little_star', 'child'], isPremium: true },
  { id: 'koala', emoji: '🐨', name: 'الكوالا', forProfileType: ['little_star', 'child'], isPremium: true },
  { id: 'lion', emoji: '🦁', name: 'الأسد', forProfileType: ['little_star', 'child'], isPremium: true },
  { id: 'dolphin', emoji: '🐬', name: 'الدولفين', forProfileType: ['little_star', 'child'], isPremium: true },

  // مميزة للأطفال - المغامرة والفضاء
  { id: 'astronaut', emoji: '👨‍🚀', name: 'رائد الفضاء', forProfileType: ['child'], isPremium: true },
  { id: 'galaxy', emoji: '🌌', name: 'المجرة', forProfileType: ['child', 'adult'], isPremium: true },
  { id: 'shooting_star', emoji: '🌠', name: 'الشهاب', forProfileType: ['child', 'adult'], isPremium: true },
  { id: 'aurora', emoji: '🌌', name: 'الشفق القطبي', forProfileType: ['child', 'adult'], isPremium: true },
  { id: 'globe', emoji: '🌍', name: 'الأرض', forProfileType: ['child', 'adult'], isPremium: true },
  { id: 'telescope', emoji: '🔭', name: 'التلسكوب', forProfileType: ['child', 'adult'], isPremium: true },

  // مميزة للكبار - أنيقة وروحانية
  { id: 'lotus', emoji: '🪷', name: 'اللوتس', forProfileType: ['adult'], isPremium: true },
  { id: 'peacock', emoji: '🦚', name: 'الطاووس', forProfileType: ['adult'], isPremium: true },
  { id: 'candle', emoji: '🕯️', name: 'الشمعة', forProfileType: ['adult'], isPremium: true },
  { id: 'scroll', emoji: '📜', name: 'المخطوطة', forProfileType: ['adult'], isPremium: true },
  { id: 'prayer_beads', emoji: '📿', name: 'المسبحة', forProfileType: ['adult'], isPremium: true },
  { id: 'crown', emoji: '👑', name: 'التاج', forProfileType: ['adult'], isPremium: true },
  { id: 'rose', emoji: '🌹', name: 'الوردة', forProfileType: ['adult'], isPremium: true },
  { id: 'heart_gold', emoji: '💛', name: 'القلب الذهبي', forProfileType: ['adult'], isPremium: true },
];

export function getAvatarsForProfileType(profileType: 'little_star' | 'child' | 'adult', isPremiumUser: boolean = false): Avatar[] {
  return avatars.filter(avatar => {
    const typeMatch = avatar.forProfileType.includes(profileType);
    // عرض جميع الصور للمشتركين، أو المجانية فقط للمستخدمين العاديين
    const premiumMatch = isPremiumUser || !avatar.isPremium;
    return typeMatch && premiumMatch;
  });
}

export function getAllAvatarsForProfileType(profileType: 'little_star' | 'child' | 'adult'): Avatar[] {
  // إرجاع جميع الصور (بما فيها المميزة) - لعرضها مع أيقونات القفل
  return avatars.filter(avatar => avatar.forProfileType.includes(profileType));
}

export function getAvatarById(id: string): Avatar | undefined {
  return avatars.find(avatar => avatar.id === id);
}

export function getAvatarEmoji(id: string): string {
  const avatar = getAvatarById(id);
  return avatar?.emoji || '⭐';
}

export function isPremiumAvatar(id: string): boolean {
  const avatar = getAvatarById(id);
  return avatar?.isPremium || false;
}
