import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUserId } from '@/lib/utils';
import { jobIncomeSchema, manualIncomeSchema } from '@/lib/validations';
import { calculateJobAllocation, currentMonthKey } from '@/services/allocation.service';
import type { AllocationSettings } from '@/types';

/**
 * POST /api/income
 * body: { mode: 'JOB', amount, note? }  -> runs the automatic allocation engine
 *       { mode: 'MANUAL', amount, incomeType, bankId, categoryId, personId?, debtDirection?, note? }
 */
export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId();
  const body = await req.json();

  if (body.mode === 'MANUAL') {
    const parsed = manualIncomeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    const { amount, incomeType, bankId, categoryId, personId, debtDirection, note, date } = parsed.data;

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
        note,
        date: date ? new Date(date) : new Date()
      }
    });
    return NextResponse.json({ transaction: tx });
  }

  // Default / JOB mode — automatic allocation engine
  const parsed = jobIncomeSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { amount, note } = parsed.data;

  const [settingsRow, monthStatus, incomeAccount, dailyAccount, outlayAccount, savingAccount, liabilityAccount, rytAccount, asnbAccount, jobCategory, investmentCategory, marriageCategory, fatherCategory, iphoneCategory, fatherLiability, iphoneLiability] =
    await Promise.all([
      prisma.settings.findUnique({ where: { userId } }),
      (async () => {
        const month = currentMonthKey();
        const existing = await prisma.monthlyAllocationStatus.findUnique({ where: { userId_month: { userId, month } } });
        return existing ?? prisma.monthlyAllocationStatus.create({ data: { userId, month, investmentReceived: 0, marriageReceived: 0 } });
      })(),
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
      prisma.liability.findFirst({ where: { userId, name: 'iPhone' } })
    ]);

  if (!settingsRow || !incomeAccount || !dailyAccount || !outlayAccount || !savingAccount || !liabilityAccount || !rytAccount || !asnbAccount || !jobCategory || !investmentCategory || !marriageCategory || !fatherCategory || !iphoneCategory) {
    return NextResponse.json({ error: 'Accounts/categories not fully seeded — run `npm run db:seed`' }, { status: 500 });
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

  const breakdown = calculateJobAllocation(
    amount,
    { investmentReceived: Number(monthStatus.investmentReceived), marriageReceived: Number(monthStatus.marriageReceived) },
    settings
  );

  // default bank for Daily/Outlay/Saving/Liability entries: fall back to the account's linked bank
  const dailyBank = await prisma.bank.findFirst({ where: { userId, accounts: { some: { id: dailyAccount.id } } } });
  const outlayBank = await prisma.bank.findFirst({ where: { userId, accounts: { some: { id: outlayAccount.id } } } });
  const savingBank = await prisma.bank.findFirst({ where: { userId, accounts: { some: { id: savingAccount.id } } } });
  const rytBank = await prisma.bank.findFirst({ where: { userId, accounts: { some: { id: rytAccount.id } } } });
  const asnbBank = await prisma.bank.findFirst({ where: { userId, accounts: { some: { id: asnbAccount.id } } } });

  const result = await prisma.$transaction(async (txClient) => {
    // 1. the parent Job income record (recorded, but not itself sitting in a spendable bank)
    const parent = await txClient.transaction.create({
      data: {
        userId,
        bankId: (rytBank ?? outlayBank ?? dailyBank)!.id,
        accountId: incomeAccount.id,
        categoryId: jobCategory.id,
        amount,
        type: 'INCOME',
        incomeType: 'JOB',
        note
      }
    });

    const children: { label: string; amount: number; bankId?: string; accountId: string; categoryId: string }[] = [
      { label: 'Ryt Invest SavePlus', amount: breakdown.investment, bankId: rytBank?.id, accountId: rytAccount.id, categoryId: investmentCategory.id },
      { label: 'ASNB', amount: breakdown.marriage, bankId: asnbBank?.id, accountId: asnbAccount.id, categoryId: marriageCategory.id },
      { label: 'Daily', amount: breakdown.daily, bankId: dailyBank?.id, accountId: dailyAccount.id, categoryId: jobCategory.id },
      { label: 'Outlay', amount: breakdown.outlay, bankId: outlayBank?.id, accountId: outlayAccount.id, categoryId: jobCategory.id },
      { label: 'Saving (Tabung Haji)', amount: breakdown.saving, bankId: savingBank?.id, accountId: savingAccount.id, categoryId: jobCategory.id },
      { label: 'Liability - Father', amount: breakdown.liabilityFather, accountId: liabilityAccount.id, categoryId: fatherCategory.id },
      { label: 'Liability - iPhone', amount: breakdown.liabilityIphone, accountId: liabilityAccount.id, categoryId: iphoneCategory.id }
    ];

    const createdChildren = [];
    for (const c of children) {
      if (c.amount <= 0) continue;
      const created = await txClient.transaction.create({
        data: {
          userId,
          bankId: c.bankId ?? (rytBank ?? outlayBank ?? dailyBank)!.id,
          accountId: c.accountId,
          categoryId: c.categoryId,
          amount: c.amount,
          type: 'INCOME',
          incomeType: 'JOB',
          note: `Auto split from Job income (${c.label})`,
          parentIncomeId: parent.id
        }
      });
      createdChildren.push(created);
    }

    await txClient.monthlyAllocationStatus.update({
      where: { userId_month: { userId, month: currentMonthKey() } },
      data: breakdown.updatedMonthlyStatus
    });

    if (fatherLiability && breakdown.liabilityFather > 0) {
      await txClient.liability.update({ where: { id: fatherLiability.id }, data: { currentPaid: { increment: breakdown.liabilityFather } } });
    }
    if (iphoneLiability && breakdown.liabilityIphone > 0) {
      await txClient.liability.update({ where: { id: iphoneLiability.id }, data: { currentPaid: { increment: breakdown.liabilityIphone } } });
    }

    return { parent, children: createdChildren };
  });

  return NextResponse.json({ breakdown, ...result });
}
