import { FormEvent, ReactNode } from 'react';

import { RefreshCcw, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Props = {
  searchValue: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  filters?: ReactNode;
};

export default function AdminToolbar({
  searchValue,
  searchPlaceholder = 'Search data...',
  onSearchChange,
  onSearchSubmit,
  onReset,
  filters,
}: Props) {
  return (
    <div className='flex flex-col gap-4 border-b p-4 md:p-5 lg:flex-row lg:items-start lg:justify-between'>
      <form
        onSubmit={onSearchSubmit}
        className='flex w-full flex-col gap-2 sm:flex-row lg:max-w-md'
      >
        <div className='relative flex-1'>
          <Search className='pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground' />

          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className='pl-9'
          />
        </div>

        <Button type='submit'>Search</Button>

        <Button
          type='button'
          variant='secondary'
          className='gap-2'
          onClick={onReset}
        >
          <RefreshCcw className='size-4' />
          Reset
        </Button>
      </form>

      {filters && (
        <div className='flex flex-wrap items-center justify-end gap-2'>{filters}</div>
      )}
    </div>
  );
}
