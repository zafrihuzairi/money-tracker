'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatRM } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Row { label: string; income: number; expense: number; net: number; }

export function ReportView() {
  const [groupBy, setGroupBy] = useState('month');
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?groupBy=${groupBy}`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows ?? []))
      .finally(() => setLoading(false));
  }, [groupBy]);

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
          <div className="mb-8 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="label" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: number) => formatRM(v)} />
                <Bar dataKey="income" fill="#c6902f" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" fill="#0a0a0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <table className="w-full text-sm">
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
