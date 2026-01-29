/**
 * Ramadan Date Utilities
 *
 * Helper functions for calculating Ramadan dates and countdown
 *
 * IMPORTANT: Ramadan dates vary based on moon sighting!
 * - Different communities may start on different days
 * - Some follow local moon sighting, others follow Saudi Arabia, etc.
 * - Families can set their own confirmed start date
 */

// Expected Ramadan dates (astronomical predictions)
// Actual dates depend on moon sighting and may vary by ±1-2 days
const EXPECTED_RAMADAN_DATES: Record<number, { earliest: string; expected: string; latest: string }> = {
  // Ramadan 2026: Expected to begin evening of Feb 27 (1st fast Feb 28)
  // Could be Feb 28 or Mar 1 depending on moon sighting
  2026: { earliest: '2026-02-28', expected: '2026-02-28', latest: '2026-03-01' },
  // Ramadan 2027: Expected mid-February
  2027: { earliest: '2027-02-16', expected: '2027-02-17', latest: '2027-02-18' },
  // Ramadan 2028: Expected early February
  2028: { earliest: '2028-02-05', expected: '2028-02-06', latest: '2028-02-07' },
};

export interface RamadanDates {
  startDate: Date;
  endDate: Date;
  year: number;
  isConfirmed: boolean;
}

export interface CountdownInfo {
  isBeforeRamadan: boolean;
  isDuringRamadan: boolean;
  isAfterRamadan: boolean;
  daysUntilRamadan: number;
  hoursUntilRamadan: number;
  minutesUntilRamadan: number;
  secondsUntilRamadan: number;
  currentRamadanDay: number;
  daysRemaining: number;
  ramadanYear: number;
  // For moon sighting confirmation
  isInMoonSightingWindow: boolean; // True when 0-2 days before expected date
  needsConfirmation: boolean; // True if date not yet confirmed by family
  expectedDate: string;
  earliestDate: string;
  latestDate: string;
}

/**
 * Get expected Ramadan dates for a given year
 */
export function getExpectedRamadanDates(year: number): { earliest: string; expected: string; latest: string } {
  return EXPECTED_RAMADAN_DATES[year] || EXPECTED_RAMADAN_DATES[2026];
}

/**
 * Get Ramadan dates for a given year
 */
export function getRamadanDates(year: number, customStartDate?: string): RamadanDates {
  const expectedDates = getExpectedRamadanDates(year);
  const startDateStr = customStartDate || expectedDates.expected;
  const isConfirmed = !!customStartDate;

  const startDate = new Date(startDateStr + 'T00:00:00');
  // Ramadan is 29 or 30 days, we'll use 30 for calculation
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 29);

  return {
    startDate,
    endDate,
    year,
    isConfirmed,
  };
}

/**
 * Check if we're in the moon sighting window (0-2 days before expected Ramadan)
 */
export function isInMoonSightingWindow(ramadanStartDate: string): boolean {
  const now = new Date();
  const startDate = new Date(ramadanStartDate + 'T00:00:00');
  const diffMs = startDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // Moon sighting window: 0-2 days before the expected/set date
  return diffDays >= 0 && diffDays <= 2;
}

/**
 * Get possible start dates for moon sighting confirmation
 * Returns dates user can choose from when confirming Ramadan start
 */
