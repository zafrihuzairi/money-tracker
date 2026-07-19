'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  // compact page-number list: first, last, current +/-1, with ellipses
  const pages: (number | 'ellipsis')[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
    else if (pages[pages.length - 1] !== 'ellipsis') pages.push('ellipsis');
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row sm:justify-between">
      <p className="text-xs text-black/40 dark:text-white/40">
        Showing {from}–{to} of {total} transactions
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-w-touch px-3"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </Button>
        {pages.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-2 text-black/30 dark:text-white/30">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'min-h-touch min-w-touch rounded-xl px-3 text-sm font-medium transition-all',
                p === page
                  ? 'bg-gradient-to-b from-gold-400 to-gold-600 text-white shadow-[0_6px_16px_rgba(198,144,47,0.3)]'
                  : 'text-black/50 hover:bg-black/5 dark:text-white/50 dark:hover:bg-white/5'
              )}
            >
              {p}
            </button>
          )
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-w-touch px-3"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
}
