import Link from 'next/link';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

type NavigationItem = {
  label?: string;
  href: string;
};

type Props = {
  previous?: NavigationItem | null;
  next?: NavigationItem | null;
  backHref: string;
  backLabel: string;
};

export default function PublicPrevNextNavigation({
  previous,
  next,
  backHref,
  backLabel,
}: Props) {
  return (
    <section
      className='w-full grid grid-cols-1 gap-3 md:grid-cols-3 md:items-center'
    >
      <div className='flex justify-start'>
        {previous && (
          <Button
            variant='outline'
            asChild
            className='gap-2'
          >
            <Link href={previous.href}>
              <ChevronLeft className='size-4' />
              {previous.label ?? 'Previous'}
            </Link>
          </Button>
        )}
      </div>

      <div className='flex justify-center'>
        <Button
          variant='secondary'
          asChild
        >
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      </div>

      <div className='flex justify-end'>
        {next && (
          <Button
            asChild
            className='gap-2'
          >
            <Link href={next.href}>
              {next.label ?? 'Next'}
              <ChevronRight className='size-4' />
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
