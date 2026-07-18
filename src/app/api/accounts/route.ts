import { NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils';
import { accountRepository } from '@/repositories/account.repository';

export async function GET() {
  const userId = await getCurrentUserId();
  const accounts = await accountRepository.findAllByUser(userId);
  return NextResponse.json({ accounts });
}
