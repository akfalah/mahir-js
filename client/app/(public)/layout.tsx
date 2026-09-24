import { PublicNavbar } from '@/components/shared/public-navbar';
import { PublicFooter } from '@/components/shared/public-footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex flex-col bg-neutral-50'>
      <PublicNavbar />

      <main className='flex-1'>
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
