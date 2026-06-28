import AdminSidebar from "@/components/shared/AdminSidebar";


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='min-h-screen bg-muted/30'>
      <div className='grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]'>
        <AdminSidebar />

        <main className='min-w-0 p-4 md:p-6'>
          <div className='mx-auto flex w-full flex-col gap-y-6'>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}