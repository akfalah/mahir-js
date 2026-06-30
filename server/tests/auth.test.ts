import supertest from 'supertest';

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

const prefix = createTestPrefix('auth');

describe('auth endpoints', () => {
  beforeAll(async () => {
    await cleanupTestData(prefix);
  });

  afterAll(async () => {
    await cleanupTestData(prefix);
  });

  describe('POST /api/auth/sign-up', () => {
    it('creates a student account and does not expose password', async () => {
      const res = await api.post('/api/auth/sign-up').send({
        email: uniqueEmail(prefix, 'signup'),
        name: 'Signup User',
        password: 'password123',
      });

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        email: uniqueEmail(prefix, 'signup'),
        name: 'Signup User',
        role: 'STUDENT',
      });
      expect(res.body.data.password).toBeUndefined();
    });

    it('rejects duplicate email', async () => {
      const res = await api.post('/api/auth/sign-up').send({
        email: uniqueEmail(prefix, 'signup'),
        name: 'Signup User',
        password: 'password123',
      });

      expect(res.status).toBe(400);
    });

    it.each([
      ['invalid email', { email: 'not-email', name: 'Valid Name', password: 'password123' }],
      ['short name', { email: uniqueEmail(prefix, 'short-name'), name: 'ab', password: 'password123' }],
      ['short password', { email: uniqueEmail(prefix, 'short-password'), name: 'Valid Name', password: '123' }],
    ])('rejects %s', async (_caseName, payload) => {
      const res = await api.post('/api/auth/sign-up').send(payload);

      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/sign-in', () => {
    it('signs in with valid credentials', async () => {
      const res = await api.post('/api/auth/sign-in').send({
        email: uniqueEmail(prefix, 'signup'),
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(uniqueEmail(prefix, 'signup'));
    });

    it('rejects wrong password and unknown email', async () => {
      const wrongPassword = await api.post('/api/auth/sign-in').send({
        email: uniqueEmail(prefix, 'signup'),
        password: 'wrongpassword',
      });

      const unknownEmail = await api.post('/api/auth/sign-in').send({
        email: uniqueEmail(prefix, 'unknown'),
        password: 'password123',
      });

      expect(wrongPassword.status).toBe(401);
      expect(unknownEmail.status).toBe(401);
    });
  });

  describe('profile endpoints', () => {
    it('requires authentication', async () => {
      const profile = await api.get('/api/auth/profile');
      const update = await api.patch('/api/auth/profile').send({ name: 'New Name' });
      const password = await api.patch('/api/auth/profile/password').send({
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      });

      expect(profile.status).toBe(401);
      expect(update.status).toBe(401);
      expect(password.status).toBe(401);
    });

    it('rejects invalid token', async () => {
      const res = await api
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('returns and updates the current profile', async () => {
      const { token } = await createUserFixture({ prefix, label: 'profile' });

      const profile = await api
        .get('/api/auth/profile')
        .set(authHeader(token));

      const update = await api
        .patch('/api/auth/profile')
        .set(authHeader(token))
        .send({
          name: 'Updated Profile',
          bio: 'Learning JavaScript with Mahir.js',
          imageUrl: 'https://example.com/avatar.png',
        });

      expect(profile.status).toBe(200);
      expect(update.status).toBe(200);
      expect(update.body.data.name).toBe('Updated Profile');
      expect(update.body.data.bio).toBe('Learning JavaScript with Mahir.js');
      expect(update.body.data.password).toBeUndefined();
    });

    it('rejects duplicate profile email and invalid profile payload', async () => {
      const { token } = await createUserFixture({ prefix, label: 'profile-duplicate' });
      await createUserFixture({ prefix, label: 'profile-existing' });

      const duplicate = await api
        .patch('/api/auth/profile')
        .set(authHeader(token))
        .send({ email: uniqueEmail(prefix, 'profile-existing') });

      const invalid = await api
        .patch('/api/auth/profile')
        .set(authHeader(token))
        .send({ name: 'ab' });

      expect(duplicate.status).toBe(400);
      expect(invalid.status).toBe(400);
    });

    it('updates password and allows sign in with the new password', async () => {
      const { token, user } = await createUserFixture({ prefix, label: 'password' });

      const wrongCurrent = await api
        .patch('/api/auth/profile/password')
        .set(authHeader(token))
        .send({ currentPassword: 'wrongpassword', newPassword: 'newpassword123' });

      const shortNew = await api
        .patch('/api/auth/profile/password')
        .set(authHeader(token))
        .send({ currentPassword: 'password123', newPassword: '123' });

      const success = await api
        .patch('/api/auth/profile/password')
        .set(authHeader(token))
        .send({ currentPassword: 'password123', newPassword: 'newpassword123' });

      const signIn = await api.post('/api/auth/sign-in').send({
        email: user.email,
        password: 'newpassword123',
      });

      expect(wrongCurrent.status).toBe(400);
      expect(shortNew.status).toBe(400);
      expect(success.status).toBe(200);
      expect(signIn.status).toBe(200);
    });

    it('returns 404 when token references a deleted user', async () => {
      const { token, user } = await createUserFixture({ prefix, label: 'deleted-profile' });
      await prisma.user.delete({ where: { id: user.id } });

      const res = await api
        .get('/api/auth/profile')
        .set(authHeader(token));

      expect(res.status).toBe(404);
    });
  });
});
