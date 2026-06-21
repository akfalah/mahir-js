import Link from 'next/link';

import { Button } from '@/components/ui/button';

import { fetchConcepts } from '@/lib/fetch';

import { ArrowRight, Code2, GitBranch, Repeat2 } from 'lucide-react';

const iconMap = [Code2, GitBranch, Repeat2];

export default async function ConceptsPage() {
  const { data: concepts } = await fetchConcepts();

  return (
    <div className='max-w-6xl mx-auto space-y-12'>
      {/* Header */}
      <div className='py-12 space-y-3'>
        <h1 className='text-4xl font-bold tracking-tight'>
          Core JavaScript Concepts
        </h1>

        <p className='text-muted-foreground text-lg'>
          Master the fundamental building blocks of JavaScript. Complete each
          concept to track your progress.
        </p>
      </div>

      {/* Concept Grid */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {concepts.map((concept, index) => {
          const Icon = iconMap[index] || Code2;

          return (
            <div
              key={concept.id}
              className='rounded-xl border p-6 flex flex-col gap-4 transition-all duration-200 bg-card hover:bg-primary/5 border-border hover:border-primary/50 hover:shadow-md'
            >
              {/* Icon + Lock */}
              <div className='flex items-start justify-between'>
                <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center'>
                  <Icon className='h-6 w-6 text-primary' />
                </div>
              </div>

              {/* Content */}
              <div className='flex-1 space-y-2'>
                <h2 className='text-xl font-bold'>{concept.title}</h2>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {concept.description}
                </p>
              </div>

              {/* Progress bar placeholder */}
              <div className='space-y-1'>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>Progress</span>
                  <span>0%</span>
                </div>
                <div className='w-full bg-muted rounded-full h-1.5'>
                  <div className='bg-primary h-1.5 rounded-full w-0 transition-all duration-300' />
                </div>
              </div>

              {/* Button */}
              <Link href={`/concepts/${concept.id}`}>
                <Button className='w-full gap-2'>
                  Explore
                  <ArrowRight className='h-4 w-4' />
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
