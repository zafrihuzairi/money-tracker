'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ArrowLeftRight, BarChart3, MoreHorizontal, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'History', icon: ArrowLeftRight },
  { href: '/income', label: 'Income', icon: Wallet },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'More', icon: MoreHorizontal }
];

// Floating glass pill, safe-area aware, sits above the home indicator.
export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-3 bottom-0 z-40 md:hidden"
      style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="glass mx-auto flex max-w-md items-stretch rounded-[26px] border border-white/60 shadow-soft">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-h-touch flex-1 flex-col items-center justify-center gap-0.5 rounded-[26px] py-2.5 text-[10px] font-medium transition-all duration-200',
                active ? 'text-gold-600' : 'text-black/40'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
