import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, parseISO, format, isAfter, isBefore, addDays } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Ramadan date utilities
export function getRamadanDay(ramadanStartDate: string, currentDate: Date = new Date()): number {
  const startDate = parseISO(ramadanStartDate);
  const diff = differenceInDays(currentDate, startDate) + 1;
  return Math.max(1, Math.min(30, diff));
}

export function isRamadanActive(ramadanStartDate: string, currentDate: Date = new Date()): boolean {
  const startDate = parseISO(ramadanStartDate);
  const endDate = addDays(startDate, 29); // 30 days total
  return !isBefore(currentDate, startDate) && !isAfter(currentDate, endDate);
}

export function isBeforeRamadan(ramadanStartDate: string, currentDate: Date = new Date()): boolean {
  const startDate = parseISO(ramadanStartDate);
  return isBefore(currentDate, startDate);
}

export function isAfterRamadan(ramadanStartDate: string, currentDate: Date = new Date()): boolean {
  const startDate = parseISO(ramadanStartDate);
  const endDate = addDays(startDate, 29); // 30 days total
  return isAfter(currentDate, endDate);
}

export function getDaysUntilRamadan(ramadanStartDate: string, currentDate: Date = new Date()): number {
  const startDate = parseISO(ramadanStartDate);
  const diff = differenceInDays(startDate, currentDate);
  return Math.max(0, diff);
}

// Get the expected Ramadan start date for the current/upcoming year
export function getUpcomingRamadanDate(): string {
  // Ramadan dates (approximate - users should verify with local moon sighting)
  // 2026: February 17 - March 19
  // 2027: February 7 - March 8
  // 2028: January 27 - February 25
  const now = new Date();
  const year = now.getFullYear();

  const ramadanDates: Record<number, string> = {
    2026: '2026-02-17',
    2027: '2027-02-07',
    2028: '2028-01-27',
    2029: '2029-01-16',
  };

  // Check if this year's Ramadan has passed
  const thisYearDate = ramadanDates[year];
  if (thisYearDate) {
    const thisYearEnd = addDays(parseISO(thisYearDate), 30);
    if (isAfter(now, thisYearEnd)) {
      // This year's Ramadan has ended, use next year
      return ramadanDates[year + 1] || `${year + 1}-02-15`;
    }
    return thisYearDate;
  }

  // Fallback to 2026
  return '2026-02-17';
}

export function getRamadanProgress(ramadanStartDate: string, currentDate: Date = new Date()): number {
  const day = getRamadanDay(ramadanStartDate, currentDate);
  return Math.round((day / 30) * 100);
}

export function formatRamadanDate(ramadanStartDate: string, day: number): string {
  const startDate = parseISO(ramadanStartDate);
  const targetDate = addDays(startDate, day - 1);
  return format(targetDate, 'EEEE, MMMM d');
}

// Time utilities
export function parseTime(timeString: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
}

export function isBeforeTime(currentDate: Date, timeString: string): boolean {
  const { hours, minutes } = parseTime(timeString);
  const currentHours = currentDate.getHours();
  const currentMinutes = currentDate.getMinutes();

  if (currentHours < hours) return true;
  if (currentHours === hours && currentMinutes < minutes) return true;
  return false;
}

export function isAfterTime(currentDate: Date, timeString: string): boolean {
  return !isBeforeTime(currentDate, timeString);
}

export function getTimeUntil(targetTime: string, currentDate: Date = new Date()): string {
  const { hours, minutes } = parseTime(targetTime);
  const target = new Date(currentDate);
  target.setHours(hours, minutes, 0, 0);

  if (target <= currentDate) {
    // Target time is in the past for today, set for tomorrow
    target.setDate(target.getDate() + 1);
  }

  const diffMs = target.getTime() - currentDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`;
  }
  return `${diffMinutes}m`;
}

// Star calculation helpers
export function calculateStarsForFasting(mode: string): number {
  switch (mode) {
    case 'full':
      return 3;
    case 'partial':
      return 2;
    case 'tried':
      return 1;
    default:
      return 0;
  }
}

export function calculateStarsForSuhoor(foodGroups: string[]): number {
  // 1 star for logging, bonus for variety
  if (foodGroups.length === 0) return 0;
  if (foodGroups.length >= 4) return 2;
  return 1;
}

// Avatar helper - get emoji from avatar id
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

// Local storage helpers with SSR safety
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    console.error('Error saving to localStorage');
  }
}

// Generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
