import { SettingsForm } from '@/components/settings/SettingsForm';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-black/40">Split percentages, targets, banks, categories, liabilities</p>
      </header>
      <SettingsForm />
    </div>
  );
}
