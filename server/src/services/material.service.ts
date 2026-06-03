import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { MaterialValidation } from '../validations/material.validation';

import {
  CreateMaterialRequest,
  MaterialPaginationRequest,
  MaterialPaginationResponse,
  MaterialResponse,
  toMaterialResponse,
  UpdateMaterialRequest,
} from '../models/material.model';

export class MaterialService {
  static async getMaterials(
    request: MaterialPaginationRequest,
  ): Promise<MaterialPaginationResponse> {
    const data = Validation.validate(MaterialValidation.GET, request);

    if (data.sortBy === 'order' && !data.conceptId) {
      throw new ResponseError(400, 'sortBy order requires conceptId filter');
    }

    const where = {
      ...(data.conceptId && { conceptId: data.conceptId }),
      ...(data.search && {
        OR: [
          { title: { contains: data.search, mode: 'insensitive' as const } },
          { content: { contains: data.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const skip = (data.page - 1) * data.limit;

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { [data.sortBy as string]: data.orderBy },
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
    const material = await prisma.material.findUnique({ where: { id } });

    if (!material) throw new ResponseError(404, 'Material not found');

    return toMaterialResponse(material);
  }

  static async createMaterial(
    request: CreateMaterialRequest,
  ): Promise<MaterialResponse> {
    const data = Validation.validate(MaterialValidation.CREATE, request);

    const concept = await prisma.concept.findUnique({
      where: { id: data.conceptId },
    });

    if (!concept) throw new ResponseError(404, 'Concept not found');

    const [slugExists, orderExists] = await Promise.all([
      prisma.material.count({
        where: { conceptId: data.conceptId, slug: data.slug },
      }),
      prisma.material.count({
        where: { conceptId: data.conceptId, order: data.order },
      }),
    ]);

    if (slugExists) throw new ResponseError(400, 'Slug already exists');
    if (orderExists) throw new ResponseError(400, 'Order already exists');

    const material = await prisma.material.create({ data });

    return toMaterialResponse(material);
  }

  static async updateMaterial(
    id: number,
    request: UpdateMaterialRequest,
  ): Promise<MaterialResponse> {
    const data = Validation.validate(MaterialValidation.UPDATE, request);

    const exists = await prisma.material.findUnique({ where: { id } });

    if (!exists) throw new ResponseError(404, 'Material not found');

    if (data.slug) {
      const slugExists = await prisma.material.count({
        where: { slug: data.slug, NOT: { id } },
      });

      if (slugExists) throw new ResponseError(400, 'Slug already exists');
    }

    if (data.order) {
      const orderExists = await prisma.material.count({
        where: { conceptId: exists.conceptId, order: data.order, NOT: { id } },
      });

      if (orderExists) throw new ResponseError(400, 'Order already exists');
    }

    const material = await prisma.material.update({ where: { id }, data });

    return toMaterialResponse(material);
  }

  static async deleteMaterial(id: number): Promise<void> {
    const material = await prisma.material.findUnique({ where: { id } });

    if (!material) throw new ResponseError(404, 'Material not found');

    await prisma.material.delete({ where: { id } });
  }
}
