import 'dotenv/config';
import supertest from 'supertest';

import { server } from '../src/applications/server';
import { logger } from '../src/applications/logger';

import { createUserTest, deleteUserTest, getTokenTest } from './test.util';

// ------------------------------------------------------------
// REGISTER
// ------------------------------------------------------------
describe('POST /api/auth/register', () => {
  afterAll(async () => {
    await deleteUserTest();
  });

  it('Should reject register if request is invalid', async () => {
    const response = await supertest(server).post('/api/auth/register').send({
      email: 'invalid-email',
      name: '',
      password: '123',
    });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('Should register successfully', async () => {
    const response = await supertest(server).post('/api/auth/register').send({
      email: 'test@example.com',
      name: `Test User STUDENT`,
      password: '12345678',
    });

    logger.debug(response.body);
    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.name).toBe('Test User STUDENT');
    expect(response.body.data.role).toBe('STUDENT');
    expect(response.body.data.password).toBeUndefined();
  });

  it('Should reject register if email already exists', async () => {
    // await createUserTest();

    const response = await supertest(server).post('/api/auth/register').send({
      email: 'test@example.com',
      name: `Test User STUDENT`,
      password: '12345678',
    });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });
});

// ------------------------------------------------------------
// LOGIN
// ------------------------------------------------------------
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await createUserTest();
  });

  afterEach(async () => {
    await deleteUserTest();
  });

  it('Should reject login if request is invalid', async () => {
    const response = await supertest(server).post('/api/auth/login').send({
      email: '',
      password: '',
    });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject login if email is wrong', async () => {
    const response = await supertest(server).post('/api/auth/login').send({
      email: 'wrong@example.com',
      password: 'password123',
    });

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject login if password is wrong', async () => {
    const response = await supertest(server).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'wrongpassword',
    });

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should login successfully', async () => {
    const response = await supertest(server).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123',
    });

    logger.info(response.body.data.token);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.token).toBeDefined();
    expect(typeof response.body.data.token).toBe('string');
  });
});

// ------------------------------------------------------------
// PROFILE
// ------------------------------------------------------------
describe('GET /api/auth/profile', () => {
  beforeEach(async () => {
    await createUserTest();
  });

  afterEach(async () => {
    await deleteUserTest();
  });

  it('Should reject profile if no token provided', async () => {
    const response = await supertest(server).get('/api/auth/profile');

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject profile if token is invalid', async () => {
    const response = await supertest(server)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalidtoken');

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should return profile successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.name).toBe('Test User STUDENT');
    expect(response.body.data.role).toBe('STUDENT');
    expect(response.body.data.password).toBeUndefined();
  });
});

// ------------------------------------------------------------
// UPDATE PROFILE
// ------------------------------------------------------------
describe('PATCH /api/auth/profile', () => {
  beforeEach(async () => {
    await createUserTest();
  });

  afterEach(async () => {
    await deleteUserTest();
  });

  it('Should reject if not authenticated', async () => {
    const response = await supertest(server)
      .patch('/api/auth/profile')
      .send({ name: 'Updated Name' });

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should reject if request is invalid', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'invalid-email' });

    logger.debug(response.body);
    expect(response.status).toBe(400);
    expect(response.body.errors).toBeDefined();
  });

  it('Should update profile successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .patch('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name' });

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data.name).toBe('Updated Name');
    expect(response.body.data.email).toBe('test@example.com');
    expect(response.body.data.password).toBeUndefined();
  });
});

// ------------------------------------------------------------
// LOGOUT
// ------------------------------------------------------------
describe('DELETE /api/auth/logout', () => {
  beforeEach(async () => {
    await createUserTest();
  });

  afterEach(async () => {
    await deleteUserTest();
  });

  it('Should reject logout if no token provided', async () => {
    const response = await supertest(server).delete('/api/auth/logout');

    logger.debug(response.body);
    expect(response.status).toBe(401);
    expect(response.body.errors).toBeDefined();
  });

  it('Should logout successfully', async () => {
    const token = await getTokenTest();

    const response = await supertest(server)
      .delete('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    logger.debug(response.body);
    expect(response.status).toBe(200);
    expect(response.body.data).toBe('Logged out successfully');
  });
});
