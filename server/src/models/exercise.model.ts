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

export type StudyCaseMaterialResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
  module: ExerciseModuleResponse;
};

export type ExerciseeResponse = {
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
  material?: StudyCaseMaterialResponse;
};

export type StudyCasePaginationResponse = PaginationResponse<ExerciseeResponse>;

export function toExerciseeResponse(
  studyCase: Exercise | ExerciseWithRelations,
): ExerciseeResponse {
  const response: ExerciseeResponse = {
    id: studyCase.id,
    materialId: studyCase.materialId,
    slug: studyCase.slug,
    title: studyCase.title,
    description: studyCase.description,
    hint: studyCase.hint,
    order: studyCase.order,
    starterCode: studyCase.starterCode,
    syntaxRules: studyCase.syntaxRules as SyntaxRules,
    parameterNames: studyCase.parameterNames as string[] | null,
    functionName: studyCase.functionName,
    isPublished: studyCase.isPublished,
    createdAt: studyCase.createdAt,
    updatedAt: studyCase.updatedAt,
  };

  if ('material' in studyCase) {
    response.material = studyCase.material;
  }

  return response;
}
