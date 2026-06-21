import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppAdminSidebar from '@/components/shared/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full'>
        <AppAdminSidebar />

        <main className='flex-1 flex flex-col'>
          <div className='flex items-center gap-2 border-b px-4 h-12 sticky top-0 bg-background z-40'>
            <SidebarTrigger />
          </div>
          
          <div className='flex-1 p-6'>{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
