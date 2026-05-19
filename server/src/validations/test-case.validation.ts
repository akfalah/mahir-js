import z, { ZodType } from 'zod';

import {
  CreateTestCaseRequest,
  UpdateTestCaseRequest,
} from '../models/test-case.model';

export class TestCaseValidation {
  static readonly CREATE: ZodType<CreateTestCaseRequest> = z.object({
    studyCaseId: z.number().positive(),
    description: z.string().min(12),
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
    order: z.number().int().min(1),
    isPublished: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType<UpdateTestCaseRequest> = z.object({
    studyCaseId: z.number().positive().optional(),
    description: z.string().min(12).optional(),
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
    order: z.number().int().min(1).optional(),
    isPublished: z.boolean().optional(),
  });
}
