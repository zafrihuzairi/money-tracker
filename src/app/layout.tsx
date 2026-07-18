import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';

export const metadata: Metadata = {
  title: 'Money Tracker',
  description: 'Personal Finance / Money Tracking System'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 p-6 md:p-10">
            <div className="mx-auto max-w-6xl space-y-8">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
