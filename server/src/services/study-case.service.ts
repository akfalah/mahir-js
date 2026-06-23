import { prisma } from '../applications/database';
import { Role } from '../../generated/prisma/enums';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { StudyCaseValidation } from '../validations/study-case.validation';

import { JwtPayload } from '../models/auth.model';
import {
  CreateStudyCaseRequest,
  StudyCasePaginationRequest,
  StudyCasePaginationResponse,
  StudyCaseResponse,
  toStudyCaseResponse,
  UpdateStudyCaseRequest,
} from '../models/study-case.model';

export class StudyCaseService {
  static async getStudyCases(
    user: JwtPayload | undefined,
    request: StudyCasePaginationRequest,
  ): Promise<StudyCasePaginationResponse> {
    const data = Validation.validate(StudyCaseValidation.GET, request);

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
        ],
      }),
    };

    const skip = (data.page - 1) * data.limit;

    const [studyCases, total] = await Promise.all([
      prisma.studyCase.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { [data.sortBy as string]: data.orderBy },
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

  static async getStudyCaseBySlug(
    user: JwtPayload | undefined,
    slug: string,
  ): Promise<StudyCaseResponse> {
    const isAdmin = user?.role === Role.ADMIN;

    const studyCase = await prisma.studyCase.findUnique({
      where: { slug, ...(!isAdmin && { isPublished: true }) },
    });

    if (!studyCase) throw new ResponseError(404, 'Study case not found');

    return toStudyCaseResponse(studyCase);
  }

  static async createStudyCase(
    request: CreateStudyCaseRequest,
  ): Promise<StudyCaseResponse> {
    const data = Validation.validate(StudyCaseValidation.CREATE, request);

    const material = await prisma.material.findUnique({
      where: { id: data.materialId },
    });

    if (!material) throw new ResponseError(404, 'Material not found');

    const [slugExists, orderExists] = await Promise.all([
      prisma.studyCase.count({ where: { slug: data.slug } }),
      prisma.studyCase.count({
        where: { materialId: data.materialId, order: data.order },
      }),
    ]);

    if (slugExists) throw new ResponseError(400, 'Slug already exists');
    if (orderExists) throw new ResponseError(400, 'Order already exists');

    const studyCase = await prisma.studyCase.create({ data });

    return toStudyCaseResponse(studyCase);
  }

  static async updateStudyCase(
    id: number,
    request: UpdateStudyCaseRequest,
  ): Promise<StudyCaseResponse> {
    const data = Validation.validate(StudyCaseValidation.UPDATE, request);

    const exists = await prisma.studyCase.findUnique({ where: { id } });

    if (!exists) throw new ResponseError(404, 'Study case not found');

    const [slugExists, orderExists] = await Promise.all([
      prisma.studyCase.count({ where: { slug: data.slug, NOT: { id } } }),
      prisma.studyCase.count({
        where: {
          materialId: exists.materialId,
          order: data.order,
          NOT: { id },
        },
      }),
    ]);

    if (slugExists) throw new ResponseError(400, 'Slug already exists');
    if (orderExists) throw new ResponseError(400, 'Order already exists');

    const studyCase = await prisma.studyCase.update({ where: { id }, data });

    return toStudyCaseResponse(studyCase);
  }

  static async deleteStudyCase(id: number): Promise<void> {
    const studyCase = await prisma.studyCase.findUnique({ where: { id } });

    if (!studyCase) throw new ResponseError(404, 'Study case not found');

    await prisma.studyCase.delete({ where: { id } });
  }
}
