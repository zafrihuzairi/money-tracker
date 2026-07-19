'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { formatRM } from '@/lib/utils';

export interface CategoryChartRow {
  label: string;
  income: number;
  expense: number;
}

/**
 * Presentation-only chart, reused across the account detail page and the
 * bucket (Daily/Outlay/Saving/Liability) dashboards. Same color system as
 * ReportView so the whole app reads as one consistent White–Black–Gold
 * theme: gold for income, dark gold for expense (readable in Dark Mode).
 */
export function CategoryBarChart({ rows }: { rows: CategoryChartRow[] }) {
  if (rows.length === 0) {
    return <p className="py-6 text-center text-sm text-black/30">No transactions yet.</p>;
  }

  return (
    <div className="glass h-64 w-full rounded-2xl p-3 sm:h-72 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ left: -16, right: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="label" fontSize={11} tickMargin={8} />
          <YAxis fontSize={11} width={48} />
          <Tooltip formatter={(v: number) => formatRM(v)} />
          <Bar dataKey="income" fill="#c6902f" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="#6e4820" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
