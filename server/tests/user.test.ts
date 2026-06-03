import supertest from 'supertest';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

import { createAdminToken, createStudentToken } from './helpers/auth.helper';

const api = supertest(server);

describe('user test', () => {
  let adminToken: string;
  let studentToken: string;
  let createdUserId: number;

  beforeAll(async () => {
    adminToken = await createAdminToken();
    studentToken = await createStudentToken();

    await prisma.user.deleteMany({ where: { email: 'crud.test@example.com' } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'crud.test@example.com' } });
  });

  // ------------------------------------------------------------
  // GET /users
  // ------------------------------------------------------------
  describe('GET /api/users', () => {
    it('should return paginated users for admin', async () => {
      const res = await api
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.pagination).toBeDefined();
    });

    it('should filter by role', async () => {
      const res = await api
        .get('/api/users?role=STUDENT')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every((u: any) => u.role === 'STUDENT')).toBe(true);
    });

    it('should filter by search', async () => {
      const res = await api
        .get('/api/users?search=admin')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should fail with invalid page', async () => {
      const res = await api
        .get('/api/users?page=abc')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
    });

    it('should return 403 for student', async () => {
      const res = await api
        .get('/api/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it('should return 401 without token', async () => {
      const res = await api.get('/api/users');

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // POST /users
  // ------------------------------------------------------------
  describe('POST /api/users', () => {
    it('should create user successfully', async () => {
      const res = await api
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'crud.test@example.com',
          name: 'Crud Test',
          password: 'password123',
          role: 'STUDENT',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('crud.test@example.com');

      createdUserId = res.body.data.id;
    });

    it('should fail with duplicate email', async () => {
      const res = await api
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'crud.test@example.com',
          name: 'Crud Test',
          password: 'password123',
          role: 'STUDENT',
        });

      expect(res.status).toBe(400);
    });

    it('should fail with invalid role', async () => {
      const res = await api
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'new@example.com',
          name: 'New User',
          password: 'password123',
          role: 'INVALID',
        });

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------------------------
  // GET /users/:id
  // ------------------------------------------------------------
  describe('GET /api/users/:id', () => {
    it('should return user by id', async () => {
      const res = await api
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(createdUserId);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await api
        .get('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });

  // ------------------------------------------------------------
  // PATCH /users/:id
  // ------------------------------------------------------------
  describe('PATCH /api/users/:id', () => {
    it('should update user successfully', async () => {
      const res = await api
        .patch(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Updated Crud' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Crud');
    });

    it('should fail with duplicate email', async () => {
      const res = await api
        .patch(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'admin.test@example.com' });

      expect(res.status).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await api
        .patch('/api/users/999999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  // ------------------------------------------------------------
  // DELETE /users/:id
  // ------------------------------------------------------------
  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully', async () => {
      const res = await api
        .delete(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
    });

    it('should return 404 after deletion', async () => {
      const res = await api
        .get(`/api/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
