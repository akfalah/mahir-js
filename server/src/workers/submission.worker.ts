import vm from 'vm';

import {
  SubmissionStatus,
  TestResultStatus,
} from '../../generated/prisma/enums';

import { prisma } from '../applications/database';

import { ProgressService } from '../services/progress.service';

export async function executeSubmission(submissionId: number) {
  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: SubmissionStatus.RUNNING },
  });

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      studyCase: {
        include: {
          testCases: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!submission) return;

  const { code, studyCase } = submission;
  const { testCases, functionName, parameterNames } = studyCase;

  try {
    const testResults = [];
    let allPassed = true;

    for (const testCase of testCases) {
      try {
        const sandbox: Record<string, unknown> = {};

        vm.createContext(sandbox);
        vm.runInContext(code, sandbox, { timeout: 3000 });

        const fn = sandbox[functionName ?? ''] as
          | ((...args: unknown[]) => unknown)
          | undefined;

        if (typeof fn !== 'function') {
          throw new Error(`Function "${functionName}" not found`);
        }

        const input = testCase.input as Record<string, unknown>;
        const args = ((parameterNames as string[]) ?? []).map(
          (param) => input[param],
        );
        const received = fn(...args);
        const expected = (testCase.expected as Record<string, unknown>).result;
        const passed = JSON.stringify(received) === JSON.stringify(expected);

        if (!passed) allPassed = false;

        testResults.push({
          submissionId,
          testCaseId: testCase.id,
          description: testCase.description,
          status: passed ? TestResultStatus.PASSED : TestResultStatus.FAILED,
          expected: JSON.stringify(expected),
          received: JSON.stringify(received),
        });
      } catch (e) {
        allPassed = false;
        testResults.push({
          submissionId,
          testCaseId: testCase.id,
          description: testCase.description,
          status: TestResultStatus.ERROR,
          expected: JSON.stringify(
            (testCase.expected as Record<string, unknown>).result,
          ),
          received: null,
        });
      }
    }

    await prisma.testResult.createMany({ data: testResults });

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: allPassed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED,
      },
    });

    if (allPassed) {
      await ProgressService.updateOnSubmissionPassed(
        submission.userId,
        submission.studyCaseId,
      );
    }
  } catch (e) {
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.ERROR,
        errorMessage: e instanceof Error ? e.message : 'Unknown error',
      },
    });
  }
}
