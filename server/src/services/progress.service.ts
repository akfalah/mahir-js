import { prisma } from '../applications/database';

import { JwtPayload } from '../models/auth.model';

import {
  ConceptProgressResponse,
  MaterialProgressResponse,
  StudyCaseProgressResponse,
  toConceptProgressResponse,
  toMaterialProgressResponse,
  toStudyCaseProgressResponse,
} from '../models/progress.model';

export class ProgressService {
  static async getConceptProgresses(
    user: JwtPayload,
  ): Promise<ConceptProgressResponse[]> {
    const progresses = await prisma.conceptProgress.findMany({
      where: { userId: user.id },
      orderBy: { concept: { order: 'asc' } },
    });

    return progresses.map(toConceptProgressResponse);
  }

  static async getMaterialProgresses(
    user: JwtPayload,
    conceptId?: number,
  ): Promise<MaterialProgressResponse[]> {
    const progresses = await prisma.materialProgress.findMany({
      where: { userId: user.id, ...(conceptId && { material: { conceptId } }) },
      orderBy: { material: { order: 'asc' } },
    });

    return progresses.map(toMaterialProgressResponse);
  }

  static async getStudyCaseProgresses(
    user: JwtPayload,
    materialId?: number,
  ): Promise<StudyCaseProgressResponse[]> {
    const progresses = await prisma.studyCaseProgress.findMany({
      where: {
        userId: user.id,
        ...(materialId && { studyCase: { materialId } }),
      },
      orderBy: { studyCase: { order: 'asc' } },
    });

    return progresses.map(toStudyCaseProgressResponse);
  }

  static async updateOnSubmissionPassed(
    userId: number,
    studyCaseId: number,
  ): Promise<void> {
    const now = new Date();

    await prisma.studyCaseProgress.upsert({
      where: { userId_studyCaseId: { userId, studyCaseId } },
      update: { isCompleted: true, completedAt: now },
      create: {
        userId,
        studyCaseId,
        isCompleted: true,
        isUnlocked: true,
        completedAt: now,
      },
    });

    const currentStudyCase = await prisma.studyCase.findUnique({
      where: { id: studyCaseId },
    });

    if (currentStudyCase) {
      const nextStudyCase = await prisma.studyCase.findFirst({
        where: {
          materialId: currentStudyCase.materialId,
          order: currentStudyCase.order + 1,
        },
      });

      if (nextStudyCase) {
        await prisma.studyCaseProgress.upsert({
          where: {
            userId_studyCaseId: { userId, studyCaseId: nextStudyCase.id },
          },
          update: { isUnlocked: true },
          create: { userId, studyCaseId: nextStudyCase.id, isUnlocked: true },
        });
      } else {
        await prisma.materialProgress.upsert({
          where: {
            userId_materialId: {
              userId,
              materialId: currentStudyCase.materialId,
            },
          },
          update: { isCompleted: true, completedAt: now },
          create: {
            userId,
            materialId: currentStudyCase.materialId,
            isCompleted: true,
            isUnlocked: true,
            completedAt: now,
          },
        });

        const currentMaterial = await prisma.material.findUnique({
          where: { id: currentStudyCase.materialId },
        });

        if (currentMaterial) {
          const nextMaterial = await prisma.material.findFirst({
            where: {
              conceptId: currentMaterial.conceptId,
              order: currentMaterial.order + 1,
            },
          });

          if (nextMaterial) {
            await prisma.materialProgress.upsert({
              where: {
                userId_materialId: { userId, materialId: nextMaterial.id },
              },
              update: { isUnlocked: true },
              create: { userId, materialId: nextMaterial.id, isUnlocked: true },
            });

            const firstStudyCase = await prisma.studyCase.findFirst({
              where: { materialId: nextMaterial.id },
              orderBy: { order: 'asc' },
            });

            if (firstStudyCase) {
              await prisma.studyCaseProgress.upsert({
                where: {
                  userId_studyCaseId: {
                    userId,
                    studyCaseId: firstStudyCase.id,
                  },
                },
                update: { isUnlocked: true },
                create: {
                  userId,
                  studyCaseId: firstStudyCase.id,
                  isUnlocked: true,
                },
              });
            }
          } else {
            await prisma.conceptProgress.upsert({
              where: {
                userId_conceptId: {
                  userId,
                  conceptId: currentMaterial.conceptId,
                },
              },
              update: { isCompleted: true, completedAt: now },
              create: {
                userId,
                conceptId: currentMaterial.conceptId,
                isCompleted: true,
                isUnlocked: true,
                completedAt: now,
              },
            });

            const currentConcept = await prisma.concept.findUnique({
              where: { id: currentMaterial.conceptId },
            });

            if (currentConcept) {
              const nextConcept = await prisma.concept.findFirst({
                where: { order: currentConcept.order + 1 },
              });

              if (nextConcept) {
                await prisma.conceptProgress.upsert({
                  where: {
                    userId_conceptId: { userId, conceptId: nextConcept.id },
                  },
                  update: { isUnlocked: true },
                  create: {
                    userId,
                    conceptId: nextConcept.id,
                    isUnlocked: true,
                  },
                });

                const firstMaterial = await prisma.material.findFirst({
                  where: { conceptId: nextConcept.id },
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
                    update: { isUnlocked: true },
                    create: {
                      userId,
                      materialId: firstMaterial.id,
                      isUnlocked: true,
                    },
                  });

                  const firstStudyCase = await prisma.studyCase.findFirst({
                    where: { materialId: firstMaterial.id },
                    orderBy: { order: 'asc' },
                  });

                  if (firstStudyCase) {
                    await prisma.studyCaseProgress.upsert({
                      where: {
                        userId_studyCaseId: {
                          userId,
                          studyCaseId: firstStudyCase.id,
                        },
                      },
                      update: { isUnlocked: true },
                      create: {
                        userId,
                        studyCaseId: firstStudyCase.id,
                        isUnlocked: true,
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
