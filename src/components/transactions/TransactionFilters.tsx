'use client';

import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export interface FilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  month: string;
  year: string;
  bankId: string;
  accountId: string;
  categoryId: string;
  personId: string;
  type: string;
  amountMin: string;
  amountMax: string;
}

export const EMPTY_FILTERS: FilterState = {
  search: '', dateFrom: '', dateTo: '', month: '', year: '',
  bankId: '', accountId: '', categoryId: '', personId: '', type: '',
  amountMin: '', amountMax: ''
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface Option { id: string; name: string; }

export function TransactionFilters({
  filters,
  onChange,
  banks,
  accounts,
  categories,
  people,
  years
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  banks: Option[];
  accounts: Option[];
  categories: Option[];
  people: Option[];
  years: number[];
}) {
  function set<K extends keyof FilterState>(key: K, value: string) {
    onChange({ ...filters, [key]: value });
  }

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div>
        <Label>Search</Label>
        <Input
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
          placeholder="Note, category, or bank…"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <Label>Date From</Label>
          <Input type="date" value={filters.dateFrom} onChange={(e) => set('dateFrom', e.target.value)} />
        </div>
        <div>
          <Label>Date To</Label>
          <Input type="date" value={filters.dateTo} onChange={(e) => set('dateTo', e.target.value)} />
        </div>
        <div>
          <Label>Month</Label>
          <Select value={filters.month} onChange={(e) => set('month', e.target.value)}>
            <option value="">Any</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Year</Label>
          <Select value={filters.year} onChange={(e) => set('year', e.target.value)}>
            <option value="">Any</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <Label>Type</Label>
          <Select value={filters.type} onChange={(e) => set('type', e.target.value)}>
            <option value="">All</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </Select>
        </div>
        <div>
          <Label>Bank</Label>
          <Select value={filters.bankId} onChange={(e) => set('bankId', e.target.value)}>
            <option value="">All</option>
            {banks.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Account</Label>
          <Select value={filters.accountId} onChange={(e) => set('accountId', e.target.value)}>
            <option value="">All</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Select value={filters.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <Label>Person</Label>
          <Select value={filters.personId} onChange={(e) => set('personId', e.target.value)}>
            <option value="">All</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Amount Min (RM)</Label>
          <Input type="number" step="0.01" value={filters.amountMin} onChange={(e) => set('amountMin', e.target.value)} />
        </div>
        <div>
          <Label>Amount Max (RM)</Label>
          <Input type="number" step="0.01" value={filters.amountMax} onChange={(e) => set('amountMax', e.target.value)} />
        </div>
      </div>

      {activeCount > 0 && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange(EMPTY_FILTERS)}>
          <RotateCcw size={14} /> Reset {activeCount} filter{activeCount > 1 ? 's' : ''}
        </Button>
      )}
    </div>
  );
}
