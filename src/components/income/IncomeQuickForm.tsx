'use client';

import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface Bank { id: string; name: string; }
interface Category { id: string; name: string; accountType: string; }
interface Person { id: string; name: string; }

type QuickIncomeType = 'ALLOWANCE' | 'JOB' | 'DEBTOR' | 'OTHER';

/**
 * Quick Income entry for the FAB bottom sheet.
 * - Allowance / Debtor / Other Income: saved directly here via the
 *   existing POST /api/income (mode: 'MANUAL') — no new business logic.
 * - Job / Freelance: this type uses the automatic allocation engine,
 *   which only lives on the full /income page, so we hand off there
 *   instead of duplicating that flow in a popout.
 */
export function IncomeQuickForm({
  onSaved,
  onCancel,
  onGoToIncomePage
}: {
  onSaved: () => void;
  onCancel: () => void;
  onGoToIncomePage: () => void;
}) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const [incomeType, setIncomeType] = useState<QuickIncomeType>('ALLOWANCE');
  const [amount, setAmount] = useState('');
  const [bankId, setBankId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [personId, setPersonId] = useState('');
  const [debtDirection, setDebtDirection] = useState('THEY_OWE_ME');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/banks').then((r) => r.json()).then((d) => setBanks(d.banks ?? []));
    fetch('/api/categories?type=INCOME').then((r) => r.json()).then((d) => setCategories(d.categories ?? []));
    fetch('/api/people').then((r) => r.json()).then((d) => setPeople(d.people ?? []));
  }, []);

  const isJob = incomeType === 'JOB';
  const nonJobCategories = categories.filter((c) => c.name !== 'Job');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (isJob) return; // handled by the CTA button instead
    if (!bankId || !categoryId || !amount) {
      setError('Sila lengkapkan semua medan wajib.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/income', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'MANUAL',
          amount: Number(amount),
          incomeType,
          bankId,
          categoryId,
          personId: incomeType === 'DEBTOR' ? personId || undefined : undefined,
          debtDirection: incomeType === 'DEBTOR' ? debtDirection : undefined,
          note: note || undefined
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ? JSON.stringify(data.error) : 'Gagal menyimpan income');
      }
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Income Type</Label>
        <Select value={incomeType} onChange={(e) => setIncomeType(e.target.value as QuickIncomeType)}>
          <option value="ALLOWANCE">Allowance</option>
          <option value="JOB">Job / Freelance</option>
          <option value="DEBTOR">Debtor</option>
          <option value="OTHER">Other Income</option>
        </Select>
      </div>

      {isJob ? (
        <div className="glass rounded-2xl border border-gold-200/60 p-4">
          <p className="mb-3 text-sm text-black/60 dark:text-white/60">
            Job income splits automatically (Ryt Invest, ASNB, Daily, Outlay, Saving, Liability) —
            this needs the full Income page.
          </p>
          <Button type="button" variant="gold" className="w-full" onClick={onGoToIncomePage}>
            Continue to Income Page <ArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Amount (RM)</Label>
              <Input type="number" step="0.01" min="0.01" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
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
            <div className={incomeType === 'DEBTOR' ? '' : 'sm:col-span-2'}>
              <Label>Category</Label>
              <Select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {nonJobCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </div>
            {incomeType === 'DEBTOR' && (
              <>
                <div>
                  <Label>Person</Label>
                  <Select value={personId} onChange={(e) => setPersonId(e.target.value)}>
                    <option value="">Select person</option>
                    {people.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Direction</Label>
                  <Select value={debtDirection} onChange={(e) => setDebtDirection(e.target.value)}>
                    <option value="THEY_OWE_ME">They owe me</option>
                    <option value="I_OWE_THEM">I owe them</option>
                  </Select>
                </div>
              </>
            )}
          </div>

          <div>
            <Label>Note</Label>
            <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save Income'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
