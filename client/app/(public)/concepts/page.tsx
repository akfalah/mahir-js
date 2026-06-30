import { Layers3 } from 'lucide-react';

import { fetchConcepts } from '@/lib/fetch';

import { Badge } from '@/components/ui/badge';

import PublicBreadcrumb from '@/components/shared/PublicBreadcrumb';
import ConceptGrid from './components/ConceptGrid';

const pageContent = {
  badge: 'Learning Path',
  title: 'Choose your JavaScript concept.',
  description:
    'Start with the first concept and continue step by step. Each concept contains short materials and practice challenges.',
};

export default async function ConceptsPage() {
  const { data: concepts } = await fetchConcepts();

  return (
    <div className='container mx-auto px-4 py-10 md:py-12 flex flex-col gap-y-8'>
      <PublicBreadcrumb items={[{ label: 'Concepts' }]} />

      <section className='flex max-w-3xl flex-col gap-y-4'>
        <Badge
          variant='secondary'
          className='w-fit rounded-full px-3 py-1'
        >
          {pageContent.badge}
        </Badge>

        <div className='flex flex-col gap-y-3'>
          <h1 className='text-3xl font-bold tracking-tight md:text-5xl'>
            {pageContent.title}
          </h1>

          <p className='text-base leading-relaxed text-muted-foreground md:text-lg'>
            {pageContent.description}
          </p>
        </div>
      </section>

      {concepts.length > 0 ? (
        <ConceptGrid concepts={concepts} />
      ) : (
        <section className='rounded-2xl border border-dashed bg-card p-10 text-center'>
          <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
            <Layers3 className='size-6' />
          </div>

          <div className='flex flex-col gap-y-2 pt-4'>
            <h2 className='font-bold'>No concepts yet</h2>

            <p className='text-sm text-muted-foreground'>
              Published concepts will appear here.
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
