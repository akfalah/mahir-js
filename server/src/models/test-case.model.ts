import { TestCase } from '../../generated/prisma/client';

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
  input: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
  expected: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
  order: number;
  isPublished?: boolean;
};

export type UpdateTestCaseRequest = {
  description?: string;
  input?: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
  expected?: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
  order?: number;
  isPublished?: boolean;
};

export type TestCaseResponse = {
  id: number;
  studyCaseId: number;
  description: string;
  input: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
  expected: Record<
    string,
    string | number | boolean | (string | number | boolean)[]
  >;
  order: number;
  isPublished: boolean;
  createdAt: Date;
};

export type TestCasePaginationResponse = PaginationResponse<TestCaseResponse>;

export function toTestCaseResponse(testCase: TestCase) {
  return {
    id: testCase.id,
    studyCaseId: testCase.studyCaseId,
    description: testCase.description,
    input: testCase.input as Record<
      string,
      string | number | boolean | (string | number | boolean)[]
    >,
    expected: testCase.expected as Record<
      string,
      string | number | boolean | (string | number | boolean)[]
    >,
    order: testCase.order,
    isPublished: testCase.isPublished,
    createdAt: testCase.createdAt,
  };
}
