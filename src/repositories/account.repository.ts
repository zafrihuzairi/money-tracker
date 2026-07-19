import { prisma } from '@/lib/prisma';
import type { AccountType } from '@prisma/client';

/**
 * Shared aggregation helper — mirrors the exact income/expense/balance math
 * already used by bank.repository's `findWithBalance` (sum of INCOME minus
 * sum of EXPENSE transaction amounts). Reused here rather than reimplemented,
 * so the Accounts page reports numbers using the same rules as the rest of
 * the app. This is read-only aggregation for display; it does not touch the
 * allocation engine, transaction writes, or any existing calculation.
 */
function summarize(transactions: { amount: unknown; type: string }[]) {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    const amt = Number(t.amount);
    if (t.type === 'INCOME') income += amt;
    else expense += amt;
  }
  return { income, expense, net: income - expense };
}

export const accountRepository = {
  findAllByUser: (userId: string) =>
    prisma.account.findMany({ where: { userId }, include: { bank: true }, orderBy: { createdAt: 'asc' } }),

  findByType: (userId: string, type: AccountType) =>
    prisma.account.findMany({ where: { userId, type }, include: { bank: true } }),

  create: (userId: string, data: { type: AccountType; name: string; bankId?: string }) =>
    prisma.account.create({ data: { ...data, userId } }),

  remove: (id: string) => prisma.account.delete({ where: { id } }),

  /** All accounts, each enriched with net total / income / expense / txn count for its card. */
  findAllByUserWithStats: async (userId: string) => {
    const accounts = await prisma.account.findMany({
      where: { userId },
      include: { bank: true, transactions: true },
      orderBy: { createdAt: 'asc' }
    });
    return accounts.map((a) => {
      const { transactions, ...rest } = a;
      const { income, expense, net } = summarize(transactions);
      const latest = transactions.reduce<Date | null>(
        (latestDate, t) => (!latestDate || t.date > latestDate ? t.date : latestDate),
        null
      );
      return { ...rest, netTotal: net, totalIncome: income, totalExpense: expense, txnCount: transactions.length, latestTransactionAt: latest };
    });
  },

  /** Single account with full stats, for the account detail page. */
  findByIdWithStats: async (userId: string, id: string) => {
    const account = await prisma.account.findFirst({
      where: { userId, id },
      include: { bank: true, transactions: { include: { category: true }, orderBy: { id: 'desc' } } }
    });
    if (!account) return null;
    const { transactions, ...rest } = account;
    const { income, expense, net } = summarize(transactions);

    // per-category breakdown within this account
    const byCategory = new Map<string, { categoryId: string; name: string; income: number; expense: number }>();
    for (const t of transactions) {
      const key = t.categoryId;
      if (!byCategory.has(key)) byCategory.set(key, { categoryId: key, name: t.category.name, income: 0, expense: 0 });
      const c = byCategory.get(key)!;
      const amt = Number(t.amount);
      if (t.type === 'INCOME') c.income += amt;
      else c.expense += amt;
    }

    return {
      ...rest,
      netTotal: net,
      totalIncome: income,
      totalExpense: expense,
      txnCount: transactions.length,
      recentTransactions: transactions.slice(0, 8),
      categories: Array.from(byCategory.values()).sort((a, b) => b.income + b.expense - (a.income + a.expense))
    };
  },

  /**
   * Bucket-level dashboard data (Daily / Outlay / Saving / Liability):
   * every account of that type, each account's stats, every category that
   * belongs to that AccountType (whether or not it has transactions yet),
   * and the bucket-wide totals.
   */
  findBucketDashboard: async (userId: string, type: AccountType) => {
    const [accounts, categories] = await Promise.all([
      prisma.account.findMany({
        where: { userId, type },
        include: { bank: true, transactions: { include: { category: true } } },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.category.findMany({ where: { userId, accountType: type }, orderBy: { name: 'asc' } })
    ]);

    const accountsWithStats = accounts.map((a) => {
      const { transactions, ...rest } = a;
      const { income, expense, net } = summarize(transactions);
      return { ...rest, netTotal: net, totalIncome: income, totalExpense: expense, txnCount: transactions.length };
    });

    const allTransactions = accounts.flatMap((a) => a.transactions);
    const bucketTotals = summarize(allTransactions);

    const categoryStats = categories.map((c) => {
      const txns = allTransactions.filter((t) => t.categoryId === c.id);
      const { income, expense, net } = summarize(txns);
      const latest = txns.reduce<Date | null>((d, t) => (!d || t.date > d ? t.date : d), null);
      return {
        id: c.id,
        name: c.name,
        netTotal: net,
        totalIncome: income,
        totalExpense: expense,
        txnCount: txns.length,
        latestTransactionAt: latest
      };
    });

    return { accounts: accountsWithStats, categories: categoryStats, totals: bucketTotals };
  }
};
