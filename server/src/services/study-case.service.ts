import { prisma } from '../applications/database';

import { ResponseError } from '../error/response.error';

import { Validation } from '../validations/validation';
import { PaginationValidation } from '../validations/pagination.validation';
import { StudyCaseValidation } from '../validations/study-case.validation';

import {
  CreateStudyCaseRequest,
  GetStudyCaseResponse,
  StudyCaseResponse,
  toStudyCaseResponse,
  UpdateStudyCaseRequest,
} from '../models/study-case.model';
import { PaginationRequest } from '../models/paginations.model';

export class StudyCaseService {
  static async getStudyCases(
    request: PaginationRequest,
  ): Promise<GetStudyCaseResponse> {
    const data = Validation.validate(PaginationValidation, request);

    const where = data.search
      ? {
          OR: [
            { title: { contains: data.search, mode: 'insensitive' as const } },
            {
              description: {
                contains: data.search,
                mode: 'insensitive' as const,
              },
            },
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

    const skip = (data.page - 1) * data.limit;

    const [studyCases, total] = await Promise.all([
      prisma.studyCase.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { id: 'asc' },
      }),
      prisma.studyCase.count({ where }),
    ]);

    return {
      data: studyCases.map(toStudyCaseResponse),
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    };
  }

  static async getStudyCaseById(id: number): Promise<StudyCaseResponse> {
    const studyCase = await prisma.studyCase.findFirst({
      where: { id, deletedAt: null },
    });

    if (!studyCase) throw new ResponseError(404, 'Study case not found');

    return toStudyCaseResponse(studyCase);
  }

  static async createStudyCase(
    request: CreateStudyCaseRequest,
  ): Promise<StudyCaseResponse> {
    const data = Validation.validate(StudyCaseValidation.CREATE, request);

    const material = await prisma.material.findFirst({
      where: { id: data.materialId, deletedAt: null },
    });

    if (!material) throw new ResponseError(404, 'Material not found');

    const countOrder = await prisma.studyCase.count({
      where: { order: data.order, materialId: data.materialId },
    });

    if (countOrder !== 0) throw new ResponseError(400, 'Order already exists');

    const studyCase = await prisma.studyCase.create({ data });

    return toStudyCaseResponse(studyCase);
  }

  static async updateStudyCase(
    id: number,
    request: UpdateStudyCaseRequest,
  ): Promise<StudyCaseResponse> {
    const data = Validation.validate(StudyCaseValidation.UPDATE, request);

    const exists = await prisma.studyCase.findFirst({
      where: { id, deletedAt: null },
    });

    if (!exists) throw new ResponseError(404, 'Study case not found');

    const material = await prisma.material.findFirst({
      where: { id: data.materialId, deletedAt: null },
    });

    if (!material) throw new ResponseError(404, 'Material not found');

    if (data.order && data.order !== exists.order) {
      const count = await prisma.studyCase.count({
        where: { order: data.order, NOT: { id } },
      });

      if (!count) throw new ResponseError(400, 'Order already exists');
    }

    const studyCase = await prisma.studyCase.update({
      where: { id },
      data,
    });

    return toStudyCaseResponse(studyCase);
  }

  static async deleteStudyCase(id: number): Promise<void> {
    const studyCase = await prisma.studyCase.findFirst({
      where: { id, deletedAt: null },
    });

    if (!studyCase) throw new ResponseError(404, 'Study case not found');

    await prisma.studyCase.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
