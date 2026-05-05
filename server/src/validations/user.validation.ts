import z, { ZodType } from 'zod';

import { Role } from '../../generated/prisma/enums';

import { CreateRequest, GetRequest, UpdateRequest } from '../models/user.model';

export class UserValidation {
  static readonly GET: ZodType<GetRequest> = z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(10),
    search: z.string().optional(),
  });

  static readonly CREATE: ZodType<CreateRequest> = z.object({
    email: z.email(),
    name: z.string().min(3),
    role: z.enum(Role).default(Role.STUDENT),
    password: z.string().min(8),
  });

  static readonly UPDATE: ZodType<UpdateRequest> = z.object({
    email: z.email().optional(),
    name: z.string().min(3).optional(),
    role: z.enum(Role).optional(),
    password: z.string().min(8).optional(),
  });
}
