'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { Code2, Menu } from 'lucide-react';

import { cn } from '@/lib/utils';

import { useAuthStore } from '@/stores/use-auth-store';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '../ui/skeleton';

const navItems = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Concepts',
    href: '/concepts',
  },
];

export default function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, signOut, hasHydrated } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  const initials = user?.name
    ?.split(' ')
    .map((name) => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const dashboardHref = isAdmin ? '/admin' : '/learn';
  const dashboardLabel = isAdmin ? 'Admin Dashboard' : 'My Learning';

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <header className='sticky top-0 z-50 border-b bg-background/85 backdrop-blur-xl'>
      <div className='container mx-auto p-4 flex items-center justify-between'>
        <Link
          href='/'
          className='flex items-center gap-2'
        >
          <div className='size-10 flex items-center justify-center text-primary-foreground bg-primary rounded-full shadow-sm'>
            <Code2 className='size-5' />
          </div>

          <span className='text-xl font-bold tracking-tight'>
            Mahir<span className='text-primary'>.js</span>
          </span>
        </Link>

        <nav className='hidden md:flex items-center gap-x-1'>
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

        <div className='hidden md:flex items-center gap-x-2'>
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
                  <Avatar className='h-9 w-9 cursor-pointer border'>
                    <AvatarImage src={user.imageUrl} />

                    <AvatarFallback className='bg-primary text-xs font-semibold text-primary-foreground'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
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
                    <Link href='/profile'>Profile</Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className='cursor-pointer text-destructive'
                  >
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
                <Link href='/sign-up'>Start Free</Link>
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
                <Menu />
              </Button>
            </SheetTrigger>

            <SheetContent side='right'>
              <SheetHeader>
                <SheetTitle>
                  Mahir<span className='text-primary'>.js</span>
                </SheetTitle>
              </SheetHeader>

              <div className='px-4 flex flex-col gap-y-6'>
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
                            'block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl',
                            isActive && 'text-foreground bg-secondary',
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
                  <div className='flex flex-col gap-y-4'>
                    <div className='flex items-center gap-3'>
                      <Avatar className='size-10 border'>
                        <AvatarImage src={user.imageUrl} />

                        <AvatarFallback className='text-xs font-semibold text-primary-foreground bg-primary'>
                          {initials}
                        </AvatarFallback>
                      </Avatar>

                      <div className='min-w-0'>
                        <p className='truncate text-sm font-medium'>
                          {user.name}
                        </p>
                        <p className='truncate text-xs text-muted-foreground'>
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <SheetClose asChild>
                      <Button
                        className='w-full'
                        asChild
                      >
                        <Link href={dashboardHref}>{dashboardLabel}</Link>
                      </Button>
                    </SheetClose>

                    <SheetClose asChild>
                      <Button
                        variant='outline'
                        className='w-full'
                        asChild
                      >
                        <Link href='/profile'>Profile</Link>
                      </Button>
                    </SheetClose>

                    <Button
                      variant='outline'
                      className='w-full text-destructive'
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className='grid gap-x-2'>
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
                        <Link href='/sign-up'>Start Free</Link>
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
