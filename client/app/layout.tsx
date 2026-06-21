import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';

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
      </body>
    </html>
  );
}
