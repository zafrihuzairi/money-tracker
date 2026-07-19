import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils';
import { transactionRepository, type TransactionFilters } from '@/repositories/transaction.repository';
import { transactionSchema } from '@/lib/validations';

// Defensive: this list changes every time a transaction is added/deleted,
// so it must never be served from a cache (Vercel/CDN/Next.js route cache).
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/transactions — server-side paginated + filtered list.
 * Query params: page, pageSize, dateFrom, dateTo, month, year, bankId,
 * accountId, categoryId, personId, type, amountMin, amountMax, search
 */
export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  const params = req.nextUrl.searchParams;

  const page = Math.max(1, Number(params.get('page') ?? '1'));
  const pageSize = Math.min(100, Math.max(1, Number(params.get('pageSize') ?? '20')));

  const filters: TransactionFilters = {
    dateFrom: params.get('dateFrom') || undefined,
    dateTo: params.get('dateTo') || undefined,
    month: params.get('month') ? Number(params.get('month')) : undefined,
    year: params.get('year') ? Number(params.get('year')) : undefined,
    bankId: params.get('bankId') || undefined,
    accountId: params.get('accountId') || undefined,
    categoryId: params.get('categoryId') || undefined,
    personId: params.get('personId') || undefined,
    type: (params.get('type') as 'INCOME' | 'EXPENSE' | null) || undefined,
    amountMin: params.get('amountMin') ? Number(params.get('amountMin')) : undefined,
    amountMax: params.get('amountMax') ? Number(params.get('amountMax')) : undefined,
    search: params.get('search') || undefined
  };

  const result = await transactionRepository.findPaginated(userId, filters, page, pageSize);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const parsed = transactionSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { date, ...rest } = parsed.data;
  const transaction = await transactionRepository.create(userId, {
    ...rest,
    userId,
    date: date ? new Date(date) : new Date()
  });
  return NextResponse.json({ transaction });
}
