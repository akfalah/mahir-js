import { prisma } from '../applications/database';

import { JwtPayload } from '../models/auth.model';

import {
  ModuleProgressResponse,
  MaterialProgressResponse,
  ExerciseProgressResponse,
  toModuleProgressResponse,
  toMaterialProgressResponse,
  toExerciseProgressResponse,
} from '../models/progress.model';

export class ProgressService {
  static async getModuleProgresses(
    user: JwtPayload,
  ): Promise<ModuleProgressResponse[]> {
    const progresses = await prisma.moduleProgress.findMany({
      where: { userId: user.id },
      orderBy: { module: { order: 'asc' } },
    });

    return progresses.map(toModuleProgressResponse);
  }

  static async getMaterialProgresses(
    user: JwtPayload,
    moduleId?: number,
  ): Promise<MaterialProgressResponse[]> {
    const progresses = await prisma.materialProgress.findMany({
      where: { userId: user.id, ...(moduleId && { material: { moduleId } }) },
      orderBy: { material: { order: 'asc' } },
    });

    return progresses.map(toMaterialProgressResponse);
  }

  static async getExerciseProgresses(
    user: JwtPayload,
    materialId?: number,
  ): Promise<ExerciseProgressResponse[]> {
    const progresses = await prisma.exerciseProgress.findMany({
      where: {
        userId: user.id,
        ...(materialId && { exercise: { materialId } }),
      },
      orderBy: { exercise: { order: 'asc' } },
    });

    return progresses.map(toExerciseProgressResponse);
  }

  static async updateOnSubmissionPassed(
    userId: number,
    exerciseId: number,
  ): Promise<void> {
    const now = new Date();

    await prisma.exerciseProgress.upsert({
      where: { userId_exerciseId: { userId, exerciseId } },
      update: { isCompleted: true, completedAt: now },
      create: {
        userId,
        exerciseId,
        isCompleted: true,
        completedAt: now,
      },
    });

    const currentExercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (currentExercise) {
      const nextExercise = await prisma.exercise.findFirst({
        where: {
          materialId: currentExercise.materialId,
          order: currentExercise.order + 1,
        },
      });

      if (nextExercise) {
        await prisma.exerciseProgress.upsert({
          where: {
            userId_exerciseId: { userId, exerciseId: nextExercise.id },
          },
          update: {},
          create: { userId, exerciseId: nextExercise.id },
        });
      } else {
        await prisma.materialProgress.upsert({
          where: {
            userId_materialId: {
              userId,
              materialId: currentExercise.materialId,
            },
          },
          update: { isCompleted: true, completedAt: now },
          create: {
            userId,
            materialId: currentExercise.materialId,
            isCompleted: true,
            completedAt: now,
          },
        });

        const currentMaterial = await prisma.material.findUnique({
          where: { id: currentExercise.materialId },
        });

        if (currentMaterial) {
          const nextMaterial = await prisma.material.findFirst({
            where: {
              moduleId: currentMaterial.moduleId,
              order: currentMaterial.order + 1,
            },
          });

          if (nextMaterial) {
            await prisma.materialProgress.upsert({
              where: {
                userId_materialId: { userId, materialId: nextMaterial.id },
              },
              update: {},
              create: { userId, materialId: nextMaterial.id },
            });

            const firstExercise = await prisma.exercise.findFirst({
              where: { materialId: nextMaterial.id },
              orderBy: { order: 'asc' },
            });

            if (firstExercise) {
              await prisma.exerciseProgress.upsert({
                where: {
                  userId_exerciseId: {
                    userId,
                    exerciseId: firstExercise.id,
                  },
                },
                update: {},
                create: {
                  userId,
                  exerciseId: firstExercise.id,
                },
              });
            }
          } else {
            await prisma.moduleProgress.upsert({
              where: {
                userId_moduleId: {
                  userId,
                  moduleId: currentMaterial.moduleId,
                },
              },
              update: { isCompleted: true, completedAt: now },
              create: {
                userId,
                moduleId: currentMaterial.moduleId,
                isCompleted: true,
                completedAt: now,
              },
            });

            const currentModule = await prisma.module.findUnique({
              where: { id: currentMaterial.moduleId },
            });

            if (currentModule) {
              const nextModule = await prisma.module.findFirst({
                where: { order: currentModule.order + 1 },
              });

              if (nextModule) {
                await prisma.moduleProgress.upsert({
                  where: {
                    userId_moduleId: { userId, moduleId: nextModule.id },
                  },
                  update: {},
                  create: {
                    userId,
                    moduleId: nextModule.id,
                  },
                });

                const firstMaterial = await prisma.material.findFirst({
                  where: { moduleId: nextModule.id },
                  orderBy: { order: 'asc' },
                });

                if (firstMaterial) {
                  await prisma.materialProgress.upsert({
                    where: {
                      userId_materialId: {
                        userId,
                        materialId: firstMaterial.id,
                      },
                    },
                    update: {},
                    create: {
                      userId,
                      materialId: firstMaterial.id,
                    },
                  });

                  const firstExercise = await prisma.exercise.findFirst({
                    where: { materialId: firstMaterial.id },
                    orderBy: { order: 'asc' },
                  });

                  if (firstExercise) {
                    await prisma.exerciseProgress.upsert({
                      where: {
                        userId_exerciseId: {
                          userId,
                          exerciseId: firstExercise.id,
                        },
                      },
                      update: {},
                      create: {
                        userId,
                        exerciseId: firstExercise.id,
                      },
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
