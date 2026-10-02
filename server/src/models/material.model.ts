import { Material } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './pagination.model';
import { ModuleRefResponse } from './module.model';
import {
  ExerciseSummaryResponse,
  ExerciseSummarySource,
  toExerciseSummaryResponse,
} from './exercise.model';

export type MaterialSummarySource = Pick<
  Material,
  'id' | 'moduleId' | 'slug' | 'title' | 'description' | 'order' | 'isPublished'
>;

export type MaterialSortBy =
  | 'id'
  | 'moduleId'
  | 'title'
  | 'order'
  | 'isPublished'
  | 'createdAt';

export type MaterialPaginationRequest = PaginationRequest<MaterialSortBy> & {
  moduleId?: number;
  isPublished?: boolean;
};

export type CreateMaterialRequest = {
  moduleId: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  order: number;
  isPublished?: boolean;
};

export type UpdateMaterialRequest = {
  slug?: string;
  title?: string;
  description?: string;
  content?: string;
  order?: number;
  isPublished?: boolean;
};

export type MaterialResponse = {
  id: number;
  moduleId: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  module?: ModuleRefResponse;
};

export type MaterialSummaryResponse = {
  id: number;
  moduleId: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished?: boolean;
};

export type MaterialRefResponse = {
  id: number;
  slug: string;
  title: string;
  order: number;
};

export type MaterialPaginationResponse = PaginationResponse<MaterialResponse>;

export type MaterialDetailResponse = MaterialResponse & {
  exercises: ExerciseSummaryResponse[];
};

export function toMaterialResponse(
  material: Material,
  module?: ModuleRefResponse,
): MaterialResponse {
  return {
    id: material.id,
    moduleId: material.moduleId,
    slug: material.slug,
    title: material.title,
    description: material.description,
    content: material.content,
    order: material.order,
    isPublished: material.isPublished,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
    ...(module && { module }),
  };
}

export function toMaterialDetailResponse(
  material: Material & {
    module: ModuleRefResponse;
    exercises: ExerciseSummarySource[];
  },
  isAdmin: boolean,
): MaterialDetailResponse {
  return {
    ...toMaterialResponse(material, material.module),
    exercises: material.exercises.map((exercise) =>
      toExerciseSummaryResponse(exercise, isAdmin),
    ),
  };
}

export function toMaterialSummaryResponse(
  material: MaterialSummarySource,
  includeIsPublished: boolean,
): MaterialSummaryResponse {
  return {
    id: material.id,
    moduleId: material.moduleId,
    slug: material.slug,
    title: material.title,
    description: material.description,
    order: material.order,
    ...(includeIsPublished && { isPublished: material.isPublished }),
  };
}

export function toMaterialRefResponse(
  material: MaterialRefResponse,
): MaterialRefResponse {
  return {
    id: material.id,
    slug: material.slug,
    title: material.title,
    order: material.order,
  };
}
