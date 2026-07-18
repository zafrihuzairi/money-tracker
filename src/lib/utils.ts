import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRM(amount: number | string): string {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `RM ${n.toLocaleString('en-MY', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Single-user demo mode: the whole app runs for one seeded user so there is
 * no auth flow to wire up. Swap this out for real session lookup later.
 */
export async function getCurrentUserId(): Promise<string> {
  const { prisma } = await import('./prisma');
  const email = process.env.DEMO_USER_EMAIL ?? 'demo@moneytracker.app';
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  return user.id;
}
