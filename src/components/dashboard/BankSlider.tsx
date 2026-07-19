import { formatRM } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface BankSummary {
  id: string;
  name: string;
  purpose: string | null;
  balance: number;
  monthIn: number;
  monthOut: number;
}

export function BankSlider({ banks }: { banks: BankSummary[] }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">Bank Accounts</h2>
      <div className="momentum-scroll -mx-4 flex gap-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
        {banks.map((bank) => {
          const utilised = bank.monthIn > 0 ? Math.min(100, (bank.monthOut / bank.monthIn) * 100) : 0;
          return (
            <Card key={bank.id} className="min-w-[240px] flex-shrink-0 bg-gradient-to-br from-white/80 to-gold-50/80 sm:min-w-[260px]">
              <CardContent className="pt-6">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-ink-900">{bank.name}</p>
                    <p className="text-xs text-black/40">{bank.purpose}</p>
                  </div>
                </div>
                <p className="mb-3 text-xl font-bold sm:text-2xl">{formatRM(bank.balance)}</p>
                <div className="mb-2 flex justify-between text-xs text-black/50">
                  <span>In: {formatRM(bank.monthIn)}</span>
                  <span>Out: {formatRM(bank.monthOut)}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/5">
                  <div className="h-full rounded-full bg-gold-500 transition-all duration-500" style={{ width: `${utilised}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
