import z, { ZodType } from 'zod';

import {
  CreateConceptRequest,
  UpdateConceptRequest,
} from '../models/concept.model';

export class ConceptValidation {
  static readonly CREATE: ZodType<CreateConceptRequest> = z.object({
    slug: z.string().min(3),
    title: z.string().min(3),
    description: z.string().min(12),
    order: z.int().min(1),
  });

  static readonly UPDATE: ZodType<UpdateConceptRequest> = z.object({
    slug: z.string().min(3).optional(),
    title: z.string().min(3).optional(),
    description: z.string().min(12).optional(),
    order: z.int().min(1).optional(),
  });
}
