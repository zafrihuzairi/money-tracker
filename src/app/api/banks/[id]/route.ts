import { NextRequest, NextResponse } from 'next/server';
import { bankRepository } from '@/repositories/bank.repository';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const bank = await bankRepository.update(params.id, body);
  return NextResponse.json({ bank });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await bankRepository.remove(params.id);
  return NextResponse.json({ ok: true });
}
