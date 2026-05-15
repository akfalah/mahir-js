import z, { ZodType } from 'zod';

import {
  CreateMaterialRequest,
  UpdateMaterialRequest,
} from '../models/material.model';

export class MaterialValidation {
  static readonly CREATE: ZodType<CreateMaterialRequest> = z.object({
    conceptId: z.int().positive(),
    slug: z.string().min(3),
    title: z.string().min(3),
    content: z.string().min(12),
    order: z.int().min(1),
  });

  static readonly UPDATE: ZodType<UpdateMaterialRequest> = z.object({
    conceptId: z.int().positive().optional(),
    slug: z.string().min(3).optional(),
    title: z.string().min(3).optional(),
    content: z.string().min(12).optional(),
    order: z.int().min(1).optional(),
  });
}
