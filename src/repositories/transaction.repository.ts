import { prisma } from '@/lib/prisma';
import type { Prisma, TransactionType } from '@prisma/client';

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  month?: number; // 1-12, combine with year for a specific month
  year?: number;
  bankId?: string;
  accountId?: string;
  categoryId?: string;
  personId?: string;
  type?: TransactionType;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

function buildWhere(userId: string, f: TransactionFilters): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  // Date Range
  if (f.dateFrom || f.dateTo) {
    where.date = {
      ...(f.dateFrom ? { gte: new Date(f.dateFrom) } : {}),
      ...(f.dateTo ? { lte: new Date(`${f.dateTo}T23:59:59.999`) } : {})
    };
  }

  // Month + Year (both required together to unambiguously resolve a range)
  if (f.year && f.month) {
    const start = new Date(Date.UTC(f.year, f.month - 1, 1));
    const end = new Date(Date.UTC(f.year, f.month, 1));
    where.date = { gte: start, lt: end };
  } else if (f.year) {
    const start = new Date(Date.UTC(f.year, 0, 1));
    const end = new Date(Date.UTC(f.year + 1, 0, 1));
    where.date = { gte: start, lt: end };
  }

  if (f.bankId) where.bankId = f.bankId;
  if (f.accountId) where.accountId = f.accountId;
  if (f.categoryId) where.categoryId = f.categoryId;
  if (f.personId) where.personId = f.personId;
  if (f.type) where.type = f.type;

  if (f.amountMin !== undefined || f.amountMax !== undefined) {
    where.amount = {
      ...(f.amountMin !== undefined ? { gte: f.amountMin } : {}),
      ...(f.amountMax !== undefined ? { lte: f.amountMax } : {})
    };
  }

  if (f.search) {
    where.OR = [
      { note: { contains: f.search, mode: 'insensitive' } },
      { category: { name: { contains: f.search, mode: 'insensitive' } } },
      { bank: { name: { contains: f.search, mode: 'insensitive' } } }
    ];
  }

  return where;
}

export const transactionRepository = {
  findAllByUser: (userId: string, filters: Prisma.TransactionWhereInput = {}) =>
    prisma.transaction.findMany({
      where: { userId, ...filters },
      include: { bank: true, account: true, category: true, person: true },
      // orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
      orderBy: [{ id: 'desc' }]

    }),

  /**
   * Server-side paginated + filtered fetch — used by the Transactions page
   * so we never load the entire table into a single response.
   */
  findPaginated: async (userId: string, filters: TransactionFilters, page: number, pageSize: number) => {
    const where = buildWhere(userId, filters);
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { bank: true, account: true, category: true, person: true },
        // orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
        orderBy: [{ id: 'desc' }],

        skip: (page - 1) * pageSize,
        take: pageSize
      }),
      prisma.transaction.count({ where })
    ]);
    return { transactions, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
  },

  findById: (userId: string, id: string) =>
    prisma.transaction.findFirst({
      where: { userId, id },
      include: { bank: true, account: true, category: true, person: true }
    }),

  create: (userId: string, data: Prisma.TransactionUncheckedCreateInput) =>
    prisma.transaction.create({ data: { ...data, userId } }),

  update: (id: string, data: Prisma.TransactionUncheckedUpdateInput) =>
    prisma.transaction.update({ where: { id }, data }),

  remove: (id: string) => prisma.transaction.delete({ where: { id } })
};
