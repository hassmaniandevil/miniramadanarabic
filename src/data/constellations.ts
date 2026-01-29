import { ConstellationName, ProfileType } from '@/types';

export interface ConstellationData {
  name: ConstellationName;
  displayName: string;
  arabicName: string;
  arabicScript: string;
  description: string;
  starsRequired: number;
  unlockMessage: string;
  color: string;
  // SVG path for the constellation shape (centered at 0,0, scaled to ~100 units)
  shape: {
    path: string;
    width: number;
    height: number;
  };
  // Star positions that form this constellation (relative to shape center)
  starPoints: { x: number; y: number }[];
}

export const constellations: ConstellationData[] = [
  {
    name: 'patience',
    displayName: 'الصبر',
    arabicName: 'Sabr',
    arabicScript: 'صبر',
    description: 'بُرج الذين ينتظرون بأناة وجمال',
    starsRequired: 15, // First milestone
    unlockMessage: 'أظهرت عائلتكم صبراً جميلاً معاً!',
    color: '#60A5FA', // blue
    shape: {
      // Hourglass shape - symbol of time and patience
      path: 'M-25,-40 L25,-40 L5,0 L25,40 L-25,40 L-5,0 Z',
      width: 50,
      height: 80
    },
    starPoints: [
      { x: -25, y: -40 }, { x: 25, y: -40 }, { x: 0, y: -40 },
      { x: 0, y: 0 },
      { x: -25, y: 40 }, { x: 25, y: 40 }, { x: 0, y: 40 }
    ]
  },
  {
    name: 'generosity',
    displayName: 'الكرم',
    arabicName: 'Karam',
    arabicScript: 'كرم',
    description: 'بُرج الذين يعطون بسخاء',
    starsRequired: 35, // 15 + 20
    unlockMessage: 'عائلتكم تتميز بروح الكرم!',
    color: '#F59E0B', // amber
    shape: {
      // Open hands giving - simplified as a radiating star/gift
      path: 'M0,-40 L10,-10 L40,-10 L15,10 L25,40 L0,20 L-25,40 L-15,10 L-40,-10 L-10,-10 Z',
      width: 80,
      height: 80
    },
    starPoints: [
      { x: 0, y: -40 }, { x: 10, y: -10 }, { x: 40, y: -10 },
      { x: 15, y: 10 }, { x: 25, y: 40 }, { x: 0, y: 20 },
      { x: -25, y: 40 }, { x: -15, y: 10 }, { x: -40, y: -10 }, { x: -10, y: -10 }
    ]
  },
  {
    name: 'courage',
    displayName: 'الشجاعة',
    arabicName: "Shuja'a",
    arabicScript: 'شجاعة',
    description: 'بُرج الذين يحاولون حتى عندما يكون الأمر صعباً',
    starsRequired: 60, // 35 + 25
    unlockMessage: 'عائلتكم شجاعة وقوية!',
    color: '#EF4444', // red
    shape: {
      // Lion/shield shape - symbol of courage
      path: 'M0,-35 L30,-20 L35,10 L20,35 L0,40 L-20,35 L-35,10 L-30,-20 Z',
      width: 70,
      height: 75
    },
    starPoints: [
      { x: 0, y: -35 }, { x: 30, y: -20 }, { x: 35, y: 10 },
      { x: 20, y: 35 }, { x: 0, y: 40 }, { x: -20, y: 35 },
      { x: -35, y: 10 }, { x: -30, y: -20 }
    ]
  },
  {
    name: 'forgiveness',
    displayName: 'المغفرة',
    arabicName: 'Maghfira',
    arabicScript: 'مغفرة',
    description: 'بُرج الذين يسامحون بحب',
    starsRequired: 90, // 60 + 30
    unlockMessage: 'عائلتكم تعرف قوة المسامحة!',
    color: '#A78BFA', // violet
    shape: {
      // Dove/bird shape - symbol of peace and forgiveness
      path: 'M-40,0 Q-20,-30 0,-20 Q20,-30 40,0 Q20,10 0,5 Q-20,10 -40,0 M0,-20 L0,-35 M-15,-5 L-35,-15 M15,-5 L35,-15',
      width: 80,
      height: 55
    },
    starPoints: [
      { x: -40, y: 0 }, { x: -20, y: -15 }, { x: 0, y: -20 },
      { x: 20, y: -15 }, { x: 40, y: 0 }, { x: 0, y: 5 },
      { x: 0, y: -35 }, { x: -35, y: -15 }, { x: 35, y: -15 }
    ]
  },
  {
    name: 'gratitude',
    displayName: 'الشكر',
    arabicName: 'Shukr',
    arabicScript: 'شكر',
    description: 'بُرج الذين يقولون شكراً',
    starsRequired: 125, // 90 + 35
    unlockMessage: 'قلوب عائلتكم مليئة بالامتنان!',
    color: '#10B981', // emerald
    shape: {
      // Flower shape - blossoming gratitude
      path: 'M0,-35 Q15,-25 15,-10 Q30,-15 35,0 Q30,15 15,10 Q15,25 0,35 Q-15,25 -15,10 Q-30,15 -35,0 Q-30,-15 -15,-10 Q-15,-25 0,-35',
      width: 70,
      height: 70
    },
    starPoints: [
      { x: 0, y: -35 }, { x: 15, y: -10 }, { x: 35, y: 0 },
      { x: 15, y: 10 }, { x: 0, y: 35 }, { x: -15, y: 10 },
      { x: -35, y: 0 }, { x: -15, y: -10 }, { x: 0, y: 0 }
    ]
  },
  {
    name: 'mercy',
    displayName: 'الرحمة',
    arabicName: 'Rahma',
    arabicScript: 'رحمة',
    description: 'بُرج الذين يُظهرون الرأفة',
    starsRequired: 165, // 125 + 40
    unlockMessage: 'عائلتكم تفيض بالرحمة!',
    color: '#EC4899', // pink
    shape: {
      // Heart shape - symbol of love and mercy
      path: 'M0,35 C-50,10 -50,-30 -25,-35 C0,-40 0,-15 0,-15 C0,-15 0,-40 25,-35 C50,-30 50,10 0,35',
      width: 70,
      height: 70
    },
    starPoints: [
      { x: 0, y: 35 }, { x: -25, y: 15 }, { x: -35, y: -10 },
      { x: -25, y: -30 }, { x: 0, y: -15 }, { x: 25, y: -30 },
      { x: 35, y: -10 }, { x: 25, y: 15 }
    ]
  },
  {
    name: 'kindness',
    displayName: 'اللطف',
    arabicName: 'Lutf',
    arabicScript: 'لطف',
    description: 'بُرج الذين يختارون أن يكونوا لطفاء',
    starsRequired: 210, // 165 + 45
    unlockMessage: 'عائلتكم تنشر اللطف في كل مكان!',
    color: '#14B8A6', // teal
    shape: {
      // Gentle wave/helping hand shape
      path: 'M-40,10 Q-30,-20 -15,-15 Q0,-10 0,0 Q0,-10 15,-15 Q30,-20 40,10 L30,20 Q15,0 0,10 Q-15,0 -30,20 Z',
      width: 80,
      height: 50
    },
    starPoints: [
      { x: -40, y: 10 }, { x: -25, y: -10 }, { x: -15, y: -15 },
      { x: 0, y: 0 }, { x: 15, y: -15 }, { x: 25, y: -10 },
      { x: 40, y: 10 }, { x: 0, y: 10 }
    ]
  },
  {
    name: 'hope',
    displayName: 'الأمل',
    arabicName: 'Amal',
    arabicScript: 'أمل',
    description: 'بُرج الذين ينظرون نحو النور',
    starsRequired: 260, // 210 + 50
    unlockMessage: 'عائلتكم تُشرق بالأمل!',
    color: '#FBBF24', // yellow
    shape: {
      // Crescent moon with star - symbol of Islamic hope
      path: 'M20,-30 Q-20,-30 -20,0 Q-20,30 20,30 Q0,20 0,0 Q0,-20 20,-30 M30,-5 L35,5 L45,5 L37,12 L40,22 L30,15 L20,22 L23,12 L15,5 L25,5 Z',
      width: 65,
      height: 60
    },
    starPoints: [
      { x: 20, y: -30 }, { x: -10, y: -20 }, { x: -20, y: 0 },
      { x: -10, y: 20 }, { x: 20, y: 30 }, { x: 10, y: 0 },
      { x: 30, y: -5 }, { x: 45, y: 5 }, { x: 30, y: 15 }
    ]
  },
  {
    name: 'unity',
    displayName: 'الاتحاد',
    arabicName: 'Ittihad',
    arabicScript: 'اتحاد',
    description: 'بُرج الذين يُشعّون معاً كالنور الواحد',
    starsRequired: 300, // Final constellation - requires everyone!
    unlockMessage: 'عائلتكم حققت الاتحاد الحقيقي - تُشعّون معاً كالنور الواحد!',
    color: '#F472B6', // rose/pink - representing family love
    shape: {
      // Circle of connected stars - symbol of family unity
      path: 'M0,-35 L12,-12 L35,-12 L18,5 L25,30 L0,15 L-25,30 L-18,5 L-35,-12 L-12,-12 Z M0,-20 A20,20 0 1,1 0,20 A20,20 0 1,1 0,-20',
      width: 70,
      height: 70
    },
    starPoints: [
      { x: 0, y: -35 }, { x: 35, y: -12 }, { x: 25, y: 30 },
      { x: -25, y: 30 }, { x: -35, y: -12 }, // Outer points
      { x: 0, y: -20 }, { x: 19, y: 6 }, { x: 12, y: 20 },
      { x: -12, y: 20 }, { x: -19, y: 6 } // Inner circle points
    ]
  }
];

