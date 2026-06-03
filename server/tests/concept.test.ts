import supertest from 'supertest';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

import { createAdminToken, createStudentToken } from './helpers/auth.helper';

const api = supertest(server);

describe('concept test', () => {
  let adminToken: string;
  let studentToken: string;
  let createdConceptId: number;

  beforeAll(async () => {
    adminToken = await createAdminToken();
    studentToken = await createStudentToken();

    await prisma.concept.deleteMany({ where: { slug: 'test-concept' } });
  });

  afterAll(async () => {
    await prisma.concept.deleteMany({
      where: { slug: { in: ['test-concept', 'test-concept-updated'] } },
    });
  });

  // ------------------------------------------------------------
  // GET /concepts
  // ------------------------------------------------------------
  describe('GET /api/concepts', () => {
    it('should return paginated concepts', async () => {
      const res = await api
        .get('/api/concepts')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('should search concepts', async () => {
      const res = await api
        .get('/api/concepts?search=Test')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
    });

    it('should sort by order', async () => {
      const res = await api
        .get('/api/concepts?sortBy=order&orderBy=asc')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
    });
  });

  // ------------------------------------------------------------
  // POST /concepts
  // ------------------------------------------------------------
  describe('POST /api/concepts', () => {
    it('should create concept successfully', async () => {
      const res = await api
        .post('/api/concepts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-concept',
          title: 'Test Concept',
          description: 'Test description',
          order: 99,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('test-concept');

      createdConceptId = res.body.data.id;
    });

    it('should fail with duplicate slug', async () => {
      const res = await api
        .post('/api/concepts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-concept',
          title: 'Test Concept 2',
          description: 'Test description',
          order: 100,
        });

      expect(res.status).toBe(400);
    });

    it('should fail with duplicate order', async () => {
      const res = await api
        .post('/api/concepts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-concept-2',
          title: 'Test Concept 2',
          description: 'Test description',
          order: 99,
        });

      expect(res.status).toBe(400);
    });

    it('should return 403 for student', async () => {
      const res = await api
        .post('/api/concepts')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          slug: 'test-concept-student',
          title: 'Test',
          description: 'Test',
          order: 100,
        });

      expect(res.status).toBe(403);
    });
  });

  // ------------------------------------------------------------
  // GET /concepts/:id
  // ------------------------------------------------------------
  describe('GET /api/concepts/:id', () => {
    it('should return concept by id', async () => {
      const res = await api
        .get(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdConceptId);
    });

    it('should return 404 for non-existent concept', async () => {
      const res = await api
        .get('/api/concepts/999999')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ------------------------------------------------------------
  // PATCH /concepts/:id
  // ------------------------------------------------------------
  describe('PATCH /api/concepts/:id', () => {
    it('should update concept successfully', async () => {
      const res = await api
        .patch(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated Concept' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated Concept');
    });

    it('should return 403 for student', async () => {
      const res = await api
        .patch(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });
  });

  // ------------------------------------------------------------
  // DELETE concepts/:id
  // ------------------------------------------------------------
  describe('DELETE /api/concepts/:id', () => {
    it('should return 403 for student', async () => {
      const res = await api
        .delete(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should delete concept successfully', async () => {
      const res = await api
        .delete(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion for admin', async () => {
      const res = await api
        .get(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion student', async () => {
      const res = await api
        .get(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });
  });
});
