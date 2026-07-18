import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils';
import { categoryRepository } from '@/repositories/category.repository';
import { categorySchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId();
  const type = req.nextUrl.searchParams.get('type');
  const categories = type
    ? await categoryRepository.findByType(userId, type as any)
    : await categoryRepository.findAllByUser(userId);
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const parsed = categorySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const category = await categoryRepository.create(userId, parsed.data);
  return NextResponse.json({ category });
}
