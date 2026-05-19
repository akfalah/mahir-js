import { TestCase } from '../../generated/prisma/client';

import { PaginationResponse } from './paginations.model';

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
  studyCaseId?: number;
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
};

export type GetTestCaseResponse = PaginationResponse<TestCaseResponse>;

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
  };
}
