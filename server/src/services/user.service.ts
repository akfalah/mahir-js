import bcrypt from 'bcrypt';

import { prisma } from '../applications/database';

import { ResponseError } from '../error/response.error';

import { Validation } from '../validations/validation';
import { UserValidation } from '../validations/user.validation';
import { PaginationValidation } from '../validations/pagination.validation';

import {
  CreateUserRequest,
  GetUsersResponse,
  toUserResponse,
  UpdateUserRequest,
  UserResponse,
} from '../models/user.model';

import { PaginationRequest } from '../models/paginations.model';

export class UserService {
  static async getUsers(request: PaginationRequest): Promise<GetUsersResponse> {
    const data = Validation.validate(PaginationValidation, request);

    const where = data.search
      ? {
          OR: [
            { name: { contains: data.search, mode: 'insensitive' as const } },
            { email: { contains: data.search, mode: 'insensitive' as const } },
          ],
          deletedAt: null,
        }
      : { deletedAt: null };

    const skip = (data.page - 1) * data.limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users.map(toUserResponse),
      pagination: {
        page: data.page,
        limit: data.limit,
        total,
        totalPages: Math.ceil(total / data.limit),
      },
    };
  }

  static async getUserById(id: number): Promise<UserResponse> {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) throw new ResponseError(404, 'User not found');

    return toUserResponse(user);
  }

  static async createUser(request: CreateUserRequest): Promise<UserResponse> {
    const data = Validation.validate(UserValidation.CREATE, request);

    const count = await prisma.user.count({
      where: {
        email: data.email,
      },
    });

    if (count !== 0) {
      throw new ResponseError(400, 'Email already exists');
    }

    data.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: data,
    });

    return toUserResponse(user);
  }

  static async updateUser(
    id: number,
    request: UpdateUserRequest,
  ): Promise<UserResponse> {
    const data = Validation.validate(UserValidation.UPDATE, request);

    const exists = await prisma.user.findFirst({ where: { id, deletedAt: null} });

    if (!exists) throw new ResponseError(404, 'User not found');

    if (data.email) {
      const count = await prisma.user.count({
        where: { email: data.email, NOT: { id } },
      });

      if (count !== 0) throw new ResponseError(400, 'Email already exists');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return toUserResponse(user);
  }

  static async deleteUser(id: number): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) throw new ResponseError(404, 'User not found');

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
