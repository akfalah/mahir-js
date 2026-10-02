import { Prisma } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { JwtPayload } from '../models/auth.model';
import {
  ModulePaginationRequest,
  ModulePaginationResponse,
  ModuleResponse,
  CreateModuleRequest,
  toModuleResponse,
  UpdateModuleRequest,
  toModuleDetailResponse,
  ModuleDetailResponse,
} from '../models/module.model';

import { Validation } from '../validations/validation';
import { ModuleValidation } from '../validations/module.validation';

export class ModuleService {
  static async getModules(
    user: JwtPayload | undefined,
    request: ModulePaginationRequest,
  ): Promise<ModulePaginationResponse> {
    const data = Validation.validate(ModuleValidation.GET, request);

    const isAdmin = user?.role === Role.ADMIN;

    const where = {
      ...(!isAdmin && { isPublished: true }),
      ...(isAdmin &&
        data.isPublished !== undefined && { isPublished: data.isPublished }),
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

    const [modules, total] = await Promise.all([
      prisma.module.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: {
          [data.sortBy as keyof Prisma.ModuleOrderByWithRelationInput]:
            data.orderBy,
        },
      }),
      prisma.module.count({ where }),
    ]);

    return {
      data: modules.map(toModuleResponse),
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    };
  }

  static async getModuleBySlug(
    user: JwtPayload | undefined,
    slug: string,
  ): Promise<ModuleDetailResponse> {
    const isAdmin = user?.role === Role.ADMIN;

    const module = await prisma.module.findUnique({
      where: { slug, ...(!isAdmin && { isPublished: true }) },
      include: {
        materials: {
          where: { ...(!isAdmin && { isPublished: true }) },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            moduleId: true,
            slug: true,
            title: true,
            description: true,
            order: true,
            isPublished: true,
          },
        },
      },
    });

    if (!module) throw new ResponseError(404, 'Module not found');

    return toModuleDetailResponse(module, isAdmin);
  }

  static async createModule(
    request: CreateModuleRequest,
  ): Promise<ModuleResponse> {
    const data = Validation.validate(ModuleValidation.CREATE, request);

    try {
      const module = await prisma.module.create({ data });
      return toModuleResponse(module);
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
          throw new ResponseError(400, 'Order already exists');
        }
      }

      throw e;
    }
  }

  static async updateModule(
    id: number,
    request: UpdateModuleRequest,
  ): Promise<ModuleResponse> {
    const data = Validation.validate(ModuleValidation.UPDATE, request);

    try {
      const module = await prisma.module.update({ where: { id }, data });
      return toModuleResponse(module);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025')
          throw new ResponseError(404, 'Module not found');

        if (e.code === 'P2002') {
          const target = e.meta?.target as string[] | undefined;

          if (target?.includes('slug')) {
            throw new ResponseError(400, 'Slug already exists');
          }
          if (target?.includes('order')) {
            throw new ResponseError(400, 'Order already exists');
          }
        }
      }

      throw e;
    }
  }

  static async deleteModule(id: number): Promise<void> {
    try {
      await prisma.module.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new ResponseError(404, 'Module not found');
      }

      throw e;
    }
  }
}
