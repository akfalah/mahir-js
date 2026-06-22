import {
  ConceptProgress,
  MaterialProgress,
  StudyCaseProgress,
} from '../../generated/prisma/client';

export type StudyCaseProgressResponse = {
  id: number;
  userId: number;
  studyCaseId: number;
  isCompleted: boolean;
  completedAt: Date | null;
  updatedAt: Date;
};

export type MaterialProgressResponse = {
  id: number;
  userId: number;
  materialId: number;
  isCompleted: boolean;
  completedAt: Date | null;
  updatedAt: Date;
};

export type ConceptProgressResponse = {
  id: number;
  userId: number;
  conceptId: number;
  isCompleted: boolean;
  completedAt: Date | null;
  updatedAt: Date;
};

export function toStudyCaseProgressResponse(
  progress: StudyCaseProgress,
): StudyCaseProgressResponse {
  return {
    id: progress.id,
    userId: progress.userId,
    studyCaseId: progress.studyCaseId,
    isCompleted: progress.isCompleted,
    completedAt: progress.completedAt,
    updatedAt: progress.updatedAt,
  };
}

export function toMaterialProgressResponse(
  progress: MaterialProgress,
): MaterialProgressResponse {
  return {
    id: progress.id,
    userId: progress.userId,
    materialId: progress.materialId,
    isCompleted: progress.isCompleted,
    completedAt: progress.completedAt,
    updatedAt: progress.updatedAt,
  };
}

export function toConceptProgressResponse(
  progress: ConceptProgress,
): ConceptProgressResponse {
  return {
    id: progress.id,
    userId: progress.userId,
    conceptId: progress.conceptId,
    isCompleted: progress.isCompleted,
    completedAt: progress.completedAt,
    updatedAt: progress.updatedAt,
  };
}
