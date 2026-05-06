import { User } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

export type GetUsersRequest = {
  page: number;
  limit: number;
  search?: string;
};

export type CreateUserRequest = {
  email: string;
  name: string;
  role: Role;
  password: string;
};

export type UpdateUserRequest = {
  email?: string;
  name?: string;
  role?: Role;
  password?: string;
};

export type UserResponse = {
  id: number;
  email: string;
  name: string;
  role: Role;
};

export type GetUsersResponse = {
  data: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
