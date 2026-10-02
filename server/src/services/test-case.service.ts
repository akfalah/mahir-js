import { Prisma } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { TestCaseValidation } from '../validations/test-case.validation';

import { JwtPayload } from '../models/auth.model';
import { toExerciseRefResponse } from '../models/exercise.model';
import {
  CreateTestCaseRequest,
  TestCasePaginationRequest,
  TestCasePaginationResponse,
  TestCaseResponse,
  toTestCaseResponse,
  UpdateTestCaseRequest,
} from '../models/test-case.model';

export class TestCaseService {
  static async getTestCases(
    user: JwtPayload | undefined,
    request: TestCasePaginationRequest,
  ): Promise<TestCasePaginationResponse> {
    const data = Validation.validate(TestCaseValidation.GET, request);

    if (data.sortBy === 'order' && !data.exerciseId) {
      throw new ResponseError(400, 'sortBy order requires exerciseId filter');
    }

    const isAdmin = user?.role === Role.ADMIN;

    const where = {
      ...(!isAdmin && { isPublished: true }),
      ...(isAdmin &&
        data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.exerciseId && { exerciseId: data.exerciseId }),
      ...(data.search && {
        description: { contains: data.search, mode: 'insensitive' as const },
      }),
    };

    const skip = (data.page - 1) * data.limit;

    const [testCases, total] = await Promise.all([
      prisma.testCase.findMany({
        where,
        include: {
          exercise: {
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
          [data.sortBy as keyof Prisma.TestCaseOrderByWithRelationInput]:
            data.orderBy,
        },
      }),
      prisma.testCase.count({ where }),
    ]);

    return {
      data: testCases.map((testCase) =>
        toTestCaseResponse(
          testCase,
          isAdmin ? toExerciseRefResponse(testCase.exercise) : undefined,
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

  static async getTestCaseById(
    user: JwtPayload | undefined,
    id: number,
  ): Promise<TestCaseResponse> {
    const isAdmin = user?.role === Role.ADMIN;

    const testCase = await prisma.testCase.findUnique({
      where: { id, ...(!isAdmin && { isPublished: true }) },
      include: {
        exercise: {
          select: {
            id: true,
            slug: true,
            title: true,
            order: true,
          },
        },
      },
    });

    if (!testCase) throw new ResponseError(404, 'Test case not found');

    return toTestCaseResponse(
      testCase,
      toExerciseRefResponse(testCase.exercise),
    );
  }

  static async createTestCase(
    request: CreateTestCaseRequest,
  ): Promise<TestCaseResponse> {
    const data = Validation.validate(TestCaseValidation.CREATE, request);

    const exercise = await prisma.exercise.findUnique({
      where: { id: data.exerciseId },
    });

    if (!exercise) throw new ResponseError(404, 'Exercise not found');

    try {
      const testCase = await prisma.testCase.create({
        data: {
          ...data,
          input: data.input as Prisma.InputJsonValue,
          expected: data.expected as Prisma.InputJsonValue,
        },
      });

      return toTestCaseResponse(testCase);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const target = e.meta?.target as string[] | undefined;

        if (target?.includes('order')) {
          throw new ResponseError(
            400,
            'Order already exists within this exercise',
          );
        }
      }

      throw e;
    }
  }

  static async updateTestCase(
    id: number,
    request: UpdateTestCaseRequest,
  ): Promise<TestCaseResponse> {
    const data = Validation.validate(TestCaseValidation.UPDATE, request);

    try {
      const testCase = await prisma.testCase.update({
        where: { id },
        data: {
          ...data,
          input: data.input as Prisma.InputJsonValue,
          expected: data.expected as Prisma.InputJsonValue,
        },
      });

      return toTestCaseResponse(testCase);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025')
          throw new ResponseError(404, 'Test case not found');

        if (e.code === 'P2002') {
          const target = e.meta?.target as string[] | undefined;

          if (target?.includes('order')) {
            throw new ResponseError(
              400,
              'Order already exists within this exercise',
            );
          }
        }
      }

      throw e;
    }
  }

  static async deleteTestCase(id: number): Promise<void> {
    try {
      await prisma.testCase.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new ResponseError(404, 'Test case not found');
      }

      throw e;
    }
  }
}
