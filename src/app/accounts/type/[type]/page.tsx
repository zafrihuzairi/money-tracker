import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft, ArrowUpRight } from 'lucide-react';
import { getCurrentUserId, formatRM } from '@/lib/utils';
import { accountRepository } from '@/repositories/account.repository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CategoryBarChart } from '@/components/accounts/CategoryBarChart';
import { BucketTabs } from '@/components/accounts/BucketTabs';
import type { AccountType } from '@prisma/client';

export const dynamic = 'force-dynamic';

const SLUG_TO_TYPE: Record<string, AccountType> = {
  daily: 'DAILY',
  outlay: 'OUTLAY',
  saving: 'SAVING',
  liability: 'LIABILITY'
};
const TYPE_LABEL: Record<AccountType, string> = {
  INCOME: 'Income',
  DAILY: 'Daily',
  OUTLAY: 'Outlay',
  SAVING: 'Saving',
  LIABILITY: 'Liability'
};

export default async function BucketDashboardPage({ params }: { params: Promise<{ type: string }> }) {
  const { type: slug } = await params;
  const accountType = SLUG_TO_TYPE[slug];
  if (!accountType) notFound();

  const userId = await getCurrentUserId();
  const data = await accountRepository.findBucketDashboard(userId, accountType);
  const chartRows = data.categories.map((c) => ({ label: c.name, income: c.totalIncome, expense: c.totalExpense }));

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/accounts"
          className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-black/40 transition hover:text-black/70"
        >
          <ChevronLeft size={14} /> Accounts
        </Link>
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{TYPE_LABEL[accountType]} Dashboard</h1>
          <p className="text-sm text-black/40">
            {accountType === 'LIABILITY'
              ? 'Liability categories, outstanding balances and activity'
              : `All ${TYPE_LABEL[accountType].toLowerCase()} categories and accounts`}
          </p>
        </header>
      </div>

      <BucketTabs active={slug as 'daily' | 'outlay' | 'saving' | 'liability'} />

      {/* Bucket-wide summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-black/40">Net Total</p>
            <p className={`mt-1 text-xl font-bold tracking-tight ${data.totals.net >= 0 ? 'text-ink-900' : 'text-red-600'}`}>
              {formatRM(data.totals.net)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-black/40">Total Income</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-green-600">{formatRM(data.totals.income)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-xs text-black/40">
              {accountType === 'LIABILITY' ? 'Outstanding / Total Expenses' : 'Total Expenses'}
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-red-600">{formatRM(data.totals.expense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">Category Overview</h2>
        <CategoryBarChart rows={chartRows} />
      </div>

      {/* Category cards — every category under this bucket, per Daily/Outlay/Saving/Liability spec */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">Categories</h2>
        {data.categories.length === 0 ? (
          <p className="py-6 text-center text-sm text-black/30">No categories in this bucket yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {data.categories.map((c) => (
              <Card key={c.id}>
                <CardHeader>
                  <CardTitle>{c.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-xs text-black/40">
                    Net Total <span className="ml-1 font-semibold text-ink-900">{formatRM(c.netTotal)}</span>
                  </p>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-600">In: {formatRM(c.totalIncome)}</span>
                    <span className="text-red-600">Out: {formatRM(c.totalExpense)}</span>
                  </div>
                  <p className="mt-2 text-[11px] text-black/30">
                    {c.txnCount} transaction{c.txnCount === 1 ? '' : 's'}
                    {c.latestTransactionAt ? ` · latest ${new Date(c.latestTransactionAt).toLocaleDateString('en-MY')}` : ''}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Accounts within this bucket */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">Accounts</h2>
        {data.accounts.length === 0 ? (
          <p className="py-6 text-center text-sm text-black/30">No accounts in this bucket yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {data.accounts.map((a) => (
              <Card key={a.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{a.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="mb-4 text-sm font-semibold text-ink-900">{formatRM(a.netTotal)} net</p>
                  <Link
                    href={`/accounts/${a.id}`}
                    className="mt-auto flex min-h-touch items-center justify-center gap-1.5 rounded-2xl border border-black/10 text-sm font-medium text-ink-900 transition hover:bg-black/5 active:scale-[0.98]"
                  >
                    View Account <ArrowUpRight size={16} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
