import { prisma } from '../applications/database';

import { ResponseError } from '../error/response.error';

import { Validation } from '../validations/validation';
import { PaginationValidation } from '../validations/pagination.validation';
import { MaterialValidation } from '../validations/material.validation';

import {
  CreateMaterialRequest,
  GetMaterialResponse,
  MaterialResponse,
  toMaterialResponse,
  UpdateMaterialRequest,
} from '../models/material.model';
import { PaginationRequest } from '../models/paginations.model';

export class MaterialService {
  static async getMaterials(
    request: PaginationRequest,
  ): Promise<GetMaterialResponse> {
    const data = Validation.validate(PaginationValidation, request);

    const where = data.search
      ? {
          OR: [
            { title: { contains: data.search, mode: 'insensitive' as const } },
            {
              content: { contains: data.search, mode: 'insensitive' as const },
            },
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

    const skip = (data.page - 1) * data.limit;

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { id: 'asc' },
      }),
      prisma.material.count({ where }),
    ]);

    return {
      data: materials.map(toMaterialResponse),
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    };
  }

  static async getMaterialById(id: number): Promise<MaterialResponse> {
    const material = await prisma.material.findFirst({
      where: { id, deletedAt: null },
    });

    if (!material) throw new ResponseError(404, 'Material not found');

    return toMaterialResponse(material);
  }

  static async createMaterial(
    request: CreateMaterialRequest,
  ): Promise<MaterialResponse> {
    const data = Validation.validate(MaterialValidation.CREATE, request);

    const concept = await prisma.concept.findFirst({
      where: { id: data.conceptId, deletedAt: null },
    });

    if (!concept) throw new ResponseError(404, 'Concept not found');

    const [countSlug, countOrder] = await Promise.all([
      prisma.material.count({
        where: { slug: data.slug, conceptId: data.conceptId },
      }),
      prisma.material.count({
        where: { order: data.order, conceptId: data.conceptId },
      }),
    ]);

    if (countSlug !== 0) throw new ResponseError(400, 'Slug already exists');
    if (countOrder !== 0) throw new ResponseError(400, 'Order already exists');

    const material = await prisma.material.create({ data });

    return toMaterialResponse(material);
  }

  static async updateMaterial(
    id: number,
    request: UpdateMaterialRequest,
  ): Promise<MaterialResponse> {
    const data = Validation.validate(MaterialValidation.UPDATE, request);

    const exists = await prisma.material.findFirst({
      where: { id, deletedAt: null },
    });

    if (!exists) throw new ResponseError(404, 'Material not found');

    const concept = await prisma.concept.findFirst({
      where: { id: data.conceptId, deletedAt: null },
    });

    if (!concept) throw new ResponseError(404, 'Concept not found');

    if (data.slug && data.slug !== exists.slug) {
      const count = await prisma.material.count({
        where: { slug: data.slug, NOT: { id } },
      });

      if (!count) throw new ResponseError(400, 'Slug already exists');
    }

    if (data.order && data.order !== exists.order) {
      const count = await prisma.material.count({
        where: { order: data.order, NOT: { id } },
      });

      if (!count) throw new ResponseError(400, 'Order already exists');
    }

    const material = await prisma.material.update({
      where: { id },
      data,
    });

    return toMaterialResponse(material);
  }

  static async deleteMaterial(id: number): Promise<void> {
    const material = await prisma.material.findFirst({
      where: { id, deletedAt: null },
    });

    if (!material) throw new ResponseError(404, 'Material not found');

    await prisma.material.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
