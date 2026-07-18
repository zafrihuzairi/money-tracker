import { getCurrentUserId } from '@/lib/utils';
import { liabilityRepository } from '@/repositories/liability.repository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatRM } from '@/lib/utils';
import { LiabilityForm } from '@/components/liabilities/LiabilityForm';

export const dynamic = 'force-dynamic';

export default async function LiabilitiesPage() {
  const userId = await getCurrentUserId();
  const liabilities = await liabilityRepository.findAllByUser(userId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Liabilities</h1>
        <p className="text-sm text-black/40">Debts funded automatically from the Job income Liability bucket</p>
      </header>

      <Card><CardContent className="pt-6"><LiabilityForm /></CardContent></Card>

      <div className="grid gap-4 md:grid-cols-2">
        {liabilities.map((l) => {
          const target = Number(l.targetAmount);
          const paid = Number(l.currentPaid);
          const pct = target > 0 ? (paid / target) * 100 : 0;
          return (
            <Card key={l.id}>
              <CardHeader><CardTitle>{l.name}</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-2 flex justify-between text-sm">
                  <span>Target: {formatRM(target)}</span>
                  <span>Paid: {formatRM(paid)}</span>
                </div>
                <Progress value={pct} />
                <p className="mt-2 text-xs text-black/40">
                  {pct.toFixed(1)}% · Remaining {formatRM(Math.max(0, target - paid))}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
