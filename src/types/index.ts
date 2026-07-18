export type AccountType = 'INCOME' | 'DAILY' | 'OUTLAY' | 'SAVING' | 'LIABILITY';
export type TransactionType = 'INCOME' | 'EXPENSE';
export type IncomeType = 'ALLOWANCE' | 'JOB' | 'DEBTOR' | 'OTHER';
export type DebtDirection = 'THEY_OWE_ME' | 'I_OWE_THEM';

export interface AllocationSettings {
  dailyPercent: number;
  outlayPercent: number;
  savingPercent: number;
  liabilityPercent: number;
  fatherPercent: number;
  iphonePercent: number;
  investmentTarget: number;
  marriageTarget: number;
}

export interface MonthlyStatus {
  investmentReceived: number;
  marriageReceived: number;
}

export interface AllocationBreakdown {
  /** RM100 waterfall step */
  investment: number;
  /** RM600 waterfall step */
  marriage: number;
  /** amount left after the waterfall, before percentage split */
  remainderAfterWaterfall: number;
  daily: number;
  outlay: number;
  saving: number;
  liability: number;
  liabilityFather: number;
  liabilityIphone: number;
  /** updated monthly counters, to persist back to MonthlyAllocationStatus */
  updatedMonthlyStatus: MonthlyStatus;
  /** true once both investment + marriage targets were already full BEFORE this income */
  wasAlreadyFullyFunded: boolean;
}
