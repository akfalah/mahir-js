'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from 'cn';

import { LogOut, Menu, SlidersHorizontal, UserCircle } from 'lucide-react';

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

import { PublicLogo } from '@/components/shared/public-logo';

const navItems = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Curriculum',
    href: '/modules',
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

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, signOut, hasHydrated } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';
  const initials = getInitials(user?.name);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <header className='sticky top-0 z-50 h-20 flex items-center justify-between bg-background/70 border-b backdrop-blur-sm'>
      <div className='container mx-auto h-12 px-4 lg:px-16 w-full flex items-center'>
        <div className='w-full flex items-center justify-between'>
          <PublicLogo
            href={'/'}
            variant={'with-text'}
          />

          <nav className='hidden items-center md:flex'>
            {navItems.map((item) => {
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    [
                      'py-1.5 px-2.5 hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all',
                    ],
                    [isActive && 'font-semibold text-foreground'],
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className='w-53 hidden items-center justify-end gap-x-3 md:flex'>
            {!hasHydrated ? (
              <Skeleton className='h-9 w-53' />
            ) : user ? (
              <>
                {isAdmin && (
                  <Button
                    variant={'secondary'}
                    className='min-w-27'
                    asChild
                  >
                    <Link href={'/admin'}>
                      <SlidersHorizontal className='size-4!' />
                      Admin Dashboard
                    </Link>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type={'button'}
                      className='flex items-center gap-2 outline-none ring-offset-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 rounded-full hover:opacity-80 transition-opacity'
                    >
                      <Avatar className='size-9 border'>
                        <AvatarImage
                          src={user.imageUrl}
                          alt={user.name}
                        />

                        <AvatarFallback className='bg-primary text-xs font-semibold text-primary-foreground'>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align={'end'}
                    className='w-56'
                  >
                    <DropdownMenuLabel>
                      <div className='flex flex-col gap-y-1'>
                        <span className='truncate text-sm font-semibold'>
                          {user.name}
                        </span>

                        <span className='truncate text-xs font-normal text-muted-foreground'>
                          {user.email}
                        </span>
                      </div>
                    </DropdownMenuLabel>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem asChild>
                      <Link
                        href={'/profile'}
                        className='gap-2'
                      >
                        <UserCircle className='size-4' />
                        Profile
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className='group gap-2 focus:bg-destructive/10 text-destructive focus:text-destructive transition-colors'
                      onClick={handleSignOut}
                    >
                      <LogOut className='size-4 text-destructive group-focus:text-destructive' />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant={'outline'}
                  size={'lg'}
                  asChild
                  className='w-24'
                >
                  <Link href='/sign-in'>Sign In</Link>
                </Button>

                <Button
                  size={'lg'}
                  asChild
                  className='w-24'
                >
                  <Link href='/sign-up'>Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          <div className='md:hidden'>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant={'outline'}
                  size='icon'
                >
                  <Menu className='size-4' />
                </Button>
              </SheetTrigger>

              <SheetContent side={'right'}>
                <SheetHeader>
                  <SheetTitle className='text-xl font-bold text-primary'>
                    Mahir<span className='text-foreground'>JS</span>
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
                              'block py-2 px-3 hover:bg-secondary text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all',
                              isActive &&
                                'bg-secondary font-semibold text-foreground',
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
                          <AvatarImage
                            src={user.imageUrl}
                            alt={user.name}
                          />

                          <AvatarFallback className='bg-primary text-xs font-semibold text-primary-foreground'>
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

                      {isAdmin && (
                        <SheetClose asChild>
                          <Button
                            className='w-full'
                            asChild
                          >
                            <Link href={'/admin'}>Admin Dashboard</Link>
                          </Button>
                        </SheetClose>
                      )}

                      <SheetClose asChild>
                        <Button
                          variant={'outline'}
                          className='w-full'
                          asChild
                        >
                          <Link href={'/profile'}>Profile</Link>
                        </Button>
                      </SheetClose>

                      <Button
                        variant={'outline'}
                        className='w-full text-destructive'
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <div className='flex flex-col gap-y-2'>
                      <SheetClose asChild>
                        <Button
                          variant={'outline'}
                          size={'lg'}
                          className='w-full'
                          asChild
                        >
                          <Link href={'/sign-in'}>Sign In</Link>
                        </Button>
                      </SheetClose>

                      <SheetClose asChild>
                        <Button
                          className='w-full'
                          asChild
                        >
                          <Link href={'/sign-up'}>Sign Up</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
