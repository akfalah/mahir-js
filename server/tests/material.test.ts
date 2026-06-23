import supertest from 'supertest';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

import { createAdminToken, createStudentToken } from './helpers/auth.helper';

const api = supertest(server);

describe('material test', () => {
  let adminToken: string;
  let studentToken: string;
  let conceptId: number;
  let createdMaterialId: number;
  let unpublishedMaterialId: number;
  let createdMaterialSlug: string;
  let unpublishedMaterialSlug: string;

  beforeAll(async () => {
    adminToken = await createAdminToken();
    studentToken = await createStudentToken();

    await prisma.material.deleteMany({
      where: { slug: { in: ['test-material', 'test-material-unpublished'] } },
    });

    const concept = await prisma.concept.upsert({
      where: { slug: 'test-concept-for-material' },
      update: {},
      create: {
        slug: 'test-concept-for-material',
        title: 'Test Concept',
        description: 'Test',
        order: 98,
        isPublished: true,
      },
    });

    conceptId = concept.id;
  });

  afterAll(async () => {
    await prisma.material.deleteMany({
      where: { slug: { in: ['test-material', 'test-material-unpublished'] } },
    });
    await prisma.concept.deleteMany({
      where: { slug: 'test-concept-for-material' },
    });
  });

  // ------------------------------------------------------------
  // GET /materials
  // ------------------------------------------------------------
  describe('GET /api/materials', () => {
    it('should return paginated materials for student', async () => {
      const res = await api
        .get('/api/materials')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should return paginated materials for guest', async () => {
      const res = await api.get('/api/materials');
      expect(res.status).toBe(200);
    });

    it('should only return published materials for student', async () => {
      const res = await api
        .get('/api/materials')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((m: any) => m.isPublished === true)).toBe(
        true,
      );
    });

    it('should only return published materials for guest', async () => {
      const res = await api.get('/api/materials');

      expect(res.status).toBe(200);
      expect(res.body.data.every((m: any) => m.isPublished === true)).toBe(
        true,
      );
    });

    it('should return all materials including unpublished for admin', async () => {
      const res = await api
        .get('/api/materials')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should search materials', async () => {
      const res = await api.get('/api/materials?search=Test');

      expect(res.status).toBe(200);
    });

    it('should filter by conceptId', async () => {
      const res = await api.get(`/api/materials?conceptId=${conceptId}`);

      expect(res.status).toBe(200);
    });

    it('should fail sortBy order without conceptId', async () => {
      const res = await api.get('/api/materials?sortBy=order');
      expect(res.status).toBe(400);
    });

    it('should sort by order with conceptId', async () => {
      const res = await api.get(
        `/api/materials?conceptId=${conceptId}&sortBy=order`,
      );
      expect(res.status).toBe(200);
    });

    it('should fail with invalid page', async () => {
      const res = await api.get('/api/materials?page=abc');

      expect(res.status).toBe(400);
    });

    it('should fail with invalid limit', async () => {
      const res = await api.get('/api/materials?limit=abc');

      expect(res.status).toBe(400);
    });

    it('should fail with limit exceeding max', async () => {
      const res = await api.get('/api/materials?limit=200');

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------------------------
  // POST /materials
  // ------------------------------------------------------------
  describe('POST /api/materials', () => {
    it('should create material successfully', async () => {
      const res = await api
        .post('/api/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          conceptId,
          slug: 'test-material',
          title: 'Test Material',
          content: 'Test content',
          order: 1,
          isPublished: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('test-material');
      expect(res.body.data.isPublished).toBe(true);

      createdMaterialId = res.body.data.id;
      createdMaterialSlug = res.body.data.slug;
    });

    it('should create unpublished material', async () => {
      const res = await api
        .post('/api/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          conceptId,
          slug: 'test-material-unpublished',
          title: 'Unpublished Material',
          content: 'Test content',
          order: 2,
          isPublished: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.isPublished).toBe(false);

      unpublishedMaterialId = res.body.data.id;
      unpublishedMaterialSlug = res.body.data.slug;
    });

    it('should fail with non-existent conceptId', async () => {
      const res = await api
        .post('/api/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          conceptId: 999999,
          slug: 'test-material-2',
          title: 'Test',
          content: 'Test',
          order: 3,
        });

      expect(res.status).toBe(404);
    });

    it('should fail with duplicate slug', async () => {
      const res = await api
        .post('/api/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          conceptId,
          slug: 'test-material',
          title: 'Test',
          content: 'Test',
          order: 3,
        });

      expect(res.status).toBe(400);
    });

    it('should fail with duplicate order for same concept', async () => {
      const res = await api
        .post('/api/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          conceptId,
          slug: 'test-material-new',
          title: 'Test',
          content: 'Test',
          order: 1,
        });

      expect(res.status).toBe(400);
    });

    it('should fail with missing required fields', async () => {
      const res = await api
        .post('/api/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ conceptId });

      expect(res.status).toBe(400);
    });

    it('should return 403 for student', async () => {
      const res = await api
        .post('/api/materials')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          conceptId,
          slug: 'test-material-student',
          title: 'Test',
          content: 'Test',
          order: 3,
        });

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api.post('/api/materials').send({
        conceptId,
        slug: 'test-material-guest',
        title: 'Test',
        content: 'Test',
        order: 3,
      });

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // GET /materials/:slug
  // ------------------------------------------------------------
  describe('GET /api/materials/:slug', () => {
    it('should return published material for student', async () => {
      const res = await api
        .get(`/api/materials/${createdMaterialSlug}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(createdMaterialSlug);
    });

    it('should return published material for guest', async () => {
      const res = await api.get(`/api/materials/${createdMaterialSlug}`);

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(createdMaterialSlug);
    });

    it('should return 404 for unpublished material for student', async () => {
      const res = await api
        .get(`/api/materials/${unpublishedMaterialSlug}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for unpublished material for guest', async () => {
      const res = await api.get(`/api/materials/${unpublishedMaterialSlug}`);

      expect(res.status).toBe(404);
    });

    it('should return unpublished material for admin', async () => {
      const res = await api
        .get(`/api/materials/${unpublishedMaterialSlug}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
    });

    it('should return 404 for non-existent material', async () => {
      const res = await api.get('/api/materials/999999');

      expect(res.status).toBe(404);
    });
  });

  // ------------------------------------------------------------
  // PATCH /materials/:id
  // ------------------------------------------------------------
  describe('PATCH /api/materials/:id', () => {
    it('should update material successfully', async () => {
      const res = await api
        .patch(`/api/materials/${createdMaterialId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Material' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Material');
    });

    it('should publish material', async () => {
      const res = await api
        .patch(`/api/materials/${unpublishedMaterialId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(true);
    });

    it('should unpublish material', async () => {
      const res = await api
        .patch(`/api/materials/${unpublishedMaterialId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
    });

    it('should return 404 for non-existent material', async () => {
      const res = await api
        .patch('/api/materials/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('should return 403 for student', async () => {
      const res = await api
        .patch(`/api/materials/${createdMaterialId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api
        .patch(`/api/materials/${createdMaterialId}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // DELETE /materials/:id
  // ------------------------------------------------------------
  describe('DELETE /api/materials/:id', () => {
    it('should return 403 for student', async () => {
      const res = await api
        .delete(`/api/materials/${createdMaterialId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api.delete(`/api/materials/${createdMaterialId}`);

      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent material', async () => {
      const res = await api
        .delete('/api/materials/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should delete material successfully', async () => {
      const res = await api
        .delete(`/api/materials/${createdMaterialId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should delete unpublished material successfully', async () => {
      const res = await api
        .delete(`/api/materials/${unpublishedMaterialId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion for admin', async () => {
      const res = await api
        .get(`/api/materials/${createdMaterialId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion for student', async () => {
      const res = await api
        .get(`/api/materials/${createdMaterialId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion for guest', async () => {
      const res = await api.get(`/api/materials/${createdMaterialId}`);

      expect(res.status).toBe(404);
    });
  });
});
