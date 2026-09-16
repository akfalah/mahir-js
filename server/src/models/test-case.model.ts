import { Prisma, TestCase } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './pagination.model';

export type TestCaseSortBy =
  | 'id'
  | 'exerciseId'
  | 'order'
  | 'isPublished'
  | 'createdAt';

export type TestCasePaginationRequest = PaginationRequest<TestCaseSortBy> & {
  exerciseId?: number;
  isPublished?: boolean;
};

export type CreateTestCaseRequest = {
  exerciseId: number;
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
  exercise: {
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
          module: {
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

export type TestCaseModuleResponse = {
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
  module: TestCaseModuleResponse;
};

export type TestCaseExerciseResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
  material: TestCaseMaterialResponse;
};

export type TestCaseResponse = {
  id: number;
  exerciseId: number;
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  exercise?: TestCaseExerciseResponse;
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
    exerciseId: testCase.exerciseId,
    description: testCase.description,
    input: testCase.input as Record<string, unknown>,
    expected: testCase.expected as Record<string, unknown>,
    order: testCase.order,
    isPublished: testCase.isPublished,
    createdAt: testCase.createdAt,
    updatedAt: testCase.updatedAt,
  };

  if ('exercise' in testCase) {
    response.exercise = testCase.exercise;
  }

  return response;
}
