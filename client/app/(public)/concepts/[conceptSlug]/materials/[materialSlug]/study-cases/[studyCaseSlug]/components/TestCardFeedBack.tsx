import { Badge } from '@/components/ui/badge';

import { getTestCaseStatusStyle } from '../utils/study-case-editor';
import { DisplayedTestCase } from '../utils/types';

export default function TestCaseFeedbackCard({
  testCase,
  index,
}: {
  testCase: DisplayedTestCase;
  index: number;
}) {
  const statusStyle = getTestCaseStatusStyle(testCase.status);
  const Icon = statusStyle.icon;

  return (
    <div className={`rounded-2xl border p-4 ${statusStyle.className}`}>
      <div className='flex flex-col gap-y-4'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex items-start gap-3'>
            <Icon className='size-5 shrink-0' />

            <div className='flex flex-col gap-y-1'>
              <p className='text-sm font-semibold'>Checkpoint {index + 1}</p>

              <p className='text-sm leading-relaxed opacity-90'>
                {testCase.description}
              </p>
            </div>
          </div>

          <Badge
            variant='outline'
            className='shrink-0 bg-background/70'
          >
            {statusStyle.label}
          </Badge>
        </div>

        <div className='grid gap-3 rounded-xl bg-background/70 p-3 text-sm'>
          <div className='flex flex-col gap-y-1'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Input
            </p>

            <p className='rounded-lg bg-background p-2 font-medium'>
              {testCase.input}
            </p>
          </div>

          <div className='flex flex-col gap-y-1'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Expected
            </p>

            <p className='rounded-lg bg-background p-2 font-medium'>
              {testCase.expected}
            </p>
          </div>

          {testCase.status !== 'PENDING' && (
            <div className='flex flex-col gap-y-1'>
              <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                Received
              </p>

              <p className='rounded-lg bg-background p-2 font-medium'>
                {testCase.received ?? 'No output received'}
              </p>
            </div>
          )}

          {testCase.whatToCheck && (
            <div className='rounded-lg bg-muted/60 p-3'>
              <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                What to check
              </p>

              <p className='pt-1 leading-relaxed'>{testCase.whatToCheck}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
