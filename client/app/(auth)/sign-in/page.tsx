'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { useAuthStore } from '@/stores/auth.store';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function SignInPage() {
  const { signIn } = useAuthStore();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn(email, password);

      router.push('/concepts');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { errors: string } } };
        setError(axiosError.response.data.errors);
      } else {
        setError('Terjadi kesalahan, coba lagi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Masuk ke Mahir.js</CardTitle>

        <CardDescription>
          Masukkan email dan passowrd kamu untuk melanjutkan.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={handleSubmit}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>

            <Input
              id='email'
              type='email'
              placeholder='your@email.here'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>

            <Input
              id='password'
              type='password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className='text-sm text-destructive'>{error}</p>}

          <Button
            type='submit'
            className='w-full'
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Masuk'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className='justify-center'>
        <p className='text-sm text-muted-foreground'>
          Belum punya akun?{' '}
          <Link
            href='/sign-up'
            className='text-primary hover:underline'
          >
            Daftar
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
