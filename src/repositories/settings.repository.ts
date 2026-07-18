import { prisma } from '@/lib/prisma';
import { DEFAULT_ALLOCATION_SETTINGS } from '@/services/allocation.service';

export const settingsRepository = {
  findByUser: async (userId: string) => {
    const existing = await prisma.settings.findUnique({ where: { userId } });
    if (existing) return existing;
    return prisma.settings.create({ data: { userId, ...DEFAULT_ALLOCATION_SETTINGS } });
  },

  update: (userId: string, data: Partial<typeof DEFAULT_ALLOCATION_SETTINGS>) =>
    prisma.settings.update({ where: { userId }, data })
};
