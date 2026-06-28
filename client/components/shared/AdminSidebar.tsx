'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  Code2,
  FileText,
  LayoutDashboard,
  Layers3,
  ListChecks,
} from 'lucide-react';

import { cn } from '@/lib/utils';

const navItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Concepts',
    href: '/admin/concepts',
    icon: Layers3,
  },
  {
    title: 'Materials',
    href: '/admin/materials',
    icon: BookOpen,
  },
  {
    title: 'Study Cases',
    href: '/admin/study-cases',
    icon: Code2,
  },
  {
    title: 'Test Cases',
    href: '/admin/test-cases',
    icon: ListChecks,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className='hidden border-r bg-background lg:block'>
      <div className='sticky top-0 flex h-screen flex-col gap-y-6 p-5'>
        <Link
          href='/admin'
          className='flex items-center gap-3 rounded-xl border bg-card p-4'
        >
          <div className='flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <FileText className='size-5' />
          </div>

          <div className='flex flex-col'>
            <span className='font-bold leading-none'>Mahir.js</span>
            <span className='text-xs text-muted-foreground'>Admin Panel</span>
          </div>
        </Link>

        <nav className='flex flex-col gap-y-2'>
          {navItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              item.href === '/admin'
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                  isActive &&
                    'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                )}
              >
                <Icon className='size-5' />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className='flex flex-1 flex-col justify-end'>
          <Link
            href='/'
            className='rounded-2xl border bg-card px-4 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            Back to public site
          </Link>
        </div>
      </div>
    </aside>
  );
}
