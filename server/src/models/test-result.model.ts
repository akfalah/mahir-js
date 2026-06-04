import { TestResult } from '../../generated/prisma/client';
import { TestResultStatus } from '../../generated/prisma/enums';

export type ExecutionResult = {
  testCaseId: number;
  description: string;
  status: TestResultStatus;
  expected: string;
  received: string | null;
  failureMessage: string | null;
};

export type TestResultResponse = {
  id: number;
  submissionId: number;
  testCaseId: number;
  description: string;
  status: TestResultStatus;
  expected: string | null;
  received: string | null;
  failureMessage: string | null;
};

export function toTestResultResponse(
  testResult: TestResult,
): TestResultResponse {
  return {
    id: testResult.id,
    submissionId: testResult.submissionId,
    testCaseId: testResult.testCaseId,
    description: testResult.description,
    status: testResult.status,
    expected: testResult.expected,
    received: testResult.received,
    failureMessage: testResult.failureMessage,
  };
}
