import { z } from 'zod';

function parseCommaSeparated(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseJsonObject(value: string) {
  if (!value.trim()) {
    return {};
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export const studyCaseSchema = z.object({
  materialId: z.coerce
    .number()
    .int('Material is required.')
    .min(1, 'Material is required.'),
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
  hint: z
    .string()
    .trim()
    .max(500, 'Hint must be less than 500 characters.')
    .optional(),
  starterCode: z.string().min(3, 'Starter code is required.'),
  order: z.coerce
    .number()
    .int('Order must be an integer.')
    .min(1, 'Order must be at least 1.'),
  functionName: z.string().trim().optional(),
  parameterNames: z.string().transform(parseCommaSeparated),
  syntaxRules: z
    .string()
    .transform(parseJsonObject)
    .refine((value) => value !== null, {
      message: 'Syntax rules must be valid JSON.',
    }),

  isPublished: z.boolean(),
});
