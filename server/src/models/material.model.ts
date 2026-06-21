import { Material } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type MaterialSortBy =
  | 'id'
  | 'conceptId'
  | 'title'
  | 'order'
  | 'createdAt';

export type MaterialPaginationRequest = PaginationRequest<MaterialSortBy> & {
  conceptId?: number;
};

export type CreateMaterialRequest = {
  conceptId: number;
  title: string;
  content: string;
  order: number;
};

export type UpdateMaterialRequest = {
  title?: string;
  content?: string;
  order?: number;
};

export type MaterialResponse = {
  id: number;
  conceptId: number;
  slug: string;
  title: string;
  content: string;
  order: number;
  createdAt: Date;
};

export type MaterialPaginationResponse = PaginationResponse<MaterialResponse>;

export function toMaterialResponse(material: Material) {
  return {
    id: material.id,
    conceptId: material.conceptId,
    slug: material.slug,
    title: material.title,
    content: material.content,
    order: material.order,
    createdAt: material.createdAt,
  };
}
