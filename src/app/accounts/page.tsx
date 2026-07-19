import Link from 'next/link';
import { ChevronRight, ArrowUpRight } from 'lucide-react';
import { getCurrentUserId, formatRM } from '@/lib/utils';
import { accountRepository } from '@/repositories/account.repository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

const SECTION_ORDER = ['INCOME', 'DAILY', 'OUTLAY', 'SAVING', 'LIABILITY'] as const;
const SECTION_LABEL: Record<(typeof SECTION_ORDER)[number], string> = {
  INCOME: 'Income',
  DAILY: 'Daily',
  OUTLAY: 'Outlay',
  SAVING: 'Saving',
  LIABILITY: 'Liability'
};
// Only these buckets get a dedicated mini-dashboard subpage (Feature 2).
const DASHBOARD_SECTIONS = ['DAILY', 'OUTLAY', 'SAVING', 'LIABILITY'] as const;

export default async function AccountsPage() {
  const userId = await getCurrentUserId();
  const accounts = await accountRepository.findAllByUserWithStats(userId);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <p className="text-sm text-black/40">Income, Daily, Outlay, Saving, Liability buckets</p>
      </header>

      {SECTION_ORDER.map((section) => {
        const items = accounts.filter((a) => a.type === section);
        if (items.length === 0) return null;
        const isDashboardSection = (DASHBOARD_SECTIONS as readonly string[]).includes(section);

        return (
          <div key={section}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-black/40">{SECTION_LABEL[section]}</h2>
              {isDashboardSection && (
                <Link
                  href={`/accounts/type/${section.toLowerCase()}`}
                  className="flex items-center gap-1 text-xs font-medium text-gold-600 transition hover:text-gold-700"
                >
                  Bucket dashboard <ChevronRight size={14} />
                </Link>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {items.map((a) => (
                <Card key={a.id} className="flex flex-col">
                  <CardHeader className="flex flex-row items-start justify-between gap-2">
                    <div>
                      <CardTitle>{a.name}</CardTitle>
                      <Badge className="mt-2">{a.bank?.name ?? 'No bank linked'}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <div className="mb-4">
                      <p className="text-xs text-black/40">Net Total</p>
                      <p
                        className={
                          a.netTotal >= 0
                            ? 'text-xl font-bold tracking-tight text-ink-900'
                            : 'text-xl font-bold tracking-tight text-red-600'
                        }
                      >
                        {formatRM(a.netTotal)}
                      </p>
                    </div>

                    <div className="mb-5 grid grid-cols-2 gap-3 text-xs">
                      <div className="rounded-2xl bg-black/[0.03] p-3">
                        <p className="text-black/40">Current Balance</p>
                        <p className="mt-1 text-sm font-semibold">{formatRM(a.netTotal)}</p>
                      </div>
                      <div className="rounded-2xl bg-black/[0.03] p-3">
                        <p className="text-black/40">Transactions</p>
                        <p className="mt-1 text-sm font-semibold">{a.txnCount}</p>
                      </div>
                      <div className="rounded-2xl bg-green-50/70 p-3 dark:bg-green-500/10">
                        <p className="text-green-700/70 dark:text-green-400/70">Total Income</p>
                        <p className="mt-1 text-sm font-semibold text-green-700 dark:text-green-400">
                          {formatRM(a.totalIncome)}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-red-50/70 p-3 dark:bg-red-500/10">
                        <p className="text-red-600/70 dark:text-red-400/70">Total Expenses</p>
                        <p className="mt-1 text-sm font-semibold text-red-600 dark:text-red-400">
                          {formatRM(a.totalExpense)}
                        </p>
                      </div>
                    </div>

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
          </div>
        );
      })}
    </div>
  );
}
