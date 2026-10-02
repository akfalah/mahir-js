import { Prisma } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { ExerciseValidation } from '../validations/exercise.validation';

import { JwtPayload } from '../models/auth.model';
import { toMaterialRefResponse } from '../models/material.model';
import {
  CreateExerciseRequest,
  ExerciseDetailResponse,
  ExercisePaginationRequest,
  ExercisePaginationResponse,
  ExerciseResponse,
  toExerciseDetailResponse,
  toExerciseResponse,
  UpdateExerciseRequest,
} from '../models/exercise.model';

export class ExerciseService {
  static async getExercises(
    user: JwtPayload | undefined,
    request: ExercisePaginationRequest,
  ): Promise<ExercisePaginationResponse> {
    const data = Validation.validate(ExerciseValidation.GET, request);

    if (data.sortBy === 'order' && !data.materialId) {
      throw new ResponseError(400, 'sortBy order requires materialId filter');
    }

    const isAdmin = user?.role === Role.ADMIN;

    const where = {
      ...(!isAdmin && { isPublished: true }),
      ...(isAdmin &&
        data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.materialId && { materialId: data.materialId }),
      ...(data.search && {
        OR: [
          { title: { contains: data.search, mode: 'insensitive' as const } },
          {
            description: {
              contains: data.search,
              mode: 'insensitive' as const,
            },
          },
          {
            functionName: {
              contains: data.search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };

    const skip = (data.page - 1) * data.limit;

    const [exercises, total] = await Promise.all([
      prisma.exercise.findMany({
        where,
        include: {
          material: {
            select: {
              id: true,
              slug: true,
              title: true,
              order: true,
            },
          },
        },
        skip,
        take: data.limit,
        orderBy: {
          [data.sortBy as keyof Prisma.ExerciseOrderByWithRelationInput]:
            data.orderBy,
        },
      }),
      prisma.exercise.count({ where }),
    ]);

    return {
      data: exercises.map((exercise) =>
        toExerciseResponse(
          exercise,
          isAdmin ? toMaterialRefResponse(exercise.material) : undefined,
        ),
      ),
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    };
  }

  static async getExerciseBySlug(
    user: JwtPayload | undefined,
    slug: string,
  ): Promise<ExerciseDetailResponse> {
    const isAdmin = user?.role === Role.ADMIN;

    const exercise = await prisma.exercise.findUnique({
      where: { slug, ...(!isAdmin && { isPublished: true }) },
      include: {
        material: {
          select: {
            id: true,
            slug: true,
            title: true,
            order: true,
          },
        },
        testCases: {
          where: { ...(!isAdmin && { isPublished: true }) },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            exerciseId: true,
            description: true,
            order: true,
            isPublished: true,
          },
        },
      },
    });

    if (!exercise) throw new ResponseError(404, 'Exercise not found');

    return toExerciseDetailResponse(exercise, isAdmin);
  }

  static async createExercise(
    request: CreateExerciseRequest,
  ): Promise<ExerciseResponse> {
    const data = Validation.validate(ExerciseValidation.CREATE, request);

    const material = await prisma.material.findUnique({
      where: { id: data.materialId },
    });

    if (!material) throw new ResponseError(404, 'Material not found');

    try {
      const exercise = await prisma.exercise.create({ data });

      return toExerciseResponse(exercise);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const target = e.meta?.target as string[] | undefined;

        if (target?.includes('slug')) {
          throw new ResponseError(400, 'Slug already exists');
        }

        if (target?.includes('order')) {
          throw new ResponseError(
            400,
            'Order already exists within this material',
          );
        }
      }

      throw e;
    }
  }

  static async updateExercise(
    id: number,
    request: UpdateExerciseRequest,
  ): Promise<ExerciseResponse> {
    const data = Validation.validate(ExerciseValidation.UPDATE, request);

    try {
      const exercise = await prisma.exercise.update({ where: { id }, data });

      return toExerciseResponse(exercise);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025')
          throw new ResponseError(404, 'Exercise not found');

        if (e.code === 'P2002') {
          const target = e.meta?.target as string[] | undefined;

          if (target?.includes('slug')) {
            throw new ResponseError(400, 'Slug already exists');
          }
          
          if (target?.includes('order')) {
            throw new ResponseError(
              400,
              'Order already exists within this material',
            );
          }
        }
      }

      throw e;
    }
  }

  static async deleteExercise(id: number): Promise<void> {
    try {
      await prisma.exercise.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new ResponseError(404, 'Exercise not found');
      }

      throw e;
    }
  }
}
