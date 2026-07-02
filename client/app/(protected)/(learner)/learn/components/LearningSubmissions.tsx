'use client';

import { useState } from 'react';

import { ChevronDown, Clock3, Eye, FileCode2, Loader2 } from 'lucide-react';

import { fetchSubmissionById } from '@/lib/fetch';
import { formatSubmissionDate } from '@/lib/helpers/date-formatter';
import { getWhatToCheck } from '@/lib/helpers/submission-feedback';
import { cn } from '@/lib/utils';

import { useAuthStore } from '@/stores/use-auth-store';

import { PaginationMeta, Submission, SubmissionDetail } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PublicPagination from '@/components/shared/PublicPagination';
import PublicTestResultFeedbackCard from '@/components/shared/PublicTestResultFeedbackCard';

type Props = {
  submissions: Submission[];
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  onPageSizeChange: (limit: number) => void;
};

function getSubmissionStatusClassName(status: Submission['status']) {
  if (status === 'PASSED') {
    return 'border-green-200 bg-green-50 text-green-700';
  }

  if (status === 'FAILED') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (status === 'ERROR') {
    return 'border-orange-200 bg-orange-50 text-orange-700';
  }

  if (status === 'RUNNING') {
    return 'border-blue-200 bg-blue-50 text-blue-700';
  }

  return 'border-border bg-muted text-muted-foreground';
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Failed to load submission details.';
}

