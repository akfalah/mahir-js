import { Prisma } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { TestCaseValidation } from '../validations/test-case.validation';

import { JwtPayload } from '../models/auth.model';
import {
  CreateTestCaseRequest,
  TestCasePaginationRequest,
  TestCasePaginationResponse,
  testCaseRelationInclude,
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

    if (data.sortBy === 'order' && !data.studyCaseId) {
      throw new ResponseError(400, 'sortBy order requires studyCaseId filter');
    }

    const isAdmin = user?.role === Role.ADMIN;

    const where = {
      ...(!isAdmin && { isPublished: true }),
      ...(isAdmin &&
        data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.studyCaseId && { studyCaseId: data.studyCaseId }),
      ...(data.search && {
        description: { contains: data.search, mode: 'insensitive' as const },
      }),
    };

    const skip = (data.page - 1) * data.limit;

    const [testCases, total] = await Promise.all([
      prisma.testCase.findMany({
        where,
        include: testCaseRelationInclude,
        skip,
        take: data.limit,
        orderBy: { [data.sortBy as string]: data.orderBy },
      }),
      prisma.testCase.count({ where }),
    ]);

    return {
      data: testCases.map(toTestCaseResponse),
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
      include: testCaseRelationInclude,
    });

    if (!testCase) throw new ResponseError(404, 'Test case not found');

    return toTestCaseResponse(testCase);
  }

  static async createTestCase(
    request: CreateTestCaseRequest,
  ): Promise<TestCaseResponse> {
    const data = Validation.validate(TestCaseValidation.CREATE, request);

    const studyCase = await prisma.studyCase.findUnique({
      where: { id: data.studyCaseId },
    });

    if (!studyCase) throw new ResponseError(404, 'Study case not found');

    const orderExists = await prisma.testCase.count({
      where: { studyCaseId: data.studyCaseId, order: data.order },
    });

    if (orderExists) throw new ResponseError(400, 'Order already exists');

    const testCase = await prisma.testCase.create({
      data: {
        ...data,
        input: data.input as Prisma.InputJsonValue,
        expected: data.expected as Prisma.InputJsonValue,
      },
    });

    return toTestCaseResponse(testCase);
  }

  static async updateTestCase(
    id: number,
    request: UpdateTestCaseRequest,
  ): Promise<TestCaseResponse> {
    const data = Validation.validate(TestCaseValidation.UPDATE, request);

    const exists = await prisma.testCase.findUnique({ where: { id } });

    if (!exists) throw new ResponseError(404, 'Test case not found');

    if (data.order) {
      const orderExists = await prisma.testCase.count({
        where: {
          studyCaseId: exists.studyCaseId,
          order: data.order,
          NOT: { id },
        },
      });

      if (orderExists) throw new ResponseError(400, 'Order already exists');
    }

    const testCase = await prisma.testCase.update({
      where: { id },
      data: {
        ...(data.description && { description: data.description }),
        ...(data.order && { order: data.order }),
        ...(data.isPublished !== undefined && {
          isPublished: data.isPublished,
        }),
        ...(data.input && { input: data.input as Prisma.InputJsonValue }),
        ...(data.expected && {
          expected: data.expected as Prisma.InputJsonValue,
        }),
      },
    });

    return toTestCaseResponse(testCase);
  }

  static async deleteTestCase(id: number): Promise<void> {
    const testCase = await prisma.testCase.findUnique({ where: { id } });

    if (!testCase) throw new ResponseError(404, 'Test case not found');

    await prisma.testCase.delete({ where: { id } });
  }
}
