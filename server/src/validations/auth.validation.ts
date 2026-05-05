import z, { ZodType } from 'zod';

import {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from '../models/auth.model';

export class AuthValidation {
  static readonly REGISTER: ZodType<RegisterRequest> = z.object({
    email: z.email(),
    name: z.string().min(3),
    password: z.string().min(8),
  });

  static readonly LOGIN: ZodType<LoginRequest> = z.object({
    email: z.email(),
    password: z.string().min(8),
  });

  static readonly UPDATE_PROFILE: ZodType<UpdateProfileRequest> = z.object({
    email: z.email().optional(),
    name: z.string().min(3).optional(),
    password: z.string().min(8).optional(),
  });
}
