import { formatRM } from '@/lib/utils';

export function BalanceCard({ total }: { total: number }) {
  return (
    <div className="glass rounded-[28px] border border-white/10 bg-gradient-to-br from-black via-ink-900 to-gold-900 p-6 text-white shadow-soft sm:p-8">
      <p className="text-sm text-white/60">Total Balance</p>
      <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{formatRM(total)}</p>
    </div>
  );
}
