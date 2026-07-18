import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils';
import { prisma } from '@/lib/prisma';

// GET /api/reports?groupBy=bank|category|person|month
export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  const groupBy = req.nextUrl.searchParams.get('groupBy') ?? 'month';

  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: { bank: true, category: true, person: true }
  });

  const buckets: Record<string, { income: number; expense: number }> = {};
  for (const t of transactions) {
    let key = 'Unknown';
    if (groupBy === 'bank') key = t.bank?.name ?? 'Unknown';
    else if (groupBy === 'category') key = t.category?.name ?? 'Unknown';
    else if (groupBy === 'person') key = t.person?.name ?? 'No person';
    else key = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;

    if (!buckets[key]) buckets[key] = { income: 0, expense: 0 };
    const amt = Number(t.amount);
    if (t.type === 'INCOME') buckets[key].income += amt;
    else buckets[key].expense += amt;
  }

  const rows = Object.entries(buckets)
    .map(([label, v]) => ({ label, ...v, net: v.income - v.expense }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return NextResponse.json({ groupBy, rows });
}
