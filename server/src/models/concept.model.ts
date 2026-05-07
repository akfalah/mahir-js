import { Concept } from '../../generated/prisma/client';
import { PaginationResponse } from './paginations.model';

export type CreateConceptRequest = {
  slug: string;
  title: string;
  description: string;
  order: number;
};

export type UpdateConceptRequest = {
  slug?: string;
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
};

export type GetConceptsResponse = PaginationResponse<ConceptResponse>;

export function toConceptResponse(concept: Concept): ConceptResponse {
  return {
    id: concept.id,
    slug: concept.slug,
    title: concept.title,
    description: concept.description,
    order: concept.order,
  };
}
