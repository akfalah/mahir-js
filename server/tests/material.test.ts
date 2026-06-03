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

  beforeAll(async () => {
    adminToken = await createAdminToken();
    studentToken = await createStudentToken();

    await prisma.material.deleteMany({ where: { slug: 'test-material' } });
    const concept = await prisma.concept.upsert({
      where: { slug: 'test-concept-for-material' },
      update: {},
      create: {
        slug: 'test-concept-for-material',
        title: 'Test Concept',
        description: 'Test',
        order: 98,
      },
    });

    conceptId = concept.id;
  });

  afterAll(async () => {
    await prisma.material.deleteMany({ where: { slug: 'test-material' } });
    await prisma.concept.deleteMany({
      where: { slug: 'test-concept-for-material' },
    });
  });

  // ------------------------------------------------------------
  // GET /materials
  // ------------------------------------------------------------
  describe('GET /api/materials', () => {
    it('should return paginated materials', async () => {
      const res = await api
        .get('/api/materials')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should filter by conceptId', async () => {
      const res = await api
        .get(`/api/materials?conceptId=${conceptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((m: any) => m.conceptId === conceptId)).toBe(
        true,
      );
    });

    it('should fail sortBy order without conceptId', async () => {
      const res = await api
        .get('/api/materials?sortBy=order')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(400);
    });

    it('should sort by order with conceptId', async () => {
      const res = await api
        .get(`/api/materials?sortBy=order&conceptId=${conceptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
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
        });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('test-material');

      createdMaterialId = res.body.data.id;
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
          order: 2,
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
          order: 2,
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
  });

  // ------------------------------------------------------------
  // GET /materials/:id
  // ------------------------------------------------------------
  describe('GET /api/materials/:id', () => {
    it('should return material by id', async () => {
      const res = await api
        .get(`/api/materials/${createdMaterialId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdMaterialId);
    });

    it('should return 404 for non-existent material', async () => {
      const res = await api
        .get('/api/materials/999999')
        .set('Authorization', `Bearer ${studentToken}`);

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

    it('should return 403 for student', async () => {
      const res = await api
        .patch(`/api/materials/${createdMaterialId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
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

    it('should delete material successfully', async () => {
      const res = await api
        .delete(`/api/materials/${createdMaterialId}`)
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
  });
});
