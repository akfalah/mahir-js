import { Prisma } from '../../generated/prisma/client';
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
import { toUserRefResponse } from '../models/user.model';
import { toExerciseRefResponse } from '../models/exercise.model';
import {
  CreateSubmissionRequest,
  RunSubmissionResponse,
  SubmissionDetailResponse,
  SubmissionPaginationRequest,
  SubmissionPaginationResponse,
  SubmissionResponse,
  toSubmissionDetailResponse,
  toSubmissionResponse,
} from '../models/submission.model';

import { gradeSubmissionCode } from '../utils/grade-exercise';
import { normalizeCodeForCompare } from '../utils/normalize-code-for-compare';

import { submissionQueue } from '../queues/submission.queue';

import { runSubmissionCode } from '../workers/submission.worker';

export class SubmissionService {
  static async getSubmissions(
    user: JwtPayload,
    request: SubmissionPaginationRequest,
  ): Promise<SubmissionPaginationResponse> {
    const data = Validation.validate(SubmissionValidation.GET, request);

    const isAdmin = user?.role === Role.ADMIN;

    const where = {
      userId: isAdmin ? data.userId : user.id,
      ...(data.exerciseId && { exerciseId: data.exerciseId }),
      ...(data.status && { status: data.status }),
    };

    const skip = (data.page - 1) * data.limit;

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
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
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        skip,
        take: data.limit,
        orderBy: {
          [data.sortBy as keyof Prisma.SubmissionOrderByWithRelationInput]:
            data.orderBy,
        },
      }),
      prisma.submission.count({ where }),
    ]);

    return {
      data: submissions.map((submission) =>
        toSubmissionResponse(
          submission,
          toExerciseRefResponse(submission.exercise),
          isAdmin ? toUserRefResponse(submission.user) : undefined,
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

  static async getSubmissionById(
    user: JwtPayload,
    id: number,
  ): Promise<SubmissionDetailResponse> {
    const isAdmin = user.role === Role.ADMIN;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        exercise: {
          select: {
            id: true,
            slug: true,
            title: true,
            order: true,
          },
        },
        testResults: true,
      },
    });

    if (!submission) throw new ResponseError(404, 'Submission not found');

    if (!isAdmin && submission.userId !== user.id) {
      throw new ResponseError(404, 'Submission not found');
    }

    return toSubmissionDetailResponse(
      submission,
      toExerciseRefResponse(submission.exercise),
    );
  }

  static async runSubmission(
    user: JwtPayload,
    request: CreateSubmissionRequest,
  ): Promise<RunSubmissionResponse> {
    const data = Validation.validate(SubmissionValidation.CREATE, request);

    const exercise = await prisma.exercise.findUnique({
      where: { id: data.exerciseId },
      include: {
        material: { include: { module: true } },
        testCases: {
          where: { isPublished: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!exercise) {
      throw new ResponseError(404, 'Exercise not found');
    }

    if (
      user.role === Role.STUDENT &&
      (!exercise.isPublished ||
        !exercise.material.isPublished ||
        !exercise.material.module.isPublished)
    ) {
      throw new ResponseError(404, 'Exercise not found');
    }

    try {
      const { status, results } = await gradeSubmissionCode(
        data.code,
        exercise,
        exercise.testCases,
      );

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
        testResults: exercise.testCases.map((testCase) => ({
          testCaseId: testCase.id,
          description: testCase.description,
          status: TestResultStatus.ERROR,
          expected: JSON.stringify(
            (testCase.expected as Record<string, unknown>).result,
          ),
          received: null,
          failureMessage: e instanceof Error ? e.message : 'Unknown Error',
        })),
      };
    }
  }

  static async createSubmission(
    user: JwtPayload,
    request: CreateSubmissionRequest,
  ): Promise<SubmissionResponse> {
    const data = Validation.validate(SubmissionValidation.CREATE, request);

    const exercise = await prisma.exercise.findUnique({
      where: { id: data.exerciseId },
      include: {
        material: {
          include: {
            module: true,
          },
        },
      },
    });

    if (!exercise) {
      throw new ResponseError(404, 'Exercise not found');
    }

    if (
      user.role === Role.STUDENT &&
      (!exercise.isPublished ||
        !exercise.material.isPublished ||
        !exercise.material.module.isPublished)
    ) {
      throw new ResponseError(404, 'Exercise not found');
    }

    const latestPassedSubmission = await prisma.submission.findFirst({
      where: {
        userId: user.id,
        exerciseId: data.exerciseId,
        status: 'PASSED',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (
      latestPassedSubmission &&
      normalizeCodeForCompare(latestPassedSubmission.code) ===
        normalizeCodeForCompare(data.code)
    ) {
      throw new ResponseError(
        409,
        'This solution has already passed and been saved.',
      );
    }

    const submission = await prisma.submission.create({
      data: {
        userId: user.id,
        exerciseId: data.exerciseId,
        code: data.code,
      },
    });

    await submissionQueue.add('execute', { submissionId: submission.id });

    return toSubmissionResponse(submission);
  }
}
