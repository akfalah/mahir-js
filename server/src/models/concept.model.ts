import { Concept } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type ConceptSortBy = 'id' | 'title' | 'order' | 'createdAt';

export type ConceptPaginationRequest = PaginationRequest<ConceptSortBy>;

export type CreateConceptRequest = {
  title: string;
  description: string;
  order: number;
};

export type UpdateConceptRequest = {
  title?: string;
  description?: string;
  order?: number;
};

export type ConceptResponse = {
  id: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  createdAt: Date;
};

export type ConceptPaginationResponse = PaginationResponse<ConceptResponse>;

export function toConceptResponse(concept: Concept): ConceptResponse {
  return {
    id: concept.id,
    slug: concept.slug,
    title: concept.title,
    description: concept.description,
    order: concept.order,
    createdAt: concept.createdAt,
  };
}
