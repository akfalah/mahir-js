import { cookies } from 'next/headers';
import Link from 'next/link';

import { StudyCase } from '@/types';

import { fetchMaterialById, fetchStudyCases } from '@/lib/fetch';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import AppSortFilter from '@/components/shared/SortFilter';
import AppPagination from '@/components/shared/Pagination';
import AppSearchbar from '@/components/shared/Searchbar';
import FilterBadge from '@/components/shared/FilterBadge';

import { ChevronRight } from 'lucide-react';

import StudyCaseActions from './StudyCaseActions';

const SORT_OPTIONS = [
  { label: 'Created At', value: 'createdAt' },
  { label: 'Order', value: 'order' },
  { label: 'Title', value: 'title' },
];

export default async function AdminStudyCasesPage({
  searchParams,
}: {
  searchParams: Promise<{
    materialId?: string;
    page?: string;
    sortBy?: string;
    orderBy?: string;
    search?: string;
  }>;
}) {
  const { materialId, page, sortBy, orderBy, search } = await searchParams;
  const orderDirection =
    orderBy === 'asc' || orderBy === 'desc' ? orderBy : 'desc';
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';

  const [material, { data: studyCases, pagination }] = await Promise.all([
    materialId ? fetchMaterialById(materialId, token) : Promise.resolve(null),
    fetchStudyCases(token, {
      ...(materialId && {
        materialId,
        sortBy: sortBy || 'order',
        orderBy: orderDirection,
      }),
      ...(!materialId && {
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
          <h1 className='text-2xl font-bold'>Study Cases</h1>

          <p className='text-muted-foreground text-sm'>
            {material
              ? `Study cases in ${material.data.title}`
              : 'All study cases across materials'}
          </p>

          <FilterBadge
            filters={
              materialId && material
                ? [
                    {
                      key: 'materialId',
                      label: 'Material',
                      value: material.data.title,
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
          <AppSearchbar placeholder='Search study cases...' />

          <AppSortFilter
            sortOptions={SORT_OPTIONS}
            defaultSortBy={materialId ? 'order' : 'createdAt'}
            defaultOrderBy={
              (orderBy as 'asc' | 'desc') || (materialId ? 'asc' : 'desc')
            }
          />
        </div>

        <StudyCaseActions
          mode='create'
          materialId={Number(materialId)}
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

              <TableHead>Material</TableHead>

              <TableHead>Description</TableHead>

              <TableHead className='w-32'>Test Cases</TableHead>

              <TableHead className='w-24 text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!studyCases || studyCases.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='text-center text-muted-foreground py-12'
                >
                  No study cases found.
                </TableCell>
              </TableRow>
            ) : (
              studyCases.map((studyCase: StudyCase, index) => (
                <TableRow key={studyCase.id}>
                  <TableCell className='font-mono text-muted-foreground'>
                    {index + 1}
                  </TableCell>

                  <TableCell className='font-mono text-muted-foreground'>
                    #{studyCase.order}
                  </TableCell>

                  <TableCell className='font-semibold'>
                    {studyCase.title}
                  </TableCell>

                  <TableCell className='font-semibold'>
                    {material?.data.title}
                  </TableCell>

                  <TableCell className='text-muted-foreground max-w-xs truncate text-sm'>
                    {studyCase.description}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/admin/test-cases?studyCaseId=${studyCase.id}`}
                      className='text-primary hover:underline text-sm flex items-center gap-1'
                    >
                      View Test Cases
                      <ChevronRight className='h-3 w-3' />
                    </Link>
                  </TableCell>

                  <TableCell className='text-right'>
                    {materialId ? (
                      <StudyCaseActions
                        mode='edit'
                        studyCase={studyCase}
                        materialId={Number(materialId)}
                      />
                    ) : (
                      <Button
                        variant='ghost'
                        size='sm'
                        asChild
                      >
                        <Link
                          href={`/admin/study-cases?materialId=${studyCase.materialId}`}
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
