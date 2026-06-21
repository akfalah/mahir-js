'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { Badge } from '@/components/ui/badge';

import { X } from 'lucide-react';

type Filter = {
  key: string;
  label: string;
  value: string;
};

export default function AppFilterBadge({ filters }: { filters: Filter[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  if (filters.length === 0) return null;

  return (
    <div className='flex items-center gap-2 flex-wrap'>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant='secondary'
          className='gap-1 pr-1 text-xs'
        >
          {filter.label} = {filter.value}
          <button
            onClick={() => removeFilter(filter.key)}
            className='ml-1 hover:text-destructive transition-colors'
          >
            <X className='h-3 w-3' />
          </button>
        </Badge>
      ))}
    </div>
  );
}
