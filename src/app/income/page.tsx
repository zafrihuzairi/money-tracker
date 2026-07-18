import { JobIncomeForm } from '@/components/income/JobIncomeForm';
import { ManualIncomeForm } from '@/components/income/ManualIncomeForm';

export default function IncomePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Income</h1>
        <p className="text-sm text-black/40">Job income is split automatically. Everything else is manual.</p>
      </header>
      <JobIncomeForm />
      <ManualIncomeForm />
    </div>
  );
}
