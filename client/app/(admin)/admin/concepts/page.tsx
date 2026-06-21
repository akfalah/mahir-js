import { cookies } from 'next/headers';
import Link from 'next/link';

import { Concept } from '@/types';

import { fetchConcepts } from '@/lib/fetch';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AppSearchbar from '@/components/shared/Searchbar';
import AppSortFilter from '@/components/shared/SortFilter';
import AppPagination from '@/components/shared/Pagination';

import { ChevronRight } from 'lucide-react';

import ConceptActions from './conceptActions';

const SORT_OPTIONS = [
  { label: 'Created At', value: 'createdAt' },
  { label: 'Order', value: 'order' },
  { label: 'Title', value: 'title' },
];

export default async function AdminConceptsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    sortBy?: string;
    orderBy?: string;
    search?: string;
  }>;
}) {
  const { page, sortBy, orderBy, search } = await searchParams;
  const orderDirection =
    orderBy === 'asc' || orderBy === 'desc' ? orderBy : 'desc';
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';

  const { data: concepts, pagination } = await fetchConcepts(token, {
    page: page ? Number(page) : 1,
    sortBy: sortBy || 'createdAt',
    orderBy: orderDirection,
    ...(search && { search }),
  });

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold'>Concepts</h1>

          <p className='text-muted-foreground text-sm'>
            Manage JavaScript learning concepts.
          </p>
        </div>
      </div>

      {/* Filter & Create Action */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <AppSearchbar placeholder='Search concepts...' />

          <AppSortFilter
            sortOptions={SORT_OPTIONS}
            defaultSortBy={sortBy}
            defaultOrderBy={orderDirection}
          />
        </div>

        <ConceptActions mode='create' />
      </div>

      {/* Table */}
      <div className='border rounded-xl overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-16'>No.</TableHead>

              <TableHead className='w-16'>Order</TableHead>

              <TableHead>Title</TableHead>

              <TableHead>Description</TableHead>

              <TableHead className='w-32'>Materials</TableHead>

              <TableHead className='w-24 text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {concepts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='text-center text-muted-foreground py-12'
                >
                  No concepts yet. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              concepts.map((concept: Concept, index) => (
                <TableRow key={concept.id}>
                  <TableCell className='font-mono text-muted-foreground'>
                    {index + 1}
                  </TableCell>

                  <TableCell className='font-mono text-muted-foreground'>
                    #{concept.order}
                  </TableCell>

                  <TableCell className='font-semibold'>
                    {concept.title}
                  </TableCell>

                  <TableCell className='text-muted-foreground max-w-xs truncate'>
                    {concept.description}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/admin/materials?conceptId=${concept.id}`}
                      className='text-primary hover:underline text-sm flex items-center gap-1'
                    >
                      View Materials
                      <ChevronRight className='h-3 w-3' />
                    </Link>
                  </TableCell>

                  <TableCell className='text-right'>
                    <ConceptActions
                      mode='edit'
                      concept={concept}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {pagination && <AppPagination pagination={pagination} />}
      </div>
    </div>
  );
}
