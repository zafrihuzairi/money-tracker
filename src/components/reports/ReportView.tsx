'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatRM } from '@/lib/utils';
import { onTransactionsChanged } from '@/lib/data-events';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Row { label: string; income: number; expense: number; net: number; }

export function ReportView() {
  const [groupBy, setGroupBy] = useState('month');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    fetch(`/api/reports?groupBy=${groupBy}`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(load, [groupBy]);
  useEffect(() => onTransactionsChanged(load), [groupBy]);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6 max-w-xs">
          <Label>Group by</Label>
          <Select value={groupBy} onChange={(e) => setGroupBy(e.target.value)}>
            <option value="month">Month</option>
            <option value="bank">Bank</option>
            <option value="category">Category</option>
            <option value="person">Person</option>
          </Select>
        </div>

        {!loading && rows.length > 0 && (
          <div className="glass mb-8 h-64 w-full rounded-2xl p-3 sm:h-72 sm:p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ left: -16, right: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="label" fontSize={11} tickMargin={8} />
                <YAxis fontSize={11} width={48} />
                <Tooltip formatter={(v: number) => formatRM(v)} />
                <Bar dataKey="income" fill="#c6902f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#6e4820" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Mobile: stacked cards */}
        <div className="space-y-2 sm:hidden">
          {rows.map((r) => (
            <div key={r.label} className="rounded-2xl bg-black/[0.03] p-3">
              <p className="mb-1 text-sm font-semibold">{r.label}</p>
              <div className="flex justify-between text-xs">
                <span className="text-green-600">In: {formatRM(r.income)}</span>
                <span className="text-red-600">Out: {formatRM(r.expense)}</span>
                <span className="font-medium">Net: {formatRM(r.net)}</span>
              </div>
            </div>
          ))}
          {rows.length === 0 && !loading && <p className="py-6 text-center text-sm text-black/30">No data yet.</p>}
        </div>

        {/* Desktop: table */}
        <table className="hidden w-full text-sm sm:table">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-black/40">
              <th className="py-2 pr-4">{groupBy}</th>
              <th className="py-2 text-right">Income</th>
              <th className="py-2 text-right">Expense</th>
              <th className="py-2 text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-b border-black/5">
                <td className="py-2 pr-4">{r.label}</td>
                <td className="py-2 text-right text-green-600">{formatRM(r.income)}</td>
                <td className="py-2 text-right text-red-600">{formatRM(r.expense)}</td>
                <td className="py-2 text-right font-medium">{formatRM(r.net)}</td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr><td colSpan={4} className="py-8 text-center text-black/30">No data yet.</td></tr>
            )}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
