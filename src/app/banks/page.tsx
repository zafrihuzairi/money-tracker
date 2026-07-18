import { getCurrentUserId } from '@/lib/utils';
import { bankRepository } from '@/repositories/bank.repository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRM } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function BanksPage() {
  const userId = await getCurrentUserId();
  const banks = await bankRepository.findWithBalance(userId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Banks</h1>
        <p className="text-sm text-black/40">All linked bank accounts and their purpose</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {banks.map((b) => (
          <Card key={b.id}>
            <CardHeader>
              <CardTitle>{b.name}</CardTitle>
              <p className="text-xs text-black/40">{b.purpose}</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{formatRM(b.balance)}</p>
              <div className="mt-2 flex justify-between text-xs text-black/50">
                <span>In: {formatRM(b.monthIn)}</span>
                <span>Out: {formatRM(b.monthOut)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
