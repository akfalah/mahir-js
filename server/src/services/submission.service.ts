import {
  Role,
  SubmissionStatus,
  TestResultStatus,
} from '../../generated/prisma/enums';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { SubmissionValidation } from '../validations/submission.validation';

import { JwtPayload } from '../models/auth.model';
import {
  CreateSubmissionRequest,
  RunSubmissionResponse,
  SubmissionPaginationRequest,
  SubmissionPaginationResponse,
  SubmissionResponse,
  toSubmissionResponse,
} from '../models/submission.model';
import {
  TestResultResponse,
  toTestResultResponse,
} from '../models/test-result.model';

import { submissionQueue } from '../queues/submission.queue';

import { runSubmissionCode } from '../workers/submission.worker';

export class SubmissionService {
  static async getSubmissions(
    user: JwtPayload,
    request: SubmissionPaginationRequest,
  ): Promise<SubmissionPaginationResponse> {
    const data = Validation.validate(SubmissionValidation.GET, request);

    const where = {
      ...(user.role === Role.STUDENT && { userId: user.id }),
      ...(user.role === Role.ADMIN && data.userId && { userId: data.userId }),
      ...(data.studyCaseId && { studyCaseId: data.studyCaseId }),
      ...(data.status && { status: data.status }),
    };

    const skip = (data.page - 1) * data.limit;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { [data.sortBy as string]: data.orderBy },
      }),
      prisma.submission.count({ where }),
    ]);

    return {
      data: submissions.map(toSubmissionResponse),
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    };
  }

  static async getSubmissionById(
    user: JwtPayload,
    id: number,
  ): Promise<SubmissionResponse & { testResults: TestResultResponse[] }> {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { testResults: { orderBy: { id: 'asc' } } },
    });

    if (!submission) throw new ResponseError(404, 'Submission not found');

    if (user.role === Role.STUDENT && submission.userId !== user.id) {
      throw new ResponseError(403, 'Forbidden');
    }

    return {
      ...toSubmissionResponse(submission),
      testResults: submission.testResults.map(toTestResultResponse),
    };
  }

  static async runSubmission(
    user: JwtPayload,
    request: CreateSubmissionRequest,
  ): Promise<RunSubmissionResponse> {
    const data = Validation.validate(SubmissionValidation.CREATE, request);

    const studyCase = await prisma.studyCase.findUnique({
      where: { id: data.studyCaseId },
      include: {
        material: {
          include: {
            concept: true,
          },
        },
        testCases: {
          where: {
            isPublished: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!studyCase) {
      throw new ResponseError(404, 'Study case not found');
    }

    if (
      user.role === Role.STUDENT &&
      (!studyCase.isPublished ||
        !studyCase.material.isPublished ||
        !studyCase.material.concept.isPublished)
    ) {
      throw new ResponseError(404, 'Study case not found');
    }

    const testCaseInputs = studyCase.testCases.map((tc) => ({
      id: tc.id,
      description: tc.description,
      input: tc.input as Record<string, unknown>,
      expected: tc.expected as Record<string, unknown>,
    }));

    try {
      const results = await runSubmissionCode(
        data.code,
        studyCase.functionName ?? '',
        (studyCase.parameterNames as string[]) ?? [],
        testCaseInputs,
        studyCase.syntaxRules as Record<string, string[]> | null,
      );

      const allPassed = results.every(
        (result) => result.status === TestResultStatus.PASSED,
      );

      const hasError = results.some(
        (result) => result.status === TestResultStatus.ERROR,
      );

      const status = allPassed
        ? SubmissionStatus.PASSED
        : hasError
          ? SubmissionStatus.ERROR
          : SubmissionStatus.FAILED;

      return {
        status,
        errorMessage: null,
        testResults: results.map((result) => ({
          testCaseId: result.testCaseId,
          description: result.description,
          status: result.status,
          expected: result.expected,
          received: result.received,
          failureMessage: result.failureMessage,
        })),
      };
    } catch (e) {
      return {
        status: SubmissionStatus.ERROR,
        errorMessage: e instanceof Error ? e.message : 'Unknown error',
        testResults: testCaseInputs.map((testCase) => ({
          testCaseId: testCase.id,
          description: testCase.description,
          status: TestResultStatus.ERROR,
          expected: JSON.stringify(testCase.expected.result),
          received: null,
          failureMessage: e instanceof Error ? e.message : 'Unknown error',
        })),
      };
    }
  }

  static async createSubmission(
    user: JwtPayload,
    request: CreateSubmissionRequest,
  ): Promise<SubmissionResponse> {
    const data = Validation.validate(SubmissionValidation.CREATE, request);

    const studyCase = await prisma.studyCase.findUnique({
      where: { id: data.studyCaseId },
      include: {
        material: {
          include: {
            concept: true,
          },
        },
      },
    });

    if (!studyCase) {
      throw new ResponseError(404, 'Study case not found');
    }

    if (
      user.role === Role.STUDENT &&
      (!studyCase.isPublished ||
        !studyCase.material.isPublished ||
        !studyCase.material.concept.isPublished)
    ) {
      throw new ResponseError(404, 'Study case not found');
    }

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        studyCaseId: data.studyCaseId,
        code: data.code,
      },
    });

    await submissionQueue.add('execute', { submissionId: submission.id });

    return toSubmissionResponse(submission);
  }
}
