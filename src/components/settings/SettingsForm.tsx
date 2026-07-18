'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const FIELDS = [
  { key: 'dailyPercent', label: 'Daily %' },
  { key: 'outlayPercent', label: 'Outlay %' },
  { key: 'savingPercent', label: 'Saving %' },
  { key: 'liabilityPercent', label: 'Liability %' },
  { key: 'fatherPercent', label: 'Liability → Father %' },
  { key: 'iphonePercent', label: 'Liability → iPhone %' },
  { key: 'investmentTarget', label: 'Monthly Investment Target (RM)' },
  { key: 'marriageTarget', label: 'Monthly Marriage Target (RM)' }
] as const;

export function SettingsForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        const s = d.settings;
        const next: Record<string, string> = {};
        FIELDS.forEach((f) => (next[f.key] = String(s[f.key])));
        setValues(next);
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const payload: Record<string, number> = {};
    FIELDS.forEach((f) => (payload[f.key] = Number(values[f.key])));
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    setSaving(false);
    setMessage(res.ok ? 'Saved.' : 'Failed to save.');
  }

  const splitSum =
    Number(values.dailyPercent || 0) +
    Number(values.outlayPercent || 0) +
    Number(values.savingPercent || 0) +
    Number(values.liabilityPercent || 0);

  if (loading) return <p className="text-sm text-black/40">Loading…</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation Settings</CardTitle>
        <p className="mt-1 text-xs text-black/40">
          Edit the split percentages and monthly waterfall targets without touching code.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <Label>{f.label}</Label>
              <Input
                type="number"
                step="0.01"
                value={values[f.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            {splitSum !== 100 && (
              <p className="mb-2 text-xs text-gold-600">
                Note: Daily + Outlay + Saving + Liability currently sum to {splitSum}% (spec default is 100%).
              </p>
            )}
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Settings'}</Button>
            {message && <span className="ml-3 text-sm text-black/50">{message}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
