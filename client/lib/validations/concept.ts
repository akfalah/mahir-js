import { z } from 'zod';

export const conceptSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters.'),
  slug: z
    .string()
    .trim()
    .min(3, 'Slug must be at least 3 characters.')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must use lowercase letters, numbers, and hyphens only.',
    ),
  description: z
    .string()
    .trim()
    .min(3, 'Description must be at least 3 characters.'),
  order: z.coerce
    .number()
    .int('Order must be an integer.')
    .min(1, 'Order must be at least 1.'),
  isPublished: z.boolean(),
});
