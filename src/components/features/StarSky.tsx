'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from '@/components/ui';
import { Profile, ProfileType, Star } from '@/types';
import { getScaledConstellations, ScaledConstellationData } from '@/data/constellations';

interface StarSkyProps {
  profiles: Profile[];
  stars: Star[];
  totalFamilyStars: number;
}

// Constellation positions in a 2x4 grid + 1 centered at bottom
// Unity is the pinnacle achievement, centered at the bottom
const CONSTELLATION_POSITIONS = [
  { x: 100, y: 70 },    // Patience (hourglass)
  { x: 280, y: 70 },    // Generosity (star)
  { x: 100, y: 200 },   // Courage (shield)
  { x: 280, y: 200 },   // Forgiveness (dove)
  { x: 100, y: 330 },   // Gratitude (flower)
  { x: 280, y: 330 },   // Mercy (heart)
  { x: 100, y: 460 },   // Kindness (wave)
  { x: 280, y: 460 },   // Hope (crescent)
  { x: 190, y: 590 },   // Unity (circle) - centered as the ultimate goal
];

export function StarSky({ profiles, stars, totalFamilyStars }: StarSkyProps) {
  const [selectedConstellation, setSelectedConstellation] = useState<ScaledConstellationData | null>(null);

  // Extract profile types for constellation scaling
  const profileTypes: ProfileType[] = useMemo(
    () => profiles.map(p => p.profileType),
    [profiles]
  );

  // Use scaled constellations based on family composition (profile types matter!)
  const scaledConstellations = useMemo(
    () => getScaledConstellations(profileTypes),
    [profileTypes]
  );

  // Generate background stars with deterministic positions
  const backgroundStars = useMemo(() => {
    const bgStars = [];
    for (let i = 0; i < 120; i++) {
      const seed = i * 13.7;
      bgStars.push({
        x: (seed * 7.3) % 380,
        y: (seed * 11.1) % 700,
        r: 0.3 + (seed % 0.8),
        opacity: 0.15 + ((seed * 3.7) % 0.25),
      });
    }
    return bgStars;
  }, []);

  // Profile colors for stars
  const profileColors: Record<string, string> = {};
  profiles.forEach((profile, index) => {
    const colors = ['#FBBF24', '#60A5FA', '#34D399', '#F472B6', '#A78BFA', '#FB923C'];
    profileColors[profile.id] = colors[index % colors.length];
  });

  // Get unlocked constellations using scaled thresholds
  const unlockedConstellations = scaledConstellations.filter(
    (c) => c.scaledStarsRequired <= totalFamilyStars
  );
  const nextConstellation = scaledConstellations.find(
    (c) => c.scaledStarsRequired > totalFamilyStars
  );

  const isUnlocked = (constellation: ScaledConstellationData) =>
    constellation.scaledStarsRequired <= totalFamilyStars;

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/50 max-h-[70vh] overflow-y-auto">
      {/* Night sky background - fixed */}
      <div className="sticky top-0 left-0 right-0 h-full pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-transparent to-transparent" />
      </div>

      {/* Next constellation progress bar - sticky at top */}
      {nextConstellation && (
        <div className="sticky top-0 left-0 right-0 z-20 p-3 bg-gradient-to-b from-slate-900 via-slate-900/95 to-transparent">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">
              Next: <span className="text-white">{nextConstellation.displayName}</span> ({nextConstellation.arabicScript})
            </span>
            <span className="text-amber-400 font-medium">
              {totalFamilyStars}/{nextConstellation.scaledStarsRequired} ⭐
            </span>
          </div>
          <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
              initial={{ width: 0 }}
              animate={{
                width: `${(totalFamilyStars / nextConstellation.scaledStarsRequired) * 100}%`,
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* SVG Sky - sized to fit all 8 constellations */}
      <svg
        width="100%"
        height="700"
        viewBox="0 0 380 700"
        className="relative z-10"
      >
        {/* Gradient definitions */}
        <defs>
          <radialGradient id="moonGradient">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="100%" stopColor="#FCD34D" />
          </radialGradient>

          {/* Glow filters for each constellation color */}
          {scaledConstellations.map((c) => (
            <filter key={`glow-${c.name}`} id={`glow-${c.name}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {/* Background stars (static, dimmer) */}
        {backgroundStars.map((star, i) => (
          <circle
            key={`bg-star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill="white"
            opacity={star.opacity}
          />
        ))}

        {/* Small crescent moon */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <circle cx={340} cy={40} r={18} fill="url(#moonGradient)" />
          <circle cx={348} cy={35} r={14} fill="#0f172a" />
        </motion.g>

        {/* Constellations */}
        {scaledConstellations.map((constellation, index) => {
          const pos = CONSTELLATION_POSITIONS[index];
          const unlocked = isUnlocked(constellation);
          const isNext = nextConstellation?.name === constellation.name;

          return (
            <motion.g
              key={constellation.name}
              transform={`translate(${pos.x}, ${pos.y})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.15 }}
              onClick={() => setSelectedConstellation(unlocked ? constellation : null)}
              className={unlocked ? 'cursor-pointer' : 'cursor-default'}
            >
              {/* Constellation shape outline */}
              <motion.path
                d={constellation.shape.path}
                fill="none"
                stroke={unlocked ? constellation.color : '#475569'}
                strokeWidth={unlocked ? 1.5 : 0.5}
                strokeDasharray={unlocked ? 'none' : '3 3'}
                opacity={unlocked ? 0.6 : 0.2}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: index * 0.15 + 0.3, duration: 1.5, ease: 'easeInOut' }}
              />

              {/* Glowing fill for unlocked constellations */}
              {unlocked && (
                <motion.path
                  d={constellation.shape.path}
                  fill={constellation.color}
                  opacity={0.1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}

              {/* Star points */}
              {constellation.starPoints.map((point, pointIndex) => (
                <motion.circle
                  key={`${constellation.name}-star-${pointIndex}`}
                  cx={point.x}
                  cy={point.y}
                  r={unlocked ? 3 : 1.5}
                  fill={unlocked ? constellation.color : '#64748b'}
                  filter={unlocked ? `url(#glow-${constellation.name})` : undefined}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: unlocked ? 1 : 0.3,
                    scale: unlocked ? [1, 1.3, 1] : 1
                  }}
                  transition={{
                    opacity: { delay: index * 0.15 + pointIndex * 0.05 },
                    scale: { delay: index * 0.15 + pointIndex * 0.05, duration: 2, repeat: Infinity }
                  }}
                />
              ))}

              {/* Constellation name label */}
              <text
                x={0}
                y={55}
                textAnchor="middle"
                className="text-xs font-medium"
                fill={unlocked ? constellation.color : '#64748b'}
                opacity={unlocked ? 1 : 0.5}
              >
                {constellation.displayName}
              </text>
              <text
                x={0}
                y={68}
                textAnchor="middle"
                className="text-[10px]"
                fill={unlocked ? '#94a3b8' : '#475569'}
                opacity={unlocked ? 0.8 : 0.4}
              >
                {constellation.arabicScript}
              </text>

              {/* Lock indicator for locked constellations */}
              {!unlocked && (
                <g transform="translate(0, -50)">
                  <circle cx={0} cy={0} r={10} fill="#1e293b" stroke="#475569" strokeWidth={0.5} />
                  <text x={0} y={4} textAnchor="middle" fill="#64748b" className="text-[8px]">
                    {constellation.scaledStarsRequired}
                  </text>
                </g>
              )}

              {/* "Next" indicator */}
              {isNext && (
                <motion.g
                  transform="translate(0, -50)"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <circle cx={0} cy={0} r={12} fill="none" stroke="#fbbf24" strokeWidth={1} />
                  <text x={0} y={4} textAnchor="middle" fill="#fbbf24" className="text-[8px] font-bold">
                    {constellation.scaledStarsRequired}
                  </text>
                </motion.g>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* Profile legend at bottom - sticky */}
      <div className="sticky bottom-0 left-0 right-0 flex items-center justify-between z-20 p-3 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent">
        <div className="flex -space-x-2">
          {profiles.map((profile) => (
            <div key={profile.id} className="relative">
              <Avatar avatarId={profile.avatar} size="sm" />
              <div
                className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900"
                style={{ backgroundColor: profileColors[profile.id] }}
              />
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">مرر للاستكشاف</span>
          <div className="text-right bg-slate-900/60 px-3 py-1 rounded-full backdrop-blur-sm">
            <span className="text-amber-400 font-bold">{totalFamilyStars}</span>
            <span className="text-xs text-slate-400 mr-1">نجمة</span>
          </div>
        </div>
      </div>

      {/* Selected constellation detail modal */}
      {selectedConstellation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm z-30 flex items-center justify-center p-4"
          onClick={() => setSelectedConstellation(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800/90 rounded-2xl p-6 max-w-xs text-center border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Constellation shape */}
            <svg width="120" height="120" viewBox="-50 -50 100 100" className="mx-auto mb-4">
              <motion.path
                d={selectedConstellation.shape.path}
                fill={selectedConstellation.color}
                opacity={0.2}
                stroke={selectedConstellation.color}
                strokeWidth={2}
              />
              {selectedConstellation.starPoints.map((point, i) => (
                <motion.circle
                  key={i}
                  cx={point.x}
                  cy={point.y}
                  r={4}
                  fill={selectedConstellation.color}
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ delay: i * 0.1, duration: 1.5, repeat: Infinity }}
                />
              ))}
            </svg>

            <h3 className="text-xl font-bold text-white mb-1">
              {selectedConstellation.displayName}
            </h3>
            <p className="text-2xl mb-2" style={{ color: selectedConstellation.color }}>
              {selectedConstellation.arabicScript}
            </p>
            <p className="text-sm text-slate-300 mb-4">
              {selectedConstellation.description}
            </p>
            <p className="text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg">
              {selectedConstellation.unlockMessage}
            </p>

            <button
              onClick={() => setSelectedConstellation(null)}
              className="mt-4 text-sm text-slate-400 hover:text-white transition-colors"
            >
              انقر في أي مكان للإغلاق
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
