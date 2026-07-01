import { ReactNode } from 'react';
import Link from 'next/link';

import {
  BookOpen,
  ClipboardCheck,
  Code2,
  Layers3,
  ListChecks,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type AdminMenu = {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
};

type AdminMenuGroup = {
  title: string;
  description: string;
  items: AdminMenu[];
};

const adminMenuGroups: AdminMenuGroup[] = [
  {
    title: 'Management',
    description: 'Manage users and learning content for Mahir.js.',
    items: [
      {
        title: 'Users',
        description: 'Manage student and administrator accounts.',
        href: '/admin/users',
        icon: <Users className='size-6' />,
      },
      {
        title: 'Concepts',
        description: 'Manage main JavaScript learning concepts.',
        href: '/admin/concepts',
        icon: <Layers3 className='size-6' />,
      },
      {
        title: 'Materials',
        description: 'Manage learning materials for each concept.',
        href: '/admin/materials',
        icon: <BookOpen className='size-6' />,
      },
      {
        title: 'Study Cases',
        description: 'Manage coding challenges and starter code.',
        href: '/admin/study-cases',
        icon: <Code2 className='size-6' />,
      },
      {
        title: 'Test Cases',
        description: 'Manage automated grading input and expected output.',
        href: '/admin/test-cases',
        icon: <ListChecks className='size-6' />,
      },
    ],
  },
  {
    title: 'Evaluation',
    description: 'Review student submissions and automated grading results.',
    items: [
      {
        title: 'Submissions',
        description: 'Review submitted code, status, and test results.',
        href: '/admin/submissions',
        icon: <ClipboardCheck className='size-6' />,
      },
    ],
  },
];

export default function AdminDashboardPage() {
  return (
    <div className='flex flex-col gap-y-6'>
      <section className='rounded-3xl border bg-card p-6 shadow-sm md:p-8'>
        <div className='flex flex-col gap-y-3'>
          <p className='text-sm font-medium text-primary'>Admin Panel</p>

          <div className='flex max-w-3xl flex-col gap-y-2'>
            <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>
              Manage Mahir.js learning system
            </h1>

            <p className='text-muted-foreground'>
              Manage users, learning content, coding practice, automated test
              cases, and student submissions.
            </p>
          </div>
        </div>
      </section>

      {adminMenuGroups.map((group) => (
        <section
          key={group.title}
          className='flex flex-col gap-y-4'
        >
          <div className='flex flex-col gap-y-1'>
            <h2 className='text-xl font-bold tracking-tight'>{group.title}</h2>

            <p className='text-sm text-muted-foreground'>{group.description}</p>
          </div>

          <div className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3'>
            {group.items.map((item) => (
              <Card
                key={item.href}
                className='rounded-3xl shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md'
              >
                <CardContent className='flex h-full flex-col gap-y-5 p-5 md:p-6'>
                  <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    {item.icon}
                  </div>

                  <div className='flex flex-1 flex-col gap-y-2'>
                    <h3 className='text-xl font-bold tracking-tight'>
                      {item.title}
                    </h3>

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
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
