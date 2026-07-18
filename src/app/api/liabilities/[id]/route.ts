import { NextRequest, NextResponse } from 'next/server';
import { liabilityRepository } from '@/repositories/liability.repository';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await liabilityRepository.remove(params.id);
  return NextResponse.json({ ok: true });
}
