import z, { ZodType } from 'zod';

import { PaginationValidation } from './pagination.validation';

import {
  CreateStudyCaseRequest,
  StudyCaeSortBy,
  StudyCasePaginationRequest,
  UpdateStudyCaseRequest,
} from '../models/study-case.model';

export class StudyCaseValidation {
  static readonly GET: ZodType<StudyCasePaginationRequest> = z.object({
    ...PaginationValidation.BaseSchema,
    sortBy: z
      .enum([
        'id',
        'materialId',
        'title',
        'order',
        'createdAt',
      ] as const satisfies readonly StudyCaeSortBy[])
      .default('id'),
    orderBy: z.enum(['asc', 'desc']).default('asc'),
    materialId: z.coerce.number().min(1).optional(),
  });

  static readonly CREATE: ZodType<CreateStudyCaseRequest> = z.object({
    materialId: z.number().min(1),
    title: z.string().min(3),
    description: z.string().min(3),
    starterCode: z.string().min(1),
    order: z.number().min(1),
    syntaxRules: z
      .object({
        required: z.array(z.string()).optional(),
        forbidden: z.array(z.string()).optional(),
      })
      .optional(),
    parameterNames: z.array(z.string()).optional(),
    functionName: z.string().min(1).optional(),
  });

  static readonly UPDATE: ZodType<UpdateStudyCaseRequest> = z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    starterCode: z.string().min(1).optional(),
    order: z.number().min(1).optional(),
    syntaxRules: z
      .object({
        required: z.array(z.string()).optional(),
        forbidden: z.array(z.string()).optional(),
      })
      .optional(),
    parameterNames: z.array(z.string()).optional(),
    functionName: z.string().min(1).optional(),
  });
}
