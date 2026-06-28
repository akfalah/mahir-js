import PublicFooter from '@/components/shared/PublicFooter';
import PublicNavbar from '@/components/shared/PublicNavbar';

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
