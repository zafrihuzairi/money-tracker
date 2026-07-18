import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils';
import { transactionRepository } from '@/repositories/transaction.repository';
import { transactionSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  const params = req.nextUrl.searchParams;
  const filters: Record<string, unknown> = {};
  if (params.get('bankId')) filters.bankId = params.get('bankId');
  if (params.get('categoryId')) filters.categoryId = params.get('categoryId');
  if (params.get('personId')) filters.personId = params.get('personId');
  if (params.get('type')) filters.type = params.get('type');
  const transactions = await transactionRepository.findAllByUser(userId, filters);
  return NextResponse.json({ transactions });
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
