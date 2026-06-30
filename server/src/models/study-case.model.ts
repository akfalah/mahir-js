import { Prisma, StudyCase } from '../../generated/prisma/client';

import { PaginationRequest, PaginationResponse } from './paginations.model';

export type StudyCaseSortBy =
  | 'id'
  | 'slug'
  | 'materialId'
  | 'title'
  | 'order'
  | 'isPublished'
  | 'createdAt';

export type StudyCasePaginationRequest = PaginationRequest<StudyCaseSortBy> & {
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

export const studyCaseRelationInclude = {
  material: {
    select: {
      id: true,
      slug: true,
      title: true,
      isPublished: true,
      concept: {
        select: {
          id: true,
          slug: true,
          title: true,
          isPublished: true,
        },
      },
    },
  },
} satisfies Prisma.StudyCaseInclude;

export type StudyCaseWithRelations = Prisma.StudyCaseGetPayload<{
  include: typeof studyCaseRelationInclude;
}>;

export type StudyCaseConceptResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
};

export type StudyCaseMaterialResponse = {
  id: number;
  slug: string;
  title: string;
  isPublished: boolean;
  concept: StudyCaseConceptResponse;
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
  material?: StudyCaseMaterialResponse;
};

export type StudyCasePaginationResponse = PaginationResponse<StudyCaseResponse>;

export function toStudyCaseResponse(
  studyCase: StudyCase | StudyCaseWithRelations,
): StudyCaseResponse {
  const response: StudyCaseResponse = {
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

  if ('material' in studyCase) {
    response.material = studyCase.material;
  }

  return response;
}
