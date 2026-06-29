import type { CSSProperties, ReactNode } from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import AdminNavbar from '@/components/shared/AdminNavbar';
import AdminSidebar from '@/components/shared/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': '17rem',
            '--sidebar-width-icon': '4.5rem',
          } as CSSProperties
        }
      >
        <AdminSidebar />

        <SidebarInset className='min-w-0 bg-muted/30'>
          <AdminNavbar />

          <main className='min-w-0 p-4 md:p-6'>
            <div className='mx-auto flex w-full max-w-8xl flex-col gap-y-6'>
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
