import { fetchModules } from '@/lib/fetch';

import { Layers3 } from 'lucide-react';

import { PublicHeader } from '@/components/shared/public-header';

import { ModuleTimeline } from './components/module-timeline';
import { LearningStatsPanel } from './components/learning-stats-panel';

const pageHeader = {
  title: 'Learning Curriculum',
  paragraph:
    'Start with the first module and continue step by step. Each module contains short materials and practice challenges.',
};

export default async function ModulesPage() {
  const { data: modules } = await fetchModules(undefined, {
    sortBy: 'order',
    orderBy: 'asc',
  });

  return (
    <>
      <PublicHeader
        title={pageHeader.title}
        paragraph={pageHeader.paragraph}
      />

      <div className='grid grid-cols-1 md:grid-cols-5 xl:grid-cols-6 md:grid-rows-1 gap-6 xl:gap-8'>
        <div className='order-2 md:order-1 md:col-span-3 xl:col-span-4 flex flex-col gap-y-6 xl:gap-y-8'>
          <div className='flex items-end justify-between'>
            <h2 className='text-xl lg:text-2xl font-semibold'>
              Learning Modules
            </h2>

            <span className='text-xs font-medium text-muted-foreground'>
              {modules.length} Modules Available
            </span>
          </div>

          <div>
            {modules.length > 0 ? (
              <ModuleTimeline modules={modules} />
            ) : (
              <section className='rounded-2xl border border-dashed bg-card p-10 text-center'>
                <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
                  <Layers3 className='size-6' />
                </div>

                <div className='flex flex-col gap-y-2 pt-4'>
                  <h3 className='font-bold'>No concepts yet</h3>

                  <p className='text-xs lg:text-sm text-muted-foreground'>
                    Published concepts will appear here.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>

        <div className='order-1 md:order-2 md:col-span-2 flex flex-col gap-y-6 lg:gap-y-8'>
          <LearningStatsPanel />
        </div>
      </div>
    </>
  );
}
