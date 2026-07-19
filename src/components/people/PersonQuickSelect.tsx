'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Person { id: string; name: string; }

const ADD_NEW = '__ADD_NEW__';

/**
 * Reusable Person <select> with an inline "+ Add New Person" flow.
 * Used by both ExpenseForm and Income forms so the UX is identical in
 * both places. Posts to the existing POST /api/people endpoint — no new
 * backend logic.
 */
export function PersonQuickSelect({
  people,
  value,
  onChange,
  onPersonCreated,
  label = 'Person (optional)',
  allowNone = true
}: {
  people: Person[];
  value: string;
  onChange: (id: string) => void;
  onPersonCreated: (person: Person) => void;
  label?: string;
  allowNone?: boolean;
}) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSelectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (e.target.value === ADD_NEW) {
      setAdding(true);
      return;
    }
    onChange(e.target.value);
  }

  async function saveNewPerson() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || undefined })
      });
      if (!res.ok) throw new Error('Failed to save person');
      const data = await res.json();
      onPersonCreated(data.person);
      onChange(data.person.id);
      setAdding(false);
      setName('');
      setPhone('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (adding) {
    return (
      <div>
        <Label>{label}</Label>
        <div className="glass space-y-2 rounded-2xl border border-gold-200/60 p-3 dark:border-gold-500/30">
          <Input autoFocus placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => { setAdding(false); setError(null); setName(''); setPhone(''); }}
            >
              Cancel
            </Button>
            <Button type="button" size="sm" className="flex-1" onClick={saveNewPerson} disabled={saving}>
              {saving ? 'Saving…' : 'Save & Select'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Label>{label}</Label>
      <Select value={value} onChange={handleSelectChange}>
        {allowNone && <option value="">None</option>}
        {people.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
        <option value={ADD_NEW}>+ Add New Person</option>
      </Select>
    </div>
  );
}
