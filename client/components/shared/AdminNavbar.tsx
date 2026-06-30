'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Home, LogOut, PanelLeft, UserCircle } from 'lucide-react';

import { useAuthStore } from '@/stores/use-auth-store';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';

type PageMeta = {
  title: string;
  description: string;
};

function getPageMeta(pathname: string): PageMeta {
  if (pathname === '/admin') {
    return {
      title: 'Dashboard',
      description: 'Overview of your learning management system.',
    };
  }

  if (pathname.startsWith('/admin/users')) {
    return {
      title: 'Users',
      description: 'Manage students and administrator accounts.',
    };
  }

  if (pathname.startsWith('/admin/concepts')) {
    return {
      title: 'Concepts',
      description: 'Manage JavaScript learning concepts.',
    };
  }

  if (pathname.startsWith('/admin/materials')) {
    return {
      title: 'Materials',
      description: 'Manage learning materials for each concept.',
    };
  }

  if (pathname.startsWith('/admin/study-cases')) {
    return {
      title: 'Study Cases',
      description: 'Manage coding challenges for students.',
    };
  }

  if (pathname.startsWith('/admin/test-cases')) {
    return {
      title: 'Test Cases',
      description: 'Manage automated grading test cases.',
    };
  }

  if (pathname.startsWith('/admin/submissions')) {
    return {
      title: 'Submissions',
      description: 'Review student submissions and automated grading results.',
    };
  }

  return {
    title: 'Admin Panel',
    description: 'Manage Mahir.js learning content.',
  };
}

function getInitials(name?: string | null) {
  if (!name) {
    return 'A';
  }

  return name
    .split(' ')
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const pageMeta = getPageMeta(pathname);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <header className='sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80'>
      <div className='flex min-h-16 items-center justify-between gap-4 px-4 md:px-6'>
        <div className='flex min-w-0 items-center gap-3'>
          <SidebarTrigger className='size-10 rounded-xl'>
            <PanelLeft className='size-4' />
          </SidebarTrigger>

          <div className='flex min-w-0 flex-col gap-y-1'>
            <h1 className='truncate text-base font-semibold leading-none'>
              {pageMeta.title}
            </h1>

            <p className='hidden truncate text-sm text-muted-foreground sm:block'>
              {pageMeta.description}
            </p>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-3'>
          <Button
            asChild
            variant='outline'
            size='sm'
            className='gap-2'
          >
            <Link href='/'>
              <Home className='size-4' />
              <span className='hidden sm:inline'>Public Site</span>
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type='button'
                className='flex items-center gap-2 rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              >
                <Avatar className='size-9 border'>
                  <AvatarImage
                    src={user?.imageUrl ?? undefined}
                    alt={user?.name ?? 'Admin'}
                  />

                  <AvatarFallback className='text-xs font-semibold'>
                    {getInitials(user?.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align='end'
              className='w-56'
            >
              <DropdownMenuLabel>
                <div className='flex flex-col gap-y-1'>
                  <span className='truncate text-sm font-semibold'>
                    {user?.name ?? 'Admin'}
                  </span>

                  <span className='truncate text-xs font-normal text-muted-foreground'>
                    {user?.email ?? 'admin@mahirjs.local'}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link
                  href='/profile'
                  className='gap-2'
                >
                  <UserCircle className='size-4' />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                className='gap-2 text-destructive focus:text-destructive'
                onClick={handleSignOut}
              >
                <LogOut className='size-4' />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
