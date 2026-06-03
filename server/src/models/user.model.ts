import { User } from '../../generated/prisma/client';
import { Role } from '../../generated/prisma/enums';

import { PaginationRequest, PaginationResponse } from './paginations.model';

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
  bio?: string;
};

export type UpdateUserRequest = {
  email?: string;
  name?: string;
  role?: Role;
  password?: string;
  imageUrl?: string;
  bio?: string;
};

export type UserResponse = {
  id: number;
  email: string;
  name: string;
  role: Role;
  imageUrl: string | null;
  bio: string | null;
  createdAt: Date;
};

export type UserPaginationResponse = PaginationResponse<UserResponse>;

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    imageUrl: user.imageUrl,
    bio: user.bio,
    createdAt: user.createdAt,
  };
}
