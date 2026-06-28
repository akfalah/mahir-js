import { z } from 'zod';

export const updateProfileSchema = z.object({
  email: z.email('Email must be valid.').optional(),
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters.')
    .optional(),
  imageUrl: z
    .string()
    .trim()
    .max(300, 'Bio must be less than 300 characters.')
    .optional(),
  bio: z
    .string()
    .trim()
    .max(300, 'Bio must be less than 300 characters.')
    .optional(),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, 'Current password must be at least 8 characters.'),

    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters.'),

    confirmNewPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters.'),
  })
  .refine((values) => values.newPassword === values.confirmNewPassword, {
    message: 'Password confirmation does not match.',
    path: ['confirmNewPassword'],
  });
