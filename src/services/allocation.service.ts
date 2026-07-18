import type { AllocationBreakdown, AllocationSettings, MonthlyStatus } from '@/types';

/**
 * The automatic Job-income allocation engine.
 *
 * Rules (see project spec):
 * 1. Waterfall — only for Job income, only once per month, in this order:
 *      a) top up Ryt Invest SavePlus up to `investmentTarget` (default RM100)
 *      b) top up ASNB up to `marriageTarget` (default RM600)
 *    Each step never exceeds its target for the month and never exceeds the
 *    amount of income actually available.
 * 2. Whatever is left after the waterfall is split by percentage:
 *      Daily / Outlay / Saving / Liability (defaults 10 / 70 / 10 / 10)
 * 3. The Liability bucket is further split Father / iPhone (default 50 / 50)
 *
 * This function is pure — no I/O, no Prisma — so it is trivial to unit test.
 * Rounding: all money math is rounded to 2 decimal places at the point each
 * bucket is produced, using round-half-up, to avoid floating point drift.
 */

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateJobAllocation(
  amount: number,
  monthlyStatus: MonthlyStatus,
  settings: AllocationSettings
): AllocationBreakdown {
  if (amount <= 0) {
    throw new Error('Allocation amount must be greater than zero');
  }

  const wasAlreadyFullyFunded =
    monthlyStatus.investmentReceived >= settings.investmentTarget &&
    monthlyStatus.marriageReceived >= settings.marriageTarget;

  // Step 1: Investment waterfall (Ryt Invest SavePlus)
  const investmentRemainingTarget = Math.max(
    0,
    settings.investmentTarget - monthlyStatus.investmentReceived
  );
  const investment = round2(Math.min(amount, investmentRemainingTarget));
  const afterInvestment = round2(amount - investment);

  // Step 2: Marriage waterfall (ASNB)
  const marriageRemainingTarget = Math.max(
    0,
    settings.marriageTarget - monthlyStatus.marriageReceived
  );
  const marriage = round2(Math.min(afterInvestment, marriageRemainingTarget));
  const remainderAfterWaterfall = round2(afterInvestment - marriage);

  // Step 3: percentage split of what's left
  const daily = round2((remainderAfterWaterfall * settings.dailyPercent) / 100);
  const outlay = round2((remainderAfterWaterfall * settings.outlayPercent) / 100);
  const saving = round2((remainderAfterWaterfall * settings.savingPercent) / 100);
  // Liability computed as the remainder of the remainder so the four
  // buckets always sum exactly to remainderAfterWaterfall, even with
  // rounding at each step.
  const liability = round2(remainderAfterWaterfall - daily - outlay - saving);

  const liabilityFather = round2((liability * settings.fatherPercent) / 100);
  const liabilityIphone = round2(liability - liabilityFather);

  return {
    investment,
    marriage,
    remainderAfterWaterfall,
    daily,
    outlay,
    saving,
    liability,
    liabilityFather,
    liabilityIphone,
    wasAlreadyFullyFunded,
    updatedMonthlyStatus: {
      investmentReceived: round2(monthlyStatus.investmentReceived + investment),
      marriageReceived: round2(monthlyStatus.marriageReceived + marriage)
    }
  };
}

export const DEFAULT_ALLOCATION_SETTINGS: AllocationSettings = {
  dailyPercent: 10,
  outlayPercent: 70,
  savingPercent: 10,
  liabilityPercent: 10,
  fatherPercent: 50,
  iphonePercent: 50,
  investmentTarget: 100,
  marriageTarget: 600
};

export function currentMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}
