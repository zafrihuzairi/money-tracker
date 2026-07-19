import { z } from 'zod';

export const jobIncomeSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  note: z.string().optional()
});

export const manualIncomeSchema = z.object({
  amount: z.number().positive(),
  incomeType: z.enum(['ALLOWANCE', 'DEBTOR', 'OTHER']),
  bankId: z.string().min(1),
  categoryId: z.string().min(1),
  personId: z.string().optional(),
  debtDirection: z.enum(['THEY_OWE_ME', 'I_OWE_THEM']).optional(),
  note: z.string().optional(),
  attachment: z.string().optional(),
  date: z.string().optional()
});

export const transactionSchema = z.object({
  date: z.string().optional(),
  bankId: z.string().min(1),
  accountId: z.string().min(1),
  categoryId: z.string().min(1),
  personId: z.string().optional(),
  amount: z.number().positive(),
  type: z.enum(['INCOME', 'EXPENSE']),
  note: z.string().optional(),
  attachment: z.string().optional()
});

export const personSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  note: z.string().optional()
});

export const liabilitySchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().positive(),
  currentPaid: z.number().min(0).optional()
});

export const bankSchema = z.object({
  name: z.string().min(1),
  purpose: z.string().optional()
});

export const categorySchema = z.object({
  name: z.string().min(1),
  accountType: z.enum(['INCOME', 'DAILY', 'OUTLAY', 'SAVING', 'LIABILITY']),
  accountId: z.string().optional()
});

export const settingsSchema = z.object({
  dailyPercent: z.number().min(0).max(100),
  outlayPercent: z.number().min(0).max(100),
  savingPercent: z.number().min(0).max(100),
  liabilityPercent: z.number().min(0).max(100),
  fatherPercent: z.number().min(0).max(100),
  iphonePercent: z.number().min(0).max(100),
  investmentTarget: z.number().min(0),
  marriageTarget: z.number().min(0)
});
