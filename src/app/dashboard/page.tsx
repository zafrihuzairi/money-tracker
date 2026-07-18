import { getCurrentUserId } from '@/lib/utils';
import { bankRepository } from '@/repositories/bank.repository';
import { liabilityRepository } from '@/repositories/liability.repository';
import { BalanceCard } from '@/components/dashboard/BalanceCard';
import { BankSlider } from '@/components/dashboard/BankSlider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatRM } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  const [banks, liabilities] = await Promise.all([
    bankRepository.findWithBalance(userId),
    liabilityRepository.findAllByUser(userId)
  ]);

  const totalBalance = banks.reduce((s, b) => s + b.balance, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-black/40">Overview of your money system</p>
      </header>

      <BalanceCard total={totalBalance} />
      <BankSlider banks={banks} />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">Liability Progress</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {liabilities.map((l) => {
            const target = Number(l.targetAmount);
            const paid = Number(l.currentPaid);
            const pct = target > 0 ? (paid / target) * 100 : 0;
            return (
              <Card key={l.id}>
                <CardHeader>
                  <CardTitle>{l.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-black/50">{formatRM(paid)} paid</span>
                    <span className="font-medium">{formatRM(target)} target</span>
                  </div>
                  <Progress value={pct} />
                  <p className="mt-2 text-xs text-black/40">{pct.toFixed(1)}% complete · {formatRM(target - paid)} remaining</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
