import { Submission, TestResult } from '../../generated/prisma/client';
import {
  SubmissionStatus,
  TestResultStatus,
} from '../../generated/prisma/enums';

import { PaginationRequest, PaginationResponse } from './pagination.model';
import { UserRefResponse } from './user.model';
import { ExerciseRefResponse } from './exercise.model';
import { TestResultResponse, toTestResultResponse } from './test-result.model';

export type SubmissionSortBy =
  | 'id'
  | 'userId'
  | 'exerciseId'
  | 'status'
  | 'createdAt';

export type SubmissionPaginationRequest =
  PaginationRequest<SubmissionSortBy> & {
    userId?: number;
    exerciseId?: number;
    status?: SubmissionStatus;
  };

export type CreateSubmissionRequest = {
  exerciseId: number;
  code: string;
};

export type SubmissionResponse = {
  id: number;
  userId: number;
  exerciseId: number;
  code: string;
  status: SubmissionStatus;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  exercise?: ExerciseRefResponse;
  user?: UserRefResponse;
};

export type SubmissionDetailResponse = SubmissionResponse & {
  testResults: TestResultResponse[];
};

export type RunSubmissionTestResultResponse = {
  testCaseId: number;
  description: string;
  status: TestResultStatus;
  expected: string;
  received: string | null;
  failureMessage: string | null;
};

export type RunSubmissionResponse = {
  status: SubmissionStatus;
  testResults: RunSubmissionTestResultResponse[];
  errorMessage: string | null;
};

export type SubmissionPaginationResponse =
  PaginationResponse<SubmissionResponse>;

export function toSubmissionResponse(
  submission: Submission,
  exercise?: ExerciseRefResponse,
  user?: UserRefResponse,
): SubmissionResponse {
  return {
    id: submission.id,
    userId: submission.userId,
    exerciseId: submission.exerciseId,
    code: submission.code,
    status: submission.status,
    errorMessage: submission.errorMessage,
    createdAt: submission.createdAt,
    updatedAt: submission.updatedAt,
    ...(exercise && { exercise }),
    ...(user && { user }),
  };
}

export function toSubmissionDetailResponse(
  submission: Submission & { testResults: TestResult[] },
  exercise?: ExerciseRefResponse,
): SubmissionDetailResponse {
  return {
    ...toSubmissionResponse(submission, exercise),
    testResults: submission.testResults.map(toTestResultResponse),
  };
}
