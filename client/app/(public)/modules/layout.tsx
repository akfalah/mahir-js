export default function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className='container mx-auto py-10 lg:py-16 px-4 lg:px-16 flex flex-col gap-y-12'>
      {children}
    </section>
  );
}
