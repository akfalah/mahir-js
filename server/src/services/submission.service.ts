import { Role } from '../../generated/prisma/enums';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { SubmissionValidation } from '../validations/submission.validation';

import { JwtPayload } from '../models/auth.model';
import {
  CreateSubmissionRequest,
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
      include: { testResults: true },
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

  static async createSubmission(
    user: JwtPayload,
    request: CreateSubmissionRequest,
  ): Promise<SubmissionResponse> {
    const data = Validation.validate(SubmissionValidation.CREATE, request);

    const studyCase = await prisma.studyCase.findUnique({
      where: { id: data.studyCaseId },
    });

    if (!studyCase) throw new ResponseError(404, 'Study case not found');

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
