import { Module } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './pagination.model';
import {
  MaterialSummaryResponse,
  MaterialSummarySource,
  toMaterialSummaryResponse,
} from './material.model';

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

export type ModuleRefResponse = {
  id: number;
  slug: string;
  title: string;
  order: number;
};

export type ModulePaginationResponse = PaginationResponse<ModuleResponse>;

export type ModuleDetailResponse = ModuleResponse & {
  materials: MaterialSummaryResponse[];
};

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

export function toModuleDetailResponse(
  module: Module & { materials: MaterialSummarySource[] },
  isAdmin: boolean,
): ModuleDetailResponse {
  return {
    ...toModuleResponse(module),
    materials: module.materials.map((material) =>
      toMaterialSummaryResponse(material, isAdmin),
    ),
  };
}

export function toModuleRefResponse(
  module: ModuleRefResponse,
): ModuleRefResponse {
  return {
    id: module.id,
    slug: module.slug,
    title: module.title,
    order: module.order,
  };
}
