import { StudyCase } from '../../generated/prisma/client';
import { PaginationResponse } from './paginations.model';

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
  materialId?: number;
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
  parameterNames?: string[];
  functionName?: string;
};

export type GetStudyCaseResponse = PaginationResponse<StudyCaseResponse>;

export function toStudyCaseResponse(studyCase: StudyCase) {
  return {
    id: studyCase.id,
    materialId: studyCase.materialId,
    title: studyCase.title,
    description: studyCase.description,
    starterCode: studyCase.starterCode,
    order: studyCase.order,
    parameterNames: (studyCase.parameterNames as string[]) ?? undefined,
    functionName: studyCase.functionName ?? undefined,
  };
}
