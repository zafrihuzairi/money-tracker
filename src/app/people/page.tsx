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
        <h1 className="text-2xl font-bold tracking-tight">People</h1>
        <p className="text-sm text-black/40">Debtor tracking — who owes you, and who you owe</p>
      </header>

      <Card><CardContent className="pt-6"><PersonForm /></CardContent></Card>

      <Card>
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
