import { SettingsForm } from '@/components/settings/SettingsForm';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight dark:text-white sm:text-2xl">Settings</h1>
        <p className="text-sm text-black/40 dark:text-white/40">Split percentages, targets, banks, categories, liabilities</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <p className="mt-1 text-xs text-black/40 dark:text-white/40">Choose Light, Dark, or match your device automatically.</p>
        </CardHeader>
        <CardContent>
          <ThemeToggle />
        </CardContent>
      </Card>

      <SettingsForm />
    </div>
  );
}
