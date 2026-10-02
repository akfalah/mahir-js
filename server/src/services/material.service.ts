import { Prisma } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { MaterialValidation } from '../validations/material.validation';

import { JwtPayload } from '../models/auth.model';
import { toModuleRefResponse } from '../models/module.model';
import {
  CreateMaterialRequest,
  MaterialDetailResponse,
  MaterialPaginationRequest,
  MaterialPaginationResponse,
  MaterialResponse,
  toMaterialDetailResponse,
  toMaterialResponse,
  UpdateMaterialRequest,
} from '../models/material.model';

import {
  getPlainTextFromHtml,
  sanitizeMaterialContent,
} from '../utils/sanitize-material-content';

export class MaterialService {
  static async getMaterials(
    user: JwtPayload | undefined,
    request: MaterialPaginationRequest,
  ): Promise<MaterialPaginationResponse> {
    const data = Validation.validate(MaterialValidation.GET, request);

    if (data.sortBy === 'order' && !data.moduleId) {
      throw new ResponseError(400, 'sortBy order requires moduleId filter');
    }
    const isAdmin = user?.role === Role.ADMIN;

    const where = {
      ...(!isAdmin && { isPublished: true }),
      ...(isAdmin &&
        data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.moduleId && { moduleId: data.moduleId }),
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

    const [materials, total] = await Promise.all([
      prisma.material.findMany({
        where,
        include: {
          module: {
            select: { id: true, slug: true, title: true, order: true },
          },
        },
        skip,
        take: data.limit,
        orderBy: {
          [data.sortBy as keyof Prisma.MaterialOrderByWithRelationInput]:
            data.orderBy,
        },
      }),
      prisma.material.count({ where }),
    ]);

    return {
      data: materials.map((material) =>
        toMaterialResponse(
          material,
          isAdmin ? toModuleRefResponse(material.module) : undefined,
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

  static async getMaterialBySlug(
    user: JwtPayload | undefined,
    slug: string,
  ): Promise<MaterialDetailResponse> {
    const isAdmin = user?.role === Role.ADMIN;

    const material = await prisma.material.findUnique({
      where: { slug, ...(!isAdmin && { isPublished: true }) },
      include: {
        module: {
          select: { id: true, slug: true, title: true, order: true },
        },
        exercises: {
          where: { ...(!isAdmin && { isPublished: true }) },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            materialId: true,
            slug: true,
            title: true,
            description: true,
            order: true,
            isPublished: true,
          },
        },
      },
    });

    if (!material) throw new ResponseError(404, 'Material not found');

    return toMaterialDetailResponse(material, isAdmin);
  }

  static async createMaterial(
    request: CreateMaterialRequest,
  ): Promise<MaterialResponse> {
    const data = Validation.validate(MaterialValidation.CREATE, request);

    const module = await prisma.module.findUnique({
      where: { id: data.moduleId },
    });

    if (!module) throw new ResponseError(404, 'Module not found');

    const cleanContent = sanitizeMaterialContent(data.content);
    const plainTextContent = getPlainTextFromHtml(cleanContent);

    if (plainTextContent.length < 3) {
      throw new ResponseError(400, 'Material content is too short.');
    }

    try {
      const material = await prisma.material.create({
        data: { ...data, content: cleanContent },
      });

      return toMaterialResponse(material);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        const target = e.meta?.target as string[] | undefined;

        if (target?.includes('slug')) {
          throw new ResponseError(400, 'Slug already exists');
        }

        if (target?.includes('order')) {
          throw new ResponseError(
            400,
            'Order already exists within this module',
          );
        }
      }

      throw e;
    }
  }

  static async updateMaterial(
    id: number,
    request: UpdateMaterialRequest,
  ): Promise<MaterialResponse> {
    const data = Validation.validate(MaterialValidation.UPDATE, request);

    const cleanContent =
      data.content !== undefined
        ? sanitizeMaterialContent(data.content)
        : undefined;

    if (cleanContent !== undefined) {
      const plainTextContent = getPlainTextFromHtml(cleanContent);

      if (plainTextContent.length < 3) {
        throw new ResponseError(400, 'Material content is too short.');
      }
    }

    try {
      const material = await prisma.material.update({
        where: { id },
        data: { ...data, content: cleanContent },
      });

      return toMaterialResponse(material);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025')
          throw new ResponseError(404, 'Material not found');

        if (e.code === 'P2002') {
          const target = e.meta?.target as string[] | undefined;

          if (target?.includes('slug')) {
            throw new ResponseError(400, 'Slug already exists');
          }
          
          if (target?.includes('order')) {
            throw new ResponseError(
              400,
              'Order already exists within this module',
            );
          }
        }
      }

      throw e;
    }
  }

  static async deleteMaterial(id: number): Promise<void> {
    try {
      await prisma.material.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new ResponseError(404, 'Material not found');
      }

      throw e;
    }
  }
}
