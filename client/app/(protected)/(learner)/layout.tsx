import { PublicNavbar } from '@/components/shared/public-navbar';
import { PublicFooter } from '@/components/shared/public-footer';

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex min-h-screen flex-col bg-background'>
      <PublicNavbar />

      <main className='flex-1'>{children}</main>

      <PublicFooter />
    </div>
  );
}