export function getConstellationByName(name: ConstellationName): ConstellationData | undefined {
  return constellations.find(c => c.name === name);
}

export function getNextConstellation(totalStars: number): ConstellationData | undefined {
  return constellations.find(c => c.starsRequired > totalStars);
}

export function getUnlockedConstellations(totalStars: number): ConstellationData[] {
  return constellations.filter(c => c.starsRequired <= totalStars);
}

// ============================================
// CONSTELLATION SCALING BY FAMILY COMPOSITION
// ============================================

export interface ScaledConstellationData extends ConstellationData {
  scaledStarsRequired: number;
}

export interface FamilyComposition {
  adults: number;
  children: number;
  littleStars: number;
}

/**
 * Maximum stars each profile type can earn per day.
 * Adults/Children: fasting(3) + suhoor(2) + wonder(1) + mission(1) + checkin(1) = 8
 * Little Stars: helped(1) + quran(1) + kindness(1) + dua(1) + story(1) + fasting_helper(1) = 6
 */
export const MAX_STARS_PER_DAY: Record<ProfileType, number> = {
  adult: 8,
  child: 8,
  little_star: 6,
};

/**
 * Number of days in Ramadan
 */
const RAMADAN_DAYS = 30;

/**
 * Constellation thresholds as percentages of total possible stars.
 * Hope (the final constellation) requires ~85% of all possible stars,
 * ensuring it's achievable but requires consistent effort from everyone.
 */
