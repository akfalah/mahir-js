import { User } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

import { PaginationRequest, PaginationResponse } from './pagination.model';

export type UserSortBy = 'id' | 'name' | 'email' | 'role' | 'createdAt';

export type UserPaginationRequest = PaginationRequest<UserSortBy> & {
  role?: Role;
};

export type CreateUserRequest = {
  email: string;
  name: string;
  role: Role;
  password: string;
  imageUrl?: string;
};

export type UpdateUserRequest = {
  email?: string;
  name?: string;
  role?: Role;
  password?: string;
  imageUrl?: string;
};

export type UserResponse = {
  id: number;
  email: string;
  name: string;
  role: Role;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UserPaginationResponse = PaginationResponse<UserResponse>;

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
