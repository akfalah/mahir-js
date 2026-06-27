import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { prisma } from '../applications/database';

import { ResponseError } from '../errors/response.error';

import { Validation } from '../validations/validation';
import { AuthValidation } from '../validations/auth.validation';

import {
  AuthResponse,
  JwtPayload,
  SignInRequest,
  SignUpRequest,
  UpdatePasswordRequest,
  UpdateProfileRequest,
} from '../models/auth.model';
import { toUserResponse, UserResponse } from '../models/user.model';

export class AuthService {
  static async signUp(request: SignUpRequest): Promise<UserResponse> {
    const data = Validation.validate(AuthValidation.SIGN_UP, request);

    const emailExists = await prisma.user.count({
      where: { email: data.email },
    });

    if (emailExists) throw new ResponseError(400, 'Email already exists');

    data.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: data,
    });

    return toUserResponse(user);
  }

  static async signIn(request: SignInRequest): Promise<AuthResponse> {
    const data = Validation.validate(AuthValidation.SIGN_IN, request);

    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user) throw new ResponseError(401, 'Incorrect email or password');

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new ResponseError(401, 'Incorrect email or password');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    return { token, user: payload };
  }

  static async profile(userId: number): Promise<UserResponse> {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new ResponseError(404, 'User not found');

    return toUserResponse(user);
  }

  static async updateProfile(
    userId: number,
    request: UpdateProfileRequest,
  ): Promise<UserResponse> {
    const data = Validation.validate(AuthValidation.UPDATE_PROFILE, request);

    if (data.email) {
      const emailExists = await prisma.user.count({
        where: { email: data.email, NOT: { id: userId } },
      });

      if (emailExists) throw new ResponseError(400, 'Email already exists');
    }

    const user = await prisma.user.update({ where: { id: userId }, data });

    return toUserResponse(user);
  }

  static async updatePassword(
    userId: number,
    request: UpdatePasswordRequest,
  ): Promise<void> {
    const data = Validation.validate(AuthValidation.UPDATE_PASSWORD, request);

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new ResponseError(404, 'User not found');

    const isValid = await bcrypt.compare(data.currentPassword, user.password);

    if (!isValid) throw new ResponseError(400, 'Current password is incorrect');

    const hashed = await bcrypt.hash(data.newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
  }
}
