'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Code2, LogOut, Menu, UserCircle } from 'lucide-react';

import { cn } from '@/lib/utils';

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
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: "Let's Learn",
    href: '/concepts',
  },
];

function getInitials(name?: string | null) {
  if (!name) {
    return 'U';
  }

  return name
    .split(' ')
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, signOut, hasHydrated } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const initials = getInitials(user?.name);

  const dashboardHref = isAdmin ? '/admin' : '/learn';
  const dashboardLabel = isAdmin ? 'Admin Dashboard' : 'Continue Learning';

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <header className='sticky top-0 z-50 border-b bg-background/85 backdrop-blur-xl'>
      <div className='container mx-auto flex items-center justify-between p-4'>
        <Link
          href='/'
          className='flex items-center gap-2'
        >
          <div className='flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm'>
            <Code2 className='size-5' />
          </div>

          <span className='text-xl font-bold tracking-tight'>
            Mahir<span className='text-primary'>.js</span>
          </span>
        </Link>

        <nav className='hidden items-center gap-x-1 md:flex'>
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Button
                key={item.href}
                variant='ghost'
                asChild
                className={cn(
                  isActive &&
                    'bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] text-primary',
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            );
          })}
        </nav>

        <div className='hidden items-center gap-x-2 md:flex'>
          {!hasHydrated ? (
            <div className='flex items-center gap-x-2'>
              <Skeleton className='h-9 w-25' />
              <Skeleton className='size-9 rounded-full' />
            </div>
          ) : user ? (
            <>
              <Button
                variant='secondary'
                asChild
              >
                <Link href={dashboardHref}>{dashboardLabel}</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type='button'
                    className='rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                  >
                    <Avatar className='size-9 cursor-pointer border'>
                      <AvatarImage
                        src={user.imageUrl ?? undefined}
                        alt={user.name}
                      />

                      <AvatarFallback className='bg-primary text-xs font-semibold text-primary-foreground'>
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align='end'
                  className='w-60'
                >
                  <div className='px-2 py-1.5'>
                    <p className='text-sm font-medium'>{user.name}</p>
                    <p className='truncate text-xs text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href='/profile'>
                      <UserCircle className='size-4' />
                      Profile
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className={
                      'cursor-pointer text-destructive focus:text-destructive'
                    }
                  >
                    <LogOut className='size-4' />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button
                variant='ghost'
                asChild
              >
                <Link href='/sign-in'>Sign In</Link>
              </Button>

              <Button asChild>
                <Link href='/sign-up'>Start Learning Free</Link>
              </Button>
            </>
          )}
        </div>

        <div className='md:hidden'>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant='outline'
                size='icon'
              >
                <Menu className='size-4' />
              </Button>
            </SheetTrigger>

            <SheetContent side='right'>
              <SheetHeader>
                <SheetTitle>
                  Mahir<span className='text-primary'>.js</span>
                </SheetTitle>
              </SheetHeader>

              <div className='flex flex-col gap-y-6 px-4'>
                <nav className='flex flex-col gap-y-2'>
                  {navItems.map((item) => {
                    const isActive =
                      item.href === '/'
                        ? pathname === '/'
                        : pathname.startsWith(item.href);

                    return (
                      <SheetClose
                        key={item.href}
                        asChild
                      >
                        <Link
                          href={item.href}
                          className={cn(
                            'block rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground',
                            isActive && 'bg-secondary text-foreground',
                          )}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    );
                  })}
                </nav>

                <Separator />

                {!hasHydrated ? (
                  <div className='flex flex-col gap-y-2'>
                    <Skeleton className='h-10 w-full' />
                    <Skeleton className='h-10 w-full' />
                  </div>
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type='button'
                        className='flex items-center gap-2 rounded-full outline-none ring-offset-background transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                      >
                        <Avatar className='size-9 border'>
                          <AvatarImage src={user.imageUrl} />

                          <AvatarFallback className='text-xs font-semibold text-primary-foreground bg-primary'>
                            {initials}
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
                        className='group gap-2 text-destructive transition-colors focus:bg-destructive/10 focus:text-destructive [&_svg]:text-destructive'
                        onClick={handleSignOut}
                      >
                        <LogOut className='size-4 text-destructive' />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className='flex flex-col gap-y-2'>
                    <SheetClose asChild>
                      <Button
                        variant='outline'
                        className='w-full'
                        asChild
                      >
                        <Link href='/sign-in'>Sign In</Link>
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button
                        className='w-full'
                        asChild
                      >
                        <Link href='/sign-up'>Start Learning Free</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
