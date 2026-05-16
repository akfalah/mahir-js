import z, { ZodType } from 'zod';

import {
  CreateStudyCaseRequest,
  UpdateStudyCaseRequest,
} from '../models/study-case.model';

export class StudyCaseValidation {
  static readonly CREATE: ZodType<CreateStudyCaseRequest> = z.object({
    materialId: z.number().positive(),
    title: z.string().min(3),
    description: z.string().min(12),
    starterCode: z.string().min(1),
    order: z.number().int().min(1),
    parameterNames: z.array(z.string()).optional(),
    functionName: z.string().min(1).optional(),
  });

  static readonly UPDATE: ZodType<UpdateStudyCaseRequest> = z.object({
    materialId: z.number().positive().optional(),
    title: z.string().min(3).optional(),
    description: z.string().min(12).optional(),
    starterCode: z.string().min(1).optional(),
    order: z.number().int().min(1).optional(),
    parameterNames: z.array(z.string()).optional(),
    functionName: z.string().min(1).optional(),
  });
}
