import { Exercise } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './pagination.model';
import { MaterialRefResponse } from './material.model';
import {
  TestCaseSummaryResponse,
  TestCaseSummarySource,
  toTestCaseSummaryResponse,
} from './test-case.model';

export type ExerciseSummarySource = Pick<
  Exercise,
  | 'id'
  | 'materialId'
  | 'slug'
  | 'title'
  | 'description'
  | 'order'
  | 'isPublished'
>;

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
  order: number;
  hint?: string;
  starterCode?: string;
  syntaxRules: SyntaxRules;
  parameterNames?: string[];
  functionName?: string;
  isPublished?: boolean;
};

export type UpdateExerciseRequest = {
  slug?: string;
  title?: string;
  description?: string;
  order?: number;
  hint?: string;
  starterCode?: string;
  syntaxRules?: SyntaxRules;
  parameterNames?: string[];
  functionName?: string;
  isPublished?: boolean;
};

export type ExerciseResponse = {
  id: number;
  materialId: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  hint: string | null;
  starterCode: string | null;
  syntaxRules: SyntaxRules;
  parameterNames: string[] | null;
  functionName: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  material?: MaterialRefResponse;
};

export type ExerciseSummaryResponse = {
  id: number;
  materialId: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished?: boolean;
};

export type ExerciseRefResponse = {
  id: number;
  slug: string;
  title: string;
  order: number;
};

export type ExercisePaginationResponse = PaginationResponse<ExerciseResponse>;

export type ExerciseDetailResponse = ExerciseResponse & {
  testCases: TestCaseSummaryResponse[];
};

export function toExerciseResponse(
  exercise: Exercise,
  material?: MaterialRefResponse,
): ExerciseResponse {
  return {
    id: exercise.id,
    materialId: exercise.materialId,
    slug: exercise.slug,
    title: exercise.title,
    description: exercise.description,
    order: exercise.order,
    hint: exercise.hint,
    starterCode: exercise.starterCode,
    syntaxRules: exercise.syntaxRules as SyntaxRules,
    parameterNames: exercise.parameterNames as string[] | null,
    functionName: exercise.functionName,
    isPublished: exercise.isPublished,
    createdAt: exercise.createdAt,
    updatedAt: exercise.updatedAt,
    ...(material && { material }),
  };
}

export function toExerciseDetailResponse(
  exercise: Exercise & {
    material: MaterialRefResponse;
    testCases: TestCaseSummarySource[];
  },
  isAdmin: boolean,
): ExerciseDetailResponse {
  return {
    ...toExerciseResponse(exercise, exercise.material),
    testCases: exercise.testCases.map((testCase) =>
      toTestCaseSummaryResponse(testCase, isAdmin),
    ),
  };
}

export function toExerciseSummaryResponse(
  exercise: ExerciseSummarySource,
  includeIsPublished: boolean,
): ExerciseSummaryResponse {
  return {
    id: exercise.id,
    materialId: exercise.materialId,
    slug: exercise.slug,
    title: exercise.title,
    description: exercise.description,
    order: exercise.order,
    ...(includeIsPublished && { isPublished: exercise.isPublished }),
  };
}

export function toExerciseRefResponse(
  exercise: ExerciseRefResponse,
): ExerciseRefResponse {
  return {
    id: exercise.id,
    slug: exercise.slug,
    title: exercise.title,
    order: exercise.order,
  };
}
