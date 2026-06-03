import z, { ZodType } from 'zod';

import { PaginationValidation } from './pagination.validation';

import {
  CreateTestCaseRequest,
  TestCasePaginationRequest,
  TestCaseSortBy,
  UpdateTestCaseRequest,
} from '../models/test-case.model';

export class TestCaseValidation {
  static readonly GET: ZodType<TestCasePaginationRequest> = z.object({
    ...PaginationValidation.BaseSchema,
    sortBy: z
      .enum([
        'id',
        'studyCaseId',
        'isPublished',
        'order',
        'createdAt',
      ] as const satisfies readonly TestCaseSortBy[])
      .default('id'),
    orderBy: z.enum(['asc', 'desc']).default('asc'),
    studyCaseId: z.coerce.number().min(1).optional(),
    isPublished: z.boolean().optional(),
  });

  static readonly CREATE: ZodType<CreateTestCaseRequest> = z.object({
    studyCaseId: z.number().min(1),
    description: z.string().min(3),
    input: z.record(
      z.string(),
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.union([z.string(), z.number(), z.boolean()])),
      ]),
    ),
    expected: z.record(
      z.string(),
      z.union([
        z.string(),
        z.number(),
        z.boolean(),
        z.array(z.union([z.string(), z.number(), z.boolean()])),
      ]),
    ),
    order: z.number().min(1),
    isPublished: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType<UpdateTestCaseRequest> = z.object({
    description: z.string().min(3).optional(),
    input: z
      .record(
        z.string(),
        z.union([
          z.string(),
          z.number(),
          z.boolean(),
          z.array(z.union([z.string(), z.number(), z.boolean()])),
        ]),
      )
      .optional(),
    expected: z
      .record(
        z.string(),
        z.union([
          z.string(),
          z.number(),
          z.boolean(),
          z.array(z.union([z.string(), z.number(), z.boolean()])),
        ]),
      )
      .optional(),
    order: z.number().min(1).optional(),
    isPublished: z.boolean().optional(),
  });
}
