import { NextRequest, NextResponse } from 'next/server';
import { liabilityRepository } from '@/repositories/liability.repository';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await liabilityRepository.remove(id);
  return NextResponse.json({ ok: true });
}
