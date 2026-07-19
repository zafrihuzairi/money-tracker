'use client';

import { BottomSheet } from '@/components/layout/BottomSheet';
import { formatRM } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface TransactionRow {
  id: string;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  amount: string | number;
  note: string | null;
  attachment: string | null;
  createdAt: string;
  updatedAt: string;
  bank: { name: string };
  account: { name: string };
  category: { name: string };
  person: { name: string } | null;
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-black/5 py-2.5 last:border-0 dark:border-white/5">
      <span className="text-xs text-black/40 dark:text-white/40">{label}</span>
      <span className="text-sm font-medium text-ink-900">{value}</span>
    </div>
  );
}

export function TransactionDetailSheet({ transaction, onClose }: { transaction: TransactionRow | null; onClose: () => void }) {
  return (
    <BottomSheet open={!!transaction} onClose={onClose} title="Transaction Details">
      {transaction && (
        <div>
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-black/[0.03] p-4 dark:bg-white/5">
            <div>
              <p className="text-xs text-black/40 dark:text-white/40">{transaction.type === 'INCOME' ? 'Income' : 'Expense'}</p>
              <p className={`text-2xl font-bold ${transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.type === 'INCOME' ? '+' : '-'}{formatRM(transaction.amount)}
              </p>
            </div>
            <Badge>{transaction.account.name}</Badge>
          </div>

          <div>
            <Row label="Date" value={new Date(transaction.date).toLocaleDateString('en-MY', { day: '2-digit', month: 'long', year: 'numeric' })} />
            <Row label="Bank" value={transaction.bank.name} />
            <Row label="Account" value={transaction.account.name} />
            <Row label="Category" value={transaction.category.name} />
            <Row label="Person" value={transaction.person?.name ?? '—'} />
            <Row label="Note" value={transaction.note ?? '—'} />
            <Row
              label="Attachment"
              value={
                transaction.attachment ? (
                  <a href={transaction.attachment} target="_blank" rel="noreferrer" className="text-gold-600 underline">
                    View
                  </a>
                ) : (
                  '—'
                )
              }
            />
            <Row label="Created" value={new Date(transaction.createdAt).toLocaleString('en-MY')} />
            <Row label="Last Updated" value={new Date(transaction.updatedAt).toLocaleString('en-MY')} />
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
