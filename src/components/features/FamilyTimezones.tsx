'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Profile, Family } from '@/types';
import { MapPin, Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-react';

interface FamilyTimezonesProps {
  family: Family;
  profiles: Profile[];
  currentProfileId?: string;
}

interface TimezoneInfo {
  profile: Profile;
  localTime: string;
  timeUntilIftar: string | null;
  timeUntilSuhoor: string | null;
  isDayTime: boolean;
  iftarPassed: boolean;
}

export function FamilyTimezones({ family, profiles, currentProfileId }: FamilyTimezonesProps) {
  const [now, setNow] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get profiles with different timezones
  const profilesWithTimezones = useMemo(() => {
    return profiles.filter((p) => p.timezone && p.id !== currentProfileId);
  }, [profiles, currentProfileId]);

  // Calculate timezone info for each profile
  const timezoneInfos: TimezoneInfo[] = useMemo(() => {
    return profilesWithTimezones.map((profile) => {
      const timezone = profile.timezone || family.timezone;
      const localTime = getLocalTime(now, timezone);
      const hour = parseInt(localTime.split(':')[0]);
      const isDayTime = hour >= 6 && hour < 18;

      // Calculate time until iftar/suhoor in that timezone
      const timeUntilIftar = calculateTimeUntil(now, family.iftarTime, timezone);
      const timeUntilSuhoor = calculateTimeUntil(now, family.suhoorTime, timezone);
      const iftarPassed = timeUntilIftar === null;

      return {
        profile,
        localTime,
        timeUntilIftar,
        timeUntilSuhoor,
        isDayTime,
        iftarPassed,
      };
    });
  }, [profilesWithTimezones, now, family]);

  if (profilesWithTimezones.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        Family Around the World
      </h3>

      <div className="grid gap-3">
        {timezoneInfos.map(({ profile, localTime, timeUntilIftar, isDayTime, iftarPassed }) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'p-3 rounded-xl border transition-colors',
              isDayTime
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-indigo-500/10 border-indigo-500/30'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-lg">
                    {profile.avatar || profile.nickname[0]}
                  </div>
                  {/* Day/night indicator */}
                  <div
                    className={cn(
                      'absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center',
                      isDayTime ? 'bg-amber-400' : 'bg-indigo-500'
                    )}
                  >
                    {isDayTime ? (
                      <Sun className="w-3 h-3 text-white" />
                    ) : (
                      <Moon className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                {/* Info */}
                <div>
                  <p className="font-medium text-white">
                    {profile.nickname}
                    {profile.locationLabel && (
                      <span className="text-slate-400 font-normal text-sm ml-1">
                        in {profile.locationLabel}
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{localTime}</span>
                    {getTimezoneLabel(profile.timezone)}
                  </div>
                </div>
              </div>

              {/* Iftar countdown */}
              {timeUntilIftar && !iftarPassed && (
                <div className="text-right">
                  <p className="text-xs text-slate-400">Iftar in</p>
                  <p className="text-amber-400 font-semibold">{timeUntilIftar}</p>
                </div>
              )}
              {iftarPassed && (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                    <Sunset className="w-3 h-3" />
                    Iftar done
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Compact version for dashboard
export function FamilyTimezonesBadge({
  family,
  profiles,
  currentProfileId,
}: FamilyTimezonesProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const profilesWithTimezones = profiles.filter(
    (p) => p.timezone && p.id !== currentProfileId
  );

  if (profilesWithTimezones.length === 0) return null;

  // Show the one closest to iftar
  const closestToIftar = profilesWithTimezones.reduce<{
    profile: Profile;
    timeUntil: number | null;
  } | null>((closest, profile) => {
    const timeUntil = calculateMinutesUntil(now, family.iftarTime, profile.timezone!);
    if (timeUntil === null) return closest;
    if (!closest || (timeUntil !== null && timeUntil < (closest.timeUntil || Infinity))) {
      return { profile, timeUntil };
    }
    return closest;
  }, null);

  if (!closestToIftar || closestToIftar.timeUntil === null) return null;

  const hours = Math.floor(closestToIftar.timeUntil / 60);
  const mins = closestToIftar.timeUntil % 60;
  const timeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30"
    >
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-xs">
        {closestToIftar.profile.avatar || closestToIftar.profile.nickname[0]}
      </div>
      <span className="text-sm text-amber-200">
        {closestToIftar.profile.nickname}&apos;s iftar in{' '}
        <span className="font-semibold text-amber-400">{timeString}</span>
      </span>
    </motion.div>
  );
}

// Helper functions
function getLocalTime(now: Date, timezone: string): string {
  try {
    return now.toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
}

function getTimezoneLabel(timezone?: string): string {
  if (!timezone) return '';

  // Extract region from timezone string (e.g., "Asia/Dubai" -> "Dubai")
  const parts = timezone.split('/');
  const city = parts[parts.length - 1].replace(/_/g, ' ');
  return city;
}

function calculateTimeUntil(now: Date, targetTime: string, timezone: string): string | null {
  const minutes = calculateMinutesUntil(now, targetTime, timezone);
  if (minutes === null || minutes <= 0) return null;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
}

function calculateMinutesUntil(now: Date, targetTime: string, timezone: string): number | null {
  try {
    // Get current time in the target timezone
    const localTime = now.toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const [currentHour, currentMin] = localTime.split(':').map(Number);
    const [targetHour, targetMin] = targetTime.split(':').map(Number);

    const currentMinutes = currentHour * 60 + currentMin;
    const targetMinutes = targetHour * 60 + targetMin;

    if (targetMinutes <= currentMinutes) {
      return null; // Target time has passed for today
    }

    return targetMinutes - currentMinutes;
  } catch {
    return null;
  }
}
