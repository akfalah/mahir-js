import { cookies } from 'next/headers';
import Link from 'next/link';

import { fetchConcepts } from '@/lib/fetch';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { BookOpen, Code2, Trophy, Zap } from 'lucide-react';

const stats = [
  { icon: BookOpen, label: 'Concepts', value: '3' },
  { icon: Code2, label: 'Exercises', value: '9+' },
  { icon: Zap, label: 'Instant Feedback', value: '100%' },
  { icon: Trophy, label: 'Free Forever', value: '∞' },
];

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';
  const isLoggedIn = !!token;

  const { data: concepts } = await fetchConcepts();

  return (
    <div className='min-h-screen bg-linear-to-br from-background via-background to-primary/5'>
      {/* Decorative blur */}
      <div className='fixed inset-0 overflow-hidden pointer-events-none -z-10'>
        <div className='absolute top-0 right-0 w-125 h-125 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4' />

        <div className='absolute bottom-0 left-0 w-125 h-125 bg-primary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4' />
      </div>

      {/* Hero */}
      <section className='relative px-4 py-24 text-center'>
        <div className='mx-auto max-w-3xl space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5'>
            <Code2 className='h-4 w-4 text-primary' />

            <span className='text-sm font-medium text-primary'>
              Interactive JavaScript Learning Platform
            </span>
          </div>

          <h1 className='text-5xl font-extrabold tracking-tight leading-tight'>
            Master JavaScript{' '}
            <span className='bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent'>
              From the Ground Up
            </span>
          </h1>

          <p className='text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed'>
            Learn JavaScript through interactive exercises with instant
            feedback. From Conditionals to Loops to Functions — free, no
            installation required.
          </p>

          <div className='flex items-center justify-center gap-3 pt-2'>
            <Button
              size='lg'
              asChild
            >
              <Link href='/concepts'>Start Learning</Link>
            </Button>

            {isLoggedIn ? (
              <Button
                size='lg'
                variant='outline'
                asChild
              >
                <Link href='/learn'>Check Your Progress</Link>
              </Button>
            ) : (
              <Button
                size='lg'
                variant='outline'
                asChild
              >
                <Link href='/sign-up'>Sign Up Free</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className='mx-auto max-w-5xl px-4 py-8'>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {stats.map((stat) => (
            <div
              key={stat.label}
              className='rounded-xl border bg-card/50 backdrop-blur-sm p-5 hover:bg-card hover:border-primary/30 transition-all'
            >
              <div className='flex items-center gap-3 mb-2'>
                <div className='p-2 rounded-lg bg-primary/10'>
                  <stat.icon className='h-5 w-5 text-primary' />
                </div>

                <span className='text-2xl font-bold'>{stat.value}</span>
              </div>
              <p className='text-sm text-muted-foreground'>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Concepts */}
      <section className='mx-auto max-w-5xl px-4 py-16'>
        <div className='mb-10'>
          <h2 className='text-2xl font-bold mb-2'>Start Here</h2>

          <p className='text-muted-foreground'>
            Three essential JavaScript concepts you need to master.
          </p>
        </div>

        <div className='grid gap-5 md:grid-cols-3'>
          {concepts.map((concept, index) => (
            <Link
              key={concept.id}
              href={`/concepts/${concept.id}`}
            >
              <div className='group relative rounded-xl border bg-card/30 backdrop-blur-sm p-6 hover:bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden h-full'>
                <div className='absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                <div className='relative space-y-3'>
                  <div className='flex items-center justify-between'>
                    <div className='h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                      <span className='text-primary font-bold'>
                        {index + 1}
                      </span>
                    </div>

                    <Badge
                      variant='outline'
                      className='text-xs'
                    >
                      Concept
                    </Badge>
                  </div>

                  <h3 className='font-bold text-lg group-hover:text-primary transition-colors'>
                    {concept.title}
                  </h3>

                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {concept.description}
                  </p>

                  <p className='text-sm text-primary font-medium group-hover:translate-x-1 transition-transform inline-flex'>
                    Explore →
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!isLoggedIn && (
        <section className='mx-auto max-w-3xl px-4 py-16 text-center'>
          <div className='rounded-2xl border bg-linear-to-br from-primary/10 to-primary/5 p-12 space-y-4'>
            <h2 className='text-2xl font-bold'>Ready to Get Started?</h2>

            <p className='text-muted-foreground max-w-md mx-auto'>
              Sign up now and start your JavaScript learning journey. Free,
              forever.
            </p>

            <Button
              size='lg'
              asChild
            >
              <Link href='/sign-up'>Create Account</Link>
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
