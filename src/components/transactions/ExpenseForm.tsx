'use client';

import { useEffect, useMemo, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface Bank { id: string; name: string; }
interface Account { id: string; type: string; name: string; bankId: string | null; }
interface Category { id: string; name: string; accountType: string; }
interface Person { id: string; name: string; }

const SPENDING_TYPES = ['DAILY', 'OUTLAY', 'SAVING', 'LIABILITY'] as const;

/**
 * Expense transaction entry — a thin UI form over the EXISTING
 * `POST /api/transactions` endpoint (type: 'EXPENSE'). No new business
 * logic, calculation, or allocation rule is introduced here; saving simply
 * creates a normal Transaction row, which the existing bank-balance,
 * dashboard, and report queries already aggregate automatically.
 */
export function ExpenseForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [bankId, setBankId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [personId, setPersonId] = useState('');
  const [note, setNote] = useState('');
  const [attachment, setAttachment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/banks').then((r) => r.json()).then((d) => setBanks(d.banks ?? []));
    fetch('/api/accounts').then((r) => r.json()).then((d) => setAccounts(d.accounts ?? []));
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
    fetch('/api/people').then((r) => r.json()).then((d) => setPeople(d.people ?? []));
  }, []);

  const spendingAccounts = useMemo(
    () => accounts.filter((a) => (SPENDING_TYPES as readonly string[]).includes(a.type)),
    [accounts]
  );
  const selectedAccount = accounts.find((a) => a.id === accountId);
  const filteredCategories = useMemo(
    () => (selectedAccount ? categories.filter((c) => c.accountType === selectedAccount.type) : []),
    [categories, selectedAccount]
  );

  // convenience: auto-pick the bank linked to the chosen account, if any
  useEffect(() => {
    if (selectedAccount?.bankId) setBankId(selectedAccount.bankId);
  }, [selectedAccount]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!bankId || !accountId || !categoryId || !amount) {
      setError('Sila lengkapkan semua medan wajib.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          bankId,
          accountId,
          categoryId,
          personId: personId || undefined,
          amount: Number(amount),
          type: 'EXPENSE',
          note: note || undefined,
          attachment: attachment || undefined
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ? JSON.stringify(data.error) : 'Gagal menyimpan transaksi');
      }
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Date</Label>
          <Input type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Amount (RM)</Label>
          <Input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <Label>Account</Label>
          <Select required value={accountId} onChange={(e) => { setAccountId(e.target.value); setCategoryId(''); }}>
            <option value="">Select account</option>
            {spendingAccounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
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
          <Select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={!accountId}>
            <option value="">{accountId ? 'Select category' : 'Choose an account first'}</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Person (optional)</Label>
          <Select value={personId} onChange={(e) => setPersonId(e.target.value)}>
            <option value="">None</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>Note</Label>
        <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Lunch with client" />
      </div>

      <div>
        <Label>Attachment (optional URL)</Label>
        <Input value={attachment} onChange={(e) => setAttachment(e.target.value)} placeholder="Receipt link" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive" className="flex-1" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save Expense'}
        </Button>
      </div>
    </form>
  );
}
