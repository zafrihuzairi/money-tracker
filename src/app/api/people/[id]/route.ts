import { NextRequest, NextResponse } from 'next/server';
import { personRepository } from '@/repositories/person.repository';

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await personRepository.remove(params.id);
  return NextResponse.json({ ok: true });
}
