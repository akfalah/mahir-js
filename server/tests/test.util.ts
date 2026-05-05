import 'dotenv/config';
import supertest from 'supertest';
import bcrypt from 'bcrypt';

import { Role } from '../generated/prisma/enums';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

export const createUserTest = async (
  role: Role = Role.STUDENT,
  email: string = 'test@example.com',
) => {
  return prisma.user.create({
    data: {
      email,
      name: `Test User ${role}`,
      password: await bcrypt.hash('password123', 10),
      role,
    },
  });
};

export const deleteUserTest = async (email: string = 'test@example.com') => {
  await prisma.user.deleteMany({ where: { email } });
};

export const getTokenTest = async (email: string = 'test@example.com'): Promise<string> => {
  const response = await supertest(server)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });
  return response.body.data.token;
};
