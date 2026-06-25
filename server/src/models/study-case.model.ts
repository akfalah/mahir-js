import { StudyCase } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type StudyCaeSortBy =
  | 'id'
  | 'slug'
  | 'materialId'
  | 'title'
  | 'order'
  | 'isPublished'
  | 'createdAt';

export type StudyCasePaginationRequest = PaginationRequest<StudyCaeSortBy> & {
  materialId?: number;
  isPublished?: boolean;
};

export type SyntaxRules = {
  required?: string[];
  forbidden?: string[];
};

export type CreateStudyCaseRequest = {
  materialId: number;
  slug: string;
  title: string;
  description: string;
  hint?: string;
  order: number;
  starterCode: string;
  syntaxRules: SyntaxRules;
  parameterNames?: string[];
  functionName?: string;
  isPublished?: boolean;
};

export type UpdateStudyCaseRequest = {
  slug?: string;
  title?: string;
  description?: string;
  hint?: string;
  order?: number;
  starterCode?: string;
  syntaxRules?: SyntaxRules;
  parameterNames?: string[];
  functionName?: string;
  isPublished?: boolean;
};

export type StudyCaseResponse = {
  id: number;
  materialId: number;
  slug: string;
  title: string;
  description: string;
  hint: string | null;
  order: number;
  starterCode: string;
  syntaxRules: SyntaxRules;
  parameterNames: string[] | null;
  functionName: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type StudyCasePaginationResponse = PaginationResponse<StudyCaseResponse>;

export function toStudyCaseResponse(studyCase: StudyCase) {
  return {
    id: studyCase.id,
    materialId: studyCase.materialId,
    slug: studyCase.slug,
    title: studyCase.title,
    description: studyCase.description,
    hint: studyCase.hint,
    order: studyCase.order,
    starterCode: studyCase.starterCode,
    syntaxRules: studyCase.syntaxRules as SyntaxRules,
    parameterNames: studyCase.parameterNames as string[] | null,
    functionName: studyCase.functionName,
    isPublished: studyCase.isPublished,
    createdAt: studyCase.createdAt,
    updatedAt: studyCase.updatedAt,
  };
}
