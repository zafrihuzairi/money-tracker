import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

export const transactionRepository = {
  findAllByUser: (userId: string, filters: Prisma.TransactionWhereInput = {}) =>
    prisma.transaction.findMany({
      where: { userId, ...filters },
      include: { bank: true, account: true, category: true, person: true },
      orderBy: { date: 'desc' }
    }),

  create: (userId: string, data: Prisma.TransactionUncheckedCreateInput) =>
    prisma.transaction.create({ data: { ...data, userId } }),

  update: (id: string, data: Prisma.TransactionUncheckedUpdateInput) =>
    prisma.transaction.update({ where: { id }, data }),

  remove: (id: string) => prisma.transaction.delete({ where: { id } })
};
