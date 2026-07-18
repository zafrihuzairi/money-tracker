import { NextRequest, NextResponse } from 'next/server';
import { transactionRepository } from '@/repositories/transaction.repository';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const transaction = await transactionRepository.update(params.id, body);
  return NextResponse.json({ transaction });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await transactionRepository.remove(params.id);
  return NextResponse.json({ ok: true });
}
