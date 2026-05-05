import { User } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

export type UserResponse = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export type GetResponse = {
  data: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type GetRequest = {
  page: number;
  limit: number;
  search?: string;
};

export type CreateRequest = {
  email: string;
  name: string;
  role: Role;
  password: string;
};

export type UpdateRequest = {
  email?: string;
  name?: string;
  role?: Role;
  password?: string;
};

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
