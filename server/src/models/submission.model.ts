import { Prisma, Submission } from '../../generated/prisma/client';
import {
  SubmissionStatus,
  TestResultStatus,
} from '../../generated/prisma/enums';

import { PaginationRequest, PaginationResponse } from './paginations.model';
import { TestResultResponse, toTestResultResponse } from './test-result.model';

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

export const submissionRelationInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  studyCase: {
    select: {
      id: true,
      title: true,
      material: {
        select: {
          id: true,
          title: true,
          concept: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.SubmissionInclude;

export const submissionDetailInclude = {
  ...submissionRelationInclude,
  testResults: {
    orderBy: {
      id: 'asc' as const,
    },
  },
} satisfies Prisma.SubmissionInclude;

export type SubmissionWithRelations = Prisma.SubmissionGetPayload<{
  include: typeof submissionRelationInclude;
}>;

export type SubmissionDetailWithRelations = Prisma.SubmissionGetPayload<{
  include: typeof submissionDetailInclude;
}>;

export type SubmissionUserResponse = {
  id: number;
  name: string;
  email: string;
};

export type SubmissionConceptResponse = {
  id: number;
  title: string;
};

export type SubmissionMaterialResponse = {
  id: number;
  title: string;
  concept: SubmissionConceptResponse;
};

export type SubmissionStudyCaseResponse = {
  id: number;
  title: string;
  material: SubmissionMaterialResponse;
};

export type SubmissionResponse = {
  id: number;
  userId: number;
  studyCaseId: number;
  code: string;
  status: SubmissionStatus;
  errorMessage: string | null;
  createdAt: Date;
  user?: SubmissionUserResponse;
  studyCase?: SubmissionStudyCaseResponse;
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
  submission: Submission | SubmissionWithRelations,
): SubmissionResponse {
  const response: SubmissionResponse = {
    id: submission.id,
    userId: submission.userId,
    studyCaseId: submission.studyCaseId,
    code: submission.code,
    status: submission.status,
    errorMessage: submission.errorMessage,
    createdAt: submission.createdAt,
  };

  if ('user' in submission) {
    response.user = submission.user;
  }

  if ('studyCase' in submission) {
    response.studyCase = submission.studyCase;
  }

  return response;
}

export function toSubmissionDetailResponse(
  submission: SubmissionDetailWithRelations,
): SubmissionDetailResponse {
  return {
    ...toSubmissionResponse(submission),
    testResults: submission.testResults.map(toTestResultResponse),
  };
}
