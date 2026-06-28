import Link from 'next/link';
import { BookOpen, Code2, Layers3, ListChecks } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const adminMenus = [
  {
    title: 'Concepts',
    description: 'Manage main JavaScript learning concepts.',
    href: '/admin/concepts',
    icon: Layers3,
  },
  {
    title: 'Materials',
    description: 'Manage learning materials for each concept.',
    href: '/admin/materials',
    icon: BookOpen,
  },
  {
    title: 'Study Cases',
    description: 'Manage coding challenges and starter code.',
    href: '/admin/study-cases',
    icon: Code2,
  },
  {
    title: 'Test Cases',
    description: 'Manage automated grading input and expected output.',
    href: '/admin/test-cases',
    icon: ListChecks,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className='flex flex-col gap-y-6'>
      <section className='rounded-3xl border bg-card p-6 md:p-8 shadow-sm'>
        <div className='flex flex-col gap-y-3'>
          <p className='text-sm font-medium text-primary'>Admin Panel</p>

          <div className='flex max-w-3xl flex-col gap-y-2'>
            <h1 className='text-3xl md:text-4xl font-bold tracking-tight'>
              Manage learning content
            </h1>

            <p className='text-muted-foreground'>
              Create concepts, materials, study cases, and test cases for the
              JavaScript learning system.
            </p>
          </div>
        </div>
      </section>

      <section className='grid grid-cols-1 md:grid-cols-2 gap-5'>
        {adminMenus.map((item) => {
          const Icon = item.icon;

          return (
            <Card
              key={item.href}
              className='rounded-3xl shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'
            >
              <CardContent className='flex flex-col gap-y-5 p-5 md:p-6'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <Icon className='size-6' />
                  </div>
                </div>

                <div className='flex flex-col gap-y-2'>
                  <h2 className='text-xl font-bold tracking-tight'>
                    {item.title}
                  </h2>

                  <p className='text-sm leading-relaxed text-muted-foreground'>
                    {item.description}
                  </p>
                </div>

                <Button
                  asChild
                  className='w-fit'
                >
                  <Link href={item.href}>Manage {item.title}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
