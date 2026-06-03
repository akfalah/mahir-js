import supertest from 'supertest';

import { server } from '../src/applications/server';
import { prisma } from '../src/applications/database';

const api = supertest(server);

describe('auth test', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['signup.test@example.com'] } },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: ['signup.test@example.com'] } },
    });
  });

  // ------------------------------------------------------------
  // SIGN UP
  // ------------------------------------------------------------
  describe('POST /api/auth/sign-up', () => {
    it('should sign up successfully', async () => {
      const res = await api.post('/api/auth/sign-up').send({
        email: 'signup.test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe('signup.test@example.com');
      expect(res.body.data.name).toBe('Test User');
      expect(res.body.data.role).toBe('STUDENT');
    });

    it('should fail if email already exists', async () => {
      const res = await api.post('/api/auth/sign-up').send({
        email: 'signup.test@example.com',
        name: 'Test User',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });

    it('should fail if email is invalid', async () => {
      const res = await api.post('/api/auth/sign-up').send({
        email: 'signup.test',
        name: 'Test User',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });

    it('should fail if password is too short', async () => {
      const res = await api.post('/api/auth/sign-up').send({
        email: 'signup.test@example.com',
        name: 'Test User',
        password: '123',
      });

      expect(res.status).toBe(400);
    });

    it('should fail if name is too short', async () => {
      const res = await api.post('/api/auth/sign-up').send({
        email: 'signup.test',
        name: 'abc',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------------------------
  // SIGN IN
  // ------------------------------------------------------------
  describe('POST /api/auth/sign-in', () => {
    it('should sign in successfully', async () => {
      const res = await api.post('/api/auth/sign-in').send({
        email: 'signup.test@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
    });

    it('should fail with wrong password', async () => {
      const res = await api.post('/api/auth/sign-in').send({
        email: 'signup.test@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
    });

    it('should fail with non-existent email', async () => {
      const res = await api.post('/api/auth/sign-in').send({
        email: 'notfound@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // PROFILE
  // ------------------------------------------------------------
  describe('GET /api/auth/profile', () => {
    let token: string;

    beforeAll(async () => {
      const res = await api.post('/api/auth/sign-in').send({
        email: 'signup.test@example.com',
        password: 'password123',
      });

      token = res.body.data.token;
    });

    it('should return current user', async () => {
      const res = await api
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('signup.test@example.com');
    });

    it('should fail without token', async () => {
      const res = await api.get('/api/auth/profile');

      expect(res.status).toBe(401);
    });

    it('should fail with invalid token', async () => {
      const res = await api
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalidtoken');

      expect(res.status).toBe(401);
    });
  });

  // ------------------------------------------------------------
  // UPDATE PROFILE
  // ------------------------------------------------------------
  describe('PATCH /api/auth/profile', () => {
    let token: string;

    beforeAll(async () => {
      const res = await api.post('/api/auth/sign-in').send({
        email: 'signup.test@example.com',
        password: 'password123',
      });

      token = res.body.data.token;
    });

    it('should update profile successfully', async () => {
      const res = await api
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Name', bio: 'Hello world' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Updated Name');
      expect(res.body.data.bio).toBe('Hello world');
    });

    it('should fail without token', async () => {
      const res = await api.patch('/api/auth/profile');

      expect(res.status).toBe(401);
    });

    it('should fail with invalid image format', async () => {
      const res = await api
        .patch('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({ image: 'not-a-base64-image' });

      expect(res.status).toBe(400);
    });
  });

  // ------------------------------------------------------------
  // UPDATE PASSWORD
  // ------------------------------------------------------------
  describe('PATCH /api/auth/profile/password', () => {
    let token: string;

    beforeAll(async () => {
      const res = await api.post('/api/auth/sign-in').send({
        email: 'signup.test@example.com',
        password: 'password123',
      });
      token = res.body.data.token;
    });

    it('should update password successfully', async () => {
      const res = await api
        .patch('/api/auth/profile/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123',
        });

      expect(res.status).toBe(200);
    });

    it('should fail without token', async () => {
      const res = await api.patch('/api/auth/profile/password');

      expect(res.status).toBe(401);
    });

    it('should fail with wrong current password', async () => {
      const res = await api
        .patch('/api/auth/profile/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        });

      expect(res.status).toBe(400);
    });

    it('should fail if new password is too short', async () => {
      const res = await api
        .patch('/api/auth/profile/password')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'newpassword123', newPassword: '123' });

      expect(res.status).toBe(400);
    });
  });
});
