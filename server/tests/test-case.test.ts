import supertest from 'supertest';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

import { createAdminToken, createStudentToken } from './helpers/auth.helper';

const api = supertest(server);

describe('test case test', () => {
  let adminToken: string;
  let studentToken: string;
  let studyCaseId: number;
  let createdTestCaseId: number;
  let unpublishedTestCaseId: number;

  beforeAll(async () => {
    adminToken = await createAdminToken();
    studentToken = await createStudentToken();

    const concept = await prisma.concept.upsert({
      where: { slug: 'test-concept-for-tc' },
      update: {},
      create: {
        slug: 'test-concept-for-tc',
        title: 'Test Concept for TC',
        description: 'Test',
        order: 94,
        isPublished: true,
      },
    });

    const material = await prisma.material.upsert({
      where: { slug: 'test-material-for-tc' },
      update: {},
      create: {
        conceptId: concept.id,
        slug: 'test-material-for-tc',
        title: 'Test Material for TC',
        content: 'Test',
        order: 1,
        isPublished: true,
      },
    });

    const studyCase = await prisma.studyCase.upsert({
      where: { slug: 'test-sc-for-tc' },
      update: {},
      create: {
        materialId: material.id,
        slug: 'test-sc-for-tc',
        title: 'Test Study Case for TC',
        description: 'Test',
        order: 1,
        starterCode: 'function test(n) {}',
        functionName: 'test',
        parameterNames: ['n'],
        isPublished: true,
      },
    });

    studyCaseId = studyCase.id;

    await prisma.testCase.deleteMany({ where: { studyCaseId } });
  });

  afterAll(async () => {
    await prisma.testCase.deleteMany({ where: { studyCaseId } });
    await prisma.studyCase.deleteMany({ where: { slug: 'test-sc-for-tc' } });
    await prisma.material.deleteMany({
      where: { slug: 'test-material-for-tc' },
    });
    await prisma.concept.deleteMany({ where: { slug: 'test-concept-for-tc' } });
  });

  // ------------------------------------------------------------
  // GET /test-cases
  // ------------------------------------------------------------
  describe('GET /api/test-cases', () => {
    it('should return paginated test cases for student', async () => {
      const res = await api
        .get(`/api/test-cases?studyCaseId=${studyCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('should return paginated test cases for guest', async () => {
      const res = await api.get(`/api/test-cases?studyCaseId=${studyCaseId}`);
      expect(res.status).toBe(200);
    });

    it('should only return published test cases for student', async () => {
      const res = await api
        .get(`/api/test-cases?studyCaseId=${studyCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((tc: any) => tc.isPublished === true)).toBe(
        true,
      );
    });

    it('should only return published test cases for guest', async () => {
      const res = await api.get(`/api/test-cases?studyCaseId=${studyCaseId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((tc: any) => tc.isPublished === true)).toBe(
        true,
      );
    });

    it('should return all test cases including unpublished for admin', async () => {
      const res = await api
        .get(`/api/test-cases?studyCaseId=${studyCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should filter by isPublished for admin', async () => {
      const res = await api
        .get(`/api/test-cases?studyCaseId=${studyCaseId}&isPublished=false`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((tc: any) => tc.isPublished === false)).toBe(
        true,
      );
    });

    it('should fail sortBy order without studyCaseId', async () => {
      const res = await api
        .get('/api/test-cases?sortBy=order')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
    });

    it('should sort by order with studyCaseId', async () => {
      const res = await api.get(
        `/api/test-cases?studyCaseId=${studyCaseId}&sortBy=order&orderBy=asc`,
      );
      expect(res.status).toBe(200);
    });

    it('should fail with invalid page', async () => {
      const res = await api.get('/api/test-cases?page=abc');
      expect(res.status).toBe(400);
    });

    it('should fail with invalid limit', async () => {
      const res = await api.get('/api/test-cases?limit=abc');
      expect(res.status).toBe(400);
    });

    it('should fail with limit exceeding max', async () => {
      const res = await api.get('/api/test-cases?limit=200');
      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------------------------
  // POST /test-cases
  // ------------------------------------------------------------
  describe('POST /api/test-cases', () => {
    it('should create published test case successfully', async () => {
      const res = await api
        .post('/api/test-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studyCaseId,
          description: 'should return 4 for n=2',
          input: { n: 2 },
          expected: { result: 4 },
          order: 1,
          isPublished: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.isPublished).toBe(true);
      expect(res.body.data.input).toEqual({ n: 2 });
      expect(res.body.data.expected).toEqual({ result: 4 });
      createdTestCaseId = res.body.data.id;
    });

    it('should create unpublished test case successfully', async () => {
      const res = await api
        .post('/api/test-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studyCaseId,
          description: 'should return 9 for n=3',
          input: { n: 3 },
          expected: { result: 9 },
          order: 2,
          isPublished: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.isPublished).toBe(false);
      unpublishedTestCaseId = res.body.data.id;
    });

    it('should fail with non-existent studyCaseId', async () => {
      const res = await api
        .post('/api/test-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studyCaseId: 999999,
          description: 'test',
          input: { n: 1 },
          expected: { result: 1 },
          order: 3,
        });

      expect(res.status).toBe(404);
    });

    it('should fail with duplicate order for same study case', async () => {
      const res = await api
        .post('/api/test-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studyCaseId,
          description: 'duplicate order',
          input: { n: 5 },
          expected: { result: 25 },
          order: 1,
        });

      expect(res.status).toBe(400);
    });

    it('should fail with missing required fields', async () => {
      const res = await api
        .post('/api/test-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ studyCaseId });

      expect(res.status).toBe(400);
    });

    it('should return 403 for student', async () => {
      const res = await api
        .post('/api/test-cases')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          studyCaseId,
          description: 'test',
          input: { n: 1 },
          expected: { result: 1 },
          order: 3,
        });

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api.post('/api/test-cases').send({
        studyCaseId,
        description: 'test',
        input: { n: 1 },
        expected: { result: 1 },
        order: 3,
      });

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // GET /test-cases/:id
  // ------------------------------------------------------------
  describe('GET /api/test-cases/:id', () => {
    it('should return published test case for student', async () => {
      const res = await api
        .get(`/api/test-cases/${createdTestCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdTestCaseId);
      expect(res.body.data.isPublished).toBe(true);
    });

    it('should return published test case for guest', async () => {
      const res = await api.get(`/api/test-cases/${createdTestCaseId}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdTestCaseId);
    });

    it('should return 404 for unpublished test case for student', async () => {
      const res = await api
        .get(`/api/test-cases/${unpublishedTestCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for unpublished test case for guest', async () => {
      const res = await api.get(`/api/test-cases/${unpublishedTestCaseId}`);

      expect(res.status).toBe(404);
    });

    it('should return unpublished test case for admin', async () => {
      const res = await api
        .get(`/api/test-cases/${unpublishedTestCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
    });

    it('should return 404 for non-existent test case', async () => {
      const res = await api.get('/api/test-cases/999999');
      expect(res.status).toBe(404);
    });
  });

  // ------------------------------------------------------------
  // PATCH /test-cases/:id
  // ------------------------------------------------------------
  describe('PATCH /api/test-cases/:id', () => {
    it('should update test case description successfully', async () => {
      const res = await api
        .patch(`/api/test-cases/${createdTestCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated description' });

      expect(res.status).toBe(200);
      expect(res.body.data.description).toBe('Updated description');
    });

    it('should update input and expected', async () => {
      const res = await api
        .patch(`/api/test-cases/${createdTestCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          input: { n: 4 },
          expected: { result: 16 },
        });

      expect(res.status).toBe(200);
      expect(res.body.data.input).toEqual({ n: 4 });
      expect(res.body.data.expected).toEqual({ result: 16 });
    });

    it('should publish test case', async () => {
      const res = await api
        .patch(`/api/test-cases/${unpublishedTestCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(true);
    });

    it('should unpublish test case', async () => {
      const res = await api
        .patch(`/api/test-cases/${unpublishedTestCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
    });

    it('should return 404 for non-existent test case', async () => {
      const res = await api
        .patch('/api/test-cases/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('should return 403 for student', async () => {
      const res = await api
        .patch(`/api/test-cases/${createdTestCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ description: 'Updated' });

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api
        .patch(`/api/test-cases/${createdTestCaseId}`)
        .send({ description: 'Updated' });

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // DELETE /test-cases/:id
  // ------------------------------------------------------------
  describe('DELETE /api/test-cases/:id', () => {
    it('should return 403 for student', async () => {
      const res = await api
        .delete(`/api/test-cases/${createdTestCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api.delete(`/api/test-cases/${createdTestCaseId}`);
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent test case', async () => {
      const res = await api
        .delete('/api/test-cases/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should delete published test case successfully', async () => {
      const res = await api
        .delete(`/api/test-cases/${createdTestCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should delete unpublished test case successfully', async () => {
      const res = await api
        .delete(`/api/test-cases/${unpublishedTestCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion for admin', async () => {
      const res = await api
        .get(`/api/test-cases/${createdTestCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion for student', async () => {
      const res = await api
        .get(`/api/test-cases/${createdTestCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion for guest', async () => {
      const res = await api.get(`/api/test-cases/${createdTestCaseId}`);
      expect(res.status).toBe(404);
    });
  });
});
