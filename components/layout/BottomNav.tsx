'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Flame, BookOpen, Grid3X3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/learn', label: 'Learn', Icon: Flame },
  { href: '/vocabulary', label: 'Vocab', Icon: BookOpen },
  { href: '/categories', label: 'Categories', Icon: Grid3X3 },
  { href: '/settings', label: 'Settings', Icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors',
                active ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <Icon
                size={24}
                className={cn(active && 'text-green-500')}
                strokeWidth={active ? 2.5 : 1.8}
              />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
