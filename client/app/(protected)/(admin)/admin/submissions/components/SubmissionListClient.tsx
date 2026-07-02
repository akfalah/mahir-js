'use client';

import { useState } from 'react';

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Code2,
  Eye,
  RotateCw,
  SearchX,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAdminResource } from '@/hooks/use-admin-resource';

import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/get-api-error-message';
import { formatSubmissionDate } from '@/lib/helpers/date-formatter';

import {
  ApiResponse,
  SubmissionDetail,
  SubmissionStatus,
  TestResultStatus,
} from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DrawerClose, DrawerFooter } from '@/components/ui/drawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AdminContentPanel from '@/components/shared/AdminContentPanel';
import AdminDrawer from '@/components/shared/AdminDrawer';
import AdminPageHeader from '@/components/shared/AdminPageHeader';
import AdminPagination from '@/components/shared/AdminPagination';
import AdminStatusMessage from '@/components/shared/AdminStatusMessage';
import AdminToolbar from '@/components/shared/AdminToolbar';

type SubmissionRow = SubmissionDetail & {
  user?: {
    id: number;
    name: string;
    email: string;
  };
  studyCase?: {
    id: number;
    title: string;
    material?: {
      id: number;
      title: string;
      concept?: {
        id: number;
        title: string;
      };
    };
  };
};

function getStatusLabel(status: SubmissionStatus | TestResultStatus) {
  if (status === 'PASSED') return 'Passed';
  if (status === 'FAILED') return 'Failed';
  if (status === 'ERROR') return 'Error';
  if (status === 'RUNNING') return 'Running';
  return 'Pending';
}

function StatusIcon({
  status,
}: {
  status: SubmissionStatus | TestResultStatus;
}) {
  if (status === 'PASSED') {
    return <CheckCircle2 className='size-3' />;
  }

  if (status === 'FAILED') {
    return <XCircle className='size-3' />;
  }

  if (status === 'ERROR') {
    return <AlertCircle className='size-3' />;
  }

  if (status === 'RUNNING') {
    return <RotateCw className='size-3' />;
  }

  return <Clock3 className='size-3' />;
}

function getStatusVariant(status: SubmissionStatus | TestResultStatus) {
  if (status === 'PASSED') {
    return 'default';
  }

  if (status === 'FAILED' || status === 'PENDING' || status === 'RUNNING') {
    return 'secondary';
  }

  return 'destructive';
}

function StatusBadge({
  status,
}: {
  status: SubmissionStatus | TestResultStatus;
}) {
  return (
    <Badge
      variant={getStatusVariant(status)}
      className='gap-1 rounded-full'
    >
      <StatusIcon status={status} />
      {getStatusLabel(status)}
    </Badge>
  );
}

function formatOutput(value: string | null) {
  if (value === null || value === undefined || value === '') {
    return 'No output received';
  }

  return value;
}

