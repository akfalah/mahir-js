import bcrypt from 'bcrypt';

import { Prisma } from '../../generated/prisma/client';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { UserValidation } from '../validations/user.validation';

import { JwtPayload } from '../models/auth.model';
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
        orderBy: {
          [data.sortBy as keyof Prisma.UserOrderByWithRelationInput]:
            data.orderBy,
        },
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

    data.password = await bcrypt.hash(data.password, 10);

    try {
      const user = await prisma.user.create({ data });

      return toUserResponse(user);
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        throw new ResponseError(400, 'Email already exists');
      }

      throw e;
    }
  }

  static async updateUser(
    id: number,
    actingUser: JwtPayload,
    request: UpdateUserRequest,
  ): Promise<UserResponse> {
    const data = Validation.validate(UserValidation.UPDATE, request);

    if (id === actingUser.id && data.role && data.role !== actingUser.role) {
      throw new ResponseError(400, 'You cannot change your own role');
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    try {
      const user = await prisma.user.update({ where: { id }, data });

      return toUserResponse(user);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') throw new ResponseError(404, 'User not found');

        if (e.code === 'P2002') {
          throw new ResponseError(400, 'Email already exists');
        }
      }

      throw e;
    }
  }

  static async deleteUser(id: number, actingUser: JwtPayload): Promise<void> {
    if (id === actingUser.id) {
      throw new ResponseError(400, 'You cannot delete your own account');
    }

    try {
      await prisma.user.delete({ where: { id } });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new ResponseError(404, 'User not found');
      }

      throw e;
    }
  }
}
