'use client';

import { useState } from 'react';
import Link from 'next/link';
import Editor from '@monaco-editor/react';

import { StudyCase, Submission, SubmissionDetail } from '@/types';

import api from '@/lib/api';

import { useAuthStore } from '@/stores/auth.store';

import { Button } from '@/components/ui/button';

import { Check, Lock, RotateCcw, X } from 'lucide-react';

export default function StudyCaseEditor({
  studyCase,
}: {
  studyCase: StudyCase;
}) {
  const { user } = useAuthStore();
  const [code, setCode] = useState(studyCase.starterCode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    setSubmission(null);

    try {
      const res = await api.post<{ data: Submission }>('/submissions', {
        studyCaseId: studyCase.id,
        code,
      });

      const submissionId = res.data.data.id;

      const poll = async (): Promise<SubmissionDetail> => {
        const detail = await api.get<{ data: SubmissionDetail }>(
          `/submissions/${submissionId}`,
        );
        const status = detail.data.data.status;

        if (status === 'PENDING' || status === 'RUNNING') {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          return poll();
        }
        return detail.data.data;
      };

      const result = await poll();

      setSubmission(result);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response: { data: { errors: string } } };
        
        setError(axiosError.response.data.errors);
      } else {
        setError('Something went wrong, please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCode(studyCase.starterCode);
    setSubmission(null);
    setError(null);
  };

  const allPassed =
    submission && submission.testResults.every((r) => r.status === 'PASSED');

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
      {/* Left: Test Cases */}
      <div className='lg:col-span-1 space-y-4'>
        <div className='border border-border rounded-xl overflow-hidden'>
          <div className='px-4 py-3 border-b border-border bg-muted/30'>
            <h3 className='font-semibold text-sm'>Test Cases</h3>
          </div>

          <div className='p-4 space-y-3'>
            {submission ? (
              submission.testResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-3 rounded-lg border text-sm space-y-1 ${
                    result.status === 'PASSED'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className='flex items-center gap-2'>
                    {result.status === 'PASSED' ? (
                      <Check className='h-4 w-4 text-green-600 shrink-0' />
                    ) : (
                      <X className='h-4 w-4 text-red-600 shrink-0' />
                    )}
                    <p className='font-medium text-foreground'>
                      {result.description}
                    </p>
                  </div>

                  {result.failureMessage && (
                    <pre className='text-xs text-red-600 bg-red-50 p-2 rounded overflow-x-auto'>
                      {result.failureMessage}
                    </pre>
                  )}
                </div>
              ))
            ) : (
              <p className='text-sm text-muted-foreground text-center py-6'>
                Submit your code to see test results.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right: Editor */}
      <div className='lg:col-span-2 space-y-3'>
        <div className='border border-border rounded-xl overflow-hidden'>

          {/* Editor toolbar */}
          <div className='flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30'>
            <span className='text-sm font-medium'>Code Editor</span>

            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                className='gap-1 text-xs'
                onClick={handleReset}
              >
                <RotateCcw className='h-3 w-3' />
                Reset
              </Button>
              {user ? (
                <Button
                  size='sm'
                  className='text-xs'
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Running...' : 'Run Tests'}
                </Button>
              ) : (
                <Button
                  size='sm'
                  disabled
                  className='gap-1 text-xs'
                >
                  <Lock className='h-3 w-3' />
                  Submit
                </Button>
              )}
            </div>
          </div>

          {/* Monaco Editor */}
          <Editor
            height='420px'
            language='javascript'
            value={code}
            onChange={(value) => setCode(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: 'on',
              wordWrap: 'on',
            }}
          />

          {/* Result summary */}
          {(submission || error) && (
            <div className='border-t border-border px-4 py-3 bg-muted/30'>
              {error && <p className='text-sm text-destructive'>{error}</p>}

              {submission && (
                <div
                  className={`flex items-center gap-2 text-sm font-medium ${
                    allPassed ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {allPassed ? (
                    <>
                      <Check className='h-4 w-4' />
                      All tests passed! Great work!
                    </>
                  ) : (
                    <>
                      <X className='h-4 w-4' />
                      {
                        submission.testResults.filter(
                          (r) => r.status === 'PASSED',
                        ).length
                      }{' '}
                      of {submission.testResults.length} tests passed. Keep
                      trying!
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Not logged in message */}
        {!user && (
          <p className='text-sm text-muted-foreground'>
            <Link
              href='/sign-in'
              className='text-primary hover:underline'
            >
              Sign in
            </Link>{' '}
            or{' '}
            <Link
              href='/sign-up'
              className='text-primary hover:underline'
            >
              create an account
            </Link>{' '}
            to submit your solution and track your progress.
          </p>
        )}
      </div>
    </div>
  );
}
