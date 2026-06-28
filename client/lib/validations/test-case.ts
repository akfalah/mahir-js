import { z } from 'zod';

function parseJsonRecord(value: string) {
  if (!value.trim()) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

export const testCaseSchema = z.object({
  studyCaseId: z.coerce
    .number()
    .int('Study case is required.')
    .min(1, 'Study case is required.'),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters.'),
  input: z
    .string()
    .transform(parseJsonRecord)
    .refine((value) => value !== null, {
      message: 'Input must be a valid JSON object.',
    }),
  expected: z
    .string()
    .transform(parseJsonRecord)
    .refine((value) => value !== null, {
      message: 'Expected output must be a valid JSON object.',
    }),
  order: z.coerce
    .number()
    .int('Order must be an integer.')
    .min(1, 'Order must be at least 1.'),
  isPublished: z.boolean(),
});
