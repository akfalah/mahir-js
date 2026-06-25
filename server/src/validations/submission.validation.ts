import z, { ZodType } from 'zod';

import { PaginationValidation } from './pagination.validation';

import {
  CreateSubmissionRequest,
  SubmissionPaginationRequest,
  SubmissionSortBy,
} from '../models/submission.model';
import { SubmissionStatus } from '../../generated/prisma/enums';

export class SubmissionValidation {
  static readonly GET: ZodType<SubmissionPaginationRequest> = z.object({
    ...PaginationValidation.BaseSchema,
    sortBy: z
      .enum([
        'id',
        'status',
        'createdAt',
      ] as const satisfies readonly SubmissionSortBy[])
      .default('createdAt'),
    orderBy: z.enum(['asc', 'desc']).default('desc'),
    userId: z.coerce.number().min(1).optional(),
    studyCaseId: z.coerce.number().min(1).optional(),
    status: z.enum(SubmissionStatus).optional(),
  });

  static readonly CREATE: ZodType<CreateSubmissionRequest> = z.object({
    studyCaseId: z.number().min(1),
    code: z.string().min(1),
  });
}
