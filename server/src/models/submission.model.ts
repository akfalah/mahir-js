import { Submission } from '../../generated/prisma/client';
import {
  SubmissionStatus,
  TestResultStatus,
} from '../../generated/prisma/enums';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type SubmissionSortBy =
  | 'id'
  | 'userId'
  | 'studyCaseId'
  | 'status'
  | 'createdAt';

export type SubmissionPaginationRequest =
  PaginationRequest<SubmissionSortBy> & {
    userId?: number;
    studyCaseId?: number;
    status?: SubmissionStatus;
  };

export type CreateSubmissionRequest = {
  studyCaseId: number;
  code: string;
};

export type SubmissionResponse = {
  id: number;
  userId: number;
  studyCaseId: number;
  code: string;
  status: SubmissionStatus;
  errorMessage: string | null;
  createdAt: Date;
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

export function toSubmissionResponse(submission: Submission) {
  return {
    id: submission.id,
    userId: submission.userId,
    studyCaseId: submission.studyCaseId,
    code: submission.code,
    status: submission.status,
    errorMessage: submission.errorMessage,
    createdAt: submission.createdAt,
  };
}
