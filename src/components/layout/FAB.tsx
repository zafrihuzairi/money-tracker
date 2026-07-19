'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { ExpenseForm } from '@/components/transactions/ExpenseForm';
import { IncomeQuickForm } from '@/components/income/IncomeQuickForm';
import { notifyTransactionsChanged } from '@/lib/data-events';

type SheetState = 'closed' | 'menu' | 'income' | 'expense';

/**
 * Floating Action Button — presentation + navigation only.
 * - Expense: opens ExpenseForm inline, posts to the existing
 *   /api/transactions endpoint.
 * - Income (Allowance / Debtor / Other): opens IncomeQuickForm inline,
 *   posts to the existing /api/income endpoint (mode: MANUAL).
 * - Income → Job/Freelance: hands off to the full /income page, since
 *   that's the only place the automatic allocation engine renders its
 *   breakdown. No allocation logic lives here.
 *
 * Desktop-only now: on mobile the (+) action lives inside MobileNav,
 * merged directly into the bottom tab bar (see MobileNav.tsx) so it no
 * longer floats as a separately-positioned element that can visually
 * drift from the nav on press.
 */
export function FAB() {
  const [sheet, setSheet] = useState<SheetState>('closed');
  const router = useRouter();

  function goToIncomePage() {
    setSheet('closed');
    router.push('/income');
  }

  function handleSaved() {
    setSheet('closed');
    notifyTransactionsChanged(); // tell any mounted client-fetch components (Transactions/Reports) to refetch
    router.refresh(); // re-fetch server-rendered dashboard data
  }

  const sheetTitle = sheet === 'income' ? 'New Income' : sheet === 'expense' ? 'New Expense' : 'Add Transaction';

  return (
    <>
      <motion.button
        aria-label="Add transaction"
        onClick={() => setSheet('menu')}
        className="glass fixed bottom-8 right-8 z-40 hidden h-16 w-16 items-center justify-center rounded-full border border-white/50 text-white shadow-fab
          bg-gradient-to-br from-gold-400 to-gold-600
          md:flex"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      >
        <Plus size={28} strokeWidth={2.5} />
      </motion.button>

      <BottomSheet open={sheet !== 'closed'} onClose={() => setSheet('closed')} title={sheetTitle}>
        {sheet === 'menu' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSheet('income')}
              className="glass flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border border-green-200/60 p-4 text-green-700 transition hover:bg-green-50/60 active:scale-[0.97] dark:text-green-400 dark:hover:bg-green-500/10"
            >
              <ArrowDownCircle size={28} />
              <span className="text-sm font-semibold">Income</span>
            </button>
            <button
              onClick={() => setSheet('expense')}
              className="glass flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border border-red-200/60 p-4 text-red-600 transition hover:bg-red-50/60 active:scale-[0.97] dark:hover:bg-red-500/10"
            >
              <ArrowUpCircle size={28} />
              <span className="text-sm font-semibold">Expense</span>
            </button>
          </div>
        )}

        {sheet === 'income' && (
          <IncomeQuickForm
            onSaved={handleSaved}
            onCancel={() => setSheet('closed')}
            onGoToIncomePage={goToIncomePage}
          />
        )}

        {sheet === 'expense' && <ExpenseForm onSaved={handleSaved} onCancel={() => setSheet('closed')} />}
      </BottomSheet>
    </>
  );
}
