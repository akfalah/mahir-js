import z, { ZodType } from 'zod';

import { PaginationValidation } from './pagination.validation';

import {
  CreateExerciseRequest,
  ExerciseSortBy,
  ExercisePaginationRequest,
  UpdateExerciseRequest,
} from '../models/exercise.model';

import { ALLOWED_SYNTAX_RULE_NODES } from '../constants/syntax-rules.constant';

const astNode = z.enum(ALLOWED_SYNTAX_RULE_NODES as [string, ...string[]]);

const syntaxRulesSchema = z
  .object({
    required: z.array(astNode),
    forbidden: z.array(astNode),
  })
  .refine((rules) => rules.required.length > 0 && rules.forbidden.length > 0, {
    message:
      'syntaxRules must have at least one required rule and one forbidden rule',
  })
  .refine(
    (rules) => !rules.required.some((node) => rules.forbidden.includes(node)),
    { message: 'A node cannot be both required and forbidden' },
  );

const identifier = z
  .string()
  .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, 'Must be a valid JavaScript identifier');

export class ExerciseValidation {
  static readonly GET: ZodType<ExercisePaginationRequest> = z.object({
    ...PaginationValidation.BaseSchema,
    sortBy: z
      .enum([
        'id',
        'materialId',
        'title',
        'order',
        'createdAt',
      ] as const satisfies readonly ExerciseSortBy[])
      .default('createdAt'),
    orderBy: z.enum(['asc', 'desc']).default('desc'),
    materialId: z.coerce.number().min(1).optional(),
    isPublished: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
  });

  static readonly CREATE: ZodType<CreateExerciseRequest> = z.object({
    materialId: z.number().min(1),
    slug: z.string().min(3),
    title: z.string().min(3),
    description: z.string().min(3),
    order: z.number().min(1),
    hint: z.string().trim().min(1).optional(),
    starterCode: z.string().min(1).optional(),
    syntaxRules: syntaxRulesSchema,
    parameterNames: z.array(identifier).optional(),
    functionName: identifier.min(1).optional(),
    isPublished: z.boolean().optional(),
  });

  static readonly UPDATE: ZodType<UpdateExerciseRequest> = z.object({
    slug: z.string().min(3).optional(),
    title: z.string().min(3).optional(),
    description: z.string().min(3).optional(),
    order: z.number().min(1).optional(),
    hint: z.string().trim().min(1).optional(),
    starterCode: z.string().min(1).optional(),
    syntaxRules: syntaxRulesSchema.optional(),
    parameterNames: z.array(identifier).optional(),
    functionName: identifier.min(1).optional(),
    isPublished: z.boolean().optional(),
  });
}
