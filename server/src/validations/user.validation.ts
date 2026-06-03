import z, { ZodType } from 'zod';

import { Role } from '../../generated/prisma/enums';

import { PaginationValidation } from './pagination.validation';

import {
  CreateUserRequest,
  UpdateUserRequest,
  UserPaginationRequest,
  UserSortBy,
} from '../models/user.model';

export class UserValidation {
  static readonly GET: ZodType<UserPaginationRequest> = z.object({
    ...PaginationValidation.BaseSchema,
    sortBy: z
      .enum([
        'id',
        'name',
        'email',
        'role',
        'createdAt',
      ] as const satisfies readonly UserSortBy[])
      .default('createdAt'),
    orderBy: z.enum(['asc', 'desc']).default('desc'),
    role: z.enum(Role).optional(),
  });

  static readonly CREATE: ZodType<CreateUserRequest> = z.object({
    email: z.email(),
    name: z.string().min(3),
    role: z.enum(Role).default(Role.STUDENT),
    password: z.string().min(8),
    imageUrl: z.string().min(3).optional(),
    bio: z.string().max(300).optional(),
  });

  static readonly UPDATE: ZodType<UpdateUserRequest> = z.object({
    email: z.email().optional(),
    name: z.string().min(3).optional(),
    role: z.enum(Role).optional(),
    password: z.string().min(8).optional(),
    imageUrl: z.string().min(3).optional(),
    bio: z.string().max(300).optional(),
  });
}