export function getPossibleStartDates(expectedDate: string): { date: string; label: string }[] {
  const expected = new Date(expectedDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  const formatLabel = (d: Date) => {
    const dayDiff = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff === 0) return 'Today';
    if (dayDiff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const options: { date: string; label: string }[] = [];

  // Add today if it's on or after the earliest possible date
  if (today >= new Date(expectedDate + 'T00:00:00')) {
    options.push({ date: formatDate(today), label: `Ramadan started ${formatLabel(today)}` });
  }

  // Add tomorrow
  options.push({ date: formatDate(tomorrow), label: `Ramadan starts ${formatLabel(tomorrow)}` });

  // Add day after if within reasonable range
  if (dayAfter <= new Date(expected.getTime() + 2 * 24 * 60 * 60 * 1000)) {
    options.push({ date: formatDate(dayAfter), label: `Ramadan starts ${formatLabel(dayAfter)}` });
  }

  return options;
}

/**
 * Get dates for retroactive adjustment (if user missed setting the start date)
 * Allows selecting from recent dates
 */
export function getRetroactiveStartDates(expectedDate: string): { date: string; label: string }[] {
  const expected = new Date(expectedDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const options: { date: string; label: string }[] = [];

  // Allow selecting from 3 days ago up to today
  for (let i = 3; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Only include dates that are reasonable (around expected date)
    const daysDiff = Math.round((date.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff >= -1 && daysDiff <= 2) {
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : `${i} days ago`;
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      options.push({
        date: formatDate(date),
        label: `${dateStr} (${dayLabel})`
      });
    }
  }

  return options;
}

/**
 * Get countdown information relative to Ramadan
 */
export function getCountdownInfo(
  ramadanStartDate: string,
  isDateConfirmed: boolean = false
): CountdownInfo {
  const now = new Date();
  const startDate = new Date(ramadanStartDate + 'T00:00:00');
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 29);

  const ramadanYear = startDate.getFullYear();
  const expectedDates = getExpectedRamadanDates(ramadanYear);

  // Calculate time difference
  const diffMs = startDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  const isBeforeRamadan = now < startDate;
  const isAfterRamadan = now > endDate;
  const isDuringRamadan = !isBeforeRamadan && !isAfterRamadan;

  // Calculate current Ramadan day (1-30)
  let currentRamadanDay = 0;
  if (isDuringRamadan) {
    const daysDiff = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    currentRamadanDay = daysDiff + 1;
  }

  // Days remaining in Ramadan
  let daysRemaining = 0;
  if (isDuringRamadan) {
    daysRemaining = 30 - currentRamadanDay;
  }

  // Check if we're in moon sighting window (0-2 days before expected)
  const isInMoonSightingWindow = isBeforeRamadan && diffDays <= 2 && diffDays >= 0;

  // Needs confirmation if in window and date not yet confirmed by user
  const needsConfirmation = isInMoonSightingWindow && !isDateConfirmed;

  return {
    isBeforeRamadan,
    isDuringRamadan,
    isAfterRamadan,
    daysUntilRamadan: Math.max(0, diffDays),
    hoursUntilRamadan: Math.max(0, diffHours),
    minutesUntilRamadan: Math.max(0, diffMinutes),
    secondsUntilRamadan: Math.max(0, diffSeconds),
    currentRamadanDay,
    daysRemaining,
    ramadanYear,
    isInMoonSightingWindow,
    needsConfirmation,
    expectedDate: expectedDates.expected,
    earliestDate: expectedDates.earliest,
    latestDate: expectedDates.latest,
  };
}

/**
 * Get a preparation tip based on days until Ramadan
 */
export function getPreparationTip(daysUntil: number): { tip: string; category: string } {
  const tips = [
    // 30+ days out
    { minDays: 30, tip: "Start talking to your children about what Ramadan means", category: "learning" },
    { minDays: 28, tip: "Begin adjusting sleep schedules for suhoor", category: "planning" },
    { minDays: 25, tip: "Plan your Ramadan decorations with the family", category: "decorations" },
    { minDays: 22, tip: "Research age-appropriate fasting goals for your children", category: "planning" },
    { minDays: 20, tip: "Start a countdown calendar craft project", category: "decorations" },
    { minDays: 18, tip: "Practice the suhoor and iftar duas together", category: "learning" },
    { minDays: 15, tip: "Plan your iftar menu for the first week", category: "planning" },
    { minDays: 12, tip: "Set up your family's profiles in MiniRamadan", category: "planning" },
    { minDays: 10, tip: "Buy dates and special Ramadan treats", category: "shopping" },
    { minDays: 8, tip: "Try a practice fast with the kids (even just until lunch)", category: "spiritual" },
    { minDays: 6, tip: "Hang up your Ramadan decorations", category: "decorations" },
    { minDays: 4, tip: "Set individual Ramadan goals as a family", category: "spiritual" },
    { minDays: 3, tip: "Prepare your Ramadan corner or special space", category: "decorations" },
    { minDays: 2, tip: "Do a final grocery shop for suhoor essentials", category: "shopping" },
    { minDays: 1, tip: "Get to bed early - tomorrow begins your blessed journey!", category: "spiritual" },
    { minDays: 0, tip: "Ramadan Mubarak! Your journey begins today", category: "spiritual" },
  ];

  // Find the appropriate tip
  for (const t of tips) {
    if (daysUntil >= t.minDays) {
      return { tip: t.tip, category: t.category };
    }
  }

  return tips[tips.length - 1];
}

/**
 * Format countdown for display
 */
export function formatCountdown(info: CountdownInfo): string {
  if (info.isDuringRamadan) {
    return `Day ${info.currentRamadanDay} of Ramadan`;
  }

  if (info.isAfterRamadan) {
    return 'Ramadan has ended - Eid Mubarak!';
  }

  if (info.daysUntilRamadan === 0) {
    return `${info.hoursUntilRamadan}h ${info.minutesUntilRamadan}m until Ramadan`;
  }

  if (info.daysUntilRamadan === 1) {
    return 'Ramadan starts tomorrow!';
  }

  return `${info.daysUntilRamadan} days until Ramadan`;
}
