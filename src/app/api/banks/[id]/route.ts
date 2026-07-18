import { NextRequest, NextResponse } from 'next/server';
import { bankRepository } from '@/repositories/bank.repository';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const bank = await bankRepository.update(id, body);
  return NextResponse.json({ bank });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await bankRepository.remove(id);
  return NextResponse.json({ ok: true });
}
