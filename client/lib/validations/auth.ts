import { z } from 'zod';

export const signInSchema = z.object({
  email: z.email('Email must be valid.'),

  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const signUpSchema = z
  .object({
    email: z.string().trim().email('Email must be valid.'),

    name: z.string().trim().min(3, 'Name must be at least 3 characters.'),

    password: z.string().min(8, 'Password must be at least 8 characters.'),

    confirmPassword: z.string().min(8, 'Please confirm your password.'),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Password confirmation does not match.',
    path: ['confirmPassword'],
  });
