import supertest from 'supertest';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

import {
  createAdminToken,
  createStudentToken,
  getStudentId,
} from './helpers/auth.helper';

const api = supertest(server);
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

describe('submission test', () => {
  let adminToken: string;
  let studentToken: string;
  let studentId: number;
  let studyCaseId: number;
  let submissionId: number;

  beforeAll(async () => {
    adminToken = await createAdminToken();
    studentToken = await createStudentToken();
    studentId = await getStudentId();

    const concept = await prisma.concept.upsert({
      where: { slug: 'test-concept-for-submission' },
      update: {},
      create: {
        slug: 'test-concept-for-submission',
        title: 'Test',
        description: 'Test',
        order: 96,
        isPublished: true,
      },
    });

    const material = await prisma.material.upsert({
      where: { slug: 'test-material-for-submission' },
      update: {},
      create: {
        conceptId: concept.id,
        slug: 'test-material-for-submission',
        title: 'Test',
        content: 'Test',
        order: 1,
        isPublished: true,
      },
    });

    const studyCase = await prisma.studyCase.upsert({
      where: { materialId_order: { materialId: material.id, order: 1 } },
      update: { updatedAt: new Date() },
      create: {
        materialId: material.id,
        slug: 'is-adult',
        title: 'Is Adult',
        description: 'Write isAdult function',
        starterCode: 'function isAdult(age) {}',
        order: 1,
        functionName: 'isAdult',
        parameterNames: ['age'],
        isPublished: true,
      },
    });

    studyCaseId = studyCase.id;

    await prisma.testCase.deleteMany({ where: { studyCaseId } });
    await prisma.testCase.createMany({
      data: [
        {
          studyCaseId,
          description: 'age 18',
          input: { age: 18 },
          expected: { result: true },
          order: 1,
          isPublished: true,
        },
        {
          studyCaseId,
          description: 'age 17',
          input: { age: 17 },
          expected: { result: false },
          order: 2,
          isPublished: true,
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.submission.deleteMany({ where: { studyCaseId } });
    await prisma.testCase.deleteMany({ where: { studyCaseId } });
    await prisma.studyCase.deleteMany({ where: { id: studyCaseId } });
    await prisma.material.deleteMany({
      where: { slug: 'test-material-for-submission' },
    });
    await prisma.concept.deleteMany({
      where: { slug: 'test-concept-for-submission' },
    });
  });

  // ------------------------------------------------------------
  // GET /submissions
  // ------------------------------------------------------------
  describe('GET /api/submissions', () => {
    it('should return student own submissions only', async () => {
      const res = await api
        .get('/api/submissions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('should return all submissions for admin', async () => {
      const res = await api
        .get('/api/submissions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 401 without token', async () => {
      const res = await api.get('/api/submissions');
      expect(res.status).toBe(401);
    });

    it('should filter by status with valid enum', async () => {
      const res = await api
        .get('/api/submissions?status=PASSED')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
    });

    it('should fail with invalid status', async () => {
      const res = await api
        .get('/api/submissions?status=INVALID')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
    });

    it('should fail with invalid page', async () => {
      const res = await api
        .get('/api/submissions?page=abc')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------------------------
  // POST /submissions
  // ------------------------------------------------------------
  describe('POST /api/submissions', () => {
    it('should create submission and return PENDING status', async () => {
      const res = await api
        .post('/api/submissions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studyCaseId,
          code: 'function isAdult(age) { return age >= 18; }',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('PENDING');
      expect(res.body.data.studyCaseId).toBe(studyCaseId);
      expect(res.body.data.userId).toBe(studentId);
      submissionId = res.body.data.id;
    });

    it('should eventually pass after worker processes', async () => {
      await sleep(3000);

      const res = await api
        .get(`/api/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('PASSED');
      expect(res.body.data.testResults.length).toBeGreaterThan(0);
      expect(
        res.body.data.testResults.every((r: any) => r.status === 'PASSED'),
      ).toBe(true);
    });

    it('should create failed submission for wrong code', async () => {
      const res = await api
        .post('/api/submissions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studyCaseId,
          code: 'function isAdult(age) { return false; }',
        });

      expect(res.status).toBe(201);

      await sleep(3000);

      const detail = await api
        .get(`/api/submissions/${res.body.data.id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(detail.body.data.status).toBe('FAILED');
      expect(
        detail.body.data.testResults.some((r: any) => r.status === 'FAILED'),
      ).toBe(true);
    });

    it('should create error submission for syntax error code', async () => {
      const res = await api
        .post('/api/submissions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studyCaseId,
          code: 'function isAdult(age) { return @@invalid syntax; }',
        });

      expect(res.status).toBe(201);

      await sleep(3000);

      const detail = await api
        .get(`/api/submissions/${res.body.data.id}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(['FAILED', 'ERROR']).toContain(detail.body.data.status);
    });

    it('should return 403 for admin trying to submit', async () => {
      const res = await api
        .post('/api/submissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studyCaseId,
          code: 'function isAdult(age) { return age >= 18; }',
        });

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await api.post('/api/submissions').send({
        studyCaseId,
        code: 'function isAdult(age) { return age >= 18; }',
      });

      expect(res.status).toBe(401);
    });

    it('should fail with non-existent studyCaseId', async () => {
      const res = await api
        .post('/api/submissions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ studyCaseId: 999999, code: 'function isAdult(age) {}' });

      expect(res.status).toBe(404);
    });

    it('should fail with missing code', async () => {
      const res = await api
        .post('/api/submissions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ studyCaseId });

      expect(res.status).toBe(400);
    });

    it('should fail with missing studyCaseId', async () => {
      const res = await api
        .post('/api/submissions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ code: 'function isAdult(age) { return age >= 18; }' });

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------------------------
  // GET /submissions/:id
  // ------------------------------------------------------------
  describe('GET /api/submissions/:id', () => {
    it('should return submission with test results', async () => {
      const res = await api
        .get(`/api/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.testResults).toBeDefined();
      expect(Array.isArray(res.body.data.testResults)).toBe(true);
    });

    it('should allow admin to view any submission', async () => {
      const res = await api
        .get(`/api/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 403 when student accesses another student submission', async () => {
      // buat student lain
      const otherStudent = await prisma.user.upsert({
        where: { email: 'other.student@example.com' },
        update: {},
        create: {
          email: 'other.student@example.com',
          name: 'Other Student',
          password: 'password123',
          role: 'STUDENT',
        },
      });

      const otherToken = require('jsonwebtoken').sign(
        {
          id: otherStudent.id,
          email: otherStudent.email,
          name: otherStudent.name,
          role: otherStudent.role,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '1d' },
      );

      const res = await api
        .get(`/api/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 404 for non-existent submission', async () => {
      const res = await api
        .get('/api/submissions/999999')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 401 without token', async () => {
      const res = await api.get(`/api/submissions/${submissionId}`);
      expect(res.status).toBe(401);
    });

    it('should filter submissions by studyCaseId after having submissions', async () => {
      const res = await api
        .get(`/api/submissions?studyCaseId=${studyCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(
        res.body.data.every((s: any) => s.studyCaseId === studyCaseId),
      ).toBe(true);
    });

    it('should only return own submissions for student', async () => {
      const res = await api
        .get('/api/submissions')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((s: any) => s.userId === studentId)).toBe(
        true,
      );
    });
  });
});
