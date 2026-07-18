import { getCurrentUserId } from '@/lib/utils';
import { accountRepository } from '@/repositories/account.repository';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

const SECTION_ORDER = ['INCOME', 'DAILY', 'OUTLAY', 'SAVING', 'LIABILITY'] as const;

export default async function AccountsPage() {
  const userId = await getCurrentUserId();
  const accounts = await accountRepository.findAllByUser(userId);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <p className="text-sm text-black/40">Income, Daily, Outlay, Saving, Liability buckets</p>
      </header>

      {SECTION_ORDER.map((section) => {
        const items = accounts.filter((a) => a.type === section);
        if (items.length === 0) return null;
        return (
          <div key={section}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/40">{section}</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {items.map((a) => (
                <Card key={a.id}>
                  <CardHeader>
                    <CardTitle>{a.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge>{a.bank?.name ?? 'No bank linked'}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
