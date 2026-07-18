import { PrismaClient } from '@prisma/client';
import { DEFAULT_ALLOCATION_SETTINGS } from '../src/services/allocation.service';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? 'demo@moneytracker.app';

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: 'Demo User' }
  });

  await prisma.settings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, ...DEFAULT_ALLOCATION_SETTINGS }
  });

  // --- Banks -----------------------------------------------------------
  const bankDefs = [
    { key: 'aeon', name: 'AEON Bank', purpose: 'Daily Usage' },
    { key: 'kaf', name: 'KAF Digital Bank', purpose: 'Commitment & Big Purchase' },
    { key: 'ryt', name: 'Ryt Invest SavePlus', purpose: 'Investment' },
    { key: 'asnb', name: 'ASNB', purpose: 'Marriage Fund' },
    { key: 'th', name: 'Tabung Haji', purpose: 'Savings Only' }
  ] as const;

  const banks: Record<string, { id: string }> = {};
  for (const b of bankDefs) {
    const existing = await prisma.bank.findFirst({ where: { userId: user.id, name: b.name } });
    banks[b.key] = existing ?? (await prisma.bank.create({ data: { userId: user.id, name: b.name, purpose: b.purpose } }));
  }

  // --- Accounts (bucket <-> bank mapping) -------------------------------
  const accountDefs = [
    { type: 'INCOME' as const, name: 'Income', bankKey: null },
    { type: 'DAILY' as const, name: 'Daily', bankKey: 'aeon' },
    { type: 'OUTLAY' as const, name: 'Outlay', bankKey: 'kaf' },
    { type: 'SAVING' as const, name: 'Saving', bankKey: 'th' },
    { type: 'LIABILITY' as const, name: 'Liability', bankKey: null }
  ];

  const accounts: Record<string, { id: string }> = {};
  for (const a of accountDefs) {
    const existing = await prisma.account.findFirst({ where: { userId: user.id, type: a.type, name: a.name } });
    accounts[a.type] =
      existing ??
      (await prisma.account.create({
        data: {
          userId: user.id,
          type: a.type,
          name: a.name,
          bankId: a.bankKey ? banks[a.bankKey].id : undefined
        }
      }));
  }
  // Dedicated accounts for the two waterfall destinations
  const rytAccount =
    (await prisma.account.findFirst({ where: { userId: user.id, name: 'Ryt Invest SavePlus' } })) ??
    (await prisma.account.create({
      data: { userId: user.id, type: 'SAVING', name: 'Ryt Invest SavePlus', bankId: banks.ryt.id }
    }));
  const asnbAccount =
    (await prisma.account.findFirst({ where: { userId: user.id, name: 'ASNB' } })) ??
    (await prisma.account.create({
      data: { userId: user.id, type: 'SAVING', name: 'ASNB', bankId: banks.asnb.id }
    }));

  // --- Categories --------------------------------------------------------
  const categoryDefs: { name: string; type: 'INCOME' | 'DAILY' | 'OUTLAY' | 'SAVING' | 'LIABILITY' }[] = [
    // Income
    { name: 'Allowance', type: 'INCOME' },
    { name: 'Job', type: 'INCOME' },
    { name: 'Debtor', type: 'INCOME' },
    { name: 'Other Income', type: 'INCOME' },
    // Daily (AEON)
    { name: 'Groceries', type: 'DAILY' },
    { name: 'Food & Drinks', type: 'DAILY' },
    { name: 'Toll', type: 'DAILY' },
    { name: 'Parking', type: 'DAILY' },
    { name: 'Medication', type: 'DAILY' },
    { name: 'Donation', type: 'DAILY' },
    { name: 'Owe', type: 'DAILY' },
    { name: 'Others', type: 'DAILY' },
    // Outlay (KAF)
    { name: 'Equipment', type: 'OUTLAY' },
    { name: 'Subscription', type: 'OUTLAY' },
    { name: 'Shopping', type: 'OUTLAY' },
    { name: 'Wear and Tear', type: 'OUTLAY' },
    { name: 'Entertainment', type: 'OUTLAY' },
    // Saving
    { name: 'Investment', type: 'SAVING' },
    { name: 'Marriage Fund', type: 'SAVING' },
    { name: 'Emergency', type: 'SAVING' },
    // Liability
    { name: 'Father', type: 'LIABILITY' },
    { name: 'iPhone', type: 'LIABILITY' }
  ];

  for (const c of categoryDefs) {
    const existing = await prisma.category.findFirst({ where: { userId: user.id, name: c.name, accountType: c.type } });
    if (!existing) {
      await prisma.category.create({ data: { userId: user.id, name: c.name, accountType: c.type } });
    }
  }

  // --- Liabilities ---------------------------------------------------------
  const liabilityDefs = [
    { name: 'Father', targetAmount: 5000 },
    { name: 'iPhone', targetAmount: 7499 }
  ];
  for (const l of liabilityDefs) {
    const existing = await prisma.liability.findFirst({ where: { userId: user.id, name: l.name } });
    if (!existing) {
      await prisma.liability.create({ data: { userId: user.id, name: l.name, targetAmount: l.targetAmount, currentPaid: 0 } });
    }
  }

  // --- Sample person (for the People / Debtor table) -----------------------
  const existingPerson = await prisma.person.findFirst({ where: { userId: user.id, name: 'Ali' } });
  if (!existingPerson) {
    await prisma.person.create({ data: { userId: user.id, name: 'Ali', phone: '012-3456789', note: 'Colleague' } });
  }

  console.log('Seed complete for user:', email);
  console.log('Note: run this once after `prisma migrate dev`. Re-running is safe (idempotent upserts).');
  console.log('Reminder: Ryt Invest SavePlus account id =', rytAccount.id, ' / ASNB account id =', asnbAccount.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
