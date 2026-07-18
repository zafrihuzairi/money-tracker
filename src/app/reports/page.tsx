import { ReportView } from '@/components/reports/ReportView';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-black/40">Income vs expense by bank, category, person, or month</p>
      </header>
      <ReportView />
    </div>
  );
}
