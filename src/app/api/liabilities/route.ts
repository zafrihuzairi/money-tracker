import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils';
import { liabilityRepository } from '@/repositories/liability.repository';
import { liabilitySchema } from '@/lib/validations';

export async function GET() {
  const userId = await getCurrentUserId();
  const liabilities = await liabilityRepository.findAllByUser(userId);
  return NextResponse.json({ liabilities });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const parsed = liabilitySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const liability = await liabilityRepository.create(userId, parsed.data);
  return NextResponse.json({ liability });
}
