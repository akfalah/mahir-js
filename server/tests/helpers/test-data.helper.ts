import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { Prisma } from '../../generated/prisma/client';
import { Role, SubmissionStatus, TestResultStatus } from '../../generated/prisma/enums';

import { prisma } from '../../src/applications/database';
import { JwtPayload } from '../../src/models/auth.model';

export const TEST_DOMAIN = 'mahir.test';

let orderCounter = 1;

export function createTestPrefix(scope: string) {
  const random = Math.random().toString(36).slice(2, 8);
  return `test-${scope}-${Date.now().toString(36)}-${random}`;
}

export function nextOrder() {
  return Math.floor(Date.now() % 1_000_000) * 1000 + orderCounter++;
}

export function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export function uniqueEmail(prefix: string, label: string) {
  return `${prefix}-${label}@${TEST_DOMAIN}`;
}

export async function cleanupTestData(prefix: string) {
  await prisma.testResult.deleteMany({
    where: {
      OR: [
        { submission: { user: { email: { endsWith: `@${TEST_DOMAIN}` } } } },
        {
          testCase: {
            exercise: { material: { module: { slug: { startsWith: prefix } } } },
          },
        },
      ],
    },
  });

  await prisma.submission.deleteMany({
    where: {
      OR: [
        { user: { email: { endsWith: `@${TEST_DOMAIN}` } } },
        { exercise: { material: { module: { slug: { startsWith: prefix } } } } },
      ],
    },
  });

  await prisma.exerciseProgress.deleteMany({
    where: {
      OR: [
        { user: { email: { endsWith: `@${TEST_DOMAIN}` } } },
        { exercise: { material: { module: { slug: { startsWith: prefix } } } } },
      ],
    },
  });

  await prisma.materialProgress.deleteMany({
    where: {
      OR: [
        { user: { email: { endsWith: `@${TEST_DOMAIN}` } } },
        { material: { module: { slug: { startsWith: prefix } } } },
      ],
    },
  });

  await prisma.moduleProgress.deleteMany({
    where: {
      OR: [
        { user: { email: { endsWith: `@${TEST_DOMAIN}` } } },
        { module: { slug: { startsWith: prefix } } },
      ],
    },
  });

  await prisma.testCase.deleteMany({
    where: { exercise: { material: { module: { slug: { startsWith: prefix } } } } },
  });

  await prisma.exercise.deleteMany({
    where: { material: { module: { slug: { startsWith: prefix } } } },
  });

  await prisma.material.deleteMany({
    where: { module: { slug: { startsWith: prefix } } },
  });

  await prisma.module.deleteMany({
    where: { slug: { startsWith: prefix } },
  });

  await prisma.user.deleteMany({
    where: { email: { endsWith: `@${TEST_DOMAIN}` } },
  });
}

export async function createUserFixture({
  prefix,
  label,
  role = Role.STUDENT,
  password = '12345678',
}: {
  prefix: string;
  label: string;
  role?: Role;
  password?: string;
}) {
  const user = await prisma.user.create({
    data: {
      email: uniqueEmail(prefix, label),
      name: `${label} User`,
      role,
      password: await bcrypt.hash(password, 10),
    },
  });

  const payload: JwtPayload = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1d' });

  return { user, token };
}

export async function createModuleFixture({
  prefix,
  label = 'module',
  order = nextOrder(),
  isPublished = true,
}: {
  prefix: string;
  label?: string;
  order?: number;
  isPublished?: boolean;
}) {
  return prisma.module.create({
    data: {
      slug: `${prefix}-${label}`,
      title: `${prefix} ${label}`,
      description: `Description for ${prefix} ${label}`,
      order,
      isPublished,
    },
  });
}

