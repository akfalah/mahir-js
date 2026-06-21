import { cookies } from 'next/headers';
import Link from 'next/link';

import { Material } from '@/types';

import { fetchConceptById, fetchMaterials } from '@/lib/fetch';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import FilterBadge from '@/components/shared/FilterBadge';
import AppSearchbar from '@/components/shared/Searchbar';
import AppSortFilter from '@/components/shared/SortFilter';
import AppPagination from '@/components/shared/Pagination';

import { ChevronRight } from 'lucide-react';

import MaterialActions from './MaterialActions';

const SORT_OPTIONS = [
  { label: 'Created At', value: 'createdAt' },
  { label: 'Order', value: 'order' },
  { label: 'Title', value: 'title' },
];

export default async function AdminMaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{
    conceptId?: string;
    page?: string;
    sortBy?: string;
    orderBy?: string;
    search?: string;
  }>;
}) {
  const { conceptId, page, sortBy, orderBy, search } = await searchParams;
  const orderDirection =
    orderBy === 'asc' || orderBy === 'desc' ? orderBy : 'desc';
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';

  const [concept, { data: materials, pagination }] = await Promise.all([
    conceptId ? fetchConceptById(conceptId, token) : Promise.resolve(null),
    fetchMaterials(token, {
      ...(conceptId && {
        conceptId,
        sortBy: sortBy || 'order',
        orderBy: orderDirection,
      }),
      ...(!conceptId && {
        sortBy: sortBy || 'createdAt',
        orderBy: orderDirection,
      }),
      page: page ? Number(page) : 1,
      ...(search && { search }),
    }),
  ]);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold'>Materials</h1>

          <p className='text-muted-foreground text-sm'>
            {concept
              ? `Materials in ${concept.data.title}`
              : 'All materials across concepts'}
          </p>

          <FilterBadge
            filters={
              conceptId && concept
                ? [
                    {
                      key: 'conceptId',
                      label: 'Concept',
                      value: concept.data.title,
                    },
                  ]
                : []
            }
          />
        </div>
      </div>

      {/* Filter & Create Action */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <AppSearchbar placeholder='Search materials...' />

          <AppSortFilter
            sortOptions={SORT_OPTIONS}
            defaultSortBy={conceptId ? 'order' : 'createdAt'}
            defaultOrderBy={
              (orderBy as 'asc' | 'desc') || (conceptId ? 'asc' : 'desc')
            }
          />
        </div>

        <MaterialActions
          mode='create'
          conceptId={Number(conceptId)}
        />
      </div>

      {/* Table */}
      <div className='border rounded-xl overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-16'>No.</TableHead>

              <TableHead className='w-16'>Order</TableHead>

              <TableHead>Title</TableHead>

              <TableHead>Concept</TableHead>

              <TableHead>Content Preview</TableHead>

              <TableHead className='w-32'>Study Cases</TableHead>

              <TableHead className='w-24 text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!materials || materials.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-center text-muted-foreground py-12'
                >
                  No materials found.
                </TableCell>
              </TableRow>
            ) : (
              materials.map((material: Material, index) => (
                <TableRow key={material.id}>
                  <TableCell className='font-mono text-muted-foreground'>
                    {index + 1}
                  </TableCell>

                  <TableCell className='font-mono text-muted-foreground'>
                    #{material.order}
                  </TableCell>

                  <TableCell className='font-semibold'>
                    {material.title}
                  </TableCell>

                  <TableCell className='font-semibold'>
                    {concept?.data.title}
                  </TableCell>

                  <TableCell className='text-muted-foreground max-w-xs truncate text-sm'>
                    {material.content.slice(0, 80)}...
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/admin/study-cases?materialId=${material.id}`}
                      className='text-primary hover:underline text-sm flex items-center gap-1'
                    >
                      View Study Cases
                      <ChevronRight className='h-3 w-3' />
                    </Link>
                  </TableCell>

                  <TableCell className='text-right'>
                    {conceptId ? (
                      <MaterialActions
                        mode='edit'
                        material={material}
                        conceptId={Number(conceptId)}
                      />
                    ) : (
                      <Button
                        variant='ghost'
                        size='sm'
                        asChild
                      >
                        <Link
                          href={`/admin/materials?conceptId=${material.conceptId}`}
                        >
                          Filter
                        </Link>
                      </Button>
                    )}
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
