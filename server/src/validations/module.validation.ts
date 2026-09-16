import z, { ZodType } from 'zod';

import { PaginationValidation } from './pagination.validation';

import {
  ModulePaginationRequest,
  ModuleSortBy,
  CreateModuleRequest,
  UpdateModuleRequest,
} from '../models/module.model';

export class ModuleValidation {
  static readonly GET: ZodType<ModulePaginationRequest> = z.object({
    ...PaginationValidation.BaseSchema,
    sortBy: z
      .enum([
        'id',
        'slug',
        'title',
        'order',
        'createdAt',
      ] as const satisfies readonly ModuleSortBy[])
      .default('createdAt'),
    orderBy: z.enum(['asc', 'desc']).default('desc'),
    isPublished: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
  });

  static readonly CREATE: ZodType<CreateModuleRequest> = z.object({
    slug: z.string().min(3),
    title: z.string().min(3),
    description: z.string().min(3),
    order: z.number().min(1),
    isPublished: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType<UpdateModuleRequest> = z.object({
    slug: z.string().min(3).optional(),
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    order: z.number().min(1).optional(),
    isPublished: z.boolean().optional(),
  });
}
