import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import './globals.css';

import { AuthProvider } from '@/providers/auth-provider';

// import { Toaster } from '@/components/ui/sonner';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MahirJS',
  description: 'Learning Platform for Basic JavaScript',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={geist.className}>
        <AuthProvider>{children}</AuthProvider>

        {/* <Toaster
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
        /> */}
      </body>
    </html>
  );
}
