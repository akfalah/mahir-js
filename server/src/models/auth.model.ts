export type JwtPayload = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type SignUpRequest = {
  email: string;
  name: string;
  password: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type UpdateProfileRequest = {
  name?: string;
  email?: string;
  bio?: string;
  image?: string;
};

export type UpdatePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type AuthResponse = {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
};
