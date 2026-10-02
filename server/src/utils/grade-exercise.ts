import { Exercise, TestCase } from '../../generated/prisma/client';
import {
  SubmissionStatus,
  TestResultStatus,
} from '../../generated/prisma/enums';

import { TestCaseInput } from '../models/test-case.model';
import { ExecutionResult } from '../models/test-result.model';

import { runSubmissionCode } from '../workers/submission.worker';

export async function gradeSubmissionCode(
  code: string,
  exercise: Exercise,
  testCases: TestCase[],
): Promise<{ status: SubmissionStatus; results: ExecutionResult[] }> {
  const testCaseInputs: TestCaseInput[] = testCases.map((testCase) => ({
    id: testCase.id,
    description: testCase.description,
    input: testCase.input as Record<string, unknown>,
    expected: testCase.expected as Record<string, unknown>,
  }));

  const results = await runSubmissionCode(
    code,
    exercise.functionName ?? '',
    (exercise.parameterNames as string[]) ?? [],
    testCaseInputs,
    exercise.syntaxRules as Record<string, string[]>,
  );

  const allPassed = results.every(
    (result) => result.status === TestResultStatus.PASSED,
  );
  const hasError = results.some(
    (result) => result.status === TestResultStatus.ERROR,
  );

  const status = allPassed
    ? SubmissionStatus.PASSED
    : hasError
      ? SubmissionStatus.ERROR
      : SubmissionStatus.FAILED;

  return { status, results };
}
