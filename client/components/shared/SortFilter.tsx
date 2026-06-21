'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { Funnel } from 'lucide-react';

type SortOption = {
  label: string;
  value: string;
};

type Props = {
  sortOptions: SortOption[];
  defaultSortBy?: string;
  defaultOrderBy?: 'asc' | 'desc';
};

export default function AppSortFilter({
  sortOptions,
  defaultSortBy,
  defaultOrderBy,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSortBy =
    searchParams.get('sortBy') || defaultSortBy || sortOptions[0]?.value;
  const currentOrderBy = searchParams.get('orderBy') || defaultOrderBy;

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const currentSortLabel = sortOptions.find(
    (o) => o.value === currentSortBy,
  )?.label;

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='outline'
            className='gap-2'
          >
            <Funnel className='h-3.5 w-3.5' />
            Sort by: {currentSortLabel}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align='end'
          className='w-48'
        >
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuRadioGroup
            value={currentSortBy}
            onValueChange={(val) => updateParams('sortBy', val)}
          >
            {sortOptions.map((option) => (
              <DropdownMenuRadioItem
                key={option.value}
                value={option.value}
              >
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Order</DropdownMenuLabel>

          <DropdownMenuRadioGroup
            value={currentOrderBy}
            onValueChange={(val) => updateParams('orderBy', val)}
          >
            <DropdownMenuRadioItem value='asc'>Ascending</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value='desc'>
              Descending
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
