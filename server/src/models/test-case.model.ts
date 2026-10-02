import { TestCase } from '../../generated/prisma/client';
import { ExerciseRefResponse } from './exercise.model';

import { PaginationRequest, PaginationResponse } from './pagination.model';

export type TestCaseSummarySource = Pick<
  TestCase,
  'id' | 'exerciseId' | 'description' | 'order' | 'isPublished'
>;

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

export type TestCaseInput = {
  id: number;
  description: string;
  input: Record<string, unknown>;
  expected: Record<string, unknown>;
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
  exercise?: ExerciseRefResponse;
};

export type TestCaseSummaryResponse = {
  id: number;
  exerciseId: number;
  description: string;
  order: number;
  isPublished?: boolean;
};

export type TestCasePaginationResponse = PaginationResponse<TestCaseResponse>;

export function toTestCaseResponse(
  testCase: TestCase,
  exercise?: ExerciseRefResponse,
): TestCaseResponse {
  return {
    id: testCase.id,
    exerciseId: testCase.exerciseId,
    description: testCase.description,
    input: testCase.input as Record<string, unknown>,
    expected: testCase.expected as Record<string, unknown>,
    order: testCase.order,
    isPublished: testCase.isPublished,
    createdAt: testCase.createdAt,
    updatedAt: testCase.updatedAt,
    ...(exercise && { exercise }),
  };
}

export function toTestCaseSummaryResponse(
  testCase: TestCaseSummarySource,
  includeIsPublished: boolean,
): TestCaseSummaryResponse {
  return {
    id: testCase.id,
    exerciseId: testCase.exerciseId,
    description: testCase.description,
    order: testCase.order,
    ...(includeIsPublished && { isPublished: testCase.isPublished }),
  };
}
