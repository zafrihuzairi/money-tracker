import { prisma } from '@/lib/prisma';
import type { AccountType } from '@prisma/client';

export const categoryRepository = {
  findAllByUser: (userId: string) =>
    prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } }),

  findByType: (userId: string, accountType: AccountType) =>
    prisma.category.findMany({ where: { userId, accountType }, orderBy: { name: 'asc' } }),

  findOrCreateSystemCategory: async (userId: string, name: string, accountType: AccountType) => {
    const existing = await prisma.category.findFirst({ where: { userId, name, accountType } });
    if (existing) return existing;
    return prisma.category.create({ data: { userId, name, accountType } });
  },

  create: (userId: string, data: { name: string; accountType: AccountType; accountId?: string }) =>
    prisma.category.create({ data: { ...data, userId } }),

  remove: (id: string) => prisma.category.delete({ where: { id } })
};
