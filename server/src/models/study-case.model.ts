import { StudyCase } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type StudyCaeSortBy =
  | 'id'
  | 'materialId'
  | 'title'
  | 'order'
  | 'createdAt';

export type StudyCasePaginationRequest = PaginationRequest<StudyCaeSortBy> & {
  materialId?: number;
};

export type CreateStudyCaseRequest = {
  materialId: number;
  title: string;
  description: string;
  starterCode: string;
  order: number;
  parameterNames?: string[];
  functionName?: string;
};

export type UpdateStudyCaseRequest = {
  title?: string;
  description?: string;
  starterCode?: string;
  order?: number;
  parameterNames?: string[];
  functionName?: string;
};

export type StudyCaseResponse = {
  id: number;
  materialId: number;
  title: string;
  description: string;
  starterCode: string;
  order: number;
  parameterNames: string[] | null;
  functionName: string | null;
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
    parameterNames: studyCase.parameterNames as string[] | null,
    functionName: studyCase.functionName,
    createdAt: studyCase.createdAt,
  };
}
