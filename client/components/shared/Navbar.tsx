'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function AppNavbar() {
  const { user, signOut } = useAuthStore();
  const router = useRouter();

  const isAdmin = user && user.role === 'ADMIN';

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  };

  return (
    <header className='z-50 top-0 sticky bg-background/80 backdrop-blur-sm border-b'>
      <div className='container mx-auto px-4 h-14 flex items-center justify-between'>
        <Link
          href='/'
          className='font-bold text-lg tracking-tight'
        >
          Mahir<span className='text-primary'>.js</span>
        </Link>

        <nav className='flex items-center gap-6'>
          <Link
            href='/concepts'
            className='text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            Concepts
          </Link>

          {user ? (
            <>
              <Link
                href={isAdmin ? '/admin' : '/learn'}
                className='text-sm text-muted-foreground hover:text-foreground transition-colors'
              >
                {isAdmin ? 'Admin' : 'Learn'}
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className='h-8 w-8 cursor-pointer'>
                    <AvatarImage src={user.imageUrl} />

                    <AvatarFallback className='bg-primary text-primary-foreground text-xs font-semibold'>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>

                <DropdownMenuContent align='end'>
                  <div className='px-2 py-1.5'>
                    <p className='text-sm font-medium'>{user.name}</p>

                    <p className='text-xs text-muted-foreground'>
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className='text-destructive cursor-pointer'
                  >
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='sm'
                asChild
              >
                <Link href='/sign-in'>Sign In</Link>
              </Button>

              <Button
                size='sm'
                asChild
              >
                <Link href='/sign-up'>Sign Up</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
