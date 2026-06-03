import supertest from 'supertest';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

import { createAdminToken, createStudentToken } from './helpers/auth.helper';

const api = supertest(server);

describe('study case test', () => {
  let adminToken: string;
  let studentToken: string;
  let materialId: number;
  let createdStudyCaseId: number;

  beforeAll(async () => {
    adminToken = await createAdminToken();
    studentToken = await createStudentToken();

    const concept = await prisma.concept.upsert({
      where: { slug: 'test-concept-for-sc' },
      update: {},
      create: {
        slug: 'test-concept-for-sc',
        title: 'Test',
        description: 'Test',
        order: 97,
      },
    });

    const material = await prisma.material.upsert({
      where: { slug: 'test-material-for-sc' },
      update: {},
      create: {
        conceptId: concept.id,
        slug: 'test-material-for-sc',
        title: 'Test Material',
        content: 'Test',
        order: 1,
      },
    });

    materialId = material.id;
  });

  afterAll(async () => {
    await prisma.studyCase.deleteMany({ where: { materialId } });
    await prisma.material.deleteMany({
      where: { slug: 'test-material-for-sc' },
    });
    await prisma.concept.deleteMany({ where: { slug: 'test-concept-for-sc' } });
  });

  // ------------------------------------------------------------
  // GET /study-cases
  // ------------------------------------------------------------
  describe('GET /api/study-cases', () => {
    it('should return paginated study cases', async () => {
      const res = await api
        .get('/api/study-cases')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
    });

    it('should filter by materialId', async () => {
      const res = await api
        .get(`/api/study-cases?materialId=${materialId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(
        res.body.data.every((sc: any) => sc.materialId === materialId),
      ).toBe(true);
    });

    it('should fail sortBy order without materialId', async () => {
      const res = await api
        .get('/api/study-cases?sortBy=order')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------------------------
  // POST /study-cases
  // ------------------------------------------------------------
  describe('POST /api/study-cases', () => {
    it('should create study case successfully', async () => {
      const res = await api
        .post('/api/study-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          materialId,
          title: 'Test Study Case',
          description: 'Test description',
          starterCode: 'function test() {}',
          order: 1,
          functionName: 'test',
          parameterNames: [],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Test Study Case');

      createdStudyCaseId = res.body.data.id;
    });

    it('should fail with non-existent materialId', async () => {
      const res = await api
        .post('/api/study-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          materialId: 999999,
          title: 'Test',
          description: 'Test',
          starterCode: 'function test() {}',
          order: 1,
        });

      expect(res.status).toBe(404);
    });

    it('should fail with duplicate order for same material', async () => {
      const res = await api
        .post('/api/study-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          materialId,
          title: 'Test 2',
          description: 'Test',
          starterCode: 'function test() {}',
          order: 1,
        });

      expect(res.status).toBe(400);
    });

    it('should return 403 for student', async () => {
      const res = await api
        .post('/api/study-cases')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          materialId,
          title: 'Test',
          description: 'Test',
          starterCode: 'function test() {}',
          order: 2,
        });

      expect(res.status).toBe(403);
    });
  });

  // ------------------------------------------------------------
  // GET /study-cases/:id
  // ------------------------------------------------------------
  describe('GET /api/study-cases/:id', () => {
    it('should return study case by id', async () => {
      const res = await api
        .get(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdStudyCaseId);
    });

    it('should return 404 for non-existent study case', async () => {
      const res = await api
        .get('/api/study-cases/999999')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ------------------------------------------------------------
  // PATCH /study-cases/:id
  // ------------------------------------------------------------
  describe('PATCH /api/study-cases/:id', () => {
    it('should update study case successfully', async () => {
      const res = await api
        .patch(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Study Case' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Study Case');
    });

    it('should return 403 for student', async () => {
      const res = await api
        .patch(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });
  });

  // ------------------------------------------------------------
  // DELETE /study-cases/:id
  // ------------------------------------------------------------
  describe('DELETE /api/study-cases/:id', () => {
    it('should return 403 for student', async () => {
      const res = await api
        .delete(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should delete study case successfully', async () => {
      const res = await api
        .delete(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion for admin', async () => {
      const res = await api
        .get(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion for student', async () => {
      const res = await api
        .get(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });
  });
});
