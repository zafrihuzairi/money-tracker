import { NextRequest, NextResponse } from 'next/server';
import { transactionRepository } from '@/repositories/transaction.repository';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const transaction = await transactionRepository.update(id, body);
  return NextResponse.json({ transaction });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await transactionRepository.remove(id);
  return NextResponse.json({ ok: true });
}
