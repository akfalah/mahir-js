import { Prisma, Exercise } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './pagination.model';

export type ExerciseSortBy =
  | 'id'
  | 'slug'
  | 'materialId'
  | 'title'
  | 'order'
  | 'isPublished'
  | 'createdAt';

export type ExercisePaginationRequest = PaginationRequest<ExerciseSortBy> & {
  materialId?: number;
  isPublished?: boolean;
};

export type SyntaxRules = {
  required?: string[];
  forbidden?: string[];
};

export type CreateExerciseRequest = {
  materialId: number;
  slug: string;
  title: string;
  description: string;
  hint?: string;
  order: number;
  starterCode: string;
  syntaxRules: SyntaxRules;
  parameterNames?: string[];
  functionName?: string;
  isPublished?: boolean;
};

export type UpdateExerciseRequest = {
  slug?: string;
  title?: string;
  description?: string;
  hint?: string;
  order?: number;
  starterCode?: string;
  syntaxRules?: SyntaxRules;
  parameterNames?: string[];
  functionName?: string;
  isPublished?: boolean;
};

export const ExerciseRelationInclude = {
  material: {
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
      module: {
        select: {
          id: true,
          slug: true,
          title: true,
          isPublished: true,
        },
      },
    },
  },
} satisfies Prisma.ExerciseInclude;

export type ExerciseWithRelations = Prisma.ExerciseGetPayload<{
  include: typeof ExerciseRelationInclude;
}>;

export type ExerciseModuleResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
};

export type ExerciseMaterialResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
  module: ExerciseModuleResponse;
};

export type ExerciseResponse = {
  id: number;
  materialId: number;
  slug: string;
  title: string;
  description: string;
  hint: string | null;
  order: number;
  starterCode: string | null;
  syntaxRules: SyntaxRules;
  parameterNames: string[] | null;
  functionName: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  material?: ExerciseMaterialResponse;
};

export type ExercisePaginationResponse = PaginationResponse<ExerciseResponse>;

export function toExerciseeResponse(
  exercise: Exercise | ExerciseWithRelations,
): ExerciseResponse {
  const response: ExerciseResponse = {
    id: exercise.id,
    materialId: exercise.materialId,
    slug: exercise.slug,
    title: exercise.title,
    description: exercise.description,
    hint: exercise.hint,
    order: exercise.order,
    starterCode: exercise.starterCode,
    syntaxRules: exercise.syntaxRules as SyntaxRules,
    parameterNames: exercise.parameterNames as string[] | null,
    functionName: exercise.functionName,
    isPublished: exercise.isPublished,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
  };

  if ('material' in exercise) {
    response.material = exercise.material;
  }

  return response;
}
