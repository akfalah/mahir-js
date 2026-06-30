import supertest from 'supertest';

import { Role } from '../generated/prisma/enums';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

import {
  authHeader,
  cleanupTestData,
  createTestPrefix,
  createUserFixture,
  uniqueEmail,
} from './helpers/test-data.helper';

const api = supertest(server);

const prefix = createTestPrefix('users');

describe('user endpoints', () => {
  let adminToken: string;
  let studentToken: string;
  let createdUserId: number;

  beforeAll(async () => {
    await cleanupTestData(prefix);
    adminToken = (await createUserFixture({ prefix, label: 'admin', role: Role.ADMIN })).token;
    studentToken = (await createUserFixture({ prefix, label: 'student', role: Role.STUDENT })).token;
  });

  afterAll(async () => {
    await cleanupTestData(prefix);
  });

  describe('authorization', () => {
    it('requires admin for every user management endpoint', async () => {
      const listAsGuest = await api.get('/api/users');
      const listAsStudent = await api.get('/api/users').set(authHeader(studentToken));
      const createAsStudent = await api
        .post('/api/users')
        .set(authHeader(studentToken))
        .send({ email: uniqueEmail(prefix, 'forbidden'), name: 'Forbidden User', password: 'password123' });

      expect(listAsGuest.status).toBe(401);
      expect(listAsStudent.status).toBe(403);
      expect(createAsStudent.status).toBe(403);
    });
  });

  describe('GET /api/users', () => {
    it('returns paginated users for admin and supports search, role filter, and sorting', async () => {
      await createUserFixture({ prefix, label: 'search-target', role: Role.STUDENT });

      const list = await api.get('/api/users').set(authHeader(adminToken));
      const filtered = await api
        .get('/api/users?role=STUDENT')
        .set(authHeader(adminToken));
      const searched = await api
        .get(`/api/users?search=${prefix}-search-target`)
        .set(authHeader(adminToken));
      const sorted = await api
        .get('/api/users?sortBy=email&orderBy=asc')
        .set(authHeader(adminToken));

      expect(list.status).toBe(200);
      expect(list.body.pagination).toBeDefined();
      expect(filtered.status).toBe(200);
      expect(filtered.body.data.every((user: any) => user.role === 'STUDENT')).toBe(true);
      expect(searched.status).toBe(200);
      expect(searched.body.data.some((user: any) => user.email === uniqueEmail(prefix, 'search-target'))).toBe(true);
      expect(sorted.status).toBe(200);
    });

    it.each([
      ['invalid page', '/api/users?page=abc'],
      ['invalid limit', '/api/users?limit=abc'],
      ['limit over max', '/api/users?limit=200'],
      ['invalid role', '/api/users?role=OWNER'],
    ])('rejects %s', async (_caseName, url) => {
      const res = await api.get(url).set(authHeader(adminToken));

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/users', () => {
    it('creates a user with hashed password and without exposing password', async () => {
      const res = await api
        .post('/api/users')
        .set(authHeader(adminToken))
        .send({
          email: uniqueEmail(prefix, 'crud'),
          name: 'Crud User',
          password: 'password123',
          role: 'STUDENT',
          bio: 'Created by admin',
        });

      const userInDb = await prisma.user.findUnique({ where: { email: uniqueEmail(prefix, 'crud') } });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(uniqueEmail(prefix, 'crud'));
      expect(res.body.data.password).toBeUndefined();
      expect(userInDb?.password).not.toBe('password123');
      createdUserId = res.body.data.id;
    });

    it.each([
      ['duplicate email', { email: uniqueEmail(prefix, 'crud'), name: 'Duplicate User', password: 'password123', role: 'STUDENT' }],
      ['invalid email', { email: 'invalid-email', name: 'Invalid User', password: 'password123', role: 'STUDENT' }],
      ['short name', { email: uniqueEmail(prefix, 'short-name'), name: 'ab', password: 'password123', role: 'STUDENT' }],
      ['short password', { email: uniqueEmail(prefix, 'short-password'), name: 'Short Password', password: '123', role: 'STUDENT' }],
      ['invalid role', { email: uniqueEmail(prefix, 'invalid-role'), name: 'Invalid Role', password: 'password123', role: 'OWNER' }],
    ])('rejects %s', async (_caseName, payload) => {
      const res = await api
        .post('/api/users')
        .set(authHeader(adminToken))
        .send(payload);

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/users/:id', () => {
    it('returns a user by id and hides password', async () => {
      const res = await api
        .get(`/api/users/${createdUserId}`)
        .set(authHeader(adminToken));

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdUserId);
      expect(res.body.data.password).toBeUndefined();
    });

    it('returns 404 for missing user', async () => {
      const res = await api
        .get('/api/users/99999999')
        .set(authHeader(adminToken));

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('updates profile fields, role, and password', async () => {
      const res = await api
        .patch(`/api/users/${createdUserId}`)
        .set(authHeader(adminToken))
        .send({
          name: 'Updated Crud User',
          role: 'ADMIN',
          password: 'updatedpassword123',
          imageUrl: 'https://example.com/profile.png',
        });

      const userInDb = await prisma.user.findUnique({ where: { id: createdUserId } });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Crud User');
      expect(res.body.data.role).toBe('ADMIN');
      expect(userInDb?.password).not.toBe('updatedpassword123');
    });

    it.each([
      ['duplicate email', { email: uniqueEmail(prefix, 'admin') }, 400],
      ['invalid role', { role: 'OWNER' }, 400],
      ['short password', { password: '123' }, 400],
      ['missing user', { name: 'Missing User' }, 404, 99999999],
    ])('rejects %s', async (_caseName, payload, expectedStatus, id = createdUserId) => {
      const res = await api
        .patch(`/api/users/${id}`)
        .set(authHeader(adminToken))
        .send(payload);

      expect(res.status).toBe(expectedStatus);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('deletes a user and returns 404 on second access', async () => {
      const deleteRes = await api
        .delete(`/api/users/${createdUserId}`)
        .set(authHeader(adminToken));
      const getRes = await api
        .get(`/api/users/${createdUserId}`)
        .set(authHeader(adminToken));
      const deleteAgain = await api
        .delete(`/api/users/${createdUserId}`)
        .set(authHeader(adminToken));

      expect(deleteRes.status).toBe(200);
      expect(getRes.status).toBe(404);
      expect(deleteAgain.status).toBe(404);
    });
  });
});
