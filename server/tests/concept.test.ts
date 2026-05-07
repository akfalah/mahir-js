import 'dotenv/config';
import supertest from 'supertest';

import { Role } from '../generated/prisma/enums';

import { prisma } from '../src/applications/database';
import { server } from '../src/applications/server';
import { logger } from '../src/applications/logger';

import {
  createUserTest,
  deleteUserTest,
  getTokenTest,
  createConceptTest,
  deleteConceptTest,
} from './test.util';

// ------------------------------------------------------------
// GET ALL
// ------------------------------------------------------------
describe('GET /api/concepts', () => {
  beforeEach(async () => {
    await deleteConceptTest();
    await createUserTest(Role.ADMIN);
    await createConceptTest(99999);
  });

  afterEach(async () => {
    await deleteConceptTest();
    await deleteUserTest();
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server).get('/api/concepts');

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should get all concepts with pagination', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .get('/api/concepts?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(10);
    expect(response.body.pagination.total).toBeGreaterThan(0);
  });

  it('Should get concepts filtered by search', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .get('/api/concepts?search=Concept Test')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });
});

// ------------------------------------------------------------
// GET BY ID
// ------------------------------------------------------------
describe('GET /api/concepts/:id', () => {
  let conceptId: number;

  beforeEach(async () => {
    await deleteConceptTest();
    await createUserTest(Role.ADMIN);

    const concept = await createConceptTest();
    conceptId = concept.id;
  });

  afterEach(async () => {
    await deleteConceptTest();
    await deleteUserTest();
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server).get(`/api/concepts/${conceptId}`);

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if concept not found', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .get('/api/concepts/999999')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('Should get concept by id successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .get(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(conceptId);
    expect(response.body.data.title).toBe('Concept Test 99999');
    expect(response.body.data.slug).toBe('concept-test-99999');
  });
});

// ------------------------------------------------------------
// CREATE
// ------------------------------------------------------------
describe('POST /api/concepts', () => {
  beforeEach(async () => {
    await deleteConceptTest();
    await createUserTest(Role.ADMIN);
  });

  afterEach(async () => {
    await deleteConceptTest();
    await deleteUserTest();
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server).post('/api/concepts').send({
      slug: 'concept-test-99999',
      title: 'Concept Test 99999',
      description: 'Description',
      order: 1,
    });

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if not admin', async () => {
    await createUserTest(Role.STUDENT, 'student.test@example.com');
    const studentToken = await getTokenTest('student.test@example.com');

    const response = await supertest(server)
      .post('/api/concepts')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        slug: 'concept-test-99999',
        title: 'Concept Test 99999',
        description: 'Description',
        order: 1,
      });

    logger.debug(response.body);
    expect(response.status).toBe(403);
    expect(response.body.errors).toBeDefined();

    await deleteUserTest('student.test@example.com');
  });

  it('Should reject if request is invalid', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .post('/api/concepts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        slug: '',
        title: '',
        description: '',
        order: 0,
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if slug already exists', async () => {
    await createConceptTest();
    const token = await getTokenTest();

    const response = await supertest(server)
      .post('/api/concepts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        slug: 'concept-test-1',
        title: 'Concept Test 1',
        description: 'Description',
        order: 1,
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if order already exists', async () => {
    await createConceptTest();
    const token = await getTokenTest();

    const response = await supertest(server)
      .post('/api/concepts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        slug: 'concept-test-99999',
        title: 'Concept Test 99999',
        description: 'Description',
        order: 1,
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('Should create concept successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .post('/api/concepts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        slug: 'concept-test-99999',
        title: 'Concept Test 99999',
        description: 'Description for concept test',
        order: 99999,
      });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(response.body.data.slug).toBe('concept-test-99999');
    expect(response.body.data.title).toBe('Concept Test 99999');
    expect(response.body.data.order).toBe(99999);
  });
});

// ------------------------------------------------------------
// UPDATE CONCEPT
// ------------------------------------------------------------
describe('PATCH /api/concepts/:id', () => {
  let conceptId: number;

  beforeEach(async () => {
    await deleteConceptTest();
    await createUserTest(Role.ADMIN);
    const concept = await createConceptTest();
    conceptId = concept.id;
  });

  afterEach(async () => {
    await deleteConceptTest();
    await deleteUserTest();
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server)
      .patch(`/api/concepts/${conceptId}`)
      .send({ title: 'Updated Title' });

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if not admin', async () => {
    await createUserTest(Role.STUDENT, 'student.test@example.com');
    const studentToken = await getTokenTest('student.test@example.com');

    const response = await supertest(server)
      .patch(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Updated Title' });

    logger.debug(response.body);
    expect(response.status).toBe(403);
    expect(response.body.errors).toBeDefined();

    await deleteUserTest('student.test@example.com');
  });

  it('Should reject if concept not found', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .patch('/api/concepts/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if slug already exists', async () => {
    await prisma.concept.create({
      data: {
        slug: 'concept-test-other',
        title: 'Concept Test Other',
        description: 'Description for concept test other',
        order: 99998,
      },
    });

    const token = await getTokenTest();

    const response = await supertest(server)
      .patch(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'concept-test-other' });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBe('Slug already exists');
  });

  it('Should reject if order already exists', async () => {
    await prisma.concept.create({
      data: {
        slug: 'concept-test-other',
        title: 'Concept Test Other',
        description: 'Description for concept test other',
        order: 99998,
      },
    });

    const token = await getTokenTest();

    const response = await supertest(server)
      .patch(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ order: 99998 });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBe('Order already exists');
  });

  it('Should update title successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .patch(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Updated Title' });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Updated Title');
    expect(response.body.data.slug).toBe('concept-test-99999');
    expect(response.body.data.order).toBe(99999);
  });

  it('Should update slug successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .patch(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'concept-test-updated' });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.slug).toBe('concept-test-updated');
    expect(response.body.data.order).toBe(99999);
  });

  it('Should update order successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .patch(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ order: 99998 });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.order).toBe(99998);
    expect(response.body.data.slug).toBe('concept-test-99999');
  });

  it('Should update same slug without conflict', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .patch(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'concept-test-99999' });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.slug).toBe('concept-test-99999');
  });

  it('Should update same order without conflict', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .patch(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ order: 99999 });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.order).toBe(99999);
  });
});

// ------------------------------------------------------------
// DELETE CONCEPT
// ------------------------------------------------------------
describe('DELETE /api/concepts/:id', () => {
  let conceptId: number;

  beforeEach(async () => {
    await createUserTest(Role.ADMIN);
    const concept = await createConceptTest();
    conceptId = concept.id;
  });

  afterEach(async () => {
    await deleteConceptTest();
    await deleteUserTest();
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server).delete(
      `/api/concepts/${conceptId}`,
    );

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if not admin', async () => {
    await createUserTest(Role.STUDENT, 'student.test@example.com');
    const studentToken = await getTokenTest('student.test@example.com');

    const response = await supertest(server)
      .delete(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    logger.debug(response.body);
    expect(response.status).toBe(403);
    expect(response.body.errors).toBeDefined();

    await deleteUserTest('student.test@example.com');
  });

  it('Should reject if concept not found', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .delete('/api/concepts/99999')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('Should delete concept successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .delete(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data).toBe('Concept deleted successfully');
  });

  it('Should not find deleted concept', async () => {
    const token = await getTokenTest();

    await supertest(server)
      .delete(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`);

    const response = await supertest(server)
      .get(`/api/concepts/${conceptId}`)
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
  });
});
