'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LiabilityForm() {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch('/api/liabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, targetAmount: Number(targetAmount) })
    });
    setSubmitting(false);
    window.location.reload();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Label>Name</Label>
        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Car Loan" />
      </div>
      <div className="flex-1">
        <Label>Target Amount (RM)</Label>
        <Input required type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} />
      </div>
      <Button type="submit" disabled={submitting}>{submitting ? 'Adding…' : 'Add Liability'}</Button>
    </form>
  );
}
