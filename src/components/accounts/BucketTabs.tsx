'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const BUCKETS = [
  { slug: 'daily', label: 'Daily' },
  { slug: 'outlay', label: 'Outlay' },
  { slug: 'saving', label: 'Saving' },
  { slug: 'liability', label: 'Liability' }
] as const;

/**
 * Segmented control for moving between the Daily → Outlay → Saving →
 * Liability bucket dashboards (Feature 2 navigation requirement).
 */
export function BucketTabs({ active }: { active: (typeof BUCKETS)[number]['slug'] }) {
  return (
    <div className="glass inline-flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-black/10 p-1 sm:w-auto">
      {BUCKETS.map((b) => {
        const isActive = b.slug === active;
        return (
          <Link
            key={b.slug}
            href={`/accounts/type/${b.slug}`}
            className={cn(
              'flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-center text-sm font-medium transition-all duration-200 sm:flex-none',
              isActive
                ? 'bg-gradient-to-b from-black to-ink-900 text-white shadow-md'
                : 'text-black/50 hover:bg-black/5 hover:text-black'
            )}
          >
            {b.label}
          </Link>
        );
      })}
    </div>
  );
}
