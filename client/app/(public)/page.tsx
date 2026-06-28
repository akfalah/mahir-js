import Link from 'next/link';

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PublicLandingActions from '@/components/shared/PublicLandingActions';

const learningSteps = [
  {
    title: 'Read',
    description:
      'Start with short materials that explain one JavaScript concept at a time.',
    icon: BookOpen,
  },
  {
    title: 'Practice',
    description:
      'Write JavaScript code directly in the browser using a guided editor.',
    icon: Code2,
  },
  {
    title: 'Test',
    description:
      'Run test cases, see which ones pass or fail, then improve your code.',
    icon: CheckCircle2,
  },
];

const ctaHighlights = [
  'Beginner-friendly materials',
  'Practice with code editor',
  'Clear test feedback',
];

export default function LandingPage() {
  return (
    <div>
      <section className='relative isolate overflow-hidden bg-background'>
        <div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,var(--primary),transparent_32%)] opacity-20' />

        <div className='container mx-auto px-4 py-20 md:py-28'>
          <div className='mx-auto max-w-4xl flex flex-col items-center gap-y-8 text-center'>
            <Badge variant='secondary'>
              <Code2 />

              <span>Beginner Friendly JavaScript Practice</span>
            </Badge>

            <h1 className='text-4xl font-bold tracking-tight md:text-6xl'>
              Learn JavaScript by testing your code step by step.
            </h1>

            <p className='mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg'>
              Mahir.js helps beginners learn basic concepts of JavaScript
              through short materials, guided coding challenges, and clear test
              feedback.
            </p>

            <PublicLandingActions />
          </div>
        </div>
      </section>

      <section className='container mx-auto px-4 py-14 md:py-16 flex flex-col gap-y-8 border-y'>
        <div className='mx-auto max-w-2xl flex flex-col items-center gap-y-4 text-center'>
          <Badge variant='outline'>How it works</Badge>

          <h2 className='text-3xl font-bold tracking-tight'>
            A simple learning flow for beginners.
          </h2>

          <p className='text-muted-foreground'>
            You do not need to guess what to do next. Each step guides you from
            reading, practicing, testing, and improving.
          </p>
        </div>

        <div className='grid gap-5 md:grid-cols-3'>
          {learningSteps.map((step) => {
            const Icon = step.icon;

            return (
              <Card key={step.title}>
                <CardContent className='p-6 flex flex-col gap-y-4'>
                  <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                    <Icon className='size-6' />
                  </div>

                  <div className='space-y-2'>
                    <h3 className='text-lg font-bold'>{step.title}</h3>

                    <p className='text-sm leading-relaxed text-muted-foreground'>
                      {step.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className='container mx-auto px-4 py-14 md:py-16'>
          <div className='mx-auto flex max-w-3xl p-8 md:p-10 flex-col items-center gap-y-6 text-center bg-card/70 border rounded-3xl shadow-sm'>
            <div className='mx-auto flex size-12 items-center justify-center text-primary bg-primary/10 rounded-2xl'>
              <Sparkles className='size-6' />
            </div>

            <div className='mt-6 flex flex-col items-center gap-y-3'>
              <h2 className='text-3xl font-bold tracking-tight'>
                Ready to start your JavaScript journey?
              </h2>

              <p className='max-w-2xl text-muted-foreground'>
                Explore the concepts, read the first material, and practice with
                test cases directly in your browser.
              </p>
            </div>

            <div className='flex flex-wrap justify-center gap-2'>
              {ctaHighlights.map((highlight) => (
                <Badge
                  key={highlight}
                  variant='secondary'
                >
                  {highlight}
                </Badge>
              ))}
            </div>

            <Button
              asChild
              className='gap-2'
            >
              <Link href='/concepts'>
                Explore Concepts
                <ArrowRight className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
