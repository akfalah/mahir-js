import { Button } from '@/components/ui/button';
import { Concept, ConceptProgress } from '@/types';
import {
  ArrowRight,
  Badge,
  CheckCircle2,
  Code2,
  GitBranch,
  Link,
  Repeat2,
} from 'lucide-react';
import { cookies } from 'next/headers';

const iconMap = [Code2, GitBranch, Repeat2];

async function getConcepts(): Promise<Concept[]> {
  const res = await fetch(
    `${process.env.API_URL || 'http://localhost:8888'}/api/concepts?sortBy=order&orderBy=asc&limit=100`,
    { cache: 'no-store' },
  );
  const data = await res.json();

  return data.data;
}

async function getConceptProgresses(token: string): Promise<ConceptProgress[]> {
  const res = await fetch(
    `${process.env.API_URL || 'http://localhost:8888'}/api/progress/concepts`,
    {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await res.json();

  return data.data;
}

export default async function LearnPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';

  const [concepts, progresses] = await Promise.all([
    getConcepts(),
    getConceptProgresses(token),
  ]);

  const progressMap = progresses.reduce<Record<number, ConceptProgress>>(
    (acc, p) => {
      acc[p.conceptId] = p;
      return acc;
    },
    {},
  );

  const completedCount = progresses.filter((p) => p.isCompleted).length;

  return (
    <div className='max-w-6xl mx-auto space-y-12'>
      {/* Header */}
      <div className='py-8 space-y-3'>
        <h1 className='text-4xl font-bold tracking-tight'>My Progress</h1>

        <p className='text-muted-foreground text-lg'>
          Track your JavaScript learning journey.
        </p>

        {/* Overall progress */}
        <div className='flex items-center gap-3 pt-2'>
          <div className='flex-1 max-w-xs space-y-1'>
            <div className='flex items-center justify-between text-sm'>
              <span className='text-muted-foreground'>Overall</span>

              <span className='font-medium'>
                {completedCount} / {concepts.length} concepts
              </span>
            </div>
            <div className='w-full bg-muted rounded-full h-2'>
              <div
                className='bg-primary h-2 rounded-full transition-all duration-500'
                style={{
                  width: `${concepts.length > 0 ? (completedCount / concepts.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Concepts */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {concepts.map((concept, index) => {
          const Icon = iconMap[index] || Code2;
          const progress = progressMap[concept.id];
          const isCompleted = progress?.isCompleted ?? false;

          return (
            <div
              key={concept.id}
              className={`rounded-xl border p-6 flex flex-col gap-4 transition-all duration-200 hover:shadow-md ${
                isCompleted
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {/* Icon + completed badge */}
              <div className='flex items-start justify-between'>
                <div className='h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center'>
                  <Icon className='h-6 w-6 text-primary' />
                </div>
                {isCompleted && (
                  <Badge className='gap-1 text-xs'>
                    <CheckCircle2 className='h-3 w-3' />
                    Completed
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className='flex-1 space-y-2'>
                <h2 className='text-xl font-bold'>{concept.title}</h2>

                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {concept.description}
                </p>
              </div>

              {/* Progress bar */}
              <div className='space-y-1'>
                <div className='flex items-center justify-between text-xs text-muted-foreground'>
                  <span>Progress</span>

                  <span>{isCompleted ? '100%' : '0%'}</span>
                </div>

                <div className='w-full bg-muted rounded-full h-1.5'>
                  <div
                    className='bg-primary h-1.5 rounded-full transition-all duration-500'
                    style={{ width: isCompleted ? '100%' : '0%' }}
                  />
                </div>
              </div>

              {/* Button */}
              <Link href={`/concepts/${concept.id}`}>
                <Button
                  className='w-full gap-2'
                  variant={isCompleted ? 'outline' : 'default'}
                >
                  {isCompleted ? 'Review' : 'Continue'}
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
