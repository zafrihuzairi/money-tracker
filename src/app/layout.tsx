import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeProvider, NO_FLASH_THEME_SCRIPT } from '@/components/theme/ThemeProvider';

export const metadata: Metadata = {
  title: 'Money Tracker',
  description: 'Personal Finance / Money Tracking System'
};

// viewportFit: 'cover' lets the safe-area-inset-* env() vars resolve on
// notch / Dynamic Island devices instead of defaulting to 0.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a0b'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* runs before paint so dark-mode users never see a light-mode flash */}
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="min-h-dscreen font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
