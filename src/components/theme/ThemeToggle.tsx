'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="glass inline-flex rounded-2xl border border-black/10 p-1 dark:border-white/10">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              'flex min-h-touch items-center gap-2 rounded-xl px-4 text-sm font-medium transition-all duration-200',
              active
                ? 'bg-gradient-to-b from-gold-400 to-gold-600 text-white shadow-[0_6px_16px_rgba(198,144,47,0.35)]'
                : 'text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5'
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
