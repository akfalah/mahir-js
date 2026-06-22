import { StudyCase } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type StudyCaeSortBy =
  | 'id'
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
  title: string;
  description: string;
  starterCode: string;
  order: number;
  syntaxRules?: SyntaxRules;
  parameterNames?: string[];
  functionName?: string;
  isPublished?: boolean;
};

export type UpdateStudyCaseRequest = {
  title?: string;
  description?: string;
  starterCode?: string;
  order?: number;
  syntaxRules?: SyntaxRules;
  parameterNames?: string[];
  functionName?: string;
  isPublished?: boolean;
};

export type StudyCaseResponse = {
  id: number;
  materialId: number;
  title: string;
  description: string;
  starterCode: string;
  order: number;
  syntaxRules: SyntaxRules;
  parameterNames: string[] | null;
  functionName: string | null;
  isPublished: boolean;
  createdAt: Date;
};

export type StudyCasePaginationResponse = PaginationResponse<StudyCaseResponse>;

export function toStudyCaseResponse(studyCase: StudyCase) {
  return {
    id: studyCase.id,
    materialId: studyCase.materialId,
    title: studyCase.title,
    description: studyCase.description,
    starterCode: studyCase.starterCode,
    order: studyCase.order,
    syntaxRules: studyCase.syntaxRules as SyntaxRules,
    parameterNames: studyCase.parameterNames as string[] | null,
    functionName: studyCase.functionName,
    isPublished: studyCase.isPublished,
    createdAt: studyCase.createdAt,
  };
}
