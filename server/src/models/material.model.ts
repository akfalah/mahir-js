import { Material, Prisma } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type MaterialSortBy =
  | 'id'
  | 'conceptId'
  | 'title'
  | 'order'
  | 'isPublished'
  | 'createdAt';

export type MaterialPaginationRequest = PaginationRequest<MaterialSortBy> & {
  conceptId?: number;
  isPublished?: boolean;
};

export type CreateMaterialRequest = {
  conceptId: number;
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
  concept: {
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

export type MaterialConceptResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
};

export type MaterialResponse = {
  id: number;
  conceptId: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  concept?: MaterialConceptResponse;
};

export type MaterialPaginationResponse = PaginationResponse<MaterialResponse>;

export function toMaterialResponse(
  material: Material | MaterialWithRelations,
): MaterialResponse {
  const response: MaterialResponse = {
    id: material.id,
    conceptId: material.conceptId,
    slug: material.slug,
    title: material.title,
    description: material.description,
    content: material.content,
    order: material.order,
    isPublished: material.isPublished,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
  };

  if ('concept' in material) {
    response.concept = material.concept;
  }

  return response;
}
