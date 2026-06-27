import z, { ZodType } from 'zod';

import {
  SignInRequest,
  SignUpRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
} from '../models/auth.model';

export class AuthValidation {
  static readonly SIGN_UP: ZodType<SignUpRequest> = z.object({
    email: z.email(),
    name: z.string().min(3),
    password: z.string().min(8),
  });

  static readonly SIGN_IN: ZodType<SignInRequest> = z.object({
    email: z.email(),
    password: z.string().min(8),
  });

  static readonly UPDATE_PROFILE: ZodType<UpdateProfileRequest> = z.object({
    email: z.email().optional(),
    name: z.string().min(3).optional(),
    imageUrl: z.string().max(300).optional(),
    bio: z.string().max(300).optional(),
  });

  static readonly UPDATE_PASSWORD: ZodType<UpdatePasswordRequest> = z.object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
  });
}
