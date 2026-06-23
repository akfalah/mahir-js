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
  let unpublishedStudyCaseId: number;
  let createdStudyCaseSlug: string;
  let unpublishedStudyCaseSlug: string;

  beforeAll(async () => {
    adminToken = await createAdminToken();
    studentToken = await createStudentToken();

    const concept = await prisma.concept.upsert({
      where: { slug: 'test-concept-for-sc' },
      update: {},
      create: {
        slug: 'test-concept-for-sc',
        title: 'Test Concept',
        description: 'Test',
        order: 98,
        isPublished: true,
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
    await prisma.studyCase.deleteMany({
      where: {
        slug: { in: ['test-sc', 'test-sc-unpublished'] },
      },
    });
    await prisma.material.deleteMany({
      where: { slug: 'test-material-for-sc' },
    });
    await prisma.concept.deleteMany({ where: { slug: 'test-concept-for-sc' } });
  });

  // ------------------------------------------------------------
  // GET /study-cases
  // ------------------------------------------------------------
  describe('GET /api/study-cases', () => {
    it('should return paginated study cases for student', async () => {
      const res = await api
        .get('/api/study-cases')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should return paginated study cases for guest', async () => {
      const res = await api.get('/api/study-cases');
      expect(res.status).toBe(200);
    });

    it('should only return published study cases for student', async () => {
      const res = await api
        .get('/api/study-cases')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((m: any) => m.isPublished === true)).toBe(
        true,
      );
    });

    it('should only return published study cases for guest', async () => {
      const res = await api.get('/api/study-cases');

      expect(res.status).toBe(200);
      expect(res.body.data.every((m: any) => m.isPublished === true)).toBe(
        true,
      );
    });

    it('should return all study cases including unpublished for admin', async () => {
      const res = await api
        .get('/api/study-cases')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should search study cases', async () => {
      const res = await api.get('/api/study-cases?search=Test');

      expect(res.status).toBe(200);
    });

    it('should filter by materialId', async () => {
      const res = await api.get(`/api/study-cases?materialId=${materialId}`);

      expect(res.status).toBe(200);
    });

    it('should fail sortBy order without materialId', async () => {
      const res = await api.get('/api/study-cases?sortBy=order');
      expect(res.status).toBe(400);
    });

    it('should sort by order with materialId', async () => {
      const res = await api.get(
        `/api/study-cases?materialId=${materialId}&sortBy=order`,
      );
      expect(res.status).toBe(200);
    });

    it('should fail with invalid page', async () => {
      const res = await api.get('/api/study-cases?page=abc');

      expect(res.status).toBe(400);
    });

    it('should fail with invalid limit', async () => {
      const res = await api.get('/api/study-cases?limit=abc');

      expect(res.status).toBe(400);
    });

    it('should fail with limit exceeding max', async () => {
      const res = await api.get('/api/study-cases?limit=200');

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
          slug: 'test-sc',
          title: 'Test Study Case',
          description: 'Test',
          order: 1,
          starterCode: 'function test() {}',
          syntaxRules: {
            required: ['IfStatement'],
            forbidden: ['SwitchStatement'],
          },
          isPublished: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('test-sc');
      expect(res.body.data.isPublished).toBe(true);

      createdStudyCaseId = res.body.data.id;
      createdStudyCaseSlug = res.body.data.slug;
    });

    it('should create unpublished study case', async () => {
      const res = await api
        .post('/api/study-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          materialId,
          slug: 'test-sc-unpublished',
          title: 'Unpublished Study Case',
          description: 'Test',
          order: 2,
          starterCode: 'function test() {}',
          syntaxRules: {
            required: ['IfStatement'],
            forbidden: ['SwitchStatement'],
          },
          isPublished: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.isPublished).toBe(false);

      unpublishedStudyCaseId = res.body.data.id;
      unpublishedStudyCaseSlug = res.body.data.slug;
    });

    it('should fail with non-existent materialId', async () => {
      const res = await api
        .post('/api/study-case')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          materialId: 999999,
          slug: 'test-sc-2',
          title: 'Test Study Case',
          description: 'Test',
          order: 3,
          starterCode: 'function test() {}',
          syntaxRules: {
            required: ['IfStatement'],
            forbidden: ['SwitchStatement'],
          },
        });

      expect(res.status).toBe(404);
    });

    it('should fail with duplicate slug', async () => {
      const res = await api
        .post('/api/study-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          materialId,
          slug: 'test-sc',
          title: 'Test Study Case',
          description: 'Test',
          order: 4,
          starterCode: 'function test() {}',
          syntaxRules: {
            required: ['IfStatement'],
            forbidden: ['SwitchStatement'],
          },
        });

      expect(res.status).toBe(400);
    });

    it('should fail with duplicate order for same material', async () => {
      const res = await api
        .post('/api/study-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          materialId,
          slug: 'test-test-case-new',
          title: 'Test Study Case',
          description: 'Test',
          order: 1,
          starterCode: 'function test() {}',
          syntaxRules: {
            required: ['IfStatement'],
            forbidden: ['SwitchStatement'],
          },
        });

      expect(res.status).toBe(400);
    });

    it('should fail with missing required fields', async () => {
      const res = await api
        .post('/api/study-cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ materialId });

      expect(res.status).toBe(400);
    });

    it('should return 403 for student', async () => {
      const res = await api
        .post('/api/study-cases')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          materialId,
          slug: 'test-scs-student',
          title: 'Test Study Case',
          description: 'Test',
          order: 1,
          starterCode: 'function test() {}',
          syntaxRules: {
            required: ['IfStatement'],
            forbidden: ['SwitchStatement'],
          },
        });

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api.post('/api/study-cases').send({
        materialId,
        slug: 'test-scs-guest',
        title: 'Test Study Case',
        description: 'Test',
        order: 1,
        starterCode: 'function test() {}',
        syntaxRules: {
          required: ['IfStatement'],
          forbidden: [
            'SwitchStatement',
            'ForStatement',
            'WhileStatement',
            'DoWhileStatement',
            'DoWhileStatement',
            'ForInStatement',
            'ForOfStatement',
            'FunctionDeclaration',
            'ArrowFunctionExpression',
            'FunctionExpression',
            'TryStatement',
          ],
        },
      });

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // GET /study-cases/:slug
  // ------------------------------------------------------------
  describe('GET /api/study-cases/:slug', () => {
    it('should return published study case for student', async () => {
      const res = await api
        .get(`/api/study-cases/${createdStudyCaseSlug}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(createdStudyCaseSlug);
    });

    it('should return published study case for guest', async () => {
      const res = await api.get(`/api/study-cases/${createdStudyCaseSlug}`);

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(createdStudyCaseSlug);
    });

    it('should return 404 for unpublished study case for student', async () => {
      const res = await api
        .get(`/api/study-cases/${unpublishedStudyCaseSlug}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for unpublished study case for guest', async () => {
      const res = await api.get(`/api/study-cases/${unpublishedStudyCaseSlug}`);

      expect(res.status).toBe(404);
    });

    it('should return unpublished study case for admin', async () => {
      const res = await api
        .get(`/api/study-cases/${unpublishedStudyCaseSlug}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
    });

    it('should return 404 for non-existent study case', async () => {
      const res = await api.get('/api/study-cases/999999');

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
        .send({ title: 'Updated Material' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Material');
    });

    it('should publish study case', async () => {
      const res = await api
        .patch(`/api/study-cases/${unpublishedStudyCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(true);
    });

    it('should unpublish study case', async () => {
      const res = await api
        .patch(`/api/study-cases/${unpublishedStudyCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
    });

    it('should return 404 for non-existent study cases', async () => {
      const res = await api
        .patch('/api/study-cases/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('should return 403 for study case', async () => {
      const res = await api
        .patch(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });
    it('should return 401 for guest', async () => {
      const res = await api
        .patch(`/api/study-cases/${createdStudyCaseId}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(401);
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

    it('should return 401 for guest', async () => {
      const res = await api.delete(`/api/study-cases/${createdStudyCaseId}`);

      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent study case', async () => {
      const res = await api
        .delete('/api/study-cases/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should delete study case successfully', async () => {
      const res = await api
        .delete(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should delete unpublished study case successfully', async () => {
      const res = await api
        .delete(`/api/study-cases/${unpublishedStudyCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion for admin', async () => {
      const res = await api
        .get(`/api/study-cases/${unpublishedStudyCaseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion for student', async () => {
      const res = await api
        .get(`/api/study-cases/${createdStudyCaseId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion for guest', async () => {
      const res = await api.get(`/api/study-cases/${createdStudyCaseId}`);

      expect(res.status).toBe(404);
    });
  });
});