export default function LearningSubmissions({
  submissions,
  pagination,
  onPageChange,
  onPageSizeChange,
}: Props) {
  const { token } = useAuthStore();

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, SubmissionDetail>>({});
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<number, string>>({});

  const handleToggleDetail = async (submissionId: number) => {
    if (expandedId === submissionId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(submissionId);

    if (details[submissionId]) {
      return;
    }

    if (!token) {
      setErrors((prev) => ({
        ...prev,
        [submissionId]: 'Please sign in to view submission details.',
      }));
      return;
    }

    setLoadingId(submissionId);
    setErrors((prev) => ({
      ...prev,
      [submissionId]: '',
    }));

    try {
      const res = await fetchSubmissionById(submissionId, token);

      setDetails((prev) => ({
        ...prev,
        [submissionId]: res.data,
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        [submissionId]: getErrorMessage(error),
      }));
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <section className='flex flex-col gap-y-5'>
      <div className='flex flex-col gap-y-2'>
        <h2 className='text-2xl font-bold tracking-tight'>
          Submission History
        </h2>

        <p className='text-muted-foreground'>
          Review your latest coding attempts and automated grading results.
        </p>
      </div>

      {submissions.length > 0 ? (
        <div className='grid grid-cols-1 gap-4'>
          {submissions.map((submission) => {
            const detail = details[submission.id];
            const isExpanded = expandedId === submission.id;
            const isLoading = loadingId === submission.id;
            const errorMessage = errors[submission.id];

            return (
              <Card
                key={submission.id}
                className='rounded-3xl transition-colors hover:bg-muted/30'
              >
                <CardContent className='flex flex-col gap-y-5 p-5 md:p-6'>
                  <div className='flex flex-col gap-y-5 md:flex-row md:items-center md:justify-between'>
                    <div className='flex items-start gap-4'>
                      <div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                        <FileCode2 className='size-6' />
                      </div>

                      <div className='flex flex-col gap-y-3'>
                        <div className='flex flex-wrap gap-2'>
                          <Badge
                            variant='outline'
                            className={getSubmissionStatusClassName(
                              submission.status,
                            )}
                          >
                            {submission.status}
                          </Badge>

                          <Badge variant='secondary'>
                            Submission #{submission.id}
                          </Badge>
                        </div>

                        <div className='flex flex-col gap-y-1'>
                          <p className='font-semibold'>
                            {submission.studyCase?.title ??
                              `Study Case #${submission.studyCaseId}`}
                          </p>

                          {submission.studyCase && (
                            <p className='text-sm text-muted-foreground'>
                              {submission.studyCase.material.concept.title} /{' '}
                              {submission.studyCase.material.title}
                            </p>
                          )}

                          {submission.errorMessage && (
                            <p className='text-sm text-destructive'>
                              {submission.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-col gap-y-3 md:items-end'>
                      <div className='w-42 flex items-center justify-center gap-2 rounded-xl bg-muted/50 px-3 py-2 text-xs text-muted-foreground'>
                        <Clock3 className='size-4' />

                        <span>
                          {formatSubmissionDate(submission.createdAt)}
                        </span>
                      </div>

                      <Button
                        variant='outline'
                        size='sm'
                        className='w-fit gap-2'
                        onClick={() => handleToggleDetail(submission.id)}
                      >
                        {isLoading ? (
                          <Loader2 className='size-4 animate-spin' />
                        ) : (
                          <Eye className='size-4' />
                        )}

                        {isExpanded ? 'Hide details' : 'View details'}

                        <ChevronDown
                          className={cn(
                            'size-4 transition-transform',
                            isExpanded && 'rotate-180',
                          )}
                        />
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className='flex flex-col gap-y-5 border-t pt-5'>
                      {isLoading && (
                        <div className='flex items-center gap-3 rounded-2xl border bg-muted/40 p-4 text-sm text-muted-foreground'>
                          <Loader2 className='size-4 animate-spin' />
                          Loading submission details...
                        </div>
                      )}

                      {!isLoading && errorMessage && (
                        <div className='rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive'>
                          {errorMessage}
                        </div>
                      )}

                      {!isLoading && detail && (
                        <>
                          <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                            <div className='flex flex-col gap-y-2 rounded-2xl border bg-card p-4'>
                              <p className='text-sm text-muted-foreground'>
                                Status
                              </p>

                              <Badge
                                variant='outline'
                                className={cn(
                                  getSubmissionStatusClassName(detail.status),
                                )}
                              >
                                {detail.status}
                              </Badge>
                            </div>

                            <div className='rounded-2xl border bg-card p-4'>
                              <p className='text-sm text-muted-foreground'>
                                Test Results
                              </p>

                              <p className='text-xl font-bold'>
                                {
                                  detail.testResults.filter(
                                    (result) => result.status === 'PASSED',
                                  ).length
                                }{' '}
                                / {detail.testResults.length} Passed
                              </p>
                            </div>
                          </div>

                          <div className='flex flex-col gap-y-3'>
                            <div className='flex items-center justify-between gap-4'>
                              <h3 className='font-bold'>Submitted Code</h3>
                            </div>

                            <pre className='max-h-80 overflow-auto rounded-2xl border bg-muted/50 p-4 text-sm leading-relaxed'>
                              <code>{detail.code}</code>
                            </pre>
                          </div>

                          <div className='flex flex-col gap-y-3'>
                            <h3 className='font-bold'>Test Results</h3>

                            {detail.testResults.length > 0 ? (
                              <div className='grid grid-cols-1 gap-3'>
                                {detail.testResults.map((result, index) => (
                                  <PublicTestResultFeedbackCard
                                    key={result.id}
                                    index={index}
                                    showInput={false}
                                    testCase={{
                                      id: result.id,
                                      description: result.description,
                                      status: result.status,
                                      expected: result.expected,
                                      received: result.received,
                                      whatToCheck: getWhatToCheck({
                                        status: result.status,
                                        expected: result.expected,
                                        received: result.received,
                                        failureMessage: result.failureMessage,
                                      }),
                                    }}
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className='rounded-2xl border border-dashed p-5 text-center text-sm text-muted-foreground'>
                                No test results found for this submission.
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <PublicPagination
            pagination={pagination}
            itemLabel='submissions'
            pageSizeOptions={[5, 10, 20, 50]}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      ) : (
        <Card className='rounded-3xl border-dashed'>
          <CardContent className='flex flex-col items-center gap-y-4 p-8 text-center'>
            <div className='flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground'>
              <FileCode2 className='size-7' />
            </div>

            <div className='flex max-w-xl flex-col gap-y-2'>
              <h3 className='text-2xl font-bold tracking-tight'>
                No submissions yet.
              </h3>

              <p className='text-muted-foreground'>
                Your submissions will appear here after you solve a coding
                challenge.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
