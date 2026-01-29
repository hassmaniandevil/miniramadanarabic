'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, Star, Image, MessageCircle, User } from 'lucide-react';

const navItems = [
  { href: '/family', icon: Home, label: 'الرئيسية' },
  { href: '/memories', icon: Image, label: 'الذكريات' },
  { href: '/sky', icon: Star, label: 'السماء' },
  { href: '/messages', icon: MessageCircle, label: 'الرسائل' },
  { href: '/settings', icon: User, label: 'الإعدادات' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-purple-900/90 backdrop-blur-lg border-t border-purple-500/30 shadow-2xl sm:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-colors',
                isActive
                  ? 'text-yellow-400'
                  : 'text-purple-300 hover:text-white'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive && 'fill-amber-400/20')} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
