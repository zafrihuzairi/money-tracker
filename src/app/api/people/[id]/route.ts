import { NextRequest, NextResponse } from 'next/server';
import { personRepository } from '@/repositories/person.repository';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await personRepository.remove(id);
  return NextResponse.json({ ok: true });
}
