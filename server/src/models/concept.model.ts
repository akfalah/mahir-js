import { Concept } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type ConceptSortBy =
  | 'id'
  | 'slug'
  | 'title'
  | 'order'
  | 'isPublished'
  | 'createdAt';

export type ConceptPaginationRequest = PaginationRequest<ConceptSortBy> & {
  isPublished?: boolean;
};

export type CreateConceptRequest = {
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished?: boolean;
};

export type UpdateConceptRequest = {
  slug?: string;
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
};

export type ConceptResponse = {
  id: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ConceptPaginationResponse = PaginationResponse<ConceptResponse>;

export function toConceptResponse(concept: Concept): ConceptResponse {
  return {
    id: concept.id,
    slug: concept.slug,
    title: concept.title,
    description: concept.description,
    order: concept.order,
    isPublished: concept.isPublished,
    createdAt: concept.createdAt,
    updatedAt: concept.updatedAt,
  };
}
