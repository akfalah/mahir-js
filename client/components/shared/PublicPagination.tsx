import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

import { cn } from '@/lib/utils';

import { PaginationMeta } from '@/types';

import { Button } from '@/components/ui/button';

type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

type Props = {
  pagination: PaginationMeta;
  itemLabel?: string;
  siblingCount?: number;
  pageSizeOptions?: number[];
  showPageSize?: boolean;
  className?: string;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (limit: number) => void;
};

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getPaginationItems({
  currentPage,
  totalPages,
  siblingCount,
}: {
  currentPage: number;
  totalPages: number;
  siblingCount: number;
}): PaginationItem[] {
  const maxVisibleItems = siblingCount * 2 + 5;

  if (totalPages <= maxVisibleItems) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const shouldShowLeftEllipsis = leftSibling > 2;
  const shouldShowRightEllipsis = rightSibling < totalPages - 1;

  if (!shouldShowLeftEllipsis && shouldShowRightEllipsis) {
    const leftItemCount = 3 + siblingCount * 2;

    return [...range(1, leftItemCount), 'end-ellipsis', totalPages];
  }

  if (shouldShowLeftEllipsis && !shouldShowRightEllipsis) {
    const rightItemCount = 3 + siblingCount * 2;
    const rightRangeStart = totalPages - rightItemCount + 1;

    return [1, 'start-ellipsis', ...range(rightRangeStart, totalPages)];
  }

  return [
    1,
    'start-ellipsis',
    ...range(leftSibling, rightSibling),
    'end-ellipsis',
    totalPages,
  ];
}

export default function PublicPagination({
  pagination,
  itemLabel = 'items',
  siblingCount = 1,
  pageSizeOptions = [5, 10, 20, 50],
  showPageSize = true,
  className,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const normalizedLimit = Math.max(pagination.limit, 1);
  const normalizedTotalPages = Math.max(pagination.totalPages, 1);
  const currentPage = Math.min(
    Math.max(pagination.page, 1),
    normalizedTotalPages,
  );

  const from =
    pagination.total > 0 ? (currentPage - 1) * normalizedLimit + 1 : 0;

  const to = Math.min(currentPage * normalizedLimit, pagination.total);

  const paginationItems = getPaginationItems({
    currentPage,
    totalPages: normalizedTotalPages,
    siblingCount,
  });

  const canShowPageSize = showPageSize && Boolean(onPageSizeChange);

  return (
    <div
      className={cn(
        'flex flex-col gap-y-4 rounded-3xl border bg-card p-4 md:flex-row md:items-center md:justify-between md:p-5',
        className,
      )}
    >
      <div className='flex flex-col gap-y-3 md:flex-row md:items-center md:gap-x-5'>
        <p className='text-muted-foreground'>
          Showing {from}-{to} of {pagination.total} {itemLabel}
        </p>

        {canShowPageSize && (
          <label className='flex items-center gap-2 text-sm text-muted-foreground'>
            <span>Show</span>

            <select
              value={normalizedLimit}
              onChange={(event) =>
                onPageSizeChange?.(Number(event.target.value))
              }
              className='h-9 rounded-md border bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
            >
              {pageSizeOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option}
                </option>
              ))}
            </select>

            <span>per page</span>
          </label>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={currentPage <= 1}
          className='gap-2'
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className='size-4' />
          Previous
        </Button>

        <div className='flex flex-wrap items-center gap-2'>
          {paginationItems.map((item) => {
            if (item === 'start-ellipsis' || item === 'end-ellipsis') {
              return (
                <div
                  key={item}
                  className='flex size-9 items-center justify-center rounded-md text-muted-foreground'
                >
                  <MoreHorizontal className='size-4' />
                </div>
              );
            }

            const isActive = item === currentPage;

            return (
              <Button
                key={item}
                type='button'
                variant={isActive ? 'default' : 'outline'}
                size='sm'
                disabled={isActive}
                className='size-9 p-0'
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            );
          })}
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={currentPage >= normalizedTotalPages}
          className='gap-2'
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
          <ChevronRight className='size-4' />
        </Button>
      </div>
    </div>
  );
}
