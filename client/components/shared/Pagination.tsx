'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { PaginationMeta } from '@/types';

import { Button } from '@/components/ui/button';

import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AppPagination({
  pagination,
}: {
  pagination: PaginationMeta;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  if (pagination.totalPages <= 1) return null;

  return (
    <div className='flex items-center justify-between px-2 py-3'>
      <p className='text-sm text-muted-foreground'>
        Showing{' '}
        <span className='font-medium'>
          {(pagination.page - 1) * pagination.limit + 1}
        </span>{' '}
        to{' '}
        <span className='font-medium'>
          {Math.min(pagination.page * pagination.limit, pagination.total)}
        </span>{' '}
        of <span className='font-medium'>{pagination.total}</span> results
      </p>

      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => goToPage(pagination.page - 1)}
          disabled={pagination.page <= 1}
        >
          <ChevronLeft className='h-4 w-4' />
          Previous
        </Button>

        <span className='text-sm text-muted-foreground'>
          Page {pagination.page} of {pagination.totalPages}
        </span>
        
        <Button
          variant='outline'
          size='sm'
          onClick={() => goToPage(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
        >
          Next
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
