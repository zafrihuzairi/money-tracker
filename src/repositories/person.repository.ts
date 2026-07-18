import { prisma } from '@/lib/prisma';

export const personRepository = {
  findAllByUser: async (userId: string) => {
    const people = await prisma.person.findMany({
      where: { userId },
      include: { transactions: true },
      orderBy: { name: 'asc' }
    });
    return people.map((p) => {
      const theyOweMe = p.transactions
        .filter((t) => t.debtDirection === 'THEY_OWE_ME')
        .reduce((s, t) => s + Number(t.amount), 0);
      const iOweThem = p.transactions
        .filter((t) => t.debtDirection === 'I_OWE_THEM')
        .reduce((s, t) => s + Number(t.amount), 0);
      const { transactions, ...rest } = p;
      return { ...rest, theyOweMe, iOweThem, transactionCount: transactions.length };
    });
  },

  create: (userId: string, data: { name: string; phone?: string; note?: string }) =>
    prisma.person.create({ data: { ...data, userId } }),

  remove: (id: string) => prisma.person.delete({ where: { id } })
};
