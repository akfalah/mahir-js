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
  static async getOverview(user: JwtPayload) {
    const userId = user.id;

    const [
      totalModules,
      totalMaterials,
      totalExercises,
      completedModules,
      completedMaterials,
      completedExercises,
    ] = await Promise.all([
      prisma.module.count({ where: { isPublished: true } }),
      prisma.material.count({
        where: { isPublished: true, module: { isPublished: true } },
      }),
      prisma.exercise.count({ where: { isPublished: true } }),
      prisma.moduleProgress.count({
        where: { userId, isCompleted: true, module: { isPublished: true } },
      }),
      prisma.materialProgress.count({
        where: { userId, isCompleted: true, material: { isPublished: true } },
      }),
      prisma.exerciseProgress.count({
        where: { userId, isCompleted: true, exercise: { isPublished: true } },
      }),
    ]);

    const total = totalMaterials + totalExercises;
    const done = completedMaterials + completedExercises;

    return {
      modules: { completed: completedModules, total: totalModules },
      materials: { completed: completedMaterials, total: totalMaterials },
      exercises: { completed: completedExercises, total: totalExercises },
      percentage: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }

  static async getModuleProgress(
    user: JwtPayload,
  ): Promise<ModuleProgressResponse[]> {
    const progress = await prisma.moduleProgress.findMany({
      where: { userId: user.id },
      orderBy: { module: { order: 'asc' } },
    });

    return progress.map(toModuleProgressResponse);
  }

  static async getMaterialProgress(
    user: JwtPayload,
    moduleId?: number,
  ): Promise<MaterialProgressResponse[]> {
    const progress = await prisma.materialProgress.findMany({
      where: { userId: user.id, ...(moduleId && { material: { moduleId } }) },
      orderBy: { material: { order: 'asc' } },
    });

    return progress.map(toMaterialProgressResponse);
  }

  static async getExerciseProgress(
    user: JwtPayload,
    materialId?: number,
  ): Promise<ExerciseProgressResponse[]> {
    const progress = await prisma.exerciseProgress.findMany({
      where: {
        userId: user.id,
        ...(materialId && { exercise: { materialId } }),
      },
      orderBy: { exercise: { order: 'asc' } },
    });

    return progress.map(toExerciseProgressResponse);
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
