import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getCurrentUserId, formatRM } from '@/lib/utils';
import { accountRepository } from '@/repositories/account.repository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryBarChart } from '@/components/accounts/CategoryBarChart';

export const dynamic = 'force-dynamic';

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getCurrentUserId();
  const account = await accountRepository.findByIdWithStats(userId, id);
  if (!account) notFound();

  const chartRows = account.categories.map((c) => ({ label: c.name, income: c.income, expense: c.expense }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/accounts"
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-black/40 transition hover:text-black/70"
        >
          <ChevronLeft size={14} /> Accounts
        </Link>
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{account.name}</h1>
            <p className="text-sm text-black/40">{account.type} account · mini dashboard</p>
          </div>
          <Badge>{account.bank?.name ?? 'No bank linked'}</Badge>
        </header>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Net Total" value={account.netTotal} tone={account.netTotal >= 0 ? 'default' : 'negative'} />
        <SummaryCard label="Current Balance" value={account.netTotal} />
        <SummaryCard label="Total Income" value={account.totalIncome} tone="positive" />
        <SummaryCard label="Total Expenses" value={account.totalExpense} tone="negative" />
      </div>

      {/* Category breakdown chart */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">Category Overview</h2>
        <CategoryBarChart rows={chartRows} />
      </div>

      {/* Category cards */}
      {account.categories.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {account.categories.map((c) => (
            <Card key={c.categoryId}>
              <CardHeader>
                <CardTitle>{c.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">In: {formatRM(c.income)}</span>
                  <span className="text-red-600">Out: {formatRM(c.expense)}</span>
                  <span className="font-medium">Net: {formatRM(c.income - c.expense)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent transactions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">Latest Transactions</h2>
        <Card>
          <CardContent className="divide-y divide-black/5 pt-4">
            {account.recentTransactions.length === 0 && (
              <p className="py-6 text-center text-sm text-black/30">No transactions yet.</p>
            )}
            {account.recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-medium">{t.category?.name ?? 'Uncategorized'}</p>
                  <p className="text-xs text-black/40">{new Date(t.date).toLocaleDateString('en-MY')}</p>
                </div>
                <span className={t.type === 'INCOME' ? 'font-semibold text-green-600' : 'font-semibold text-red-600'}>
                  {t.type === 'INCOME' ? '+' : '-'}
                  {formatRM(Number(t.amount))}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone = 'default'
}: {
  label: string;
  value: number;
  tone?: 'default' | 'positive' | 'negative';
}) {
  const color =
    tone === 'positive' ? 'text-green-600' : tone === 'negative' ? 'text-red-600' : 'text-ink-900';
  return (
    <Card>
      <CardContent className="pt-5">
        <p className="text-xs text-black/40">{label}</p>
        <p className={`mt-1 text-lg font-bold tracking-tight sm:text-xl ${color}`}>{formatRM(value)}</p>
      </CardContent>
    </Card>
  );
}
