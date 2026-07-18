import { prisma } from '@/lib/prisma';
import type { AccountType } from '@prisma/client';

export const accountRepository = {
  findAllByUser: (userId: string) =>
    prisma.account.findMany({ where: { userId }, include: { bank: true }, orderBy: { createdAt: 'asc' } }),

  findByType: (userId: string, type: AccountType) =>
    prisma.account.findMany({ where: { userId, type }, include: { bank: true } }),

  create: (userId: string, data: { type: AccountType; name: string; bankId?: string }) =>
    prisma.account.create({ data: { ...data, userId } }),

  remove: (id: string) => prisma.account.delete({ where: { id } })
};
