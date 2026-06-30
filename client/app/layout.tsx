import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';

import { Toaster } from '@/components/ui/sonner';
import AuthProvider from '@/components/shared/AuthProvider';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mahir.js',
  description: 'Platform belajar JavaScript interaktif',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='id'>
      <body className={geist.className}>
        <AuthProvider>{children}</AuthProvider>

        <Toaster
          theme='light'
          richColors
          closeButton
          position='top-right'
          toastOptions={{
            classNames: {
              toast: 'max-w-md rounded-2xl',
              title: 'text-sm font-semibold',
              description: 'text-sm',
            },
          }}
        />
      </body>
    </html>
  );
}
