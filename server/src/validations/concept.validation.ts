import z, { ZodType } from 'zod';

import { PaginationValidation } from './pagination.validation';

import {
  ConceptPaginationRequest,
  ConceptSortBy,
  CreateConceptRequest,
  UpdateConceptRequest,
} from '../models/concept.model';

export class ConceptValidation {
  static readonly GET: ZodType<ConceptPaginationRequest> = z.object({
    ...PaginationValidation.BaseSchema,
    sortBy: z
      .enum([
        'id',
        'slug',
        'title',
        'order',
        'createdAt',
      ] as const satisfies readonly ConceptSortBy[])
      .default('createdAt'),
    orderBy: z.enum(['asc', 'desc']).default('desc'),
    isPublished: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
  });

  static readonly CREATE: ZodType<CreateConceptRequest> = z.object({
    slug: z.string().min(3),
    title: z.string().min(3),
    description: z.string().min(3),
    order: z.number().min(1),
    isPublished: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType<UpdateConceptRequest> = z.object({
    slug: z.string().min(3).optional(),
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    order: z.number().min(1).optional(),
    isPublished: z.boolean().optional(),
  });
}
