import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils';
import { jobIncomeSchema, manualIncomeSchema } from '@/lib/validations';
import { calculateJobAllocation, currentMonthKey } from '@/services/allocation.service';
import type { AllocationSettings } from '@/types';

/**
 * POST /api/income
 * body: { mode: 'JOB', amount, note? }  -> runs the automatic allocation engine
 *       { mode: 'MANUAL', amount, incomeType, bankId, categoryId, personId?, debtDirection?, note?, attachment?, date? }
 */
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const body = await req.json();

  if (body.mode === 'MANUAL') {
    const parsed = manualIncomeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const { amount, incomeType, bankId, categoryId, personId, debtDirection, note, attachment, date } = parsed.data;

    const incomeAccount = await prisma.account.findFirst({ where: { userId, type: 'INCOME' } });
    if (!incomeAccount) return NextResponse.json({ error: 'Income account not configured' }, { status: 400 });

    const tx = await prisma.transaction.create({
      data: {
        userId,
        bankId,
        accountId: incomeAccount.id,
        categoryId,
        personId,
        amount,
        type: 'INCOME',
        incomeType,
        debtDirection,
        attachment,
        note,
        date: date ? new Date(date) : new Date()
      }
    });
    return NextResponse.json({ transaction: tx });
  }

  // Default / JOB mode — automatic allocation engine, routed through Bank Islam.
  const parsed = jobIncomeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { amount, note } = parsed.data;

  const [
    settingsRow,
    incomeAccount,
    dailyAccount,
    outlayAccount,
    savingAccount,
    liabilityAccount,
    rytAccount,
    asnbAccount,
    jobCategory,
    investmentCategory,
    marriageCategory,
    fatherCategory,
    iphoneCategory,
    fatherLiability,
    iphoneLiability,
    bankIslam
  ] = await Promise.all([
    prisma.settings.findUnique({ where: { userId } }),
    prisma.account.findFirst({ where: { userId, type: 'INCOME' } }),
    prisma.account.findFirst({ where: { userId, type: 'DAILY' } }),
    prisma.account.findFirst({ where: { userId, type: 'OUTLAY' } }),
    prisma.account.findFirst({ where: { userId, type: 'SAVING', name: 'Saving' } }),
    prisma.account.findFirst({ where: { userId, type: 'LIABILITY' } }),
    prisma.account.findFirst({ where: { userId, name: 'Ryt Invest SavePlus' } }),
    prisma.account.findFirst({ where: { userId, name: 'ASNB' } }),
    prisma.category.findFirst({ where: { userId, name: 'Job' } }),
    prisma.category.findFirst({ where: { userId, name: 'Investment' } }),
    prisma.category.findFirst({ where: { userId, name: 'Marriage Fund' } }),
    prisma.category.findFirst({ where: { userId, name: 'Father' } }),
    prisma.category.findFirst({ where: { userId, name: 'iPhone' } }),
    prisma.liability.findFirst({ where: { userId, name: 'Father' } }),
    prisma.liability.findFirst({ where: { userId, name: 'iPhone' } }),
    prisma.bank.findFirst({ where: { userId, name: 'Bank Islam' } })
  ]);

  if (
    !settingsRow || !incomeAccount || !dailyAccount || !outlayAccount || !savingAccount ||
    !liabilityAccount || !rytAccount || !asnbAccount || !jobCategory || !investmentCategory ||
    !marriageCategory || !fatherCategory || !iphoneCategory || !bankIslam
  ) {
    return NextResponse.json({ error: 'Accounts/categories/banks not fully seeded — run `npm run db:seed`' }, { status: 500 });
  }

  const settings: AllocationSettings = {
    dailyPercent: Number(settingsRow.dailyPercent),
    outlayPercent: Number(settingsRow.outlayPercent),
    savingPercent: Number(settingsRow.savingPercent),
    liabilityPercent: Number(settingsRow.liabilityPercent),
    fatherPercent: Number(settingsRow.fatherPercent),
    iphonePercent: Number(settingsRow.iphonePercent),
    investmentTarget: Number(settingsRow.investmentTarget),
    marriageTarget: Number(settingsRow.marriageTarget)
  };

  const [dailyBank, outlayBank, savingBank, rytBank, asnbBank] = await Promise.all([
    prisma.bank.findFirst({ where: { userId, accounts: { some: { id: dailyAccount.id } } } }),
    prisma.bank.findFirst({ where: { userId, accounts: { some: { id: outlayAccount.id } } } }),
    prisma.bank.findFirst({ where: { userId, accounts: { some: { id: savingAccount.id } } } }),
    prisma.bank.findFirst({ where: { userId, accounts: { some: { id: rytAccount.id } } } }),
    prisma.bank.findFirst({ where: { userId, accounts: { some: { id: asnbAccount.id } } } })
  ]);

  const month = currentMonthKey();

  // Ensure the monthly counter row exists — this upsert is atomic (unique
  // constraint on [userId, month]), so it's safe even if two requests race
  // to create it for the first time this month.
  await prisma.monthlyAllocationStatus.upsert({
    where: { userId_month: { userId, month } },
    update: {},
    create: { userId, month, investmentReceived: 0, marriageReceived: 0 }
  });

  const result = await prisma.$transaction(async (txClient) => {
    // --- Concurrency fix -------------------------------------------------
    // Root cause of the "Ryt Invest balance too high" bug: this row used to
    // be read OUTSIDE the transaction, so two overlapping requests (double
    // click, double network retry, two tabs) could both read "RM0 received
    // this month" and each allocate a fresh RM100, overshooting the monthly
    // cap. `SELECT ... FOR UPDATE` takes a row lock: the second concurrent
    // request now blocks here until the first one commits, then reads the
    // ALREADY-UPDATED counter — so the RM100/RM600 monthly cap can never be
    // exceeded, no matter how many requests arrive at once.
    const locked = await txClient.$queryRaw<
      { id: string; investmentReceived: unknown; marriageReceived: unknown }[]
    >`SELECT id, "investmentReceived", "marriageReceived" FROM "MonthlyAllocationStatus"
      WHERE "userId" = ${userId} AND "month" = ${month} FOR UPDATE`;

    const current = locked[0];
    if (!current) throw new Error('Monthly allocation status row missing after upsert');

    const breakdown = calculateJobAllocation(
      amount,
      { investmentReceived: Number(current.investmentReceived), marriageReceived: Number(current.marriageReceived) },
      settings
    );

    // 1. Parent Job income lands fully in Bank Islam.
    const parent = await txClient.transaction.create({
      data: {
        userId,
        bankId: bankIslam.id,
        accountId: incomeAccount.id,
        categoryId: jobCategory.id,
        amount,
        type: 'INCOME',
        incomeType: 'JOB',
        note
      }
    });

    // 2. Bank Islam then distributes to each destination. Buckets with a
    //    spendable destination bank get TWO legs (money leaves Bank Islam,
    //    then arrives at the destination bank) so both balances stay
    //    accurate. Liability payments have no destination bank — they're
    //    simply an outflow from Bank Islam.
    const transfers: {
      label: string;
      amount: number;
      accountId: string;
      categoryId: string;
      destinationBankId?: string;
    }[] = [
      { label: 'Ryt Invest SavePlus', amount: breakdown.investment, accountId: rytAccount.id, categoryId: investmentCategory.id, destinationBankId: rytBank?.id },
      { label: 'ASNB', amount: breakdown.marriage, accountId: asnbAccount.id, categoryId: marriageCategory.id, destinationBankId: asnbBank?.id },
      { label: 'Daily', amount: breakdown.daily, accountId: dailyAccount.id, categoryId: jobCategory.id, destinationBankId: dailyBank?.id },
      { label: 'Outlay', amount: breakdown.outlay, accountId: outlayAccount.id, categoryId: jobCategory.id, destinationBankId: outlayBank?.id },
      { label: 'Saving (Tabung Haji)', amount: breakdown.saving, accountId: savingAccount.id, categoryId: jobCategory.id, destinationBankId: savingBank?.id },
      { label: 'Liability - Father', amount: breakdown.liabilityFather, accountId: liabilityAccount.id, categoryId: fatherCategory.id },
      { label: 'Liability - iPhone', amount: breakdown.liabilityIphone, accountId: liabilityAccount.id, categoryId: iphoneCategory.id }
    ];

    const createdChildren = [];
    for (const t of transfers) {
      if (t.amount <= 0) continue;

      const outLeg = await txClient.transaction.create({
        data: {
          userId,
          bankId: bankIslam.id,
          accountId: t.accountId,
          categoryId: t.categoryId,
          amount: t.amount,
          type: 'EXPENSE',
          incomeType: 'JOB',
          note: `Transfer to ${t.label}${t.destinationBankId ? ' (via Bank Islam)' : ''}`,
          parentIncomeId: parent.id
        }
      });
      createdChildren.push(outLeg);

      if (t.destinationBankId) {
        const inLeg = await txClient.transaction.create({
          data: {
            userId,
            bankId: t.destinationBankId,
            accountId: t.accountId,
            categoryId: t.categoryId,
            amount: t.amount,
            type: 'INCOME',
            incomeType: 'JOB',
            note: `Transfer from Bank Islam (${t.label})`,
            parentIncomeId: parent.id
          }
        });
        createdChildren.push(inLeg);
      }
    }

    await txClient.monthlyAllocationStatus.update({
      where: { id: current.id },
      data: breakdown.updatedMonthlyStatus
    });

    if (fatherLiability && breakdown.liabilityFather > 0) {
      await txClient.liability.update({ where: { id: fatherLiability.id }, data: { currentPaid: { increment: breakdown.liabilityFather } } });
    }
    if (iphoneLiability && breakdown.liabilityIphone > 0) {
      await txClient.liability.update({ where: { id: iphoneLiability.id }, data: { currentPaid: { increment: breakdown.liabilityIphone } } });
    }

    return { parent, children: createdChildren, breakdown };
  });

  return NextResponse.json({ breakdown: result.breakdown, parent: result.parent, children: result.children });
}
