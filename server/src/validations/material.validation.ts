import z, { ZodType } from 'zod';

import { PaginationValidation } from './pagination.validation';

import {
  CreateMaterialRequest,
  MaterialPaginationRequest,
  MaterialSortBy,
  UpdateMaterialRequest,
} from '../models/material.model';

export class MaterialValidation {
  static readonly GET: ZodType<MaterialPaginationRequest> = z.object({
    ...PaginationValidation.BaseSchema,
    sortBy: z
      .enum([
        'id',
        'conceptId',
        'title',
        'order',
        'createdAt',
      ] as const satisfies readonly MaterialSortBy[])
      .default('id'),
    orderBy: z.enum(['asc', 'desc']).default('asc'),
    conceptId: z.coerce.number().min(1).optional(),
  });

  static readonly CREATE: ZodType<CreateMaterialRequest> = z.object({
    conceptId: z.number().min(1),
    slug: z.string().min(3),
    title: z.string().min(3),
    content: z.string().min(3),
    order: z.number().min(1),
  });

  static readonly UPDATE: ZodType<UpdateMaterialRequest> = z.object({
    slug: z.string().min(3).optional(),
    title: z.string().min(3).optional(),
    content: z.string().min(3).optional(),
    order: z.number().min(1).optional(),
  });
}
