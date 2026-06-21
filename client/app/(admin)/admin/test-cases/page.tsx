import { cookies } from 'next/headers';
import Link from 'next/link';

import { TestCase } from '@/types';

import { fetchStudyCaseById, fetchTestCases } from '@/lib/fetch';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AppSortFilter from '@/components/shared/SortFilter';
import AppPagination from '@/components/shared/Pagination';
import AppSearchbar from '@/components/shared/Searchbar';
import FilterBadge from '@/components/shared/FilterBadge';

import TestCaseActions from './TestCaseActions';

const SORT_OPTIONS = [
  { label: 'Created At', value: 'createdAt' },
  { label: 'Order', value: 'order' },
];

export default async function AdminTestCasesPage({
  searchParams,
}: {
  searchParams: Promise<{
    studyCaseId?: string;
    page?: string;
    sortBy?: string;
    orderBy?: string;
    search?: string;
  }>;
}) {
  const { studyCaseId, page, sortBy, orderBy, search } = await searchParams;

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value || '';

  const [studyCase, { data: testCases, pagination }] = await Promise.all([
    studyCaseId
      ? fetchStudyCaseById(studyCaseId, token)
      : Promise.resolve(null),
    fetchTestCases(token, {
      ...(studyCaseId && {
        studyCaseId,
        sortBy: sortBy || 'order',
        orderBy: orderBy || 'asc',
      }),
      ...(!studyCaseId && {
        sortBy: sortBy || 'createdAt',
        orderBy: orderBy || 'desc',
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
          <h1 className='text-2xl font-bold'>Test Cases</h1>
          <p className='text-muted-foreground text-sm'>
            {studyCase
              ? `Test cases in ${studyCase.data.title}`
              : 'All test cases across study cases'}
          </p>
          <FilterBadge
            filters={
              studyCaseId && studyCase
                ? [
                    {
                      key: 'studyCaseId',
                      label: 'Study Case',
                      value: studyCase.data.title,
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
          <AppSearchbar placeholder='Search test cases...' />

          <AppSortFilter
            sortOptions={SORT_OPTIONS}
            defaultSortBy={studyCaseId ? 'order' : 'createdAt'}
            defaultOrderBy={
              (orderBy as 'asc' | 'desc') || (studyCaseId ? 'asc' : 'desc')
            }
          />
        </div>

        <TestCaseActions
          mode='create'
          studyCaseId={Number(studyCaseId)}
        />
      </div>

      {/* Table */}
      <div className='border rounded-xl overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-muted/50'>
              <TableHead className='w-16'>No.</TableHead>

              <TableHead className='w-16'>Order</TableHead>

              <TableHead>Description</TableHead>

              <TableHead>Input</TableHead>

              <TableHead>Expected</TableHead>

              <TableHead className='w-24'>Published</TableHead>

              <TableHead className='w-24 text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!testCases || testCases.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='text-center text-muted-foreground py-12'
                >
                  No test cases found.
                </TableCell>
              </TableRow>
            ) : (
              testCases.map((testCase: TestCase, index) => (
                <TableRow key={testCase.id}>
                  <TableCell className='font-mono text-muted-foreground'>
                    {index + 1}
                  </TableCell>

                  <TableCell className='font-mono text-muted-foreground'>
                    #{testCase.order}
                  </TableCell>

                  <TableCell className='font-semibold'>
                    {testCase.description}
                  </TableCell>

                  <TableCell className='font-mono text-sm text-muted-foreground max-w-xs truncate'>
                    {JSON.stringify(testCase.input)}
                  </TableCell>

                  <TableCell className='font-mono text-sm text-muted-foreground max-w-xs truncate'>
                    {JSON.stringify(testCase.expected)}
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={testCase.isPublished ? 'default' : 'secondary'}
                    >
                      {testCase.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className='text-right'>
                    {studyCaseId ? (
                      <TestCaseActions
                        mode='edit'
                        testCase={testCase}
                        studyCaseId={Number(studyCaseId)}
                      />
                    ) : (
                      <Button
                        variant='ghost'
                        size='sm'
                        asChild
                      >
                        <Link
                          href={`/admin/test-cases?studyCaseId=${testCase.studyCaseId}`}
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
