import z from 'zod';

export class PaginationValidation {
  static readonly BaseSchema = {
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
    sortBy: z.string().optional(),
    orderBy: z.enum(['asc', 'desc']).default('desc'),
  };
}
