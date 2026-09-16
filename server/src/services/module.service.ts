import { prisma } from '../applications/database';
import { Role } from '../../generated/prisma/enums';

import { ResponseError } from '../errors/response.error';

import { JwtPayload } from '../models/auth.model';
import {
  ModulePaginationRequest,
  ModulePaginationResponse,
  ModuleResponse,
  CreateModuleRequest,
  toModuleResponse,
  UpdateModuleRequest,
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
        orderBy: { [data.sortBy as string]: data.orderBy },
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
  ): Promise<ModuleResponse> {
    const isAdmin = user?.role === Role.ADMIN;

    const module = await prisma.module.findUnique({
      where: { slug, ...(!isAdmin && { isPublished: true }) },
    });

    if (!module) throw new ResponseError(404, 'Module not found');

    return toModuleResponse(module);
  }

  static async createModule(
    request: CreateModuleRequest,
  ): Promise<ModuleResponse> {
    const data = Validation.validate(ModuleValidation.CREATE, request);

    const [slugExists, orderExists] = await Promise.all([
      prisma.module.count({ where: { slug: data.slug } }),
      prisma.module.count({ where: { order: data.order } }),
    ]);

    if (slugExists) throw new ResponseError(400, 'Slug already exists');
    if (orderExists) throw new ResponseError(400, 'Order already exists');

    const module = await prisma.module.create({ data });

    return toModuleResponse(module);
  }

  static async updateModule(
    id: number,
    request: UpdateModuleRequest,
  ): Promise<ModuleResponse> {
    const data = Validation.validate(ModuleValidation.UPDATE, request);

    const exists = await prisma.module.findUnique({ where: { id } });

    if (!exists) throw new ResponseError(404, 'Module not found');

    if (data.slug) {
      const slugExists = await prisma.module.count({
        where: { slug: data.slug, NOT: { id } },
      });

      if (slugExists) throw new ResponseError(400, 'Slug already exists');
    }

    if (data.order) {
      const orderExists = await prisma.module.count({
        where: { order: data.order, NOT: { id } },
      });

      if (orderExists) throw new ResponseError(400, 'Order already exists');
    }

    const module = await prisma.module.update({ where: { id }, data });

    return toModuleResponse(module);
  }

  static async deleteModule(id: number): Promise<void> {
    const module = await prisma.module.findUnique({ where: { id } });

    if (!module) throw new ResponseError(404, 'Module not found');

    await prisma.module.delete({ where: { id } });
  }
}
