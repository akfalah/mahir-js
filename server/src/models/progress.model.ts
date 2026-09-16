import {
  ModuleProgress,
  MaterialProgress,
  ExerciseProgress,
} from '../../generated/prisma/client';

export type ExerciseProgressResponse = {
  id: number;
  userId: number;
  exerciseId: number;
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

export type ModuleProgressResponse = {
  id: number;
  userId: number;
  moduleId: number;
  isCompleted: boolean;
  completedAt: Date | null;
  updatedAt: Date;
};

export function toExerciseProgressResponse(
  progress: ExerciseProgress,
): ExerciseProgressResponse {
  return {
    id: progress.id,
    userId: progress.userId,
    exerciseId: progress.exerciseId,
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

export function toModuleProgressResponse(
  progress: ModuleProgress,
): ModuleProgressResponse {
  return {
    id: progress.id,
    userId: progress.userId,
    moduleId: progress.moduleId,
    isCompleted: progress.isCompleted,
    completedAt: progress.completedAt,
    updatedAt: progress.updatedAt,
  };
}
