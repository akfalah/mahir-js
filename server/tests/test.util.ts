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

export const getTokenTest = async (
  email: string = 'test@example.com',
): Promise<string> => {
  const response = await supertest(server)
    .post('/api/auth/login')
    .send({ email, password: 'password123' });
  return response.body.data.token;
};

export const createConceptTest = async (order: number = 99999) => {
  return prisma.concept.create({
    data: {
      slug: `concept-test-${order}`,
      title: `Concept Test ${order}`,
      description: `Description for concept test ${order}`,
      order,
    },
  });
};

export const deleteConceptTest = async () => {
  await prisma.concept.deleteMany({
    where: { slug: { startsWith: 'concept-test' } },
  });
};
