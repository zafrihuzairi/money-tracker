import { TransactionsClient } from '@/components/transactions/TransactionsClient';

// Data is fetched client-side (paginated) by TransactionsClient — we
// deliberately do NOT server-fetch the full transaction list here anymore,
// since that would defeat the point of pagination on large datasets.
export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight dark:text-white sm:text-2xl">Transactions</h1>
        <p className="text-sm text-black/40 dark:text-white/40">Filter, page through, view, and manage every transaction</p>
      </header>
      <TransactionsClient />
    </div>
  );
}
