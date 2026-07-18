import { prisma } from '@/lib/prisma';

export const liabilityRepository = {
  findAllByUser: (userId: string) =>
    prisma.liability.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } }),

  create: (userId: string, data: { name: string; targetAmount: number; currentPaid?: number }) =>
    prisma.liability.create({ data: { ...data, userId } }),

  incrementPaid: (id: string, amount: number) =>
    prisma.liability.update({ where: { id }, data: { currentPaid: { increment: amount } } }),

  remove: (id: string) => prisma.liability.delete({ where: { id } })
};
