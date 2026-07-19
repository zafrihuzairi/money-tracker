'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  MoreHorizontal,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Landmark,
  Building2,
  Users,
  ShieldAlert,
  BarChart3,
  Settings as SettingsIcon,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/layout/BottomSheet';
import { ExpenseForm } from '@/components/transactions/ExpenseForm';
import { IncomeQuickForm } from '@/components/income/IncomeQuickForm';
import { notifyTransactionsChanged } from '@/lib/data-events';

const SIDE_ITEMS = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'History', icon: ArrowLeftRight },
  { href: '/income', label: 'Income', icon: Wallet }
];

const MORE_ITEMS = [
  { href: '/accounts', label: 'Accounts', icon: Landmark },
  { href: '/banks', label: 'Banks', icon: Building2 },
  { href: '/people', label: 'People', icon: Users },
  { href: '/liabilities', label: 'Liabilities', icon: ShieldAlert },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: SettingsIcon }
];

type AddSheetState = 'closed' | 'menu' | 'income' | 'expense';

/**
 * Floating glass pill bottom nav, safe-area aware, sits above the home
 * indicator. The (+) add-transaction action is now merged directly into
 * this bar — Home / History / (+) / Income / More — instead of floating
 * as its own separately-positioned element, so it can never visually
 * drift apart from the tab bar.
 *
 * Layout notes:
 * - The bar is a 5-column grid. The center (+) cell is reserved as plain
 *   flex space; the actual button is an absolutely-positioned sibling
 *   pinned to left-1/2 -translate-x-1/2 of the *bar itself*, so it is
 *   always perfectly centered regardless of the two side groups' widths.
 * - Press feedback is a `scale` transform ONLY (never `x`/`translate`),
 *   applied with `transform-origin: center`, so the button cannot drift
 *   horizontally when tapped — this fixes the "shifts right on press" bug.
 * - "More" no longer navigates; it expands an animated glass panel with
 *   the rest of the app's sections, closes on outside tap/Escape, and is
 *   keyboard-operable.
 */
export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [addSheet, setAddSheet] = useState<AddSheetState>('closed');
  const [moreOpen, setMoreOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!moreOpen) return;
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setMoreOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMoreOpen(false);
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [moreOpen]);

  // close the More panel on route change
  useEffect(() => setMoreOpen(false), [pathname]);

  function goToIncomePage() {
    setAddSheet('closed');
    router.push('/income');
  }

  function handleSaved() {
    setAddSheet('closed');
    notifyTransactionsChanged();
    router.refresh();
  }

  const addSheetTitle =
    addSheet === 'income' ? 'New Income' : addSheet === 'expense' ? 'New Expense' : 'Add Transaction';

  const moreActive = MORE_ITEMS.some((i) => pathname === i.href);

  return (
    <>
      <nav
        className="fixed inset-x-3 bottom-0 z-40 md:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="relative mx-auto max-w-md">
          {/* (+) — absolutely centered on the bar, independent of side-group widths */}
          <motion.button
            aria-label="Add transaction"
            aria-haspopup="dialog"
            onClick={() => setAddSheet('menu')}
            className="glass absolute left-1/2 top-0 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-6 items-center justify-center rounded-full border border-white/50 text-white shadow-fab
              bg-gradient-to-br from-gold-400 to-gold-600"
            style={{ transformOrigin: 'center' }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          >
            <Plus size={28} strokeWidth={2.5} />
          </motion.button>

          <div className="glass grid grid-cols-5 items-stretch rounded-[26px] border border-white/60 shadow-soft">
            {SIDE_ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return <NavLink key={href} href={href} label={label} icon={Icon} active={active} />;
            })}

            {/* center spacer cell — keeps the grid at 5 equal columns so the
                two side groups stay symmetric; the visible button floats above it */}
            <div aria-hidden className="flex flex-col items-center justify-end pb-1.5">
              <span className="text-[10px] font-medium text-transparent select-none">Add</span>
            </div>

            {SIDE_ITEMS.slice(2).map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return <NavLink key={href} href={href} label={label} icon={Icon} active={active} />;
            })}

            <button
              type="button"
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((v) => !v)}
              className={cn(
                'flex min-h-touch flex-1 flex-col items-center justify-center gap-0.5 rounded-[26px] py-2.5 text-[10px] font-medium transition-all duration-200',
                moreOpen || moreActive ? 'text-gold-600' : 'text-black/40'
              )}
            >
              <MoreHorizontal size={22} strokeWidth={moreOpen || moreActive ? 2.4 : 2} />
              More
            </button>
          </div>
        </div>
      </nav>

      {/* More — expandable glass panel, not a page navigation */}
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {moreOpen && (
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="More"
            className="glass fixed inset-x-3 z-40 rounded-[28px] border border-white/60 p-4 shadow-soft md:hidden"
            style={{ bottom: 'calc(6.75rem + env(safe-area-inset-bottom))' }}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-sm font-semibold tracking-tight">More</h2>
              <button
                onClick={() => setMoreOpen(false)}
                aria-label="Close"
                className="flex min-h-touch min-w-touch items-center justify-center rounded-full text-black/40 transition hover:bg-black/5 hover:text-black"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MORE_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    className={cn(
                      'flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs font-medium transition active:scale-[0.97]',
                      active
                        ? 'border-gold-300/60 bg-gold-50/60 text-gold-700 dark:bg-gold-500/10'
                        : 'border-black/5 bg-black/[0.02] text-black/60 hover:bg-black/5'
                    )}
                  >
                    <Icon size={20} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomSheet open={addSheet !== 'closed'} onClose={() => setAddSheet('closed')} title={addSheetTitle}>
        {addSheet === 'menu' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAddSheet('income')}
              className="glass flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border border-green-200/60 p-4 text-green-700 transition hover:bg-green-50/60 active:scale-[0.97] dark:text-green-400 dark:hover:bg-green-500/10"
            >
              <ArrowDownCircle size={28} />
              <span className="text-sm font-semibold">Income</span>
            </button>
            <button
              onClick={() => setAddSheet('expense')}
              className="glass flex min-h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border border-red-200/60 p-4 text-red-600 transition hover:bg-red-50/60 active:scale-[0.97] dark:hover:bg-red-500/10"
            >
              <ArrowUpCircle size={28} />
              <span className="text-sm font-semibold">Expense</span>
            </button>
          </div>
        )}

        {addSheet === 'income' && (
          <IncomeQuickForm
            onSaved={handleSaved}
            onCancel={() => setAddSheet('closed')}
            onGoToIncomePage={goToIncomePage}
          />
        )}

        {addSheet === 'expense' && <ExpenseForm onSaved={handleSaved} onCancel={() => setAddSheet('closed')} />}
      </BottomSheet>
    </>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-touch flex-1 flex-col items-center justify-center gap-0.5 rounded-[26px] py-2.5 text-[10px] font-medium transition-all duration-200',
        active ? 'text-gold-600' : 'text-black/40'
      )}
    >
      <Icon size={22} strokeWidth={active ? 2.4 : 2} />
      {label}
    </Link>
  );
}
