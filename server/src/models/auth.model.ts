import { User } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

export type AuthResponse = {
  id: number;
  email: string;
  name: string;
  role: Role;
  token: string;
};

export type ProfileResponse = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export type RegisterRequest = {
  email: string;
  name: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type UpdateProfileRequest = {
  name?: string;
  email?: string;
  password?: string;
};

export type JwtPayload = {
  id: number;
  email: string;
  role: string;
};

export function toProfileResponse(user: User): ProfileResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
