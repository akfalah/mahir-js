'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Code2, LogIn } from 'lucide-react';

import { useAuthStore } from '@/stores/use-auth-store';

import { signInSchema } from '@/lib/validations/auth';
import { getFieldErrors } from '@/lib/validations/get-field-errors';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';

type SignInErrors = {
  email?: string;
  password?: string;
};

export default function SignInForm() {
  const router = useRouter();
  const signIn = useAuthStore((state) => state.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<SignInErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});
    setMessage(null);

    const validationResult = signInSchema.safeParse({
      email,
      password,
    });

    if (!validationResult.success) {
      const fieldErrors = getFieldErrors(validationResult.error);

      setErrors({
        email: fieldErrors.email,
        password: fieldErrors.password,
      });

      return;
    }

    setIsSubmitting(true);

    try {
      await signIn(validationResult.data);

      router.push('/learn');
      router.refresh();
    } catch {
      setMessage('Unable to sign in. Please check your email and password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='container mx-auto grid min-h-screen place-items-center px-4 py-10 md:py-12'>
      <div className='grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border bg-card shadow-sm lg:grid-cols-[0.9fr_1.1fr]'>
        <section className='hidden bg-primary p-8 text-primary-foreground lg:flex lg:flex-col lg:justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex size-11 items-center justify-center rounded-2xl bg-primary-foreground/15'>
              <Code2 className='size-5' />
            </div>

            <p className='text-lg font-bold'>Mahir.js</p>
          </div>

          <div className='flex flex-col gap-y-4'>
            <h1 className='text-4xl font-bold tracking-tight'>
              Continue your JavaScript learning journey.
            </h1>

            <p className='leading-relaxed text-primary-foreground/80'>
              Sign in to access your learning path, complete study cases, and
              track your progress.
            </p>
          </div>
        </section>

        <Card className='border-0 shadow-none'>
          <CardHeader className='p-6 md:p-8'>
            <div className='flex flex-col gap-y-3'>
              <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <LogIn className='size-6' />
              </div>

              <div className='flex flex-col gap-y-2'>
                <h1 className='text-3xl font-bold tracking-tight'>Sign in</h1>

                <p className='text-sm text-muted-foreground'>
                  Enter your account to continue learning.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className='px-6 md:px-8 pb-6 md:pb-8'>
            <form
              onSubmit={handleSubmit}
              className='flex flex-col gap-y-5'
            >
              <FieldGroup>
                <Field data-invalid={Boolean(errors.email)}>
                  <FieldLabel htmlFor='email'>Email</FieldLabel>

                  <Input
                    id='email'
                    type='email'
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        email: undefined,
                      }));
                    }}
                    placeholder='you@example.com'
                    aria-invalid={Boolean(errors.email)}
                  />

                  {errors.email ? (
                    <FieldError>{errors.email}</FieldError>
                  ) : (
                    <FieldDescription>
                      Use the email registered to your account.
                    </FieldDescription>
                  )}
                </Field>

                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor='password'>Password</FieldLabel>

                  <Input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }}
                    placeholder='••••••••'
                    aria-invalid={Boolean(errors.password)}
                  />

                  {errors.password ? (
                    <FieldError>{errors.password}</FieldError>
                  ) : (
                    <FieldDescription>
                      Password must be at least 8 characters.
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>

              {message && (
                <p className='rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
                  {message}
                </p>
              )}

              <Button
                type='submit'
                disabled={isSubmitting}
                className='w-full'
              >
                {isSubmitting && <Spinner className='size-4' />}
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>

              <p className='text-center text-sm text-muted-foreground'>
                Do not have an account?{' '}
                <Link
                  href='/sign-up'
                  className='font-medium text-primary hover:underline'
                >
                  Create account
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
