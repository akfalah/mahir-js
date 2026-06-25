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
      .default('createdAt'),
    orderBy: z.enum(['asc', 'desc']).default('desc'),
    materialId: z.coerce.number().min(1).optional(),
    isPublished: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
  });

  static readonly CREATE: ZodType<CreateStudyCaseRequest> = z.object({
    materialId: z.number().min(1),
    slug: z.string().min(3),
    title: z.string().min(3),
    description: z.string().min(3),
    hint: z.string().trim().min(1).optional(),
    order: z.number().min(1),
    starterCode: z.string().min(1),
    syntaxRules: z.object({
      required: z.array(z.string()).optional(),
      forbidden: z.array(z.string()).optional(),
    }),
    parameterNames: z.array(z.string()).optional(),
    functionName: z.string().min(1).optional(),
    isPublished: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType<UpdateStudyCaseRequest> = z.object({
    slug: z.string().min(3).optional(),
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    hint: z.string().trim().min(1).optional(),
    order: z.number().min(1).optional(),
    starterCode: z.string().min(1).optional(),
    syntaxRules: z
      .object({
        required: z.array(z.string()).optional(),
        forbidden: z.array(z.string()).optional(),
      })
      .optional(),
    parameterNames: z.array(z.string()).optional(),
    functionName: z.string().min(1).optional(),
    isPublished: z.boolean().optional(),
  });
}
