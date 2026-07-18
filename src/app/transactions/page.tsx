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
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-sm text-black/40">{transactions.length} records</p>
      </header>

      <Card>
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