const CONSTELLATION_PERCENTAGES: Record<ConstellationName, number> = {
  patience: 0.06,      // ~6% - early win to encourage the family
  generosity: 0.13,    // ~13%
  courage: 0.23,       // ~23%
  forgiveness: 0.35,   // ~35%
  gratitude: 0.48,     // ~48% - halfway point
  mercy: 0.63,         // ~63%
  kindness: 0.77,      // ~77%
  hope: 0.85,          // ~85%
  unity: 0.95,         // ~95% - the ultimate achievement, requires everyone together!
};

/**
 * Rounds a value to the nearest multiple of 5.
 */
function roundToNearest5(value: number): number {
  return Math.round(value / 5) * 5;
}

/**
 * Calculate family composition from profile types.
 */
export function getFamilyComposition(profileTypes: ProfileType[]): FamilyComposition {
  return {
    adults: profileTypes.filter(t => t === 'adult').length,
    children: profileTypes.filter(t => t === 'child').length,
    littleStars: profileTypes.filter(t => t === 'little_star').length,
  };
}

/**
 * Calculate the maximum possible stars a family can earn over Ramadan.
 */
export function getMaxPossibleStars(composition: FamilyComposition): number {
  const { adults, children, littleStars } = composition;
  return (
    adults * MAX_STARS_PER_DAY.adult * RAMADAN_DAYS +
    children * MAX_STARS_PER_DAY.child * RAMADAN_DAYS +
    littleStars * MAX_STARS_PER_DAY.little_star * RAMADAN_DAYS
  );
}

