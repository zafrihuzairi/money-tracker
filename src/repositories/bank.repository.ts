import { prisma } from '@/lib/prisma';

export const bankRepository = {
  findAllByUser: (userId: string) =>
    prisma.bank.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),

  findWithBalance: async (userId: string) => {
    const banks = await prisma.bank.findMany({
      where: { userId },
      include: { transactions: true },
      orderBy: { createdAt: 'asc' }
    });
    return banks.map((bank) => {
      const balance = bank.transactions.reduce((sum, t) => {
        const amt = Number(t.amount);
        return sum + (t.type === 'INCOME' ? amt : -amt);
      }, 0);
      const now = new Date();
      const monthIn = bank.transactions
        .filter((t) => t.type === 'INCOME' && isSameMonth(t.date, now))
        .reduce((s, t) => s + Number(t.amount), 0);
      const monthOut = bank.transactions
        .filter((t) => t.type === 'EXPENSE' && isSameMonth(t.date, now))
        .reduce((s, t) => s + Number(t.amount), 0);
      const { transactions, ...rest } = bank;
      return { ...rest, balance, monthIn, monthOut };
    });
  },

  create: (userId: string, data: { name: string; purpose?: string }) =>
    prisma.bank.create({ data: { ...data, userId } }),

  update: (id: string, data: { name?: string; purpose?: string }) =>
    prisma.bank.update({ where: { id }, data }),

  remove: (id: string) => prisma.bank.delete({ where: { id } })
};

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
