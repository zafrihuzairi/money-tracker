'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { PersonQuickSelect } from '@/components/people/PersonQuickSelect';
import { notifyTransactionsChanged } from '@/lib/data-events';

interface Bank { id: string; name: string; }
interface Category { id: string; name: string; accountType: string; }
interface Person { id: string; name: string; }

export function ManualIncomeForm() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  // Field order per spec: Date, Amount, Source, Bank, Account, Category, Person, Note, Attachment
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [incomeType, setIncomeType] = useState('ALLOWANCE');
  const [bankId, setBankId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [personId, setPersonId] = useState('');
  const [debtDirection, setDebtDirection] = useState('THEY_OWE_ME');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/banks').then((r) => r.json()).then((d) => setBanks(d.banks ?? []));
    fetch('/api/categories?type=INCOME').then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
    fetch('/api/people').then((r) => r.json()).then((d) => setPeople(d.people ?? []));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'MANUAL',
          date,
          amount: Number(amount),
          incomeType,
          bankId,
          categoryId,
          personId: personId || undefined,
          debtDirection: incomeType === 'DEBTOR' && personId ? debtDirection : undefined,
          note: note || undefined,
          attachment: attachment || undefined
        })
      });
      if (!res.ok) throw new Error('Failed to save');
      setMessage('Saved.');
      notifyTransactionsChanged();
      setAmount('');
      setNote('');
      setAttachment('');
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Income (Allowance / Debtor / Other)</CardTitle>
        <p className="mt-1 text-xs text-black/40">These are allocated manually — no automatic split.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Date</Label>
            <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Amount (RM)</Label>
            <Input type="number" step="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label>Source (Income Type)</Label>
            <Select value={incomeType} onChange={(e) => setIncomeType(e.target.value)}>
              <option value="ALLOWANCE">Allowance</option>
              <option value="DEBTOR">Debtor</option>
              <option value="OTHER">Other Income</option>
            </Select>
          </div>
          <div>
            <Label>Bank</Label>
            <Select required value={bankId} onChange={(e) => setBankId(e.target.value)}>
              <option value="">Select bank</option>
              {banks.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Category</Label>
            <Select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          <PersonQuickSelect
            people={people}
            value={personId}
            onChange={setPersonId}
            onPersonCreated={(p) => setPeople((prev) => [...prev, p])}
          />
          {incomeType === 'DEBTOR' && personId && (
            <div className="sm:col-span-2">
              <Label>Direction</Label>
              <Select value={debtDirection} onChange={(e) => setDebtDirection(e.target.value)}>
                <option value="THEY_OWE_ME">They owe me</option>
                <option value="I_OWE_THEM">I owe them</option>
              </Select>
            </div>
          )}
          <div className="sm:col-span-2">
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <Label>Attachment (optional URL)</Label>
            <Input value={attachment} onChange={(e) => setAttachment(e.target.value)} placeholder="Receipt link" />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Add Income'}</Button>
            {message && <span className="ml-3 text-sm text-black/50">{message}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
