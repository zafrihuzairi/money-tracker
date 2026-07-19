'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Landmark,
  Building2,
  Users,
  ShieldAlert,
  BarChart3,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/income', label: 'Income', icon: Wallet },
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/banks', label: 'Banks', icon: Building2 },
  { href: '/people', label: 'People', icon: Users },
  { href: '/liabilities', label: 'Liabilities', icon: ShieldAlert },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: SettingsIcon }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dscreen w-64 shrink-0 py-6 pl-4 md:block">
      <div className="glass flex h-full flex-col rounded-[28px] border border-white/60 px-4 py-6 shadow-soft">
        <div className="mb-8 px-2">
          <div className="text-lg font-bold tracking-tight">
            Money<span className="text-gold-500">Tracker</span>
          </div>
          <p className="text-xs text-black/40">Personal Finance System</p>
        </div>
        <nav className="space-y-1 overflow-y-auto">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex min-h-touch items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  active
                    ? 'bg-gradient-to-b from-black to-ink-900 text-white shadow-md'
                    : 'text-black/60 hover:bg-black/5 hover:text-black'
                )}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
