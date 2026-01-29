'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, StarCounter } from '@/components/ui';
import { useFamilyStore } from '@/store/familyStore';
import { Menu, X, Settings, LogOut, Moon, Users, Heart } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { family, profiles, activeProfileId, getTotalFamilyStars, incomingRequests, unreadEncouragementCount } = useFamilyStore();

  const connectionsBadge = (incomingRequests?.length || 0) + (unreadEncouragementCount || 0);

  const activeProfile = profiles.find(p => p.id === activeProfileId);
  const totalStars = getTotalFamilyStars();

  return (
    <header className="sticky top-0 z-40 bg-purple-900/80 backdrop-blur-lg border-b border-purple-500/30 shadow-lg">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/family" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="MiniRamadan"
              width={44}
              height={44}
              className="rounded-xl"
            />
            <span className="font-bold text-white text-lg hidden sm:block">
              ميني<span className="text-amber-400">رمضان</span>
            </span>
          </Link>

          {/* Center - Star count */}
          {family && (
            <div className="hidden sm:block">
              <StarCounter count={totalStars} size="sm" />
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Connections icon */}
            <Link
              href="/connections"
              className="relative p-2 rounded-lg text-pink-400 hover:text-pink-300 hover:bg-pink-500/10 transition-colors"
              title="روابط العائلة"
            >
              <Heart className="w-5 h-5" />
              {connectionsBadge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {connectionsBadge > 9 ? '9+' : connectionsBadge}
                </span>
              )}
            </Link>

            {/* Moon icon - quick link to Night Sky */}
            <Link
              href="/sky"
              className="p-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
              title="سماء العائلة"
            >
              <Moon className="w-5 h-5" />
            </Link>

            {activeProfile && (
              <Link href="/settings" className="hover:opacity-80 transition-opacity">
                <Avatar
                  avatarId={activeProfile.avatar}
                  size="sm"
                  isActive
                />
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-purple-500/30 bg-purple-900/95"
          >
            <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
              <Link
                href="/family"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <Users className="w-5 h-5" />
                <span>لوحة العائلة</span>
              </Link>

              <Link
                href="/sky"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <Moon className="w-5 h-5" />
                <span>سماء الليل</span>
              </Link>

              <Link
                href="/connections"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <Heart className="w-5 h-5 text-pink-400" />
                <span>روابط العائلة</span>
                {connectionsBadge > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full">
                    {connectionsBadge}
                  </span>
                )}
              </Link>

              <Link
                href="/messages"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <Moon className="w-5 h-5" />
                <span>الرسائل</span>
              </Link>

              <Link
                href="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <Settings className="w-5 h-5" />
                <span>الإعدادات</span>
              </Link>

              <hr className="border-slate-800" />

              <button
                onClick={() => {
                  // Handle logout
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 transition-colors text-red-400 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
