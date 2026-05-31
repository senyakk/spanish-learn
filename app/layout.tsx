import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import BottomNav from '@/components/layout/BottomNav';
import StoreInitializer from '@/components/StoreInitializer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SpanishLearn',
  description: 'Learn Spanish with spaced repetition',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${inter.className} bg-gray-50 min-h-[100dvh]`}>
        <StoreInitializer />
        <main className="max-w-lg mx-auto pb-24 min-h-[100dvh]">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
