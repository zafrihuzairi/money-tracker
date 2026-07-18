import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils';
import { bankRepository } from '@/repositories/bank.repository';
import { bankSchema } from '@/lib/validations';

export async function GET() {
  const userId = await getCurrentUserId();
  const banks = await bankRepository.findWithBalance(userId);
  return NextResponse.json({ banks });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const parsed = bankSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const bank = await bankRepository.create(userId, parsed.data);
  return NextResponse.json({ bank });
}
