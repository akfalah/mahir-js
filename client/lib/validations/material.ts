import { z } from 'zod';

function getPlainTextFromHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export const materialSchema = z.object({
  conceptId: z.coerce
    .number()
    .int('Concept is required.')
    .min(1, 'Concept is required.'),
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
    .min(10, 'Description must be at least 10 characters.'),

  content: z
    .string()
    .min(1, 'Content is required.')
    .refine((value) => getPlainTextFromHtml(value).length >= 3, {
      message: 'Content must contain at least 3 readable characters.',
    }),

  order: z.coerce
    .number()
    .int('Order must be an integer.')
    .min(1, 'Order must be at least 1.'),
});
