'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { TransactionFilters, EMPTY_FILTERS, type FilterState } from '@/components/transactions/TransactionFilters';
import { TransactionDetailSheet, type TransactionRow } from '@/components/transactions/TransactionDetailSheet';
import { DeleteConfirmSheet } from '@/components/transactions/DeleteConfirmSheet';
import { Pagination } from '@/components/transactions/Pagination';
import { formatRM } from '@/lib/utils';
import { notifyTransactionsChanged, onTransactionsChanged } from '@/lib/data-events';
import { SlidersHorizontal, Eye, Trash2 } from 'lucide-react';

const PAGE_SIZE = 20;

interface Option { id: string; name: string; }

export function TransactionsClient() {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [banks, setBanks] = useState<Option[]>([]);
  const [accounts, setAccounts] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [people, setPeople] = useState<Option[]>([]);

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [detailTx, setDetailTx] = useState<TransactionRow | null>(null);
  const [deleteTx, setDeleteTx] = useState<TransactionRow | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 7 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    fetch('/api/banks').then((r) => r.json()).then((d) => setBanks(d.banks ?? []));
    fetch('/api/accounts').then((r) => r.json()).then((d) => setAccounts(d.accounts ?? []));
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
    fetch('/api/people').then((r) => r.json()).then((d) => setPeople(d.people ?? []));
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(PAGE_SIZE));
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    try {
      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      setTransactions(data.transactions ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Stay in sync when a transaction is added/edited/deleted from elsewhere
  // (e.g. the FAB), since this component fetches its own data and isn't
  // covered by router.refresh().
  useEffect(() => onTransactionsChanged(fetchTransactions), [fetchTransactions]);

  function handleFiltersChange(next: FilterState) {
    setFilters(next);
    setPage(1);
  }

  function handleDeleted(id: string) {
    setDeleteTx(null);
    notifyTransactionsChanged();
    const remainingOnPage = transactions.length - 1;
    if (remainingOnPage === 0 && page > 1) {
      setPage((p) => p - 1); // triggers refetch via effect
    } else {
      fetchTransactions();
    }
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Desktop filter toolbar */}
      <Card className="hidden md:block">
        <CardContent className="pt-6">
          <TransactionFilters
            filters={filters}
            onChange={handleFiltersChange}
            banks={banks}
            accounts={accounts}
            categories={categories}
            people={people}
            years={years}
          />
        </CardContent>
      </Card>

      {/* Mobile filter trigger */}
      <div className="md:hidden">
        <Button type="button" variant="outline" className="w-full" onClick={() => setFiltersOpen(true)}>
          <SlidersHorizontal size={16} />
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
      </div>

      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <TransactionFilters
          filters={filters}
          onChange={handleFiltersChange}
          banks={banks}
          accounts={accounts}
          categories={categories}
          people={people}
          years={years}
        />
        <Button type="button" className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
          Apply
        </Button>
      </BottomSheet>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-black/[0.04] dark:bg-white/5" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && transactions.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-black/40 dark:text-white/40">No transactions match your filters.</p>
          </CardContent>
        </Card>
      )}

      {/* Mobile: stacked cards */}
      {!loading && transactions.length > 0 && (
        <div className="space-y-3 md:hidden">
          {transactions.map((t) => (
            <Card key={t.id}>
              <CardContent className="pt-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{t.category.name}</p>
                    <p className="text-xs text-black/40 dark:text-white/40">{t.bank.name} · {new Date(t.date).toLocaleDateString('en-MY')}</p>
                  </div>
                  <p className={`text-base font-bold ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatRM(t.amount)}
                  </p>
                </div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge>{t.account.name}</Badge>
                  {t.person && <Badge className="bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60">{t.person.name}</Badge>}
                </div>
                {t.note && <p className="mb-3 text-sm text-black/50 dark:text-white/50">{t.note}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => setDetailTx(t)}>
                    <Eye size={14} /> View
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="flex-1 text-red-600" onClick={() => setDeleteTx(t)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Desktop: table */}
      {!loading && transactions.length > 0 && (
        <Card className="hidden md:block">
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-black/40 dark:border-white/10 dark:text-white/40">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Bank</th>
                    <th className="py-2 pr-4">Account</th>
                    <th className="py-2 pr-4">Category</th>
                    <th className="py-2 pr-4">Person</th>
                    <th className="py-2 pr-4">Note</th>
                    <th className="py-2 text-right">Amount</th>
                    <th className="py-2 pl-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-black/5 dark:border-white/5">
                      <td className="py-2 pr-4 text-black/50 dark:text-white/50">{new Date(t.date).toLocaleDateString('en-MY')}</td>
                      <td className="py-2 pr-4">{t.bank.name}</td>
                      <td className="py-2 pr-4"><Badge>{t.account.name}</Badge></td>
                      <td className="py-2 pr-4">{t.category.name}</td>
                      <td className="py-2 pr-4 text-black/50 dark:text-white/50">{t.person?.name ?? '—'}</td>
                      <td className="py-2 pr-4 text-black/50 dark:text-white/50">{t.note ?? '—'}</td>
                      <td className={`py-2 text-right font-medium ${t.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}{formatRM(t.amount)}
                      </td>
                      <td className="py-2 pl-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setDetailTx(t)}
                            aria-label="View details"
                            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-black/40 hover:bg-black/5 hover:text-black dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => setDeleteTx(t)}
                            aria-label="Delete transaction"
                            className="flex min-h-touch min-w-touch items-center justify-center rounded-lg text-black/40 hover:bg-red-50 hover:text-red-600 dark:text-white/40 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && total > 0 && (
        <Pagination page={page} totalPages={totalPages} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      )}

      <TransactionDetailSheet transaction={detailTx} onClose={() => setDetailTx(null)} />
      <DeleteConfirmSheet transaction={deleteTx} onClose={() => setDeleteTx(null)} onDeleted={handleDeleted} />
    </div>
  );
}
