import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

import { prisma } from '../applications/database';

import { ResponseError } from '../error/response.error';

import { AuthValidation } from '../validations/auth.validation';
import { Validation } from '../validations/validation';

import {
  AuthResponse,
  LoginRequest,
  ProfileResponse,
  RegisterRequest,
  toProfileResponse,
  UpdateProfileRequest,
} from '../models/auth.model';

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  static async register(request: RegisterRequest): Promise<ProfileResponse> {
    const data = Validation.validate(AuthValidation.REGISTER, request);

    const count = await prisma.user.count({
      where: { email: data.email },
    });

    if (count !== 0) throw new ResponseError(400, 'Email already exists');

    data.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        role: 'STUDENT',
      },
    });

    return toProfileResponse(user);
  }

  static async login(request: LoginRequest): Promise<AuthResponse> {
    const data = Validation.validate(AuthValidation.LOGIN, request);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) throw new ResponseError(401, 'Incorrect email or password');

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new ResponseError(401, 'Incorrect email or password');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] },
    );

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      token,
    };
  }

  static async profile(userId: number): Promise<ProfileResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ResponseError(404, 'User not found');

    return toProfileResponse(user);
  }

  static async updateProfile(
    userId: number,
    request: UpdateProfileRequest,
  ): Promise<ProfileResponse> {
    const data = Validation.validate(AuthValidation.UPDATE_PROFILE, request);

    if (data.email) {
      const count = await prisma.user.count({
        where: { email: data.email, NOT: { id: userId } },
      });

      if (count !== 0) throw new ResponseError(400, 'Email already exists');
    }

    if (data.password) data.password = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    return toProfileResponse(user);
  }
}
