import { Button } from '@/components/ui/button';

import { PaginationMeta } from '@/types';

type PaginationItem = number | 'ellipsis-left' | 'ellipsis-right';

type Props = {
  pagination: PaginationMeta;
  label: string;
  onPageChange: (page: number) => void;
};

function getPaginationItems(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];

  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) {
    items.push('ellipsis-left');
  }

  for (let item = start; item <= end; item++) {
    items.push(item);
  }

  if (end < totalPages - 1) {
    items.push('ellipsis-right');
  }

  items.push(totalPages);

  return items;
}

export default function AdminPagination({
  pagination,
  label,
  onPageChange,
}: Props) {
  const totalPages = pagination.totalPages || 1;
  const items = getPaginationItems(pagination.page, totalPages);

  return (
    <div className='flex flex-col gap-y-3 border-t p-4 md:flex-row md:items-center md:justify-between'>
      <p className='text-sm text-muted-foreground'>
        Showing page {pagination.page} of {totalPages} · {pagination.total}{' '}
        total {label}
      </p>

      <div className='flex flex-wrap items-center gap-2'>
        <Button
          type='button'
          variant='secondary'
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </Button>

        {items.map((item) =>
          typeof item === 'number' ? (
            <Button
              key={item}
              type='button'
              variant={item === pagination.page ? 'default' : 'outline'}
              size='icon'
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ) : (
            <span
              key={item}
              className='px-2 text-sm text-muted-foreground'
            >
              ...
            </span>
          ),
        )}

        <Button
          type='button'
          variant='secondary'
          disabled={pagination.page >= totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