/**
 * Calculate the maximum possible stars from a list of profile types.
 */
export function getMaxPossibleStarsFromProfiles(profileTypes: ProfileType[]): number {
  return getMaxPossibleStars(getFamilyComposition(profileTypes));
}

/**
 * Returns scaled star thresholds for each constellation based on family composition.
 * Thresholds are calculated as percentages of total possible stars.
 * Minimum threshold is 5 stars to ensure meaningful progress.
 */
export function getScaledThresholds(profileTypes: ProfileType[]): number[] {
  const maxPossible = getMaxPossibleStarsFromProfiles(profileTypes);

  // Fallback for empty family (shouldn't happen, but safety first)
  if (maxPossible === 0) {
    return constellations.map(c => c.starsRequired);
  }

  return constellations.map(c => {
    const percentage = CONSTELLATION_PERCENTAGES[c.name];
    const scaled = maxPossible * percentage;
    // Minimum 5 stars, rounded to nearest 5
    return Math.max(5, roundToNearest5(scaled));
  });
}

/**
 * Returns constellation data with an additional `scaledStarsRequired` field.
 */
export function getScaledConstellations(profileTypes: ProfileType[]): ScaledConstellationData[] {
  const thresholds = getScaledThresholds(profileTypes);
  return constellations.map((c, i) => ({
    ...c,
    scaledStarsRequired: thresholds[i],
  }));
}

/**
 * Returns constellations that have been unlocked given total stars and family composition.
 */
export function getUnlockedConstellationsScaled(totalStars: number, profileTypes: ProfileType[]): ScaledConstellationData[] {
  return getScaledConstellations(profileTypes).filter(c => c.scaledStarsRequired <= totalStars);
}

/**
 * Returns the next constellation to unlock given total stars and family composition.
 */
export function getNextConstellationScaled(totalStars: number, profileTypes: ProfileType[]): ScaledConstellationData | undefined {
  return getScaledConstellations(profileTypes).find(c => c.scaledStarsRequired > totalStars);
}

// ============================================
// LEGACY FUNCTIONS (for backwards compatibility)
// ============================================

/**
 * @deprecated Use getScaledThresholds(profileTypes) instead
 * Legacy function that scales by profile count only (treats all profiles as adults)
 */
export function getScaledThresholdsByCount(numProfiles: number): number[] {
  const profileTypes: ProfileType[] = Array(numProfiles).fill('adult');
  return getScaledThresholds(profileTypes);
}

/**
 * @deprecated Use getScaledConstellations(profileTypes) instead
 */
export function getScaledConstellationsByCount(numProfiles: number): ScaledConstellationData[] {
  const profileTypes: ProfileType[] = Array(numProfiles).fill('adult');
  return getScaledConstellations(profileTypes);
}

/**
 * @deprecated Use getUnlockedConstellationsScaled(totalStars, profileTypes) instead
 */
export function getUnlockedConstellationsScaledByCount(totalStars: number, numProfiles: number): ScaledConstellationData[] {
  const profileTypes: ProfileType[] = Array(numProfiles).fill('adult');
  return getUnlockedConstellationsScaled(totalStars, profileTypes);
}

/**
 * @deprecated Use getNextConstellationScaled(totalStars, profileTypes) instead
 */
export function getNextConstellationScaledByCount(totalStars: number, numProfiles: number): ScaledConstellationData | undefined {
  const profileTypes: ProfileType[] = Array(numProfiles).fill('adult');
  return getNextConstellationScaled(totalStars, profileTypes);
}
