import { Module } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './pagination.model';

export type ModuleSortBy =
  | 'id'
  | 'slug'
  | 'title'
  | 'order'
  | 'isPublished'
  | 'createdAt';

export type ModulePaginationRequest = PaginationRequest<ModuleSortBy> & {
  isPublished?: boolean;
};

export type CreateModuleRequest = {
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished?: boolean;
};

export type UpdateModuleRequest = {
  slug?: string;
  title?: string;
  description?: string;
  order?: number;
  isPublished?: boolean;
};

export type ModuleResponse = {
  id: number;
  slug: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ModulePaginationResponse = PaginationResponse<ModuleResponse>;

export function toModuleResponse(module: Module): ModuleResponse {
  return {
    id: module.id,
    slug: module.slug,
    title: module.title,
    description: module.description,
    order: module.order,
    isPublished: module.isPublished,
    createdAt: module.createdAt,
    updatedAt: module.updatedAt,
  };
}
