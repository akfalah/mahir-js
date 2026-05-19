import { prisma } from '../applications/database';

import { ResponseError } from '../error/response.error';

import { Validation } from '../validations/validation';
import { PaginationValidation } from '../validations/pagination.validation';
import { TestCaseValidation } from '../validations/test-case.validation';

import {
  CreateTestCaseRequest,
  GetTestCaseResponse,
  TestCaseResponse,
  toTestCaseResponse,
  UpdateTestCaseRequest,
} from '../models/test-case.model';
import { PaginationRequest } from '../models/paginations.model';

export class TestCaseService {
  static async getTestCases(
    request: PaginationRequest,
  ): Promise<GetTestCaseResponse> {
    const data = Validation.validate(PaginationValidation, request);

    const where = data.search
      ? {
          description: { contains: data.search, mode: 'insensitive' as const },
          deletedAt: null,
        }
      : { deletedAt: null };

    const skip = (data.page - 1) * data.limit;

    const [testCases, total] = await Promise.all([
      prisma.testCase.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { id: 'asc' },
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

  static async getTestCaseById(id: number): Promise<TestCaseResponse> {
    const testCase = await prisma.testCase.findFirst({
      where: { id, deletedAt: null },
    });

    if (!testCase) throw new ResponseError(404, 'Test case not found');

    return toTestCaseResponse(testCase);
  }

  static async createTestCase(
    request: CreateTestCaseRequest,
  ): Promise<TestCaseResponse> {
    const data = Validation.validate(TestCaseValidation.CREATE, request);

    const studyCase = await prisma.studyCase.findFirst({
      where: { id: data.studyCaseId, deletedAt: null },
    });

    if (!studyCase) throw new ResponseError(404, 'Study case not found');

    const countOrder = await prisma.testCase.count({
      where: { order: data.order, studyCaseId: data.studyCaseId },
    });

    if (countOrder !== 0) throw new ResponseError(400, 'Order already exists');

    const testCase = await prisma.testCase.create({ data });

    return toTestCaseResponse(testCase);
  }

  static async updateTestCase(
    id: number,
    request: UpdateTestCaseRequest,
  ): Promise<TestCaseResponse> {
    const data = Validation.validate(TestCaseValidation.UPDATE, request);

    const exists = await prisma.testCase.findFirst({
      where: { id, deletedAt: null },
    });

    if (!exists) throw new ResponseError(404, 'Test case not found');

    const studyCase = await prisma.studyCase.findFirst({
      where: { id: data.studyCaseId, deletedAt: null },
    });

    if (!studyCase) throw new ResponseError(404, 'Study case not found');

    if (data.order && data.order !== exists.order) {
      const count = await prisma.testCase.count({
        where: { order: data.order, NOT: { id } },
      });

      if (count !== 0) throw new ResponseError(400, 'Order already exists');
    }

    const testCase = await prisma.testCase.update({
      where: { id },
      data,
    });

    return toTestCaseResponse(testCase);
  }

  static async deleteTestCase(id: number): Promise<void> {
    const testCase = await prisma.testCase.findFirst({
      where: { id, deletedAt: null },
    });

    if (!testCase) throw new ResponseError(404, 'Test case not found');

    await prisma.testCase.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
