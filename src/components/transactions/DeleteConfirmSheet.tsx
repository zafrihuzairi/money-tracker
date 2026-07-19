'use client';

import { useState } from 'react';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import type { TransactionRow } from '@/components/transactions/TransactionDetailSheet';

export function DeleteConfirmSheet({
  transaction,
  onClose,
  onDeleted
}: {
  transaction: TransactionRow | null;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmDelete() {
    if (!transaction) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/transactions/${transaction.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete transaction');
      onDeleted(transaction.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const isLinkedToJob = transaction?.note?.toLowerCase().includes('bank islam') || transaction?.note?.toLowerCase().includes('auto split');

  return (
    <BottomSheet open={!!transaction} onClose={onClose} title="Delete Transaction">
      {transaction && (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-2xl border border-red-200/60 bg-red-50/60 p-4 dark:border-red-500/30 dark:bg-red-500/10">
            <AlertTriangle className="mt-0.5 shrink-0 text-red-500" size={20} />
            <div>
              <p className="text-sm font-medium text-ink-900">Are you sure you want to delete this transaction?</p>
              <p className="mt-1 text-xs text-black/50 dark:text-white/50">
                {transaction.category.name} · {transaction.bank.name} — this action cannot be undone. Bank balances,
                dashboard, and reports will update automatically.
              </p>
              {isLinkedToJob && (
                <p className="mt-2 text-xs text-gold-600">
                  Note: this transaction is part of an automatic Job-income split. Deleting it won't reverse the
                  monthly Ryt Invest/ASNB counters or liability totals automatically — review Settings/Liabilities
                  afterwards if needed.
                </p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={deleting}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" className="flex-1" onClick={confirmDelete} disabled={deleting}>
              {deleting ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
