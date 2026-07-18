import { describe, it, expect } from 'vitest';
import { calculateJobAllocation, DEFAULT_ALLOCATION_SETTINGS, currentMonthKey } from './allocation.service';

const settings = DEFAULT_ALLOCATION_SETTINGS;

describe('calculateJobAllocation — Mode 1 (targets not yet reached)', () => {
  it('matches the spec example: RM1000 on a fresh month', () => {
    const result = calculateJobAllocation(1000, { investmentReceived: 0, marriageReceived: 0 }, settings);
    expect(result.investment).toBe(100);
    expect(result.marriage).toBe(600);
    expect(result.remainderAfterWaterfall).toBe(300);
    expect(result.daily).toBe(30);
    expect(result.outlay).toBe(210);
    expect(result.saving).toBe(30);
    expect(result.liability).toBe(30);
    expect(result.liabilityFather).toBe(15);
    expect(result.liabilityIphone).toBe(15);
    expect(result.updatedMonthlyStatus).toEqual({ investmentReceived: 100, marriageReceived: 600 });
  });

  it('never over-funds the RM100 investment target when income is small', () => {
    const result = calculateJobAllocation(50, { investmentReceived: 0, marriageReceived: 0 }, settings);
    expect(result.investment).toBe(50);
    expect(result.marriage).toBe(0);
    expect(result.remainderAfterWaterfall).toBe(0);
  });

  it('tops up a partially-filled investment target without exceeding it', () => {
    const result = calculateJobAllocation(1000, { investmentReceived: 70, marriageReceived: 0 }, settings);
    expect(result.investment).toBe(30); // only RM30 needed to reach RM100
    expect(result.updatedMonthlyStatus.investmentReceived).toBe(100);
    expect(result.marriage).toBe(600);
  });
});

describe('calculateJobAllocation — Mode 2 (targets already reached)', () => {
  it('matches the spec example: RM600 after both targets already met', () => {
    const result = calculateJobAllocation(600, { investmentReceived: 100, marriageReceived: 600 }, settings);
    expect(result.investment).toBe(0);
    expect(result.marriage).toBe(0);
    expect(result.remainderAfterWaterfall).toBe(600);
    expect(result.daily).toBe(60);
    expect(result.outlay).toBe(420);
    expect(result.saving).toBe(60);
    expect(result.liability).toBe(60);
    expect(result.liabilityFather).toBe(30);
    expect(result.liabilityIphone).toBe(30);
    expect(result.wasAlreadyFullyFunded).toBe(true);
  });
});

describe('calculateJobAllocation — invariants', () => {
  it('all buckets always sum back to the original amount', () => {
    const cases = [
      [1000, 0, 0],
      [600, 100, 600],
      [50, 0, 0],
      [1234.56, 40, 300],
      [999.99, 0, 599.99]
    ] as const;
    for (const [amount, inv, mar] of cases) {
      const r = calculateJobAllocation(amount, { investmentReceived: inv, marriageReceived: mar }, settings);
      const total = r.investment + r.marriage + r.daily + r.outlay + r.saving + r.liability;
      expect(Math.round(total * 100) / 100).toBe(Math.round(amount * 100) / 100);
      // liability father + iphone must reconstruct liability
      expect(Math.round((r.liabilityFather + r.liabilityIphone) * 100) / 100).toBe(r.liability);
    }
  });

  it('throws on zero or negative amounts', () => {
    expect(() => calculateJobAllocation(0, { investmentReceived: 0, marriageReceived: 0 }, settings)).toThrow();
    expect(() => calculateJobAllocation(-10, { investmentReceived: 0, marriageReceived: 0 }, settings)).toThrow();
  });
});

describe('currentMonthKey', () => {
  it('formats as YYYY-MM', () => {
    expect(currentMonthKey(new Date('2026-07-18'))).toBe('2026-07');
    expect(currentMonthKey(new Date('2026-01-05'))).toBe('2026-01');
  });
});
