import z, { ZodType } from 'zod';

import { Role } from '../../generated/prisma/enums';

import { CreateUserRequest, UpdateUserRequest } from '../models/user.model';

export class UserValidation {
  static readonly CREATE: ZodType<CreateUserRequest> = z.object({
    email: z.email(),
    name: z.string().min(3),
    role: z.enum(Role).default(Role.STUDENT),
    password: z.string().min(8),
  });

  static readonly UPDATE: ZodType<UpdateUserRequest> = z.object({
    email: z.email().optional(),
    name: z.string().min(3).optional(),
    role: z.enum(Role).optional(),
    password: z.string().min(8).optional(),
  });
}
