import supertest from 'supertest';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

import { createAdminToken, createStudentToken } from './helpers/auth.helper';

const api = supertest(server);

describe('concept test', () => {
  let adminToken: string;
  let studentToken: string;
  let createdConceptId: number;
  let unpublishedConceptId: number;
  let createdConceptSlug: string;
  let unpublishedConceptSlug: string;

  beforeAll(async () => {
    adminToken = await createAdminToken();
    studentToken = await createStudentToken();
    
    await prisma.concept.deleteMany({
      where: { slug: { in: ['test-concept', 'test-concept-unpublished'] } },
    });
  });

  afterAll(async () => {
    await prisma.concept.deleteMany({
      where: { slug: { in: ['test-concept', 'test-concept-unpublished'] } },
    });
  });

  // ------------------------------------------------------------
  // GET /concepts
  // ------------------------------------------------------------
  describe('GET /api/concepts', () => {
    it('should return paginated concepts for student', async () => {
      const res = await api
        .get('/api/concepts')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('should return paginated concepts for guest', async () => {
      const res = await api.get('/api/concepts');

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
    });

    it('should only return published concepts for student', async () => {
      const res = await api
        .get('/api/concepts')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((c: any) => c.isPublished === true)).toBe(
        true,
      );
    });

    it('should only return published concepts for guest', async () => {
      const res = await api.get('/api/concepts');

      expect(res.status).toBe(200);
      expect(res.body.data.every((c: any) => c.isPublished === true)).toBe(
        true,
      );
    });

    it('should return all concepts including unpublished for admin', async () => {
      const res = await api
        .get('/api/concepts')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should search concepts', async () => {
      const res = await api.get('/api/concepts?search=Test');

      expect(res.status).toBe(200);
    });

    it('should sort by order', async () => {
      const res = await api.get('/api/concepts?sortBy=order&orderBy=asc');

      expect(res.status).toBe(200);
    });

    it('should fail with invalid page', async () => {
      const res = await api.get('/api/concepts?page=abc');

      expect(res.status).toBe(400);
    });

    it('should fail with invalid limit', async () => {
      const res = await api.get('/api/concepts?limit=abc');

      expect(res.status).toBe(400);
    });

    it('should fail with limit exceeding max', async () => {
      const res = await api.get('/api/concepts?limit=200');

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------------------------
  // POST /concepts
  // ------------------------------------------------------------
  describe('POST /api/concepts', () => {
    it('should create concept successfully as admin', async () => {
      const res = await api
        .post('/api/concepts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-concept',
          title: 'Test Concept',
          description: 'Test description',
          order: 99,
          isPublished: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.slug).toBe('test-concept');
      expect(res.body.data.isPublished).toBe(true);

      createdConceptId = res.body.data.id;
      createdConceptSlug = res.body.data.slug;
    });

    it('should create unpublished concept', async () => {
      const res = await api
        .post('/api/concepts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-concept-unpublished',
          title: 'Unpublished Concept',
          description: 'Test description',
          order: 100,
          isPublished: false,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.isPublished).toBe(false);

      unpublishedConceptId = res.body.data.id;
      unpublishedConceptSlug = res.body.data.slug;
    });

    it('should fail with duplicate slug', async () => {
      const res = await api
        .post('/api/concepts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-concept',
          title: 'Test Concept 2',
          description: 'Test description',
          order: 101,
          isPublished: true,
        });

      expect(res.status).toBe(400);
    });

    it('should fail with duplicate order', async () => {
      const res = await api
        .post('/api/concepts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          slug: 'test-concept-new',
          title: 'Test Concept New',
          description: 'Test description',
          order: 99,
          isPublished: true,
        });

      expect(res.status).toBe(400);
    });

    it('should fail with missing required fields', async () => {
      const res = await api
        .post('/api/concepts')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ slug: 'test-concept-incomplete' });

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
          order: 102,
          isPublished: true,
        });

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api.post('/api/concepts').send({
        slug: 'test-concept-guest',
        title: 'Test',
        description: 'Test',
        order: 103,
      });

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // GET /concepts/:slug
  // ------------------------------------------------------------
  describe('GET /api/concepts/:slug', () => {
    it('should return published concept by slug for student', async () => {
      const res = await api
        .get(`/api/concepts/${createdConceptSlug}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(createdConceptSlug);
    });

    it('should return published concept by slug for guest', async () => {
      const res = await api.get(`/api/concepts/${createdConceptSlug}`);

      expect(res.status).toBe(200);
      expect(res.body.data.slug).toBe(createdConceptSlug);
    });

    it('should return 404 for unpublished concept for student', async () => {
      const res = await api
        .get(`/api/concepts/${unpublishedConceptSlug}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 for unpublished concept for guest', async () => {
      const res = await api.get(`/api/concepts/${unpublishedConceptSlug}`);

      expect(res.status).toBe(404);
    });

    it('should return unpublished concept for admin', async () => {
      const res = await api
        .get(`/api/concepts/${unpublishedConceptSlug}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
    });

    it('should return 404 for non-existent concept', async () => {
      const res = await api.get('/api/concepts/999999');

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

    it('should publish concept', async () => {
      const res = await api
        .patch(`/api/concepts/${unpublishedConceptId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(true);
    });

    it('should unpublish concept', async () => {
      const res = await api
        .patch(`/api/concepts/${unpublishedConceptId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isPublished: false });

      expect(res.status).toBe(200);
      expect(res.body.data.isPublished).toBe(false);
    });

    it('should return 404 for non-existent concept', async () => {
      const res = await api
        .patch('/api/concepts/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });

    it('should return 403 for student', async () => {
      const res = await api
        .patch(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api
        .patch(`/api/concepts/${createdConceptId}`)
        .send({ title: 'Updated' });

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // DELETE /concepts/:id
  // ------------------------------------------------------------
  describe('DELETE /api/concepts/:id', () => {
    it('should return 403 for student', async () => {
      const res = await api
        .delete(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 for guest', async () => {
      const res = await api.delete(`/api/concepts/${createdConceptId}`);
      expect(res.status).toBe(401);
    });

    it('should return 404 for non-existent concept', async () => {
      const res = await api
        .delete('/api/concepts/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should delete concept successfully', async () => {
      const res = await api
        .delete(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should delete unpublished concept successfully', async () => {
      const res = await api
        .delete(`/api/concepts/${unpublishedConceptId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion for admin', async () => {
      const res = await api
        .get(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion for student', async () => {
      const res = await api
        .get(`/api/concepts/${createdConceptId}`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(404);
    });

    it('should return 404 after deletion for guest', async () => {
      const res = await api.get(`/api/concepts/${createdConceptId}`);

      expect(res.status).toBe(404);
    });
  });
});
