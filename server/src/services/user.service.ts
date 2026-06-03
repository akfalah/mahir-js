import bcrypt from 'bcrypt';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { UserValidation } from '../validations/user.validation';

import {
  CreateUserRequest,
  toUserResponse,
  UpdateUserRequest,
  UserPaginationRequest,
  UserPaginationResponse,
  UserResponse,
} from '../models/user.model';

export class UserService {
  static async getUsers(
    request: UserPaginationRequest,
  ): Promise<UserPaginationResponse> {
    const data = Validation.validate(UserValidation.GET, request);

    const where = {
      ...(data.role && { role: data.role }),
      ...(data.search && {
        OR: [
          { name: { contains: data.search, mode: 'insensitive' as const } },
          { email: { contains: data.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const skip = (data.page - 1) * data.limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: data.limit,
        orderBy: { [data.sortBy as string]: data.orderBy },
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
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) throw new ResponseError(404, 'User not found');

    return toUserResponse(user);
  }

  static async createUser(request: CreateUserRequest): Promise<UserResponse> {
    const data = Validation.validate(UserValidation.CREATE, request);

    const emailExists = await prisma.user.count({
      where: { email: data.email },
    });

    if (emailExists) {
      throw new ResponseError(400, 'Email already exists');
    }

    data.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({ data });

    return toUserResponse(user);
  }

  static async updateUser(
    id: number,
    request: UpdateUserRequest,
  ): Promise<UserResponse> {
    const data = Validation.validate(UserValidation.UPDATE, request);

    const exists = await prisma.user.findUnique({ where: { id } });

    if (!exists) throw new ResponseError(404, 'User not found');

    if (data.email) {
      const emailExists = await prisma.user.count({
        where: { email: data.email, NOT: { id } },
      });

      if (emailExists) throw new ResponseError(400, 'Email already exists');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({ where: { id }, data });

    return toUserResponse(user);
  }

  static async deleteUser(id: number): Promise<void> {
    const user = await prisma.user.findFirst({ where: { id } });

    if (!user) throw new ResponseError(404, 'User not found');

    await prisma.user.delete({
      where: { id },
    });
  }
}
