import { Prisma, TestCase } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type TestCaseSortBy =
  | 'id'
  | 'studyCaseId'
  | 'order'
  | 'isPublished'
  | 'createdAt';

export type TestCasePaginationRequest = PaginationRequest<TestCaseSortBy> & {
  studyCaseId?: number;
  isPublished?: boolean;
};

export type CreateTestCaseRequest = {
  studyCaseId: number;
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
  order: number;
  isPublished?: boolean;
};

export type UpdateTestCaseRequest = {
  description?: string;
  input?: Record<string, unknown>;
  expected?: Record<string, unknown>;
  order?: number;
  isPublished?: boolean;
};

export const testCaseRelationInclude = {
  studyCase: {
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
      material: {
        select: {
          id: true,
          slug: true,
          title: true,
          isPublished: true,
          concept: {
            select: {
              id: true,
              slug: true,
              title: true,
              isPublished: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.TestCaseInclude;

export type TestCaseWithRelations = Prisma.TestCaseGetPayload<{
  include: typeof testCaseRelationInclude;
}>;

export type TestCaseConceptResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
};

export type TestCaseMaterialResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
  concept: TestCaseConceptResponse;
};

export type TestCaseStudyCaseResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
  material: TestCaseMaterialResponse;
};

export type TestCaseResponse = {
  id: number;
  studyCaseId: number;
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  studyCase?: TestCaseStudyCaseResponse;
};

export type TestCaseInput = {
  id: number;
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
};

export type TestCasePaginationResponse = PaginationResponse<TestCaseResponse>;

export function toTestCaseResponse(
  testCase: TestCase | TestCaseWithRelations,
): TestCaseResponse {
  const response: TestCaseResponse = {
    id: testCase.id,
    studyCaseId: testCase.studyCaseId,
    description: testCase.description,
    input: testCase.input as Record<string, unknown>,
    expected: testCase.expected as Record<string, unknown>,
    order: testCase.order,
    isPublished: testCase.isPublished,
    createdAt: testCase.createdAt,
    updatedAt: testCase.updatedAt,
  };

  if ('studyCase' in testCase) {
    response.studyCase = testCase.studyCase;
  }

  return response;
}
