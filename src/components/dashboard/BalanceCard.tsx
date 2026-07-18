import { formatRM } from '@/lib/utils';

export function BalanceCard({ total }: { total: number }) {
  return (
    <div className="rounded-xl2 bg-gradient-to-br from-black to-gold-900 p-8 text-white shadow-soft">
      <p className="text-sm text-white/60">Total Balance</p>
      <p className="mt-2 text-4xl font-bold tracking-tight">{formatRM(total)}</p>
    </div>
  );
}
