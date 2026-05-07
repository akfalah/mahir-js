import 'dotenv/config';
import supertest from 'supertest';

import { Role } from '../generated/prisma/enums';

import { server } from '../src/applications/server';
import { logger } from '../src/applications/logger';

import { createUserTest, deleteUserTest, getTokenTest } from './test.util';

// ------------------------------------------------------------
// GET ALL
// ------------------------------------------------------------
describe('GET /api/users', () => {
  beforeEach(async () => {
    await createUserTest(Role.ADMIN);
  });

  afterEach(async () => {
    await deleteUserTest();
    await deleteUserTest('student.test@example.com');
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server).get('/api/users');

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should get all users with pagination', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .get('/api/users?page=1&limit=10')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.pagination).toBeDefined();
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.limit).toBe(10);
    expect(response.body.pagination.total).toBeDefined();
    expect(response.body.pagination.totalPages).toBeDefined();
  });

  it('Should get users filtered by search', async () => {
    await createUserTest(Role.STUDENT, 'student.test@example.com');

    const token = await getTokenTest();

    const response = await supertest(server)
      .get('/api/users?search=student')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(
      response.body.data.every((u: { email: string }) =>
        u.email.includes('student'),
      ),
    ).toBe(true);
  });
});

// ------------------------------------------------------------
// GET BY ID
// ------------------------------------------------------------
describe('GET /api/users/:id', () => {
  let studentId: number;

  beforeEach(async () => {
    await createUserTest(Role.ADMIN);

    const student = await createUserTest(
      Role.STUDENT,
      'student.test@example.com',
    );
    studentId = student.id;
  });

  afterEach(async () => {
    await deleteUserTest();
    await deleteUserTest('student.test@example.com');
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server).get(`/api/users/${studentId}`);

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if user not found', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .get('/api/users/99999')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('Should get user by id successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .get(`/api/users/${studentId}`)
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.id).toBe(studentId);
    expect(response.body.data.email).toBe('student.test@example.com');
    expect(response.body.data.password).toBeUndefined();
  });
});

// ------------------------------------------------------------
// CREATE
// ------------------------------------------------------------
describe('POST /api/users', () => {
  let token: string;

  beforeEach(async () => {
    await createUserTest(Role.ADMIN);
  });

  afterEach(async () => {
    await deleteUserTest();
    await deleteUserTest('student.test@example.com');
  });

  it('Should reject create new user if request is invalid', async () => {
    token = await getTokenTest();

    const response = await supertest(server)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: '',
        name: '',
        role: '',
        password: '',
      });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('Should create new user', async () => {
    token = await getTokenTest();

    const response = await supertest(server)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'student.test@example.com',
        name: 'Student Test',
        role: 'STUDENT',
        password: '12345678',
      });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('student.test@example.com');
    expect(response.body.data.name).toBe('Student Test');
  });
});

// ------------------------------------------------------------
// UPDATE
// ------------------------------------------------------------
describe('PATCH /api/users/:id', () => {
  let token: string;
  let studentId: number;

  beforeEach(async () => {
    await createUserTest(Role.ADMIN);

    token = await getTokenTest();

    const student = await createUserTest(
      Role.STUDENT,
      'student.test@example.com',
    );
    studentId = student.id;
  });

  afterEach(async () => {
    await deleteUserTest();
    await deleteUserTest('student.test@example.com');
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server)
      .patch(`/api/users/${studentId}`)
      .send({ name: 'Updated Name' });

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if not admin', async () => {
    const student = await createUserTest(
      Role.STUDENT,
      'another.student@example.com',
    );

    const studentToken = await getTokenTest('another.student@example.com');

    const response = await supertest(server)
      .patch(`/api/users/${studentId}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ name: 'Updated Name' });

    logger.debug(response.body);
    expect(response.status).toBe(403);
    expect(response.body.errors).toBeDefined();

    await deleteUserTest('another.student@example.com');
  });

  it('Should reject if request is invalid', async () => {
    const response = await supertest(server)
      .patch(`/api/users/${studentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invalid-email' });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if user not found', async () => {
    const response = await supertest(server)
      .patch('/api/users/0')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('Should update user successfully', async () => {
    const response = await supertest(server)
      .patch(`/api/users/${studentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated Name');
    expect(response.body.data.email).toBe('student.test@example.com');
    expect(response.body.data.password).toBeUndefined();
  });

  it('Should update role successfully', async () => {
    const response = await supertest(server)
      .patch(`/api/users/${studentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: Role.ADMIN });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.role).toBe(Role.ADMIN);
  });
});

// ------------------------------------------------------------
// DELETE
// ------------------------------------------------------------
describe('DELETE /api/users/:id', () => {
  let studentId: number;

  beforeEach(async () => {
    await createUserTest(Role.ADMIN);

    const student = await createUserTest(
      Role.STUDENT,
      'student.test@example.com',
    );
    studentId = student.id;
  });

  afterEach(async () => {
    await deleteUserTest();
    await deleteUserTest('student.test@example.com');
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server).delete(`/api/users/${studentId}`);

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if not admin', async () => {
    await createUserTest(Role.STUDENT, 'another.test@example.com');
    const studentToken = await getTokenTest('another.test@example.com');

    const response = await supertest(server)
      .delete(`/api/users/${studentId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    logger.debug(response.body);
    expect(response.status).toBe(403);
    expect(response.body.errors).toBeDefined();

    await deleteUserTest('another.test@example.com');
  });

  it('Should reject if user not found', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .delete('/api/users/99999')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
    expect(response.body.errors).toBeDefined();
  });

  it('Should delete user successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .delete(`/api/users/${studentId}`)
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data).toBe('User deleted successfully');
  });

  it('Should not find deleted user', async () => {
    const token = await getTokenTest();

    // delete dulu
    await supertest(server)
      .delete(`/api/users/${studentId}`)
      .set('Authorization', `Bearer ${token}`);

    // coba get lagi — harus 404
    const response = await supertest(server)
      .get(`/api/users/${studentId}`)
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(404);
  });
});
