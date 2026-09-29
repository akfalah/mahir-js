import { notFound } from 'next/navigation';

import { Layers3 } from 'lucide-react';

import { fetchModuleBySlug } from '@/lib/fetch';

import { Badge } from '@/components/ui/badge';
import { PublicBreadcrumb } from '@/components/shared/public-breadcrumb';
import { PublicHeader } from '@/components/shared/public-header';
import { MaterialTimeline } from './components/material-timeline';
import { ModuleStatsCard } from './components/module-stats-card';

type Props = {
  params: Promise<{ moduleSlug: string }>;
};

export default async function ModuleDetailPage({ params }: Props) {
  const { moduleSlug } = await params;

  const { data: module } = await fetchModuleBySlug(moduleSlug);

  if (!module) {
    notFound();
  }

  return (
    <>
      <PublicBreadcrumb />

      <PublicHeader
        title={module.title}
        paragraph={module.description}
        badges={<Badge variant='tertiary'>Module {module.order}</Badge>}
      />

      <div className='grid grid-cols-1 md:grid-cols-5 xl:grid-cols-6 md:grid-rows-1 gap-6 xl:gap-8'>
        <div className='order-2 md:order-1 md:col-span-3 xl:col-span-4 flex flex-col gap-y-6 xl:gap-y-8'>
          <div className='flex items-end justify-between'>
            <h2 className='text-xl lg:text-2xl font-semibold'>
              Learning Materials
            </h2>

            <span className='text-xs font-medium text-muted-foreground'>
              {module.materials.length} Materials Available
            </span>
          </div>

          <div>
            {module.materials.length > 0 ? (
              <MaterialTimeline
                materials={module.materials}
                moduleSlug={module.slug}
              />
            ) : (
              <section className='rounded-2xl border border-dashed bg-card p-10 text-center'>
                <div className='mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
                  <Layers3 className='size-6' />
                </div>

                <div className='flex flex-col gap-y-2 pt-4'>
                  <h3 className='font-bold'>No materials yet</h3>

                  <p className='text-xs lg:text-sm text-muted-foreground'>
                    Published materials will appear here.
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>

        <div className='order-1 md:order-2 md:col-span-2'>
          <ModuleStatsCard materials={module.materials} />
        </div>
      </div>
    </>
  );
}
