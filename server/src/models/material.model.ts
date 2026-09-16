import { Material, Prisma } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './pagination.model';

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

export const materialRelationInclude = {
  module: {
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
    },
  },
} satisfies Prisma.MaterialInclude;

export type MaterialWithRelations = Prisma.MaterialGetPayload<{
  include: typeof materialRelationInclude;
}>;

export type MaterialModuleResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
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
  module?: MaterialModuleResponse;
};

export type MaterialPaginationResponse = PaginationResponse<MaterialResponse>;

export function toMaterialResponse(
  material: Material | MaterialWithRelations,
): MaterialResponse {
  const response: MaterialResponse = {
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
  };

  if ('module' in material) {
    response.module = material.module;
  }

  return response;
}
