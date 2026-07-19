import { getCurrentUserId } from '@/lib/utils';
import { transactionRepository } from '@/repositories/transaction.repository';
import { formatRM } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const userId = await getCurrentUserId();
  const transactions = await transactionRepository.findAllByUser(userId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Transactions</h1>
        <p className="text-sm text-black/40">{transactions.length} records</p>
      </header>

      {/* Mobile: stacked cards (no horizontal scroll) */}
      <div className="space-y-3 md:hidden">
        {transactions.map((t) => (
          <Card key={t.id}>
            <CardContent className="pt-5">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-semibold">{t.category.name}</p>
                  <p className="text-xs text-black/40">{t.bank.name} · {new Date(t.date).toLocaleDateString('en-MY')}</p>
                </div>
                <p className={`text-base font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatRM(Number(t.amount))}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{t.account.name}</Badge>
                {t.person && <Badge className="bg-black/5 text-black/60">{t.person.name}</Badge>}
              </div>
              {t.note && <p className="mt-2 text-sm text-black/50">{t.note}</p>}
            </CardContent>
          </Card>
        ))}
        {transactions.length === 0 && (
          <p className="py-8 text-center text-sm text-black/30">No transactions yet.</p>
        )}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-black/40">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Bank</th>
                  <th className="py-2 pr-4">Account</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Person</th>
                  <th className="py-2 pr-4">Note</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-black/5">
                    <td className="py-2 pr-4 text-black/50">{new Date(t.date).toLocaleDateString('en-MY')}</td>
                    <td className="py-2 pr-4">{t.bank.name}</td>
                    <td className="py-2 pr-4"><Badge>{t.account.name}</Badge></td>
                    <td className="py-2 pr-4">{t.category.name}</td>
                    <td className="py-2 pr-4 text-black/50">{t.person?.name ?? '—'}</td>
                    <td className="py-2 pr-4 text-black/50">{t.note ?? '—'}</td>
                    <td className={`py-2 text-right font-medium ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{formatRM(Number(t.amount))}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr><td colSpan={7} className="py-8 text-center text-black/30">No transactions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
