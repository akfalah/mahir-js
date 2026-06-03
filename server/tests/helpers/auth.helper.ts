import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { Role } from '../../generated/prisma/enums';

import { prisma } from '../../src/applications/database';

import { JwtPayload } from '../../src/models/auth.model';

export async function createAdminToken(): Promise<string> {
  const admin = await prisma.user.upsert({
    where: { email: 'admin.test@example.com' },
    update: {},
    create: {
      email: 'admin.test@example.com',
      name: 'Admin Test',
      password: await bcrypt.hash('password123', 10),
      role: Role.ADMIN,
    },
  });

  const payload: JwtPayload = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });
}

export async function createStudentToken(): Promise<string> {
  const student = await prisma.user.upsert({
    where: { email: 'student.test@example.com' },
    update: {},
    create: {
      email: 'student.test@example.com',
      name: 'Student Test',
      password: await bcrypt.hash('password123', 10),
      role: Role.STUDENT,
    },
  });

  const payload: JwtPayload = {
    id: student.id,
    email: student.email,
    name: student.name,
    role: student.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: '1d',
  });
}

export async function getStudentId(): Promise<number> {
  const student = await prisma.user.findUnique({
    where: { email: 'student.test@example.com' },
  });
  return student!.id;
}
