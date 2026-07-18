import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/utils';
import { personRepository } from '@/repositories/person.repository';
import { personSchema } from '@/lib/validations';

export async function GET() {
  const userId = await getCurrentUserId();
  const people = await personRepository.findAllByUser(userId);
  return NextResponse.json({ people });
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const parsed = personSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const person = await personRepository.create(userId, parsed.data);
  return NextResponse.json({ person });
}
