import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * "Soft reset" — wipes all transaction/activity data so you can test the
 * app from a clean slate, WITHOUT re-seeding banks, accounts, categories,
 * liabilities (targets), people, or settings. Use this when you just want
 * to clear out test transactions.
 *
 * For a full reset (including config), use `npx prisma migrate reset`
 * instead (drops and recreates the whole database, then re-seeds).
 */
async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? 'demo@moneytracker.app';
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log('No user found for', email, '— nothing to reset.');
    return;
  }

  const deleted = await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.monthlyAllocationStatus.deleteMany({ where: { userId: user.id } });
  await prisma.liability.updateMany({ where: { userId: user.id }, data: { currentPaid: 0 } });

  console.log(`Deleted ${deleted.count} transaction(s).`);
  console.log('Monthly allocation counters (Ryt Invest / ASNB) cleared.');
  console.log('Liability "currentPaid" reset to 0 for all liabilities.');
  console.log('Banks, accounts, categories, people, and settings were left untouched.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
