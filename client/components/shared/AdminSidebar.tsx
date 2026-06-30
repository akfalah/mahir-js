'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  BookOpen,
  ClipboardCheck,
  FileCode2,
  GraduationCap,
  LayoutDashboard,
  Layers3,
  ListChecks,
  Users,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const sidebarGroups = [
  {
    label: 'Overview',
    items: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
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
        icon: FileCode2,
      },
      {
        title: 'Test Cases',
        href: '/admin/test-cases',
        icon: ListChecks,
      },
    ],
  },
  {
    label: 'Evaluation',
    items: [
      {
        title: 'Submissions',
        href: '/admin/submissions',
        icon: ClipboardCheck,
      },
    ],
  },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible='icon'
      className='border-r'
    >
      <SidebarHeader className='border-b p-4'>
        <Link
          href='/admin'
          className='flex min-h-12 items-center gap-3 rounded-2xl px-2 transition-colors hover:bg-sidebar-accent'
        >
          <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground'>
            <GraduationCap className='size-5' />
          </div>

          <div className='flex min-w-0 flex-col group-data-[collapsible=icon]:hidden'>
            <span className='truncate text-sm font-bold'>Mahir.js</span>
            <span className='truncate text-xs text-muted-foreground'>
              Admin Panel
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className='p-3'>
        {sidebarGroups.map((group) => (
          <SidebarGroup
            key={group.label}
            className='p-0'
          >
            <SidebarGroupLabel className='px-2 text-xs font-medium text-muted-foreground group-data-[collapsible=icon]:hidden'>
              {group.label}
            </SidebarGroupLabel>

            <SidebarMenu className='gap-y-1'>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(pathname, item.href);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className='h-11 rounded-2xl px-3 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground'
                    >
                      <Link href={item.href}>
                        <Icon className='size-4' />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
