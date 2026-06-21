'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Code2,
  TestTube,
  Users,
  ClipboardList,
} from 'lucide-react';

const mainNavItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Submissions',
    href: '/admin/submissions',
    icon: ClipboardList,
  },
];

const contentNavItems = [
  {
    label: 'Concepts',
    href: '/admin/concepts',
    icon: BookOpen,
  },
  {
    label: 'Materials',
    href: '/admin/materials',
    icon: FileText,
  },
  {
    label: 'Study Cases',
    href: '/admin/study-cases',
    icon: Code2,
  },
  {
    label: 'Test Cases',
    href: '/admin/test-cases',
    icon: TestTube,
  },
];

export default function AppAdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <Sidebar>
      <SidebarHeader className='h-12 border-b px-4 py-2.5'>
        <p className='font-bold text-lg tracking-tight'>
          Mahir<span className='text-primary'>.js</span>
        </p>
      </SidebarHeader>

      <SidebarContent>
        {/* Main */}
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                  >
                    <Link href={item.href}>
                      <item.icon className='h-4 w-4' />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Content Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {contentNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className='h-4 w-4' />
                      {item.label}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t px-4 py-3'>
        <Link
          href='/'
          className='text-xs text-muted-foreground hover:text-foreground transition-colors'
        >
          ← Back to Student View
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
