import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils';
import { settingsRepository } from '@/repositories/settings.repository';
import { settingsSchema } from '@/lib/validations';

export async function GET() {
  const userId = await getCurrentUserId();
  const settings = await settingsRepository.findByUser(userId);
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const userId = await getCurrentUserId();
  const parsed = settingsSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const settings = await settingsRepository.update(userId, parsed.data);
  return NextResponse.json({ settings });
}
