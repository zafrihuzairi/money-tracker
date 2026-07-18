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
    <aside className="hidden w-64 shrink-0 border-r border-black/5 bg-white/70 px-4 py-6 backdrop-blur-xs md:block">
      <div className="mb-8 px-2">
        <div className="text-lg font-bold tracking-tight">
          Money<span className="text-gold-500">Tracker</span>
        </div>
        <p className="text-xs text-black/40">Personal Finance System</p>
      </div>
      <nav className="space-y-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                active ? 'bg-black text-white' : 'text-black/60 hover:bg-black/5 hover:text-black'
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