export async function createMaterialFixture({
  prefix,
  moduleId,
  label = 'material',
  order = 1,
  isPublished = true,
  content = '<h2>Learning Material</h2><p>This material explains a JavaScript concept.</p>',
}: {
  prefix: string;
  moduleId: number;
  label?: string;
  order?: number;
  isPublished?: boolean;
  content?: string;
}) {
  return prisma.material.create({
    data: {
      moduleId,
      slug: `${prefix}-${label}`,
      title: `${prefix} ${label}`,
      description: `Description for ${prefix} ${label}`,
      content,
      order,
      isPublished,
    },
  });
}

export async function createExerciseFixture({
  prefix,
  materialId,
  label = 'exercise',
  order = 1,
  isPublished = true,
  functionName = 'isAdult',
  parameterNames = ['age'],
  starterCode = 'if (age >= 18) {\n  return true;\n}\nreturn false;',
  syntaxRules = { required: [], forbidden: [] },
}: {
  prefix: string;
  materialId: number;
  label?: string;
  order?: number;
  isPublished?: boolean;
  functionName?: string;
  parameterNames?: string[];
  starterCode?: string;
  syntaxRules?: Record<string, string[]>;
}) {
  return prisma.exercise.create({
    data: {
      materialId,
      slug: `${prefix}-${label}`,
      title: `${prefix} ${label}`,
      description: `Solve the ${label} problem`,
      hint: 'Think about the expected input and output.',
      order,
      starterCode,
      functionName,
      parameterNames: parameterNames as Prisma.InputJsonValue,
      syntaxRules: syntaxRules as Prisma.InputJsonValue,
      isPublished,
    },
  });
}

export async function createTestCaseFixture({
  exerciseId,
  description = 'should return true for age 18',
  input = { age: 18 },
  expected = { result: true },
  order = 1,
  isPublished = true,
}: {
  exerciseId: number;
  description?: string;
  input?: Record<string, unknown>;
  expected?: Record<string, unknown>;
  order?: number;
  isPublished?: boolean;
}) {
  return prisma.testCase.create({
    data: {
      exerciseId,
      description,
      input: input as Prisma.InputJsonValue,
      expected: expected as Prisma.InputJsonValue,
      order,
      isPublished,
    },
  });
}

export async function createLearningPathFixture(prefix: string) {
  const module = await createModuleFixture({ prefix, label: 'conditional', order: nextOrder() });
  const material = await createMaterialFixture({ prefix, moduleId: module.id, label: 'if-else' });
  const exercise = await createExerciseFixture({ prefix, materialId: material.id, label: 'is-adult' });

  const testCaseOne = await createTestCaseFixture({
    exerciseId: exercise.id,
    description: 'should return true for age 18',
    input: { age: 18 },
    expected: { result: true },
    order: 1,
  });

  const testCaseTwo = await createTestCaseFixture({
    exerciseId: exercise.id,
    description: 'should return false for age 17',
    input: { age: 17 },
    expected: { result: false },
    order: 2,
  });

  return { module, material, exercise, testCases: [testCaseOne, testCaseTwo] };
}

export async function createSubmissionFixture({
  userId,
  exerciseId,
  status = SubmissionStatus.PASSED,
  code = 'return age >= 18;',
}: {
  userId: number;
  exerciseId: number;
  status?: SubmissionStatus;
  code?: string;
}) {
  return prisma.submission.create({
    data: {
      userId,
      exerciseId,
      status,
      code,
    },
  });
}

export async function createTestResultFixture({
  submissionId,
  testCaseId,
  description = 'should return true for age 18',
  status = TestResultStatus.PASSED,
  expected = 'true',
  received = 'true',
}: {
  submissionId: number;
  testCaseId: number;
  description?: string;
  status?: TestResultStatus;
  expected?: string;
  received?: string | null;
}) {
  return prisma.testResult.create({
    data: {
      submissionId,
      testCaseId,
      description,
      status,
      expected,
      received,
      failureMessage: status === TestResultStatus.PASSED ? null : 'Expected and received values are different.',
    },
  });
}
