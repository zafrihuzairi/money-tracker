import { getCurrentUserId } from '@/lib/utils';
import { personRepository } from '@/repositories/person.repository';
import { Card, CardContent } from '@/components/ui/card';
import { formatRM } from '@/lib/utils';
import { PersonForm } from '@/components/people/PersonForm';

export const dynamic = 'force-dynamic';

export default async function PeoplePage() {
  const userId = await getCurrentUserId();
  const people = await personRepository.findAllByUser(userId);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">People</h1>
        <p className="text-sm text-black/40">Debtor tracking — who owes you, and who you owe</p>
      </header>

      <Card><CardContent className="pt-6"><PersonForm /></CardContent></Card>

      {/* Mobile: stacked cards */}
      <div className="space-y-3 md:hidden">
        {people.map((p) => (
          <Card key={p.id}>
            <CardContent className="pt-5">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-black/40">{p.phone ?? 'No phone'}</p>
                </div>
              </div>
              {p.note && <p className="mb-3 text-sm text-black/50">{p.note}</p>}
              <div className="flex justify-between text-sm">
                <span className="text-green-600">They owe: {formatRM(p.theyOweMe)}</span>
                <span className="text-red-600">I owe: {formatRM(p.iOweThem)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {people.length === 0 && <p className="py-8 text-center text-sm text-black/30">No people added yet.</p>}
      </div>

      {/* Desktop: table */}
      <Card className="hidden md:block">
        <CardContent className="pt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-black/40">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Phone</th>
                <th className="py-2 pr-4">Note</th>
                <th className="py-2 text-right">They Owe Me</th>
                <th className="py-2 text-right">I Owe Them</th>
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.id} className="border-b border-black/5">
                  <td className="py-2 pr-4 font-medium">{p.name}</td>
                  <td className="py-2 pr-4 text-black/50">{p.phone ?? '—'}</td>
                  <td className="py-2 pr-4 text-black/50">{p.note ?? '—'}</td>
                  <td className="py-2 text-right text-green-600">{formatRM(p.theyOweMe)}</td>
                  <td className="py-2 text-right text-red-600">{formatRM(p.iOweThem)}</td>
                </tr>
              ))}
              {people.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-black/30">No people added yet.</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
