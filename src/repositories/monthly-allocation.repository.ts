import { prisma } from '@/lib/prisma';
import { currentMonthKey } from '@/services/allocation.service';

export const monthlyAllocationRepository = {
  findOrCreateCurrent: async (userId: string) => {
    const month = currentMonthKey();
    const existing = await prisma.monthlyAllocationStatus.findUnique({
      where: { userId_month: { userId, month } }
    });
    if (existing) return existing;
    return prisma.monthlyAllocationStatus.create({
      data: { userId, month, investmentReceived: 0, marriageReceived: 0 }
    });
  },

  update: (userId: string, month: string, data: { investmentReceived: number; marriageReceived: number }) =>
    prisma.monthlyAllocationStatus.update({
      where: { userId_month: { userId, month } },
      data
    })
};
