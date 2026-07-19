'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';
import { FAB } from '@/components/layout/FAB';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dscreen flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 overflow-x-hidden px-4 pb-[max(7.5rem,calc(6rem+env(safe-area-inset-bottom)))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6 md:px-8 md:pb-10 md:pt-6">
        <div className="mx-auto w-full max-w-6xl space-y-6 md:space-y-8 md:pb-4">
          {children}
        </div>
      </main>

      <MobileNav />
      <FAB />
    </div>
  );
}
