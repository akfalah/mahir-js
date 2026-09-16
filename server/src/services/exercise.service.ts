import { prisma } from '../applications/database';
import { Role } from '../../generated/prisma/enums';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { ExerciseValidation } from '../validations/exercise.validation';

import { JwtPayload } from '../models/auth.model';
import {
  CreateExerciseRequest,
  ExercisePaginationRequest,
  ExercisePaginationResponse,
  ExerciseRelationInclude,
  ExerciseResponse,
  toExerciseeResponse,
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
        include: ExerciseRelationInclude,
        skip,
        take: data.limit,
        orderBy: { [data.sortBy as string]: data.orderBy },
      }),
      prisma.exercise.count({ where }),
    ]);

    return {
      data: exercises.map(toExerciseeResponse),
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
  ): Promise<ExerciseResponse> {
    const isAdmin = user?.role === Role.ADMIN;

    const exercise = await prisma.exercise.findUnique({
      where: { slug, ...(!isAdmin && { isPublished: true }) },
      include: ExerciseRelationInclude,
    });

    if (!exercise) throw new ResponseError(404, 'Exercise not found');

    return toExerciseeResponse(exercise);
  }

  static async createExercise(
    request: CreateExerciseRequest,
  ): Promise<ExerciseResponse> {
    const data = Validation.validate(ExerciseValidation.CREATE, request);

    const material = await prisma.material.findUnique({
      where: { id: data.materialId },
    });

    if (!material) throw new ResponseError(404, 'Material not found');

    const [slugExists, orderExists] = await Promise.all([
      prisma.exercise.count({ where: { slug: data.slug } }),
      prisma.exercise.count({
        where: { materialId: data.materialId, order: data.order },
      }),
    ]);

    if (slugExists) throw new ResponseError(400, 'Slug already exists');
    if (orderExists) throw new ResponseError(400, 'Order already exists');

    const exercise = await prisma.exercise.create({ data });

    return toExerciseeResponse(exercise);
  }

  static async updateExercise(
    id: number,
    request: UpdateExerciseRequest,
  ): Promise<ExerciseResponse> {
    const data = Validation.validate(ExerciseValidation.UPDATE, request);

    const exists = await prisma.exercise.findUnique({ where: { id } });

    if (!exists) throw new ResponseError(404, 'Exercise not found');

    if (data.slug) {
      const slugExists = await prisma.exercise.count({
        where: { slug: data.slug, NOT: { id } },
      });

      if (slugExists) throw new ResponseError(400, 'Slug already exists');
    }

    if (data.order) {
      const orderExists = await prisma.exercise.count({
        where: {
          materialId: exists.materialId,
          order: data.order,
          NOT: { id },
        },
      });

      if (orderExists) throw new ResponseError(400, 'Order already exists');
    }

    const exercise = await prisma.exercise.update({ where: { id }, data });

    return toExerciseeResponse(exercise);
  }

  static async deleteExercise(id: number): Promise<void> {
    const exercise = await prisma.exercise.findUnique({ where: { id } });

    if (!exercise) throw new ResponseError(404, 'Exercise not found');

    await prisma.exercise.delete({ where: { id } });
  }
}
