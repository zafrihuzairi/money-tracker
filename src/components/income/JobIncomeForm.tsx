'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRM } from '@/lib/utils';
import { notifyTransactionsChanged } from '@/lib/data-events';

interface Breakdown {
  investment: number;
  marriage: number;
  remainderAfterWaterfall: number;
  daily: number;
  outlay: number;
  saving: number;
  liability: number;
  liabilityFather: number;
  liabilityIphone: number;
  wasAlreadyFullyFunded: boolean;
}

export function JobIncomeForm() {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Breakdown | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'JOB', amount: Number(amount), note })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ? JSON.stringify(data.error) : 'Failed to allocate');
      setResult(data.breakdown);
      notifyTransactionsChanged();
      setAmount('');
      setNote('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Income — Automatic Allocation</CardTitle>
        <p className="mt-1 text-xs text-black/40">
          RM100 → Ryt Invest SavePlus and RM600 → ASNB are topped up first (once per month), then the
          remainder splits Daily 10% / Outlay 70% / Saving 10% / Liability 10%.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="amount">Amount (RM)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 1000"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. July freelance project" />
          </div>
          <Button type="submit" variant="gold" disabled={loading}>
            {loading ? 'Allocating…' : 'Allocate Income'}
          </Button>
        </form>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        {result && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <BreakdownItem label="Ryt Invest" value={result.investment} highlight />
            <BreakdownItem label="ASNB" value={result.marriage} highlight />
            <BreakdownItem label="Daily (AEON)" value={result.daily} />
            <BreakdownItem label="Outlay (KAF)" value={result.outlay} />
            <BreakdownItem label="Saving (TH)" value={result.saving} />
            <BreakdownItem label="Liability — Father" value={result.liabilityFather} />
            <BreakdownItem label="Liability — iPhone" value={result.liabilityIphone} />
            <BreakdownItem label="Mode" value={0} text={result.wasAlreadyFullyFunded ? 'Mode 2' : 'Mode 1'} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BreakdownItem({ label, value, text, highlight }: { label: string; value: number; text?: string; highlight?: boolean }) {
  return (
    <div
      className={
        highlight
          ? 'rounded-lg border border-gold-200/70 bg-gold-50 p-3 dark:border-gold-500/30 dark:bg-gold-500/15'
          : 'rounded-lg bg-black/5 p-3'
      }
    >
      <p className="text-[11px] uppercase tracking-wide text-black/40">{label}</p>
      <p className="text-sm font-semibold text-ink-900">{text ?? formatRM(value)}</p>
    </div>
  );
}
