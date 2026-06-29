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

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

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

function checkIsActive(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible='icon'
      variant='sidebar'
    >
      <SidebarHeader className='flex min-h-16 justify-center border-b p-2'>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size='lg'
              tooltip='Mahir.js Admin'
              className='h-12 gap-3 rounded-xl px-3 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:size-12 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0'
            >
              <Link href='/admin'>
                <div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground'>
                  <FileText className='size-5' />
                </div>

                <div className='flex min-w-0 flex-col gap-y-1 group-data-[collapsible=icon]:hidden'>
                  <span className='truncate text-sm font-bold leading-none'>
                    Mahir.js
                  </span>

                  <span className='truncate text-xs text-muted-foreground'>
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className='p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2'>
        <SidebarGroup className='p-0 group-data-[collapsible=icon]:w-full'>
          <SidebarGroupLabel className='group-data-[collapsible=icon]:sr-only'>
            Management
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className='gap-y-2 group-data-[collapsible=icon]:items-center'>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = checkIsActive(pathname, item.href);

                return (
                  <SidebarMenuItem
                    key={item.href}
                    className='group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center'
                  >
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className='h-10 gap-3 rounded-xl data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary data-[active=true]:hover:text-primary-foreground group-data-[collapsible=icon]:size-11 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0'
                    >
                      <Link href={item.href}>
                        <Icon className='size-4 shrink-0' />
                        <span className='group-data-[collapsible=icon]:hidden'>
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
