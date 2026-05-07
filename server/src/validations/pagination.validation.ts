import z, { ZodType } from 'zod';
import { PaginationRequest } from '../models/paginations.model';

export const PaginationValidation: ZodType<PaginationRequest> = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
});