export default function SubmissionListClient() {
  const {
    items,
    params,
    pagination,
    isLoading,
    message,
    updateParams,
    resetParams,
  } = useAdminResource<SubmissionRow>({
    endpoint: '/submissions',
    resourceName: 'Submission',
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      orderBy: 'desc',
    },
  });

  const submissions = items;

  const status = String(params.status ?? 'ALL');
  const orderBy = String(params.orderBy ?? 'desc');
  const limit = String(params.limit ?? 10);

  const [searchInput, setSearchInput] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionRow | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const getRowNumber = (index: number) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateParams({
      search: searchInput.trim() || undefined,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    resetParams();
  };

  const openDetailDrawer = async (submission: SubmissionRow) => {
    setSelectedSubmission(submission);
    setDrawerOpen(true);

    if (submission.testResults?.length > 0) {
      return;
    }

    setIsFetchingDetail(true);

    try {
      const res = await api.get<ApiResponse<SubmissionRow>>(
        `/submissions/${submission.id}`,
      );

      setSelectedSubmission(res.data.data);
    } catch (error) {
      toast.error('Failed to load submission detail', {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsFetchingDetail(false);
    }
  };

  return (
    <div className='flex flex-col gap-y-6'>
      <AdminContentPanel>
        <AdminPageHeader
          title='Submissions'
          description='Review student submissions and automated grading results.'
        />

        <AdminToolbar
          searchValue={searchInput}
          searchPlaceholder='Search submissions...'
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearch}
          onReset={handleReset}
          filters={
            <>
              <Select
                value={status}
                onValueChange={(value) =>
                  updateParams({
                    status: value === 'ALL' ? undefined : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Status' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='ALL'>All Status</SelectItem>
                  <SelectItem value='PASSED'>Passed</SelectItem>
                  <SelectItem value='FAILED'>Failed</SelectItem>
                  <SelectItem value='ERROR'>Error</SelectItem>
                  <SelectItem value='PENDING'>Pending</SelectItem>
                  <SelectItem value='RUNNING'>Running</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={orderBy}
                onValueChange={(value) =>
                  updateParams({
                    orderBy: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Order' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='asc'>Ascending</SelectItem>
                  <SelectItem value='desc'>Descending</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={limit}
                onValueChange={(value) =>
                  updateParams({
                    limit: Number(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Limit' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='10'>10 rows</SelectItem>
                  <SelectItem value='20'>20 rows</SelectItem>
                  <SelectItem value='50'>50 rows</SelectItem>
                  <SelectItem value='100'>100 rows</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        <div className='p-4 md:p-5'>
          <AdminStatusMessage message={message} />
        </div>

        <div className='overflow-x-auto px-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-16'>No.</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Study Case</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='hidden md:table-cell'>
                  Submitted
                </TableHead>
                <TableHead className='w-24 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className='h-5 w-8' />
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-2'>
                        <Skeleton className='h-5 w-36' />
                        <Skeleton className='h-4 w-52' />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-2'>
                        <Skeleton className='h-5 w-44' />
                        <Skeleton className='h-4 w-56' />
                      </div>
                    </TableCell>

                    <TableCell>
                      <Skeleton className='h-6 w-24' />
                    </TableCell>

                    <TableCell className='hidden md:table-cell'>
                      <Skeleton className='h-5 w-32' />
                    </TableCell>

                    <TableCell>
                      <div className='flex justify-end'>
                        <Skeleton className='size-9 rounded-xl' />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : submissions.length > 0 ? (
                submissions.map((submission, index) => (
                  <TableRow key={submission.id}>
                    <TableCell className='text-sm text-muted-foreground'>
                      {getRowNumber(index)}
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>
                          {submission.user?.name ??
                            `User #${submission.userId}`}
                        </p>

                        <p className='text-sm text-muted-foreground'>
                          {submission.user?.email ?? 'No email data'}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className='flex min-w-0 flex-col gap-y-1'>
                        <p className='truncate font-semibold'>
                          {submission.studyCase?.title ??
                            `Study Case #${submission.studyCaseId}`}
                        </p>

                        <p className='truncate text-sm text-muted-foreground'>
                          {submission.studyCase?.material?.title ?? '-'}
                          {submission.studyCase?.material?.concept?.title
                            ? ` • ${submission.studyCase.material.concept.title}`
                            : ''}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={submission.status} />
                    </TableCell>

                    <TableCell className='hidden text-sm text-muted-foreground md:table-cell'>
                      {formatSubmissionDate(submission.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className='flex justify-end'>
                        <Button
                          type='button'
                          variant='secondary'
                          size='icon'
                          onClick={() => openDetailDrawer(submission)}
                        >
                          <Eye className='size-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className='flex flex-col items-center gap-y-3 px-4 py-12 text-center'>
                      <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                        <SearchX className='size-6' />
                      </div>

                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>No submissions found</p>

                        <p className='text-sm text-muted-foreground'>
                          Student submissions will appear here after they run or
                          submit study cases.
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <AdminPagination
          pagination={pagination}
          label='submissions'
          onPageChange={(nextPage) =>
            updateParams(
              {
                page: nextPage,
              },
              {
                resetPage: false,
              },
            )
          }
        />
      </AdminContentPanel>

      <AdminDrawer
        open={drawerOpen}
        title='Submission Detail'
        description='Review submitted code and automated grading result.'
        size='xl'
        onOpenChange={setDrawerOpen}
      >
        <div className='flex min-h-0 flex-1 flex-col overflow-y-auto p-5 md:p-6'>
          {isFetchingDetail ? (
            <div className='flex flex-col gap-y-4'>
              <Skeleton className='h-28 rounded-2xl' />
              <Skeleton className='h-72 rounded-2xl' />
              <Skeleton className='h-52 rounded-2xl' />
            </div>
          ) : selectedSubmission ? (
            <div className='flex flex-col gap-y-6'>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='rounded-2xl border bg-muted/30 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Student
                  </p>

                  <p className='pt-1 font-semibold'>
                    {selectedSubmission.user?.name ??
                      `User #${selectedSubmission.userId}`}
                  </p>

                  <p className='text-sm text-muted-foreground'>
                    {selectedSubmission.user?.email ?? 'No email data'}
                  </p>
                </div>

                <div className='rounded-2xl border bg-muted/30 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Study Case
                  </p>

                  <p className='pt-1 font-semibold'>
                    {selectedSubmission.studyCase?.title ??
                      `Study Case #${selectedSubmission.studyCaseId}`}
                  </p>

                  <p className='text-sm text-muted-foreground'>
                    {selectedSubmission.studyCase?.material?.title ?? '-'}
                  </p>
                </div>

                <div className='rounded-2xl border bg-muted/30 p-4'>
                  <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                    Status
                  </p>

                  <div className='pt-2'>
                    <StatusBadge status={selectedSubmission.status} />
                  </div>

                  <p className='pt-2 text-sm text-muted-foreground'>
                    {formatSubmissionDate(selectedSubmission.createdAt)}
                  </p>
                </div>
              </div>

              {selectedSubmission.errorMessage && (
                <div className='rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive'>
                  {selectedSubmission.errorMessage}
                </div>
              )}

              <div className='flex flex-col gap-y-3'>
                <div className='flex items-center gap-2'>
                  <Code2 className='size-4 text-muted-foreground' />
                  <h3 className='font-semibold'>Submitted Code</h3>
                </div>

                <pre className='max-h-95 overflow-auto rounded-2xl border bg-muted/40 p-4 text-sm leading-relaxed'>
                  <code>{selectedSubmission.code}</code>
                </pre>
              </div>

              <div className='flex flex-col gap-y-3'>
                <h3 className='font-semibold'>Test Results</h3>

                {selectedSubmission.testResults.length > 0 ? (
                  selectedSubmission.testResults.map((result, index) => (
                    <div
                      key={result.id}
                      className='rounded-2xl border bg-card p-4'
                    >
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex min-w-0 flex-col gap-y-1'>
                          <p className='font-semibold'>Test Case {index + 1}</p>

                          <p className='text-sm text-muted-foreground'>
                            {result.description}
                          </p>
                        </div>

                        <StatusBadge status={result.status} />
                      </div>

                      <div className='grid gap-3 pt-4 md:grid-cols-2'>
                        <div className='rounded-xl bg-muted/40 p-3'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                            Expected
                          </p>

                          <p className='wrap-break-word pt-1 text-sm'>
                            {formatOutput(result.expected)}
                          </p>
                        </div>

                        <div className='rounded-xl bg-muted/40 p-3'>
                          <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                            Received
                          </p>

                          <p className='wrap-break-word pt-1 text-sm'>
                            {formatOutput(result.received)}
                          </p>
                        </div>
                      </div>

                      {result.failureMessage && (
                        <div className='pt-3'>
                          <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-3 text-sm leading-relaxed text-destructive'>
                            {result.failureMessage}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className='rounded-2xl border border-dashed bg-muted/30 p-8 text-center'>
                    <p className='text-sm font-medium'>No test result found.</p>

                    <p className='text-sm text-muted-foreground'>
                      This submission may still be pending or the backend does
                      not include test results in this response.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-y-3 rounded-2xl border border-dashed bg-muted/30 p-8 text-center'>
              <SearchX className='size-8 text-muted-foreground' />
              <p className='font-semibold'>No submission selected</p>
            </div>
          )}
        </div>

        <DrawerFooter className='shrink-0 border-t bg-background'>
          <DrawerClose asChild>
            <Button
              type='button'
              variant='outline'
            >
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </AdminDrawer>
    </div>
  );
}
