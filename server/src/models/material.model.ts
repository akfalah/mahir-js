import { Material } from '../../generated/prisma/client';

import { PaginationResponse } from './paginations.model';

export type CreateMaterialRequest = {
  conceptId: number;
  slug: string;
  title: string;
  content: string;
  order: number;
};

export type UpdateMaterialRequest = {
  conceptId?: number;
  slug?: string;
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
};

export type GetMaterialResponse = PaginationResponse<MaterialResponse>;

export function toMaterialResponse(material: Material) {
  return {
    id: material.id,
    conceptId: material.conceptId,
    slug: material.slug,
    title: material.title,
    content: material.content,
    order: material.order,
  };
}
