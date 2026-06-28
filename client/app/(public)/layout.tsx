import PublicFooter from '@/components/shared/PublicFooter';
import PublicNavbar from '@/components/shared/PublicNavbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen flex flex-col bg-background'>
      <PublicNavbar />

      <main className='flex-1'>{children}</main>

      <PublicFooter />
    </div>
  );
}
